"""Holiday mode in Home Assistant: stored, ended on its return date, applied to every schedule."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.util import dt as dt_util

from .const import DOMAIN, SIGNAL_VACATION
from .store import ScheduleStore
from .vacation import Period, Vacation

UNSET: Any = object()


class VacationManager:
    """The shared holiday state; schedules ask it for their temperature."""

    def __init__(self, hass: HomeAssistant, store: ScheduleStore) -> None:
        self.hass = hass
        self._store = store
        self.state = Vacation(store.get_vacation())
        self._unsub_end: CALLBACK_TYPE | None = None

    async def async_start(self) -> None:
        """At setup: end a holiday whose return date passed while Home Assistant was down."""
        if self.state.expired(dt_util.utcnow()):
            await self.async_set(active=False)
        else:
            self._schedule_end()

    @callback
    def async_stop(self) -> None:
        if self._unsub_end:
            self._unsub_end()
            self._unsub_end = None

    def temperature(self) -> float | None:
        """The holiday temperature while it is on, else None."""
        return self.state.temp if self.state.active else None

    def periods(self) -> list[Period]:
        return self.state.periods_with_current()

    async def async_set(
        self,
        *,
        active: bool | None = None,
        temp: float | None = None,
        until: datetime | None = UNSET,
    ) -> None:
        """Change the holiday; every schedule applies the result straight away."""
        now = dt_util.utcnow()
        if temp is not None:
            self.state.temp = float(temp)
        if until is not UNSET:
            self.state.until = dt_util.as_utc(until) if until else None
        if active is True:
            self.state.start(now)
        elif active is False:
            self.state.stop(now)
        if self.state.expired(now):  # a return date already in the past
            self.state.stop(now)
        self._store.set_vacation(self.state.as_dict())
        self._schedule_end()
        async_dispatcher_send(self.hass, SIGNAL_VACATION, self.state.summary())
        for entry in self.hass.config_entries.async_loaded_entries(DOMAIN):
            await entry.runtime_data.async_vacation_changed()

    @callback
    def _schedule_end(self) -> None:
        if self._unsub_end:
            self._unsub_end()
            self._unsub_end = None
        if self.state.active and self.state.until:
            self._unsub_end = async_track_point_in_time(
                self.hass, self._async_end_reached, self.state.until
            )

    async def _async_end_reached(self, _now: Any) -> None:
        self._unsub_end = None
        await self.async_set(active=False)
