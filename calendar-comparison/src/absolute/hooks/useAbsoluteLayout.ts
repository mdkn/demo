import { useMemo } from 'react';
import type { CalendarEvent, AbsoluteEventLayout } from '@shared/types';
import { dateToMinutes } from '@shared/utils/dateUtils';
import { detectOverlaps, assignColumns } from '@shared/utils/overlapUtils';
import { useDragPreviewState } from '@shared/contexts/DragPreviewContext';

const MIN_HEIGHT = 15; // 最小表示高さ（15分相当）

/**
 * Absolute 方式のイベントレイアウト計算
 * @param events その日のイベント
 * @param hourHeight 1時間あたりのピクセル数
 * @returns レイアウト情報の配列
 */
export const useAbsoluteLayout = (
  events: CalendarEvent[],
  hourHeight: number
): AbsoluteEventLayout[] => {
  const { dragPreview } = useDragPreviewState();

  return useMemo(() => {
    // プレビューイベントを作成
    // 元のイベントは残し、プレビューを追加する（元のイベントはCSSで非表示にする）
    let allEvents = events;

    if (dragPreview) {
      const originalEvent = events.find(e => e.id === dragPreview.eventId);
      if (originalEvent) {
        // プレビューイベントを作成（仮の時刻を使用）
        const previewEvent: CalendarEvent = {
          ...originalEvent,
          id: `${originalEvent.id}-preview`,
          startAt: dragPreview.tempStartAt,
          endAt: dragPreview.tempEndAt,
        };

        // 元のイベントとプレビューの両方を含める
        allEvents = [...events, previewEvent];
      }
    }

    if (allEvents.length === 0) return [];

    // 重なりグループを検出
    const groups = detectOverlaps(allEvents);

    const layouts: AbsoluteEventLayout[] = [];

    for (const group of groups) {
      // カラム割り当て
      const withColumns = assignColumns(group);

      for (const { event, column, totalColumns } of withColumns) {
        const startDate = new Date(event.startAt);
        const endDate = new Date(event.endAt);

        // 縦位置: 0:00 からの経過分をピクセルに変換
        const startMinutes = dateToMinutes(startDate);
        const top = (startMinutes / 60) * hourHeight;

        // 高さ: duration をピクセルに変換（最小15px）
        const endMinutes = dateToMinutes(endDate);
        const durationMinutes = endMinutes - startMinutes;
        const height = Math.max((durationMinutes / 60) * hourHeight, MIN_HEIGHT);

        // 横位置: カラム番号からパーセンテージを計算
        const left = `${(column / totalColumns) * 100}%`;
        const width = `${(1 / totalColumns) * 100}%`;

        // zIndex: カラム番号が小さいほど前面（左側が前）
        const zIndex = 10 + column;

        layouts.push({
          event,
          top,
          left,
          width,
          height,
          zIndex,
        });
      }
    }

    return layouts;
  }, [events, dragPreview, hourHeight]);
};
