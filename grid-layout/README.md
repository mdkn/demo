# Grid Memo

A sticky notes demo application built with React + TypeScript showcasing react-grid-layout capabilities.

## Features

### Core Functionality (P1)
- ✅ **Create Memos**: Double-click anywhere on the grid to create a new memo
- ✅ **Edit Memos**: Double-click a memo to edit its content inline
- ✅ **Delete Memos**: Click the × button to remove a memo
- ✅ **Drag & Drop**: Click and drag memos to rearrange them
- ✅ **Resize**: Drag memo edges/corners to resize
- ✅ **Auto-save**: All changes automatically persist to localStorage
- ✅ **Smart Positioning**:
  - Boundary snapping: Memos stay within grid bounds
  - Nearest empty space: Memos placed in optimal available positions
  - Edit mode lock: Can't drag memos while editing

### Enhanced Features (P2)
- ✅ **Color Customization**: Choose from 7 preset colors
- ✅ **Reset Workspace**: Clear all memos with confirmation dialog

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Styling**: SCSS Modules
- **Grid Layout**: react-grid-layout
- **State Management**: Custom hooks (useLocalStorage, useMemos)
- **Build Tool**: Vite
- **Persistence**: localStorage

## Project Structure

```
src/
├── components/
│   ├── Header/              # App header with reset button
│   ├── MemoGrid/            # Grid layout container
│   ├── MemoCard/            # Individual memo card
│   └── ColorPicker/         # Color selection popup
├── hooks/
│   ├── useLocalStorage.ts   # Generic localStorage sync
│   └── useMemos.ts          # Memo CRUD + layout management
├── types/
│   └── index.ts             # TypeScript interfaces
├── constants/
│   └── colors.ts            # Grid config & color palette
├── App.tsx                  # Main app component
├── App.module.scss          # App layout styles
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Creating Memos
1. Double-click anywhere on the empty grid
2. A new memo appears (2×2 size, yellow color)
3. Automatically enters edit mode - start typing
4. Click outside or press `Esc` to save

### Editing Memos
1. Double-click a memo's content area
2. Edit the text
3. Click outside or press `Esc` to save
4. **Note**: Can't drag memos while editing

### Moving Memos
1. Click and drag a memo to a new position
2. Other memos automatically shift to prevent overlaps
3. Release to drop in new position

### Resizing Memos
1. Hover near a memo's edge (cursor changes)
2. Drag edge or corner to resize
3. Release to apply new size

### Changing Colors
1. Click the 🎨 button on a memo
2. Select a color from the popup
3. Color applies immediately

### Deleting Memos
1. Click the × button in the top-right corner
2. Memo is immediately removed (no confirmation)

### Resetting Workspace
1. Click the "Reset" button in the header
2. Confirm the action
3. All memos are cleared

## Grid Configuration

- **Columns**: 12
- **Row Height**: 30px
- **Margins**: 10px (horizontal and vertical)
- **Default Memo Size**: 2×2 (columns × rows)

## Color Palette

- Yellow (#fff9c4) - Default
- Pink (#f8bbd9)
- Blue (#bbdefb)
- Green (#c8e6c9)
- Orange (#ffe0b2)
- Purple (#e1bee7)
- White (#ffffff)

## Browser Support

Modern browsers with:
- ES2020+ support
- localStorage API
- CSS Grid
- Flexbox

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Key Design Decisions

### State Management
- **Custom hooks** for clean separation of concerns
- **useLocalStorage**: Generic reusable localStorage sync
- **useMemos**: Business logic isolated from UI

### Layout Strategy
- **No manual positioning**: react-grid-layout handles all layout calculations
- **Controlled components**: All state flows through React
- **Position calculation**: Smart algorithm for boundary snapping and finding empty spaces

### Edit Mode Handling
- **Dragging disabled while editing**: Prevents accidental moves
- **Double-click to edit**: Distinct from single-click drag interaction
- **Auto-focus**: Smooth UX when entering edit mode

### Performance
- **React.memo** could be added to MemoCard if needed
- **Layout calculations** delegated to optimized react-grid-layout library
- **localStorage writes** happen synchronously (could debounce if needed)

## Development Notes

### TypeScript
- Strict mode enabled
- Type casting used for react-grid-layout compatibility
- All custom types defined in `src/types/index.ts`

### Styling
- SCSS Modules for scoped styles
- Global styles minimal (reset + base typography)
- BEM-like naming within modules

### Accessibility
- Focus styles for keyboard navigation
- ARIA labels on icon buttons
- Semantic HTML structure

## Future Enhancements (Not Implemented)

- Responsive design (mobile/tablet)
- Dark mode
- Search/filter memos
- Export/import to JSON
- Rich text editing
- Undo/redo
- Keyboard shortcuts (arrow keys to move)
- Memo categories/tags
- Multiple workspaces

## License

MIT

## Credits

Built as a demo for [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout).
