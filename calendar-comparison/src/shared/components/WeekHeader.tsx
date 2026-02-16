import { DayInfo } from '@shared/types';
import styles from './WeekHeader.module.css';

type WeekHeaderProps = {
  days: DayInfo[];
};

export const WeekHeader = ({ days }: WeekHeaderProps) => {
  return (
    <div className={styles.weekHeader}>
      <div className={styles.timeLabelSpacer} />
      {days.map((day) => (
        <div
          key={day.columnIndex}
          className={`${styles.dayHeader} ${day.isToday ? styles.today : ''}`}
        >
          <span className={styles.dayOfWeek}>{day.dayOfWeek}</span>
          <span className={styles.dateLabel}>{day.dateLabel}</span>
        </div>
      ))}
    </div>
  );
};
