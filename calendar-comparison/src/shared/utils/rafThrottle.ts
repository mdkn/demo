/**
 * RAF スロットリングの戻り値の型
 */
export type ThrottledFunction<T extends (...args: any[]) => void> = {
  /**
   * スロットリングされた関数
   */
  throttled: (...args: Parameters<T>) => void;

  /**
   * 保留中の RAF をキャンセルし、引数をクリアする
   * ドラッグ終了/キャンセル時に呼び出して、未実行の更新を破棄する
   */
  cancel: () => void;

  /**
   * 保留中の RAF をキャンセルし、即座に最新の引数でコールバックを実行する
   * 即座に反映したい場合に使用
   */
  flush: () => void;
};

/**
 * requestAnimationFrame を使ってコールバックをスロットリングする
 *
 * 複数の呼び出しを1フレームに統合し、最大60回/秒に制限することで
 * パフォーマンスを最適化する。ドラッグ中のレイアウト再計算など、
 * 頻繁に発生するイベントの処理に適している。
 *
 * @param callback - スロットリングするコールバック関数
 * @returns RAF でスロットリングされた関数と制御メソッド
 *
 * @example
 * ```typescript
 * const { throttled, cancel, flush } = createRafThrottle((value: number) => {
 *   console.log('Updated:', value);
 * });
 *
 * // 100回呼び出しても、1フレーム内では1回のみ実行される
 * for (let i = 0; i < 100; i++) {
 *   throttled(i); // 最後の値 (99) のみが使用される
 * }
 *
 * // 保留中の更新をキャンセル（ドラッグ終了時など）
 * cancel();
 *
 * // 即座に最新の引数で実行
 * flush();
 * ```
 */
export const createRafThrottle = <T extends (...args: any[]) => void>(
  callback: T
): ThrottledFunction<T> => {
  let rafId: number | null = null;
  let latestArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    // 最新の引数を保存
    latestArgs = args;

    // すでに RAF が予約されている場合は引数のみ更新
    if (rafId !== null) {
      return;
    }

    // RAF でコールバックを予約
    rafId = requestAnimationFrame(() => {
      if (latestArgs !== null) {
        callback(...latestArgs);
        latestArgs = null;
      }
      rafId = null;
    });
  };

  const cancel = () => {
    // 保留中の RAF をキャンセル
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // 保存された引数をクリア
    latestArgs = null;
  };

  const flush = () => {
    // 保留中の RAF をキャンセル
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // 最新の引数で即座に実行
    if (latestArgs !== null) {
      callback(...latestArgs);
      latestArgs = null;
    }
  };

  return { throttled, cancel, flush };
};
