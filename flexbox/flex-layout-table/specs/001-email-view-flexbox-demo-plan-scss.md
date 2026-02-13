# Implementation Plan: Email View Flexbox Demo (SCSS Modules)

**Spec**: [001-email-view-flexbox-demo.md](./001-email-view-flexbox-demo.md)
**Created**: 2026-02-13
**Updated**: 2026-02-13 (SCSS Modules migration)
**Status**: Updated

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.x
- **Framework**: React 18.x (with hooks)
- **Build Tool**: Vite 5.x (fast dev server, HMR, modern build)
- **Styling**: SCSS Modules (CSS Modules + SCSS)
- **Package Manager**: npm or pnpm

### Development Dependencies
- **TypeScript**: Type checking and IDE support
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **@types/react**: React TypeScript definitions
- **sass**: SCSS compiler for Vite

### Runtime Libraries
- **React**: UI component library
- **React DOM**: React rendering for web
- No state management library needed (React useState sufficient for demo)
- No routing library needed (single page)

**Rationale**:
- **Vite over Create React App**: Faster dev experience, modern build tooling, better TypeScript support out of box
- **SCSS Modules over Tailwind**:
  - Component-scoped styles (no className conflicts)
  - Better for demonstrating CSS flexbox patterns directly
  - More explicit styling makes educational value clearer
  - Full SCSS features (variables, mixins, nesting)
  - Type-safe with TypeScript integration
- **No additional dependencies**: Keeping it minimal for a demo project; React hooks provide sufficient state management
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
│   │   ├── App.module.scss         # App component styles
│   │   ├── Header.tsx              # Fixed header with counts
│   │   ├── Header.module.scss      # Header styles
│   │   ├── Footer.tsx              # Fixed footer
│   │   ├── Footer.module.scss      # Footer styles
│   │   ├── EmailTable.tsx          # Email list table
│   │   ├── EmailTable.module.scss  # Table styles
│   │   ├── EmailTableHeader.tsx    # Sticky table header
│   │   ├── EmailTableHeader.module.scss
│   │   ├── EmailRow.tsx            # Individual email row
│   │   ├── EmailRow.module.scss    # Row styles
│   │   └── EmailPreview.tsx        # Email preview panel
│   │   └── EmailPreview.module.scss # Preview styles
│   ├── styles/
│   │   ├── globals.scss            # Global styles and resets
│   │   ├── variables.scss          # SCSS variables (colors, spacing)
│   │   └── mixins.scss             # Reusable SCSS mixins
│   ├── types/
│   │   └── email.ts                # TypeScript interfaces
│   │   └── scss.d.ts               # SCSS module type definitions
│   ├── data/
│   │   └── emails.json             # Generated mock data
│   ├── hooks/
│   │   └── useEmailSelection.ts    # Custom hook for selection logic
│   ├── utils/
│   │   └── formatDate.ts           # Date formatting utilities
│   ├── main.tsx                    # React entry point
│   └── vite-env.d.ts               # Vite environment types
├── scripts/
│   └── generateEmails.ts           # Mock data generator
├── public/
│   └── (static assets if needed)
├── index.html                      # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**Design Patterns**:
- **Component Composition**: Break UI into reusable components
- **Props Down, Events Up**: Standard React data flow
- **Custom Hooks**: Encapsulate selection state logic
- **CSS Modules**: Scoped styling per component
- **SCSS Variables**: Centralized theming

## Styling Architecture

### SCSS Modules Structure

Each component has its own `.module.scss` file:

```scss
// Example: Header.module.scss
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;

.header {
  flex-shrink: 0;
  background: linear-gradient(to right, vars.$primary-600, vars.$primary-700);
  color: vars.$white;
  box-shadow: vars.$shadow-md;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: vars.$spacing-4 vars.$spacing-6;
  }

  .title {
    font-size: vars.$text-2xl;
    font-weight: vars.$font-bold;
  }

  .stats {
    display: flex;
    gap: vars.$spacing-6;
    font-size: vars.$text-sm;
  }

  .badge {
    @include mix.badge;
  }
}
```

### Global Variables (styles/variables.scss)

