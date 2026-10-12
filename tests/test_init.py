"""Integration tests (need pytest-homeassistant-custom-component)."""

from __future__ import annotations

from datetime import datetime, timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.heating_schedule.const import CONF_CLIMATE_ENTITY, DOMAIN
from custom_components.heating_schedule.schedule import DAYS

CLIMATE = "climate.office"
ATTRS = {"temperature": 18, "min_temp": 5, "max_temp": 30, "target_temp_step": 1}


def week(points: list[dict]) -> dict:
    return {day: points for day in DAYS}


@pytest.fixture
async def setup(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    await hass.config.async_set_time_zone("Europe/Warsaw")
    # Monday 2026-10-12 07:00 local
    freezer.move_to(datetime(2026, 10, 12, 7, 0, tzinfo=dt_util.get_default_time_zone()))
    hass.states.async_set(CLIMATE, "off", ATTRS)
    calls = async_mock_service(hass, "climate", "set_temperature")
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_CLIMATE_ENTITY: CLIMATE}, title="Office")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry, calls


async def test_default_schedule_does_nothing(hass: HomeAssistant, setup) -> None:
    _entry, calls = setup
    assert calls == []
    assert hass.states.get("sensor.office_scheduled_temperature").state == "18.0"
    assert hass.states.get("switch.office_schedule").state == "on"


async def test_set_schedule_applies_and_follows_points(
    hass: HomeAssistant, setup, freezer: FrozenDateTimeFactory
) -> None:
    _entry, calls = setup
    await hass.services.async_call(
        DOMAIN,
        "set_schedule",
        {
            "entity_id": CLIMATE,
            "schedule": week(
                [
                    {"time": "00:00", "temp": 18},
                    {"time": "06:00", "temp": 21.4},
                    {"time": "08:30", "temp": 17},
                ]
            ),
        },
        blocking=True,
    )
    await hass.async_block_till_done()
    # Slot in force changed from 18 to 21.4 -> applied now, rounded to step 1
    assert [c.data["temperature"] for c in calls] == [21]
    sensor = hass.states.get("sensor.office_scheduled_temperature")
    assert sensor.state == "21.4"
    assert sensor.attributes["next_temperature"] == 17

    hass.states.async_set(CLIMATE, "off", {**ATTRS, "temperature": 21})
    freezer.tick(timedelta(hours=1, minutes=30))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert [c.data["temperature"] for c in calls] == [21, 17]


async def test_switch_off_stops_schedule(
    hass: HomeAssistant, setup, freezer: FrozenDateTimeFactory
) -> None:
    _entry, calls = setup
    await hass.services.async_call(
        "switch", "turn_off", {"entity_id": "switch.office_schedule"}, blocking=True
    )
    await hass.services.async_call(
        DOMAIN,
        "set_schedule",
        {"entity_id": CLIMATE, "schedule": week([{"time": "00:00", "temp": 22}])},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert calls == []
    await hass.services.async_call(
        "switch", "turn_on", {"entity_id": "switch.office_schedule"}, blocking=True
    )
    await hass.async_block_till_done()
    assert [c.data["temperature"] for c in calls] == [22]


async def test_unavailable_thermostat_applied_when_back(hass: HomeAssistant, setup) -> None:
    _entry, calls = setup
    hass.states.async_set(CLIMATE, "unavailable", {})
    await hass.services.async_call(
        DOMAIN,
        "set_schedule",
        {"entity_id": CLIMATE, "schedule": week([{"time": "00:00", "temp": 22}])},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert calls == []
    hass.states.async_set(CLIMATE, "off", ATTRS)
    await hass.async_block_till_done()
    assert [c.data["temperature"] for c in calls] == [22]


async def test_import_scheduler(hass: HomeAssistant, setup) -> None:
    _entry, calls = setup
    hass.states.async_set("climate.bedroom", "off", ATTRS)
    hass.states.async_set(
        "switch.schedule_bedroom_workdays",
        "on",
        {
            "weekdays": ["mon", "tue", "wed", "thu", "fri"],
            "timeslots": ["00:00 - 06:00", "06:00 - 00:00"],
            "entities": ["climate.bedroom"],
            "actions": [
                {"service": "climate.set_temperature", "data": {"temperature": 19}},
                {"service": "climate.set_temperature", "data": {"temperature": 21}},
            ],
        },
    )
    lights = {"actions": [{"service": "light.turn_on"}]}
    hass.states.async_set("switch.schedule_lights", "on", lights)
    result = await hass.services.async_call(
        DOMAIN, "import_scheduler", {}, blocking=True, return_response=True
    )
    await hass.async_block_till_done()
    assert result["imported"] == {"climate.bedroom": list(DAYS[:5])}
    assert "switch.schedule_lights" in result["skipped"]
    assert len(hass.config_entries.async_entries(DOMAIN)) == 2
    # Monday 07:00 -> 21; the bedroom had 18 -> applied
    assert [c.data for c in calls] == [{"entity_id": "climate.bedroom", "temperature": 21}]


async def test_websocket(hass: HomeAssistant, setup, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/subscribe", "entity_id": CLIMATE})
    assert (await client.receive_json())["success"]
    event = await client.receive_json()
    assert event["event"]["days"]["mon"] == [{"time": "00:00", "temp": 18.0}]
    assert event["event"]["limits"] == {"min": 5, "max": 30, "step": 1}

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/save", "entity_id": CLIMATE, "days": {"mon": []}}
    )
    response = await client.receive_json()
    assert not response["success"]
    assert response["error"]["code"] == "invalid_format"

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/save", "entity_id": CLIMATE, "enabled": False}
    )
    event = await client.receive_json()
    assert event["event"]["enabled"] is False
    assert (await client.receive_json())["success"]
