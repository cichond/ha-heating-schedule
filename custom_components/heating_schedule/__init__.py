"""Heating Schedule: weekly target temperature schedules for thermostats."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_TEMPERATURE, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .const import (
    CARD_FILENAME,
    CONF_CLIMATE_ENTITY,
    DEFAULT_TEMPERATURE,
    DOMAIN,
    FRONTEND_URL_BASE,
    PANEL_ICON,
    PANEL_URL,
)
from .controller import ScheduleController
from .schedule import default_schedule
from .services import async_register_services
from .store import ScheduleStore
from .websocket import async_register_websocket

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR, Platform.SWITCH]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type HeatingScheduleConfigEntry = ConfigEntry[ScheduleController]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up storage, the panel, the websocket API and services."""
    store = ScheduleStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = store

    integration = await async_get_integration(hass, DOMAIN)
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL_BASE, str(Path(__file__).parent / "frontend"), cache_headers=False
            )
        ]
    )
    module_url = f"{FRONTEND_URL_BASE}/{CARD_FILENAME}?v={integration.version}"
    # Sidebar panel with the cards of all thermostats; there is no dashboard card.
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name="heating-schedule-panel",
        sidebar_title="Ogrzewanie" if hass.config.language.startswith("pl") else "Heating",
        sidebar_icon=PANEL_ICON,
        module_url=module_url,
        require_admin=False,
    )

    async_register_websocket(hass)
    async_register_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HeatingScheduleConfigEntry) -> bool:
    """Start the schedule of one thermostat."""
    store: ScheduleStore = hass.data[DOMAIN]
    if store.get(entry.entry_id) is None:
        state = hass.states.get(entry.data[CONF_CLIMATE_ENTITY])
        temp = state.attributes.get(ATTR_TEMPERATURE) if state else None
        store.set(
            entry.entry_id,
            {"enabled": True, "days": default_schedule(temp or DEFAULT_TEMPERATURE)},
        )

    controller = ScheduleController(hass, entry, store)
    entry.runtime_data = controller
    await controller.async_start()
    entry.async_on_unload(controller.async_stop)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_options_updated(hass: HomeAssistant, entry: HeatingScheduleConfigEntry) -> None:
    """Presence options changed: rebuild the controller and entities."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: HeatingScheduleConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: HeatingScheduleConfigEntry) -> None:
    """Drop the stored schedule together with the entry."""
    store: ScheduleStore | None = hass.data.get(DOMAIN)
    if store is not None:
        store.remove(entry.entry_id)
