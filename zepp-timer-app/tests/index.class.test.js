import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HomeTimerLogic, TIMER_STATE } from "../page/gt/home/index.class.js";

describe("page/gt/home/index.class - HomeTimerLogic", () => {
  it("initializes with default IDLE state and snapshot", () => {
    const timer = new HomeTimerLogic({ totalDurationMs: 15000, updateIntervalMs: 33 });
    assert.equal(timer.state, TIMER_STATE.IDLE);
    assert.equal(timer.remainingMs, 15000);
    assert.equal(timer.totalDurationMs, 15000);
    assert.equal(timer.formattedTime, "00:15");
    assert.equal(timer.progress, 1.0);
    assert.equal(timer.endAngle, 270);
    assert.equal(timer.isIdle, true);
    assert.equal(timer.isRunning, false);
  });

  it("transitions between states: IDLE -> RUNNING -> PAUSED -> RUNNING", () => {
    const timer = new HomeTimerLogic({ totalDurationMs: 10000 });
    
    timer.start();
    assert.equal(timer.state, TIMER_STATE.RUNNING);
    assert.equal(timer.isRunning, true);

    timer.pause();
    assert.equal(timer.state, TIMER_STATE.PAUSED);
    assert.equal(timer.isPaused, true);

    timer.toggle(); // should resume
    assert.equal(timer.state, TIMER_STATE.RUNNING);

    timer.toggle(); // should pause
    assert.equal(timer.state, TIMER_STATE.PAUSED);
  });

  it("ticks and updates remaining time, angles, and finishes at 0", () => {
    const timer = new HomeTimerLogic({ totalDurationMs: 1000, updateIntervalMs: 100 });
    timer.start();

    // 5 ticks of 100ms = 500ms remaining
    for (let i = 0; i < 5; i++) {
      timer.tick();
    }
    assert.equal(timer.remainingMs, 500);
    assert.equal(timer.progress, 0.5);
    assert.equal(timer.endAngle, 90);
    assert.equal(timer.state, TIMER_STATE.RUNNING);

    // 5 more ticks = reaches 0 -> FINISHED
    for (let i = 0; i < 5; i++) {
      timer.tick();
    }
    assert.equal(timer.remainingMs, 0);
    assert.equal(timer.progress, 0);
    assert.equal(timer.endAngle, -90);
    assert.equal(timer.state, TIMER_STATE.FINISHED);
    assert.equal(timer.isFinished, true);
  });

  it("restarting after FINISHED resets the duration and starts again", () => {
    const timer = new HomeTimerLogic({ totalDurationMs: 5000 });
    timer.start();
    timer.tick(5000);
    assert.equal(timer.isFinished, true);
    assert.equal(timer.remainingMs, 0);

    timer.start();
    assert.equal(timer.state, TIMER_STATE.RUNNING);
    assert.equal(timer.remainingMs, 5000);
    assert.equal(timer.progress, 1.0);
  });

  it("reset() sets state to IDLE and can update total duration", () => {
    const timer = new HomeTimerLogic({ totalDurationMs: 5000 });
    timer.start();
    timer.tick(2000);
    assert.equal(timer.remainingMs, 3000);

    timer.reset(20000);
    assert.equal(timer.state, TIMER_STATE.IDLE);
    assert.equal(timer.totalDurationMs, 20000);
    assert.equal(timer.remainingMs, 20000);
    assert.equal(timer.formattedTime, "00:20");
  });
});
