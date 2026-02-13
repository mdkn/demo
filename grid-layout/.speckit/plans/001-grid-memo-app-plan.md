# Implementation Plan: Grid Memo App

**Feature**: 001-grid-memo-app
**Created**: 2026-02-13
**Status**: Ready for Implementation

---

## Overview

Build a React + TypeScript sticky notes demo using react-grid-layout, with localStorage persistence and SCSS Modules styling.

---

## Architecture Decisions

### Project Structure
```
src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Header.module.scss
│   ├── MemoGrid/
│   │   ├── MemoGrid.tsx
│   │   └── MemoGrid.module.scss
│   ├── MemoCard/
│   │   ├── MemoCard.tsx
│   │   └── MemoCard.module.scss
│   └── ColorPicker/
│       ├── ColorPicker.tsx
│       └── ColorPicker.module.scss
├── hooks/
│   ├── useLocalStorage.ts
│   └── useMemos.ts
├── types/
│   └── index.ts
├── constants/
│   └── colors.ts
├── App.tsx
├── App.module.scss
├── main.tsx
└── index.css
```

### State Management Strategy
- **Central state**: `useMemos` custom hook manages memos and layout
- **Persistence**: `useLocalStorage` hook for automatic sync
- **Layout state**: Controlled by react-grid-layout via `onLayoutChange` callback
- **Edit state**: Local state within MemoCard component

### Key Technical Choices
1. **Custom hooks for separation of concerns**
   - `useLocalStorage`: Generic localStorage sync
   - `useMemos`: Business logic for memo CRUD + layout management
2. **Controlled components**: All state flows through React (no imperative DOM manipulation)
3. **TypeScript strict mode**: Full type safety
4. **SCSS Modules**: Scoped styles, no global namespace pollution

---

## Implementation Steps

### Phase 1: Project Setup

#### Step 1.1: Initialize Vite Project
**Files**: Project scaffolding

```bash
npm create vite@latest . -- --template react-ts
npm install
```

**Verification**: Dev server runs successfully

---

#### Step 1.2: Install Dependencies
**Files**: `package.json`

```bash
npm install react-grid-layout
npm install --save-dev @types/react-grid-layout sass
```

**Dependencies**:
- `react-grid-layout`: Core grid layout library
- `@types/react-grid-layout`: TypeScript definitions
- `sass`: SCSS compilation

**Verification**: No type errors, imports resolve

---

#### Step 1.3: Create Type Definitions
**Files**: `src/types/index.ts`

Define core interfaces:
```typescript
export interface Memo {
  id: string;
  content: string;
  color: string;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppState {
  memos: Memo[];
  layout: LayoutItem[];
}
```

**Verification**: Types can be imported without errors

---

#### Step 1.4: Create Constants
**Files**: `src/constants/colors.ts`

```typescript
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

export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 30,
  margin: [10, 10] as [number, number],
  containerPadding: [10, 10] as [number, number],
} as const;

export const DEFAULT_MEMO_SIZE = {
  w: 2,
  h: 2,
} as const;
```

**Verification**: Constants can be imported and used

---

### Phase 2: Core Hooks

#### Step 2.1: Create useLocalStorage Hook
**Files**: `src/hooks/useLocalStorage.ts`

