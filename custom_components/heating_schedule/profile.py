"""Occupancy profile: how likely a room is occupied, per weekday and 15-minute slot.

No Home Assistant imports, so it can be tested in isolation. The profile is a
running average per (weekday, slot): a plain mean for the first ``WINDOW``
samples, then an exponential average with weight ``1 / WINDOW`` - roughly
"the last eight weeks".
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from datetime import datetime, timedelta
from typing import Any

SLOT_MINUTES = 15
SLOTS_PER_DAY = 24 * 60 // SLOT_MINUTES
SLOT = timedelta(minutes=SLOT_MINUTES)
WINDOW = 8
DAY_NAMES = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")

# A change of one presence entity: (time, occupied). ``None`` = unknown/unavailable.
Change = tuple[datetime, bool | None]


def floor_slot(moment: datetime) -> datetime:
    """Start of the 15-minute slot containing ``moment``."""
    return moment.replace(
        minute=moment.minute - moment.minute % SLOT_MINUTES, second=0, microsecond=0
    )


def slot_index(moment: datetime) -> int:
    return (moment.hour * 60 + moment.minute) // SLOT_MINUTES


def _intervals(changes: Sequence[Change], end: datetime) -> list[tuple[datetime, datetime]]:
    """Occupied intervals of one entity."""
    out = []
    for i, (start, occupied) in enumerate(changes):
        stop = changes[i + 1][0] if i + 1 < len(changes) else end
        if occupied and stop > start:
            out.append((start, stop))
    return out


def _union(intervals: Iterable[tuple[datetime, datetime]]) -> list[tuple[datetime, datetime]]:
    merged: list[tuple[datetime, datetime]] = []
    for start, stop in sorted(intervals):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], stop))
        else:
            merged.append((start, stop))
    return merged


def occupancy_slots(
    series: Iterable[Sequence[Change]], start: datetime, end: datetime
) -> list[tuple[datetime, float]]:
    """Fraction of each complete slot in [start, end) during which any entity was occupied.

    Pass UTC datetimes: aware local-time arithmetic is wall-clock and breaks across DST.

    ``series`` holds the changes of each presence entity, sorted by time; the
    first change of an entity marks the start of its known history. Slots
    before any entity has history are skipped.
    """
    series = [list(s) for s in series if s]
    if not series:
        return []
    known_from = min(s[0][0] for s in series)
    occupied = _union(iv for s in series for iv in _intervals(s, end))

    slot = floor_slot(max(start, known_from))
    if slot < max(start, known_from):
        slot += SLOT
    result: list[tuple[datetime, float]] = []
    k = 0
    while slot + SLOT <= end:
        slot_end = slot + SLOT
        seconds = 0.0
        while k < len(occupied) and occupied[k][1] <= slot:
            k += 1
        j = k
        while j < len(occupied) and occupied[j][0] < slot_end:
            seconds += (min(occupied[j][1], slot_end) - max(occupied[j][0], slot)).total_seconds()
            j += 1
        result.append((slot, round(seconds / SLOT.total_seconds(), 4)))
        slot = slot_end
    return result


class Profile:
    """Average occupancy per weekday (0 = Monday) and slot."""

    def __init__(self, data: dict[str, Any] | None = None) -> None:
        data = data or {}
        self.avg: list[list[float]] = data.get("avg") or [[0.0] * SLOTS_PER_DAY for _ in range(7)]
        self.count: list[list[int]] = data.get("count") or [[0] * SLOTS_PER_DAY for _ in range(7)]
        last = data.get("last_sample")
        self.last_sample: datetime | None = datetime.fromisoformat(last) if last else None

    def add(self, slot_start: datetime, fraction: float) -> None:
        """Fold in one sample; ``slot_start`` must be in local time."""
        day, slot = slot_start.weekday(), slot_index(slot_start)
        self.count[day][slot] += 1
        weight = max(1 / self.count[day][slot], 1 / WINDOW)
        self.avg[day][slot] = round(
            self.avg[day][slot] + weight * (fraction - self.avg[day][slot]), 4
        )
        if self.last_sample is None or slot_start + SLOT > self.last_sample:
            self.last_sample = slot_start + SLOT

    def weeks(self) -> int:
        """How many weeks of data the best-covered slot has (capped at the window)."""
        return min(max(max(day) for day in self.count), WINDOW)

    def as_dict(self) -> dict[str, Any]:
        return {
            "avg": self.avg,
            "count": self.count,
            "last_sample": self.last_sample.isoformat() if self.last_sample else None,
        }
