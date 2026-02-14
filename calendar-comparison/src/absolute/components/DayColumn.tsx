import { forwardRef } from 'react';
import type { DayInfo, CalendarEvent } from '@shared/types';
import { HOUR_HEIGHT } from '@shared/constants';
import { filterEventsByDay } from '@shared/utils/eventUtils';
import { useCurrentTime } from '@shared/hooks/useCurrentTime';
import { useAbsoluteLayout } from '../hooks/useAbsoluteLayout';
import { GridLines } from './GridLines';
import { EventBlock } from './EventBlock';
import { NowIndicator } from './NowIndicator';
import styles from './DayColumn.module.css';

type DayColumnProps = {
  day: DayInfo;
  events: CalendarEvent[];
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5: 7つの日付列のDOM参照
  onDayHover?: (dayIndex: number | null) => void;           // F5: 列ハイライト用
  isDropTarget: boolean;                                     // F5: この列がドロップターゲットか
};

export const DayColumn = forwardRef<HTMLDivElement, DayColumnProps>(
  ({ day, events, onUpdateEvent, containerRef, dayColumnRefs, onDayHover, isDropTarget }, ref) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算
  const layouts = useAbsoluteLayout(dayEvents, HOUR_HEIGHT);

  // 現在時刻を取得
  const { minutesFromMidnight } = useCurrentTime();

    return (
      <div
        ref={ref}
        className={`${styles.dayColumn} ${day.isToday ? styles.today : ''} ${
          isDropTarget ? styles.dropTarget : ''
        }`}
      >
        <GridLines />
        {layouts.map((layout) => (
          <EventBlock
            key={layout.event.id}
            layout={layout}
            onUpdate={onUpdateEvent}
            hourHeight={HOUR_HEIGHT}
            containerRef={containerRef}
            dayColumnRefs={dayColumnRefs}
            onDayHover={onDayHover}
          />
        ))}
        {day.isToday && (
          <NowIndicator minutesFromMidnight={minutesFromMidnight} hourHeight={HOUR_HEIGHT} />
        )}
      </div>
    );
  }
);

DayColumn.displayName = 'DayColumn';
