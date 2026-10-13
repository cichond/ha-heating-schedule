"""Schedule suggestions from occupancy, manual deviations and heat-up times.

No Home Assistant imports (and no imports of sibling modules), so it can be
tested in isolation.

Every suggestion is one operation applied to one or more weekdays: set the
temperature of [start, end) to ``temp``. That covers moving a schedule point
(``shift``), a new setback in a typically empty period (``setback``) and a
different temperature where people keep changing it (``temp``). A suggestion
stays valid while the schedule around it is unchanged (``expect``), so
applying one does not invalidate another on a different part of the day.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import hashlib
import math
from typing import Any

DAY_NAMES = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
SLOT_MINUTES = 15
SLOTS_PER_DAY = 24 * 60 // SLOT_MINUTES
DAY_MINUTES = 24 * 60

MIN_SHIFT = 30  # minutes: smaller moves are not worth a suggestion
MIN_TEMP_CHANGE = 1.0  # degrees (and at least the thermostat step)
MIN_PROFILE_WEEKS = 3
MIN_MANUAL_WEEKS = 3
OCCUPIED = 0.5  # profile value from which a slot counts as occupied
EMPTY = 0.1  # ... and below which as empty
QUIET_BEFORE = 4  # slots below OCCUPIED before an arrival / after a departure (1 h)
SEARCH = 180  # minutes around a schedule point searched for an arrival or departure
MIN_SETBACK = 120  # minutes of setback left after the heat-up time
MIN_EMPTY_RUN = 12  # slots (3 h) of empty room for a setback
SETBACK_MARGIN = 30  # minutes kept from the segment edges (shifts cover those)
MANUAL_SHARE = 0.4  # share of samples with a manual change
MANUAL_MIN_SLOTS = 2
MANUAL_FOLLOW = 0.75  # move this far towards what people set
DISMISS_DAYS = 28
VISIBLE = 2

Points = list[tuple[int, float]]  # (minute, temperature), sorted, first at 0


@dataclass(frozen=True)
class Limits:
    step: float
    low: float | None = None
    high: float | None = None

    def fit(self, temp: float) -> float:
        value = round(round(temp / self.step) * self.step, 2)
        if self.low is not None:
            value = max(value, math.ceil(self.low / self.step) * self.step)
        if self.high is not None:
            value = min(value, math.floor(self.high / self.step) * self.step)
        return round(value, 2)


@dataclass
class Suggestion:
    kind: str  # shift / setback / temp
    days: list[str]
    start: int
    end: int
    temp: float
    expect: list[float]  # temperatures of the slots in [start - 15, end + 15), clipped to the day
    gain: float
    params: dict[str, Any]  # for the description (minutes, temperatures)
    keys: list[str] = field(default_factory=list)  # one per day, for remembering dismissals
    source: str = "data"

    @property
    def id(self) -> str:
        raw = f"{self.kind}|{self.start}|{self.end}|{self.temp}|{','.join(self.days)}|{self.source}"
        return hashlib.sha1(raw.encode()).hexdigest()[:12]

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "kind": self.kind,
            "days": self.days,
            "start": self.start,
            "end": self.end,
            "temp": self.temp,
            "expect": self.expect,
            "gain": round(self.gain, 2),
            "params": self.params,
            "keys": self.keys,
            "source": self.source,
        }

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> Suggestion:
        return cls(
            data["kind"],
            list(data["days"]),
            data["start"],
            data["end"],
            data["temp"],
            list(data["expect"]),
            data["gain"],
            dict(data["params"]),
            list(data.get("keys", [])),
            data.get("source", "data"),
        )


# -- schedule helpers ---------------------------------------------------------


def parse_day(points: Sequence[Mapping[str, Any]]) -> Points:
    result = []
    for point in points:
        hours, minutes = str(point["time"]).split(":")
        result.append((int(hours) * 60 + int(minutes), float(point["temp"])))
    return sorted(result)


def format_day(points: Points) -> list[dict[str, Any]]:
    return [{"time": f"{m // 60:02d}:{m % 60:02d}", "temp": t} for m, t in points]


def temp_at(points: Points, minute: int) -> float:
    temp = points[0][1]
    for start, value in points:
        if start > minute:
            break
        temp = value
    return temp


def set_range(points: Points, start: int, end: int, temp: float) -> Points:
    """``points`` with [start, end) set to ``temp`` (merged, first point at 0)."""
    after = temp_at(points, end) if end < DAY_MINUTES else None
    kept = [(m, t) for m, t in points if m < start or m > end]
    kept.append((start, temp))
    if after is not None and not any(m == end for m, _ in kept):
        kept.append((end, after))
    kept.sort()
    merged: Points = []
    for minute, value in kept:
        if merged and merged[-1][1] == value:
            continue
        merged.append((minute, value))
    if merged[0][0] != 0:
        merged.insert(0, (0, temp_at(points, 0)))
    return merged


def _segments(points: Points) -> list[tuple[int, int, float]]:
    ends = [m for m, _ in points[1:]] + [DAY_MINUTES]
    return [(m, end, t) for (m, t), end in zip(points, ends, strict=True)]


def _expect(points: Points, start: int, end: int) -> list[float]:
    first = max(0, start - SLOT_MINUTES)
    last = min(DAY_MINUTES, end + SLOT_MINUTES)
    return [temp_at(points, m) for m in range(first, last, SLOT_MINUTES)]


def is_valid(suggestion: Suggestion, days: Mapping[str, Sequence[Mapping[str, Any]]]) -> bool:
    """Still applicable: the schedule around the change is as it was when suggested."""
    return all(
        _expect(parse_day(days[day]), suggestion.start, suggestion.end) == suggestion.expect
        for day in suggestion.days
    )


def apply(
    suggestion: Suggestion, days: Mapping[str, Sequence[Mapping[str, Any]]]
) -> dict[str, list[dict[str, Any]]]:
    """The schedule with the suggestion applied."""
    result = {day: list(points) for day, points in days.items()}
    for day in suggestion.days:
        points = parse_day(days[day])
        result[day] = format_day(
            set_range(points, suggestion.start, suggestion.end, suggestion.temp)
        )
    return result


# -- occupancy ----------------------------------------------------------------


def _floor(minute: float) -> int:
    return int(minute // SLOT_MINUTES * SLOT_MINUTES)


def _occupied(occ: Sequence[float], slot: int) -> bool:
    return 0 <= slot < SLOTS_PER_DAY and occ[slot] >= OCCUPIED


def _arrival(occ: Sequence[float], start: int, end: int) -> int | None:
    """First slot in [start, end) occupied after at least an hour without anyone."""
    for slot in range(start // SLOT_MINUTES, math.ceil(end / SLOT_MINUTES)):
        if _occupied(occ, slot) and not any(
            _occupied(occ, slot - k) for k in range(1, QUIET_BEFORE + 1)
        ):
            return slot * SLOT_MINUTES
    return None


def _departure(occ: Sequence[float], start: int, end: int) -> int | None:
    """End of the last occupied slot in [start, end) followed by an hour without anyone."""
    for slot in reversed(range(start // SLOT_MINUTES, math.ceil(end / SLOT_MINUTES))):
        if _occupied(occ, slot) and not any(
            _occupied(occ, slot + k) for k in range(1, QUIET_BEFORE + 1)
        ):
            return (slot + 1) * SLOT_MINUTES
    return None


def _preheat(minutes_per_degree: float | None, degrees: float) -> float:
    return (minutes_per_degree or 0.0) * max(degrees, 0.0)


def _occupancy_ops(
    points: Points, occ: Sequence[float], minutes_per_degree: float | None
) -> list[Suggestion]:
    result: list[Suggestion] = []
    segments = _segments(points)
    low = min(t for _, t in points)
    for i, (start, end, temp) in enumerate(segments):
        if temp <= low:
            continue
        prev = segments[i - 1] if i > 0 else None
        nxt = segments[i + 1] if i + 1 < len(segments) else None

        # Raise when people arrive (minus the heat-up time).
        if prev is not None and prev[2] < temp:
            window_start = max(prev[0] + SLOT_MINUTES, start - SEARCH)
            arrival = _arrival(occ, window_start, min(end, start + SEARCH))
            if arrival is not None:
                to = _floor(arrival - _preheat(minutes_per_degree, temp - prev[2]))
                if abs(to - start) >= MIN_SHIFT and prev[0] < to < end - SLOT_MINUTES:
                    a, b, value = (to, start, temp) if to < start else (start, to, prev[2])
                    result.append(_shift(points, a, b, value, start, to, temp, temp - prev[2]))

        # Lower when people leave.
        if nxt is not None and nxt[2] < temp:
            window_end = min(nxt[1], end + SEARCH)
            departure = _departure(occ, max(start + SLOT_MINUTES, end - SEARCH), window_end)
            if departure is not None:
                to = _floor(departure)
                if abs(to - end) >= MIN_SHIFT and start < to < nxt[1]:
                    a, b, value = (to, end, nxt[2]) if to < end else (end, to, temp)
                    result.append(_shift(points, a, b, value, end, to, nxt[2], temp - nxt[2]))

        # A setback in a long, typically empty stretch inside the segment.
        run = _longest_empty(occ, start + SETBACK_MARGIN, end - SETBACK_MARGIN)
        if run is not None:
            run_start, run_end = run
            stop = _floor(run_end - _preheat(minutes_per_degree, temp - low))
            if stop - run_start >= MIN_SETBACK:
                gain = (stop - run_start) / 60 * (temp - low)
                params = {"start": run_start, "end": stop, "temp": low, "from_temp": temp}
                result.append(
                    _op("setback", points, run_start, stop, low, gain, params, f"{start}:down")
                )
    return result


def _shift(
    points: Points, a: int, b: int, value: float, old: int, new: int, temp: float, delta: float
) -> Suggestion:
    gain = abs(new - old) / 60 * abs(delta)
    direction = "later" if new > old else "earlier"
    params = {"from": old, "to": new, "temp": temp}
    return _op("shift", points, a, b, value, gain, params, f"{old}:{direction}")


def _longest_empty(occ: Sequence[float], start: int, end: int) -> tuple[int, int] | None:
    best: tuple[int, int] | None = None
    run_start: int | None = None
    first, last = math.ceil(start / SLOT_MINUTES), end // SLOT_MINUTES
    for slot in range(first, last + 1):
        empty = slot < last and occ[slot] < EMPTY
        if empty and run_start is None:
            run_start = slot
        elif not empty and run_start is not None:
            if slot - run_start >= MIN_EMPTY_RUN and (
                best is None or slot - run_start > (best[1] - best[0]) // SLOT_MINUTES
            ):
                best = (run_start * SLOT_MINUTES, slot * SLOT_MINUTES)
            run_start = None
    return best


# -- manual deviations ----------------------------------------------------------


def _manual_ops(
    points: Points, avg: Sequence[float], share: Sequence[float], limits: Limits
) -> list[Suggestion]:
    result: list[Suggestion] = []
    threshold = max(MIN_TEMP_CHANGE, limits.step)
    for start, end, temp in _segments(points):
        slot = start // SLOT_MINUTES
        last = math.ceil(end / SLOT_MINUTES)
        while slot < last:
            if share[slot] < MANUAL_SHARE or avg[slot] == 0:
                slot += 1
                continue
            sign = avg[slot] > 0
            run = slot
            while (
                run < last
                and share[run] >= MANUAL_SHARE
                and avg[run] != 0
                and (avg[run] > 0) == sign
            ):
                run += 1
            if run - slot >= MANUAL_MIN_SLOTS:
                mean = sum(avg[slot:run]) / (run - slot)
                new = limits.fit(temp + MANUAL_FOLLOW * mean)
                if abs(new - temp) >= threshold:
                    a, b = slot * SLOT_MINUTES, run * SLOT_MINUTES
                    gain = (b - a) / 60 * abs(new - temp)
                    params = {"start": a, "end": b, "temp": new, "from_temp": temp}
                    direction = "up" if new > temp else "down"
                    result.append(
                        _op("temp", points, a, b, new, gain, params, f"{start}:{direction}")
                    )
            slot = run
    return result


# -- assembling -------------------------------------------------------------------


def _op(
    kind: str,
    points: Points,
    start: int,
    end: int,
    temp: float,
    gain: float,
    params: dict[str, Any],
    key: str,
) -> Suggestion:
    return Suggestion(
        kind, [], start, end, temp, _expect(points, start, end), gain, params, [f"{kind}:{key}"]
    )


def analyze(
    days: Mapping[str, Sequence[Mapping[str, Any]]],
    limits: Limits,
    *,
    occupancy: Sequence[Sequence[float]] | None = None,
    occupancy_weeks: int = 0,
    manual_avg: Sequence[Sequence[float]] | None = None,
    manual_share: Sequence[Sequence[float]] | None = None,
    manual_weeks: int = 0,
    minutes_per_degree: float | None = None,
    dismissed: Mapping[str, str] | None = None,
    now: datetime | None = None,
) -> list[Suggestion]:
    """All suggestions, best first. The same change on several days is one suggestion."""
    recent = _recent_dismissals(dismissed or {}, now)
    grouped: dict[tuple[Any, ...], Suggestion] = {}
    for index, day in enumerate(DAY_NAMES):
        points = parse_day(days[day])
        ops: list[Suggestion] = []
        if occupancy is not None and occupancy_weeks >= MIN_PROFILE_WEEKS:
            ops += _occupancy_ops(points, occupancy[index], minutes_per_degree)
        if manual_avg is not None and manual_share is not None and manual_weeks >= MIN_MANUAL_WEEKS:
            ops += _manual_ops(points, manual_avg[index], manual_share[index], limits)
        for op in ops:
            key = f"{day}:{op.keys[0]}"
            if key in recent:
                continue
            group = (op.kind, op.start, op.end, op.temp, tuple(op.expect))
            if group in grouped:
                grouped[group].days.append(day)
                grouped[group].keys.append(key)
                grouped[group].gain += op.gain
            else:
                op.days, op.keys = [day], [key]
                grouped[group] = op
    return sorted(grouped.values(), key=lambda s: s.gain, reverse=True)


def visible(
    queue: Sequence[Suggestion],
    days: Mapping[str, Sequence[Mapping[str, Any]]],
    limit: int = VISIBLE,
) -> list[Suggestion]:
    """The first ``limit`` suggestions that still apply to the schedule."""
    return [s for s in queue if is_valid(s, days)][:limit]


def _recent_dismissals(dismissed: Mapping[str, str], now: datetime | None) -> set[str]:
    if now is None:
        return set(dismissed)
    cutoff = now - timedelta(days=DISMISS_DAYS)
    return {key for key, when in dismissed.items() if datetime.fromisoformat(when) > cutoff}
