# Implementation Plan: Email View Flexbox Demo

**Spec**: [001-email-view-flexbox-demo.md](./001-email-view-flexbox-demo.md)
**Created**: 2026-02-13
**Status**: Draft

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.x
- **Framework**: React 18.x (with hooks)
- **Build Tool**: Vite 5.x (fast dev server, HMR, modern build)
- **Styling**: Tailwind CSS 3.x
- **Package Manager**: npm or pnpm

### Development Dependencies
- **TypeScript**: Type checking and IDE support
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (integrated with Tailwind)
- **@types/react**: React TypeScript definitions

### Runtime Libraries
- **React**: UI component library
- **React DOM**: React rendering for web
- No state management library needed (React useState sufficient for demo)
- No routing library needed (single page)

**Rationale**:
- **Vite over Create React App**: Faster dev experience, modern build tooling, better TypeScript support out of box
- **No additional dependencies**: Keeping it minimal for a demo project; React hooks provide sufficient state management
- **Tailwind CSS**: Requirement from spec, provides utility-first approach perfect for demonstrating flexbox patterns
- **Modern tooling**: Aligns with "modern browsers only" requirement, no legacy support needed

## Architecture

### System Architecture

**Single Page Application (SPA)** - Pure frontend, no backend communication

```
┌─────────────────────────────────────────┐
│           Browser Viewport              │
│  ┌───────────────────────────────────┐  │
│  │   Header (Fixed)                  │  │
│  ├───────────────────────────────────┤  │
│  │                                   │  │
│  │   Main Content Area (Flex-grow)   │  │
│  │                                   │  │
│  │  ┌─────────────┬────────────────┐ │  │
│  │  │ Email Table │  Preview Panel │ │  │
│  │  │ (scrollable)│  (if selected) │ │  │
│  │  │ 50%         │  50%           │ │  │
│  │  │ sticky hdr  │                │ │  │
│  │  └─────────────┴────────────────┘ │  │
│  │                                   │  │
│  ├───────────────────────────────────┤  │
│  │   Footer (Fixed)                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Component Structure

```
/
├── src/
│   ├── components/
│   │   ├── App.tsx                 # Root component, main layout
│   │   ├── Header.tsx              # Fixed header with counts
│   │   ├── Footer.tsx              # Fixed footer
│   │   ├── EmailTable.tsx          # Email list table
│   │   ├── EmailTableHeader.tsx    # Sticky table header
│   │   ├── EmailRow.tsx            # Individual email row
│   │   └── EmailPreview.tsx        # Email preview panel
│   ├── types/
│   │   └── email.ts                # TypeScript interfaces
│   ├── data/
│   │   └── emails.json             # Generated mock data
│   ├── hooks/
│   │   └── useEmailSelection.ts    # Custom hook for selection logic
│   ├── utils/
│   │   └── formatDate.ts           # Date formatting utilities
│   ├── main.tsx                    # React entry point
│   ├── App.css                     # Global styles (minimal)
│   └── index.css                   # Tailwind imports
├── scripts/
│   └── generateEmails.ts           # Mock data generator
├── public/
│   └── (static assets if needed)
├── index.html                      # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

**Design Patterns**:
- **Component Composition**: Break UI into reusable components
- **Props Down, Events Up**: Standard React data flow
- **Custom Hooks**: Encapsulate selection state logic
- **Presentational vs Container**: EmailTable manages state, EmailRow is presentational

## Data Design

### TypeScript Interfaces

```typescript
// src/types/email.ts

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: Date | string;  // ISO string from JSON, converted to Date
  previewText: string;  // 2-5 paragraphs
  isRead: boolean;
}

export interface EmailStats {
  total: number;
  unread: number;
}

export type SortField = 'date' | 'sender' | 'subject';
export type SortDirection = 'asc' | 'desc';
```

### JSON Data Format

