import { DayInfo } from '@shared/types';
import { GridLines } from './GridLines';
import styles from './DayColumn.module.css';

type DayColumnProps = {
  day: DayInfo;
};

export const DayColumn = ({ day }: DayColumnProps) => {
  return (
    <div className={`${styles.dayColumn} ${day.isToday ? styles.today : ''}`}>
      <GridLines />
    </div>
  );
};
