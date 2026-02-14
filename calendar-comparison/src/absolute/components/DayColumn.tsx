import { forwardRef, useState } from 'react';
import type { DayInfo, CalendarEvent } from '@shared/types';
import { HOUR_HEIGHT } from '@shared/constants';
import { filterEventsByDay } from '@shared/utils/eventUtils';
import { useCurrentTime } from '@shared/hooks/useCurrentTime';
import { useAbsoluteLayout } from '../hooks/useAbsoluteLayout';
import { useCreateEvent } from '../hooks/useCreateEvent';
import { GridLines } from './GridLines';
import { EventBlock } from './EventBlock';
import { NowIndicator } from './NowIndicator';
import { CreationPlaceholder } from './CreationPlaceholder';
import styles from './DayColumn.module.css';

type DayColumnProps = {
  day: DayInfo;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5: 7つの日付列のDOM参照
  onDayHover?: (dayIndex: number | null) => void;           // F5: 列ハイライト用
  isDropTarget: boolean;                                     // F5: この列がドロップターゲットか
};

export const DayColumn = forwardRef<HTMLDivElement, DayColumnProps>(
  ({ day, events, onAddEvent, onUpdateEvent, containerRef, dayColumnRefs, onDayHover, isDropTarget }, ref) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算
  const layouts = useAbsoluteLayout(dayEvents, HOUR_HEIGHT);

  // 現在時刻を取得
  const { minutesFromMidnight } = useCurrentTime();

  // F7: Click-create event
  const [title, setTitle] = useState('');
  const { creationState, backgroundHandlers, onConfirm, onCancel } = useCreateEvent({
    onAdd: onAddEvent,
    hourHeight: HOUR_HEIGHT,
    dayInfo: day,
    containerRef,
  });

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  // Handle confirm
  const handleConfirm = (finalTitle: string) => {
    onConfirm(finalTitle);
    setTitle('');
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel();
    setTitle('');
  };

    return (
      <div
        ref={ref}
        className={`${styles.dayColumn} ${day.isToday ? styles.today : ''} ${
          isDropTarget ? styles.dropTarget : ''
        }`}
        {...backgroundHandlers}
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
        {creationState && (
          <CreationPlaceholder
            startMinutes={creationState.startMinutes}
            endMinutes={creationState.endMinutes}
            hourHeight={HOUR_HEIGHT}
            title={title}
            onTitleChange={handleTitleChange}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }
);

DayColumn.displayName = 'DayColumn';
