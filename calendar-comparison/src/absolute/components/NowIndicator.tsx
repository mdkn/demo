import styles from './NowIndicator.module.css';

type NowIndicatorProps = {
  minutesFromMidnight: number; // 0-1439
  hourHeight: number;          // 60px (通常)
};

export const NowIndicator = ({ minutesFromMidnight, hourHeight }: NowIndicatorProps) => {
  // top位置を計算: 分 → ピクセル
  const top = (minutesFromMidnight / 60) * hourHeight;

  return (
    <div className={styles.indicator} style={{ top: `${top}px` }}>
      <div className={styles.dot} />
      <div className={styles.line} />
    </div>
  );
};
