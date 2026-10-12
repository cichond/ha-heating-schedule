"""Websocket commands used by the sidebar panel."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.heating_schedule.const import CONF_CLIMATE_ENTITY, DOMAIN

CLIMATE = "climate.office"
ATTRS = {"temperature": 21, "min_temp": 5, "max_temp": 30, "target_temp_step": 0.5}


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    hass.states.async_set(CLIMATE, "heat", ATTRS)
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_CLIMATE_ENTITY: CLIMATE}, title="Office")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_configure_survives_reload(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    entry = await _setup(hass)
    hass.states.async_set("binary_sensor.desk", "on")
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": f"{DOMAIN}/subscribe", "entity_id": CLIMATE})
    assert (await client.receive_json())["success"]
    first = await client.receive_json()
    assert first["event"]["title"] == "Office"

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/configure",
            "entity_id": CLIMATE,
            "title": "Biuro",
            "presence_entities": ["binary_sensor.desk"],
            "empty_setback": 1.5,
            "empty_delay": 20,
        }
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()

    assert entry.title == "Biuro"
    assert entry.options["presence_entities"] == ["binary_sensor.desk"]
    assert hass.states.get("binary_sensor.office_occupancy").state == "on"

    # The subscription follows the reloaded controller.
    while True:
        event = (await client.receive_json())["event"]
        if event["title"] == "Biuro":
            break
    assert event["presence"]["entities"] == ["binary_sensor.desk"]
    assert event["presence"]["setback"] == 1.5
    assert event["presence"]["delay"] == 20


async def test_add_and_remove(hass: HomeAssistant, hass_ws_client: WebSocketGenerator) -> None:
    await _setup(hass)
    hass.states.async_set("climate.kitchen", "heat", {**ATTRS, "friendly_name": "Kitchen"})
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": f"{DOMAIN}/add", "entity_id": "climate.kitchen"})
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()

    await client.send_json_auto_id({"type": f"{DOMAIN}/add", "entity_id": "climate.kitchen"})
    response = await client.receive_json()
    assert response["error"]["code"] == "already_configured"

    await client.send_json_auto_id({"type": f"{DOMAIN}/list"})
    listed = {e["climate_entity"]: e["title"] for e in (await client.receive_json())["result"]}
    assert listed == {CLIMATE: "Office", "climate.kitchen": "Kitchen"}

    await client.send_json_auto_id({"type": f"{DOMAIN}/remove", "entity_id": "climate.kitchen"})
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    assert [e.data[CONF_CLIMATE_ENTITY] for e in hass.config_entries.async_entries(DOMAIN)] == [
        CLIMATE
    ]
