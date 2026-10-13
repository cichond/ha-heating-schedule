"""Thermostat statistics (manual deviations, heat-up runs) built from recorder history."""

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
from custom_components.heating_schedule.schedule import DAYS

CLIMATE = "climate.office"
ATTRS = {"min_temp": 5, "max_temp": 30, "target_temp_step": 0.5}
WEEK = {day: [{"time": "00:00", "temp": 21}] for day in DAYS}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(recorder_mock, enable_custom_integrations):
    """Override of the conftest fixture: the recorder must start before hass."""
    return


async def _record(hass: HomeAssistant, freezer: FrozenDateTimeFactory, when, target, current):
    freezer.move_to(when)
    hass.states.async_set(
        CLIMATE, "heat", {**ATTRS, "temperature": target, "current_temperature": current}
    )
    await async_wait_recording_done(hass)


async def _setup(hass: HomeAssistant, enabled: bool) -> MockConfigEntry:
    async_mock_service(hass, "climate", "set_temperature")
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_CLIMATE_ENTITY: CLIMATE}, title="Office")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.services.async_call(
        DOMAIN,
        "set_schedule",
        {"entity_id": CLIMATE, "schedule": WEEK, "enabled": enabled},
        blocking=True,
    )
    await hass.async_block_till_done()
    return entry


async def test_stats_from_history(
    recorder_mock, hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("Europe/Warsaw")
    start = dt_util.now().replace(hour=5, minute=45, second=0, microsecond=0)
    await _record(hass, freezer, start, 19, 19)  # below the schedule (21): -2
    await _record(hass, freezer, start + timedelta(minutes=15), 21, 19)  # heat-up starts
    await _record(hass, freezer, start + timedelta(minutes=55), 21, 20.5)  # reached: 40 min
    await _record(hass, freezer, start + timedelta(minutes=75), 23, 21)  # turned up: +2
    freezer.move_to(start + timedelta(minutes=105, seconds=30))

    entry = await _setup(hass, enabled=True)
    controller = entry.runtime_data
    await controller.async_update_stats()

    day, first = start.weekday(), start.hour * 4 + 3  # slot of 5:45
    assert controller.stats.manual.avg[day][first : first + 7] == [
        -2.0,  # 5:45
        0.0,  # 6:00
        0.0,
        0.0,
        0.0,
        2.0,  # 7:00
        2.0,  # 7:15
    ]
    assert controller.stats.manual.share[day][first + 1] == 0.0
    assert controller.stats.manual.share[day][first + 5] == 1.0
    runs = controller.stats.heatup.runs
    assert [(run.minutes, run.degrees) for run in runs] == [(40.0, 2.0)]
    assert controller.stats.last_sample == dt_util.as_utc(start + timedelta(minutes=105))

    # A second pass over the same window adds nothing.
    await controller.async_update_stats()
    assert controller.stats.manual.count[day][first] == 1
    assert len(controller.stats.heatup.runs) == 1

    stats = controller.as_dict()["stats"]
    assert stats == {"manual_weeks": 1, "heatup_runs": 1, "heatup_minutes_per_degree": None}

    # Changing the schedule forgets the deviations it makes obsolete.
    await hass.services.async_call(
        DOMAIN,
        "set_schedule",
        {"entity_id": CLIMATE, "schedule": {**WEEK, DAYS[day]: [{"time": "00:00", "temp": 23}]}},
        blocking=True,
    )
    assert controller.stats.manual.count[day][first] == 0


async def test_no_deviations_while_disabled(
    recorder_mock, hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await hass.config.async_set_time_zone("Europe/Warsaw")
    start = dt_util.now().replace(hour=5, minute=45, second=0, microsecond=0)
    await _record(hass, freezer, start, 19, 19)
    await _record(hass, freezer, start + timedelta(minutes=15), 21, 19)
    await _record(hass, freezer, start + timedelta(minutes=55), 21, 20.5)
    freezer.move_to(start + timedelta(minutes=75, seconds=30))

    entry = await _setup(hass, enabled=False)
    controller = entry.runtime_data
    await controller.async_update_stats()

    assert controller.stats.manual.weeks() == 0
    assert len(controller.stats.heatup.runs) == 1  # heat-up is measured anyway
