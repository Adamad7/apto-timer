import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatTime, formatTimeWithTenths } from "../utils/format.js";

describe("utils/format - formatTime", () => {
  it("formats standard seconds correctly (mm:ss)", () => {
    assert.equal(formatTime(15000), "00:15");
    assert.equal(formatTime(60000), "01:00");
    assert.equal(formatTime(65000), "01:05");
    assert.equal(formatTime(3599000), "59:59");
  });

  it("rounds up sub-second durations to natural countdown (Math.ceil)", () => {
    assert.equal(formatTime(14001), "00:15");
    assert.equal(formatTime(500), "00:01");
    assert.equal(formatTime(1), "00:01");
  });

  it("handles boundary zero and negative values safely", () => {
    assert.equal(formatTime(0), "00:00");
    assert.equal(formatTime(-500), "00:00");
    assert.equal(formatTime(null), "00:00");
    assert.equal(formatTime(undefined), "00:00");
    assert.equal(formatTime(NaN), "00:00");
  });
});

describe("utils/format - formatTimeWithTenths", () => {
  it("formats time with tenths of second", () => {
    assert.equal(formatTimeWithTenths(15500), "00:15.5");
    assert.equal(formatTimeWithTenths(65123), "01:05.1");
    assert.equal(formatTimeWithTenths(0), "00:00.0");
    assert.equal(formatTimeWithTenths(-100), "00:00.0");
  });
});
