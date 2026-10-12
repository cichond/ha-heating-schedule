"""Tests of the schedule model (no Home Assistant needed)."""

from __future__ import annotations

from datetime import datetime
import importlib.util
from pathlib import Path
import sys
from zoneinfo import ZoneInfo

import pytest

# Load schedule.py directly so these tests run without Home Assistant installed.
_PATH = Path(__file__).parents[1] / "custom_components" / "heating_schedule" / "schedule.py"
_spec = importlib.util.spec_from_file_location("hs_schedule", _PATH)
schedule = importlib.util.module_from_spec(_spec)
sys.modules["hs_schedule"] = schedule
_spec.loader.exec_module(schedule)

TZ = ZoneInfo("Europe/Warsaw")

WORKDAY = [
    {"time": "00:00", "temp": 19},
    {"time": "05:30", "temp": 21},
    {"time": "08:30", "temp": 19},
    {"time": "19:00", "temp": 21},
    {"time": "22:00", "temp": 19},
]
WEEKEND = [
    {"time": "00:00", "temp": 19},
    {"time": "06:30", "temp": 21},
    {"time": "10:00", "temp": 19},
]


def week() -> dict:
    return {d: (WORKDAY if d in schedule.DAYS[:5] else WEEKEND) for d in schedule.DAYS}


def test_parse_and_format_time() -> None:
    assert schedule.parse_time("05:30") == 330
    assert schedule.parse_time("05:30:00") == 330
    assert schedule.format_time(330) == "05:30"
    for bad in ("24:00", "5", "aa:bb", "12:60"):
        with pytest.raises(schedule.ScheduleError):
            schedule.parse_time(bad)


def test_normalize_day_sorts_and_merges() -> None:
    day = schedule.normalize_day(
        [
            {"time": "08:00", "temp": 21},
            {"time": "00:00", "temp": "19"},
            {"time": "06:00", "temp": 21},
            {"time": "08:00", "temp": 21.04},
        ]
    )
    assert day == [{"time": "00:00", "temp": 19.0}, {"time": "06:00", "temp": 21.0}]


def test_normalize_day_requires_midnight() -> None:
    with pytest.raises(schedule.ScheduleError):
        schedule.normalize_day([{"time": "06:00", "temp": 21}])
    with pytest.raises(schedule.ScheduleError):
        schedule.normalize_day([])


def test_normalize_schedule_needs_all_days() -> None:
    with pytest.raises(schedule.ScheduleError):
        schedule.normalize_schedule({"mon": WORKDAY})
    days = week()
    days["xyz"] = WORKDAY
    with pytest.raises(schedule.ScheduleError):
        schedule.normalize_schedule(days)


def test_current_slot_inside_day() -> None:
    # 2026-10-12 is a Monday
    slot = schedule.current_slot(week(), datetime(2026, 10, 12, 7, 0, tzinfo=TZ))
    assert slot.temp == 21
    assert slot.next_change == datetime(2026, 10, 12, 8, 30, tzinfo=TZ)
    assert slot.next_temp == 19


def test_current_slot_exactly_at_point() -> None:
    slot = schedule.current_slot(week(), datetime(2026, 10, 12, 8, 30, tzinfo=TZ))
    assert slot.temp == 19
    assert slot.next_change == datetime(2026, 10, 12, 19, 0, tzinfo=TZ)


def test_current_slot_skips_midnight_with_same_temp() -> None:
    # Friday 22:00 -> 19 degrees, Saturday 00:00 is also 19, next change Saturday 06:30
    slot = schedule.current_slot(week(), datetime(2026, 10, 16, 23, 0, tzinfo=TZ))
    assert slot.temp == 19
    assert slot.next_change == datetime(2026, 10, 17, 6, 30, tzinfo=TZ)
    assert slot.next_temp == 21


def test_current_slot_constant_week() -> None:
    slot = schedule.current_slot(
        schedule.default_schedule(20), datetime(2026, 10, 12, 12, 0, tzinfo=TZ)
    )
    assert slot == schedule.Slot(20.0, None, None)


def test_current_slot_across_dst_change() -> None:
    # 2026-10-25 03:00 CEST -> 02:00 CET (Sunday)
    slot = schedule.current_slot(week(), datetime(2026, 10, 24, 23, 0, tzinfo=TZ))
    assert slot.next_change == datetime(2026, 10, 25, 6, 30, tzinfo=TZ)
    assert slot.next_change.utcoffset().total_seconds() == 3600


def test_from_scheduler() -> None:
    days = schedule.from_scheduler(
        ["mon", "tue", "wed", "thu", "fri"],
        ["00:00 - 05:30", "05:30 - 08:30", "08:30 - 19:00", "19:00 - 22:00", "22:00 - 00:00"],
        [19, 21, 19, 21, 19],
    )
    assert set(days) == set(schedule.DAYS[:5])
    assert days["mon"] == schedule.normalize_day(WORKDAY)


def test_from_scheduler_groups_and_missing_midnight() -> None:
    days = schedule.from_scheduler(["weekend"], ["06:00:00 - 10:00:00", "10:00 - 06:00"], [21, 18])
    assert set(days) == {"sat", "sun"}
    assert days["sat"] == [
        {"time": "00:00", "temp": 18.0},
        {"time": "06:00", "temp": 21.0},
        {"time": "10:00", "temp": 18.0},
    ]
    with pytest.raises(schedule.ScheduleError):
        schedule.from_scheduler(["holiday"], ["00:00 - 01:00"], [20])
