import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DayInfo, TimeSlot } from '@shared/types';
import { HOUR_HEIGHT, DAYS_IN_WEEK } from '@shared/constants';

export const getWeekDays = (baseDate: Date = new Date()): DayInfo[] => {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  const today = new Date();

  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date,
      dayOfWeek: format(date, 'E', { locale: ja }),
      dateLabel: format(date, 'M/d'),
      columnIndex: i,
      isToday: isSameDay(date, today),
    };
  });
};

export const generateTimeSlots = (): TimeSlot[] => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour}:00`,
    topPosition: hour * HOUR_HEIGHT,
  }));
};
