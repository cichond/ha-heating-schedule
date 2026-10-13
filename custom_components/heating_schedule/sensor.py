"""Sensor with the target temperature the schedule asks for right now."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import HeatingScheduleConfigEntry
from .const import (
    ATTR_NEXT_CHANGE,
    ATTR_NEXT_TEMPERATURE,
)
from .entity import ScheduleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HeatingScheduleConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([ScheduledTemperatureSensor(entry.runtime_data, "scheduled_temperature")])


class ScheduledTemperatureSensor(ScheduleEntity, SensorEntity):
    """Recorded, so planned and actual temperatures can be compared later."""

    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1

    @property
    def native_unit_of_measurement(self) -> str:
        return self.hass.config.units.temperature_unit

    @property
    def native_value(self) -> float | None:
        return self.controller.slot.temp if self.controller.slot else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        slot = self.controller.slot
        return {
            ATTR_NEXT_CHANGE: slot.next_change.isoformat() if slot and slot.next_change else None,
            ATTR_NEXT_TEMPERATURE: slot.next_temp if slot else None,
        }
