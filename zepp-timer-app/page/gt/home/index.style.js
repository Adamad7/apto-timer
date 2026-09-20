/**
 * Definicje geometrii, kolorów i stylów widżetów dla ekranu głównego timera.
 * Urządzenie referencyjne: Amazfit Balance (480×480 px round AMOLED).
 */
import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const SCREEN_SIZE = px(480);
export const CENTER_X = SCREEN_SIZE / 2;
export const CENTER_Y = SCREEN_SIZE / 2;
export const RADIUS = px(210);
export const LINE_WIDTH = px(14);

export const COLORS = {
  BG_ARC: 0x262626,
  PROGRESS_ARC: 0x00e5ff,
  TEXT_PRIMARY: 0xffffff,
  STATUS_IDLE: 0x888888,
  STATUS_RUNNING: 0x00e5ff,
  STATUS_PAUSED: 0xffcc00,
  STATUS_FINISHED: 0xff3b30
};

export const BG_ARC_STYLE = {
  x: 0,
  y: 0,
  w: SCREEN_SIZE,
  h: SCREEN_SIZE,
  center_x: CENTER_X,
  center_y: CENTER_Y,
  radius: RADIUS,
  start_angle: -90,
  end_angle: 270,
  color: COLORS.BG_ARC,
  line_width: LINE_WIDTH
};

export const PROGRESS_ARC_STYLE = {
  x: 0,
  y: 0,
  w: SCREEN_SIZE,
  h: SCREEN_SIZE,
  center_x: CENTER_X,
  center_y: CENTER_Y,
  radius: RADIUS,
  start_angle: -90,
  end_angle: 270,
  color: COLORS.PROGRESS_ARC,
  line_width: LINE_WIDTH
};

export const TIME_TEXT_STYLE = {
  x: 0,
  y: CENTER_Y - px(50),
  w: SCREEN_SIZE,
  h: px(70),
  color: COLORS.TEXT_PRIMARY,
  text_size: px(60),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V
};

export const STATUS_TEXT_STYLE = {
  x: 0,
  y: CENTER_Y + px(30),
  w: SCREEN_SIZE,
  h: px(30),
  color: COLORS.STATUS_IDLE,
  text_size: px(20),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text: "DOTKNIJ TEKST, ABY STARTOWAĆ"
};

export const STATUS_CONFIG = {
  IDLE: {
    text: "DOTKNIJ TEKST, ABY STARTOWAĆ",
    color: COLORS.STATUS_IDLE
  },
  RUNNING: {
    text: "ODLICZANIE...",
    color: COLORS.STATUS_RUNNING
  },
  PAUSED: {
    text: "ZATRZYMANY",
    color: COLORS.STATUS_PAUSED
  },
  FINISHED: {
    text: "KONIEC!",
    color: COLORS.STATUS_FINISHED
  }
};
