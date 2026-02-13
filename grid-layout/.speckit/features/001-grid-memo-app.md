# Feature Specification: Grid Memo App

**Feature ID**: 001
**Status**: Planning
**Created**: 2026-02-13
**Target Audience**: Developers evaluating react-grid-layout

---

## Overview

A memo/notes application demo showcasing react-grid-layout capabilities. Users can create, edit, arrange, and customize sticky note-style memos on a draggable grid.

---

## Problem Statement

Developers need a comprehensive, working example to evaluate react-grid-layout's features and understand best practices for building grid-based applications.

### Who experiences this problem?
- Frontend developers evaluating react-grid-layout for their projects
- Teams deciding whether to adopt react-grid-layout
- Developers learning how to implement drag-and-drop grid layouts

### Current workaround
- Reading documentation alone without interactive examples
- Building proof-of-concepts from scratch
- Reviewing complex production codebases

---

## Core User Actions

**Primary Flow**: Creating memos by double-clicking empty space

**Secondary Flows**:
- Editing memo content inline (double-click memo)
- Arranging memos via drag-and-drop
- Resizing memos by dragging edges
- Customizing memo appearance (background colors)
- Managing workspace (reset functionality)

---

## Success Criteria

This demo is successful when:
1. Developers can immediately see react-grid-layout's drag-and-drop capabilities
2. All core grid features (drag, resize, auto-layout) work smoothly
3. State persistence demonstrates real-world usage patterns
4. Code is clean and easy to understand for learning purposes

---

## Technical Specifications

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18+ |
| Language | TypeScript |
| Styling | SCSS Modules |
| Layout | react-grid-layout |
| Persistence | localStorage |
| Build Tool | Vite |

### Data Model

```typescript
// Core memo data
interface Memo {
  id: string;           // UUID
  content: string;      // Plain text content
  color: string;        // Background color (HEX)
}

// Grid layout positioning (react-grid-layout format)
interface LayoutItem {
  i: string;            // Matches memo.id
  x: number;            // X position (grid columns)
  y: number;            // Y position (grid rows)
  w: number;            // Width (grid columns)
  h: number;            // Height (grid rows)
}

// Application state (localStorage format)
interface AppState {
  memos: Memo[];
  layout: LayoutItem[];
}
```

### Grid Configuration

| Setting | Value |
|---------|-------|
| Columns | 12 |
| Row Height | 30px |
| Margin | [10, 10] (horizontal, vertical) |
| Min Width | 1 column |
| Max Width | 12 columns |
| Min Height | 1 row |
| Max Height | Unlimited |

### Default Values

| Item | Default |
|------|---------|
| New Memo Size | 2×2 (columns × rows) |
| New Memo Color | #fff9c4 (Yellow) |
| New Memo Content | Empty string (ready for input) |

---

## Features & Requirements

### P1 - Must Have (Core Demo)

#### Memo CRUD Operations
- **Create**: Double-click empty grid space to create new memo at click position
- **Read**: Display all memos with their content
- **Update**: Double-click memo to enter edit mode (textarea)
- **Delete**: Click × button in top-right corner of memo

#### Grid Layout Features
- **Drag to Move**: Click and drag memo to any position
- **Resize**: Drag memo edges/corners to resize
- **Auto-layout**: react-grid-layout automatically prevents overlaps

#### Data Persistence
- **Auto-save**: Automatically save to localStorage on any change
  - Content updates
  - Position changes
  - Size changes
  - Color changes
- **Auto-restore**: Load state from localStorage on app startup

### P2 - Should Have (Complete Demo)

