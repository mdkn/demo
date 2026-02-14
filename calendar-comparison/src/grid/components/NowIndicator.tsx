import styles from './NowIndicator.module.css';

type NowIndicatorProps = {
  minutesFromMidnight: number; // 0-1439
};

export const NowIndicator = ({ minutesFromMidnight }: NowIndicatorProps) => {
  return (
    <div
      className={styles.indicator}
      style={{
        gridRowStart: minutesFromMidnight,
        gridColumn: '1 / -1', // 全列に跨る
      }}
    >
      <div className={styles.dot} />
      <div className={styles.line} />
    </div>
  );
};
