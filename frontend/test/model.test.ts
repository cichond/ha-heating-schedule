import assert from "node:assert/strict";
import { test } from "node:test";

import {
  dayOf,
  dropEmpty,
  formatDuration,
  formatTime,
  sensitivity,
  moveEdge,
  type Pt,
  removeSegment,
  splitSegment,
  tempAt,
  toPts,
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
