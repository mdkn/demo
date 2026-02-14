import { useState } from 'react';
import { ViewMode } from '@shared/types';
import { getWeekDays } from '@shared/utils/dateUtils';
import { WeekHeader } from '@shared/components/WeekHeader';
import { Toolbar } from '@shared/components/Toolbar';
import { AbsoluteWeekView } from '@absolute/AbsoluteWeekView';
import { GridWeekView } from '@grid/GridWeekView';
import styles from './App.module.css';

export const App = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('absolute');
  const days = getWeekDays();

  return (
    <div className={styles.app}>
      <h1>Calendar Comparison: Week Time Grid (F1)</h1>
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className={styles.viewContainer}>
        {viewMode === 'absolute' && (
          <div className={styles.view}>
            <h2>Absolute 方式</h2>
            <WeekHeader days={days} />
            <AbsoluteWeekView days={days} />
          </div>
        )}

        {viewMode === 'grid' && (
          <div className={styles.view}>
            <h2>Grid 方式</h2>
            <WeekHeader days={days} />
            <GridWeekView days={days} />
          </div>
        )}
      </div>
    </div>
  );
};
