import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { wallClockInTz } from "../timezone.js";

describe("wallClockInTz", () => {
  it("returns Kyiv wall-clock for UTC iso in DST", () => {
    assert.deepEqual(
      wallClockInTz("2026-04-18T06:00:00Z", "Europe/Kyiv"),
      { year: 2026, month: 4, day: 18, hour: 9, minute: 0, dayOfWeek: 6 }
    );
  });

  it("returns Berlin wall-clock for same iso", () => {
    assert.equal(
      wallClockInTz("2026-04-18T06:00:00Z", "Europe/Berlin").hour,
      8
    );
  });

  it("handles midnight wraparound", () => {
    const result = wallClockInTz("2026-04-18T23:30:00Z", "Europe/Kyiv");
    assert.equal(result.day, 19);
    assert.equal(result.hour, 2);
    assert.equal(result.minute, 30);
  });

  it("dayOfWeek: Sunday is 0", () => {
    assert.equal(
      wallClockInTz("2026-04-19T12:00:00Z", "Europe/Kyiv").dayOfWeek,
      0
    );
  });
});
