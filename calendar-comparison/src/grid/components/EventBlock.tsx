import type { GridEventLayout } from '@shared/types';
import styles from './EventBlock.module.css';

type EventBlockProps = {
  layout: GridEventLayout;
};

export const EventBlock = ({ layout }: EventBlockProps) => {
  const { event, gridRow, gridColumn, colSpan } = layout;

  const style: React.CSSProperties = {
    gridRow,
    gridColumn: `${gridColumn} / span ${colSpan}`,
    backgroundColor: event.color,
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // grid-row の span から高さを推定（簡易的に30分以上で時刻表示）
  const duration = parseInt(gridRow.split('span ')[1]);
  const showTime = duration > 30;

  return (
    <div className={styles.eventBlock} style={style}>
      <div className={styles.title}>{event.title}</div>
      {showTime && (
        <div className={styles.time}>
          {formatTime(event.startAt)} - {formatTime(event.endAt)}
        </div>
      )}
    </div>
  );
};
