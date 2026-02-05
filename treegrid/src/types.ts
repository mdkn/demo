export type NodeType = 'file' | 'folder';

export interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  size: string;
  modified: string;
  children?: TreeNode[];
}

export type FocusMode = 'row' | 'cell';

export interface FocusState {
  mode: FocusMode;
  rowId: string;
  columnIndex?: number;
}

export interface FlattenedRow {
  node: TreeNode;
  level: number;        // 1-based depth
  posInSet: number;     // 1-based position among siblings
  setSize: number;      // total siblings count
  parentId: string | null;
}
