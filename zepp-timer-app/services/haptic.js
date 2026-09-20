/**
 * Usługa wibracji haptycznych z wykorzystaniem sensora Zepp OS (@zos/sensor).
 */
import { Vibrator, SCENE_SHORT_LIGHT, SCENE_DURATION_LONG } from "@zos/sensor";
import { log as Logger } from "@zos/utils";

const logger = Logger.getLogger("apto-haptic");

class HapticService {
  constructor() {
    this.vibrator = null;
    this.init();
  }

  init() {
    try {
      this.vibrator = new Vibrator();
    } catch (e) {
      logger.warn("Vibrator sensor initialization fallback:", e);
      this.vibrator = null;
    }
  }

  /**
   * Krótki impuls przy interakcji użytkownika (start/pauza).
   */
  tap() {
    if (!this.vibrator) return;
    try {
      if (typeof this.vibrator.setScenario === "function" && SCENE_SHORT_LIGHT) {
        this.vibrator.setScenario(SCENE_SHORT_LIGHT);
        this.vibrator.start();
      } else if (typeof this.vibrator.start === "function") {
        this.vibrator.start();
      }
    } catch (e) {
      logger.warn("Haptic tap error:", e);
    }
  }

  /**
   * Wyraźna wibracja po zakończeniu odliczania timera.
   */
  finish() {
    if (!this.vibrator) return;
    try {
      if (typeof this.vibrator.setScenario === "function" && SCENE_DURATION_LONG) {
        this.vibrator.setScenario(SCENE_DURATION_LONG);
        this.vibrator.start();
      } else if (typeof this.vibrator.start === "function") {
        this.vibrator.start();
      }
    } catch (e) {
      logger.warn("Haptic finish error:", e);
    }
  }

  /**
   * Zatrzymanie aktywnej wibracji.
   */
  stop() {
    if (!this.vibrator) return;
    try {
      if (typeof this.vibrator.stop === "function") {
        this.vibrator.stop();
      }
    } catch (e) {
      logger.warn("Haptic stop error:", e);
    }
  }
}

export const haptic = new HapticService();
