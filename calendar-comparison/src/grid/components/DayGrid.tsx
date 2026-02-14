import type { DayInfo, CalendarEvent } from '@shared/types';
import { filterEventsByDay } from '@shared/utils/eventUtils';
import { useCurrentTime } from '@shared/hooks/useCurrentTime';
import { useGridLayout } from '../hooks/useGridLayout';
import { EventBlock } from './EventBlock';
import { NowIndicator } from './NowIndicator';
import styles from './DayGrid.module.css';

type DayGridProps = {
  day: DayInfo;
  events: CalendarEvent[];
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export const DayGrid = ({ day, events, onUpdateEvent, containerRef }: DayGridProps) => {
  // その日のイベントをフィルタリング
  const dayEvents = filterEventsByDay(events, day.date);

  // レイアウト計算（LCM列数も取得）
  const { layouts, totalColumns } = useGridLayout(dayEvents);

  // 現在時刻を取得
  const { minutesFromMidnight } = useCurrentTime();

  // グリッドテンプレートカラムを動的に生成
  const gridTemplateColumns = `repeat(${totalColumns}, 1fr)`;

  return (
    <div
      className={`${styles.dayGrid} ${day.isToday ? styles.today : ''}`}
      style={{
        gridColumn: day.columnIndex + 1,
        gridTemplateColumns,
      }}
    >
      {layouts.map((layout) => (
        <EventBlock
          key={layout.event.id}
          layout={layout}
          onUpdate={onUpdateEvent}
          containerRef={containerRef}
        />
      ))}
      {day.isToday && <NowIndicator minutesFromMidnight={minutesFromMidnight} />}
    </div>
  );
};
