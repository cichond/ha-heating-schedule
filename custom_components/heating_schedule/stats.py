"""Thermostat statistics built from recorder history, for schedule suggestions.

No Home Assistant imports (and no imports of sibling modules), so it can be
tested in isolation.

- **Manual deviations:** per weekday and 15-minute slot, how far the target
  temperature in force was from the schedule (someone turned it up or down).
  Running average like the occupancy profile: roughly the last eight weeks.
  Targets that held for less than ``MANUAL_MIN_HOLD`` (a typo corrected a
  moment later, testing a thermostat) are ignored, and one slot moves the
  average by at most ``MANUAL_CLIP`` degrees.
- **Heat-up runs:** how long the room took to reach a raised target, so a
  schedule can start heating early enough.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
from statistics import median
from typing import Any

SLOT_MINUTES = 15
SLOTS_PER_DAY = 24 * 60 // SLOT_MINUTES
SLOT = timedelta(minutes=SLOT_MINUTES)
WINDOW = 8  # weeks, as the occupancy profile

MIN_KNOWN_SHARE = 0.5  # a slot counts when the thermostat heated for at least half of it
MANUAL_THRESHOLD = 0.25  # |deviation| from which a slot counts as manually changed
MANUAL_MIN_HOLD = timedelta(minutes=30)  # shorter-lived targets are ignored
MANUAL_CLIP = 3.0  # degrees; a larger deviation counts as this much
STATS_VERSION = 2  # 1: short-lived targets were counted; the manual statistics are dropped

HEATUP_MIN_RISE = 1.0  # target raised by at least this, and the room this far below it
HEATUP_REACHED = 0.5  # reached once the room is within this of the target
HEATUP_MAX = timedelta(hours=6)
HEATUP_LOOKBACK = HEATUP_MAX  # history fetched before the sampled window, for runs in progress
HEATUP_KEEP = 20
HEATUP_MIN_RUNS = 3


@dataclass(frozen=True)
class Sample:
    """One recorded state of the thermostat."""

    time: datetime
    heating: bool  # HVAC mode heats (not off / unavailable)
    target: float | None
    current: float | None


@dataclass(frozen=True)
class HeatupRun:
    start: datetime
    minutes: float
    degrees: float


def _slot_index(moment: datetime) -> int:
    return (moment.hour * 60 + moment.minute) // SLOT_MINUTES


def _lasting(samples: Sequence[Sample]) -> list[Sample]:
    """The samples with an unknown target wherever that target held < ``MANUAL_MIN_HOLD``.

    The last target is kept: it is still in force.
    """
    result = list(samples)
    i = 0
    while i < len(samples):
        j = i + 1
        while j < len(samples) and samples[j].target == samples[i].target:
            j += 1
        if j < len(samples) and samples[j].time - samples[i].time < MANUAL_MIN_HOLD:
            for k in range(i, j):
                result[k] = Sample(samples[k].time, samples[k].heating, None, samples[k].current)
        i = j
    return result


def deviation_slots(
    samples: Sequence[Sample],
    start: datetime,
    end: datetime,
    planned: Callable[[datetime], float | None],
) -> list[tuple[datetime, float]]:
    """Mean ``target - planned`` over each complete slot in [start, end) while heating.

    ``samples`` are sorted; each holds until the next one, and nothing is known
    before the first. ``start`` must be on a slot boundary. Pass UTC datetimes:
    aware local-time arithmetic is wall-clock and breaks across DST. Slots in
    which the thermostat heated with a known target for less than half the
    time are skipped, and so are targets that held for less than
    ``MANUAL_MIN_HOLD`` (pass samples until at least that long after ``end``).
    """
    samples = _lasting(samples)
    result: list[tuple[datetime, float]] = []
    slot = start
    k = 0
    while slot + SLOT <= end:
        slot_end = slot + SLOT
        target = planned(slot)
        if target is not None:
            while k + 1 < len(samples) and samples[k + 1].time <= slot:
                k += 1
            known = weighted = 0.0
            j = k
            while j < len(samples) and samples[j].time < slot_end:
                sample = samples[j]
                until = samples[j + 1].time if j + 1 < len(samples) else slot_end
                seconds = (min(until, slot_end) - max(sample.time, slot)).total_seconds()
                if seconds > 0 and sample.heating and sample.target is not None:
                    known += seconds
                    weighted += seconds * (sample.target - target)
                j += 1
            if known >= MIN_KNOWN_SHARE * SLOT.total_seconds():
                result.append((slot, round(weighted / known, 4)))
        slot = slot_end
    return result


def heatup_runs(samples: Sequence[Sample]) -> list[HeatupRun]:
    """Completed heat-ups: target raised by >= 1 degree until the room is within 0.5 of it.

    A run is dropped when the target changes again, heating stops, or it takes
    longer than ``HEATUP_MAX``. Targets that held for less than
    ``MANUAL_MIN_HOLD`` are left out, so a corrected typo does not end a run.
    """
    samples = [
        sample
        for sample, lasting in zip(samples, _lasting(samples), strict=True)
        if lasting.target is not None or sample.target is None
    ]
    runs: list[HeatupRun] = []
    run: tuple[datetime, float, float] | None = None  # start, target, degrees
    previous: float | None = None
    for sample in samples:
        if run is not None:
            start, target, degrees = run
            if not sample.heating or sample.target != target or sample.time - start > HEATUP_MAX:
                run = None
            elif sample.current is not None and sample.current >= target - HEATUP_REACHED:
                runs.append(HeatupRun(start, (sample.time - start).total_seconds() / 60, degrees))
                run = None
        if (
            run is None
            and sample.heating
            and sample.target is not None
            and previous is not None
            and sample.target - previous >= HEATUP_MIN_RISE
            and sample.current is not None
            and sample.target - sample.current >= HEATUP_MIN_RISE
        ):
            run = (sample.time, sample.target, round(sample.target - sample.current, 2))
        if sample.target is not None:
            previous = sample.target
    return runs


class ManualStats:
    """Average deviation from the schedule per weekday (0 = Monday) and slot.

    ``avg`` is the mean deviation in degrees; ``share`` the share of samples in
    which it was manually changed at all.
    """

    def __init__(self, data: dict[str, Any] | None = None) -> None:
        data = data or {}
        self.avg: list[list[float]] = data.get("avg") or _grid(0.0)
        self.share: list[list[float]] = data.get("share") or _grid(0.0)
        self.count: list[list[int]] = data.get("count") or _grid(0)

    def add(self, slot_start: datetime, deviation: float) -> None:
        """Fold in one slot; ``slot_start`` must be in local time."""
        day, slot = slot_start.weekday(), _slot_index(slot_start)
        self.count[day][slot] += 1
        weight = max(1 / self.count[day][slot], 1 / WINDOW)
        deviation = max(-MANUAL_CLIP, min(MANUAL_CLIP, deviation))
        changed = 1.0 if abs(deviation) >= MANUAL_THRESHOLD else 0.0
        self.avg[day][slot] = round(
            self.avg[day][slot] + weight * (deviation - self.avg[day][slot]), 4
        )
        self.share[day][slot] = round(
            self.share[day][slot] + weight * (changed - self.share[day][slot]), 4
        )

    def reset(self, day: int, slots: Iterable[int]) -> None:
        """Forget slots whose schedule changed (their old deviations no longer apply)."""
        for slot in slots:
            self.avg[day][slot] = self.share[day][slot] = 0.0
            self.count[day][slot] = 0

    def weeks(self) -> int:
        return min(max(max(day) for day in self.count), WINDOW)

    def as_dict(self) -> dict[str, Any]:
        return {"avg": self.avg, "share": self.share, "count": self.count}


class HeatupStats:
    """The latest heat-up runs of a thermostat."""

    def __init__(self, data: dict[str, Any] | None = None) -> None:
        data = data or {}
        self.runs: list[HeatupRun] = [
            HeatupRun(datetime.fromisoformat(r["start"]), r["minutes"], r["degrees"])
            for r in data.get("runs", [])
        ]

    def add(self, runs: Iterable[HeatupRun]) -> None:
        """Add new runs; runs already known (overlapping history windows) are skipped."""
        known = {run.start for run in self.runs}
        self.runs.extend(run for run in runs if run.start not in known)
        self.runs.sort(key=lambda run: run.start)
        del self.runs[:-HEATUP_KEEP]

    def minutes_per_degree(self) -> float | None:
        """Median heat-up rate, or None with fewer than ``HEATUP_MIN_RUNS`` runs."""
        if len(self.runs) < HEATUP_MIN_RUNS:
            return None
        return round(median(run.minutes / run.degrees for run in self.runs), 1)

    def as_dict(self) -> dict[str, Any]:
        return {
            "runs": [
                {
                    "start": run.start.isoformat(),
                    "minutes": round(run.minutes, 1),
                    "degrees": run.degrees,
                }
                for run in self.runs
            ]
        }


class ThermostatStats:
    """Everything collected for one thermostat, as stored."""

    def __init__(self, data: dict[str, Any] | None = None) -> None:
        data = data or {}
        current = data.get("version") == STATS_VERSION
        # Older manual statistics (and the suggestions made from them) are dropped,
        # not rebuilt: the history may come from before the schedule was enabled.
        self.manual = ManualStats(data.get("manual") if current else None)
        self.heatup = HeatupStats(data.get("heatup"))
        last = data.get("last_sample")
        self.last_sample: datetime | None = datetime.fromisoformat(last) if last else None
        # Schedule suggestions: queue, dismissed keys, last analysis, quiet period.
        self.suggestions: dict[str, Any] = data.get("suggestions") or {}
        if not current:
            self.suggestions.pop("queue", None)
            self.suggestions.pop("ai_queue", None)

    def as_dict(self) -> dict[str, Any]:
        return {
            "version": STATS_VERSION,
            "manual": self.manual.as_dict(),
            "heatup": self.heatup.as_dict(),
            "last_sample": self.last_sample.isoformat() if self.last_sample else None,
            "suggestions": self.suggestions,
        }


def _grid(value: Any) -> list[list[Any]]:
    return [[value] * SLOTS_PER_DAY for _ in range(7)]
