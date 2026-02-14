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
};

export const DayColumn = ({ day, events, onUpdateEvent, containerRef }: DayColumnProps) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算
  const layouts = useAbsoluteLayout(dayEvents, HOUR_HEIGHT);

  // 現在時刻を取得
  const { minutesFromMidnight } = useCurrentTime();

  return (
    <div className={`${styles.dayColumn} ${day.isToday ? styles.today : ''}`}>
      <GridLines />
      {layouts.map((layout) => (
        <EventBlock
          key={layout.event.id}
          layout={layout}
          onUpdate={onUpdateEvent}
          hourHeight={HOUR_HEIGHT}
          containerRef={containerRef}
        />
      ))}
      {day.isToday && (
        <NowIndicator minutesFromMidnight={minutesFromMidnight} hourHeight={HOUR_HEIGHT} />
      )}
    </div>
  );
};
