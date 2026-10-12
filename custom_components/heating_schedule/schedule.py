"""Schedule model: seven days, each a list of temperature change points.

This module has no Home Assistant imports so it can be tested in isolation.
A day is a list of ``{"time": "HH:MM", "temp": float}`` sorted by time, whose
first point is always at 00:00. A point holds until the next one.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, tzinfo
from typing import Any

DAYS: tuple[str, ...] = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
MINUTES_PER_DAY = 24 * 60

# Weekday shortcuts used by the Scheduler component.
_DAY_GROUPS: dict[str, tuple[str, ...]] = {
    "daily": DAYS,
    "workday": DAYS[:5],
    "weekend": DAYS[5:],
}


class ScheduleError(ValueError):
    """Invalid schedule data."""


def parse_time(value: str) -> int:
    """Parse ``HH:MM`` or ``HH:MM:SS`` into minutes after midnight."""
    parts = str(value).strip().split(":")
    if len(parts) not in (2, 3):
        raise ScheduleError(f"invalid time: {value!r}")
    try:
        hours, minutes = int(parts[0]), int(parts[1])
    except ValueError as err:
        raise ScheduleError(f"invalid time: {value!r}") from err
    if not (0 <= hours < 24 and 0 <= minutes < 60):
        raise ScheduleError(f"invalid time: {value!r}")
    return hours * 60 + minutes


def format_time(minutes: int) -> str:
    """Format minutes after midnight as ``HH:MM``."""
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def normalize_day(points: Iterable[Mapping[str, Any]]) -> list[dict[str, Any]]:
    """Validate a day, sort it and merge neighbours with equal temperature.

    When two points share a time, the later one in the input wins.
    """
    by_time: dict[int, float] = {}
    for point in points:
        try:
            temp = round(float(point["temp"]), 1)
            minute = parse_time(point["time"])
        except (KeyError, TypeError, ValueError) as err:
            raise ScheduleError(f"invalid point: {point!r}") from err
        by_time[minute] = temp
    if not by_time:
        raise ScheduleError("a day needs at least one point")
    items = sorted(by_time.items())
    if items[0][0] != 0:
        raise ScheduleError("the first point of a day must be at 00:00")

    result: list[dict[str, Any]] = []
    for minute, temp in items:
        if result and result[-1]["temp"] == temp:
            continue
        result.append({"time": format_time(minute), "temp": temp})
    return result


def normalize_schedule(days: Mapping[str, Any]) -> dict[str, list[dict[str, Any]]]:
    """Validate a full week."""
    missing = [day for day in DAYS if day not in days]
    if missing:
        raise ScheduleError(f"missing days: {', '.join(missing)}")
    unknown = [day for day in days if day not in DAYS]
    if unknown:
        raise ScheduleError(f"unknown days: {', '.join(unknown)}")
    return {day: normalize_day(days[day]) for day in DAYS}


def default_schedule(temp: float) -> dict[str, list[dict[str, Any]]]:
    """Whole week at a single temperature."""
    return {day: [{"time": "00:00", "temp": round(float(temp), 1)}] for day in DAYS}


@dataclass(frozen=True, slots=True)
class Slot:
    """Temperature in force now and the next change."""

    temp: float
    next_change: datetime | None
    next_temp: float | None


def _points(days: Mapping[str, list[dict[str, Any]]], day: date) -> list[tuple[int, float]]:
    return [(parse_time(p["time"]), float(p["temp"])) for p in days[DAYS[day.weekday()]]]


def _at(day: date, minute: int, tz: tzinfo | None) -> datetime:
    return datetime.combine(day, time(minute // 60, minute % 60), tzinfo=tz)


def temperature_at(days: Mapping[str, list[dict[str, Any]]], moment: datetime) -> float:
    """Scheduled temperature at ``moment`` (local, timezone aware)."""
    minute = moment.hour * 60 + moment.minute
    temp = None
    for start, value in _points(days, moment.date()):
        if start > minute:
            break
        temp = value
    if temp is None:  # first point is always at 00:00
        raise ScheduleError("day without a 00:00 point")
    return temp


def current_slot(days: Mapping[str, list[dict[str, Any]]], now: datetime) -> Slot:
    """Temperature in force at ``now`` and the next point that changes it.

    Points that repeat the current temperature (e.g. 00:00 continuing the
    previous evening) are skipped, so a manual change survives them.
    """
    temp = temperature_at(days, now)
    minute = now.hour * 60 + now.minute
    for offset in range(8):
        day = now.date() + timedelta(days=offset)
        for start, value in _points(days, day):
            if offset == 0 and start <= minute:
                continue
            if value != temp:
                return Slot(temp, _at(day, start, now.tzinfo), value)
    return Slot(temp, None, None)


def from_scheduler(
    weekdays: Iterable[str], timeslots: Iterable[str], temps: Iterable[float]
) -> dict[str, list[dict[str, Any]]]:
    """Convert a Scheduler component schedule into days of this model.

    ``timeslots`` are ``"HH:MM - HH:MM"`` strings (or bare start times),
    ``temps`` the temperature of each slot. Returns only the covered days.
    """
    days: list[str] = []
    for item in weekdays:
        if item in _DAY_GROUPS:
            days.extend(_DAY_GROUPS[item])
        elif item in DAYS:
            days.append(item)
        else:
            raise ScheduleError(f"unsupported weekday: {item!r}")

    points = []
    for slot, temp in zip(timeslots, temps, strict=True):
        start = str(slot).split("-")[0].strip()
        points.append({"time": start, "temp": temp})
    if points and parse_time(points[0]["time"]) != 0:
        # Scheduler leaves the time before the first slot untouched; the last
        # slot of the day is what is in force then.
        points.insert(0, {"time": "00:00", "temp": points[-1]["temp"]})
    day_points = normalize_day(points)
    return {day: [dict(p) for p in day_points] for day in dict.fromkeys(days)}
