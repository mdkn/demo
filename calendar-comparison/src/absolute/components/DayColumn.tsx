import type { DayInfo, CalendarEvent } from '@shared/types';
import { HOUR_HEIGHT } from '@shared/constants';
import { filterEventsByDay } from '@shared/utils/eventUtils';
import { useAbsoluteLayout } from '../hooks/useAbsoluteLayout';
import { GridLines } from './GridLines';
import { EventBlock } from './EventBlock';
import styles from './DayColumn.module.css';

type DayColumnProps = {
  day: DayInfo;
  events: CalendarEvent[];
};

export const DayColumn = ({ day, events }: DayColumnProps) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算
  const layouts = useAbsoluteLayout(dayEvents, HOUR_HEIGHT);

  return (
    <div className={`${styles.dayColumn} ${day.isToday ? styles.today : ''}`}>
      <GridLines />
      {layouts.map((layout) => (
        <EventBlock key={layout.event.id} layout={layout} />
      ))}
    </div>
  );
};
