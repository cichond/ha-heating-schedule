# Heating Schedule

Weekly target-temperature schedules for Home Assistant thermostats, with a sidebar panel
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
| Room presence entities | Any number of `binary_sensor` / `person` / `device_tracker` / `input_boolean` / `switch` / `light`. The room is occupied when **any** of them is `on` (person/device tracker: `home`). |

Presence is shown on the card only; it never changes the temperature. Unknown or unavailable states
never count as absence. A manual change of the target holds until the next schedule point.

With room presence entities the integration also:

- adds `binary_sensor.<thermostat>_occupancy` (combined presence),
- builds an **occupancy profile**: the share of each 15-minute slot per weekday the room was occupied,
  averaged over about the last eight weeks. It is filled from the recorder (backfilled up to 14 days
  on first start, then hourly) and stored in `.storage/heating_schedule.profile`. Changing the presence
  entities starts a new profile.

For every thermostat (with or without presence entities) the integration also collects, hourly from the
recorder, statistics for future schedule suggestions, stored in `.storage/heating_schedule.stats`:

- **manual deviations**: per weekday and 15-minute slot, how far the target in force was from the schedule
  (only while the schedule is enabled and the thermostat heats; changing the schedule forgets the
  deviations of the slots it changed),
- **heat-up runs**: how long the room took to reach a target raised by at least 1° (the last 20 runs).

### Schedule suggestions

Once a week the integration derives suggestions from these statistics and the occupancy profile; nothing
is changed until someone applies one:

- **move a point**: raise when people typically arrive (earlier by the measured heat-up time), lower when
  they typically leave,
- **setback**: lower the temperature in a long (≥3 h), typically empty stretch,
- **temperature**: where people keep turning it up or down, move the schedule about 75% of the way.

Only changes of at least 30 minutes or 1° (and the thermostat step) are suggested; the same change on
several weekdays is one suggestion. At most two are shown at a time. Occupancy suggestions need three
weeks of profile, temperature suggestions three weeks of manual deviations. After the schedule changes
there are no new suggestions for two weeks; a dismissed suggestion stays away for four weeks.

On the cards of the sidebar panel each suggestion gets a numbered marker on the chart (the changed range
is outlined) and a line under it with **Apply** / **Dismiss**.

### AI (optional)

With an [AI Task](https://www.home-assistant.io/integrations/ai_task/) entity in Home Assistant (the preferred
one from its settings, else the first), the panel cards get an AI button: the integration sends the room
(thermostat, area and floor names), the schedule, the hourly typical occupancy, frequent manual changes, the
heat-up rate and the thermostat limits to `ai_task.generate_data` and turns the week it proposes into up to
three suggestions (marked with the AI icon; same thresholds and dismissals as above). When adding a
thermostat in the panel you can also choose **Proposed by the AI**: the thermostat starts with an empty
schedule and the proposed week waits on its card for **Apply**. Nothing is sent to the AI unless you ask.

Under the chart the card draws two strips: the actual presence of that day and, below it in a darker
green, the typical occupancy of the selected weekday (stronger = more often occupied).

## Installation (HACS)

1. HACS → ⋮ → *Custom repositories* → `https://github.com/cichond/ha-heating-schedule`, category *Integration*.
2. Install **Heating Schedule** and restart Home Assistant.
3. Settings → Devices & services → *Add integration* → **Heating Schedule**, pick a thermostat.
   Repeat for each thermostat.

The panel is served by the integration; no dashboard resource is needed. There is no dashboard card
(removed in 0.14.0): the schedules live in the sidebar panel only.

## Sidebar panel

The integration adds a **Heating** sidebar panel (`/heating-schedule`, "Ogrzewanie" when Home Assistant
runs in Polish) with the card of every configured thermostat, grouped by the floor of its area (floors by
level, then rooms by name; thermostats without a floor last). Everything is configured there:

