// Schedule suggestions on the card side: types and the one-line descriptions.
// Self-contained (type imports only) so node:test can load it directly.

import type { Day, Week } from "./model";

const ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface Suggestion {
  id: string;
  kind: "shift" | "setback" | "temp";
  days: Day[];
  start: number; // minutes: [start, end) is set to temp
  end: number;
  temp: number;
  params: { from?: number; to?: number; temp?: number; start?: number; end?: number; from_temp?: number };
  source: "data" | "ai";
}

export interface SuggestionTexts {
  days: string[]; // Mo..Su
  workdays: string;
  weekend: string;
  suggest_lower_at: string; // {temp} {to} {from}
  suggest_raise_at: string;
  suggest_setback: string; // {temp} {start} {end}
  suggest_temp: string; // {temp} {from_temp} {start} {end}
}

function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

function tempBefore(week: Week | undefined, day: Day, minute: number): number | undefined {
  const points = week?.[day];
  if (!points?.length) return undefined;
  let temp = points[0].temp;
  for (const p of points) {
    const [h, m] = p.time.split(":").map(Number);
    if (h * 60 + m >= minute) break;
    temp = p.temp;
  }
  return temp;
}

/** "Mon–Fri", "Weekend", "Mo–We", "Mo, Th" or "" for every day. */
export function describeDays(days: Day[], t: SuggestionTexts): string {
  const idx = [...new Set(days)].map((d) => ORDER.indexOf(d)).sort((a, b) => a - b);
  if (idx.length === 7) return "";
  const key = idx.join(",");
  if (key === "0,1,2,3,4") return t.workdays;
  if (key === "5,6") return t.weekend;
  const name = (i: number) => t.days[i];
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (contiguous && idx.length > 2) return `${name(idx[0])}–${name(idx[idx.length - 1])}`;
  return idx.map(name).join(", ");
}

/**
 * One line, without reasons: "Lower to 18° at 16:00 instead of 17:30 (Mon–Fri)".
 * ``week`` is the current schedule, used to tell a lowering from a raising point.
 */
export function describeSuggestion(
  s: Suggestion,
  week: Week | undefined,
  t: SuggestionTexts,
  temp: (value: number) => string,
): string {
  const p = s.params;
  let text: string;
  if (s.kind === "shift") {
    const before = tempBefore(week, s.days[0], p.from ?? s.start);
    const lower = before !== undefined && (p.temp ?? s.temp) < before;
    text = (lower ? t.suggest_lower_at : t.suggest_raise_at)
      .replace("{temp}", temp(p.temp ?? s.temp))
      .replace("{to}", hhmm(p.to ?? s.start))
      .replace("{from}", hhmm(p.from ?? s.end));
  } else if (s.kind === "setback") {
    text = t.suggest_setback
      .replace("{temp}", temp(s.temp))
      .replace("{start}", hhmm(s.start))
      .replace("{end}", hhmm(s.end));
  } else {
    text = t.suggest_temp
      .replace("{temp}", temp(s.temp))
      .replace("{from_temp}", temp(p.from_temp ?? s.temp))
      .replace("{start}", hhmm(s.start))
      .replace("{end}", hhmm(s.end));
  }
  const days = describeDays(s.days, t);
  return days ? `${text} (${days})` : text;
}

/** Where the numbered marker goes on the chart: the moved point, or the start of the change. */
export function markerOf(s: Suggestion): { m: number; t: number } {
  return s.kind === "shift" ? { m: s.params.to ?? s.start, t: s.temp } : { m: s.start, t: s.temp };
}
