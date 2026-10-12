"""Websocket API used by the card."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import DOMAIN
from .controller import async_find_controller
from .schedule import ScheduleError


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_subscribe)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list"})
@callback
def ws_list(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    connection.send_result(
        msg["id"],
        [
            {"entry_id": entry.entry_id, "title": entry.title, **entry.data}
            for entry in hass.config_entries.async_loaded_entries(DOMAIN)
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
    """Send the schedule now and after every change."""
    if (controller := async_find_controller(hass, msg["entity_id"])) is None:
        connection.send_error(msg["id"], "not_found", f"No schedule for {msg['entity_id']}")
        return

    @callback
    def _forward() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], controller.as_dict()))

    connection.subscriptions[msg["id"]] = controller.async_add_listener(_forward)
    connection.send_result(msg["id"])
    _forward()
