import { useState } from 'react';
import { ViewMode } from '@shared/types';
import { getWeekDays } from '@shared/utils/dateUtils';
import { useCalendarEvents } from '@shared/hooks/useCalendarEvents';
import { WeekHeader } from '@shared/components/WeekHeader';
import { Toolbar } from '@shared/components/Toolbar';
import { AbsoluteWeekView } from '@absolute/AbsoluteWeekView';
import { GridWeekView } from '@grid/GridWeekView';
import styles from './App.module.css';

export const App = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('absolute');
  const days = getWeekDays();
  const { events, addEvent, updateEvent, resetEvents } = useCalendarEvents();

  return (
    <div className={styles.app}>
      <h1>Calendar Comparison: Drag & Drop (F4)</h1>
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={resetEvents}
      />

      <div className={styles.viewContainer}>
        {viewMode === 'absolute' && (
          <div className={styles.view}>
            <h2>Absolute 方式</h2>
            <WeekHeader days={days} />
            <AbsoluteWeekView days={days} events={events} onAddEvent={addEvent} onUpdateEvent={updateEvent} />
          </div>
        )}

        {viewMode === 'grid' && (
          <div className={styles.view}>
            <h2>Grid 方式</h2>
            <WeekHeader days={days} />
            <GridWeekView days={days} events={events} onAddEvent={addEvent} onUpdateEvent={updateEvent} />
          </div>
        )}
      </div>
    </div>
  );
};
