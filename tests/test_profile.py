"""Tests of the occupancy profile (no Home Assistant needed)."""

from __future__ import annotations

from datetime import datetime, timedelta
import importlib.util
from pathlib import Path
import sys
from zoneinfo import ZoneInfo

_PATH = Path(__file__).parents[1] / "custom_components" / "heating_schedule" / "profile.py"
_spec = importlib.util.spec_from_file_location("hs_profile", _PATH)
profile = importlib.util.module_from_spec(_spec)
sys.modules["hs_profile"] = profile
_spec.loader.exec_module(profile)

TZ = ZoneInfo("Europe/Warsaw")


def t(hour: int, minute: int = 0, day: int = 12) -> datetime:
    return datetime(2026, 10, day, hour, minute, tzinfo=TZ)


def test_floor_and_index() -> None:
    assert profile.floor_slot(t(8, 44)) == t(8, 30)
    assert profile.slot_index(t(8, 44)) == 34
    assert profile.slot_index(t(23, 59)) == 95


def test_single_entity_fractions() -> None:
    changes = [(t(8, 0), False), (t(8, 5), True), (t(8, 35), False)]
    slots = dict(profile.occupancy_slots([changes], t(8, 0), t(9, 0)))
    assert slots == {
        t(8, 0): round(10 / 15, 4),
        t(8, 15): 1.0,
        t(8, 30): round(5 / 15, 4),
        t(8, 45): 0.0,
    }


def test_union_of_entities_and_incomplete_slot() -> None:
    a = [(t(8, 0), True), (t(8, 10), False)]
    b = [(t(8, 5), True), (t(8, 20), None)]
    slots = profile.occupancy_slots([a, b], t(8, 0), t(8, 40))
    # union 08:00-08:20; the 08:30 slot is not complete and is left out
    assert slots == [(t(8, 0), 1.0), (t(8, 15), round(5 / 15, 4))]


def test_slots_before_known_history_are_skipped() -> None:
    changes = [(t(8, 7), True)]
    slots = profile.occupancy_slots([changes], t(7, 0), t(8, 45))
    assert slots == [(t(8, 15), 1.0), (t(8, 30), 1.0)]
    assert profile.occupancy_slots([[]], t(7, 0), t(8, 45)) == []


def test_profile_mean_then_ema() -> None:
    p = profile.Profile()
    for week in range(10):
        p.add(t(9, 0) + timedelta(weeks=week), 1.0 if week < 2 else 0.0)
    day, slot = 0, profile.slot_index(t(9, 0))
    assert p.count[day][slot] == 10
    # 2 x 1.0 then 6 x 0.0 as a mean (0.25), then two EMA steps with weight 1/8
    assert abs(p.avg[day][slot] - 0.25 * (7 / 8) ** 2) < 1e-3
    assert p.weeks() == profile.WINDOW
    assert p.last_sample == t(9, 15) + timedelta(weeks=9)


def test_profile_round_trip() -> None:
    p = profile.Profile()
    p.add(t(9, 0), 0.5)
    q = profile.Profile(p.as_dict())
    assert q.avg == p.avg and q.count == p.count and q.last_sample == p.last_sample
