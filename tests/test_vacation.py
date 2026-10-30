"""Tests of the holiday mode state (no Home Assistant)."""

from __future__ import annotations

from datetime import UTC, datetime
import importlib.util
from pathlib import Path
import sys

_PATH = Path(__file__).parents[1] / "custom_components" / "heating_schedule" / "vacation.py"
_spec = importlib.util.spec_from_file_location("hs_vacation", _PATH)
vacation = importlib.util.module_from_spec(_spec)
sys.modules["hs_vacation"] = vacation
_spec.loader.exec_module(vacation)


def t(day: int, hour: int = 0) -> datetime:
    return datetime(2026, 11, day, hour, tzinfo=UTC)


def test_start_stop_keeps_the_period() -> None:
    state = vacation.Vacation()
    assert not state.active
    assert state.temp == vacation.VACATION_TEMP
    state.until = t(7, 14)
    state.start(t(1, 9))
    assert state.active
    assert state.periods_with_current() == [(t(1, 9), None)]
    assert not state.expired(t(7, 13))
    assert state.expired(t(7, 14))
    state.stop(t(7, 14))
    assert not state.active
    assert state.until is None  # the return date is spent
    assert state.periods == [(t(1, 9), t(7, 14))]


def test_round_trip_and_trim() -> None:
    state = vacation.Vacation()
    state.temp = 16.5
    for day in range(1, 26):
        state.start(t(day, 1))
        state.stop(t(day, 2))
    assert len(state.periods) == vacation.KEEP_PERIODS
    state.start(t(28, 3))
    again = vacation.Vacation(state.as_dict())
    assert again.as_dict() == state.as_dict()
    assert again.active and again.temp == 16.5
    assert "periods" not in again.summary()


def test_overlaps() -> None:
    periods = [(t(1, 9), t(3, 9)), (t(5, 0), None)]
    assert vacation.overlaps(t(2, 0), t(2, 1), periods)
    assert not vacation.overlaps(t(3, 9), t(3, 10), periods)  # ends exactly at the start
    assert not vacation.overlaps(t(1, 8), t(1, 9), periods)
    assert vacation.overlaps(t(20, 0), t(20, 1), periods)  # the open one runs until now


def test_inconsistent_data_is_off() -> None:
    assert not vacation.Vacation({"active": True}).active
