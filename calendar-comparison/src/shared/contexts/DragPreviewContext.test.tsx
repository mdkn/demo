import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DragPreviewProvider, useDragPreview } from './DragPreviewContext';

describe('DragPreviewContext', () => {
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
    }).toThrow('useDragPreview must be used within DragPreviewProvider');
  });
});
