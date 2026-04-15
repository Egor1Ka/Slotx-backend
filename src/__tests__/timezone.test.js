import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getTimezoneOffsetMin,
  isValidTimezone,
  getDayOfWeekInTz,
} from "../shared/utils/timezone.js";
import { getDateRangeForTest } from "../services/slotServices.js";

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

test("isValidTimezone: корректная IANA", () => {
  assert.equal(isValidTimezone("Europe/Kyiv"), true);
  assert.equal(isValidTimezone("UTC"), true);
  assert.equal(isValidTimezone("America/Los_Angeles"), true);
});

test("isValidTimezone: некорректная строка", () => {
  assert.equal(isValidTimezone("Not/Real"), false);
  assert.equal(isValidTimezone(""), false);
  assert.equal(isValidTimezone(null), false);
  assert.equal(isValidTimezone(undefined), false);
});

test("getDayOfWeekInTz: 2026-04-15 в Europe/Kyiv = wed", () => {
  assert.equal(getDayOfWeekInTz("2026-04-15", "Europe/Kyiv"), "wed");
});

test("getDayOfWeekInTz: 2026-04-19 в UTC = sun", () => {
  assert.equal(getDayOfWeekInTz("2026-04-19", "UTC"), "sun");
});

test("getDayOfWeekInTz: одна дата, разные tz — weekday стабилен (используется 12:00 UTC anchor)", () => {
  assert.equal(getDayOfWeekInTz("2026-04-15", "America/Los_Angeles"), "wed");
  assert.equal(getDayOfWeekInTz("2026-04-15", "Asia/Tokyo"), "wed");
});

test("getDateRange: 2026-04-15 в Europe/Kyiv (+3 DST) → 2026-04-14T21:00 .. 2026-04-15T20:59:59.999", () => {
  const { dateStart, dateEnd } = getDateRangeForTest("2026-04-15", "Europe/Kyiv");
  assert.equal(dateStart.toISOString(), "2026-04-14T21:00:00.000Z");
  assert.equal(dateEnd.toISOString(), "2026-04-15T20:59:59.999Z");
});

test("getDateRange: 2026-04-15 в UTC → 2026-04-15T00:00 .. 2026-04-15T23:59:59.999", () => {
  const { dateStart, dateEnd } = getDateRangeForTest("2026-04-15", "UTC");
  assert.equal(dateStart.toISOString(), "2026-04-15T00:00:00.000Z");
  assert.equal(dateEnd.toISOString(), "2026-04-15T23:59:59.999Z");
});

test("getDateRange: 2026-04-15 в America/Los_Angeles (-7 DST) → 2026-04-15T07:00 .. 2026-04-16T06:59:59.999", () => {
  const { dateStart, dateEnd } = getDateRangeForTest("2026-04-15", "America/Los_Angeles");
  assert.equal(dateStart.toISOString(), "2026-04-15T07:00:00.000Z");
  assert.equal(dateEnd.toISOString(), "2026-04-16T06:59:59.999Z");
});
