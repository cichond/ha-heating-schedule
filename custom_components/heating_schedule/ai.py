"""Schedule proposals from the AI Task integration (``ai_task.generate_data``).

The AI only proposes a week; everything it returns goes through
``suggest.validate_week`` and the usual suggestion thresholds, and nothing is
applied without the user. Data leaves Home Assistant only when the user asks.
"""

from __future__ import annotations

import json
import logging
import re
from typing import TYPE_CHECKING, Any

from homeassistant.const import ATTR_SUPPORTED_FEATURES, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import area_registry as ar, entity_registry as er, floor_registry as fr

from .profile import DAY_NAMES
from .suggest import Limits, validate_week

if TYPE_CHECKING:
    from .controller import ScheduleController

_LOGGER = logging.getLogger(__name__)

AI_DOMAIN = "ai_task"
GENERATE_DATA = 1  # AITaskEntityFeature.GENERATE_DATA
FIELD = "schedule"
MANUAL_HOURLY_SHARE = 0.4


def ai_entity(hass: HomeAssistant) -> str | None:
    """The AI Task entity to use: the preferred one from the settings, else the first one."""
    try:
        from homeassistant.components.ai_task.const import DATA_PREFERENCES

        preferred = getattr(hass.data.get(DATA_PREFERENCES), "gen_data_entity_id", None)
    except ImportError:  # pragma: no cover - older Home Assistant
        preferred = None
    candidates = [preferred] if preferred else []
    candidates += [state.entity_id for state in hass.states.async_all(AI_DOMAIN)]
    for entity_id in candidates:
        state = hass.states.get(entity_id)
        if (
            state is not None
            and state.state != STATE_UNAVAILABLE
            and state.attributes.get(ATTR_SUPPORTED_FEATURES, 0) & GENERATE_DATA
        ):
            return entity_id
    return None


def _room(hass: HomeAssistant, climate_entity: str) -> tuple[str | None, str | None]:
    """Area and floor names of the thermostat (entity area, else device area)."""
    entry = er.async_get(hass).async_get(climate_entity)
    area_id = entry.area_id if entry else None
    if area_id is None and entry and entry.device_id:
        from homeassistant.helpers import device_registry as dr

        device = dr.async_get(hass).async_get(entry.device_id)
        area_id = device.area_id if device else None
    area = ar.async_get(hass).async_get_area(area_id) if area_id else None
    floor = fr.async_get(hass).async_get_floor(area.floor_id) if area and area.floor_id else None
    return (area.name if area else None, floor.name if floor else None)


def _hourly(values: list[float]) -> list[float]:
    return [round(sum(values[h * 4 : h * 4 + 4]) / 4, 2) for h in range(24)]


def build_instructions(controller: ScheduleController, *, full: bool) -> str:
    """The prompt: room, limits, schedule, occupancy, manual changes and heat-up time."""
    hass = controller.hass
    state = hass.states.get(controller.climate_entity)
    name = state.name if state else controller.entry.title
    area, floor = _room(hass, controller.climate_entity)
    limits = controller.limits()
    rate = controller.stats.heatup.minutes_per_degree()

    occupancy = "no occupancy data"
    if controller.profile is not None and controller.profile.weeks():
        occupancy = json.dumps(
            {day: _hourly(controller.profile.avg[i]) for i, day in enumerate(DAY_NAMES)}
        )
    manual = controller.stats.manual
    changes: dict[str, dict[str, float]] = {}
    if controller.enabled and manual.weeks():
        for i, day in enumerate(DAY_NAMES):
            for hour in range(24):
                slots = range(hour * 4, hour * 4 + 4)
                if sum(manual.share[i][s] for s in slots) / 4 >= MANUAL_HOURLY_SHARE:
                    avg = sum(manual.avg[i][s] for s in slots) / 4
                    changes.setdefault(day, {})[f"{hour:02d}:00"] = round(avg, 1)

    task = (
        "The room has no real schedule yet. Propose a sensible week for this kind of room."
        if full
        else "Only change what is clearly worth it (moves of at least 30 minutes or changes of "
        "at least 1 degree); keep everything else exactly as it is."
    )
    return "\n".join(
        [
            "You plan the weekly heating schedule of one room in a home.",
            "Goal: warm when people are in the room (start early enough to heat up before they "
            "arrive) and save energy when it is empty. Saving energy matters most, but people "
            "must not come into a cold room.",
            f'Thermostat: "{name}". Area: "{area or "unknown"}". Floor: "{floor or "unknown"}". '
            "The names may be in Polish; infer the type of room (bedroom, bathroom, office, "
            "living room, ...) and its usual needs.",
            f"Thermostat limits: min {limits['min']}, max {limits['max']}, step {limits['step']}.",
            "Heat-up time: "
            + (f"about {rate} minutes per degree." if rate else "unknown (floor heating is slow)."),
            f"Current schedule: {json.dumps(controller.days)}",
            "Typical occupancy per weekday and hour (0 = always empty, 1 = always occupied): "
            + occupancy,
            "Manual changes (average degrees people set above (+) or below (-) the schedule, "
            "only hours where they do it often): " + (json.dumps(changes) if changes else "none"),
            task,
            f'Answer in the field "{FIELD}" with the whole week as JSON: '
            '{"mon": [{"time": "HH:MM", "temp": number}, ...], ..., "sun": [...]}. '
            'Every day starts at "00:00"; times are multiples of 15 minutes; at most 6 points '
            "per day; temperatures within the limits and multiples of the step.",
        ]
    )


def parse_answer(answer: Any, limits: Limits) -> dict[str, list[dict[str, Any]]] | None:
    """The week from the AI's answer (JSON text, possibly in a code fence)."""
    if isinstance(answer, str):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", answer.strip())
        try:
            answer = json.loads(text)
        except ValueError:
            return None
    return validate_week(answer, limits)


async def async_propose_week(
    controller: ScheduleController, *, full: bool
) -> dict[str, list[dict[str, Any]]]:
    """Ask the AI for a week; raises HomeAssistantError when there is no usable answer."""
    hass = controller.hass
    if (entity_id := ai_entity(hass)) is None:
        raise HomeAssistantError("No AI Task entity is available")
    response = await hass.services.async_call(
        AI_DOMAIN,
        "generate_data",
        {
            "entity_id": entity_id,
            "task_name": f"Heating schedule for {controller.entry.title}",
            "instructions": build_instructions(controller, full=full),
            "structure": {
                FIELD: {
                    "description": "The week as JSON, mon..sun, each a list of {time, temp}.",
                    "required": True,
                    "selector": {"text": {"multiline": True}},
                }
            },
        },
        blocking=True,
        return_response=True,
    )
    data = (response or {}).get("data")
    answer = data.get(FIELD) if isinstance(data, dict) else data
    limits = controller.limits()
    week = parse_answer(answer, Limits(limits["step"] or 0.5, limits["min"], limits["max"]))
    if week is None:
        _LOGGER.warning("Unusable AI answer for %s: %.300s", controller.climate_entity, answer)
        raise HomeAssistantError("The AI answer was not a usable schedule")
    return week
