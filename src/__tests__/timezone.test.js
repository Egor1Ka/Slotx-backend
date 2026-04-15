import { test } from "node:test";
import assert from "node:assert/strict";
import { getTimezoneOffsetMin } from "../shared/utils/timezone.js";

test("getTimezoneOffsetMin: Europe/Kyiv in April (DST) = +180", () => {
  const d = new Date("2026-04-15T12:00:00Z");
  assert.equal(getTimezoneOffsetMin(d, "Europe/Kyiv"), 180);
});

test("getTimezoneOffsetMin: Europe/Kyiv in January (no DST) = +120", () => {
  const d = new Date("2026-01-15T12:00:00Z");
  assert.equal(getTimezoneOffsetMin(d, "Europe/Kyiv"), 120);
});

test("getTimezoneOffsetMin: UTC = 0", () => {
  const d = new Date("2026-04-15T12:00:00Z");
  assert.equal(getTimezoneOffsetMin(d, "UTC"), 0);
});

test("getTimezoneOffsetMin: America/Los_Angeles April (DST) = -420", () => {
  const d = new Date("2026-04-15T12:00:00Z");
  assert.equal(getTimezoneOffsetMin(d, "America/Los_Angeles"), -420);
});

test("getTimezoneOffsetMin: Asia/Kolkata (half-hour offset) = +330", () => {
  const d = new Date("2026-04-15T12:00:00Z");
  assert.equal(getTimezoneOffsetMin(d, "Asia/Kolkata"), 330);
});