```json
// src/data/emails.json
[
  {
    "id": "email-001",
    "senderName": "Alice Chen",
    "senderEmail": "alice.chen@gmail.com",
    "subject": "Q4 Project Update Meeting",
    "date": "2026-01-25T10:30:00.000Z",
    "previewText": "Hi team,\n\nI wanted to follow up...",
    "isRead": true
  },
  {
    "id": "email-002",
    "senderName": "Bob Martinez",
    "senderEmail": "bob@company.com",
    "subject": "Re: Design Review Feedback",
    "date": "2026-02-10T14:15:00.000Z",
    "previewText": "Thanks for the feedback...",
    "isRead": false
  }
]
```

### State Management

**Component State (React useState)**:

```typescript
// In App.tsx or EmailTable.tsx
const [emails, setEmails] = useState<Email[]>([]);
const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
const [sortField, setSortField] = useState<SortField>('date');
const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
```

**Computed Values**:
```typescript
const selectedEmail = emails.find(e => e.id === selectedEmailId);
const unreadCount = emails.filter(e => !e.isRead).length;
```

## Implementation Phases

### Phase 0: Project Setup (P1)
**Duration**: ~30 minutes

- [x] Initialize Vite + React + TypeScript project
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [x] Install and configure Tailwind CSS
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [x] Configure TypeScript (strict mode)
- [x] Set up project directory structure
- [x] Create base type definitions

**Acceptance**: Project builds successfully with `npm run dev`

---

### Phase 1: Mock Data Generation (P1)
**Duration**: ~45 minutes

- [x] Create `scripts/generateEmails.ts` script
- [x] Implement data generation logic:
  - Random name generator (diverse names)
  - Email domain variety
  - Subject line templates (work, personal, newsletters)
  - Date distribution (last 30 days)
  - Lorem ipsum text generator (2-5 paragraphs)
  - 70/30 read/unread ratio
- [x] Generate `src/data/emails.json` with 500 emails
- [x] Add script to package.json: `"generate:emails": "ts-node scripts/generateEmails.ts"`

**Acceptance**: JSON file with 500 valid email objects exists

---

### Phase 2: Basic Layout Structure (P1)
**Duration**: ~1 hour

**Components to create**:
- [x] `App.tsx` - Main vertical flexbox layout
- [x] `Header.tsx` - Fixed header (title + counts placeholder)
- [x] `Footer.tsx` - Fixed footer (demo text)

**Flexbox Implementation**:
```tsx
// App.tsx structure
<div className="h-screen flex flex-col">
  <Header total={500} unread={150} />
  <main className="flex-1 flex overflow-hidden">
    {/* Main content area */}
  </main>
  <Footer />
</div>
```

**Tailwind Classes**:
- `h-screen`: Full viewport height
- `flex flex-col`: Vertical flexbox
- `flex-1`: Flexible main content
- `overflow-hidden`: Prevent body scroll

**Acceptance**:
- Header and footer visible and fixed
- Main content area fills available space
- No scrolling on body element

---

### Phase 3: Email Table Component (P1)
**Duration**: ~2 hours

**Components**:
- [x] `EmailTable.tsx` - Container with scroll
- [x] `EmailTableHeader.tsx` - Sticky table header
- [x] `EmailRow.tsx` - Individual email row

**Implementation Details**:

**EmailTable.tsx**:
```tsx
<div className="flex-1 overflow-auto">
  <table className="w-full">
    <EmailTableHeader />
    <tbody>
      {emails.map(email => (
        <EmailRow
          key={email.id}
          email={email}
          isSelected={selectedEmailId === email.id}
          onClick={() => setSelectedEmailId(email.id)}
        />
      ))}
    </tbody>
  </table>
</div>
```

**EmailTableHeader.tsx** (Sticky):
```tsx
<thead className="sticky top-0 bg-white z-10 border-b-2">
  <tr>
    <th>Sender</th>
    <th>Subject</th>
    <th>Date</th>
    <th>Status</th>
  </tr>
</thead>
```

**EmailRow.tsx** (Truncation):
```tsx
<td className="truncate max-w-xs">{email.subject}</td>
```

**Tailwind Classes**:
- `sticky top-0`: Sticky header
- `overflow-auto`: Scrollable table
- `truncate`: Text ellipsis
- `max-w-xs`: Control column width

**Acceptance**:
- All 500 emails render in table
- Table header stays sticky when scrolling
- Long subjects/senders show ellipsis
- Read/unread states visually distinguished

