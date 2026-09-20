import * as hmUI from "@zos/ui";
import * as timer from "@zos/timer";
import { log as Logger } from "@zos/utils";

const logger = Logger.getLogger("balance-timer");

Page({
  state: {
    totalDurationMs: 15 * 1000,
    remainingMs: 15 * 1000,
    intervalTimer: null,
    isRunning: false,
    progressArc: null,
    timeText: null,
    statusText: null,
    updateIntervalMs: 33
  },

  build() {
    const SCREEN_SIZE = 480;
    const CENTER = SCREEN_SIZE / 2;
    const RADIUS = 210;
    const LINE_WIDTH = 14;

    // 1. Tło łuku (ciemny statyczny okrąg)
    hmUI.createWidget(hmUI.widget.ARC, {
      x: 0,
      y: 0,
      w: SCREEN_SIZE,
      h: SCREEN_SIZE,
      center_x: CENTER,
      center_y: CENTER,
      radius: RADIUS,
      start_angle: -90,
      end_angle: 270,
      color: 0x262626,
      line_width: LINE_WIDTH
    });

    // 2. Aktywny łuk postępu (cyjan)
    this.state.progressArc = hmUI.createWidget(hmUI.widget.ARC, {
      x: 0,
      y: 0,
      w: SCREEN_SIZE,
      h: SCREEN_SIZE,
      center_x: CENTER,
      center_y: CENTER,
      radius: RADIUS,
      start_angle: -90,
      end_angle: 270,
      color: 0x00e5ff,
      line_width: LINE_WIDTH
    });

    // 3. Tekst cyfrowy z czasem
    this.state.timeText = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: CENTER - 50,
      w: SCREEN_SIZE,
      h: 70,
      color: 0xffffff,
      text_size: 60,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: this.formatTime(this.state.remainingMs)
    });

    // 4. Etykieta pomocnicza ze statusem
    this.state.statusText = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: CENTER + 30,
      w: SCREEN_SIZE,
      h: 30,
      color: 0x888888,
      text_size: 20,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: "DOTKNIJ TEKST, ABY STARTOWAĆ"
    });

    // 5. Obsługa dotyku bezpośrednio na środkowym tekście
    this.state.timeText.addEventListener(hmUI.event.CLICK_DOWN, () => {
      this.toggleTimer();
    });
    this.state.statusText.addEventListener(hmUI.event.CLICK_DOWN, () => {
      this.toggleTimer();
    });
  },

  formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  },

  toggleTimer() {
    if (this.state.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    if (this.state.remainingMs <= 0) return;

    this.state.isRunning = true;
    this.state.statusText.setProperty(hmUI.prop.MORE, {
      text: "ODLICZANIE...",
      color: 0x00e5ff
    });

    const { updateIntervalMs, totalDurationMs } = this.state;

    this.state.intervalTimer = timer.createTimer(
      0,
      updateIntervalMs,
      () => {
        this.state.remainingMs -= updateIntervalMs;

        if (this.state.remainingMs <= 0) {
          this.state.remainingMs = 0;
          this.pauseTimer();
          this.state.statusText.setProperty(hmUI.prop.MORE, {
            text: "KONIEC!",
            color: 0xff3b30
          });
        }

        const progress = this.state.remainingMs / totalDurationMs;
        const currentEndAngle = -90 + progress * 360;

        this.state.progressArc.setProperty(hmUI.prop.MORE, {
          end_angle: currentEndAngle
        });

        this.state.timeText.setProperty(hmUI.prop.MORE, {
          text: this.formatTime(this.state.remainingMs)
        });
      }
    );
  },

  pauseTimer() {
    if (this.state.intervalTimer) {
      timer.stopTimer(this.state.intervalTimer);
      this.state.intervalTimer = null;
    }
    this.state.isRunning = false;

    if (this.state.remainingMs > 0) {
      this.state.statusText.setProperty(hmUI.prop.MORE, {
        text: "ZATRZYMANY",
        color: 0xffcc00
      });
    }
  },

  onDestroy() {
    if (this.state.intervalTimer) {
      timer.stopTimer(this.state.intervalTimer);
      this.state.intervalTimer = null;
    }
  }
});