/**
 * Drag & Drop utility functions for time-based event manipulation
 */

/**
 * Snap minutes to nearest interval
 * @param minutes - Minutes from midnight (0-1439)
 * @param snap - Snap interval in minutes (default: 15)
 * @returns Snapped minutes
 *
 * @example
 * snapToMinutes(7, 15)  // returns 0
 * snapToMinutes(8, 15)  // returns 15
 * snapToMinutes(22, 15) // returns 15
 * snapToMinutes(23, 15) // returns 30
 */
export const snapToMinutes = (minutes: number, snap: number = 15): number => {
  return Math.round(minutes / snap) * snap;
};

/**
 * Clamp minutes within valid range (0 to maxMinutes)
 * Ensures event start and end stay within day boundaries
 *
 * @param startMinutes - Proposed start time in minutes
 * @param durationMinutes - Event duration in minutes
 * @param maxMinutes - Maximum minutes in day (default: 1440 = 24:00)
 * @returns Clamped start minutes
 *
 * @example
 * clampMinutes(-10, 60, 1440)   // returns 0 (can't start before 0:00)
 * clampMinutes(1400, 60, 1440)  // returns 1380 (1440 - 60, can't end after 24:00)
 * clampMinutes(100, 60, 1440)   // returns 100 (within valid range)
 */
export const clampMinutes = (
  startMinutes: number,
  durationMinutes: number,
  maxMinutes: number = 1440
): number => {
  // Can't start before 0:00
  if (startMinutes < 0) {
    return 0;
  }

  // Can't end after maxMinutes (24:00)
  const endMinutes = startMinutes + durationMinutes;
  if (endMinutes > maxMinutes) {
    return maxMinutes - durationMinutes;
  }

  return startMinutes;
};

/**
 * Calculate new ISO 8601 datetime from original date and new minutes
 * Preserves the date portion, only updates time
 *
 * @param originalDate - Original date as Date object or ISO string
 * @param newMinutes - New time in minutes from midnight (0-1439)
 * @returns ISO 8601 string with updated time
 *
 * @example
 * calculateNewTime('2024-02-14T10:30:00', 540)
 * // returns '2024-02-14T09:00:00.000Z' (540 minutes = 9:00)
 */
export const calculateNewTime = (
  originalDate: Date | string,
  newMinutes: number
): string => {
  const date = new Date(originalDate);

  // Preserve date, set new time
  const hours = Math.floor(newMinutes / 60);
  const minutes = newMinutes % 60;

  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
};

/**
 * Convert pixel offset to minutes
 * @param offsetPx - Pixel offset from top
 * @param hourHeight - Height of one hour in pixels
 * @returns Minutes from midnight
 *
 * @example
 * pxToMinutes(60, 60)  // returns 60 (1 hour)
 * pxToMinutes(30, 60)  // returns 30 (0.5 hour)
 */
export const pxToMinutes = (offsetPx: number, hourHeight: number): number => {
  return (offsetPx / hourHeight) * 60;
};

/**
 * Convert minutes to pixel offset
 * @param minutes - Minutes from midnight
 * @param hourHeight - Height of one hour in pixels
 * @returns Pixel offset from top
 *
 * @example
 * minutesToPx(60, 60)  // returns 60 (1 hour)
 * minutesToPx(30, 60)  // returns 30 (0.5 hour)
 */
export const minutesToPx = (minutes: number, hourHeight: number): number => {
  return (minutes / 60) * hourHeight;
};

/**
 * Extract minutes from midnight from a Date or ISO string
 * @param date - Date object or ISO string
 * @returns Minutes from midnight (0-1439)
 *
 * @example
 * dateToMinutes('2024-02-14T09:30:00')  // returns 570 (9*60 + 30)
 */
export const dateToMinutes = (date: Date | string): number => {
  const d = new Date(date);
  return d.getHours() * 60 + d.getMinutes();
};
