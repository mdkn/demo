import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAbsoluteLayout } from './useAbsoluteLayout';
import { DragPreviewProvider } from '@shared/contexts/DragPreviewContext';
import type { CalendarEvent } from '@shared/types';

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

describe('useAbsoluteLayout', () => {
  const HOUR_HEIGHT = 60; // 1時間 = 60px

  describe('プレビューなしの場合（既存動作）', () => {
    it('空の配列を返す（イベントなし）', () => {
      const { result } = renderHook(
        () => useAbsoluteLayout([], HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current).toEqual([]);
    });

    it('単一イベントのレイアウトを計算する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({
        event: events[0],
        top: 600, // 10:00 = 10 * 60
        left: '0%',
        width: '100%',
        height: 60, // 1時間
        zIndex: 10,
      });
    });

    it('重なるイベントを並べて配置する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
        createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00'),
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current).toHaveLength(2);

      // イベント1は左半分
      expect(result.current[0].left).toBe('0%');
      expect(result.current[0].width).toBe('50%');

      // イベント2は右半分
      expect(result.current[1].left).toBe('50%');
      expect(result.current[1].width).toBe('50%');
    });
  });

  describe('プレビューありの場合', () => {
    it('プレビューイベントを含めてレイアウト計算する', () => {
      // この テストは Context を使って dragPreview を設定する必要があるため、
      // 統合テストとして別途実装する
      // ここでは基本的な動作確認のみ
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      // プレビューなしでも正常に動作する
      expect(result.current).toHaveLength(1);
    });
  });

  describe('レイアウト計算の詳細', () => {
    it('top位置を正しく計算する（午前0時基準）', () => {
      const events = [
        createEvent('1', '2026-02-17T00:00:00', '2026-02-17T01:00:00'), // 0:00
        createEvent('2', '2026-02-17T12:00:00', '2026-02-17T13:00:00'), // 12:00
        createEvent('3', '2026-02-17T23:00:00', '2026-02-17T23:30:00'), // 23:00
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current[0].top).toBe(0);      // 0:00 = 0 * 60
      expect(result.current[1].top).toBe(720);    // 12:00 = 12 * 60
      expect(result.current[2].top).toBe(1380);   // 23:00 = 23 * 60
    });

    it('高さを正しく計算する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T10:30:00'), // 30分
        createEvent('2', '2026-02-17T11:00:00', '2026-02-17T12:00:00'), // 1時間
        createEvent('3', '2026-02-17T14:00:00', '2026-02-17T16:00:00'), // 2時間
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current[0].height).toBe(30);  // 30分 = 30px
      expect(result.current[1].height).toBe(60);  // 1時間 = 60px
      expect(result.current[2].height).toBe(120); // 2時間 = 120px
    });

    it('最小高さ15pxを保証する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T10:05:00'), // 5分
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      // 5分 = 5px だが、最小15pxになる
      expect(result.current[0].height).toBe(15);
    });

    it('zIndexをカラム番号で設定する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
        createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00'),
        createEvent('3', '2026-02-17T10:15:00', '2026-02-17T11:15:00'),
      ];

      const { result } = renderHook(
        () => useAbsoluteLayout(events, HOUR_HEIGHT),
        { wrapper: DragPreviewProvider }
      );

      // カラム0 = zIndex 10, カラム1 = zIndex 11, カラム2 = zIndex 12
      const zIndexes = result.current.map(r => r.zIndex).sort();
      expect(zIndexes).toEqual([10, 11, 12]);
    });
  });
});
