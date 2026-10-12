"""Websocket commands used by the sidebar panel."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
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
    events = []
    while "success" not in (message := await client.receive_json(timeout=5)):
        events.append(message["event"])  # updates may arrive before the result
    assert message["success"]
    await hass.async_block_till_done()

    assert entry.title == "Biuro"
    assert entry.options["presence_entities"] == ["binary_sensor.desk"]
    occupancy = er.async_get(hass).async_get_entity_id(
        "binary_sensor", DOMAIN, f"{entry.entry_id}_occupancy"
    )
    assert hass.states.get(occupancy).state == "on"

    # The subscription follows the reloaded controller.
    for _ in range(10):
        if events and events[-1]["title"] == "Biuro":
            break
        events.append((await client.receive_json(timeout=5))["event"])
    event = events[-1]
    assert event["title"] == "Biuro"
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


async def test_clearing_presence_removes_its_data(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    entry = await _setup(hass)
    hass.states.async_set("binary_sensor.desk", "on")
    hass.config_entries.async_update_entry(entry, options={"presence_entities": ["binary_sensor.desk"]})
    await hass.async_block_till_done()
    registry = er.async_get(hass)
    unique_id = f"{entry.entry_id}_occupancy"
    assert registry.async_get_entity_id("binary_sensor", DOMAIN, unique_id)

    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/configure", "entity_id": CLIMATE, "presence_entities": []}
    )
    while "success" not in (message := await client.receive_json(timeout=5)):
        pass
    assert message["success"]
    await hass.async_block_till_done()

    assert registry.async_get_entity_id("binary_sensor", DOMAIN, unique_id) is None
    await client.send_json_auto_id({"type": f"{DOMAIN}/get", "entity_id": CLIMATE})
    info = (await client.receive_json())["result"]
    assert info["occupancy_entity"] is None
    assert info["profile"] is None
    assert entry.entry_id not in entry.runtime_data._store._profiles
