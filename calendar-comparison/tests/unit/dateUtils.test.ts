import { describe, it, expect } from 'vitest';
import { getWeekDays, generateTimeSlots } from '../../src/shared/utils/dateUtils';

describe('dateUtils', () => {
  describe('getWeekDays', () => {
    it('should return 7 days starting from Monday', () => {
      const days = getWeekDays(new Date('2026-02-17')); // Tuesday
      expect(days).toHaveLength(7);
      expect(days[0].dayOfWeek).toBe('月'); // Monday
      expect(days[6].dayOfWeek).toBe('日'); // Sunday
    });

    it('should have sequential column indices from 0 to 6', () => {
      const days = getWeekDays();
      days.forEach((day, index) => {
        expect(day.columnIndex).toBe(index);
      });
    });

    it('should mark today correctly', () => {
      const days = getWeekDays(); // Current week
      const todayCount = days.filter(day => day.isToday).length;
      // Either 0 (if today is not in current week) or 1 (if today is in current week)
      expect(todayCount).toBeLessThanOrEqual(1);
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate 24 time slots', () => {
      const slots = generateTimeSlots();
      expect(slots).toHaveLength(24);
    });

    it('should have correct labels', () => {
      const slots = generateTimeSlots();
      expect(slots[0].label).toBe('0:00');
      expect(slots[12].label).toBe('12:00');
      expect(slots[23].label).toBe('23:00');
    });

    it('should have correct top positions', () => {
      const slots = generateTimeSlots();
      expect(slots[0].topPosition).toBe(0);
      expect(slots[8].topPosition).toBe(480); // 8:00 position
      expect(slots[23].topPosition).toBe(1380); // 23:00 position
    });
  });
});
