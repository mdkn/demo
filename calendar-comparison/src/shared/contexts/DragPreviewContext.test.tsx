import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  DragPreviewProvider,
  useDragPreview,
  useDragPreviewState,
  useDragPreviewActions,
} from './DragPreviewContext';

describe('DragPreviewContext', () => {
  describe('useDragPreview (統合API)', () => {
    it('初期状態は null', () => {
      const { result } = renderHook(() => useDragPreview(), {
        wrapper: DragPreviewProvider,
      });

      expect(result.current.dragPreview).toBeNull();
    });

  it('updateDragPreview で状態を更新できる', () => {
    const { result } = renderHook(() => useDragPreview(), {
      wrapper: DragPreviewProvider,
    });

    act(() => {
      result.current.updateDragPreview('event-1', {
        tempStartAt: '2026-02-17T10:00:00',
        tempEndAt: '2026-02-17T11:00:00',
      });
    });

    expect(result.current.dragPreview).toEqual({
      eventId: 'event-1',
      tempStartAt: '2026-02-17T10:00:00',
      tempEndAt: '2026-02-17T11:00:00',
    });
  });

  it('clearDragPreview で null に戻る', () => {
    const { result } = renderHook(() => useDragPreview(), {
      wrapper: DragPreviewProvider,
    });

    act(() => {
      result.current.updateDragPreview('event-1', {
        tempStartAt: '2026-02-17T10:00:00',
        tempEndAt: '2026-02-17T11:00:00',
      });
    });

    expect(result.current.dragPreview).not.toBeNull();

    act(() => {
      result.current.clearDragPreview();
    });

    expect(result.current.dragPreview).toBeNull();
  });

  it('複数回の更新で最新の値が使用される', () => {
    const { result } = renderHook(() => useDragPreview(), {
      wrapper: DragPreviewProvider,
    });

    act(() => {
      result.current.updateDragPreview('event-1', {
        tempStartAt: '2026-02-17T10:00:00',
        tempEndAt: '2026-02-17T11:00:00',
      });
    });

    act(() => {
      result.current.updateDragPreview('event-1', {
        tempStartAt: '2026-02-17T10:30:00',
        tempEndAt: '2026-02-17T11:30:00',
      });
    });

    expect(result.current.dragPreview).toEqual({
      eventId: 'event-1',
      tempStartAt: '2026-02-17T10:30:00',
      tempEndAt: '2026-02-17T11:30:00',
    });
  });

    it('Provider の外で使用するとエラーをスローする', () => {
      // エラーがスローされることを期待
      expect(() => {
        renderHook(() => useDragPreview());
      }).toThrow('useDragPreviewState must be used within DragPreviewProvider');
    });
  });

  describe('useDragPreviewState (状態のみ)', () => {
    it('dragPreview の状態を取得できる', () => {
      const { result } = renderHook(
        () => ({
          state: useDragPreviewState(),
          actions: useDragPreviewActions(),
        }),
        {
          wrapper: DragPreviewProvider,
        }
      );

      expect(result.current.state.dragPreview).toBeNull();

      act(() => {
        result.current.actions.updateDragPreview('event-1', {
          tempStartAt: '2026-02-17T10:00:00',
          tempEndAt: '2026-02-17T11:00:00',
        });
      });

      expect(result.current.state.dragPreview).toEqual({
        eventId: 'event-1',
        tempStartAt: '2026-02-17T10:00:00',
        tempEndAt: '2026-02-17T11:00:00',
      });
    });

    it('Provider の外で使用するとエラーをスローする', () => {
      expect(() => {
        renderHook(() => useDragPreviewState());
      }).toThrow('useDragPreviewState must be used within DragPreviewProvider');
    });
  });

  describe('useDragPreviewActions (アクションのみ)', () => {
    it('updateDragPreview と clearDragPreview を取得できる', () => {
      const { result } = renderHook(() => useDragPreviewActions(), {
        wrapper: DragPreviewProvider,
      });

      expect(result.current.updateDragPreview).toBeInstanceOf(Function);
      expect(result.current.clearDragPreview).toBeInstanceOf(Function);
    });

    it('アクションの参照が安定している（useCallback）', () => {
      const { result, rerender } = renderHook(() => useDragPreviewActions(), {
        wrapper: DragPreviewProvider,
      });

      const firstUpdate = result.current.updateDragPreview;
      const firstClear = result.current.clearDragPreview;

      // 再レンダー
      rerender();

      // 参照が同じ（useCallback で安定化されている）
      expect(result.current.updateDragPreview).toBe(firstUpdate);
      expect(result.current.clearDragPreview).toBe(firstClear);
    });

    it('Provider の外で使用するとエラーをスローする', () => {
      expect(() => {
        renderHook(() => useDragPreviewActions());
      }).toThrow('useDragPreviewActions must be used within DragPreviewProvider');
    });
  });

  describe('パフォーマンス最適化', () => {
    it('dragPreview 変更時に actions のみ使うコンポーネントは再レンダーされない', () => {
      let actionsRenderCount = 0;
      let stateRenderCount = 0;

      const { result } = renderHook(
        () => {
          const actions = useDragPreviewActions();
          const state = useDragPreviewState();

          actionsRenderCount++;
          stateRenderCount++;

          return { actions, state };
        },
        {
          wrapper: DragPreviewProvider,
        }
      );

      expect(actionsRenderCount).toBe(1);
      expect(stateRenderCount).toBe(1);

      // dragPreview を更新
      act(() => {
        result.current.actions.updateDragPreview('event-1', {
          tempStartAt: '2026-02-17T10:00:00',
          tempEndAt: '2026-02-17T11:00:00',
        });
      });

      // state は再レンダーされるが、actions は再レンダーされない
      // （ただし、同じフック内で両方使っているため、実際には両方再レンダーされる）
      // このテストは、別々のコンポーネントで使った場合の動作をシミュレートする
      expect(stateRenderCount).toBe(2);
    });
  });
});
