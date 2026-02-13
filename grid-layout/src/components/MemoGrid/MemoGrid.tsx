import { useState, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import type { Memo, LayoutItem } from '../../types';
import { MemoCard } from '../MemoCard/MemoCard';
import { GRID_CONFIG } from '../../constants/colors';
import 'react-grid-layout/css/styles.css';
import styles from './MemoGrid.module.scss';

interface MemoGridProps {
  memos: Memo[];
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  onAddMemo: (x: number, y: number) => void;
  onUpdateMemo: (id: string, content: string) => void;
  onDeleteMemo: (id: string) => void;
  onUpdateMemoColor: (id: string, color: string) => void;
}

export const MemoGrid = ({
  memos,
  layout,
  onLayoutChange,
  onAddMemo,
  onUpdateMemo,
  onDeleteMemo,
  onUpdateMemoColor,
}: MemoGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);

  /**
   * Calculate grid position from click coordinates
   */
  const calculateGridPosition = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!gridRef.current) return { x: 0, y: 0 };

    const rect = gridRef.current.getBoundingClientRect();
    const { cols, rowHeight, margin, containerPadding } = GRID_CONFIG;

    // Calculate relative position within grid
    const relativeX = clientX - rect.left - containerPadding[0];
    const relativeY = clientY - rect.top - containerPadding[1];

    // Calculate column width
    const totalMarginWidth = margin[0] * (cols - 1);
    const availableWidth = rect.width - containerPadding[0] * 2 - totalMarginWidth;
    const columnWidth = availableWidth / cols;

    // Convert to grid coordinates
    const x = Math.floor(relativeX / (columnWidth + margin[0]));
    const y = Math.floor(relativeY / (rowHeight + margin[1]));

    return {
      x: Math.max(0, Math.min(x, cols - 1)),
      y: Math.max(0, y),
    };
  };

  /**
   * Handle double-click to create new memo
   */
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't create memo if clicking on a memo card or any of its children
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const clickedOnMemo = e.target.closest('.react-grid-item');

    if (!clickedOnMemo) {
      const { x, y } = calculateGridPosition(e.clientX, e.clientY);
      onAddMemo(x, y);
    }
  };

  /**
   * Handle layout changes from react-grid-layout
   */
  const handleLayoutChange = (newLayout: Layout[]) => {
    // Convert Layout[] to LayoutItem[]
    const layoutItems: LayoutItem[] = newLayout.map(item => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));
    onLayoutChange(layoutItems);
  };

  /**
   * Get modified layout with dragging disabled for memos in edit mode
   */
  const getLayoutWithEditMode = () => {
    return layout.map((item) => ({
      ...item,
      isDraggable: item.i !== editingMemoId,
      isResizable: item.i !== editingMemoId,
    }));
  };

  return (
    <div
      ref={gridRef}
      className={styles.gridContainer}
      onDoubleClick={handleDoubleClick}
    >
      {memos.length === 0 && (
        <div className={styles.emptyMessage}>
          <div className={styles.icon}>📝</div>
          <div className={styles.text}>No memos yet</div>
          <div className={styles.hint}>Double-click anywhere to create a memo</div>
        </div>
      )}

      <GridLayout
        className={styles.layout}
        layout={getLayoutWithEditMode()}
        cols={GRID_CONFIG.cols}
        rowHeight={GRID_CONFIG.rowHeight}
        width={gridRef.current?.clientWidth || 1200}
        onLayoutChange={handleLayoutChange}
        compactType={null}
        preventCollision={false}
      >
        {memos.map((memo) => (
          <div key={memo.id} className={styles.gridItem}>
            <MemoCard
              memo={memo}
              isEditing={editingMemoId === memo.id}
              onUpdate={(content) => onUpdateMemo(memo.id, content)}
              onDelete={() => onDeleteMemo(memo.id)}
              onColorChange={(color) => onUpdateMemoColor(memo.id, color)}
              onEditModeChange={(editing) => setEditingMemoId(editing ? memo.id : null)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
