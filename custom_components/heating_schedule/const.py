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
