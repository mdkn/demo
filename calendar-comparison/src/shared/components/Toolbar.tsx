import { ViewMode } from '@shared/types';
import styles from './Toolbar.module.css';

type ToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onReset?: () => void;
};

export const Toolbar = ({ viewMode, onViewModeChange, onReset }: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.buttonGroup}>
        <button
          className={viewMode === 'absolute' ? styles.active : ''}
          onClick={() => onViewModeChange('absolute')}
        >
          Absolute
        </button>
        <button
          className={viewMode === 'grid' ? styles.active : ''}
          onClick={() => onViewModeChange('grid')}
        >
          Grid
        </button>
      </div>

      {onReset && (
        <button className={styles.resetButton} onClick={onReset}>
          Reset Sample Data
        </button>
      )}
    </div>
  );
};
