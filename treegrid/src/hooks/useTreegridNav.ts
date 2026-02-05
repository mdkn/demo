import { useCallback } from 'react';
import { FlattenedRow, FocusState } from '../types';

interface UseTreegridNavParams {
  visibleRows: FlattenedRow[];
  expandedIds: Set<string>;
  focusState: FocusState;
  setFocusState: (state: FocusState) => void;
  toggleExpand: (nodeId: string) => void;
}

export function useTreegridNav({
  visibleRows,
  expandedIds,
  focusState,
  setFocusState,
  toggleExpand,
}: UseTreegridNavParams) {
  const getCurrentRowIndex = useCallback(() => {
    return visibleRows.findIndex((row) => row.node.id === focusState.rowId);
  }, [visibleRows, focusState.rowId]);

  const focusRow = useCallback(
    (index: number) => {
      if (index >= 0 && index < visibleRows.length) {
        setFocusState({
          mode: 'row',
          rowId: visibleRows[index].node.id,
        });
      }
    },
    [visibleRows, setFocusState]
  );

  const focusCell = useCallback(
    (rowIndex: number, columnIndex: number) => {
      if (rowIndex >= 0 && rowIndex < visibleRows.length && columnIndex >= 0 && columnIndex <= 2) {
        setFocusState({
          mode: 'cell',
          rowId: visibleRows[rowIndex].node.id,
          columnIndex,
        });
      }
    },
    [visibleRows, setFocusState]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = getCurrentRowIndex();
      if (currentIndex === -1) return;

      const currentRow = visibleRows[currentIndex];
      const isFolder = currentRow.node.type === 'folder';

      if (focusState.mode === 'row') {
        // Row focus mode
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            focusRow(currentIndex + 1);
            break;

          case 'ArrowUp':
            e.preventDefault();
            focusRow(currentIndex - 1);
            break;

          case 'ArrowRight':
            e.preventDefault();
            if (isFolder) {
              if (!expandedIds.has(currentRow.node.id)) {
                toggleExpand(currentRow.node.id);
              } else {
                // Already expanded, focus first cell
                focusCell(currentIndex, 0);
              }
            } else {
              // Not a folder, focus first cell
              focusCell(currentIndex, 0);
            }
            break;

          case 'ArrowLeft':
            e.preventDefault();
            if (isFolder && expandedIds.has(currentRow.node.id)) {
              toggleExpand(currentRow.node.id);
            }
            break;

          case 'Enter':
            e.preventDefault();
            if (isFolder) {
              toggleExpand(currentRow.node.id);
            }
            break;

          case 'Home':
            e.preventDefault();
            focusRow(0);
            break;

          case 'End':
            e.preventDefault();
            focusRow(visibleRows.length - 1);
            break;

          case 'PageDown':
            e.preventDefault();
            focusRow(Math.min(currentIndex + 10, visibleRows.length - 1));
            break;

          case 'PageUp':
            e.preventDefault();
            focusRow(Math.max(currentIndex - 10, 0));
            break;
        }
      } else if (focusState.mode === 'cell' && focusState.columnIndex !== undefined) {
        // Cell focus mode
        const currentColumn = focusState.columnIndex;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            focusCell(currentIndex + 1, currentColumn);
            break;

          case 'ArrowUp':
            e.preventDefault();
            focusCell(currentIndex - 1, currentColumn);
            break;

          case 'ArrowRight':
            e.preventDefault();
            if (currentColumn < 2) {
              focusCell(currentIndex, currentColumn + 1);
            }
            break;

          case 'ArrowLeft':
            e.preventDefault();
            if (currentColumn > 0) {
              focusCell(currentIndex, currentColumn - 1);
            } else {
              // First cell, focus row
              focusRow(currentIndex);
            }
            break;

          case 'Home':
            e.preventDefault();
            if (e.ctrlKey) {
              // Ctrl+Home: same column, first row
              focusCell(0, currentColumn);
            } else {
              // Home: first cell in current row
              focusCell(currentIndex, 0);
            }
            break;

          case 'End':
            e.preventDefault();
            if (e.ctrlKey) {
              // Ctrl+End: same column, last row
              focusCell(visibleRows.length - 1, currentColumn);
            } else {
              // End: last cell in current row
              focusCell(currentIndex, 2);
            }
            break;

          case 'PageDown':
            e.preventDefault();
            focusCell(Math.min(currentIndex + 10, visibleRows.length - 1), currentColumn);
            break;

          case 'PageUp':
            e.preventDefault();
            focusCell(Math.max(currentIndex - 10, 0), currentColumn);
            break;
        }
      }
    },
    [
      getCurrentRowIndex,
      visibleRows,
      focusState,
      expandedIds,
      focusRow,
      focusCell,
      toggleExpand,
    ]
  );

  return onKeyDown;
}
