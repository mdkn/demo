import type { CalendarEvent } from '../types';

/**
 * イベントの重なり情報
 */
export type EventWithColumn = {
  event: CalendarEvent;
  column: number;      // 割り当てられた列番号（0-based）
  totalColumns: number; // このグループの総列数
};

/**
 * 2つのイベントが時間的に重なっているかを判定
 * @param eventA イベントA
 * @param eventB イベントB
 * @returns 重なっている場合 true
 */
export const eventsOverlap = (
  eventA: CalendarEvent,
  eventB: CalendarEvent
): boolean => {
  const startA = new Date(eventA.startAt);
  const endA = new Date(eventA.endAt);
  const startB = new Date(eventB.startAt);
  const endB = new Date(eventB.endAt);

  // A の開始 < B の終了 AND B の開始 < A の終了
  return startA < endB && startB < endA;
};

/**
 * 重なるイベントのグループを検出
 * @param events イベント配列
 * @returns 重なるグループの配列
 */
export const detectOverlaps = (
  events: CalendarEvent[]
): CalendarEvent[][] => {
  if (events.length === 0) return [];

  // 開始時刻順にソート（同じ時刻の場合はIDの辞書順）
  const sorted = [...events].sort((a, b) => {
    const timeCompare = new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    return timeCompare !== 0 ? timeCompare : a.id.localeCompare(b.id);
  });

  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    // 現在のグループのいずれかと重なるか確認
    const overlapsWithGroup = currentGroup.some((event) =>
      eventsOverlap(event, current)
    );

    if (overlapsWithGroup) {
      currentGroup.push(current);
    } else {
      // 新しいグループを開始
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }

  // 最後のグループを追加
  groups.push(currentGroup);

  return groups;
};

/**
 * グループ内のイベントにカラム番号を割り当て
 * @param group 重なるイベントのグループ
 * @returns カラム情報付きイベント
 */
export const assignColumns = (
  group: CalendarEvent[]
): EventWithColumn[] => {
  if (group.length === 0) return [];
  if (group.length === 1) {
    return [{ event: group[0], column: 0, totalColumns: 1 }];
  }

  // 開始時刻順にソート
  const sorted = [...group].sort((a, b) => {
    const timeCompare = new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    return timeCompare !== 0 ? timeCompare : a.id.localeCompare(b.id);
  });

  const columns: CalendarEvent[][] = [];
  const result: EventWithColumn[] = [];

  for (const event of sorted) {
    // 空いている列を探す
    let assignedColumn = -1;

    for (let col = 0; col < columns.length; col++) {
      const columnEvents = columns[col];
      // この列の全てのイベントと重ならなければ配置可能
      const canPlace = columnEvents.every((colEvent) => !eventsOverlap(colEvent, event));
      if (canPlace) {
        assignedColumn = col;
        break;
      }
    }

    // 空いている列がなければ新しい列を作成
    if (assignedColumn === -1) {
      assignedColumn = columns.length;
      columns.push([]);
    }

    columns[assignedColumn].push(event);
  }

  // 結果を生成
  for (let col = 0; col < columns.length; col++) {
    for (const event of columns[col]) {
      result.push({
        event,
        column: col,
        totalColumns: columns.length,
      });
    }
  }

  return result;
};

/**
 * 2つの数の最小公倍数を計算
 * @param a 数値A
 * @param b 数値B
 * @returns 最小公倍数
 */
export const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

export const lcm = (a: number, b: number): number => {
  return (a * b) / gcd(a, b);
};

/**
 * 複数の数値の最小公倍数を計算
 * @param numbers 数値配列
 * @returns 最小公倍数
 */
export const calculateLCM = (numbers: number[]): number => {
  if (numbers.length === 0) return 1;
  if (numbers.length === 1) return numbers[0];

  return numbers.reduce((acc, num) => lcm(acc, num), 1);
};
