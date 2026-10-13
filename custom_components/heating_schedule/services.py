"""Services: set a schedule, import schedules from the Scheduler component."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import SOURCE_IMPORT
from homeassistant.const import ATTR_ENTITY_ID, ATTR_TEMPERATURE
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import (
    ATTR_ENABLED,
    ATTR_OVERWRITE,
    ATTR_SCHEDULE,
    CONF_CLIMATE_ENTITY,
    DOMAIN,
    SERVICE_ANALYZE,
    SERVICE_IMPORT_SCHEDULER,
    SERVICE_SET_SCHEDULE,
)
from .controller import ScheduleController, async_find_controller
from .schedule import DAYS, ScheduleError, from_scheduler

_LOGGER = logging.getLogger(__name__)

ANALYZE_SCHEMA = vol.Schema({vol.Required(ATTR_ENTITY_ID): cv.entity_domain("climate")})

SET_SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_domain("climate"),
        vol.Optional(ATTR_SCHEDULE): dict,
        vol.Optional(ATTR_ENABLED): cv.boolean,
    }
)

IMPORT_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_OVERWRITE, default=True): cv.boolean,
    }
)


@callback
def async_register_services(hass: HomeAssistant) -> None:
    async def set_schedule(call: ServiceCall) -> None:
        controller = _controller(hass, call.data[ATTR_ENTITY_ID])
        try:
            await controller.async_update(
                days=call.data.get(ATTR_SCHEDULE), enabled=call.data.get(ATTR_ENABLED)
            )
        except ScheduleError as err:
            raise ServiceValidationError(str(err)) from err

    async def import_scheduler(call: ServiceCall) -> ServiceResponse:
        return await _async_import_scheduler(
            hass, call.data.get(ATTR_ENTITY_ID), call.data[ATTR_OVERWRITE]
        )

    async def analyze(call: ServiceCall) -> None:
        _controller(hass, call.data[ATTR_ENTITY_ID]).async_analyze(force=True)

    hass.services.async_register(DOMAIN, SERVICE_SET_SCHEDULE, set_schedule, SET_SCHEDULE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_ANALYZE, analyze, ANALYZE_SCHEMA)
    hass.services.async_register(
        DOMAIN,
        SERVICE_IMPORT_SCHEDULER,
        import_scheduler,
        IMPORT_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )


def _controller(hass: HomeAssistant, climate_entity: str) -> ScheduleController:
    if (controller := async_find_controller(hass, climate_entity)) is None:
        raise ServiceValidationError(f"No schedule for {climate_entity}")
    return controller


def _temperature(action: dict[str, Any]) -> float | None:
    """Temperature of a Scheduler action, or None if it is not a set_temperature."""
    if action.get("service") != "climate.set_temperature":
        return None
    data = action.get("data") or action.get("service_data") or {}
    return data.get(ATTR_TEMPERATURE)


async def _async_import_scheduler(
    hass: HomeAssistant, switches: list[str] | None, overwrite: bool
) -> dict[str, Any]:
    """Merge Scheduler switches into one week per thermostat."""
    weeks: dict[str, dict[str, list[dict[str, Any]]]] = {}
    enabled: dict[str, bool] = {}
    skipped: list[str] = []

    for state in hass.states.async_all("switch"):
        attrs = state.attributes
        if switches is not None:
            if state.entity_id not in switches:
                continue
        elif not state.entity_id.startswith("switch.schedule_"):
            continue
        temps = [_temperature(action) for action in attrs.get("actions", [])]
        climates = [e for e in attrs.get("entities", []) if e.startswith("climate.")]
        if not temps or None in temps or not climates or not attrs.get("timeslots"):
            skipped.append(state.entity_id)
            continue
        try:
            days = from_scheduler(attrs["weekdays"], attrs["timeslots"], temps)
        except (ScheduleError, ValueError) as err:
            _LOGGER.warning("Skipping %s: %s", state.entity_id, err)
            skipped.append(state.entity_id)
            continue
        for climate in climates:
            weeks.setdefault(climate, {}).update(days)
            enabled[climate] = enabled.get(climate, False) or state.state == "on"

    imported: dict[str, list[str]] = {}
    for climate, days in weeks.items():
        controller = async_find_controller(hass, climate)
        if controller is None:
            await hass.config_entries.flow.async_init(
                DOMAIN, context={"source": SOURCE_IMPORT}, data={CONF_CLIMATE_ENTITY: climate}
            )
            controller = async_find_controller(hass, climate)
            if controller is None:
                skipped.append(climate)
                continue
        elif not overwrite:
            skipped.append(climate)
            continue
        week = {day: days.get(day, controller.days[day]) for day in DAYS}
        await controller.async_update(days=week, enabled=enabled[climate])
        imported[climate] = [day for day in DAYS if day in days]

    return {"imported": imported, "skipped": skipped}
