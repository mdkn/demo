import { forwardRef } from 'react';
import type { DayInfo, CalendarEvent } from '@shared/types';
import { filterEventsByDay } from '@shared/utils/eventUtils';
import { useCurrentTime } from '@shared/hooks/useCurrentTime';
import { useGridLayout } from '../hooks/useGridLayout';
import { EventBlock } from './EventBlock';
import { NowIndicator } from './NowIndicator';
import styles from './DayGrid.module.css';

type DayGridProps = {
  day: DayInfo;
  events: CalendarEvent[];
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5: 7つの日付列のDOM参照
  onDayHover?: (dayIndex: number | null) => void;           // F5: 列ハイライト用
  isDropTarget: boolean;                                     // F5: この列がドロップターゲットか
};

export const DayGrid = forwardRef<HTMLDivElement, DayGridProps>(
  ({ day, events, onUpdateEvent, containerRef, dayColumnRefs, onDayHover, isDropTarget }, ref) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算（LCM列数も取得）
  const { layouts, totalColumns } = useGridLayout(dayEvents);

  // 現在時刻を取得
  const { minutesFromMidnight } = useCurrentTime();

  // グリッドテンプレートカラムを動的に生成
  const gridTemplateColumns = `repeat(${totalColumns}, 1fr)`;

    return (
      <div
        ref={ref}
        className={`${styles.dayGrid} ${day.isToday ? styles.today : ''} ${
          isDropTarget ? styles.dropTarget : ''
        }`}
        style={{
          gridColumn: day.columnIndex + 1,
          gridTemplateColumns,
        }}
      >
        {layouts.map((layout) => (
          <EventBlock
            key={layout.event.id}
            layout={layout}
            onUpdate={onUpdateEvent}
            containerRef={containerRef}
            dayColumnRefs={dayColumnRefs}
            onDayHover={onDayHover}
          />
        ))}
        {day.isToday && <NowIndicator minutesFromMidnight={minutesFromMidnight} />}
      </div>
    );
  }
);

DayGrid.displayName = 'DayGrid';
