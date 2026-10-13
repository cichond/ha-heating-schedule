"""Tests of the thermostat statistics: manual deviations and heat-up times (no Home Assistant)."""

from __future__ import annotations

from datetime import datetime, timedelta
import importlib.util
from pathlib import Path
import sys
from zoneinfo import ZoneInfo

_PATH = Path(__file__).parents[1] / "custom_components" / "heating_schedule" / "stats.py"
_spec = importlib.util.spec_from_file_location("hs_stats", _PATH)
stats = importlib.util.module_from_spec(_spec)
sys.modules["hs_stats"] = stats
_spec.loader.exec_module(stats)

TZ = ZoneInfo("Europe/Warsaw")
Sample = stats.Sample


def t(hour: int, minute: int = 0, day: int = 12) -> datetime:
    return datetime(2026, 10, day, hour, minute, tzinfo=TZ)


def s(when: datetime, target: float | None, current: float | None = 20, heating: bool = True):
    return Sample(when, heating, target, current)


# -- manual deviations ------------------------------------------------------


def test_deviation_time_weighted_per_slot() -> None:
    samples = [s(t(7, 30), 21), s(t(8, 5), 23), s(t(8, 35), 21)]
    slots = dict(stats.deviation_slots(samples, t(8, 0), t(8, 45), lambda _slot: 21))
    # 8:00-8:15: 5 min at +0, 10 min at +2; 8:15-8:30: +2; 8:30-8:45: 5 min at +2, 10 at +0
    assert slots == {t(8, 0): round(20 / 15, 4), t(8, 15): 2.0, t(8, 30): round(10 / 15, 4)}


def test_deviation_ignores_short_lived_targets() -> None:
    # 30 degrees by mistake, corrected after 10 minutes; then testing 23/24/22 for a while
    samples = [
        s(t(7, 0), 21),
        s(t(8, 0), 30),
        s(t(8, 10), 21),
        s(t(9, 0), 23),
        s(t(9, 10), 24),
        s(t(9, 25), 22),
        s(t(9, 40), 21),
    ]
    slots = dict(stats.deviation_slots(samples, t(8, 0), t(10, 0), lambda _slot: 21))
    assert all(dev == 0.0 for dev in slots.values())
    assert t(9, 15) not in slots  # unknown for the whole slot
    # The target in force at the end of the history is kept.
    tail = stats.deviation_slots([s(t(7, 0), 21), s(t(8, 0), 23)], t(8, 0), t(8, 15), lambda _: 21)
    assert tail == [(t(8, 0), 2.0)]


def test_deviation_skips_slots_mostly_off_or_unknown() -> None:
    samples = [s(t(8, 0), 21, heating=False), s(t(8, 10), 22), s(t(8, 15), None)]
    assert stats.deviation_slots(samples, t(8, 0), t(8, 30), lambda _slot: 21) == []


def test_deviation_needs_history_before_the_slot() -> None:
    samples = [s(t(8, 20), 23)]
    slots = stats.deviation_slots(samples, t(8, 0), t(8, 45), lambda _slot: 21)
    # 8:00-8:15 unknown; 8:15-8:30 known only 10 of 15 min (more than half)
    assert slots == [(t(8, 15), 2.0), (t(8, 30), 2.0)]


def test_deviation_uses_planned_temperature_of_each_slot() -> None:
    samples = [s(t(7, 0), 21)]
    planned = {t(8, 0): 18.0, t(8, 15): 21.0}
    slots = dict(stats.deviation_slots(samples, t(8, 0), t(8, 30), planned.__getitem__))
    assert slots == {t(8, 0): 3.0, t(8, 15): 0.0}


def test_manual_stats_average_and_share() -> None:
    manual = stats.ManualStats()
    manual.add(t(8, 0), 2.0)
    manual.add(t(8, 0, day=19), 0.0)
    day, slot = t(8, 0).weekday(), 32
    assert manual.avg[day][slot] == 1.0
    assert manual.share[day][slot] == 0.5
    assert manual.weeks() == 2

    manual.add(t(9, 0), 9.0)  # 30 degrees instead of 21 counts as +3
    assert manual.avg[day][36] == stats.MANUAL_CLIP

    manual.reset(day, [slot])
    assert manual.count[day][slot] == 0
    assert manual.avg[day][slot] == 0.0

    again = stats.ManualStats(manual.as_dict())
    assert again.as_dict() == manual.as_dict()


# -- heat-up ----------------------------------------------------------------


