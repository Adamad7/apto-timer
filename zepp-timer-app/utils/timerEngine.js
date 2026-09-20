/**
 * Czysty silnik matematyczny timera i obliczeń kątów łuku zegarka (Pure JS).
 */

export const DEFAULT_START_ANGLE = -90;
export const DEFAULT_SWEEP_ANGLE = 360;

/**
 * Ogranicza wartość numeryczną do przedziału [min, max].
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Oblicza relatywny postęp timera w przedziale [0.0, 1.0].
 *
 * @param {number} remainingMs - Pozostały czas w milisekundach
 * @param {number} totalDurationMs - Całkowity czas timera w milisekundach
 * @returns {number} Współczynnik postępu od 0.0 do 1.0
 */
export function calculateProgress(remainingMs, totalDurationMs) {
  if (!totalDurationMs || totalDurationMs <= 0) {
    return 0;
  }
  if (!remainingMs || remainingMs <= 0) {
    return 0;
  }
  const ratio = remainingMs / totalDurationMs;
  return clamp(ratio, 0, 1);
}

/**
 * Przelicza współczynnik postępu na końcowy kąt łuku (end_angle) dla widgetu ARC.
 *
 * @param {number} progress - Postęp w przedziale [0.0, 1.0]
 * @param {number} [startAngle=DEFAULT_START_ANGLE] - Kąt początkowy (domyślnie -90° = godzina 12:00)
 * @param {number} [sweepAngle=DEFAULT_SWEEP_ANGLE] - Zakres kąta (domyślnie 360°)
 * @returns {number} Kąt końcowy w stopniach
 */
export function calculateEndAngle(
  progress,
  startAngle = DEFAULT_START_ANGLE,
  sweepAngle = DEFAULT_SWEEP_ANGLE
) {
  const normalizedProgress = clamp(progress, 0, 1);
  return startAngle + normalizedProgress * sweepAngle;
}

/**
 * Oblicza bezpośrednio kąt końcowy na podstawie pozostałego i całkowitego czasu.
 *
 * @param {number} remainingMs
 * @param {number} totalDurationMs
 * @param {number} [startAngle=DEFAULT_START_ANGLE]
 * @param {number} [sweepAngle=DEFAULT_SWEEP_ANGLE]
 * @returns {number}
 */
export function calculateEndAngleFromMs(
  remainingMs,
  totalDurationMs,
  startAngle = DEFAULT_START_ANGLE,
  sweepAngle = DEFAULT_SWEEP_ANGLE
) {
  const progress = calculateProgress(remainingMs, totalDurationMs);
  return calculateEndAngle(progress, startAngle, sweepAngle);
}
