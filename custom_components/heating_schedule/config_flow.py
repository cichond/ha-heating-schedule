"""Config flow: one entry per thermostat; options: presence."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
)
import voluptuous as vol

from .const import (
    CONF_CLIMATE_ENTITY,
    CONF_PRESENCE_ENTITIES,
    DOMAIN,
)

PRESENCE_DOMAINS = ["binary_sensor", "person", "device_tracker", "input_boolean", "switch", "light"]


class HeatingScheduleConfigFlow(ConfigFlow, domain=DOMAIN):
    """Pick the thermostat to schedule."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return HeatingScheduleOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return await self._async_create(user_input[CONF_CLIMATE_ENTITY])
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_CLIMATE_ENTITY): EntitySelector(
                        EntitySelectorConfig(domain="climate")
                    )
                }
            ),
        )

    async def async_step_import(self, import_data: dict[str, Any]) -> ConfigFlowResult:
        """Created by the ``import_scheduler`` service."""
        return await self._async_create(import_data[CONF_CLIMATE_ENTITY])

    async def _async_create(self, climate_entity: str) -> ConfigFlowResult:
        await self.async_set_unique_id(climate_entity)
        self._abort_if_unique_id_configured()
        state = self.hass.states.get(climate_entity)
        title = state.name if state else climate_entity
        return self.async_create_entry(title=title, data={CONF_CLIMATE_ENTITY: climate_entity})


class HeatingScheduleOptionsFlow(OptionsFlow):
    """Presence entities (shown on the card; they do not change the temperature)."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PRESENCE_ENTITIES, default=options.get(CONF_PRESENCE_ENTITIES, [])
                ): EntitySelector(EntitySelectorConfig(domain=PRESENCE_DOMAINS, multiple=True)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