def test_heatup_run_until_target_reached() -> None:
    samples = [
        s(t(5, 0), 19, 19),
        s(t(6, 0), 21, 19),  # target +2
        s(t(6, 30), 21, 20),
        s(t(7, 10), 21, 20.5),  # reached (target - 0.5)
        s(t(8, 30), 19, 21),
    ]
    assert stats.heatup_runs(samples) == [stats.HeatupRun(t(6, 0), 70.0, 2.0)]


def test_heatup_interrupted_runs_are_dropped() -> None:
    samples = [
        s(t(6, 0), 19, 19),
        s(t(6, 5), 21, 19),
        s(t(6, 30), 22, 19.5),  # target changed again: run dropped, a new one starts (+1)
        s(t(7, 0), 22, 20, heating=False),  # switched off: dropped
        s(t(8, 0), 19, 20),
        s(t(8, 5), 21, 20),  # +2 but never reached
    ]
    assert stats.heatup_runs(samples) == []


def test_heatup_survives_a_corrected_typo() -> None:
    samples = [
        s(t(5, 0), 19, 19),
        s(t(6, 0), 21, 19),
        s(t(6, 10), 30, 19),  # five minutes at 30 degrees
        s(t(6, 15), 21, 19.5),
        s(t(7, 0), 21, 20.5),
    ]
    # Both short-lived targets are left out: the run starts at 6:15.
    assert stats.heatup_runs(samples) == [stats.HeatupRun(t(6, 15), 45.0, 1.5)]


def test_heatup_ignores_small_rises_and_already_warm_rooms() -> None:
    samples = [
        s(t(6, 0), 20, 19),
        s(t(6, 5), 20.5, 19),  # +0.5 only
        s(t(7, 0), 20.5, 21),
        s(t(8, 0), 23, 22.6),  # +2.5, but the room is almost there
        s(t(8, 10), 23, 23),
    ]
    assert stats.heatup_runs(samples) == []


def test_heatup_gives_up_after_max_duration() -> None:
    samples = [s(t(1, 0), 18, 18), s(t(1, 5), 22, 18), s(t(8, 0), 22, 22)]
    assert stats.heatup_runs(samples) == []


def test_heatup_stats_dedupe_and_rate() -> None:
    heatup = stats.HeatupStats()
    assert heatup.minutes_per_degree() is None
    runs = [
        stats.HeatupRun(t(6, 0), 60.0, 2.0),
        stats.HeatupRun(t(6, 0, day=13), 90.0, 2.0),
        stats.HeatupRun(t(6, 0, day=14), 30.0, 1.0),
    ]
    heatup.add(runs[:2])
    heatup.add(runs)  # seen again from an overlapping window
    assert len(heatup.runs) == 3
    assert heatup.minutes_per_degree() == 30.0  # median of 30, 45, 30

    heatup.add([stats.HeatupRun(t(6, 0, day=15) + timedelta(days=d), 40.0, 1.0) for d in range(25)])
    assert len(heatup.runs) == stats.HEATUP_KEEP

    again = stats.HeatupStats(heatup.as_dict())
    assert again.as_dict() == heatup.as_dict()


def test_thermostat_stats_round_trip() -> None:
    data = stats.ThermostatStats()
    data.last_sample = t(9, 0)
    data.manual.add(t(8, 0), 1.0)
    data.heatup.add([stats.HeatupRun(t(6, 0), 60.0, 2.0)])
    again = stats.ThermostatStats(data.as_dict())
    assert again.as_dict() == data.as_dict()
    assert again.last_sample == t(9, 0)
    assert stats.ThermostatStats(None).last_sample is None

    # Version 1 statistics: the manual part and the suggestion queues are dropped.
    old = data.as_dict()
    del old["version"]
    old["suggestions"] = {"queue": [{}], "ai_queue": [{}], "dismissed": {"k": "x"}}
    migrated = stats.ThermostatStats(old)
    assert migrated.manual.weeks() == 0
    assert migrated.suggestions == {"dismissed": {"k": "x"}}
    assert migrated.heatup.runs == data.heatup.runs
    assert migrated.last_sample == t(9, 0)


def test_window_start_spans_dst() -> None:
    # 2026-10-25: Europe/Warsaw falls back at 3:00; slots are computed in UTC
    utc = ZoneInfo("UTC")
    start = datetime(2026, 10, 25, 0, 0, tzinfo=utc)
    samples = [Sample(start - timedelta(hours=1), True, 22, 20)]
    slots = stats.deviation_slots(samples, start, start + timedelta(hours=2), lambda _slot: 21)
    assert len(slots) == 8
    assert all(dev == 1.0 for _slot, dev in slots)
