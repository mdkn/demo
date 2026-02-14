import type { AbsoluteEventLayout } from '@shared/types';
import styles from './EventBlock.module.css';

type EventBlockProps = {
  layout: AbsoluteEventLayout;
};

export const EventBlock = ({ layout }: EventBlockProps) => {
  const { event, top, left, width, height, zIndex } = layout;

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    left,
    width,
    height: `${height}px`,
    zIndex,
    backgroundColor: event.color,
  };

  // 高さが30px以上の場合のみ時刻を表示
  const showTime = height > 30;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

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
