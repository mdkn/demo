import type { GridEventLayout, CalendarEvent } from '@shared/types';
import { useDragEvent } from '../hooks/useDragEvent';
import styles from './EventBlock.module.css';

type EventBlockProps = {
  layout: GridEventLayout;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export const EventBlock = ({ layout, onUpdate, containerRef }: EventBlockProps) => {
  const { event, gridRow, gridColumn, colSpan } = layout;

  // Drag event hook
  const { isDragging, eventHandlers } = useDragEvent({
    event,
    onUpdate,
    containerRef,
  });

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
    <div
      className={`${styles.eventBlock} ${isDragging ? styles.dragging : styles.grabbable}`}
      style={style}
      {...eventHandlers}
    >
      <div className={styles.title}>{event.title}</div>
      {showTime && (
        <div className={styles.time}>
          {formatTime(event.startAt)} - {formatTime(event.endAt)}
        </div>
      )}
    </div>
  );
};
