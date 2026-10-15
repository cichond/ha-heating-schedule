"""Websocket API used by the card."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect
import voluptuous as vol

from .const import (
    BAND_KEYS,
    BAND_MAX,
    CONF_CLIMATE_ENTITY,
    CONF_PRESENCE_ENTITIES,
    DOMAIN,
    signal_updated,
)
from .controller import ScheduleController, async_find_controller, async_find_entry
from .schedule import ScheduleError

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_configure)
    websocket_api.async_register_command(hass, ws_suggestion_apply)
    websocket_api.async_register_command(hass, ws_suggestion_dismiss)
    websocket_api.async_register_command(hass, ws_suggestion_ask_ai)
    websocket_api.async_register_command(hass, ws_add)
    websocket_api.async_register_command(hass, ws_remove)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list"})
@callback
def ws_list(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    connection.send_result(
        msg["id"],
        [
            {"entry_id": entry.entry_id, "title": entry.title, **entry.data}
            for entry in hass.config_entries.async_entries(DOMAIN)
            if not entry.disabled_by
        ],
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/get", vol.Required("entity_id"): cv.entity_id}
)
@callback
def ws_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (controller := async_find_controller(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    connection.send_result(msg["id"], controller.as_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/save",
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("days"): dict,
        vol.Optional("enabled"): bool,
    }
)
@websocket_api.async_response
async def ws_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (controller := async_find_controller(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    try:
        await controller.async_update(days=msg.get("days"), enabled=msg.get("enabled"))
    except ScheduleError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    connection.send_result(msg["id"], controller.as_dict())


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/subscribe", vol.Required("entity_id"): cv.entity_id}
)
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Send the schedule now and after every change.

    Follows the thermostat, not one controller, so it survives entry reloads
    (options or title changed).
    """
    entity_id = msg["entity_id"]
    if async_find_entry(hass, entity_id) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {entity_id}")
        return

    @callback
    def _forward(controller: ScheduleController | None) -> None:
        if controller is not None:
            connection.send_message(websocket_api.event_message(msg["id"], controller.as_dict()))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, signal_updated(entity_id), _forward
    )
    connection.send_result(msg["id"])
    _forward(async_find_controller(hass, entity_id))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/configure",
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("title"): vol.All(cv.string, vol.Length(min=1)),
        vol.Optional(CONF_PRESENCE_ENTITIES): [cv.entity_id],
        # None clears a band side (it then comes from the thermostat's entity again).
        **{
            vol.Optional(key): vol.Any(
                None, vol.All(vol.Coerce(float), vol.Range(min=0, max=BAND_MAX))
            )
            for key in BAND_KEYS
        },
    }
)
@callback
def ws_configure(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Rename a thermostat or change its options (the entry reloads)."""
    if (entry := async_find_entry(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    # Rebuilt from the known keys, which also drops options of removed features.
    options: dict[str, Any] = {
        CONF_PRESENCE_ENTITIES: msg.get(
            CONF_PRESENCE_ENTITIES, entry.options.get(CONF_PRESENCE_ENTITIES, [])
        )
    }
    for key in BAND_KEYS:
        value = msg[key] if key in msg else entry.options.get(key)
        if value is not None:
            options[key] = value
    hass.config_entries.async_update_entry(
        entry, title=msg.get("title", entry.title), options=options
    )
    connection.send_result(msg["id"])


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/add",
        vol.Required("entity_id"): cv.entity_domain("climate"),
        vol.Optional("init", default="empty"): vol.In(["empty", "ai"]),
    }
)
@websocket_api.async_response
async def ws_add(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add a schedule for a thermostat (same as the config flow)."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}, data={CONF_CLIMATE_ENTITY: msg["entity_id"]}
    )
    if result["type"] is not FlowResultType.CREATE_ENTRY:
        connection.send_error(msg["id"], result.get("reason", "failed"), str(result.get("reason")))
        return
    if msg["init"] == "ai":
        hass.async_create_task(_async_init_with_ai(hass, msg["entity_id"]))
    connection.send_result(msg["id"], {"entry_id": result["result"].entry_id})


async def _async_init_with_ai(hass: HomeAssistant, climate_entity: str) -> None:
    """Propose a whole week for a new thermostat once its entry is loaded."""
    for _ in range(60):
        if (controller := async_find_controller(hass, climate_entity)) is not None:
            break
        await asyncio.sleep(0.5)
    else:
        return
    try:
        await controller.async_ask_ai(full=True)
    except HomeAssistantError as err:
        _LOGGER.warning("AI schedule for %s failed: %s", climate_entity, err)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/remove", vol.Required("entity_id"): cv.entity_id}
)
@websocket_api.async_response
async def ws_remove(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove the schedule (config entry) of a thermostat."""
    if (entry := async_find_entry(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    await hass.config_entries.async_remove(entry.entry_id)
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/suggestion/apply",
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("suggestion_id"): str,
    }
)
@websocket_api.async_response
async def ws_suggestion_apply(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Apply a schedule suggestion (anyone with access to the panel)."""
    if (controller := async_find_controller(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    if not await controller.async_apply_suggestion(msg["suggestion_id"]):
        connection.send_error(msg["id"], "not_found", "The suggestion no longer applies")
        return
    connection.send_result(msg["id"], controller.as_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/suggestion/dismiss",
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("suggestion_id"): str,
    }
)
@callback
def ws_suggestion_dismiss(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Dismiss a schedule suggestion; it does not come back for a few weeks."""
    if (controller := async_find_controller(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    if not controller.async_dismiss_suggestion(msg["suggestion_id"]):
        connection.send_error(msg["id"], "not_found", "Unknown suggestion")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/suggestion/ask_ai",
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("full", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_suggestion_ask_ai(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Ask the AI for suggestions (anyone with access to the panel)."""
    if (controller := async_find_controller(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    if not controller.ai_available:
        connection.send_error(msg["id"], "ai_unavailable", "No AI Task entity is available")
        return
    try:
        count = await controller.async_ask_ai(full=msg["full"])
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "ai_failed", str(err))
        return
    connection.send_result(msg["id"], {"count": count, "info": controller.as_dict()})
