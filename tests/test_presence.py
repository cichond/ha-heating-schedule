"""Presence: empty-room setback, away cap and the options flow."""

from __future__ import annotations

from datetime import datetime, timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.heating_schedule.const import CONF_CLIMATE_ENTITY, DOMAIN
from custom_components.heating_schedule.schedule import DAYS

CLIMATE = "climate.office"
ATTRS = {"temperature": 21, "min_temp": 5, "max_temp": 30, "target_temp_step": 0.5}
WEEK = {day: [{"time": "00:00", "temp": 21}] for day in DAYS}


async def _setup(hass: HomeAssistant, freezer: FrozenDateTimeFactory, options: dict):
    await hass.config.async_set_time_zone("Europe/Warsaw")
    freezer.move_to(datetime(2026, 10, 12, 10, 0, tzinfo=dt_util.get_default_time_zone()))
    hass.states.async_set(CLIMATE, "heat", ATTRS)
    calls = async_mock_service(hass, "climate", "set_temperature")
    entry = MockConfigEntry(
        domain=DOMAIN, data={CONF_CLIMATE_ENTITY: CLIMATE}, options=options, title="Office"
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.services.async_call(
        DOMAIN, "set_schedule", {"entity_id": CLIMATE, "schedule": WEEK}, blocking=True
    )
    await hass.async_block_till_done()
    return entry, calls


def temps(calls) -> list[float]:
    return [c.data["temperature"] for c in calls]


async def test_empty_room_setback(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    hass.states.async_set("binary_sensor.desk", "on")
    hass.states.async_set("binary_sensor.chair", "off")
    _entry, calls = await _setup(
        hass,
        freezer,
        {
            "presence_entities": ["binary_sensor.desk", "binary_sensor.chair"],
            "empty_setback": 2,
            "empty_delay": 30,
        },
    )
    assert hass.states.get("binary_sensor.office_occupancy").state == "on"
    assert calls == []

    hass.states.async_set("binary_sensor.desk", "off")
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.office_occupancy").state == "off"
    assert calls == []  # not yet: delay

    freezer.tick(timedelta(minutes=31))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert temps(calls) == [19]
    sensor = hass.states.get("sensor.office_scheduled_temperature")
    assert sensor.attributes["reason"] == "empty"
    assert sensor.attributes["effective_temperature"] == 19

    hass.states.async_set(CLIMATE, "heat", {**ATTRS, "temperature": 19})
    hass.states.async_set("binary_sensor.chair", "on")
    await hass.async_block_till_done()
    assert temps(calls) == [19, 21]


async def test_unavailable_is_not_absence(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    hass.states.async_set("binary_sensor.desk", "unavailable")
    _entry, calls = await _setup(
        hass,
        freezer,
        {"presence_entities": ["binary_sensor.desk"], "empty_setback": 2, "empty_delay": 5},
    )
    freezer.tick(timedelta(minutes=10))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert calls == []
    assert hass.states.get("binary_sensor.office_occupancy").state == "unknown"


async def test_away_caps_temperature(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    hass.states.async_set("person.a", "home")
    hass.states.async_set("person.b", "not_home")
    _entry, calls = await _setup(
        hass,
        freezer,
        {"away_entities": ["person.a", "person.b"], "away_temperature": 17, "away_delay": 30},
    )
    hass.states.async_set("person.a", "Work")  # a zone other than home counts as away
    await hass.async_block_till_done()
    freezer.tick(timedelta(minutes=31))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert temps(calls) == [17]
    assert hass.states.get("sensor.office_scheduled_temperature").attributes["reason"] == "away"

    hass.states.async_set(CLIMATE, "heat", {**ATTRS, "temperature": 17})
    hass.states.async_set("person.b", "home")
    await hass.async_block_till_done()
    assert temps(calls) == [17, 21]


async def test_options_flow_reloads(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    entry, _calls = await _setup(hass, freezer, {})
    assert hass.states.get("binary_sensor.office_occupancy") is None
    hass.states.async_set("binary_sensor.desk", "on")

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "presence_entities": ["binary_sensor.desk"],
            "empty_setback": 1,
            "empty_delay": 15,
            "away_entities": [],
            "away_delay": 30,
        },
    )
    await hass.async_block_till_done()
    assert result["type"] == "create_entry"
    assert entry.options["presence_entities"] == ["binary_sensor.desk"]
    assert hass.states.get("binary_sensor.office_occupancy").state == "on"