- **+** in the header adds a thermostat,
- the cog on a card renames it, sets its presence entities and sensitivity band, or removes its schedule.

Adding, renaming and changing presence apply immediately (the entry reloads); no restart is needed.
These actions need an admin user. The same settings are also available under Settings → Devices &
services → Heating Schedule.

## Entities

Attached to the thermostat's device:

| Entity | Meaning |
|---|---|
| `switch.<thermostat>_schedule` | schedule on/off |
| `sensor.<thermostat>_scheduled_temperature` | target temperature the schedule asks for now; attributes `next_change`, `next_temperature` |
| `binary_sensor.<thermostat>_occupancy` | only with room presence entities, see above |

## Thermostat cards (in the panel)

- Day tabs (Mon…Sun). The chart shows the schedule (step line), and for the most recent
  occurrence of that day the measured temperature and the actual target from history,
  plus a "now" marker on today. Periods when the thermostat was heating (`hvac_action: heating`) are
  shaded orange, with the total heating time in the legend.
- A band along the schedule shows the thermostat's sensitivity: how far the room may drift before
  heating switches on or off. Set it in the thermostat's settings (sensitivity below / above the
  target). A side left empty is read from a `number`/`sensor` entity ending in
  `_temperature_delta` (± around the target) or `_deadzone_temperature` (below the target only:
  heating starts that far below it and stops at the target), named after the thermostat
  (`climate.x` → `sensor.x_temperature_delta`) or on its device; with neither there is no band.
- Zoom the time axis with the mouse wheel (around the pointer) or a pinch on a phone; drag (mouse),
  scroll sideways or shift+wheel to move a zoomed chart. Double-click or the magnifier button shows the
  whole day again; the zoom stays when switching days.
- Hover the chart (tap on a phone) for a tooltip with the schedule, measured and target temperature
  at that time.
- **Edit**: drag a level up/down (snaps to the thermostat step), drag a boundary sideways
  (snaps to 15 min; drag it onto a neighbour to remove a segment), double-click a level to split it,
  tap a level for −/+, ‹/› and split/remove buttons. *Copy day to…* copies the day to other days.
  Changes are applied on *Save*.

## Services

- `heating_schedule.set_schedule` — `entity_id` (climate), optional `schedule` (all seven days) and `enabled`.
- `heating_schedule.analyze` — `entity_id`: compute suggestions now (normally weekly).
- `heating_schedule.import_scheduler` — create schedules from
  [Scheduler component](https://github.com/nielsfaber/scheduler-component) switches that call
  `climate.set_temperature`. Default: all `switch.schedule_*`. Returns what was imported.
  Disable or remove the Scheduler schedules afterwards so the two do not compete.
  The service exists once the integration is loaded, i.e. after the first thermostat has been added.

## Websocket API

`heating_schedule/list`, `heating_schedule/get`, `heating_schedule/save` (`entity_id`, `days?`, `enabled?`),
`heating_schedule/subscribe` (`entity_id`; sends the schedule now and after every change),
`heating_schedule/suggestion/apply` and `heating_schedule/suggestion/dismiss` (`entity_id`, `suggestion_id`),
`heating_schedule/suggestion/ask_ai` (`entity_id`, `full?`).
Admin only: `heating_schedule/add` (`entity_id`, `init?`: `empty` / `ai`), `heating_schedule/configure` (`entity_id`, `title?`,
`presence_entities?`), `heating_schedule/remove` (`entity_id`).

## Development

```sh
npm ci
npm run build          # -> custom_components/heating_schedule/frontend/heating-schedule-card.js (committed)
npm test               # card model tests
node frontend/dev/screenshot.mjs out.png "dark" 380   # render frontend/dev/index.html with a mock hass (Edge)
pip install -r requirements_test.txt && pytest       # Linux/macOS; HA does not build on Windows
```

Release: bump `version` in `manifest.json` and `package.json`, commit, push tag `vX.Y.Z`.
