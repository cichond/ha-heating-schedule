import assert from "node:assert/strict";
import { test } from "node:test";

import { describeDays, describeSuggestion, markerOf, type Suggestion } from "../src/suggestions.ts";

const PL = {
  days: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
  workdays: "Pn–Pt",
  weekend: "Weekend",
  suggest_lower_at: "Obniżka do {temp} o {to} zamiast {from}",
  suggest_raise_at: "{temp} od {to} zamiast {from}",
  suggest_setback: "Obniżka do {temp} w godz. {start}–{end}",
  suggest_temp: "{temp} zamiast {from_temp} w godz. {start}–{end}",
};
const ALL = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const office = [
  { time: "00:00", temp: 18 },
  { time: "08:30", temp: 21 },
  { time: "17:30", temp: 18 },
  { time: "20:30", temp: 20 },
];
const WEEK = Object.fromEntries(ALL.map((d) => [d, office])) as any;
const deg = (v: number) => `${String(v).replace(".", ",")}°`;

function shift(from: number, to: number, temp: number, days = [...ALL]): Suggestion {
  return {
    id: "x",
    kind: "shift",
    days,
    start: Math.min(from, to),
    end: Math.max(from, to),
    temp,
    params: { from, to, temp },
    source: "data",
  };
}

test("describeDays", () => {
  assert.equal(describeDays([...ALL], PL), "");
  assert.equal(describeDays(["mon", "tue", "wed", "thu", "fri"], PL), "Pn–Pt");
  assert.equal(describeDays(["sun", "sat"], PL), "Weekend");
  assert.equal(describeDays(["mon", "tue", "wed"], PL), "Pn–Śr");
  assert.equal(describeDays(["mon", "thu"], PL), "Pn, Cz");
  assert.equal(describeDays(["tue"], PL), "Wt");
});

test("describeSuggestion: lowering and raising points", () => {
  assert.equal(
    describeSuggestion(shift(1050, 960, 18), WEEK, PL, deg),
    "Obniżka do 18° o 16:00 zamiast 17:30",
  );
  assert.equal(
    describeSuggestion(shift(510, 540, 21, ["mon", "tue", "wed", "thu", "fri"]), WEEK, PL, deg),
    "21° od 9:00 zamiast 8:30 (Pn–Pt)",
  );
});

test("describeSuggestion: setback and temperature", () => {
  const setback: Suggestion = {
    ...shift(0, 0, 18),
    kind: "setback",
    start: 540,
    end: 840,
    params: { start: 540, end: 840, temp: 18, from_temp: 21 },
  };
  assert.equal(describeSuggestion(setback, WEEK, PL, deg), "Obniżka do 18° w godz. 9:00–14:00");
  const temp: Suggestion = {
    ...shift(0, 0, 22.5),
    kind: "temp",
    days: ["sat"],
    start: 840,
    end: 1080,
    params: { start: 840, end: 1080, temp: 22.5, from_temp: 21 },
  };
  assert.equal(describeSuggestion(temp, WEEK, PL, deg), "22,5° zamiast 21° w godz. 14:00–18:00 (So)");
});

test("markerOf", () => {
  assert.deepEqual(markerOf(shift(1050, 960, 18)), { m: 960, t: 18 });
});
