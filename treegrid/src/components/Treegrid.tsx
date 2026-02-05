import { useState, useMemo, useEffect, useRef } from 'react';
import { TreeNode, FlattenedRow, FocusState } from '../types';
import { TreegridRow } from './TreegridRow';
import { useTreegridNav } from '../hooks/useTreegridNav';

interface TreegridProps {
  data: TreeNode;
}

export function Treegrid({ data }: TreegridProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([data.id]));
  const [focusState, setFocusState] = useState<FocusState>({
    mode: 'row',
    rowId: data.id,
  });

  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());

  // Flatten the tree into visible rows
  const visibleRows = useMemo(() => {
    const rows: FlattenedRow[] = [];

    function traverse(
      node: TreeNode,
      level: number,
      parentId: string | null,
      siblings: TreeNode[]
    ) {
      const posInSet = siblings.indexOf(node) + 1; // 1-based
      const setSize = siblings.length;

      rows.push({
        node,
        level,
        posInSet,
        setSize,
        parentId,
      });

      if (node.type === 'folder' && expandedIds.has(node.id) && node.children) {
        node.children.forEach((child) =>
          traverse(child, level + 1, node.id, node.children!)
        );
      }
    }

    traverse(data, 1, null, [data]);
    return rows;
  }, [data, expandedIds]);

  const toggleExpand = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);

        // If focused row is being hidden, focus the collapsed folder
        const collapsedNode = visibleRows.find(r => r.node.id === nodeId);
        if (collapsedNode && focusState.mode === 'row') {
          const focusedRowIndex = visibleRows.findIndex(r => r.node.id === focusState.rowId);
          const collapsedIndex = visibleRows.findIndex(r => r.node.id === nodeId);

          if (focusedRowIndex > collapsedIndex) {
            // Check if focused row is a descendant
            let isDescendant = false;
            let currentRow = visibleRows[focusedRowIndex];
            while (currentRow.parentId) {
              if (currentRow.parentId === nodeId) {
                isDescendant = true;
                break;
              }
              const parentRow = visibleRows.find(r => r.node.id === currentRow.parentId);
              if (!parentRow) break;
              currentRow = parentRow;
            }

            if (isDescendant) {
              setFocusState({ mode: 'row', rowId: nodeId });
            }
          }
        }
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const onKeyDown = useTreegridNav({
    visibleRows,
    expandedIds,
    focusState,
    setFocusState,
    toggleExpand,
  });

  // Focus management
  useEffect(() => {
    if (focusState.mode === 'row') {
      const element = rowRefs.current.get(focusState.rowId);
      element?.focus();
    } else if (focusState.mode === 'cell' && focusState.columnIndex !== undefined) {
      const key = `${focusState.rowId}-${focusState.columnIndex}`;
      const element = cellRefs.current.get(key);
      element?.focus();
    }
  }, [focusState]);

  const setRowRef = (nodeId: string) => (el: HTMLTableRowElement | null) => {
    if (el) {
      rowRefs.current.set(nodeId, el);
    } else {
      rowRefs.current.delete(nodeId);
    }
  };

  const setCellRef = (nodeId: string, columnIndex: number) =>
    (el: HTMLTableCellElement | null) => {
      const key = `${nodeId}-${columnIndex}`;
      if (el) {
        cellRefs.current.set(key, el);
      } else {
        cellRefs.current.delete(key);
      }
    };

  return (
    <table
      role="treegrid"
      aria-label="File browser"
      className="border-collapse w-full"
      onKeyDown={onKeyDown}
    >
      <thead>
        <tr className="bg-gray-100 border-b">
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Size</th>
          <th className="px-4 py-2 text-left">Modified</th>
        </tr>
      </thead>
      <tbody>
        {visibleRows.map((row) => (
          <TreegridRow
            key={row.node.id}
            row={row}
            isExpanded={expandedIds.has(row.node.id)}
            focusState={focusState}
            onToggleExpand={toggleExpand}
            rowRef={setRowRef(row.node.id)}
            cellRefs={(colIndex) => setCellRef(row.node.id, colIndex)}
          />
        ))}
      </tbody>
    </table>
  );
}
