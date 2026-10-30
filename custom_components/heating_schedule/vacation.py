"""Holiday mode: every enabled schedule holds one temperature for a while.

One state shared by all thermostats. The schedules themselves are not touched,
and the periods spent on holiday are kept so the statistics and the occupancy
profile can leave them out (holiday days would otherwise teach the suggestions
an empty, cold house).

No Home Assistant imports, so it can be tested in isolation.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from typing import Any

VACATION_TEMP = 18.0
KEEP_PERIODS = 20  # past holidays kept for leaving them out of the statistics

Period = tuple[datetime, datetime | None]  # an open period runs until now


def _parse(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def overlaps(start: datetime, end: datetime, periods: Iterable[Period]) -> bool:
    """[start, end) overlaps one of the periods."""
    return any(p_start < end and (p_end is None or start < p_end) for p_start, p_end in periods)


class Vacation:
    """The holiday state: on/off, its temperature, an optional end and past periods."""

    def __init__(self, data: dict[str, Any] | None = None) -> None:
        data = data or {}
        self.active = bool(data.get("active"))
        self.temp = float(data.get("temp", VACATION_TEMP))
        self.until = _parse(data.get("until"))
        self.since = _parse(data.get("since"))
        periods = (
            (_parse(start), _parse(end)) for start, end in data.get("periods", []) if start and end
        )
        self.periods: list[Period] = [(start, end) for start, end in periods if start and end]
        if self.active and self.since is None:
            self.active = False  # inconsistent: treat as off

    def periods_with_current(self) -> list[Period]:
        """The past periods plus the current one, if any (open-ended)."""
        if self.active and self.since is not None:
            return [*self.periods, (self.since, None)]
        return list(self.periods)

    def start(self, now: datetime) -> None:
        if not self.active:
            self.active = True
            self.since = now

    def stop(self, now: datetime) -> None:
        """End the holiday; the return date is spent."""
        if self.active and self.since is not None and now > self.since:
            self.periods.append((self.since, now))
            del self.periods[:-KEEP_PERIODS]
        self.active = False
        self.since = None
        self.until = None

    def expired(self, now: datetime) -> bool:
        return self.active and self.until is not None and self.until <= now

    def as_dict(self) -> dict[str, Any]:
        return {
            "active": self.active,
            "temp": self.temp,
            "until": self.until.isoformat() if self.until else None,
            "since": self.since.isoformat() if self.since else None,
            "periods": [[start.isoformat(), end.isoformat()] for start, end in self.periods if end],
        }

    def summary(self) -> dict[str, Any]:
        """What the frontend needs (no past periods)."""
        data = self.as_dict()
        del data["periods"]
        return data
