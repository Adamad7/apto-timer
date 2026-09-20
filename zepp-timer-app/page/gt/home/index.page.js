/**
 * Kontroler widoku i cyklu życia Zepp OS dla ekranu głównego timera.
 * Odpowiedzialność: Tworzenie widżetów, obsługa timera sprzętowego, eventy dotykowe, czyszczenie zasobów.
 */
import * as hmUI from "@zos/ui";
import * as timer from "@zos/timer";
import { log as Logger } from "@zos/utils";

import { HomeTimerLogic, TIMER_STATE } from "./index.class.js";
import {
  BG_ARC_STYLE,
  PROGRESS_ARC_STYLE,
  TIME_TEXT_STYLE,
  STATUS_TEXT_STYLE,
  STATUS_CONFIG
} from "./index.style.js";
import { haptic } from "../../../services/haptic.js";

const logger = Logger.getLogger("apto-timer-page");

Page({
  state: {
    logic: null,
    intervalTimer: null,
    progressArc: null,
    timeText: null,
    statusText: null,
    updateIntervalMs: 33
  },

  build() {
    logger.info("Initializing Apto-Timer Home page");

    // 1. Inicjalizacja czystej logiki domenowej
    this.state.logic = new HomeTimerLogic({
      totalDurationMs: 15 * 1000,
      updateIntervalMs: this.state.updateIntervalMs
    });

    // 2. Tworzenie widżetów UI
    // Tło łuku zegara (statyczne)
    hmUI.createWidget(hmUI.widget.ARC, BG_ARC_STYLE);

    // Dynamiczny łuk postępu
    this.state.progressArc = hmUI.createWidget(
      hmUI.widget.ARC,
      PROGRESS_ARC_STYLE
    );

    // Główny tekst cyfrowy z czasem
    this.state.timeText = hmUI.createWidget(hmUI.widget.TEXT, {
      ...TIME_TEXT_STYLE,
      text: this.state.logic.formattedTime
    });

    // Etykieta pomocnicza ze statusem
    this.state.statusText = hmUI.createWidget(
      hmUI.widget.TEXT,
      STATUS_TEXT_STYLE
    );

    // 3. Rejestracja zdarzeń dotykowych
    this.state.timeText.addEventListener(hmUI.event.CLICK_DOWN, () => {
      this.handleToggle();
    });

    this.state.statusText.addEventListener(hmUI.event.CLICK_DOWN, () => {
      this.handleToggle();
    });
  },

  handleToggle() {
    haptic.tap();

    if (this.state.logic.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    this.state.logic.start();

    // Zaktualizuj stan etykiety
    const statusCfg = STATUS_CONFIG[TIMER_STATE.RUNNING];
    this.state.statusText.setProperty(hmUI.prop.MORE, {
      text: statusCfg.text,
      color: statusCfg.color
    });

    // Uruchom timer sprzętowy @zos/timer (~30 FPS)
    const { updateIntervalMs } = this.state;
    this.stopHardwareTimer();

    this.state.intervalTimer = timer.createTimer(
      0,
      updateIntervalMs,
      () => {
        this.handleTick();
      }
    );
  },

  handleTick() {
    const snapshot = this.state.logic.tick(this.state.updateIntervalMs);

    // Mutacja widżetów bez niszczenia i tworzenia na nowo
    this.state.progressArc.setProperty(hmUI.prop.MORE, {
      end_angle: snapshot.endAngle
    });

    this.state.timeText.setProperty(hmUI.prop.MORE, {
      text: snapshot.formattedTime
    });

    if (snapshot.isFinished) {
      this.stopHardwareTimer();
      haptic.finish();

      const finishCfg = STATUS_CONFIG[TIMER_STATE.FINISHED];
      this.state.statusText.setProperty(hmUI.prop.MORE, {
        text: finishCfg.text,
        color: finishCfg.color
      });
    }
  },

  pauseTimer() {
    this.stopHardwareTimer();
    this.state.logic.pause();

    const pauseCfg = STATUS_CONFIG[TIMER_STATE.PAUSED];
    this.state.statusText.setProperty(hmUI.prop.MORE, {
      text: pauseCfg.text,
      color: pauseCfg.color
    });
  },

  stopHardwareTimer() {
    if (this.state.intervalTimer) {
      timer.stopTimer(this.state.intervalTimer);
      this.state.intervalTimer = null;
    }
  },

  onDestroy() {
    logger.info("Destroying Apto-Timer Home page and cleaning up resources");
    this.stopHardwareTimer();
    haptic.stop();
  }
});