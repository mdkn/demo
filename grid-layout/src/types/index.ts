// Core memo data
export interface Memo {
  id: string;           // UUID
  content: string;      // Plain text content
  color: string;        // Background color (HEX)
}

// Grid layout positioning (react-grid-layout format)
export interface LayoutItem {
  i: string;            // Matches memo.id
  x: number;            // X position (grid columns)
  y: number;            // Y position (grid rows)
  w: number;            // Width (grid columns)
  h: number;            // Height (grid rows)
}

// Application state (localStorage format)
export interface AppState {
  memos: Memo[];
  layout: LayoutItem[];
}
