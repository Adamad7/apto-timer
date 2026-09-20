import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateProgress,
  calculateEndAngle,
  calculateEndAngleFromMs,
  clamp,
  DEFAULT_START_ANGLE,
  DEFAULT_SWEEP_ANGLE
} from "../utils/timerEngine.js";

describe("utils/timerEngine - clamp", () => {
  it("clamps numbers within min and max bounds", () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(-1, 0, 10), 0);
    assert.equal(clamp(15, 0, 10), 10);
  });
});

describe("utils/timerEngine - calculateProgress", () => {
  it("calculates correct progress ratio between 0 and 1", () => {
    assert.equal(calculateProgress(15000, 15000), 1.0);
    assert.equal(calculateProgress(7500, 15000), 0.5);
    assert.equal(calculateProgress(0, 15000), 0.0);
  });

  it("handles boundary values safely (overflow, negative, 0 duration)", () => {
    assert.equal(calculateProgress(20000, 15000), 1.0);
    assert.equal(calculateProgress(-500, 15000), 0.0);
    assert.equal(calculateProgress(1000, 0), 0.0);
    assert.equal(calculateProgress(1000, -1000), 0.0);
  });
});

describe("utils/timerEngine - calculateEndAngle & calculateEndAngleFromMs", () => {
  it("maps progress 1.0 to 270 deg (full arc from -90 deg)", () => {
    assert.equal(calculateEndAngle(1.0, -90, 360), 270);
    assert.equal(calculateEndAngleFromMs(15000, 15000), 270);
  });

  it("maps progress 0.5 to 90 deg (half arc, 6 o'clock)", () => {
    assert.equal(calculateEndAngle(0.5, -90, 360), 90);
    assert.equal(calculateEndAngleFromMs(7500, 15000), 90);
  });

  it("maps progress 0.0 to -90 deg (empty arc at 12 o'clock)", () => {
    assert.equal(calculateEndAngle(0.0, -90, 360), -90);
    assert.equal(calculateEndAngleFromMs(0, 15000), -90);
  });
});
