import { describe, it, expect } from 'vitest';
import {
  snapToMinutes,
  clampMinutes,
  calculateNewTime,
  pxToMinutes,
  minutesToPx,
  dateToMinutes,
} from '@shared/utils/dragUtils';

describe('dragUtils', () => {
  describe('snapToMinutes', () => {
    it('should snap 7 minutes to 0 (15-minute interval)', () => {
      expect(snapToMinutes(7, 15)).toBe(0);
    });

    it('should snap 8 minutes to 15 (15-minute interval)', () => {
      expect(snapToMinutes(8, 15)).toBe(15);
    });

    it('should snap 22 minutes to 15 (15-minute interval)', () => {
      expect(snapToMinutes(22, 15)).toBe(15);
    });

    it('should snap 23 minutes to 30 (15-minute interval)', () => {
      expect(snapToMinutes(23, 15)).toBe(30);
    });

    it('should snap to exact interval', () => {
      expect(snapToMinutes(30, 15)).toBe(30);
      expect(snapToMinutes(45, 15)).toBe(45);
      expect(snapToMinutes(60, 15)).toBe(60);
    });

    it('should handle 0 minutes', () => {
      expect(snapToMinutes(0, 15)).toBe(0);
    });

    it('should handle end of day (1439 minutes)', () => {
      expect(snapToMinutes(1439, 15)).toBe(1440);
    });

    it('should use default snap of 15 minutes', () => {
      expect(snapToMinutes(7)).toBe(0);
      expect(snapToMinutes(8)).toBe(15);
    });

    it('should handle different snap intervals', () => {
      expect(snapToMinutes(25, 30)).toBe(30);
      expect(snapToMinutes(44, 30)).toBe(30);
      expect(snapToMinutes(45, 30)).toBe(60);
    });
  });

  describe('clampMinutes', () => {
    it('should clamp negative start to 0', () => {
      expect(clampMinutes(-10, 60, 1440)).toBe(0);
      expect(clampMinutes(-1, 30, 1440)).toBe(0);
    });

    it('should clamp when end exceeds max (1440)', () => {
      expect(clampMinutes(1400, 60, 1440)).toBe(1380); // 1440 - 60
      expect(clampMinutes(1420, 30, 1440)).toBe(1410); // 1440 - 30
    });

    it('should not clamp when within valid range', () => {
      expect(clampMinutes(100, 60, 1440)).toBe(100);
      expect(clampMinutes(500, 120, 1440)).toBe(500);
      expect(clampMinutes(0, 60, 1440)).toBe(0);
    });

    it('should handle exact boundary cases', () => {
      expect(clampMinutes(0, 1440, 1440)).toBe(0); // Full day event at 0:00
      expect(clampMinutes(1380, 60, 1440)).toBe(1380); // Event ending exactly at 24:00
    });

    it('should use default maxMinutes of 1440', () => {
      expect(clampMinutes(1400, 60)).toBe(1380);
      expect(clampMinutes(-10, 60)).toBe(0);
    });
  });

  describe('calculateNewTime', () => {
    it('should preserve date and update time from minutes', () => {
      const result = calculateNewTime('2024-02-14T10:30:00', 540); // 540 min = 9:00
      const date = new Date(result);

      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1); // February (0-indexed)
      expect(date.getDate()).toBe(14);
      expect(date.getHours()).toBe(9);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
    });

    it('should handle midnight (0 minutes)', () => {
      const result = calculateNewTime('2024-02-14T10:30:00', 0);
      const date = new Date(result);

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it('should handle end of day (1439 minutes = 23:59)', () => {
      const result = calculateNewTime('2024-02-14T10:30:00', 1439);
      const date = new Date(result);

      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
    });

    it('should handle various times', () => {
      const testCases = [
        { minutes: 630, expectedHours: 10, expectedMinutes: 30 }, // 10:30
        { minutes: 825, expectedHours: 13, expectedMinutes: 45 }, // 13:45
        { minutes: 90, expectedHours: 1, expectedMinutes: 30 },   // 1:30
      ];

      testCases.forEach(({ minutes, expectedHours, expectedMinutes }) => {
        const result = calculateNewTime('2024-02-14T00:00:00', minutes);
        const date = new Date(result);

        expect(date.getHours()).toBe(expectedHours);
        expect(date.getMinutes()).toBe(expectedMinutes);
      });
    });

    it('should accept Date object as input', () => {
      const originalDate = new Date('2024-02-14T10:30:00');
      const result = calculateNewTime(originalDate, 600); // 10:00

      const date = new Date(result);
      expect(date.getHours()).toBe(10);
      expect(date.getMinutes()).toBe(0);
    });

    it('should return valid ISO 8601 string', () => {
      const result = calculateNewTime('2024-02-14T10:30:00', 540);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('pxToMinutes', () => {
    it('should convert pixels to minutes with 60px hourHeight', () => {
      expect(pxToMinutes(60, 60)).toBe(60);   // 1 hour
      expect(pxToMinutes(30, 60)).toBe(30);   // 0.5 hour
      expect(pxToMinutes(120, 60)).toBe(120); // 2 hours
    });

    it('should handle different hourHeight values', () => {
      expect(pxToMinutes(100, 100)).toBe(60);  // 100px = 1 hour when hourHeight=100
      expect(pxToMinutes(50, 100)).toBe(30);   // 50px = 0.5 hour
    });

    it('should handle 0 pixels', () => {
      expect(pxToMinutes(0, 60)).toBe(0);
    });

    it('should handle fractional results', () => {
      expect(pxToMinutes(15, 60)).toBe(15);   // 0.25 hour
      expect(pxToMinutes(45, 60)).toBe(45);   // 0.75 hour
    });
  });

  describe('minutesToPx', () => {
    it('should convert minutes to pixels with 60px hourHeight', () => {
      expect(minutesToPx(60, 60)).toBe(60);   // 1 hour
      expect(minutesToPx(30, 60)).toBe(30);   // 0.5 hour
      expect(minutesToPx(120, 60)).toBe(120); // 2 hours
    });

    it('should handle different hourHeight values', () => {
      expect(minutesToPx(60, 100)).toBe(100); // 1 hour = 100px when hourHeight=100
      expect(minutesToPx(30, 100)).toBe(50);  // 0.5 hour = 50px
    });

    it('should handle 0 minutes', () => {
      expect(minutesToPx(0, 60)).toBe(0);
    });

    it('should round trip correctly with pxToMinutes', () => {
      const originalMinutes = 90;
      const hourHeight = 60;
      const px = minutesToPx(originalMinutes, hourHeight);
      const backToMinutes = pxToMinutes(px, hourHeight);
      expect(backToMinutes).toBe(originalMinutes);
    });
  });

  describe('dateToMinutes', () => {
    it('should extract minutes from ISO string', () => {
      expect(dateToMinutes('2024-02-14T09:30:00')).toBe(570);  // 9*60 + 30
      expect(dateToMinutes('2024-02-14T14:45:00')).toBe(885);  // 14*60 + 45
      expect(dateToMinutes('2024-02-14T00:15:00')).toBe(15);   // 0*60 + 15
    });

    it('should handle midnight', () => {
      expect(dateToMinutes('2024-02-14T00:00:00')).toBe(0);
    });

    it('should handle end of day', () => {
      expect(dateToMinutes('2024-02-14T23:59:00')).toBe(1439);
    });

    it('should accept Date object', () => {
      const date = new Date('2024-02-14T10:30:00');
      expect(dateToMinutes(date)).toBe(630); // 10*60 + 30
    });

    it('should ignore date portion', () => {
      expect(dateToMinutes('2024-01-01T09:30:00')).toBe(570);
      expect(dateToMinutes('2024-12-31T09:30:00')).toBe(570);
      // Different dates, same time → same minutes
    });
  });
});
