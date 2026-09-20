/**
 * Czyste funkcje formatowania czasu (Pure JS - brak zależności od platformy).
 */

/**
 * Formatuje czas w milisekundach do czytelnego formatu "mm:ss".
 * Używa Math.ceil dla naturalnego odliczania sekund w dół.
 *
 * @param {number} ms - Czas w milisekundach
 * @returns {string} Sformatowany ciąg znaków, np. "00:15", "01:00"
 */
export function formatTime(ms) {
  if (typeof ms !== "number" || isNaN(ms) || ms <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mStr = minutes.toString().padStart(2, "0");
  const sStr = seconds.toString().padStart(2, "0");

  return `${mStr}:${sStr}`;
}

/**
 * Formatuje czas w milisekundach z uwzględnieniem dziesiątych części sekundy "mm:ss.S".
 *
 * @param {number} ms - Czas w milisekundach
 * @returns {string} Sformatowany ciąg znaków, np. "00:15.5"
 */
export function formatTimeWithTenths(ms) {
  if (typeof ms !== "number" || isNaN(ms) || ms <= 0) {
    return "00:00.0";
  }

  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mStr = minutes.toString().padStart(2, "0");
  const sStr = seconds.toString().padStart(2, "0");

  return `${mStr}:${sStr}.${tenths}`;
}
