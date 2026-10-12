"""Websocket API used by the card."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect
import voluptuous as vol

from .const import (
    CONF_CLIMATE_ENTITY,
    CONF_EMPTY_DELAY,
    CONF_EMPTY_SETBACK,
    CONF_PRESENCE_ENTITIES,
    DOMAIN,
    signal_updated,
)
from .controller import ScheduleController, async_find_controller, async_find_entry
from .schedule import ScheduleError


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_configure)
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
        vol.Optional(CONF_EMPTY_SETBACK): vol.All(vol.Coerce(float), vol.Range(min=0, max=10)),
        vol.Optional(CONF_EMPTY_DELAY): vol.All(vol.Coerce(int), vol.Range(min=1, max=480)),
    }
)
@callback
def ws_configure(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Rename a thermostat or change its presence options (the entry reloads)."""
    if (entry := async_find_entry(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return
    options = dict(entry.options)
    for key in (CONF_PRESENCE_ENTITIES, CONF_EMPTY_SETBACK, CONF_EMPTY_DELAY):
        if key in msg:
            options[key] = msg[key]
    hass.config_entries.async_update_entry(
        entry, title=msg.get("title", entry.title), options=options
    )
    connection.send_result(msg["id"])


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/add", vol.Required("entity_id"): cv.entity_domain("climate")}
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
    connection.send_result(msg["id"], {"entry_id": result["result"].entry_id})


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
