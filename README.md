# Heating Schedule

Weekly target-temperature schedules for Home Assistant thermostats, with a Lovelace card
that shows each schedule as a temperature-over-time chart and lets you edit it by dragging.

- One config entry per thermostat (`climate.*`).
- Each day of the week is a list of change points (`HH:MM` → temperature); the first is at 00:00.
- The schedule sets **only the target temperature**. The HVAC mode (off/heat) is left to you.
- A manual change holds until the next point that changes the temperature.
- Temperatures are rounded to the thermostat's `target_temp_step` and clamped to `min_temp`/`max_temp`.
- If the thermostat is unavailable at a change point, the schedule is applied when it comes back.

## Installation (HACS)

1. HACS → ⋮ → *Custom repositories* → `https://github.com/cichond/ha-heating-schedule`, category *Integration*.
2. Install **Heating Schedule** and restart Home Assistant.
3. Settings → Devices & services → *Add integration* → **Heating Schedule**, pick a thermostat.
   Repeat for each thermostat.

The card is served by the integration and loaded automatically; no dashboard resource is needed.

## Entities

Attached to the thermostat's device:

| Entity | Meaning |
|---|---|
| `switch.<thermostat>_schedule` | schedule on/off |
| `sensor.<thermostat>_scheduled_temperature` | target temperature the schedule asks for now; attributes `next_change`, `next_temperature` |

## Card

```yaml
type: custom:heating-schedule-card
entity: climate.bedroom_thermostat
# name: Bedroom         # optional
# height: 220           # optional, px
```

- Day tabs (Mon…Sun). The chart shows the schedule (step line), and for the most recent
  occurrence of that day the measured temperature and the actual target from history,
  plus a "now" marker on today.
- **Edit**: drag a level up/down (snaps to the thermostat step), drag a boundary sideways
  (snaps to 15 min; drag it onto a neighbour to remove a segment), double-click a level to split it,
  tap a level for −/+, ‹/› and split/remove buttons. *Copy day to…* copies the day to other days.
  Changes are applied on *Save*.

## Services

- `heating_schedule.set_schedule` — `entity_id` (climate), optional `schedule` (all seven days) and `enabled`.
- `heating_schedule.import_scheduler` — create schedules from
  [Scheduler component](https://github.com/nielsfaber/scheduler-component) switches that call
  `climate.set_temperature`. Default: all `switch.schedule_*`. Returns what was imported.
  Disable or remove the Scheduler schedules afterwards so the two do not compete.
  The service exists once the integration is loaded, i.e. after the first thermostat has been added.

## Websocket API

`heating_schedule/list`, `heating_schedule/get`, `heating_schedule/save` (`entity_id`, `days?`, `enabled?`),
`heating_schedule/subscribe` (`entity_id`; sends the schedule now and after every change).

## Development

```sh
npm ci
npm run build          # -> custom_components/heating_schedule/frontend/heating-schedule-card.js (committed)
npm test               # card model tests
node frontend/dev/screenshot.mjs out.png "dark" 380   # render frontend/dev/index.html with a mock hass (Edge)
pip install -r requirements_test.txt && pytest       # Linux/macOS; HA does not build on Windows
```

Release: bump `version` in `manifest.json` and `package.json`, commit, push tag `vX.Y.Z`.
