import { describe, it, expect } from 'vitest';
import {
  eventsOverlap,
  detectOverlaps,
  assignColumns,
  calculateLCM,
} from '../../src/shared/utils/overlapUtils';
import type { CalendarEvent } from '../../src/shared/types';

describe('overlapUtils', () => {
  describe('eventsOverlap', () => {
    it('重なるイベントを検出する', () => {
      const event1: CalendarEvent = {
        id: '1',
        title: 'Event 1',
        startAt: '2026-02-17T09:00:00',
        endAt: '2026-02-17T12:00:00',
        color: '#000',
      };
      const event2: CalendarEvent = {
        id: '2',
        title: 'Event 2',
        startAt: '2026-02-17T10:00:00',
        endAt: '2026-02-17T12:00:00',
        color: '#000',
      };

      expect(eventsOverlap(event1, event2)).toBe(true);
    });

    it('重ならないイベントを検出する', () => {
      const event1: CalendarEvent = {
        id: '1',
        title: 'Event 1',
        startAt: '2026-02-17T09:00:00',
        endAt: '2026-02-17T10:00:00',
        color: '#000',
      };
      const event2: CalendarEvent = {
        id: '2',
        title: 'Event 2',
        startAt: '2026-02-17T10:00:00',
        endAt: '2026-02-17T11:00:00',
        color: '#000',
      };

      expect(eventsOverlap(event1, event2)).toBe(false);
    });

    it('完全に重なるイベントを検出する', () => {
      const event1: CalendarEvent = {
        id: '1',
        title: 'Event 1',
        startAt: '2026-02-17T09:00:00',
        endAt: '2026-02-17T10:00:00',
        color: '#000',
      };
      const event2: CalendarEvent = {
        id: '2',
        title: 'Event 2',
        startAt: '2026-02-17T09:00:00',
        endAt: '2026-02-17T10:00:00',
        color: '#000',
      };

      expect(eventsOverlap(event1, event2)).toBe(true);
    });
  });

  describe('detectOverlaps', () => {
    it('重ならない1件のイベントは1グループ', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T10:00:00',
          color: '#000',
        },
      ];

      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
    });

    it('2件重なりを検出する', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
        {
          id: '2',
          title: 'Event 2',
          startAt: '2026-02-17T10:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
      ];

      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
    });

    it('4件重なりを検出する（サンプルデータパターン）', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
        {
          id: '2',
          title: 'Event 2',
          startAt: '2026-02-17T10:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
        {
          id: '3',
          title: 'Event 3',
          startAt: '2026-02-17T11:00:00',
          endAt: '2026-02-17T13:00:00',
          color: '#000',
        },
        {
          id: '5',
          title: 'Event 5',
          startAt: '2026-02-17T10:00:00',
          endAt: '2026-02-17T11:00:00',
          color: '#000',
        },
      ];

      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(4);
    });

    it('複数のグループに分離される', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T10:00:00',
          color: '#000',
        },
        {
          id: '2',
          title: 'Event 2',
          startAt: '2026-02-17T11:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
      ];

      const groups = detectOverlaps(events);
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(1);
      expect(groups[1]).toHaveLength(1);
    });
  });

  describe('assignColumns', () => {
    it('1件のイベントはcolumn 0', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T10:00:00',
          color: '#000',
        },
      ];

      const result = assignColumns(events);
      expect(result).toHaveLength(1);
      expect(result[0].column).toBe(0);
      expect(result[0].totalColumns).toBe(1);
    });

    it('2件重なりで2列に分割', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
        {
          id: '2',
          title: 'Event 2',
          startAt: '2026-02-17T10:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
      ];

      const result = assignColumns(events);
      expect(result).toHaveLength(2);

      const event1Result = result.find((r) => r.event.id === '1');
      const event2Result = result.find((r) => r.event.id === '2');

      expect(event1Result?.column).toBe(0);
      expect(event2Result?.column).toBe(1);
      expect(event1Result?.totalColumns).toBe(2);
      expect(event2Result?.totalColumns).toBe(2);
    });

    it('4件重なりで3列に分割（最適化）', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          startAt: '2026-02-17T09:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
        {
          id: '2',
          title: 'Event 2',
          startAt: '2026-02-17T10:00:00',
          endAt: '2026-02-17T12:00:00',
          color: '#000',
        },
        {
          id: '3',
          title: 'Event 3',
          startAt: '2026-02-17T11:00:00',
          endAt: '2026-02-17T13:00:00',
          color: '#000',
        },
        {
          id: '5',
          title: 'Event 5',
          startAt: '2026-02-17T10:00:00',
          endAt: '2026-02-17T11:00:00',
          color: '#000',
        },
      ];

      const result = assignColumns(events);
      expect(result).toHaveLength(4);

      // 実際には3列に最適化される（Event3とEvent5は重ならないため同じ列）
      result.forEach((r) => {
        expect(r.totalColumns).toBe(3);
      });

      // カラムが0-2に割り当てられている
      const columns = result.map((r) => r.column).sort();
      expect(columns).toEqual([0, 1, 2, 2]);

      // Event3とEvent5が同じ列に配置されている
      const event3 = result.find((r) => r.event.id === '3');
      const event5 = result.find((r) => r.event.id === '5');
      expect(event3?.column).toBe(event5?.column);
    });
  });

  describe('calculateLCM', () => {
    it('空配列の場合は1', () => {
      expect(calculateLCM([])).toBe(1);
    });

    it('1つの数値の場合はその数値', () => {
      expect(calculateLCM([12])).toBe(12);
    });

    it('3と4の最小公倍数は12', () => {
      expect(calculateLCM([3, 4])).toBe(12);
    });

    it('2, 3, 4の最小公倍数は12', () => {
      expect(calculateLCM([2, 3, 4])).toBe(12);
    });

    it('6と8の最小公倍数は24', () => {
      expect(calculateLCM([6, 8])).toBe(24);
    });
  });
});
