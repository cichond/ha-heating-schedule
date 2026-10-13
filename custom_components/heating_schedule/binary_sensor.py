"""Combined room presence (any of the configured presence entities)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import HeatingScheduleConfigEntry
from .const import DOMAIN
from .entity import ScheduleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HeatingScheduleConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    if entry.runtime_data.room is not None:
        async_add_entities([OccupancySensor(entry.runtime_data, "occupancy")])
        return
    # No presence entities (any more): remove the stale sensor, so its history is not shown.
    registry = er.async_get(hass)
    if entity_id := registry.async_get_entity_id(
        "binary_sensor", DOMAIN, f"{entry.entry_id}_occupancy"
    ):
        registry.async_remove(entity_id)


class OccupancySensor(ScheduleEntity, BinarySensorEntity):
    """On when any presence entity is present; unknown when none has a known state."""

    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    @property
    def is_on(self) -> bool | None:
        return self.controller.room.present

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"entities": self.controller.presence_entities}
