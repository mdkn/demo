import { isSameDay } from 'date-fns';
import type { CalendarEvent } from '../types';

/**
 * 特定の日付のイベントのみを抽出
 * @param events 全イベント
 * @param targetDate 対象日付
 * @returns 対象日付のイベント
 */
export const filterEventsByDay = (
  events: CalendarEvent[],
  targetDate: Date
): CalendarEvent[] => {
  return events.filter((event) => {
    const eventDate = new Date(event.startAt);
    return isSameDay(eventDate, targetDate);
  });
};
