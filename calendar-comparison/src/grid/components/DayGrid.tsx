import { DayInfo } from '@shared/types';
import styles from './DayGrid.module.css';

type DayGridProps = {
  day: DayInfo;
};

export const DayGrid = ({ day }: DayGridProps) => {
  return (
    <div
      className={`${styles.dayGrid} ${day.isToday ? styles.today : ''}`}
      style={{ gridColumn: day.columnIndex + 1 }}
    />
  );
};
