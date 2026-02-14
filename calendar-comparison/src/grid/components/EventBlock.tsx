import type { GridEventLayout, CalendarEvent } from '@shared/types';
import { useDragEvent } from '../hooks/useDragEvent';
import { useResizeEvent } from '../hooks/useResizeEvent';
import { ResizeHandle } from './ResizeHandle';
import { Tooltip } from '@shared/components/Tooltip';
import styles from './EventBlock.module.css';

type EventBlockProps = {
  layout: GridEventLayout;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5
  onDayHover?: (dayIndex: number | null) => void;           // F5
};

export const EventBlock = ({
  layout,
  onUpdate,
  containerRef,
  dayColumnRefs,
  onDayHover,
}: EventBlockProps) => {
  const { event, gridRow, gridColumn, colSpan } = layout;

  // Drag event hook (F4 + F5)
  const { isDragging, eventHandlers } = useDragEvent({
    event,
    onUpdate,
    containerRef,
    dayColumnRefs,
    onDayHover,
  });

  // Resize event hook (F6)
  const { isResizing, tooltipState, topHandleProps, bottomHandleProps } = useResizeEvent({
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

  // Determine CSS class based on state
  const stateClass = isResizing ? styles.resizing : isDragging ? styles.dragging : styles.grabbable;

  return (
    <>
      <div
        className={`${styles.eventBlock} ${stateClass}`}
        style={style}
        {...eventHandlers}
      >
        {/* F6: Top resize handle */}
        <ResizeHandle position="top" {...topHandleProps} />

        <div className={styles.title}>{event.title}</div>
        {showTime && (
          <div className={styles.time}>
            {formatTime(event.startAt)} - {formatTime(event.endAt)}
          </div>
        )}

        {/* F6: Bottom resize handle */}
        <ResizeHandle position="bottom" {...bottomHandleProps} />
      </div>

      {/* F6: Resize tooltip */}
      <Tooltip {...tooltipState} />
    </>
  );
};
