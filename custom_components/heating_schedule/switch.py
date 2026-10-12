"""Switch turning the schedule of a thermostat on and off."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import HeatingScheduleConfigEntry
from .entity import ScheduleEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HeatingScheduleConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([ScheduleSwitch(entry.runtime_data, "enabled")])


class ScheduleSwitch(ScheduleEntity, SwitchEntity):
    """On: the schedule sets the target temperature."""

    @property
    def is_on(self) -> bool:
        return self.controller.enabled

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.controller.async_update(enabled=True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.controller.async_update(enabled=False)
