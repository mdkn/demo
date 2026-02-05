import { FlattenedRow, FocusState } from '../types';

interface TreegridRowProps {
  row: FlattenedRow;
  isExpanded: boolean;
  focusState: FocusState;
  onToggleExpand: (nodeId: string) => void;
  rowRef: (el: HTMLTableRowElement | null) => void;
  cellRefs: (columnIndex: number) => (el: HTMLTableCellElement | null) => void;
}

export function TreegridRow({
  row,
  isExpanded,
  focusState,
  onToggleExpand,
  rowRef,
  cellRefs,
}: TreegridRowProps) {
  const { node, level, posInSet, setSize } = row;
  const isFolder = node.type === 'folder';

  const isRowFocused = focusState.mode === 'row' && focusState.rowId === node.id;
  const isCellFocused = (colIndex: number) =>
    focusState.mode === 'cell' && focusState.rowId === node.id && focusState.columnIndex === colIndex;

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleExpand(node.id);
    }
  };

  const indentPx = (level - 1) * 20;

  return (
    <tr
      role="row"
      aria-level={level}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-expanded={isFolder ? isExpanded : undefined}
      tabIndex={isRowFocused ? 0 : -1}
      ref={rowRef}
      className="border-b hover:bg-gray-50"
    >
      <td
        role="gridcell"
        tabIndex={isCellFocused(0) ? 0 : -1}
        ref={cellRefs(0)}
        className="px-4 py-2 text-left"
        style={{ paddingLeft: `${indentPx + 16}px` }}
      >
        <div className="flex items-center gap-2">
          {isFolder && (
            <button
              onClick={handleExpandClick}
              className="w-4 h-4 flex items-center justify-center text-gray-600 hover:text-gray-900"
              tabIndex={-1}
              aria-hidden="true"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!isFolder && <span className="w-4" />}
          <span>{node.name}</span>
        </div>
      </td>
      <td
        role="gridcell"
        tabIndex={isCellFocused(1) ? 0 : -1}
        ref={cellRefs(1)}
        className="px-4 py-2 text-left"
      >
        {node.size}
      </td>
      <td
        role="gridcell"
        tabIndex={isCellFocused(2) ? 0 : -1}
        ref={cellRefs(2)}
        className="px-4 py-2 text-left"
      >
        {node.modified}
      </td>
    </tr>
  );
}
