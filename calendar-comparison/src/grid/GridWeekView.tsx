import { useRef, useEffect } from 'react';
import { DayInfo } from '@shared/types';
import { DEFAULT_SCROLL_TOP } from '@shared/constants';
import { TimeLabels } from '@shared/components/TimeLabels';
import { DayGrid } from './components/DayGrid';
import styles from './GridWeekView.module.css';

type GridWeekViewProps = {
  days: DayInfo[];
};

export const GridWeekView = ({ days }: GridWeekViewProps) => {
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
          <DayGrid key={day.columnIndex} day={day} />
        ))}
      </div>
    </div>
  );
};
