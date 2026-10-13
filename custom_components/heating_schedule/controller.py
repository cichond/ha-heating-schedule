"""Schedule engine for one thermostat."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import datetime, timedelta
from functools import partial
import hashlib
import json
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
    STATE_OFF,
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
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_point_in_time,
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util

from .const import (
    CONF_CLIMATE_ENTITY,
    CONF_PRESENCE_ENTITIES,
    DEFAULT_STEP,
    DOMAIN,
    PROFILE_BACKFILL_DAYS,
    signal_updated,
)
from .presence import RoomPresence, entity_present
from .profile import DAY_NAMES, SLOT, SLOTS_PER_DAY, Profile, floor_slot, occupancy_slots
from .schedule import DAYS, Slot, current_slot, normalize_schedule, temperature_at
from .stats import HEATUP_LOOKBACK, Sample, ThermostatStats, deviation_slots, heatup_runs
from .store import ScheduleStore
from .suggest import (
    AI_VISIBLE,
    DISMISS_DAYS,
    Limits,
    Suggestion,
    analyze,
    apply,
    suggestions_from_week,
    visible,
)

_LOGGER = logging.getLogger(__name__)

PROFILE_FIRST_UPDATE = 60  # seconds after start
ANALYSIS_INTERVAL = timedelta(days=7)
QUIET_AFTER_CHANGE = timedelta(days=14)
ATTR_CURRENT_TEMPERATURE = "current_temperature"


class ScheduleController:
    """Keeps the target temperature of a thermostat in line with its schedule.

    Only the target temperature is set; the HVAC mode is left to the user.
    A manual change holds until the next schedule point changes the target.

    Optional presence entities (entry options): any of them present = room
    occupied. They only feed the occupancy sensor and profile (shown on the
    card); presence does not change the temperature.
    """

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, store: ScheduleStore) -> None:
        self.hass = hass
        self.entry = entry
        self.climate_entity: str = entry.data[CONF_CLIMATE_ENTITY]
        self._store = store
        self._listeners: set[Callable[[], None]] = set()
        self._unsub_timer: CALLBACK_TYPE | None = None
        self._pending_apply = False
        self._profile_lock = asyncio.Lock()
        self.slot: Slot | None = None
        self._effective_temp: float | None = None

        options = entry.options
        self.presence_entities: list[str] = list(options.get(CONF_PRESENCE_ENTITIES, []))

        self.room = (
            RoomPresence(hass, self.presence_entities, self._notify)
            if self.presence_entities
            else None
        )
        self.profile = self._load_profile() if self.presence_entities else None
        if not self.presence_entities:
            self._store.remove_profile(self.entry.entry_id)  # presence removed: drop its data
        # Manual deviations and heat-up runs, for schedule suggestions (always collected).
        self.stats = ThermostatStats(self._store.get_stats(self.entry.entry_id))

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

    def effective(self) -> float | None:
        """Target the thermostat should have now."""
        return self.slot.temp if self.slot else None

    def as_dict(self) -> dict[str, Any]:
        """Payload for the frontend."""
        slot = self.slot
        registry = er.async_get(self.hass)
        return {
            "entry_id": self.entry.entry_id,
            "title": self.entry.title,
            "climate_entity": self.climate_entity,
            "enabled": self.enabled,
            "days": self.days,
            "current": {
                "temp": slot.temp if slot else None,
                "next_change": slot.next_change.isoformat() if slot and slot.next_change else None,
                "next_temp": slot.next_temp if slot else None,
            },
            "presence": {
                "entities": self.presence_entities,
                "occupied": self.room.present if self.room else None,
            },
            "profile": (
                {
                    "days": dict(zip(DAY_NAMES, self.profile.avg, strict=True)),
                    "weeks": self.profile.weeks(),
                }
                if self.profile
                else None
            ),
            "stats": {
                "manual_weeks": self.stats.manual.weeks(),
                "heatup_runs": len(self.stats.heatup.runs),
                "heatup_minutes_per_degree": self.stats.heatup.minutes_per_degree(),
            },
            "suggestions": [
                {
                    "id": s.id,
                    "kind": s.kind,
                    "days": s.days,
                    "start": s.start,
                    "end": s.end,
                    "temp": s.temp,
                    "params": s.params,
                    "source": s.source,
                }
                for s in self.visible_suggestions()
            ],
            "ai_available": self.ai_available,
            "ai_full": self._ai_full(),
            "limits": self.limits(),
            "switch_entity": registry.async_get_entity_id(
                "switch", DOMAIN, f"{self.entry.entry_id}_enabled"
            ),
            "sensor_entity": registry.async_get_entity_id(
                "sensor", DOMAIN, f"{self.entry.entry_id}_scheduled_temperature"
            ),
            "occupancy_entity": (
                registry.async_get_entity_id(
                    "binary_sensor", DOMAIN, f"{self.entry.entry_id}_occupancy"
                )
                if self.room
                else None
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
            self._forget_changed_slots(self.days, item["days"])
            # Give the new schedule time before suggesting anything again.
            self.stats.suggestions["quiet_until"] = (dt_util.now() + QUIET_AFTER_CHANGE).isoformat()
            self._save_stats()
        if enabled is not None:
            item["enabled"] = enabled
        old_temp = self.effective()
        was_enabled = self.enabled
        self._store.set(self.entry.entry_id, item)
        self._reschedule()
        # Apply right away only when it means something: switching on, or the
        # target in force changed. Otherwise a manual override stays.
        if self.enabled and (not was_enabled or self.effective() != old_temp):
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
        # Carries the controller: during an entry reload it is not findable yet.
        async_dispatcher_send(self.hass, signal_updated(self.climate_entity), self)

    # -- engine -------------------------------------------------------------

    async def async_start(self) -> None:
        if self.room:
            self.entry.async_on_unload(self.room.async_start())
        self._reschedule()
        self._effective_temp = self.effective()
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
        self.entry.async_on_unload(
            async_call_later(self.hass, PROFILE_FIRST_UPDATE, self._async_history_tick)
        )
        self.entry.async_on_unload(
            async_track_time_change(self.hass, self._async_history_tick, minute=2, second=0)
        )

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
        """Set the effective target temperature on the thermostat."""
        temp = self.effective()
        self._effective_temp = temp
        if not self.enabled or temp is None:
            return
        state = self.hass.states.get(self.climate_entity)
        if not _available(state):
            _LOGGER.info("%s unavailable, will apply schedule when it is back", self.climate_entity)
            self._pending_apply = True
            return
        target = self._fit(temp, state)
        self._pending_apply = False
        if state.attributes.get(ATTR_TEMPERATURE) == target:
            return
        _LOGGER.debug("%s -> %s", self.climate_entity, target)
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
        return fit_temperature(
            temp,
            attrs.get(ATTR_TARGET_TEMP_STEP) or DEFAULT_STEP,
            attrs.get(ATTR_MIN_TEMP),
            attrs.get(ATTR_MAX_TEMP),
        )

    # -- occupancy profile --------------------------------------------------

    def _load_profile(self) -> Profile:
        """Stored profile, or a fresh one if the presence entities changed."""
        data = self._store.get_profile(self.entry.entry_id)
        if data and sorted(data.get("entities", [])) == sorted(self.presence_entities):
            return Profile(data)
        return Profile()

    async def _async_history_tick(self, _now: Any = None) -> None:
        """Hourly: fold new recorder history into the profile and the statistics."""
        try:
            await self.async_update_profile()
        except Exception:  # never let a recorder hiccup break the schedule
            _LOGGER.exception("Updating the occupancy profile of %s failed", self.climate_entity)
        try:
            await self.async_update_stats()
        except Exception:
            _LOGGER.exception("Updating the statistics of %s failed", self.climate_entity)
        try:
            self.async_analyze()
        except Exception:
            _LOGGER.exception("Analyzing the schedule of %s failed", self.climate_entity)

    async def async_update_profile(self) -> None:
        """Fold presence history since the last sample into the profile (from the recorder)."""
        if self.profile is None or "recorder" not in self.hass.config.components:
            return
        async with self._profile_lock:
            end = floor_slot(dt_util.utcnow())
            start = self.profile.last_sample or end - timedelta(days=PROFILE_BACKFILL_DAYS)
            start = dt_util.as_utc(start)
            if end - start < timedelta(minutes=15):
                return
            series = await self._async_presence_history(start, end)
            slots = occupancy_slots(series, start, end)
            for slot_start, fraction in slots:
                self.profile.add(dt_util.as_local(slot_start), fraction)
            if not slots:
                self.profile.last_sample = end
            self._store.set_profile(
                self.entry.entry_id,
                {**self.profile.as_dict(), "entities": self.presence_entities},
            )
        _LOGGER.debug("Profile of %s: %d new slots", self.climate_entity, len(slots))
        self._notify()

    # -- statistics (manual deviations, heat-up) -------------------------------

    async def async_update_stats(self) -> None:
        """Fold thermostat history since the last sample into the statistics.

        Deviations from the schedule only count while the schedule is enabled:
        otherwise every target would look like a manual change.
        """
        if "recorder" not in self.hass.config.components:
            return
        async with self._profile_lock:
            end = floor_slot(dt_util.utcnow())
            start = self.stats.last_sample or end - timedelta(days=PROFILE_BACKFILL_DAYS)
            start = dt_util.as_utc(start)
            if end - start < SLOT:
                return
            samples = await self._async_climate_history(start - HEATUP_LOOKBACK, end)
            deviations = 0
            if self.enabled:
                limits, days = self.limits(), self.days

                def planned(slot: datetime) -> float:
                    return fit_temperature(
                        temperature_at(days, dt_util.as_local(slot)),
                        limits["step"] or DEFAULT_STEP,
                        limits["min"],
                        limits["max"],
                    )

                for slot, deviation in deviation_slots(samples, start, end, planned):
                    self.stats.manual.add(dt_util.as_local(slot), deviation)
                    deviations += 1
            self.stats.heatup.add(heatup_runs(samples))
            self.stats.last_sample = end
            self._store.set_stats(self.entry.entry_id, self.stats.as_dict())
        _LOGGER.debug(
            "Statistics of %s: %d deviation slots, %d heat-up runs",
            self.climate_entity,
            deviations,
            len(self.stats.heatup.runs),
        )

    async def _async_climate_history(self, start: datetime, end: datetime) -> list[Sample]:
        from homeassistant.components.recorder import get_instance, history

        states: dict[str, list[State]] = await get_instance(self.hass).async_add_executor_job(
            partial(
                history.get_significant_states,
                self.hass,
                start,
                end,
                [self.climate_entity],
                significant_changes_only=False,
                no_attributes=False,
            )
        )
        return [
            Sample(
                state.last_updated,
                state.state not in (STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN),
                _number(state.attributes.get(ATTR_TEMPERATURE)),
                _number(state.attributes.get(ATTR_CURRENT_TEMPERATURE)),
            )
            for state in states.get(self.climate_entity, [])
        ]

    # -- suggestions ----------------------------------------------------------

    def _queue(self, name: str = "queue") -> list[Suggestion]:
        return [Suggestion.from_dict(s) for s in self.stats.suggestions.get(name, [])]

    def visible_suggestions(self) -> list[Suggestion]:
        """Suggestions from the data (at most 2), then the AI's (at most 3)."""
        return visible(self._queue(), self.days) + visible(
            self._queue("ai_queue"), self.days, AI_VISIBLE
        )

    def _limits_for_suggestions(self) -> Limits:
        limits = self.limits()
        return Limits(limits["step"] or DEFAULT_STEP, limits["min"], limits["max"])

    # -- AI -----------------------------------------------------------------

    @property
    def ai_available(self) -> bool:
        from .ai import ai_entity

        return ai_entity(self.hass) is not None

    def _ai_full(self) -> dict[str, Any] | None:
        """A whole proposed week, while the schedule is still the one it was proposed for."""
        full = self.stats.suggestions.get("ai_full")
        if not full or full.get("base") != self.days:
            return None
        return {"id": full["id"], "week": full["week"]}

    async def async_ask_ai(self, *, full: bool = False) -> int:
        """Ask the AI for suggestions (or a whole week); returns how many there are."""
        from .ai import async_propose_week

        week = await async_propose_week(self, full=full)
        state = self.stats.suggestions
        if full:
            digest = hashlib.sha1(json.dumps(week, sort_keys=True).encode()).hexdigest()[:12]
            state["ai_full"] = {"id": f"full-{digest}", "week": week, "base": self.days}
            count = 1
        else:
            queue = suggestions_from_week(
                self.days,
                week,
                self._limits_for_suggestions(),
                dismissed=state.get("dismissed", {}),
                now=dt_util.now(),
            )
            state["ai_queue"] = [s.as_dict() for s in queue]
            count = len(queue)
        self._save_stats()
        self._notify()
        return count

    @callback
    def async_analyze(self, force: bool = False) -> bool:
        """Compute new suggestions: weekly, and not within the quiet period after a change."""
        state = self.stats.suggestions
        now = dt_util.now()
        if not force:
            last = state.get("last_analysis")
            if last and now - datetime.fromisoformat(last) < ANALYSIS_INTERVAL:
                return False
            if (quiet := state.get("quiet_until")) and now < datetime.fromisoformat(quiet):
                return False
        cutoff = now - timedelta(days=DISMISS_DAYS)
        dismissed = {
            key: when
            for key, when in state.get("dismissed", {}).items()
            if datetime.fromisoformat(when) > cutoff
        }
        manual = self.stats.manual
        queue = analyze(
            self.days,
            self._limits_for_suggestions(),
            occupancy=self.profile.avg if self.profile else None,
            occupancy_weeks=self.profile.weeks() if self.profile else 0,
            manual_avg=manual.avg,
            manual_share=manual.share,
            manual_weeks=manual.weeks(),
            minutes_per_degree=self.stats.heatup.minutes_per_degree(),
            dismissed=dismissed,
            now=now,
        )
        state.update(
            queue=[s.as_dict() for s in queue], dismissed=dismissed, last_analysis=now.isoformat()
        )
        self._save_stats()
        _LOGGER.debug("Suggestions for %s: %d", self.climate_entity, len(queue))
        self._notify()
        return True

    async def async_apply_suggestion(self, suggestion_id: str) -> bool:
        """Apply a visible suggestion to the schedule; False if it no longer applies."""
        if (full := self._ai_full()) and full["id"] == suggestion_id:
            self.stats.suggestions.pop("ai_full", None)
            await self.async_update(days=full["week"])
            return True
        suggestion = next((s for s in self.visible_suggestions() if s.id == suggestion_id), None)
        if suggestion is None:
            return False
        self._drop_from_queue(suggestion_id)
        await self.async_update(days=apply(suggestion, self.days))
        return True

    @callback
    def async_dismiss_suggestion(self, suggestion_id: str) -> bool:
        """Hide a suggestion; the same change is not suggested again for a while."""
        full = self.stats.suggestions.get("ai_full")
        if full and full["id"] == suggestion_id:
            self.stats.suggestions.pop("ai_full")
            self._save_stats()
            self._notify()
            return True
        queue = self._queue() + self._queue("ai_queue")
        suggestion = next((s for s in queue if s.id == suggestion_id), None)
        if suggestion is None:
            return False
        now = dt_util.now().isoformat()
        dismissed = self.stats.suggestions.setdefault("dismissed", {})
        dismissed.update(dict.fromkeys(suggestion.keys, now))
        self._drop_from_queue(suggestion_id)
        self._save_stats()
        self._notify()
        return True

    def _drop_from_queue(self, suggestion_id: str) -> None:
        state = self.stats.suggestions
        for name in ("queue", "ai_queue"):
            state[name] = [
                s for s in state.get(name, []) if Suggestion.from_dict(s).id != suggestion_id
            ]

    def _save_stats(self) -> None:
        self._store.set_stats(self.entry.entry_id, self.stats.as_dict())

    def _forget_changed_slots(
        self, old: dict[str, list[dict[str, Any]]], new: dict[str, list[dict[str, Any]]]
    ) -> None:
        """Deviations measured against a schedule that changed no longer apply."""
        today = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0)
        changed = False
        for offset in range(7):
            day = today + timedelta(days=offset)
            if old.get(DAYS[day.weekday()]) == new.get(DAYS[day.weekday()]):
                continue
            slots = [
                slot
                for slot in range(SLOTS_PER_DAY)
                if temperature_at(old, moment := day + slot * SLOT) != temperature_at(new, moment)
            ]
            if slots:
                self.stats.manual.reset(day.weekday(), slots)
                changed = True
        if changed:
            self._save_stats()

    async def _async_presence_history(
        self, start: datetime, end: datetime
    ) -> list[list[tuple[datetime, bool | None]]]:
        from homeassistant.components.recorder import get_instance, history

        states: dict[str, list[State]] = await get_instance(self.hass).async_add_executor_job(
            partial(
                history.get_significant_states,
                self.hass,
                start,
                end,
                self.presence_entities,
                significant_changes_only=False,
                no_attributes=True,
            )
        )
        return [
            [(max(s.last_changed, start), entity_present(s)) for s in states.get(entity_id, [])]
            for entity_id in self.presence_entities
        ]


def fit_temperature(temp: float, step: float, low: float | None, high: float | None) -> float:
    """Round to the thermostat step and clamp to its limits."""
    value = round(round(temp / step) * step, 2)
    if low is not None:
        value = max(value, math.ceil(low / step) * step)
    if high is not None:
        value = min(value, math.floor(high / step) * step)
    return round(value, 2)


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, int | float) and not isinstance(value, bool) else None


def _available(state: State | None) -> bool:
    return state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)


@callback
def async_find_entry(hass: HomeAssistant, climate_entity: str) -> ConfigEntry | None:
    """Config entry (loaded or not) for ``climate_entity``."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.data.get(CONF_CLIMATE_ENTITY) == climate_entity:
            return entry
    return None


@callback
def async_find_controller(hass: HomeAssistant, climate_entity: str) -> ScheduleController | None:
    """Controller of a loaded entry for ``climate_entity``."""
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        if entry.runtime_data.climate_entity == climate_entity:
            return entry.runtime_data
    return None
