import { forwardRef, useState } from 'react';
import type { DayInfo, CalendarEvent } from '@shared/types';
import { HOUR_HEIGHT } from '@shared/constants';
import { filterEventsByDay } from '@shared/utils/eventUtils';
import { useCurrentTime } from '@shared/hooks/useCurrentTime';
import { useGridLayout } from '../hooks/useGridLayout';
import { useCreateEvent } from '../hooks/useCreateEvent';
import { EventBlock } from './EventBlock';
import { NowIndicator } from './NowIndicator';
import { CreationPlaceholder } from './CreationPlaceholder';
import styles from './DayGrid.module.css';

type DayGridProps = {
  day: DayInfo;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5: 7つの日付列のDOM参照
  onDayHover?: (dayIndex: number | null) => void;           // F5: 列ハイライト用
  isDropTarget: boolean;                                     // F5: この列がドロップターゲットか
};

export const DayGrid = forwardRef<HTMLDivElement, DayGridProps>(
  ({ day, events, onAddEvent, onUpdateEvent, containerRef, dayColumnRefs, onDayHover, isDropTarget }, ref) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算（LCM列数も取得）
  const { layouts, totalColumns } = useGridLayout(dayEvents);

  // 現在時刻を取得
  const { minutesFromMidnight } = useCurrentTime();

  // グリッドテンプレートカラムを動的に生成
  const gridTemplateColumns = `repeat(${totalColumns}, 1fr)`;

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
        className={`${styles.dayGrid} ${day.isToday ? styles.today : ''} ${
          isDropTarget ? styles.dropTarget : ''
        }`}
        style={{
          gridColumn: day.columnIndex + 1,
          gridTemplateColumns,
        }}
        {...backgroundHandlers}
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
        {creationState && (
          <CreationPlaceholder
            startMinutes={creationState.startMinutes}
            endMinutes={creationState.endMinutes}
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

DayGrid.displayName = 'DayGrid';
