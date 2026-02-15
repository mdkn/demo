import { HOUR_HEIGHT } from '@shared/constants';
import styles from './GridLines.module.css';

export const GridLines = () => {
  return (
    <>
      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={styles.gridLine}
          style={{ top: hour * HOUR_HEIGHT }}
        />
      ))}
    </>
  );
};
