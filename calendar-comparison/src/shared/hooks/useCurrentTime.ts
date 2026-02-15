import { useState, useEffect } from 'react';

export type CurrentTime = {
  now: Date;
  minutesFromMidnight: number; // 0-1439
};

/**
 * 現在時刻を取得し、1分ごとに更新するフック
 * @returns 現在時刻と0:00からの経過分
 */
export const useCurrentTime = (): CurrentTime => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // 1分ごとに現在時刻を更新
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // 60秒 = 60000ms

    // クリーンアップ：コンポーネントアンマウント時にタイマーを解放
    return () => clearInterval(interval);
  }, []);

  // 0:00からの経過分を計算
  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  return { now, minutesFromMidnight };
};
