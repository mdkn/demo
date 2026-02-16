import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridLayout } from './useGridLayout';
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

describe('useGridLayout', () => {
  describe('プレビューなしの場合（既存動作）', () => {
    it('空の配列を返す（イベントなし）', () => {
      const { result } = renderHook(
        () => useGridLayout([]),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current.layouts).toEqual([]);
      expect(result.current.totalColumns).toBe(1);
    });

    it('単一イベントのレイアウトを計算する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current.layouts).toHaveLength(1);
      expect(result.current.totalColumns).toBe(1);
      expect(result.current.layouts[0]).toMatchObject({
        event: events[0],
        gridRow: '600 / span 60', // 10:00 (600分) から 60分間
        gridColumn: 1,
        colSpan: 1,
      });
    });

    it('重なるイベントを並べて配置する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
        createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00'),
      ];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current.layouts).toHaveLength(2);
      expect(result.current.totalColumns).toBe(2);

      // イベント1は列1
      expect(result.current.layouts[0].gridColumn).toBe(1);

      // イベント2は列2
      expect(result.current.layouts[1].gridColumn).toBe(2);
    });

    it('LCMを使って列数を統一する', () => {
      // グループ1: 2列必要
      const event1 = createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00');
      const event2 = createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00');

      // グループ2: 3列必要
      const event3 = createEvent('3', '2026-02-17T14:00:00', '2026-02-17T15:00:00');
      const event4 = createEvent('4', '2026-02-17T14:20:00', '2026-02-17T15:20:00');
      const event5 = createEvent('5', '2026-02-17T14:40:00', '2026-02-17T15:40:00');

      const events = [event1, event2, event3, event4, event5];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      // LCM(2, 3) = 6
      expect(result.current.totalColumns).toBe(6);
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
          const layout = useGridLayout(events);
          return { actions, ...layout };
        },
        { wrapper: DragPreviewProvider }
      );

      // 初期状態：1つのイベント
      expect(result.current.layouts).toHaveLength(1);
      expect(result.current.layouts[0].event.id).toBe('1');

      // dragPreviewを設定
      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T14:00:00',  // 14:00に移動
          tempEndAt: '2026-02-17T15:00:00',
        });
      });

      // プレビューイベントが追加される（元イベント + プレビュー = 2つ）
      expect(result.current.layouts).toHaveLength(2);

      // 元イベント（id: '1'）
      const originalEvent = result.current.layouts.find(l => l.event.id === '1');
      expect(originalEvent).toBeDefined();
      expect(originalEvent!.gridRow).toBe('600 / span 60'); // 10:00 (600分) から 60分間

      // プレビューイベント（id: '1-preview'）
      const previewEvent = result.current.layouts.find(l => l.event.id === '1-preview');
      expect(previewEvent).toBeDefined();
      expect(previewEvent!.gridRow).toBe('840 / span 60'); // 14:00 (840分) から 60分間
    });

    it('元イベントとプレビューが重ならない場合、それぞれ1列になる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useGridLayout(events);
          return { actions, ...layout };
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

      expect(result.current.layouts).toHaveLength(2);
      expect(result.current.totalColumns).toBe(1);

      // 両方とも列1
      expect(result.current.layouts[0].gridColumn).toBe(1);
      expect(result.current.layouts[1].gridColumn).toBe(1);
    });

    it('元イベントとプレビューが重なる場合、2列に分かれる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useGridLayout(events);
          return { actions, ...layout };
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

      expect(result.current.layouts).toHaveLength(2);
      expect(result.current.totalColumns).toBe(2);

      // 元イベント（id: '1'）は列1
      const originalEvent = result.current.layouts.find(l => l.event.id === '1');
      expect(originalEvent!.gridColumn).toBe(1);

      // プレビューイベント（id: '1-preview'）は列2
      const previewEvent = result.current.layouts.find(l => l.event.id === '1-preview');
      expect(previewEvent!.gridColumn).toBe(2);
    });

    it('プレビューと他のイベントが重なる場合、正しく列が割り当てられる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
        createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useGridLayout(events);
          return { actions, ...layout };
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
      expect(result.current.layouts).toHaveLength(3);

      // 全て重なるので3列必要
      expect(result.current.totalColumns).toBe(3);
    });

    it('clearDragPreview後は元の状態に戻る', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useGridLayout(events);
          return { actions, ...layout };
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

      expect(result.current.layouts).toHaveLength(2);

      // clearDragPreview
      act(() => {
        result.current.actions.clearDragPreview();
      });

      // 元の1つに戻る
      expect(result.current.layouts).toHaveLength(1);
      expect(result.current.layouts[0].event.id).toBe('1');
      expect(result.current.totalColumns).toBe(1);
    });

    it('プレビューイベントのプロパティが正しくコピーされる', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const layout = useGridLayout(events);
          return { actions, ...layout };
        },
        { wrapper: DragPreviewProvider }
      );

      act(() => {
        result.current.actions.updateDragPreview('1', {
          tempStartAt: '2026-02-17T14:00:00',
          tempEndAt: '2026-02-17T15:00:00',
        });
      });

      const previewEvent = result.current.layouts.find(l => l.event.id === '1-preview');
      expect(previewEvent).toBeDefined();

      // 元イベントのプロパティが継承される
      expect(previewEvent!.event.title).toBe('Event 1');
      expect(previewEvent!.event.color).toBe('#3b82f6');

      // プレビュー用の新しい時刻
      expect(previewEvent!.event.startAt).toBe('2026-02-17T14:00:00');
      expect(previewEvent!.event.endAt).toBe('2026-02-17T15:00:00');
    });
  });

  describe('グリッド計算の詳細', () => {
    it('gridRowを正しく計算する（開始分 / span 継続分）', () => {
      const events = [
        createEvent('1', '2026-02-17T00:00:00', '2026-02-17T01:00:00'), // 0分 / 60分
        createEvent('2', '2026-02-17T12:00:00', '2026-02-17T13:00:00'), // 720分 / 60分
        createEvent('3', '2026-02-17T23:00:00', '2026-02-17T23:30:00'), // 1380分 / 30分
      ];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      expect(result.current.layouts[0].gridRow).toBe('0 / span 60');
      expect(result.current.layouts[1].gridRow).toBe('720 / span 60');
      expect(result.current.layouts[2].gridRow).toBe('1380 / span 30');
    });

    it('最小継続時間15分を保証する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T10:05:00'), // 5分
      ];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      // 5分だが、最小15分になる
      expect(result.current.layouts[0].gridRow).toBe('600 / span 15');
    });

    it('gridColumnをLCMスケールで計算する', () => {
      // 2列グループだが、totalColumns=6なのでスケール3倍
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
        createEvent('2', '2026-02-17T10:30:00', '2026-02-17T11:30:00'),
      ];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      // totalColumns=2なので、scale=1
      // カラム0 → gridColumn 1, カラム1 → gridColumn 2
      expect(result.current.layouts[0].gridColumn).toBe(1);
      expect(result.current.layouts[1].gridColumn).toBe(2);
    });

    it('colSpanをスケールで計算する', () => {
      const events = [
        createEvent('1', '2026-02-17T10:00:00', '2026-02-17T11:00:00'),
      ];

      const { result } = renderHook(
        () => useGridLayout(events),
        { wrapper: DragPreviewProvider }
      );

      // 1列グループ、totalColumns=1なので colSpan=1
      expect(result.current.layouts[0].colSpan).toBe(1);
    });
  });
});
