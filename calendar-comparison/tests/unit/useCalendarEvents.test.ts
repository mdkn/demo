import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendarEvents } from '../../src/shared/hooks/useCalendarEvents';
import { sampleEvents } from '../../src/shared/sampleEvents';
import { STORAGE_KEY } from '../../src/shared/constants';

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('useCalendarEvents', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('初回起動時にサンプルデータで初期化される', () => {
    const { result } = renderHook(() => useCalendarEvents());

    expect(result.current.events).toEqual(sampleEvents);
    expect(result.current.events).toHaveLength(8);
  });

  it('localStorage にデータがある場合は読み込む', () => {
    const storedEvents = [
      {
        id: 'test-1',
        title: 'Test Event',
        startAt: '2026-02-17T10:00:00',
        endAt: '2026-02-17T11:00:00',
        color: '#000000',
      },
    ];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedEvents));

    const { result } = renderHook(() => useCalendarEvents());

    expect(result.current.events).toEqual(storedEvents);
    expect(result.current.events).toHaveLength(1);
  });

  it('イベントを追加できる', () => {
    const { result } = renderHook(() => useCalendarEvents());

    act(() => {
      result.current.addEvent({
        title: 'New Event',
        startAt: '2026-02-17T10:00:00',
        endAt: '2026-02-17T11:00:00',
        color: '#ff0000',
      });
    });

    expect(result.current.events).toHaveLength(9);
    expect(result.current.events[8].title).toBe('New Event');
    expect(result.current.events[8].id).toBeDefined();
  });

  it('イベントを更新できる', () => {
    const { result } = renderHook(() => useCalendarEvents());
    const firstEventId = result.current.events[0].id;

    act(() => {
      result.current.updateEvent(firstEventId, { title: 'Updated Title' });
    });

    expect(result.current.events[0].title).toBe('Updated Title');
  });

  it('イベントを削除できる', () => {
    const { result } = renderHook(() => useCalendarEvents());
    const firstEventId = result.current.events[0].id;

    act(() => {
      result.current.deleteEvent(firstEventId);
    });

    expect(result.current.events).toHaveLength(7);
    expect(result.current.events.find((e) => e.id === firstEventId)).toBeUndefined();
  });

  it('resetEvents でサンプルデータに戻せる', () => {
    const { result } = renderHook(() => useCalendarEvents());

    // イベントを追加
    act(() => {
      result.current.addEvent({
        title: 'New Event',
        startAt: '2026-02-17T10:00:00',
        endAt: '2026-02-17T11:00:00',
        color: '#ff0000',
      });
    });

    expect(result.current.events).toHaveLength(9);

    // リセット
    act(() => {
      result.current.resetEvents();
    });

    expect(result.current.events).toEqual(sampleEvents);
    expect(result.current.events).toHaveLength(8);
  });

  it('localStorage に自動保存される', () => {
    const { result } = renderHook(() => useCalendarEvents());

    act(() => {
      result.current.addEvent({
        title: 'New Event',
        startAt: '2026-02-17T10:00:00',
        endAt: '2026-02-17T11:00:00',
        color: '#ff0000',
      });
    });

    const stored = localStorageMock.getItem(STORAGE_KEY);
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(9);
  });
});