---

### Phase 4: Email Selection & Preview Panel (P1)
**Duration**: ~1.5 hours

**Components**:
- [x] `EmailPreview.tsx` - Preview panel with full email details
- [x] `useEmailSelection.ts` - Selection state hook

**Horizontal Flexbox Layout**:
```tsx
// In App.tsx main content area
<main className="flex-1 flex overflow-hidden">
  {selectedEmail && (
    <EmailPreview email={selectedEmail} className="flex-1" />
  )}
  <EmailTable
    className={selectedEmail ? "flex-1" : "w-full"}
    emails={emails}
    selectedId={selectedEmailId}
    onSelect={setSelectedEmailId}
  />
</main>
```

**EmailPreview.tsx Layout**:
```tsx
<div className="flex-1 p-6 border-r overflow-auto">
  <h2 className="text-2xl font-bold">{email.senderName}</h2>
  <p className="text-gray-600">{email.senderEmail}</p>
  <h3 className="text-xl font-bold mt-4">{email.subject}</h3>
  <p className="text-sm text-gray-500">{formatDate(email.date)}</p>
  <span className={`badge ${email.isRead ? 'read' : 'unread'}`}>
    {email.isRead ? 'Read' : 'Unread'}
  </span>
  <div className="mt-6 whitespace-pre-wrap">{email.previewText}</div>
</div>
```

**Acceptance**:
- Clicking email shows preview on right
- Table and preview split 50/50 (both `flex-1`)
- Preview scrolls independently if content is long
- Table remains functional when preview is visible
- No preview shown initially (before first click)

---

### Phase 5: Styling & Visual Polish (P1)
**Duration**: ~1 hour

- [x] Apply Tailwind color scheme
- [x] Style email rows (hover, selected states)
- [x] Style read/unread badges
- [x] Add visual feedback for interactions
- [x] Ensure proper spacing and alignment
- [x] Add border/divider between preview and table

**Visual States**:
```tsx
// Email row states
className={`
  cursor-pointer
  hover:bg-gray-50
  ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
  ${!email.isRead ? 'font-semibold' : 'font-normal'}
`}
```

**Acceptance**:
- Clean, professional appearance
- Clear visual hierarchy
- Hover states on interactive elements
- Selected row clearly highlighted
- Read/unread distinction obvious

---

### Phase 6: P2 Features (Future)
**Duration**: ~2-3 hours total (deferred)

**Sorting**:
- [x] Add click handlers to table headers
- [x] Implement sort logic for date, sender, subject
- [x] Toggle asc/desc on repeated clicks
- [x] Visual indicator for active sort column

**Filtering**:
- [x] Add filter controls to header
- [x] Implement read/unread filter
- [x] Implement text search (sender + subject)
- [x] Show filtered count

**Mark as Read/Unread**:
- [x] Add button to preview panel
- [x] Update email state
- [x] Persist changes in component state
- [x] Update header counts

**Note**: P2 features will be implemented after P1 is complete and validated.

---

## Testing Strategy

### Manual Testing Checklist

**P1 Core Features**:
- [ ] Load application and see 500 emails
- [ ] Scroll through email list - header stays sticky
- [ ] Scroll to bottom - footer stays fixed
- [ ] Click email - preview appears on right
- [ ] Click different email - preview updates
- [ ] Verify 50/50 layout split when preview is visible
- [ ] Check long subject truncation with ellipsis
- [ ] Verify read/unread visual distinction
- [ ] Resize window - layout adjusts properly
- [ ] Check smooth scrolling performance

**Visual QA**:
- [ ] Header shows correct total and unread counts
- [ ] Footer displays "Flexbox Layout Demo"
- [ ] Preview panel shows all required fields
- [ ] Preview text is scrollable
- [ ] Selected row is highlighted
- [ ] Hover states work on table rows

### Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Focus areas**:
- Flexbox layout consistency
- Sticky positioning behavior
- Scroll performance with 500 rows
- Text truncation rendering

### Performance Testing

