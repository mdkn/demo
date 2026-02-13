import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Memo, LayoutItem, AppState } from '../types';
import { DEFAULT_COLOR, DEFAULT_MEMO_SIZE, GRID_CONFIG } from '../constants/colors';

/**
 * Custom hook for managing memos and their grid layout
 */
export const useMemos = () => {
  const [state, setState] = useLocalStorage<AppState>('grid-memo-state', {
    memos: [],
    layout: [],
  });

  /**
   * Find the nearest empty space that can accommodate a memo of given size
   */
  const findNearestEmptySpace = useCallback(
    (targetX: number, targetY: number, width: number, height: number): { x: number; y: number } => {
      const { layout } = state;

      // Helper function to check if a position overlaps with existing memos
      const hasOverlap = (x: number, y: number, w: number, h: number): boolean => {
        return layout.some((item) => {
          const xOverlap = x < item.x + item.w && x + w > item.x;
          const yOverlap = y < item.y + item.h && y + h > item.y;
          return xOverlap && yOverlap;
        });
      };

      // Adjust to fit within grid boundaries
      let x = Math.min(targetX, GRID_CONFIG.cols - width);
      let y = targetY;
      x = Math.max(0, x); // Ensure non-negative
      y = Math.max(0, y);

      // If the target position is free, use it
      if (!hasOverlap(x, y, width, height)) {
        return { x, y };
      }

      // Search for nearest available space in a spiral pattern
      let searchRadius = 1;
      const maxSearch = 20; // Limit search to prevent infinite loops

      while (searchRadius < maxSearch) {
        // Try positions in expanding rings around the target
        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
          for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            // Only check positions on the edge of the current ring
            if (Math.abs(dx) === searchRadius || Math.abs(dy) === searchRadius) {
              const testX = Math.max(0, Math.min(GRID_CONFIG.cols - width, targetX + dx));
              const testY = Math.max(0, targetY + dy);

              if (!hasOverlap(testX, testY, width, height)) {
                return { x: testX, y: testY };
              }
            }
          }
        }
        searchRadius++;
      }

      // Fallback: place at bottom if no space found
      const maxY = layout.length > 0
        ? Math.max(...layout.map(item => item.y + item.h))
        : 0;

      return { x: 0, y: maxY };
    },
    [state]
  );

  /**
   * Add a new memo at the specified grid position
   */
  const addMemo = useCallback(
    (targetX: number, targetY: number) => {
      const id = crypto.randomUUID();
      const { w, h } = DEFAULT_MEMO_SIZE;

      // Find best position (handles boundaries and overlaps)
      const { x, y } = findNearestEmptySpace(targetX, targetY, w, h);

      const newMemo: Memo = {
        id,
        content: '',
        color: DEFAULT_COLOR,
      };

      const newLayoutItem: LayoutItem = {
        i: id,
        x,
        y,
        w,
        h,
      };

      setState({
        memos: [...state.memos, newMemo],
        layout: [...state.layout, newLayoutItem],
      });

      return id; // Return ID for potential use (e.g., auto-focus)
    },
    [state, setState, findNearestEmptySpace]
  );

  /**
   * Update memo content
   */
  const updateMemo = useCallback(
    (id: string, content: string) => {
      setState({
        ...state,
        memos: state.memos.map((memo) =>
          memo.id === id ? { ...memo, content } : memo
        ),
      });
    },
    [state, setState]
  );

  /**
   * Delete a memo
   */
  const deleteMemo = useCallback(
    (id: string) => {
      setState({
        memos: state.memos.filter((memo) => memo.id !== id),
        layout: state.layout.filter((item) => item.i !== id),
      });
    },
    [state, setState]
  );

  /**
   * Update memo background color
   */
  const updateMemoColor = useCallback(
    (id: string, color: string) => {
      setState({
        ...state,
        memos: state.memos.map((memo) =>
          memo.id === id ? { ...memo, color } : memo
        ),
      });
    },
    [state, setState]
  );

  /**
   * Update layout (called by react-grid-layout on drag/resize)
   */
  const updateLayout = useCallback(
    (newLayout: LayoutItem[]) => {
      setState({
        ...state,
        layout: newLayout,
      });
    },
    [state, setState]
  );

  /**
   * Reset all memos and layout
   */
  const resetAll = useCallback(() => {
    setState({
      memos: [],
      layout: [],
    });
  }, [setState]);

  return {
    memos: state.memos,
    layout: state.layout,
    addMemo,
    updateMemo,
    deleteMemo,
    updateMemoColor,
    updateLayout,
    resetAll,
  };
}
