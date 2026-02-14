import { useRef, useEffect, useState } from 'react';
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
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // F5: Create refs for each day column (0-6)
  const day0Ref = useRef<HTMLDivElement>(null);
  const day1Ref = useRef<HTMLDivElement>(null);
  const day2Ref = useRef<HTMLDivElement>(null);
  const day3Ref = useRef<HTMLDivElement>(null);
  const day4Ref = useRef<HTMLDivElement>(null);
  const day5Ref = useRef<HTMLDivElement>(null);
  const day6Ref = useRef<HTMLDivElement>(null);

  const dayColumnRefs = [day0Ref, day1Ref, day2Ref, day3Ref, day4Ref, day5Ref, day6Ref];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, []);

  // F5: Column hover handler for drag & drop
  const handleDayHover = (dayIndex: number | null) => {
    setHoveredDayIndex(dayIndex);
  };

  return (
    <div className={styles.weekView}>
      <TimeLabels />
      <div ref={containerRef} className={styles.dayColumnsContainer}>
        {days.map((day, index) => (
          <DayColumn
            key={day.columnIndex}
            ref={dayColumnRefs[index]}
            day={day}
            events={events}
            onUpdateEvent={onUpdateEvent}
            containerRef={containerRef}
            dayColumnRefs={dayColumnRefs}
            onDayHover={handleDayHover}
            isDropTarget={hoveredDayIndex === index}
          />
        ))}
      </div>
    </div>
  );
};