- [ ] Smooth scroll through all 500 emails (60fps target)
- [ ] Email selection response < 100ms
- [ ] Initial load time < 2 seconds
- [ ] No memory leaks during extended use

### Code Quality

- [ ] TypeScript: No type errors
- [ ] ESLint: No warnings
- [ ] All components have proper TypeScript interfaces
- [ ] Consistent Tailwind class usage
- [ ] No console errors or warnings

## Risk Analysis

### Risk 1: Performance with 500 Emails
- **Impact**: Medium (user experience)
- **Probability**: Low (500 rows is manageable for modern browsers)
- **Mitigation**:
  - Monitor performance during development
  - If needed, implement virtual scrolling (react-window) as fallback
  - Keep row rendering minimal (no heavy computations)
  - Use React.memo for EmailRow if re-renders are excessive

### Risk 2: Sticky Header Browser Compatibility
- **Impact**: Low (visual only)
- **Probability**: Very Low (sticky is well-supported in modern browsers)
- **Mitigation**:
  - Test early in all target browsers
  - Fallback: position: fixed with offset if needed

### Risk 3: Flexbox Layout Edge Cases
- **Impact**: Medium (core demo functionality)
- **Probability**: Low
- **Mitigation**:
  - Test at various viewport sizes
  - Use explicit height constraints (h-screen, flex-1)
  - Ensure overflow handling is correct
  - Test window resize behavior

### Risk 4: Mock Data Quality
- **Impact**: Low (aesthetic only)
- **Probability**: Low
- **Mitigation**:
  - Review generated data samples
  - Ensure variety in names, subjects, dates
  - Validate JSON structure before committing

## Flexbox Learning Objectives

### Demonstrated Patterns

**Pattern 1: Vertical Flexbox with Fixed Header/Footer**
```css
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header, .footer {
  flex: 0 0 auto;  /* Don't grow, don't shrink */
}
.main {
  flex: 1 1 auto;  /* Grow to fill space */
}
```

**Pattern 2: Horizontal 50/50 Split**
```css
.container {
  display: flex;
  flex-direction: row;
}
.panel-left, .panel-right {
  flex: 1;  /* Equal distribution */
}
```

**Pattern 3: Sticky Positioning in Flex Container**
```css
.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

**Pattern 4: Text Truncation in Flex Items**
```css
.table-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
```

**Pattern 5: Scrollable Flex Items**
```css
.scrollable-area {
  flex: 1;
  overflow: auto;
}
```

## Open Technical Questions

✅ None currently. All technical decisions have been made based on requirements.

## Out of Scope (Technical)

The following technical items are explicitly **NOT** included:

- ❌ Virtual scrolling / windowing (acceptable performance without it)
- ❌ State persistence (localStorage, sessionStorage)
- ❌ URL routing / deep linking
- ❌ Service workers / PWA features
- ❌ Build optimization beyond Vite defaults
- ❌ Unit tests / integration tests (manual testing sufficient for demo)
- ❌ CI/CD pipeline
- ❌ Docker containerization
- ❌ Analytics or monitoring
- ❌ Error boundary components (not critical for demo)
- ❌ Accessibility enhancements (ARIA labels, keyboard nav)
- ❌ Responsive design breakpoints
- ❌ Print stylesheets

## Development Workflow

### Setup
```bash
npm install
npm run generate:emails
npm run dev
```

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### File Watching
Vite provides HMR (Hot Module Replacement) - changes appear instantly during development.

## Success Metrics

**Code Quality**:
- TypeScript strict mode with zero errors
- ESLint configured, zero warnings
- Consistent code style via Prettier

**Demonstration Value**:
- Clearly shows 5+ different flexbox patterns
- Code is readable and well-commented
- Can be used as educational reference

**User Experience**:
- Smooth, responsive interactions
- Professional visual appearance
- Intuitive navigation

## Next Steps

After plan approval:

1. ✅ Plan created and documented
2. ⏭️ Run `/speckit.tasks` to create detailed task breakdown
3. ⏭️ Run `/speckit.implement` to begin implementation
4. ⏭️ Execute Phase 0-5 implementation tasks
5. ⏭️ Manual testing and QA
6. ⏭️ Demo and documentation
