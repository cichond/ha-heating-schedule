"""Constants for the Heating Schedule integration."""

from __future__ import annotations

DOMAIN = "heating_schedule"

CONF_CLIMATE_ENTITY = "climate_entity"

STORAGE_KEY = DOMAIN
STORAGE_VERSION = 1

FRONTEND_URL_BASE = "/heating_schedule_static"
CARD_FILENAME = "heating-schedule-card.js"
PANEL_URL = "heating-schedule"
PANEL_ICON = "mdi:radiator"


def signal_updated(climate_entity: str) -> str:
    """Dispatcher signal sent when the schedule of ``climate_entity`` changes."""
    return f"{DOMAIN}_updated_{climate_entity}"


DEFAULT_TEMPERATURE = 20.0
DEFAULT_STEP = 0.5

SERVICE_SET_SCHEDULE = "set_schedule"
SERVICE_IMPORT_SCHEDULER = "import_scheduler"

ATTR_SCHEDULE = "schedule"
ATTR_ENABLED = "enabled"
ATTR_OVERWRITE = "overwrite"
ATTR_NEXT_CHANGE = "next_change"
ATTR_NEXT_TEMPERATURE = "next_temperature"

# Options (per thermostat)
CONF_PRESENCE_ENTITIES = "presence_entities"

PROFILE_STORAGE_KEY = f"{DOMAIN}.profile"
PROFILE_BACKFILL_DAYS = 14
