import { useRef, useEffect } from 'react';
import type { DayInfo, CalendarEvent } from '@shared/types';
import { DEFAULT_SCROLL_TOP } from '@shared/constants';
import { TimeLabels } from '@shared/components/TimeLabels';
import { DayGrid } from './components/DayGrid';
import styles from './GridWeekView.module.css';

type GridWeekViewProps = {
  days: DayInfo[];
  events: CalendarEvent[];
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
};

export const GridWeekView = ({ days, events, onUpdateEvent }: GridWeekViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, []);

  return (
    <div className={styles.weekView}>
      <TimeLabels />
      <div ref={containerRef} className={styles.weekGrid}>
        {days.map((day) => (
          <DayGrid
            key={day.columnIndex}
            day={day}
            events={events}
            onUpdateEvent={onUpdateEvent}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
};
