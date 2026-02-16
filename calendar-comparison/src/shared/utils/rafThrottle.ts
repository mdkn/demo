/**
 * requestAnimationFrame を使ってコールバックをスロットリングする
 *
 * 複数の呼び出しを1フレームに統合し、最大60回/秒に制限することで
 * パフォーマンスを最適化する。ドラッグ中のレイアウト再計算など、
 * 頻繁に発生するイベントの処理に適している。
 *
 * @param callback - スロットリングするコールバック関数
 * @returns RAF でスロットリングされたコールバック
 *
 * @example
 * ```typescript
 * const throttled = createRafThrottle((value: number) => {
 *   console.log('Updated:', value);
 * });
 *
 * // 100回呼び出しても、1フレーム内では1回のみ実行される
 * for (let i = 0; i < 100; i++) {
 *   throttled(i); // 最後の値 (99) のみが使用される
 * }
 * ```
 */
export const createRafThrottle = <T extends (...args: any[]) => void>(
  callback: T
): T => {
  let rafId: number | null = null;
  let latestArgs: any[] | null = null;

  const throttled = (...args: any[]) => {
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

  return throttled as T;
};