#### Customization
- **Background Colors**: Color picker popup with 7 preset colors
  - Yellow (#fff9c4)
  - Pink (#f8bbd9)
  - Blue (#bbdefb)
  - Green (#c8e6c9)
  - Orange (#ffe0b2)
  - Purple (#e1bee7)
  - White (#ffffff)

#### Workspace Management
- **Reset**: Clear all memos and localStorage
  - Button in header
  - Confirmation dialog before reset
  - Page reload after reset

### P3 - Nice to Have (Future)

Not in scope for initial version:
- Responsive design (mobile/tablet)
- Dark mode
- Search/filter functionality
- Export/import functionality
- Rich text editing
- Authentication
- Server synchronization

---

## User Interface

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Grid Memo                              [Reset Button]  │  ← Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────┐  ┌────────────────┐                     │
│   │ [×] 🎨   │  │ [×] 🎨         │                     │
│   │          │  │                │                     │
│   │ Memo     │  │ Another memo   │                     │
│   │ content  │  │ with more text │                     │
│   └──────────┘  └────────────────┘                     │
│                                                         │
│           ┌──────────────────────────┐                 │
│           │ [×] 🎨                   │                 │
│           │                          │                 │
│           │ Larger memo              │                 │
│           │ resized to fit           │                 │
│           │ more content             │                 │
│           └──────────────────────────┘                 │
│                                                         │
│              (Double-click to create memo)              │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Header
│   └── ResetButton
└── MemoGrid
    └── MemoCard[]
        ├── DeleteButton
        ├── ColorPicker (popup)
        └── ContentEditor (textarea in edit mode)
```

---

## User Interactions

### Creating a Memo
1. User double-clicks on grid area (empty or occupied)
2. Click position is converted to grid coordinates
3. System checks if clicked position can accommodate a 2×2 memo:
   - If position is clear: use it
   - If near grid edge: snap to fit within boundaries
   - If occupied by existing memos: find nearest empty 2×2 space
4. New memo appears at calculated position (2×2 size, yellow color)
5. Memo automatically enters edit mode
6. User types content
7. Click outside or press Esc to save and exit edit mode
8. State saved to localStorage

### Editing a Memo
1. User double-clicks memo content area
2. Content becomes editable (textarea)
3. Memo dragging is disabled while in edit mode
4. User modifies text
5. Click outside or press Esc to save and exit edit mode
6. Dragging is re-enabled when edit mode exits
7. State saved to localStorage

### Moving a Memo
1. User clicks and drags memo
2. react-grid-layout provides drag preview
3. Other memos shift automatically to prevent overlap
4. On drop, new position saved to localStorage

### Resizing a Memo
1. User hovers near memo edge (cursor changes)
2. User drags edge/corner
3. Memo resizes in real-time
4. On release, new size saved to localStorage

### Changing Color
1. User clicks color picker icon (🎨)
2. Popup shows color palette
3. User clicks a color
4. Memo background changes
5. Popup closes
6. State saved to localStorage

### Deleting a Memo
1. User clicks × button
2. Memo immediately removed (no confirmation)
3. State saved to localStorage

### Resetting Workspace
1. User clicks Reset button in header
2. Confirmation dialog: "Clear all memos?"
3. If confirmed:
   - Clear localStorage
   - Reload page (or reset state)

---

## Constraints & Assumptions

### Technical Constraints
- **Platform**: Desktop/PC only (no responsive design)
- **Browser**: Modern browsers with localStorage support
- **Storage**: localStorage ~5MB limit
- **No validation**: No limits on content length or number of memos

### Out of Scope
- Mobile/tablet support
- Dark mode
- Authentication
- Server-side storage
- Search/filter
- Rich text editing
- Keyboard shortcuts (beyond Esc)
- Undo/redo

### Assumptions
- Users have modern browsers (ES2020+ support)
- Users understand basic sticky note interactions
- Grid remains visible (no scrolling within grid container)

---

## Clarifications

### Session 2026-02-13

**Q1: What happens when a user is editing a memo and tries to drag it?**
→ **A:** Disable dragging while in edit mode. User must exit edit mode (click outside or press Esc) before they can drag the memo. This prevents accidental moves during editing and provides clear separation of concerns.

**Q2: What should happen when a user double-clicks near the edge of the grid and there's not enough space for a 2×2 memo?**
→ **A:** Snap memo to fit within grid boundaries. If user clicks at column 11, create the memo at column 10 (so it spans columns 10-12). Same logic applies vertically. User can resize or reposition afterwards. This ensures memos always appear near where the user clicked.

**Q3: What should happen when a user double-clicks on a location where memos already exist?**
→ **A:** Find the nearest empty space that can accommodate a 2×2 memo and create it there. Search outward from the clicked position (spiral or proximity-based). This ensures users can always create memos, and they can subsequently drag them to their desired position.

---

## Open Questions

None - requirements are complete.

---

## Success Metrics

As a demo app, success is qualitative:
- ✅ Code is clean and well-organized
- ✅ All react-grid-layout features work smoothly
- ✅ Demonstrates best practices for state management
- ✅ Easy for developers to understand and modify
- ✅ Responsive drag-and-drop with no lag
- ✅ State persists across page reloads

---

## References

- [react-grid-layout Documentation](https://github.com/react-grid-layout/react-grid-layout)
- Original Requirements Document (provided by user)
