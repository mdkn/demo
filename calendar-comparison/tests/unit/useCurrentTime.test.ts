import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrentTime } from '../../src/shared/hooks/useCurrentTime';

describe('useCurrentTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期値として現在時刻を返す', () => {
    const testDate = new Date('2026-02-14T10:30:00');
    vi.setSystemTime(testDate);

    const { result } = renderHook(() => useCurrentTime());

    expect(result.current.now).toEqual(testDate);
    expect(result.current.minutesFromMidnight).toBe(10 * 60 + 30); // 630分
  });

  it('0:00からの経過分を正しく計算する - 午前0時', () => {
    vi.setSystemTime(new Date('2026-02-14T00:00:00'));
    const { result } = renderHook(() => useCurrentTime());
    expect(result.current.minutesFromMidnight).toBe(0);
  });

  it('0:00からの経過分を正しく計算する - 午前9時', () => {
    vi.setSystemTime(new Date('2026-02-14T09:00:00'));
    const { result } = renderHook(() => useCurrentTime());
    expect(result.current.minutesFromMidnight).toBe(540);
  });

  it('0:00からの経過分を正しく計算する - 午後2時半', () => {
    vi.setSystemTime(new Date('2026-02-14T14:30:00'));
    const { result } = renderHook(() => useCurrentTime());
    expect(result.current.minutesFromMidnight).toBe(870);
  });

  it('0:00からの経過分を正しく計算する - 午後11時59分', () => {
    vi.setSystemTime(new Date('2026-02-14T23:59:00'));
    const { result } = renderHook(() => useCurrentTime());
    expect(result.current.minutesFromMidnight).toBe(1439);
  });

  it('アンマウント時にsetIntervalがクリアされる', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useCurrentTime());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
