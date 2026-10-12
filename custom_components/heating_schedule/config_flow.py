"""Config flow: one entry per thermostat; options: presence."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
)
import voluptuous as vol

from .const import (
    CONF_AWAY_DELAY,
    CONF_AWAY_ENTITIES,
    CONF_AWAY_TEMPERATURE,
    CONF_CLIMATE_ENTITY,
    CONF_EMPTY_DELAY,
    CONF_EMPTY_SETBACK,
    CONF_PRESENCE_ENTITIES,
    DEFAULT_AWAY_DELAY,
    DEFAULT_EMPTY_DELAY,
    DEFAULT_EMPTY_SETBACK,
    DOMAIN,
)

PRESENCE_DOMAINS = ["binary_sensor", "person", "device_tracker", "input_boolean", "switch"]


def _minutes() -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=1, max=480, step=1, unit_of_measurement="min", mode=NumberSelectorMode.BOX
        )
    )


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
    """Presence entities, empty-room setback and away temperature."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PRESENCE_ENTITIES, default=options.get(CONF_PRESENCE_ENTITIES, [])
                ): EntitySelector(EntitySelectorConfig(domain=PRESENCE_DOMAINS, multiple=True)),
                vol.Optional(
                    CONF_EMPTY_SETBACK,
                    default=options.get(CONF_EMPTY_SETBACK, DEFAULT_EMPTY_SETBACK),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=0,
                        max=10,
                        step=0.5,
                        unit_of_measurement="°C",
                        mode=NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_EMPTY_DELAY, default=options.get(CONF_EMPTY_DELAY, DEFAULT_EMPTY_DELAY)
                ): _minutes(),
                vol.Optional(
                    CONF_AWAY_ENTITIES, default=options.get(CONF_AWAY_ENTITIES, [])
                ): EntitySelector(EntitySelectorConfig(domain=PRESENCE_DOMAINS, multiple=True)),
                vol.Optional(
                    CONF_AWAY_TEMPERATURE,
                    description={"suggested_value": options.get(CONF_AWAY_TEMPERATURE)},
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=5,
                        max=30,
                        step=0.5,
                        unit_of_measurement="°C",
                        mode=NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(
                    CONF_AWAY_DELAY, default=options.get(CONF_AWAY_DELAY, DEFAULT_AWAY_DELAY)
                ): _minutes(),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
