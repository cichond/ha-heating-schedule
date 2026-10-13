"""Persistent storage of schedules, occupancy profiles and statistics (shared by all entries)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import PROFILE_STORAGE_KEY, STATS_STORAGE_KEY, STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 1
PROFILE_SAVE_DELAY = 60


class ScheduleStore:
    """Schedules keyed by config entry id: ``{"enabled": bool, "days": {...}}``.

    Occupancy profiles and thermostat statistics live in separate files, as
    they change every hour.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._profile_store: Store[dict[str, Any]] = Store(hass, 1, PROFILE_STORAGE_KEY)
        self._stats_store: Store[dict[str, Any]] = Store(hass, 1, STATS_STORAGE_KEY)
        self._data: dict[str, dict[str, Any]] = {}
        self._profiles: dict[str, dict[str, Any]] = {}
        self._stats: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._data = data.get("thermostats", {})
        profiles = await self._profile_store.async_load() or {}
        self._profiles = profiles.get("profiles", {})
        stats = await self._stats_store.async_load() or {}
        self._stats = stats.get("thermostats", {})

    def get(self, entry_id: str) -> dict[str, Any] | None:
        return self._data.get(entry_id)

    def set(self, entry_id: str, item: dict[str, Any]) -> None:
        self._data[entry_id] = item
        self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    def get_profile(self, entry_id: str) -> dict[str, Any] | None:
        return self._profiles.get(entry_id)

    def set_profile(self, entry_id: str, profile: dict[str, Any]) -> None:
        self._profiles[entry_id] = profile
        self._profile_store.async_delay_save(self._profiles_to_save, PROFILE_SAVE_DELAY)

    def remove_profile(self, entry_id: str) -> None:
        if self._profiles.pop(entry_id, None) is not None:
            self._profile_store.async_delay_save(self._profiles_to_save, SAVE_DELAY)

    def get_stats(self, entry_id: str) -> dict[str, Any] | None:
        return self._stats.get(entry_id)

    def set_stats(self, entry_id: str, stats: dict[str, Any]) -> None:
        self._stats[entry_id] = stats
        self._stats_store.async_delay_save(self._stats_to_save, PROFILE_SAVE_DELAY)

    def remove(self, entry_id: str) -> None:
        if self._data.pop(entry_id, None) is not None:
            self._store.async_delay_save(self._data_to_save, SAVE_DELAY)
        if self._profiles.pop(entry_id, None) is not None:
            self._profile_store.async_delay_save(self._profiles_to_save, SAVE_DELAY)
        if self._stats.pop(entry_id, None) is not None:
            self._stats_store.async_delay_save(self._stats_to_save, SAVE_DELAY)

    def _data_to_save(self) -> dict[str, Any]:
        return {"thermostats": self._data}

    def _profiles_to_save(self) -> dict[str, Any]:
        return {"profiles": self._profiles}

    def _stats_to_save(self) -> dict[str, Any]:
        return {"thermostats": self._stats}
