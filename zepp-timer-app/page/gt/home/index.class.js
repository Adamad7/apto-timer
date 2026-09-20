/**
 * Czysta klasa logiki i maszyny stanów timera ekranu głównego (Pure JS).
 * Rygor: Brak importów z @zos/* — w 100% testowalna w środowisku Node.js.
 */

import { formatTime } from "../../../utils/format.js";
import {
  calculateProgress,
  calculateEndAngleFromMs,
  DEFAULT_START_ANGLE,
  DEFAULT_SWEEP_ANGLE
} from "../../../utils/timerEngine.js";

export const TIMER_STATE = {
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  FINISHED: "FINISHED"
};

export class HomeTimerLogic {
  /**
   * @param {Object} options
   * @param {number} [options.totalDurationMs=15000] - Całkowity czas odliczania w ms
   * @param {number} [options.updateIntervalMs=33] - Interwał odświeżania w ms (~30 FPS)
   */
  constructor({ totalDurationMs = 15000, updateIntervalMs = 33 } = {}) {
    this.totalDurationMs = Math.max(0, totalDurationMs);
    this.remainingMs = this.totalDurationMs;
    this.updateIntervalMs = updateIntervalMs;
    this.state = TIMER_STATE.IDLE;
  }

  /**
   * Rozpoczyna lub wznawia odliczanie.
   * Jeśli timer był w stanie FINISHED lub pozostały czas wynosi 0, następuje reset.
   *
   * @returns {string} Aktualny stan po rozpoczęciu
   */
  start() {
    if (this.state === TIMER_STATE.FINISHED || this.remainingMs <= 0) {
      this.remainingMs = this.totalDurationMs;
    }
    this.state = TIMER_STATE.RUNNING;
    return this.state;
  }

  /**
   * Wstrzymuje odliczanie.
   *
   * @returns {string} Aktualny stan po wstrzymaniu
   */
  pause() {
    if (this.state === TIMER_STATE.RUNNING) {
      this.state = TIMER_STATE.PAUSED;
    }
    return this.state;
  }

  /**
   * Przełącza stan (start <-> pause).
   *
   * @returns {string} Aktualny stan po przełączeniu
   */
  toggle() {
    if (this.state === TIMER_STATE.RUNNING) {
      return this.pause();
    }
    return this.start();
  }

  /**
   * Resetuje timer do stanu początkowego IDLE.
   *
   * @param {number} [newDurationMs] - Opcjonalna nowa długość timera
   */
  reset(newDurationMs) {
    if (typeof newDurationMs === "number" && newDurationMs >= 0) {
      this.totalDurationMs = newDurationMs;
    }
    this.remainingMs = this.totalDurationMs;
    this.state = TIMER_STATE.IDLE;
  }

  /**
   * Wykonuje pojedynczy krok czasowy (tick animacji).
   *
   * @param {number} [deltaMs] - Upływ czasu w ms (domyślnie updateIntervalMs)
   * @returns {Object} Aktualny stan projekcji dla widoku
   */
  tick(deltaMs = this.updateIntervalMs) {
    if (this.state !== TIMER_STATE.RUNNING) {
      return this.getSnapshot();
    }

    this.remainingMs = Math.max(0, this.remainingMs - deltaMs);

    if (this.remainingMs <= 0) {
      this.remainingMs = 0;
      this.state = TIMER_STATE.FINISHED;
    }

    return this.getSnapshot();
  }

  /**
   * Zwraca pełny snapshot stanu i danych do odrysowania widżetów.
   *
   * @returns {Object}
   */
  getSnapshot() {
    const progress = calculateProgress(this.remainingMs, this.totalDurationMs);
    const endAngle = calculateEndAngleFromMs(
      this.remainingMs,
      this.totalDurationMs,
      DEFAULT_START_ANGLE,
      DEFAULT_SWEEP_ANGLE
    );
    const formattedTime = formatTime(this.remainingMs);

    return {
      state: this.state,
      remainingMs: this.remainingMs,
      totalDurationMs: this.totalDurationMs,
      progress,
      endAngle,
      formattedTime,
      isRunning: this.state === TIMER_STATE.RUNNING,
      isPaused: this.state === TIMER_STATE.PAUSED,
      isFinished: this.state === TIMER_STATE.FINISHED,
      isIdle: this.state === TIMER_STATE.IDLE
    };
  }

  get formattedTime() {
    return formatTime(this.remainingMs);
  }

  get progress() {
    return calculateProgress(this.remainingMs, this.totalDurationMs);
  }

  get endAngle() {
    return calculateEndAngleFromMs(this.remainingMs, this.totalDurationMs);
  }

  get isRunning() {
    return this.state === TIMER_STATE.RUNNING;
  }

  get isPaused() {
    return this.state === TIMER_STATE.PAUSED;
  }

  get isFinished() {
    return this.state === TIMER_STATE.FINISHED;
  }

  get isIdle() {
    return this.state === TIMER_STATE.IDLE;
  }
}