```scss
// Colors
$primary-50: #eff6ff;
$primary-100: #dbeafe;
$primary-500: #3b82f6;
$primary-600: #2563eb;
$primary-700: #1d4ed8;

$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-900: #111827;

$white: #ffffff;
$black: #000000;

// Spacing (following 4px baseline)
$spacing-1: 0.25rem;  // 4px
$spacing-2: 0.5rem;   // 8px
$spacing-3: 0.75rem;  // 12px
$spacing-4: 1rem;     // 16px
$spacing-6: 1.5rem;   // 24px

// Typography
$text-xs: 0.75rem;
$text-sm: 0.875rem;
$text-base: 1rem;
$text-xl: 1.25rem;
$text-2xl: 1.5rem;

$font-normal: 400;
$font-semibold: 600;
$font-bold: 700;

// Shadows
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

// Z-index layers
$z-sticky: 10;
$z-header: 100;
```

### Global Mixins (styles/mixins.scss)

```scss
@use './variables' as vars;

// Flexbox mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// Text truncation
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Badge component
@mixin badge {
  display: inline-block;
  border-radius: 9999px;
  padding: vars.$spacing-1 vars.$spacing-2;
  font-size: vars.$text-xs;
  font-weight: vars.$font-semibold;
}

// Scrollable container
@mixin scrollable {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
```

## Data Design

### TypeScript Interfaces

```typescript
// src/types/email.ts (unchanged)
export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string; // ISO 8601 date string
  previewText: string; // 2-5 paragraphs
  isRead: boolean;
}

export interface EmailStats {
  total: number;
  unread: number;
}

export type SortField = 'date' | 'sender' | 'subject';
export type SortDirection = 'asc' | 'desc';
```

### SCSS Module Type Definitions

```typescript
// src/types/scss.d.ts
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
```

### JSON Data Format (unchanged)

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
  }
]
```

### State Management (unchanged)

**Component State (React useState)**:

```typescript
const [emails, setEmails] = useState<Email[]>([]);
const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
const [sortField, setSortField] = useState<SortField>('date');
const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
```

## Implementation Phases

### Phase 0: Project Setup & SCSS Configuration
**Duration**: ~45 minutes

- [x] Install SCSS dependencies
  ```bash
  npm install -D sass
  ```
- [x] Configure Vite for SCSS Modules (already supported)
- [x] Remove Tailwind CSS dependencies
- [x] Create SCSS structure (variables, mixins, globals)
- [x] Set up SCSS module type definitions
- [x] Update tsconfig.json if needed

**Acceptance**: SCSS files compile successfully with `npm run dev`

---

### Phase 1: Global Styles & Variables
**Duration**: ~30 minutes

- [x] Create `styles/variables.scss` with design tokens
- [x] Create `styles/mixins.scss` with reusable patterns
- [x] Create `styles/globals.scss` with resets and base styles
- [x] Import globals in main.tsx

**Acceptance**: Global styles applied, variables accessible

---

### Phase 2: Convert Components to SCSS Modules
**Duration**: ~3-4 hours

#### Header Component
- [x] Create `Header.module.scss`
- [x] Convert Tailwind classes to SCSS
- [x] Import and use styles in Header.tsx

#### Footer Component
- [x] Create `Footer.module.scss`
- [x] Convert Tailwind classes to SCSS
- [x] Import and use styles in Footer.tsx

#### App Component
- [x] Create `App.module.scss`
- [x] Implement vertical flexbox layout in SCSS
- [x] Import and use styles in App.tsx

#### EmailTable Component
- [x] Create `EmailTable.module.scss`
- [x] Implement scrollable container styles
- [x] Import and use styles in EmailTable.tsx

#### EmailTableHeader Component
- [x] Create `EmailTableHeader.module.scss`
- [x] Implement sticky positioning
- [x] Import and use styles

#### EmailRow Component
- [x] Create `EmailRow.module.scss`
- [x] Implement truncation, hover states
- [x] Read/unread styling variants
- [x] Import and use styles

#### EmailPreview Component
- [x] Create `EmailPreview.module.scss`
- [x] Implement preview panel layout
- [x] Import and use styles

**Acceptance**: All components styled with SCSS Modules, no Tailwind classes remain

---

### Phase 3: Testing & Refinement
**Duration**: ~1 hour

- [x] Verify all flexbox patterns work correctly
- [x] Test responsive behavior
- [x] Check browser compatibility
- [x] Verify no style conflicts
- [x] Test HMR with SCSS changes

**Acceptance**: All visual requirements met with SCSS

---

## SCSS Module Usage Examples

### Component with SCSS Module

```tsx
// EmailRow.tsx
import { Email } from '../types/email';
import { formatDate } from '../utils/formatDate';
import styles from './EmailRow.module.scss';

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

