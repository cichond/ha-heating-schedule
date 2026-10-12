"""Presence from several entities: who counts as present, and absence with a delay."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta

from homeassistant.const import STATE_HOME, STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    State,
    callback,
)
from homeassistant.helpers.event import async_track_point_in_time, async_track_state_change_event
from homeassistant.util import dt as dt_util

# person and device_tracker are present only at home; anything else when "on"
_HOME_DOMAINS = ("person", "device_tracker")


def entity_present(state: State | None) -> bool | None:
    """True/False, or None when the state is unknown."""
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    if state.entity_id.split(".", 1)[0] in _HOME_DOMAINS:  # recorder LazyState has no .domain
        return state.state == STATE_HOME
    return state.state in (STATE_ON, STATE_HOME)


def combined(states: list[State | None]) -> tuple[bool | None, datetime | None]:
    """Any entity present -> True. Otherwise False with the time the last one left.

    None when no entity has a known state.
    """
    known = [(s, p) for s in states if (p := entity_present(s)) is not None]
    if not known:
        return None, None
    if any(p for _, p in known):
        return True, None
    return False, max(s.last_changed for s, _ in known)


class AbsenceTracker:
    """``absent`` turns True once none of the entities has been present for ``delay``.

    Unknown states never count as absence, so a sensor that drops off the
    network does not lower the temperature.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entities: list[str],
        delay: timedelta,
        on_change: Callable[[], None],
    ) -> None:
        self.hass = hass
        self.entities = entities
        self.delay = delay
        self._on_change = on_change
        self._unsub_timer: CALLBACK_TYPE | None = None
        self.present: bool | None = None
        self.absent = False

    @callback
    def async_start(self) -> CALLBACK_TYPE:
        unsub_track = async_track_state_change_event(self.hass, self.entities, self._changed)
        self._evaluate(notify=False)

        @callback
        def _stop() -> None:
            unsub_track()
            if self._unsub_timer:
                self._unsub_timer()
                self._unsub_timer = None

        return _stop

    @callback
    def _changed(self, _event: Event[EventStateChangedData]) -> None:
        self._evaluate()

    @callback
    def _timer(self, _now: datetime) -> None:
        self._unsub_timer = None
        self._evaluate()

    @callback
    def _evaluate(self, notify: bool = True) -> None:
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        present, since = combined([self.hass.states.get(e) for e in self.entities])
        absent = False
        if present is False and since is not None:
            due = since + self.delay
            if due <= dt_util.utcnow():
                absent = True
            else:
                self._unsub_timer = async_track_point_in_time(self.hass, self._timer, due)
        changed = present != self.present or absent != self.absent
        self.present, self.absent = present, absent
        if changed and notify:
            self._on_change()
