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

/**
 * Determine which day column the pointer is over based on clientX
 * @param clientX - Pointer X coordinate
 * @param dayColumnRects - Array of DOMRect for each day column (0-6)
 * @returns Day index (0-6) or null if outside all columns
 *
 * @example
 * const rects = dayColumns.map(el => el.getBoundingClientRect());
 * pxToDayIndex(500, rects)  // returns 2 if pointer is over Wednesday
 */
export const pxToDayIndex = (
  clientX: number,
  dayColumnRects: DOMRect[]
): number | null => {
  for (let i = 0; i < dayColumnRects.length; i++) {
    const rect = dayColumnRects[i];
    // Use < for right boundary to avoid overlap with next column
    if (clientX >= rect.left && clientX < rect.right) {
      return i;
    }
  }
  // Check if exactly on the last column's right edge
  if (dayColumnRects.length > 0) {
    const lastRect = dayColumnRects[dayColumnRects.length - 1];
    if (clientX === lastRect.right) {
      return dayColumnRects.length - 1;
    }
  }
  return null;
};

/**
 * Calculate new date by shifting days from original date
 * Preserves the time portion, only updates the date
 *
 * @param originalDate - Original date as Date object or ISO string
 * @param newDayIndex - Target day index (0-6, where 0 is the week start)
 * @param startDayIndex - Original day index (0-6)
 * @returns ISO 8601 string with updated date
 *
 * @example
 * calculateNewDate('2024-02-12T10:30:00', 2, 0)
 * // Monday (0) to Wednesday (2) = +2 days
 * // returns '2024-02-14T10:30:00.000Z'
 */
export const calculateNewDate = (
  originalDate: Date | string,
  newDayIndex: number,
  startDayIndex: number
): string => {
  const date = new Date(originalDate);

  // Calculate day difference
  const dayDiff = newDayIndex - startDayIndex;

  // Add days to original date
  date.setDate(date.getDate() + dayDiff);

  return date.toISOString();
};

/**
 * Calculate ISO 8601 datetime by combining a date with minutes from midnight
 * Used for creating new events from click/drag coordinates
 *
 * @param date - Base date (Date object or ISO string)
 * @param minutes - Time in minutes from midnight (0-1439)
 * @returns ISO 8601 string combining the date and time
 *
 * @example
 * calculateDateTime('2024-02-14', 540)
 * // returns '2024-02-14T09:00:00.000Z' (540 minutes = 9:00)
 *
 * calculateDateTime('2024-02-14T10:30:00', 900)
 * // returns '2024-02-14T15:00:00.000Z' (900 minutes = 15:00, time replaced)
 */
export const calculateDateTime = (
  date: Date | string,
  minutes: number
): string => {
  const d = new Date(date);

  // Set time to specified minutes from midnight
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  d.setHours(hours, mins, 0, 0);

  return d.toISOString();
};
