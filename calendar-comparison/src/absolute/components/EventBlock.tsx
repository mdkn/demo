import type { AbsoluteEventLayout, CalendarEvent } from '@shared/types';
import { useDragEvent } from '../hooks/useDragEvent';
import styles from './EventBlock.module.css';

type EventBlockProps = {
  layout: AbsoluteEventLayout;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5
  onDayHover?: (dayIndex: number | null) => void;           // F5
};

export const EventBlock = ({
  layout,
  onUpdate,
  hourHeight,
  containerRef,
  dayColumnRefs,
  onDayHover,
}: EventBlockProps) => {
  const { event, top, left, width, height, zIndex } = layout;

  // Drag event hook (F4 + F5)
  const { isDragging, eventHandlers } = useDragEvent({
    event,
    onUpdate,
    hourHeight,
    containerRef,
    dayColumnRefs,
    onDayHover,
  });

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
