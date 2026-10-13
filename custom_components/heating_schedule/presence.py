"""Presence from several entities: who counts as present, and absence with a delay."""

from __future__ import annotations

from collections.abc import Callable

from homeassistant.const import STATE_HOME, STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    State,
    callback,
)
from homeassistant.helpers.event import async_track_state_change_event

# person and device_tracker are present only at home; anything else when "on"
_HOME_DOMAINS = ("person", "device_tracker")


def entity_present(state: State | None) -> bool | None:
    """True/False, or None when the state is unknown."""
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    if state.entity_id.split(".", 1)[0] in _HOME_DOMAINS:  # recorder LazyState has no .domain
        return state.state == STATE_HOME
    return state.state in (STATE_ON, STATE_HOME)


def combined(states: list[State | None]) -> bool | None:
    """Any entity present -> True, otherwise False; None when no entity has a known state."""
    known = [p for s in states if (p := entity_present(s)) is not None]
    if not known:
        return None
    return any(known)


class RoomPresence:
    """``present``: any entity present -> True, all known ones absent -> False.

    None when no entity has a known state (unknown never counts as absence).
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entities: list[str],
        on_change: Callable[[], None],
    ) -> None:
        self.hass = hass
        self.entities = entities
        self._on_change = on_change
        self.present: bool | None = None

    @callback
    def async_start(self) -> CALLBACK_TYPE:
        unsub = async_track_state_change_event(self.hass, self.entities, self._changed)
        self._evaluate(notify=False)
        return unsub

    @callback
    def _changed(self, _event: Event[EventStateChangedData]) -> None:
        self._evaluate()

    @callback
    def _evaluate(self, notify: bool = True) -> None:
        present = combined([self.hass.states.get(e) for e in self.entities])
        changed = present != self.present
        self.present = present
        if changed and notify:
            self._on_change()
