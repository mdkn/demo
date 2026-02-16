import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRafThrottle } from './rafThrottle';

describe('createRafThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('複数呼び出しを1フレームに統合する', () => {
    const callback = vi.fn();
    const { throttled } = createRafThrottle(callback);

    // 複数回呼び出し
    throttled('call1');
    throttled('call2');
    throttled('call3');

    // RAF が実行されるまでコールバックは呼ばれない
    expect(callback).not.toHaveBeenCalled();

    // RAF を実行
    vi.runAllTimers();

    // 1回だけ呼ばれる
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('最新の引数が使用される', () => {
    const callback = vi.fn();
    const { throttled } = createRafThrottle(callback);

    // 複数回呼び出し
    throttled('first');
    throttled('second');
    throttled('third');

    // RAF を実行
    vi.runAllTimers();

    // 最後の引数で呼ばれる
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('RAF後に再度呼び出すと新しいフレームで実行される', () => {
    const callback = vi.fn();
    const { throttled } = createRafThrottle(callback);

    // 1回目
    throttled('first');
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    // 2回目
    throttled('second');
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('複数の引数を正しく渡す', () => {
    const callback = vi.fn();
    const { throttled } = createRafThrottle(callback);

    throttled('arg1', 'arg2', 'arg3');
    vi.runAllTimers();

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('型安全性を維持する', () => {
    const callback = vi.fn((_a: number, _b: string) => {});
    const { throttled } = createRafThrottle(callback);

    // TypeScript コンパイラが型をチェックする
    throttled(123, 'test');
    vi.runAllTimers();

    expect(callback).toHaveBeenCalledWith(123, 'test');
  });

  it('キャンセル後は保留中のコールバックが実行されない', () => {
    const callback = vi.fn();
    const { throttled, cancel }= createRafThrottle(callback);
    // コールバックをスケジュール
    throttled('should-not-be-called');
    // RAF 実行前なのでまだ呼ばれていない
    expect(callback).not.toHaveBeenCalled();
    // ドラッグ終了/キャンセル相当のキャンセル呼び出し
    cancel();
    // RAF を実行しても、キャンセル済みのコールバックは呼ばれない
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled();
  });

  it('cancel() で保留中のRAFをキャンセルできる', () => {
    const callback = vi.fn();
    const { throttled, cancel } = createRafThrottle(callback);

    // 複数回呼び出し
    throttled('first');
    throttled('second');
    throttled('third');

    // キャンセル
    cancel();

    // RAF を実行してもコールバックは呼ばれない
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled();
  });

  it('cancel() 後に再度呼び出すと新しいRAFが作成される', () => {
    const callback = vi.fn();
    const { throttled, cancel } = createRafThrottle(callback);

    // 1回目
    throttled('first');
    cancel();
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled();

    // 2回目
    throttled('second');
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('flush() で保留中の更新を即座に実行できる', () => {
    const callback = vi.fn();
    const { throttled, flush } = createRafThrottle(callback);

    // 複数回呼び出し
    throttled('first');
    throttled('second');
    throttled('third');

    // RAF を待たずに即座に実行
    flush();

    // 最新の引数で呼ばれる
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');

    // RAF を実行しても再度呼ばれない
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('flush() 後に再度呼び出すと新しいRAFが作成される', () => {
    const callback = vi.fn();
    const { throttled, flush } = createRafThrottle(callback);

    // 1回目
    throttled('first');
    flush();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    // 2回目
    throttled('second');
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('second');
  });
});
