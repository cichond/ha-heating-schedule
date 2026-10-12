"""Persistent storage of schedules (one store for all config entries)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION

SAVE_DELAY = 1


class ScheduleStore:
    """Schedules keyed by config entry id: ``{"enabled": bool, "days": {...}}``."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self._data = data.get("thermostats", {})

    def get(self, entry_id: str) -> dict[str, Any] | None:
        return self._data.get(entry_id)

    def set(self, entry_id: str, item: dict[str, Any]) -> None:
        self._data[entry_id] = item
        self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    def remove(self, entry_id: str) -> None:
        if self._data.pop(entry_id, None) is not None:
            self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    def _data_to_save(self) -> dict[str, Any]:
        return {"thermostats": self._data}
