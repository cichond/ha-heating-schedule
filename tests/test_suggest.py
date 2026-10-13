"""Tests of the schedule suggestions (no Home Assistant needed)."""

from __future__ import annotations

from datetime import datetime, timedelta
import importlib.util
from pathlib import Path
import sys
from zoneinfo import ZoneInfo

_PATH = Path(__file__).parents[1] / "custom_components" / "heating_schedule" / "suggest.py"
_spec = importlib.util.spec_from_file_location("hs_suggest", _PATH)
suggest = importlib.util.module_from_spec(_spec)
sys.modules["hs_suggest"] = suggest
_spec.loader.exec_module(suggest)

NOW = datetime(2026, 10, 13, 4, 0, tzinfo=ZoneInfo("Europe/Warsaw"))
STEP1 = suggest.Limits(1.0, 5, 30)
NAMES = suggest.DAY_NAMES


def day(*points: tuple[str, float]) -> list[dict]:
    return [{"time": time, "temp": temp} for time, temp in points]


def week(points: list[dict]) -> dict[str, list[dict]]:
    return {name: points for name in NAMES}


def hm(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def profile(fn) -> list[list[float]]:
    """Same occupancy every day: fn(hour as float) -> value."""
    return [[fn(i / 4) for i in range(96)] for _ in range(7)]


# The office from the design: arrives ~9:00, leaves ~16:00, back in the evening ~21:00.
OFFICE = day(("00:00", 18), ("08:30", 21), ("17:30", 18), ("20:30", 20))


def office(hour: float) -> float:
    return 0.85 if 9 <= hour < 16 or hour >= 21 else 0.03


def test_helpers() -> None:
    points = suggest.parse_day(OFFICE)
    assert points == [(0, 18.0), (510, 21.0), (1050, 18.0), (1230, 20.0)]
    assert suggest.temp_at(points, 600) == 21.0
    assert suggest.set_range(points, 960, 1050, 18.0) == [
        (0, 18.0),
        (510, 21.0),
        (960, 18.0),
        (1230, 20.0),
    ]
    assert suggest.set_range(points, 840, 960, 22.0) == [
        (0, 18.0),
        (510, 21.0),
        (840, 22.0),
        (960, 21.0),
        (1050, 18.0),
        (1230, 20.0),
    ]
    assert suggest.format_day(points[:2]) == day(("00:00", 18.0), ("08:30", 21.0))
    assert suggest.Limits(0.5, 7, 35).fit(22.74) == 22.5
    assert suggest.Limits(1, 7, 35).fit(40) == 35


def test_office_shifts() -> None:
    result = suggest.analyze(
        week(OFFICE), STEP1, occupancy=profile(office), occupancy_weeks=4, now=NOW
    )
    described = [
        (s.kind, hm(s.params["from"]), hm(s.params["to"]), s.params["temp"]) for s in result
    ]
    assert described == [
        ("shift", "17:30", "16:00", 18.0),  # lower when they leave: 1.5 h x 3 degrees
        ("shift", "08:30", "09:00", 21.0),  # raise when they arrive
        ("shift", "20:30", "21:00", 20.0),
    ]
    assert result[0].days == list(NAMES)  # the same on every day: one suggestion
    assert result[0].gain == 7 * 4.5

    queue = result
    first = suggest.visible(queue, week(OFFICE))
    assert [s.id for s in first] == [queue[0].id, queue[1].id]

    applied = suggest.apply(queue[0], week(OFFICE))
    assert applied["mon"] == day(("00:00", 18.0), ("08:30", 21.0), ("16:00", 18.0), ("20:30", 20.0))
    # the other suggestions touch other parts of the day and stay valid
    assert [s.id for s in suggest.visible(queue, applied)] == [queue[1].id, queue[2].id]
    assert not suggest.is_valid(queue[0], applied)


def test_preheat_moves_the_start_earlier() -> None:
    result = suggest.analyze(
        week(OFFICE),
        STEP1,
        occupancy=profile(office),
        occupancy_weeks=4,
        minutes_per_degree=20,  # 3 degrees -> 60 min before 9:00
        now=NOW,
    )
    morning = next(s for s in result if s.params["from"] == 510)
    assert hm(morning.params["to"]) == "08:00"
    applied = suggest.apply(morning, week(OFFICE))
    assert applied["tue"][1] == {"time": "08:00", "temp": 21.0}


def test_small_changes_and_too_little_data_give_nothing() -> None:
    def close(hour: float) -> float:  # arrives 8:45: only 15 minutes after the schedule
        return 0.85 if 8.75 <= hour < 17.5 or hour >= 20.5 else 0.03

    assert suggest.analyze(week(OFFICE), STEP1, occupancy=profile(close), occupancy_weeks=4) == []
    assert suggest.analyze(week(OFFICE), STEP1, occupancy=profile(office), occupancy_weeks=2) == []


def test_setback_in_a_long_empty_stretch() -> None:
    home = day(("00:00", 18), ("06:00", 21), ("22:00", 18))

    def at_home(hour: float) -> float:  # out 9:00-15:00
        return 0.9 if 6 <= hour < 9 or 15 <= hour < 22 else 0.02

    result = suggest.analyze(
        week(home), STEP1, occupancy=profile(at_home), occupancy_weeks=4, minutes_per_degree=20
    )
    setback = next(s for s in result if s.kind == "setback")
    # back at 15:00, 3 degrees x 20 min = 1 h of heat-up
    assert (hm(setback.start), hm(setback.end), setback.temp) == ("09:00", "14:00", 18.0)
    applied = suggest.apply(setback, week(home))
    assert applied["sat"] == day(
        ("00:00", 18), ("06:00", 21), ("09:00", 18.0), ("14:00", 21), ("22:00", 18)
    )


def test_manual_turn_up_meets_halfway_closer_to_the_setting() -> None:
    # The son turns 21 up to 23 between 14:00 and 18:00 on most days.
    room = day(("00:00", 19), ("06:00", 21), ("22:00", 19))
    avg = [[2.0 if 56 <= i < 72 else 0.0 for i in range(96)] for _ in range(7)]
    share = [[0.8 if 56 <= i < 72 else 0.0 for i in range(96)] for _ in range(7)]
    result = suggest.analyze(
        week(room), suggest.Limits(0.5, 5, 30), manual_avg=avg, manual_share=share, manual_weeks=3
    )
    assert [(s.kind, hm(s.start), hm(s.end), s.temp) for s in result] == [
        ("temp", "14:00", "18:00", 22.5)
    ]
    # occasional changes (share below 40 %) are ignored
    rare = [[0.3 if 56 <= i < 72 else 0.0 for i in range(96)] for _ in range(7)]
    assert (
        suggest.analyze(week(room), STEP1, manual_avg=avg, manual_share=rare, manual_weeks=3) == []
    )


def test_dismissed_suggestions_stay_away_for_four_weeks() -> None:
    first = suggest.analyze(week(OFFICE), STEP1, occupancy=profile(office), occupancy_weeks=4)[0]
    dismissed = {key: (NOW - timedelta(days=1)).isoformat() for key in first.keys}
    again = suggest.analyze(
        week(OFFICE),
        STEP1,
        occupancy=profile(office),
        occupancy_weeks=4,
        dismissed=dismissed,
        now=NOW,
    )
    assert first.id not in [s.id for s in again]
    later = NOW + timedelta(days=suggest.DISMISS_DAYS)
    back = suggest.analyze(
        week(OFFICE),
        STEP1,
        occupancy=profile(office),
        occupancy_weeks=4,
        dismissed=dismissed,
        now=later,
    )
    assert first.id in [s.id for s in back]


def test_weekdays_and_weekend_are_separate_suggestions() -> None:
    def weekday_profile() -> list[list[float]]:
        work = [office(i / 4) for i in range(96)]
        home = [0.9] * 96
        return [work] * 5 + [home] * 2

    result = suggest.analyze(week(OFFICE), STEP1, occupancy=weekday_profile(), occupancy_weeks=4)
    assert result[0].days == ["mon", "tue", "wed", "thu", "fri"]


def test_round_trip() -> None:
    result = suggest.analyze(week(OFFICE), STEP1, occupancy=profile(office), occupancy_weeks=4)
    again = suggest.Suggestion.from_dict(result[0].as_dict())
    assert again.id == result[0].id
    assert again.as_dict() == result[0].as_dict()
