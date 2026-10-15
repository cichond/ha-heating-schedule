// Schedule model on the card side. Mirrors custom_components/heating_schedule/schedule.py.
// A day is a list of points sorted by time; the first point is at 00:00 and each one
// holds until the next. Here times are minutes after midnight (Pt.m).

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];

export interface SchedulePoint {
  time: string;
  temp: number;
}
export type Week = Record<Day, SchedulePoint[]>;

export interface Pt {
  m: number;
  t: number;
}

export const DAY_MIN = 24 * 60;
export const TIME_STEP = 15;

export function parseTime(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function toPts(day: SchedulePoint[]): Pt[] {
  return day.map((p) => ({ m: parseTime(p.time), t: p.temp }));
}

export function fromPts(pts: Pt[]): SchedulePoint[] {
  return pts.map((p) => ({ time: formatTime(p.m), temp: p.t }));
}

export function snap(value: number, step: number): number {
  return Math.round(Math.round(value / step) * step * 100) / 100;
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

export function segmentEnd(pts: Pt[], i: number): number {
  return i + 1 < pts.length ? pts[i + 1].m : DAY_MIN;
}

/** 344 -> "5 h 44 min", 40 -> "40 min". */
export function formatDuration(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  return h ? `${h} h ${total % 60} min` : `${total} min`;
}

export function tempAt(pts: Pt[], minute: number): number {
  let t = pts[0].t;
  for (const p of pts) {
    if (p.m > minute) break;
    t = p.t;
  }
  return t;
}

/** New temperature of segment i. */
export function setTemp(pts: Pt[], i: number, t: number): Pt[] {
  return pts.map((p, k) => (k === i ? { ...p, t } : p));
}

/** Move the edge where segment i starts (i > 0), kept between its neighbours. */
export function moveEdge(pts: Pt[], i: number, minute: number): Pt[] {
  if (i <= 0 || i >= pts.length) return pts;
  const m = clamp(minute, pts[i - 1].m, segmentEnd(pts, i));
  return pts.map((p, k) => (k === i ? { ...p, m } : p));
}

/** After an edge drag: drop segments that were squeezed to zero length. */
export function dropEmpty(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  pts.forEach((p, k) => {
    if (segmentEnd(pts, k) <= p.m) return; // zero length (or pushed to 24:00)
    if (out.length && out[out.length - 1].m === p.m) out.pop();
    out.push(p);
  });
  if (!out.length) return [{ m: 0, t: pts[pts.length - 1].t }];
  out[0] = { ...out[0], m: 0 };
  return out;
}

/** Split segment i at minute (default: middle). Returns null if there is no room. */
export function splitSegment(pts: Pt[], i: number, minute?: number): Pt[] | null {
  const start = pts[i].m;
  const end = segmentEnd(pts, i);
  const m = snap(minute ?? (start + end) / 2, TIME_STEP);
  if (m <= start || m >= end) return null;
  return [...pts.slice(0, i + 1), { m, t: pts[i].t }, ...pts.slice(i + 1)];
}

/** Remove segment i; the previous one (or, for the first, the next one) takes its time. */
export function removeSegment(pts: Pt[], i: number): Pt[] {
  if (pts.length <= 1) return pts;
  const out = pts.filter((_, k) => k !== i);
  out[0] = { ...out[0], m: 0 };
  return out;
}

/** Monday-first day of a JS date. */
export function dayOf(date: Date): Day {
  return DAYS[(date.getDay() + 6) % 7];
}

export function cloneWeek(week: Week): Week {
  return Object.fromEntries(DAYS.map((d) => [d, week[d].map((p) => ({ ...p }))])) as Week;
}

export function weeksEqual(a: Week, b: Week): boolean {
  return JSON.stringify(DAYS.map((d) => a[d])) === JSON.stringify(DAYS.map((d) => b[d]));
}

const SENSITIVITY_SUFFIXES = ["_deadzone_temperature", "_temperature_delta"];

/** Degrees below and above the target between which the thermostat does not switch. */
export interface Band {
  below: number;
  above: number;
}

/**
 * The thermostat's switching band, read from a `number`/`sensor` entity ending
 * in one of ``SENSITIVITY_SUFFIXES``: named after the thermostat
 * (`climate.x` → `sensor.x_temperature_delta`) or on its device. A
 * `_temperature_delta` is ± around the target; a `_deadzone_temperature` lies
 * below it (heating stops at the target). Undefined when there is none or it
 * has no positive value.
 */
export function sensitivity(
  climate: string,
  states: Record<string, { state: string }>,
  entities: Record<string, { device_id?: string | null }> = {},
): Band | undefined {
  const object = climate.split(".")[1];
  const named = ["number", "sensor"].flatMap((d) =>
    SENSITIVITY_SUFFIXES.map((s) => `${d}.${object}${s}`),
  );
  const device = entities[climate]?.device_id;
  const onDevice = device
    ? Object.keys(entities).filter(
        (id) =>
          entities[id].device_id === device &&
          /^(number|sensor)\./.test(id) &&
          SENSITIVITY_SUFFIXES.some((s) => id.endsWith(s)),
      )
    : [];
  for (const id of [...named, ...onDevice]) {
    const value = Number(states[id]?.state);
    if (states[id]?.state && Number.isFinite(value) && value > 0) {
      return id.endsWith("_deadzone_temperature")
        ? { below: value, above: 0 }
        : { below: value, above: value };
    }
  }
  return undefined;
}

/**
 * The band to draw: each side set in the thermostat's settings wins, an unset
 * side comes from the detected entity (missing there: 0). Undefined when the
 * band is empty.
 */
export function bandOf(
  configured: { below?: number | null; above?: number | null } | undefined,
  detected: Band | undefined,
): Band | undefined {
  const below = configured?.below ?? detected?.below ?? 0;
  const above = configured?.above ?? detected?.above ?? 0;
  return below > 0 || above > 0 ? { below, above } : undefined;
}
