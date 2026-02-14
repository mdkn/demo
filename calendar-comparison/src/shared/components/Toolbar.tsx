import { ViewMode } from '@shared/types';
import styles from './Toolbar.module.css';

type ToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export const Toolbar = ({ viewMode, onViewModeChange }: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <button
        className={viewMode === 'absolute' ? styles.active : ''}
        onClick={() => onViewModeChange('absolute')}
      >
        Absolute Only
      </button>
      <button
        className={viewMode === 'grid' ? styles.active : ''}
        onClick={() => onViewModeChange('grid')}
      >
        Grid Only
      </button>
    </div>
  );
};
