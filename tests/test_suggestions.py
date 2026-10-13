"""Schedule suggestions: weekly analysis, apply and dismiss over the websocket."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
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


def _office(slot: int) -> float:
    hour = slot / 4
    return 0.85 if 9 <= hour < 16 or hour >= 21 else 0.03


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    hass.states.async_set(CLIMATE, "heat", ATTRS)
    hass.states.async_set("binary_sensor.desk", "off")
    async_mock_service(hass, "climate", "set_temperature")
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_CLIMATE_ENTITY: CLIMATE},
        options={"presence_entities": ["binary_sensor.desk"]},
        title="Office",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    controller = entry.runtime_data
    await controller.async_update(days={day: OFFICE for day in DAYS})
    # Four weeks of the office occupancy from the design.
    controller.profile.avg = [[_office(slot) for slot in range(96)] for _ in range(7)]
    controller.profile.count = [[4] * 96 for _ in range(7)]
    controller.stats.suggestions.pop("quiet_until")  # set by the schedule change above
    return entry


async def test_analyze_apply_dismiss(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> None:
    entry = await _setup(hass)
    controller = entry.runtime_data
    assert controller.async_analyze()
    assert not controller.async_analyze()  # weekly

    shown = controller.as_dict()["suggestions"]
    assert [(s["kind"], s["params"]["from"], s["params"]["to"]) for s in shown] == [
        ("shift", 1050, 960),  # lower at 16:00 instead of 17:30
        ("shift", 510, 540),  # raise at 9:00 instead of 8:30
    ]
    assert shown[0]["days"] == list(DAYS)

    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion/apply", "entity_id": CLIMATE, "id": shown[0]["id"]}
    )
    response = await client.receive_json()
    assert response["success"]
    assert controller.days["mon"][2] == {"time": "16:00", "temp": 18.0}
    # The other suggestion is still valid; the third one moves up.
    after = response["result"]["suggestions"]
    assert after[0]["id"] == shown[1]["id"]
    assert len(after) == 2
    # Quiet period after a change: no new analysis.
    assert "quiet_until" in controller.stats.suggestions
    controller.stats.suggestions.pop("last_analysis")
    assert not controller.async_analyze()

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion/dismiss", "entity_id": CLIMATE, "id": shown[1]["id"]}
    )
    assert (await client.receive_json())["success"]
    assert shown[1]["id"] not in [s["id"] for s in controller.as_dict()["suggestions"]]
    assert set(controller.stats.suggestions["dismissed"]) == {
        f"{day}:shift:510:later" for day in DAYS
    }

    # A forced analysis keeps the dismissal.
    await hass.services.async_call(DOMAIN, "analyze", {"entity_id": CLIMATE}, blocking=True)
    assert shown[1]["id"] not in [s["id"] for s in controller.as_dict()["suggestions"]]

    # An applied suggestion is gone; applying it again fails.
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion/apply", "entity_id": CLIMATE, "id": shown[0]["id"]}
    )
    assert (await client.receive_json())["error"]["code"] == "not_found"


async def test_editing_the_schedule_hides_outdated_suggestions(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    controller = entry.runtime_data
    controller.async_analyze()
    first = controller.as_dict()["suggestions"][0]

    edited = [*OFFICE[:2], {"time": "16:30", "temp": 18}, OFFICE[3]]
    await controller.async_update(days={day: edited for day in DAYS})
    assert first["id"] not in [s["id"] for s in controller.as_dict()["suggestions"]]
