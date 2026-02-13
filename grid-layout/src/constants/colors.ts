// Color palette for memo backgrounds
export const COLORS = [
  { name: 'Yellow', hex: '#fff9c4' },
  { name: 'Pink', hex: '#f8bbd9' },
  { name: 'Blue', hex: '#bbdefb' },
  { name: 'Green', hex: '#c8e6c9' },
  { name: 'Orange', hex: '#ffe0b2' },
  { name: 'Purple', hex: '#e1bee7' },
  { name: 'White', hex: '#ffffff' },
] as const;

export const DEFAULT_COLOR = COLORS[0].hex; // Yellow

// Grid configuration for react-grid-layout
export const GRID_CONFIG: {
  readonly cols: 12;
  readonly rowHeight: 30;
  readonly margin: readonly [number, number];
  readonly containerPadding: readonly [number, number];
} = {
  cols: 12,
  rowHeight: 30,
  margin: [10, 10],
  containerPadding: [10, 10],
};

// Default size for new memos
export const DEFAULT_MEMO_SIZE = {
  w: 2,
  h: 2,
} as const;