export default function EmailRow({ email, isSelected, onClick }: EmailRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        ${styles.row}
        ${isSelected ? styles.selected : ''}
        ${!email.isRead ? styles.unread : ''}
      `}
    >
      <td className={styles.senderCell}>
        <div className={styles.senderName}>{email.senderName}</div>
        <div className={styles.senderEmail}>{email.senderEmail}</div>
      </td>
      <td className={styles.subjectCell}>
        <div className={styles.truncate}>{email.subject}</div>
      </td>
      <td className={styles.dateCell}>{formatDate(email.date)}</td>
      <td className={styles.statusCell}>
        <span className={email.isRead ? styles.badgeRead : styles.badgeUnread}>
          {email.isRead ? 'Read' : 'Unread'}
        </span>
      </td>
    </tr>
  );
}
```

### Corresponding SCSS Module

```scss
// EmailRow.module.scss
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;

.row {
  cursor: pointer;
  border-bottom: 1px solid vars.$gray-200;
  transition: background-color 0.2s;

  &:hover {
    background-color: vars.$gray-100;
  }

  &.selected {
    border-left: 4px solid vars.$primary-500;
    background-color: vars.$primary-50;
  }

  &.unread {
    font-weight: vars.$font-semibold;
  }
}

.senderCell {
  padding: vars.$spacing-3 vars.$spacing-4;
  max-width: 16rem;
}

.senderName {
  @include mix.truncate;
}

.senderEmail {
  @include mix.truncate;
  font-size: vars.$text-sm;
  color: vars.$gray-500;
}

.subjectCell {
  padding: vars.$spacing-3 vars.$spacing-4;
}

.truncate {
  @include mix.truncate;
  max-width: 28rem;
}

.dateCell {
  padding: vars.$spacing-3 vars.$spacing-4;
  font-size: vars.$text-sm;
  color: vars.$gray-600;
  width: 5rem;
}

.statusCell {
  padding: vars.$spacing-3 vars.$spacing-4;
}

.badgeRead,
.badgeUnread {
  @include mix.badge;
}

.badgeRead {
  background-color: vars.$gray-200;
  color: vars.$gray-700;
}

.badgeUnread {
  background-color: vars.$primary-100;
  color: vars.$primary-800;
}
```

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

**SCSS Module Specific**:
- [ ] Verify no className conflicts
- [ ] Check that styles are scoped to components
- [ ] Verify CSS source maps work in DevTools
- [ ] Test HMR (hot module replacement) with SCSS changes
- [ ] Verify variables and mixins work across modules

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
- SCSS-compiled CSS compatibility

## Risk Analysis

### Risk 1: SCSS Module Learning Curve
- **Impact**: Low (syntax is straightforward)
- **Probability**: Low
- **Mitigation**:
  - Use clear, simple SCSS patterns
  - Document common patterns in mixins
  - Provide examples in plan

### Risk 2: Performance with 500 Emails
- **Impact**: Medium (user experience)
- **Probability**: Low (500 rows is manageable)
- **Mitigation**:
  - SCSS modules compile to optimized CSS
  - Keep selectors simple and performant
  - Monitor performance during development

### Risk 3: Type Safety with SCSS Modules
- **Impact**: Low (developer experience)
- **Probability**: Low
- **Mitigation**:
  - Use TypeScript declaration file for SCSS modules
  - IDE autocomplete will work for className
  - ESLint can catch undefined class references

## Flexbox Learning Objectives

### Demonstrated Patterns (in SCSS)

**Pattern 1: Vertical Flexbox with Fixed Header/Footer**
```scss
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .header,
  .footer {
    flex: 0 0 auto;  // Don't grow, don't shrink
  }

  .main {
    flex: 1 1 auto;  // Grow to fill space
    overflow: hidden;
  }
}
```

**Pattern 2: Horizontal 50/50 Split**
```scss
.mainContent {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;

  .emailTable,
  .preview {
    flex: 1;  // Equal distribution (flex-basis: 0 is critical!)
    // NOTE: flex: 1 1 auto would use content width, causing unequal distribution
  }
}
```

**Pattern 3: Sticky Positioning in Flex Container**
```scss
.tableHeader {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  background: $white;
}
```

**Pattern 4: Text Truncation in Flex Items**
```scss
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 28rem;
}
```

**Pattern 5: Scrollable Flex Items**
```scss
.scrollableArea {
  flex: 1;
  overflow: auto;
}
```

## Migration Benefits

### Why SCSS Modules over Tailwind for this Demo

1. **Educational Clarity**:
   - CSS flexbox patterns are written explicitly
   - Easier to see the actual CSS being applied
   - Better for learning CSS fundamentals

2. **Component Scoping**:
   - No className conflicts between components
   - Clear separation of concerns
   - Type-safe with TypeScript

3. **SCSS Features**:
   - Variables for theming
   - Mixins for reusable patterns
   - Nesting for readability
   - Better organization for larger projects

4. **Performance**:
   - Only used styles are included per component
   - No large utility CSS file
   - Better code splitting

## Open Technical Questions

✅ None currently. SCSS Modules are well-supported by Vite out of the box.

## Out of Scope (Technical)

The following technical items are explicitly **NOT** included:

- ❌ CSS-in-JS solutions (styled-components, emotion)
- ❌ Tailwind CSS (being replaced)
- ❌ PostCSS plugins beyond SCSS
- ❌ CSS autoprefixer configuration (Vite handles this)
- ❌ Virtual scrolling / windowing
- ❌ State persistence (localStorage, sessionStorage)
- ❌ URL routing / deep linking
- ❌ Service workers / PWA features
- ❌ Unit tests / integration tests
- ❌ CI/CD pipeline
- ❌ Docker containerization

## Development Workflow

### Setup
```bash
npm install
npm install -D sass
npm run generate:emails
npm run dev
```

### Development
```bash
npm run dev          # Start dev server with SCSS compilation
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### File Watching
Vite provides HMR (Hot Module Replacement) - SCSS changes appear instantly during development.

## Success Metrics

**Code Quality**:
- TypeScript strict mode with zero errors
- ESLint configured, zero warnings
- Consistent SCSS coding style
- Proper use of variables and mixins

**Demonstration Value**:
- Clearly shows 5+ different flexbox patterns
- Code is readable and well-commented
- SCSS demonstrates proper CSS architecture
- Can be used as educational reference

**User Experience**:
- Smooth, responsive interactions
- Professional visual appearance
- Intuitive navigation
- Identical UX to Tailwind version

## Post-Implementation Bug Fixes

### Bug Fix: 50/50 Split Not Working (2026-02-13)

**Issue**: After SCSS migration, the horizontal layout showed a 1:4 ratio instead of 50/50, with the preview panel being much wider than the email table.

**Root Cause**:
Both `EmailTable.module.scss` and `EmailPreview.module.scss` used `flex: 1 1 auto`:
```scss
// BEFORE (incorrect)
.tableContainer {
  flex: 1 1 auto;  // flex-basis: auto uses content width
}

.previewContainer {
  flex: 1 1 auto;  // flex-basis: auto uses content width
}
```

The `flex-basis: auto` value sets the initial size to the content's natural width. Since the preview panel's content (full email text with padding) is naturally wider than the table, it resulted in unequal space distribution.

**Solution**:
Changed `flex: 1 1 auto` to `flex: 1` (shorthand for `flex: 1 1 0`):
```scss
// AFTER (correct)
.tableContainer {
  flex: 1;  // flex-basis: 0 ensures equal distribution
}

.previewContainer {
  flex: 1;  // flex-basis: 0 ensures equal distribution
}
```

With `flex-basis: 0`, both components start from zero and grow equally, resulting in a perfect 50/50 split regardless of content width.

**Files Modified**:
- `src/components/EmailTable.module.scss:7`
- `src/components/EmailPreview.module.scss:7`
- `README.md:140-148` (documentation update)

**Verification**: Manual testing confirmed the layout now displays a proper 50/50 split.

---

## Next Steps

After plan approval:

1. ✅ Plan created and documented
2. ✅ Run `/speckit.tasks` to create detailed SCSS migration task breakdown
3. ✅ Implement SCSS structure and variables
4. ✅ Convert components one by one
5. ✅ Remove Tailwind dependencies
6. ✅ Test and validate
7. ✅ Bug fix: Correct 50/50 split flex-basis issue
