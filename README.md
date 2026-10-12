# Heating Schedule

Weekly target-temperature schedules for Home Assistant thermostats, with a Lovelace card
that shows each schedule as a temperature-over-time chart and lets you edit it by dragging.

- One config entry per thermostat (`climate.*`).
- Each day of the week is a list of change points (`HH:MM` → temperature); the first is at 00:00.
- The schedule sets **only the target temperature**. The HVAC mode (off/heat) is left to you.
- A manual change holds until the next point that changes the temperature.
- Temperatures are rounded to the thermostat's `target_temp_step` and clamped to `min_temp`/`max_temp`.
- If the thermostat is unavailable at a change point, the schedule is applied when it comes back.

## Presence (options)

Sidebar panel → cog on the thermostat's card (or Settings → Devices & services → Heating Schedule →
thermostat → *Configure*):

| Option | Meaning |
|---|---|
| Room presence entities | Any number of `binary_sensor` / `person` / `device_tracker` / `input_boolean` / `switch`. The room is occupied when **any** of them is `on` (person/device tracker: `home`). |
| Empty room setback, delay | Lower the target by this many degrees after the room has been empty for the delay. `0` = off. Useful with fast heating; slow floor heating cannot follow it. |

Unknown or unavailable states never count as absence. The effective target is always the schedule,
possibly lowered while the room is empty; a manual change holds until that target changes again.

With room presence entities the integration also:

- adds `binary_sensor.<thermostat>_occupancy` (combined presence; attribute `empty` once the delay passed),
- builds an **occupancy profile**: the share of each 15-minute slot per weekday the room was occupied,
  averaged over about the last eight weeks. It is filled from the recorder (backfilled up to 14 days
  on first start, then hourly) and stored in `.storage/heating_schedule.profile`. Changing the presence
  entities starts a new profile.

The card shades the chart with the typical occupancy of the selected weekday and draws the actual
presence of that day as a strip along the bottom. The scheduled-temperature sensor has the attributes
`effective_temperature` and `reason` (`schedule`, `empty`).

## Installation (HACS)

1. HACS → ⋮ → *Custom repositories* → `https://github.com/cichond/ha-heating-schedule`, category *Integration*.
2. Install **Heating Schedule** and restart Home Assistant.
3. Settings → Devices & services → *Add integration* → **Heating Schedule**, pick a thermostat.
   Repeat for each thermostat.

The card is served by the integration and loaded automatically; no dashboard resource is needed.

## Sidebar panel

The integration adds a **Heating** sidebar panel (`/heating-schedule`, "Ogrzewanie" when Home Assistant
runs in Polish) with the card of every configured thermostat. Everything is configured there:

- **+** in the header adds a thermostat,
- the cog on a card renames it, sets its presence entities and empty-room setback, or removes its schedule.

Adding, renaming and changing presence apply immediately (the entry reloads); no restart is needed.
These actions need an admin user. The same settings are also available under Settings → Devices &
services → Heating Schedule.
