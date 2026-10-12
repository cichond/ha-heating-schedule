"""Constants for the Heating Schedule integration."""

from __future__ import annotations

DOMAIN = "heating_schedule"

CONF_CLIMATE_ENTITY = "climate_entity"

STORAGE_KEY = DOMAIN
STORAGE_VERSION = 1

FRONTEND_URL_BASE = "/heating_schedule_static"
CARD_FILENAME = "heating-schedule-card.js"

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
CONF_EMPTY_SETBACK = "empty_setback"
CONF_EMPTY_DELAY = "empty_delay"
CONF_AWAY_ENTITIES = "away_entities"
CONF_AWAY_TEMPERATURE = "away_temperature"
CONF_AWAY_DELAY = "away_delay"

DEFAULT_EMPTY_SETBACK = 0.0
DEFAULT_EMPTY_DELAY = 30
DEFAULT_AWAY_DELAY = 30

PROFILE_STORAGE_KEY = f"{DOMAIN}.profile"
PROFILE_BACKFILL_DAYS = 14

REASON_SCHEDULE = "schedule"
REASON_EMPTY = "empty"
REASON_AWAY = "away"

ATTR_EFFECTIVE_TEMPERATURE = "effective_temperature"
ATTR_REASON = "reason"
