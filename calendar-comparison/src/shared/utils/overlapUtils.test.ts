import { describe, it, expect } from 'vitest';
import {
  eventsOverlap,
  detectOverlaps,
  assignColumns,
  calculateLCM,
} from './overlapUtils';
import type { CalendarEvent } from '../types';

const createEvent = (
  id: string,
  startAt: string,
  endAt: string
): CalendarEvent => ({
  id,
  title: `Event ${id}`,
  startAt,
  endAt,
  color: '#3b82f6',
});

describe('overlapUtils', () => {
  describe('eventsOverlap', () => {
    it('重なっているイベントを検出する', () => {
      const eventA = createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00');
      const eventB = createEvent('2', '2026-02-14T10:30:00', '2026-02-14T11:30:00');
      expect(eventsOverlap(eventA, eventB)).toBe(true);
    });

    it('重なっていないイベントを検出する', () => {
      const eventA = createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00');
      const eventB = createEvent('2', '2026-02-14T11:00:00', '2026-02-14T12:00:00');
      expect(eventsOverlap(eventA, eventB)).toBe(false);
    });

    it('完全に含まれるイベントを検出する', () => {
      const eventA = createEvent('1', '2026-02-14T10:00:00', '2026-02-14T12:00:00');
      const eventB = createEvent('2', '2026-02-14T10:30:00', '2026-02-14T11:00:00');
      expect(eventsOverlap(eventA, eventB)).toBe(true);
    });
  });

  describe('detectOverlaps', () => {
    it('空の配列を処理する', () => {
      expect(detectOverlaps([])).toEqual([]);
    });

    it('単一のイベントをグループ化する', () => {
      const events = [createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00')];
      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
    });

    it('重なるイベントを同じグループにする', () => {
      const events = [
        createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00'),
        createEvent('2', '2026-02-14T10:30:00', '2026-02-14T11:30:00'),
      ];
      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
    });

    it('重ならないイベントを別グループにする', () => {
      const events = [
        createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00'),
        createEvent('2', '2026-02-14T11:00:00', '2026-02-14T12:00:00'),
      ];
      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(2);
    });
  });

  describe('assignColumns', () => {
    it('空の配列を処理する', () => {
      expect(assignColumns([])).toEqual([]);
    });

    it('単一のイベントに列0を割り当てる', () => {
      const events = [createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00')];
      const result = assignColumns(events);
      expect(result).toHaveLength(1);
      expect(result[0].column).toBe(0);
      expect(result[0].totalColumns).toBe(1);
    });

    it('重なるイベントに異なる列を割り当てる', () => {
      const events = [
        createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00'),
        createEvent('2', '2026-02-14T10:30:00', '2026-02-14T11:30:00'),
      ];
      const result = assignColumns(events);
      expect(result).toHaveLength(2);
      expect(result[0].column).toBe(0);
      expect(result[1].column).toBe(1);
      expect(result[0].totalColumns).toBe(2);
      expect(result[1].totalColumns).toBe(2);
    });

    it('重ならないイベントに同じ列を割り当てる', () => {
      const events = [
        createEvent('1', '2026-02-14T10:00:00', '2026-02-14T11:00:00'),
        createEvent('2', '2026-02-14T11:00:00', '2026-02-14T12:00:00'),
      ];
      const result = assignColumns(events);
      expect(result).toHaveLength(2);
      expect(result[0].column).toBe(0);
      expect(result[1].column).toBe(0);
      expect(result[0].totalColumns).toBe(1);
    });
  });

  describe('calculateLCM', () => {
    it('空の配列で1を返す', () => {
      expect(calculateLCM([])).toBe(1);
    });

    it('単一の数値をそのまま返す', () => {
      expect(calculateLCM([6])).toBe(6);
    });

    it('2つの数値の最小公倍数を計算する', () => {
      expect(calculateLCM([4, 6])).toBe(12);
    });

    it('複数の数値の最小公倍数を計算する', () => {
      expect(calculateLCM([2, 3, 4])).toBe(12);
      expect(calculateLCM([3, 4, 5])).toBe(60);
    });
  });
});
