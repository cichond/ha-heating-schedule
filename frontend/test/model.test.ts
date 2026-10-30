import assert from "node:assert/strict";
import { test } from "node:test";

import {
  dayOf,
  dropEmpty,
  formatDuration,
  formatLeft,
  bandOf,
  formatTime,
  sensitivity,
  moveEdge,
  type Pt,
  removeSegment,
  splitSegment,
  tempAt,
  toLocalInput,
  toPts,
  wallMinute,
} from "../src/model.ts";

const day: Pt[] = toPts([
  { time: "00:00", temp: 19 },
  { time: "05:30", temp: 21 },
  { time: "08:30", temp: 19 },
]);

test("formatTime", () => {
  assert.equal(formatTime(330), "05:30");
  assert.equal(formatTime(1440), "24:00");
});

test("tempAt", () => {
  assert.equal(tempAt(day, 0), 19);
  assert.equal(tempAt(day, 330), 21);
  assert.equal(tempAt(day, 1439), 19);
});

test("moveEdge clamps between neighbours", () => {
  assert.equal(moveEdge(day, 1, 600)[1].m, 510);
  assert.equal(moveEdge(day, 1, -5)[1].m, 0);
  assert.equal(moveEdge(day, 2, 2000)[2].m, 1440);
  assert.deepEqual(moveEdge(day, 0, 100), day);
});

test("dropEmpty removes squeezed segments", () => {
  // edge 1 dragged onto 00:00 -> first segment disappears
  assert.deepEqual(dropEmpty(moveEdge(day, 1, 0)), [
    { m: 0, t: 21 },
    { m: 510, t: 19 },
  ]);
  // edge 2 dragged onto edge 1 -> segment 1 disappears
  assert.deepEqual(dropEmpty(moveEdge(day, 2, 330)), [
    { m: 0, t: 19 },
    { m: 330, t: 19 },
  ]);
  // last edge pushed to 24:00 -> last segment disappears
  assert.deepEqual(dropEmpty(moveEdge(day, 2, 1440)), day.slice(0, 2));
});

test("splitSegment", () => {
  const split = splitSegment(day, 0)!;
  assert.deepEqual(split.map((p) => p.m), [0, 165, 330, 510]);
  assert.equal(splitSegment(day, 0, 0), null);
  assert.deepEqual(splitSegment(day, 2, 1000)![3], { m: 1005, t: 19 });
});

test("removeSegment", () => {
  assert.deepEqual(removeSegment(day, 0), [
    { m: 0, t: 21 },
    { m: 510, t: 19 },
  ]);
  assert.deepEqual(removeSegment(day, 1), [
    { m: 0, t: 19 },
    { m: 510, t: 19 },
  ]);
  assert.deepEqual(removeSegment([{ m: 0, t: 20 }], 0), [{ m: 0, t: 20 }]);
});

test("dayOf is Monday-first", () => {
  assert.equal(dayOf(new Date(2026, 9, 12)), "mon");
  assert.equal(dayOf(new Date(2026, 9, 18)), "sun");
});

test("formatDuration", () => {
  assert.equal(formatDuration(344), "5 h 44 min");
  assert.equal(formatDuration(40), "40 min");
  assert.equal(formatDuration(120), "2 h 0 min");
});

test("sensitivity from a named or device entity", () => {
  const states = {
    "number.salon_termostat_deadzone_temperature": { state: "1" },
    "sensor.toaleta_termostat_temperature_delta": { state: "0.5" },
    "number.p2_delta_temperature_delta": { state: "1.5" },
    "sensor.broken_temperature_delta": { state: "unavailable" },
  };
  const entities = {
    "climate.pokoj_p2_termostat": { device_id: "d2" },
    "number.p2_delta_temperature_delta": { device_id: "d2" },
    "number.p2_other": { device_id: "d2" },
  };
  assert.deepEqual(sensitivity("climate.salon_termostat", states), { below: 1, above: 0 });
  assert.deepEqual(sensitivity("climate.toaleta_termostat", states, entities), { below: 0.5, above: 0.5 });
  assert.deepEqual(sensitivity("climate.pokoj_p2_termostat", states, entities), { below: 1.5, above: 1.5 });
  assert.equal(sensitivity("climate.broken", states, entities), undefined);
  assert.equal(sensitivity("climate.none", states, entities), undefined);
});

test("bandOf: settings win per side", () => {
  const deadzone = { below: 1, above: 0 };
  assert.deepEqual(bandOf(undefined, deadzone), deadzone);
  assert.deepEqual(bandOf({ below: null, above: 0.5 }, deadzone), { below: 1, above: 0.5 });
  assert.deepEqual(bandOf({ below: 0.3 }, undefined), { below: 0.3, above: 0 });
  assert.deepEqual(bandOf({ below: 0, above: 0 }, deadzone), undefined);
  assert.equal(bandOf(undefined, undefined), undefined);
});

test("wallMinute follows the clock across DST", () => {
  const tz = process.env.TZ;
  process.env.TZ = "Europe/Warsaw";
  try {
    // 2026-10-25: 3:00 CEST becomes 2:00 CET (a 25-hour day).
    const day = new Date(2026, 9, 25);
    const at = (iso: string) => Date.parse(iso);
    assert.equal(wallMinute(at("2026-10-25T01:30:00+02:00"), day), 90);
    assert.equal(wallMinute(at("2026-10-25T11:00:00+01:00"), day), 660); // 11:00, not 12:00
    // The repeated hour does not go back once a later time was seen.
    assert.equal(wallMinute(at("2026-10-25T02:30:00+01:00"), day, 170), 170);
    assert.equal(wallMinute(at("2026-10-25T23:59:00+01:00"), day) < 1440, true);
    assert.equal(wallMinute(at("2026-10-26T00:30:00+01:00"), day), 1440);
    assert.equal(wallMinute(at("2026-10-24T23:00:00+02:00"), day), 0);
    // 2026-03-29: 2:00 CET becomes 3:00 CEST (a 23-hour day).
    assert.equal(wallMinute(at("2026-03-29T10:00:00+02:00"), new Date(2026, 2, 29)), 600);
  } finally {
    process.env.TZ = tz;
  }
});

test("formatLeft and toLocalInput", () => {
  assert.equal(formatLeft(8 * 1440 + 5 * 60 + 20), "8 d 5 h");
  assert.equal(formatLeft(1440 + 17 * 60, "dzień", "dni"), "1 dzień 17 h");
  assert.equal(formatLeft(8 * 1440, "dzień", "dni"), "8 dni 0 h");
  assert.equal(formatLeft(90), "1 h 30 min");
  assert.equal(formatLeft(-5), "0 min");
  assert.equal(toLocalInput(new Date(2026, 10, 7, 14, 5)), "2026-11-07T14:05");
});
