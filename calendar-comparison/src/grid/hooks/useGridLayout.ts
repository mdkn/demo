import { useMemo } from 'react';
import type { CalendarEvent, GridEventLayout } from '@shared/types';
import { dateToMinutes } from '@shared/utils/dateUtils';
import { detectOverlaps, assignColumns, calculateLCM } from '@shared/utils/overlapUtils';
import { useDragPreview } from '@shared/contexts/DragPreviewContext';

const MIN_DURATION = 15; // 最小イベント長（15分）

/**
 * Grid 方式のイベントレイアウト計算
 * @param events その日のイベント
 * @returns レイアウト情報とLCM列数
 */
export const useGridLayout = (
  events: CalendarEvent[]
): { layouts: GridEventLayout[]; totalColumns: number } => {
  const { dragPreview } = useDragPreview();

  return useMemo(() => {
    // プレビューイベントを作成
    let allEvents = events;

    if (dragPreview) {
      const originalEvent = events.find(e => e.id === dragPreview.eventId);
      if (originalEvent) {
        // 元のイベントを除外
        const otherEvents = events.filter(e => e.id !== dragPreview.eventId);

        // プレビューイベントを作成（仮の時刻を使用）
        const previewEvent: CalendarEvent = {
          ...originalEvent,
          startAt: dragPreview.tempStartAt,
          endAt: dragPreview.tempEndAt,
        };

        allEvents = [...otherEvents, previewEvent];
      }
    }

    if (allEvents.length === 0) {
      return { layouts: [], totalColumns: 1 };
    }

    // 重なりグループを検出
    const groups = detectOverlaps(allEvents);

    // 各グループの列数を収集
    const columnCounts = groups.map((group) => assignColumns(group)[0].totalColumns);

    // LCM で統一列数を計算
    const totalColumns = calculateLCM(columnCounts);

    const layouts: GridEventLayout[] = [];

    for (const group of groups) {
      // カラム割り当て
      const withColumns = assignColumns(group);

      for (const { event, column, totalColumns: groupColumns } of withColumns) {
        const startDate = new Date(event.startAt);
        const endDate = new Date(event.endAt);

        // grid-row: 開始分と継続分
        const startMinutes = dateToMinutes(startDate);
        const endMinutes = dateToMinutes(endDate);
        const durationMinutes = Math.max(endMinutes - startMinutes, MIN_DURATION);

        const gridRow = `${startMinutes} / span ${durationMinutes}`;

        // grid-column: LCM 列数に合わせてスケール
        const scale = totalColumns / groupColumns;
        const gridColumn = column * scale + 1; // 1-based
        const colSpan = scale;

        layouts.push({
          event,
          gridRow,
          gridColumn,
          colSpan,
        });
      }
    }

    return { layouts, totalColumns };
  }, [events, dragPreview]);
};
