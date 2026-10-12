"""Base entity attached to the thermostat's device."""

from __future__ import annotations

from homeassistant.helpers.device import async_entity_id_to_device
from homeassistant.helpers.entity import Entity

from .controller import ScheduleController

# Names for thermostats without a device (no translated entity name then).
_FALLBACK_NAMES = {"enabled": "schedule", "scheduled_temperature": "scheduled temperature"}


class ScheduleEntity(Entity):
    """Shares the thermostat's device, so it lands in the same area."""

    _attr_should_poll = False

    def __init__(self, controller: ScheduleController, key: str) -> None:
        self.controller = controller
        self._attr_unique_id = f"{controller.entry.entry_id}_{key}"
        self._attr_translation_key = key
        device = async_entity_id_to_device(controller.hass, controller.climate_entity)
        if device is not None:
            self.device_entry = device
            self._attr_has_entity_name = True
        else:
            self._attr_has_entity_name = False
            self._attr_name = f"{controller.entry.title} {_FALLBACK_NAMES[key]}"

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.controller.async_add_listener(self.async_write_ha_state))
