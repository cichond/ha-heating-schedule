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

// -- smoothing of the measured temperature ------------------------------------

/**
 * Key points of a sampled series for a smooth curve. Thermostats report rounded
 * values (often whole degrees), so a change from a to b means the real value
 * crossed (a + b) / 2 at that moment. A plateau keeps its value except within
 * ``ramp`` minutes of a change (at most half of the plateau), where the curve
 * bends towards the crossing. ``series`` is [minute, value] sorted by time; the
 * last value holds until ``end``.
 */
export function smoothPoints(
  series: [number, number][],
  end: number,
  ramp = 60,
): [number, number][] {
  const plateaus: { from: number; to: number; v: number }[] = [];
  for (const [m, v] of series) {
    const last = plateaus[plateaus.length - 1];
    if (last && last.v === v) continue;
    if (last) last.to = m;
    plateaus.push({ from: m, to: end, v });
  }
  if (!plateaus.length) return [];
  const out: [number, number][] = [[plateaus[0].from, plateaus[0].v]];
  const lastIndex = plateaus.length - 1;
  plateaus.forEach((p, i) => {
    if (i > 0) out.push([p.from, (plateaus[i - 1].v + p.v) / 2]);
    const half = (p.to - p.from) / 2;
    const r = Math.min(ramp, half);
    // flat part: from (start + r) to (end - r); the outer ends of the series stay flat
    const a = i === 0 ? p.from : p.from + r;
    const b = i === lastIndex ? p.to : p.to - r;
    if (a > out[out.length - 1][0]) out.push([a, p.v]);
    if (b > a) out.push([b, p.v]);
  });
  // drop points that share a time with the previous one
  return out.filter((p, i) => i === 0 || p[0] > out[i - 1][0]);
}

/**
 * Monotone cubic (Fritsch–Carlson) through ``pts``: no overshoot above or below
 * the data. Returns one cubic Bézier per segment as [c1x, c1y, c2x, c2y, x, y].
 */
export function monotoneCurve(pts: [number, number][]): number[][] {
  const n = pts.length;
  if (n < 2) return [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  }
  const m: number[] = [d[0]];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  const out: number[][] = [];
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = (x1 - x0) / 3;
    out.push([x0 + h, y0 + m[i] * h, x1 - h, y1 - m[i + 1] * h, x1, y1]);
  }
  return out;
}
