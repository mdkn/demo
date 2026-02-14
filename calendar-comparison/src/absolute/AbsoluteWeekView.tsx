import { useRef, useEffect } from 'react';
import type { DayInfo, CalendarEvent } from '@shared/types';
import { DEFAULT_SCROLL_TOP } from '@shared/constants';
import { TimeLabels } from '@shared/components/TimeLabels';
import { DayColumn } from './components/DayColumn';
import styles from './AbsoluteWeekView.module.css';

type AbsoluteWeekViewProps = {
  days: DayInfo[];
  events: CalendarEvent[];
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
};

export const AbsoluteWeekView = ({ days, events, onUpdateEvent }: AbsoluteWeekViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, []);

  return (
    <div className={styles.weekView}>
      <TimeLabels />
      <div ref={containerRef} className={styles.dayColumnsContainer}>
        {days.map((day) => (
          <DayColumn
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
