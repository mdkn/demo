import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAbsoluteLayout } from './useAbsoluteLayout';
import { DragPreviewProvider, useDragPreviewActions } from '@shared/contexts/DragPreviewContext';
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
    it('プレビューイベントがレイアウトに反映される', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useAbsoluteLayout(events, HOUR_HEIGHT);
          return { actions, layout };
        },
        { wrapper: DragPreviewProvider }
      );

      // 初期状態：1つのイベント
      expect(result.current.layout).toHaveLength(1);
      expect(result.current.layout[0].event.id).toBe('1');

      // dragPreviewを設定
      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T14:00:00',  // 14:00に移動
          tempEndAt: '2026-02-17T15:00:00',
        });
      });

      // プレビューイベントが追加される（元イベント + プレビュー = 2つ）
      expect(result.current.layout).toHaveLength(2);

      // 元イベント（id: '1'）
      const originalEvent = result.current.layout.find(l => l.event.id === '1');
      expect(originalEvent).toBeDefined();
      expect(originalEvent!.top).toBe(600); // 10:00 = 10 * 60

      // プレビューイベント（id: '1-preview'）
      const previewEvent = result.current.layout.find(l => l.event.id === '1-preview');
      expect(previewEvent).toBeDefined();
      expect(previewEvent!.top).toBe(840); // 14:00 = 14 * 60
      expect(previewEvent!.height).toBe(60); // 1時間
    });

    it('元イベントとプレビューが重ならない場合、それぞれ100%幅になる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useAbsoluteLayout(events, HOUR_HEIGHT);
          return { actions, layout };
        },
        { wrapper: DragPreviewProvider }
      );

      // dragPreviewを設定（重ならない位置）
      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T14:00:00',  // 14:00（重ならない）
          tempEndAt: '2026-02-17T15:00:00',
        });
      });

      expect(result.current.layout).toHaveLength(2);

      // 両方とも100%幅
      expect(result.current.layout[0].width).toBe('100%');
      expect(result.current.layout[1].width).toBe('100%');
    });

    it('元イベントとプレビューが重なる場合、50%幅ずつになる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useAbsoluteLayout(events, HOUR_HEIGHT);
          return { actions, layout };
        },
        { wrapper: DragPreviewProvider }
      );

      // dragPreviewを設定（重なる位置）
      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T10:30:00',  // 10:30（重なる）
          tempEndAt: '2026-02-17T11:30:00',
        });
      });

      expect(result.current.layout).toHaveLength(2);

      // 元イベント（id: '1'）は左半分
      const originalEvent = result.current.layout.find(l => l.event.id === '1');
      expect(originalEvent!.width).toBe('50%');
      expect(originalEvent!.left).toBe('0%');

      // プレビューイベント（id: '1-preview'）は右半分
      const previewEvent = result.current.layout.find(l => l.event.id === '1-preview');
      expect(previewEvent!.width).toBe('50%');
      expect(previewEvent!.left).toBe('50%');
    });

    it('プレビューと他のイベントが重なる場合、3列に分かれる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
        createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useAbsoluteLayout(events, HOUR_HEIGHT);
          return { actions, layout };
        },
        { wrapper: DragPreviewProvider }
      );

      // イベント2をドラッグして、イベント1と2の間に配置
      act(() => {
        result.current.actions.updateDragPreview('2', {
          tempStartAt: '2026-02-17T10:15:00',  // 10:15（全て重なる）
          tempEndAt: '2026-02-17T11:15:00',
        });
      });

      // 元イベント1、元イベント2、プレビューイベント2 = 3つ
      expect(result.current.layout).toHaveLength(3);

      // 全て重なるので3列に分かれる
      const widths = result.current.layout.map(l => l.width).sort();
      expect(widths).toEqual(['33.33333333333333%', '33.33333333333333%', '33.33333333333333%']);
    });

    it('clearDragPreview後は元の状態に戻る', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useAbsoluteLayout(events, HOUR_HEIGHT);
          return { actions, layout };
        },
        { wrapper: DragPreviewProvider }
      );

      // dragPreviewを設定
      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T14:00:00',
          tempEndAt: '2026-02-17T15:00:00',
        });
      });

      expect(result.current.layout).toHaveLength(2);

      // clearDragPreview
      act(() => {
        result.current.actions.clearDragPreview();
      });

      // 元の1つに戻る
      expect(result.current.layout).toHaveLength(1);
      expect(result.current.layout[0].event.id).toBe('1');
      expect(result.current.layout[0].width).toBe('100%');
    });

    it('プレビューイベントのプロパティが正しくコピーされる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useAbsoluteLayout(events, HOUR_HEIGHT);
          return { actions, layout };
        },
        { wrapper: DragPreviewProvider }
      );

      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T14:00:00',
          tempEndAt: '2026-02-17T15:00:00',
        });
      });

      const previewEvent = result.current.layout.find(l => l.event.id === '1-preview');
      expect(previewEvent).toBeDefined();

      // 元イベントのプロパティが継承される
      expect(previewEvent!.event.title).toBe('Event 1');
      expect(previewEvent!.event.color).toBe('#3b82f6');

      // プレビュー用の新しい時刻
      expect(previewEvent!.event.startAt).toBe('2026-02-17T14:00:00');
      expect(previewEvent!.event.endAt).toBe('2026-02-17T15:00:00');
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
