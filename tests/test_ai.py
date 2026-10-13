"""AI suggestions through a mocked ai_task.generate_data."""

from __future__ import annotations

import json

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.heating_schedule.const import CONF_CLIMATE_ENTITY, DOMAIN
from custom_components.heating_schedule.schedule import DAYS

CLIMATE = "climate.office"
ATTRS = {"temperature": 18, "min_temp": 5, "max_temp": 30, "target_temp_step": 1}
OFFICE = [
    {"time": "00:00", "temp": 18},
    {"time": "08:30", "temp": 21},
    {"time": "17:30", "temp": 18},
    {"time": "20:30", "temp": 20},
]
PROPOSED = [
    {"time": "00:00", "temp": 18},
    {"time": "08:30", "temp": 21},
    {"time": "16:00", "temp": 18},
    {"time": "20:30", "temp": 20},
]


def _mock_ai(hass: HomeAssistant, answer: str) -> list[ServiceCall]:
    hass.states.async_set("ai_task.fake", "unknown", {"supported_features": 1})
    calls: list[ServiceCall] = []

    async def generate(call: ServiceCall) -> dict:
        calls.append(call)
        return {"conversation_id": "x", "data": {"schedule": answer}}

    hass.services.async_register(
        "ai_task", "generate_data", generate, supports_response=SupportsResponse.ONLY
    )
    return calls


async def _setup(hass: HomeAssistant, entity: str = CLIMATE) -> MockConfigEntry:
    hass.states.async_set(entity, "heat", {**ATTRS, "friendly_name": "Biuro Termostat"})
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_CLIMATE_ENTITY: entity}, title="Biuro")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await entry.runtime_data.async_update(days={day: OFFICE for day in DAYS})
    return entry


async def _ask(client, full: bool = False) -> dict:
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion/ask_ai", "entity_id": CLIMATE, "full": full}
    )
    return await client.receive_json()


async def test_ask_ai(hass: HomeAssistant, hass_ws_client: WebSocketGenerator) -> None:
    async_mock_service(hass, "climate", "set_temperature")
    entry = await _setup(hass)
    client = await hass_ws_client(hass)

    assert (await _ask(client))["error"]["code"] == "ai_unavailable"
    assert entry.runtime_data.as_dict()["ai_available"] is False

    week = {day: PROPOSED for day in DAYS}
    calls = _mock_ai(hass, "```json\n" + json.dumps(week) + "\n```")
    response = await _ask(client)
    assert response["success"], response
    assert response["result"]["count"] == 1
    shown = response["result"]["info"]["suggestions"]
    assert [(s["source"], s["start"], s["end"], s["temp"]) for s in shown] == [
        ("ai", 960, 1050, 18.0)
    ]
    instructions = calls[0].data["instructions"]
    assert '"Biuro Termostat"' in instructions
    assert "no occupancy data" in instructions
    assert calls[0].data["entity_id"] == "ai_task.fake"

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/suggestion/apply",
            "entity_id": CLIMATE,
            "suggestion_id": shown[0]["id"],
        }
    )
    assert (await client.receive_json())["success"]
    assert entry.runtime_data.days["mon"][2] == {"time": "16:00", "temp": 18.0}


async def test_unusable_answer(hass: HomeAssistant, hass_ws_client: WebSocketGenerator) -> None:
    async_mock_service(hass, "climate", "set_temperature")
    await _setup(hass)
    _mock_ai(hass, "Sorry, I cannot help with that.")
    client = await hass_ws_client(hass)
    assert (await _ask(client))["error"]["code"] == "ai_failed"


async def test_new_thermostat_with_ai(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    async_mock_service(hass, "climate", "set_temperature")
    await _setup(hass)
    week = {day: PROPOSED for day in DAYS}
    _mock_ai(hass, json.dumps(week))
    hass.states.async_set("climate.kitchen", "heat", ATTRS)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/add", "entity_id": "climate.kitchen", "init": "ai"}
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()

    kitchen = next(
        e.runtime_data
        for e in hass.config_entries.async_loaded_entries(DOMAIN)
        if e.runtime_data.climate_entity == "climate.kitchen"
    )
    full = kitchen.as_dict()["ai_full"]
    assert full["week"]["mon"] == [{"time": p["time"], "temp": float(p["temp"])} for p in PROPOSED]
    # The thermostat keeps its empty schedule until the proposal is applied.
    assert len(kitchen.days["mon"]) == 1

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/suggestion/apply",
            "entity_id": "climate.kitchen",
            "suggestion_id": full["id"],
        }
    )
    assert (await client.receive_json())["success"]
    assert kitchen.days["mon"][2] == {"time": "16:00", "temp": 18.0}
    assert kitchen.as_dict()["ai_full"] is None
