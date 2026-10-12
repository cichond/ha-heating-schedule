"""Occupancy profile built from recorder history."""

from __future__ import annotations

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)

from custom_components.heating_schedule.const import CONF_CLIMATE_ENTITY, DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(recorder_mock, enable_custom_integrations):
    """Override of the conftest fixture: the recorder must start before hass."""
    return


async def test_profile_from_history(
    recorder_mock, hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("Europe/Warsaw")
    start = dt_util.now().replace(hour=8, minute=0, second=0, microsecond=0)
    freezer.move_to(start)
    hass.states.async_set("binary_sensor.desk", "off")
    await async_wait_recording_done(hass)
    freezer.move_to(start + timedelta(minutes=15))
    hass.states.async_set("binary_sensor.desk", "on")
    await async_wait_recording_done(hass)
    freezer.move_to(start + timedelta(minutes=45))
    hass.states.async_set("binary_sensor.desk", "off")
    await async_wait_recording_done(hass)
    freezer.move_to(start + timedelta(hours=1, minutes=5))

    hass.states.async_set("climate.office", "heat", {"temperature": 20})
    async_mock_service(hass, "climate", "set_temperature")
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_CLIMATE_ENTITY: "climate.office"},
        options={"presence_entities": ["binary_sensor.desk"]},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    controller = entry.runtime_data
    await controller.async_update_profile()
    day = start.weekday()
    slot = start.hour * 4
    assert controller.profile.avg[day][slot : slot + 4] == [0.0, 1.0, 1.0, 0.0]
    assert controller.profile.last_sample == start + timedelta(hours=1)

    # payload sent to the card (a websocket client cannot authenticate with frozen time)
    result = controller.as_dict()
    assert result["profile"]["weeks"] == 1
    assert result["presence"]["entities"] == ["binary_sensor.desk"]
    assert result["occupancy_entity"] == "binary_sensor.office_occupancy"
