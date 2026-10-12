"""Schedule engine for one thermostat."""

from __future__ import annotations

from collections.abc import Callable
import logging
import math
from typing import Any

from homeassistant.components.climate import (
    ATTR_MAX_TEMP,
    ATTR_MIN_TEMP,
    ATTR_TARGET_TEMP_STEP,
    DOMAIN as CLIMATE_DOMAIN,
    SERVICE_SET_TEMPERATURE,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_ENTITY_ID,
    ATTR_TEMPERATURE,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import (
    CALLBACK_TYPE,
    Context,
    Event,
    EventStateChangedData,
    HomeAssistant,
    State,
    callback,
)
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util

from .const import CONF_CLIMATE_ENTITY, DEFAULT_STEP, DOMAIN
from .schedule import Slot, current_slot, normalize_schedule
from .store import ScheduleStore

_LOGGER = logging.getLogger(__name__)


class ScheduleController:
    """Keeps the target temperature of a thermostat in line with its schedule.

    Only the target temperature is set; the HVAC mode is left to the user.
    A manual change holds until the next point that changes the temperature.
    """

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, store: ScheduleStore) -> None:
        self.hass = hass
        self.entry = entry
        self.climate_entity: str = entry.data[CONF_CLIMATE_ENTITY]
        self._store = store
        self._listeners: set[Callable[[], None]] = set()
        self._unsub_timer: CALLBACK_TYPE | None = None
        self._pending_apply = False
        self.slot: Slot | None = None

    # -- data ---------------------------------------------------------------

    @property
    def _item(self) -> dict[str, Any]:
        item = self._store.get(self.entry.entry_id)
        assert item is not None
        return item

    @property
    def enabled(self) -> bool:
        return bool(self._item["enabled"])

    @property
    def days(self) -> dict[str, list[dict[str, Any]]]:
        return self._item["days"]

    def limits(self) -> dict[str, float | None]:
        """Temperature limits and step reported by the thermostat."""
        attrs = state.attributes if (state := self.hass.states.get(self.climate_entity)) else {}
        return {
            "min": attrs.get(ATTR_MIN_TEMP),
            "max": attrs.get(ATTR_MAX_TEMP),
            "step": attrs.get(ATTR_TARGET_TEMP_STEP) or DEFAULT_STEP,
        }

    def as_dict(self) -> dict[str, Any]:
        """Payload for the frontend."""
        slot = self.slot
        registry = er.async_get(self.hass)
        return {
            "entry_id": self.entry.entry_id,
            "climate_entity": self.climate_entity,
            "enabled": self.enabled,
            "days": self.days,
            "current": {
                "temp": slot.temp if slot else None,
                "next_change": slot.next_change.isoformat() if slot and slot.next_change else None,
                "next_temp": slot.next_temp if slot else None,
            },
            "limits": self.limits(),
            "switch_entity": registry.async_get_entity_id(
                "switch", DOMAIN, f"{self.entry.entry_id}_enabled"
            ),
            "sensor_entity": registry.async_get_entity_id(
                "sensor", DOMAIN, f"{self.entry.entry_id}_scheduled_temperature"
            ),
        }

    async def async_update(
        self,
        *,
        days: dict[str, Any] | None = None,
        enabled: bool | None = None,
    ) -> None:
        """Change the schedule and/or the enabled flag."""
        item = dict(self._item)
        if days is not None:
            item["days"] = normalize_schedule(days)
        if enabled is not None:
            item["enabled"] = enabled
        old_temp = self.slot.temp if self.slot else None
        was_enabled = self.enabled
        self._store.set(self.entry.entry_id, item)
        self._reschedule()
        # Apply right away only when it means something: switching on, or the
        # slot in force got a new temperature. Otherwise a manual override stays.
        if self.enabled and (not was_enabled or self.slot.temp != old_temp):
            await self.async_apply()

    # -- listeners ----------------------------------------------------------

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        self._listeners.add(listener)

        @callback
        def _remove() -> None:
            self._listeners.discard(listener)

        return _remove

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    # -- engine -------------------------------------------------------------

    async def async_start(self) -> None:
        self._reschedule()
        self.entry.async_on_unload(
            async_track_state_change_event(
                self.hass, [self.climate_entity], self._async_climate_changed
            )
        )
        self.entry.async_on_unload(async_at_started(self.hass, self._async_started))

    @callback
    def async_stop(self) -> None:
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        self._listeners.clear()

    async def _async_started(self, _hass: HomeAssistant) -> None:
        if self.enabled:
            await self.async_apply()

    @callback
    def _reschedule(self) -> None:
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        now = dt_util.now()
        self.slot = current_slot(self.days, now)
        if self.enabled and self.slot.next_change:
            self._unsub_timer = async_track_point_in_time(
                self.hass, self._async_point_reached, self.slot.next_change
            )
        self._notify()

    async def _async_point_reached(self, _now: Any) -> None:
        self._unsub_timer = None
        self._reschedule()
        await self.async_apply()

    async def _async_climate_changed(self, event: Event[EventStateChangedData]) -> None:
        new_state = event.data["new_state"]
        if self._pending_apply and _available(new_state):
            _LOGGER.debug("%s is back, applying schedule", self.climate_entity)
            await self.async_apply()

    async def async_apply(self) -> None:
        """Set the scheduled temperature on the thermostat."""
        if not self.enabled or self.slot is None:
            return
        state = self.hass.states.get(self.climate_entity)
        if not _available(state):
            _LOGGER.info("%s unavailable, will apply schedule when it is back", self.climate_entity)
            self._pending_apply = True
            return
        target = self._fit(self.slot.temp, state)
        self._pending_apply = False
        if state.attributes.get(ATTR_TEMPERATURE) == target:
            return
        try:
            await self.hass.services.async_call(
                CLIMATE_DOMAIN,
                SERVICE_SET_TEMPERATURE,
                {ATTR_ENTITY_ID: self.climate_entity, ATTR_TEMPERATURE: target},
                blocking=True,
                context=Context(),
            )
        except HomeAssistantError as err:
            _LOGGER.warning("Setting %s to %s failed: %s", self.climate_entity, target, err)
            self._pending_apply = True

    @staticmethod
    def _fit(temp: float, state: State) -> float:
        """Round to the thermostat step and clamp to its limits."""
        attrs = state.attributes
        step = attrs.get(ATTR_TARGET_TEMP_STEP) or DEFAULT_STEP
        value = round(round(temp / step) * step, 2)
        if (low := attrs.get(ATTR_MIN_TEMP)) is not None:
            value = max(value, math.ceil(low / step) * step)
        if (high := attrs.get(ATTR_MAX_TEMP)) is not None:
            value = min(value, math.floor(high / step) * step)
        return round(value, 2)


def _available(state: State | None) -> bool:
    return state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)


@callback
def async_find_controller(hass: HomeAssistant, climate_entity: str) -> ScheduleController | None:
    """Controller of a loaded entry for ``climate_entity``."""
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        if entry.runtime_data.climate_entity == climate_entity:
            return entry.runtime_data
    return None