Generic hook for localStorage synchronization:
```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

**Features**:
- Read from localStorage on mount
- Parse JSON safely (try/catch)
- Write to localStorage on update
- Return tuple: [value, setValue]

**Edge cases**:
- Handle parse errors (return initialValue)
- Handle localStorage quota errors

**Verification**:
- Test with simple values
- Verify persistence across page reloads

---

#### Step 2.2: Create useMemos Hook
**Files**: `src/hooks/useMemos.ts`

Business logic hook for memo management:
```typescript
function useMemos(): {
  memos: Memo[];
  layout: Layout[];
  addMemo: (x: number, y: number) => void;
  updateMemo: (id: string, content: string) => void;
  deleteMemo: (id: string) => void;
  updateMemoColor: (id: string, color: string) => void;
  updateLayout: (newLayout: Layout[]) => void;
  resetAll: () => void;
}
```

**Implementation details**:
- Use `useLocalStorage` for persistence
- Use `uuid` or `crypto.randomUUID()` for memo IDs
- `addMemo`: Create memo + layout item at grid position
- `updateLayout`: Sync layout changes from react-grid-layout
- `resetAll`: Clear state and localStorage

**Verification**:
- Each CRUD operation persists to localStorage
- Layout updates persist correctly

---

### Phase 3: Components

#### Step 3.1: Header Component
**Files**:
- `src/components/Header/Header.tsx`
- `src/components/Header/Header.module.scss`

**Props**:
```typescript
interface HeaderProps {
  onReset: () => void;
}
```

**Structure**:
- App title: "Grid Memo"
- Reset button (right-aligned)

**Behavior**:
- Reset button shows confirmation dialog
- On confirm, calls `onReset` prop

**Styling**:
- Fixed height header (e.g., 60px)
- Flexbox layout (space-between)
- Simple border bottom

**Verification**: Header renders, reset button shows dialog

---

#### Step 3.2: ColorPicker Component
**Files**:
- `src/components/ColorPicker/ColorPicker.tsx`
- `src/components/ColorPicker/ColorPicker.module.scss`

**Props**:
```typescript
interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}
```

**Structure**:
- Grid of color swatches
- Import COLORS from constants
- Visual indicator for current color

**Behavior**:
- Click swatch to select color
- Calls `onColorChange` and `onClose`
- Click outside to close (use ref + click handler)

**Styling**:
- Popup/absolute positioning
- Grid layout for swatches
- Hover effects
- Box shadow for depth

**Verification**:
- Opens/closes correctly
- Color selection works
- Click outside closes popup

---

#### Step 3.3: MemoCard Component
**Files**:
- `src/components/MemoCard/MemoCard.tsx`
- `src/components/MemoCard/MemoCard.module.scss`

**Props**:
```typescript
interface MemoCardProps {
  memo: Memo;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onColorChange: (color: string) => void;
}
```

**State**:
- `isEditing`: boolean (edit mode)
- `showColorPicker`: boolean (color picker visibility)

**Structure**:
- Container with background color
- Delete button (×) - top right
- Color picker button (🎨) - bottom left
- Content display / textarea (conditional)
- ColorPicker component (conditional)

**Behavior**:
- Double-click content: enter edit mode
- Edit mode: show textarea, auto-focus
- Click outside or Esc: exit edit mode, save
- Delete button: call `onDelete`
- Color button: toggle `showColorPicker`

**Styling**:
- Full size container (inherit from grid)
- Padding for content
- Border radius for card appearance
- Textarea fills available space
- Button positioning (absolute)

**Verification**:
- Edit mode toggles correctly
- Content updates persist
- Delete works
- Color picker appears/disappears

---

#### Step 3.4: MemoGrid Component
**Files**:
- `src/components/MemoGrid/MemoGrid.tsx`
- `src/components/MemoGrid/MemoGrid.module.scss`

**Props**:
```typescript
interface MemoGridProps {
  memos: Memo[];
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
  onAddMemo: (x: number, y: number) => void;
  onUpdateMemo: (id: string, content: string) => void;
  onDeleteMemo: (id: string) => void;
  onUpdateMemoColor: (id: string, color: string) => void;
}
```

**Structure**:
- `ReactGridLayout` wrapper
- Map memos to MemoCard components
- Each MemoCard has `key={memo.id}` and `data-grid={layout item}`

**Behavior**:
- Double-click empty space: calculate grid position, call `onAddMemo`
- Pass layout updates to `onLayoutChange`
- Delegate memo actions to child MemoCards

**Grid Position Calculation**:
```typescript
// Convert click coordinates to grid position
const calculateGridPosition = (
  clientX: number,
  clientY: number,
  containerRef: RefObject<HTMLDivElement>
) => {
  // Account for container padding, margin, row height
  // Return { x: col, y: row }
}
```

**Styling**:
- Import react-grid-layout CSS
- Full viewport height minus header
- Custom grid item styles

**Verification**:
- Grid renders with memos
- Drag and resize work
- Double-click creates memo at correct position
- Layout persists

---

#### Step 3.5: App Component
**Files**:
- `src/App.tsx`
- `src/App.module.scss`

**Structure**:
- Use `useMemos` hook
- Render Header
- Render MemoGrid
- Pass all handlers down

**Layout**:
- Flexbox column (header + grid)
- Grid takes remaining height

**Verification**: Full app renders and all features work

---

### Phase 4: Styling & Polish

#### Step 4.1: Global Styles
**Files**: `src/index.css`

- CSS reset
- Base font family
- Box sizing
- Body margin/padding

---

#### Step 4.2: Grid Layout CSS
**Files**: Import in `src/App.tsx`

```typescript
import 'react-grid-layout/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
```

---

#### Step 4.3: Component Styling Refinement
**Files**: All `.module.scss` files

- Consistent spacing
- Hover states
- Transitions for smooth interactions
- Focus styles for accessibility
- Resize handles styling

---

### Phase 5: Testing & Refinement

#### Step 5.1: Manual Testing Checklist

- [ ] Create memo by double-clicking
- [ ] New memo appears at click position (2×2 size)
- [ ] Edit memo content
- [ ] Content persists on blur/Esc
- [ ] Drag memo to new position
- [ ] Resize memo (all edges/corners)
- [ ] Delete memo
- [ ] Change memo color
- [ ] Color picker closes on selection
- [ ] Reset clears all memos
- [ ] Refresh page - state persists
- [ ] Create many memos - no overlap
- [ ] localStorage persistence works

---

#### Step 5.2: Edge Cases

- [ ] Double-click near edges (grid boundaries)
- [ ] Resize to minimum/maximum bounds
- [ ] Empty content handling
- [ ] localStorage quota (create many memos)
- [ ] Rapid clicking/dragging

---

#### Step 5.3: Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Critical Files

| File | Purpose | Priority |
|------|---------|----------|
| `src/types/index.ts` | Type definitions | P1 |
| `src/hooks/useMemos.ts` | State management | P1 |
| `src/hooks/useLocalStorage.ts` | Persistence | P1 |
| `src/components/MemoGrid/MemoGrid.tsx` | Grid integration | P1 |
| `src/components/MemoCard/MemoCard.tsx` | Memo display/edit | P1 |
| `src/constants/colors.ts` | Configuration | P2 |
| `src/components/ColorPicker/ColorPicker.tsx` | Color selection | P2 |
| `src/components/Header/Header.tsx` | App header | P2 |

---

## Risk Mitigation

### Risk: react-grid-layout TypeScript issues
- **Mitigation**: Install type definitions early, test imports
- **Fallback**: Use `@ts-ignore` if types are incomplete

### Risk: Grid position calculation complexity
- **Mitigation**: Build incrementally, log calculations, test thoroughly
- **Fallback**: Snap to nearest grid cell instead of exact position

### Risk: localStorage quota exceeded
- **Mitigation**: No limits in spec, document limitation
- **Fallback**: Could add memo count warning (P3)

### Risk: Edit mode conflicts with drag
- **Mitigation**: Use double-click for edit (different from drag)
- **Fallback**: Add explicit "Edit" button if needed

---

## Performance Considerations

- Memo re-renders: Use `React.memo` for MemoCard if needed
- Layout calculations: Let react-grid-layout handle (optimized library)
- localStorage writes: Debounce if performance issues arise (start without)

---

## Future Enhancements (Post-P2)

- Responsive grid (mobile support)
- Dark mode toggle
- Undo/redo
- Search/filter
- Export to JSON
- Import from JSON
- Keyboard shortcuts (arrow keys to move)
- Memo categories/tags

---

## Success Criteria

✅ All P1 features working
✅ All P2 features working
✅ No TypeScript errors
✅ Clean, readable code
✅ Smooth drag-and-drop
✅ State persists correctly
✅ Demo-ready for developers

---

## Estimated Implementation Order

1. **Setup** (30min): Vite + dependencies + types
2. **Hooks** (45min): useLocalStorage + useMemos
3. **Basic Grid** (1hr): MemoGrid + simple MemoCard (no features)
4. **Memo Features** (1.5hr): Edit mode, delete, create
5. **Color Picker** (45min): ColorPicker component + integration
6. **Header** (30min): Header + reset functionality
7. **Styling** (1hr): Polish all components
8. **Testing** (45min): Manual testing + bug fixes

**Total**: ~6-7 hours for complete implementation

---

## Next Steps

1. Run `/speckit.implement` to begin implementation
2. Or manually execute steps in order:
   - Phase 1: Setup
   - Phase 2: Hooks
   - Phase 3: Components
   - Phase 4: Styling
   - Phase 5: Testing
