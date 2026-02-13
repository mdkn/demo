# Email Viewer - Flexbox Demo (SCSS Modules)

A demonstration project showcasing various CSS Flexbox layout patterns through a functional email viewer interface, built with **SCSS Modules** for component-scoped styling.

## 🎯 Purpose

This project is designed as a **learning/demonstration tool** to showcase practical flexbox layout patterns including:

1. **Vertical Flexbox** - Fixed header and footer with flexible content area
2. **Sticky Positioning** - Table headers that remain visible during scroll
3. **Horizontal Flexbox** - Side-by-side layout with equal space distribution (50/50 split)
4. **Text Overflow** - Ellipsis truncation in constrained flex containers
5. **Scrollable Flex Items** - Independent scroll areas within flex containers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Generate mock email data (500 emails)
npm run generate:emails

# Start development server
npm run dev
```

### Build for Production

```bash
# TypeScript check + production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── App.tsx         # Main app with vertical flexbox layout
│   ├── App.module.scss # App component styles
│   ├── Header.tsx      # Fixed header with email counts
│   ├── Header.module.scss
│   ├── Footer.tsx      # Fixed footer
│   ├── Footer.module.scss
│   ├── EmailTable.tsx  # Scrollable email list container
│   ├── EmailTable.module.scss
│   ├── EmailTableHeader.tsx  # Sticky table header
│   ├── EmailTableHeader.module.scss
│   ├── EmailRow.tsx    # Individual email row
│   ├── EmailRow.module.scss
│   ├── EmailPreview.tsx      # Email preview panel
│   └── EmailPreview.module.scss
├── styles/             # Global SCSS
│   ├── globals.scss    # Global styles and resets
│   ├── variables.scss  # SCSS variables (colors, spacing, typography)
│   └── mixins.scss     # Reusable SCSS mixins
├── types/              # TypeScript type definitions
│   ├── email.ts        # Email interface and types
│   └── scss.d.ts       # SCSS module type definitions
├── data/               # Mock data
│   └── emails.json     # Generated 500 emails
├── utils/              # Utility functions
│   └── formatDate.ts   # Date formatting helper
├── main.tsx            # React entry point
└── index.css           # Imports global SCSS

scripts/
└── generateEmails.ts   # Mock data generator
```

## 🎨 Key Features

### P1 Features (Implemented)

- ✅ Display 500 emails in scrollable table
- ✅ Fixed header with total and unread email counts
- ✅ Fixed footer
- ✅ Sticky table headers (remain visible when scrolling)
- ✅ Email selection (click any row)
- ✅ Preview panel (shows full email details)
- ✅ 50/50 horizontal split when preview is visible
- ✅ Visual distinction between read and unread emails
- ✅ Text truncation for long subjects/senders

### P2 Features (Future Enhancements)

- ⏸️ Sort by column (sender, subject, date)
- ⏸️ Filter by read/unread status
- ⏸️ Search emails by text
- ⏸️ Mark emails as read/unread

## 🎓 Flexbox Patterns Demonstrated

### Pattern 1: Vertical Layout with Fixed Header/Footer

**SCSS Module** (`App.module.scss`):
```scss
@use '../styles/variables' as vars;

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main {
  display: flex;
  flex: 1 1 auto;  // Grow to fill space
  overflow: hidden;
}
```

**Component** (`App.tsx`):
```tsx
import styles from './App.module.scss'

<div className={styles.app}>
  <Header />
  <main className={styles.main}>...</main>
  <Footer />
</div>
```

### Pattern 2: Horizontal 50/50 Split

**SCSS Modules**:
```scss
// EmailTable.module.scss
.tableContainer {
  flex: 1;  // 50% when preview is open (flex-basis: 0 ensures equal split)
  overflow: auto;
}

// EmailPreview.module.scss
.previewContainer {
  flex: 1;  // 50% of available space (flex-basis: 0 ensures equal split)
  overflow: auto;
}
```

**Component**:
```tsx
<main className={styles.main}>
  <EmailTable />  {/* Left - 50% */}
  <EmailPreview /> {/* Right - 50% */}
</main>
```

### Pattern 3: Sticky Positioning in Flex Container

**SCSS Module** (`EmailTableHeader.module.scss`):
```scss
@use '../styles/variables' as vars;

.tableHeader {
  position: sticky;
  top: 0;
  z-index: vars.$z-sticky;
  background-color: vars.$white;
  border-bottom: 2px solid vars.$gray-300;
}
```

**Component**:
```tsx
import styles from './EmailTableHeader.module.scss'

<thead className={styles.tableHeader}>
  <tr>...</tr>
</thead>
```

### Pattern 4: Text Truncation with Ellipsis

**SCSS Mixin** (`mixins.scss`):
```scss
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Usage** (`EmailRow.module.scss`):
```scss
@use '../styles/mixins' as mix;

.subjectText {
  @include mix.truncate;
  max-width: 28rem;
}
```

**Component**:
```tsx
<div className={styles.subjectText}>
  Very long email subject that will be truncated...
</div>
```

### Pattern 5: Scrollable Flex Items

**SCSS Mixin** (`mixins.scss`):
```scss
@mixin scrollable {
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  // Custom scrollbar styling
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: vars.$gray-300;
    border-radius: vars.$rounded;
  }
}
```

**Usage** (`EmailTable.module.scss`):
```scss
@use '../styles/mixins' as mix;

.tableContainer {
  @include mix.scrollable;
  flex: 1 1 auto;
}
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **SCSS Modules** - Component-scoped styling with SCSS features
- **ESLint + Prettier** - Code quality

### Why SCSS Modules?

- **Component Scoping**: No className conflicts, styles are scoped per component
- **Educational Value**: CSS flexbox patterns are written explicitly, easier to learn
- **SCSS Features**: Variables, mixins, nesting for better organization
- **Type Safety**: TypeScript integration for className autocomplete
- **Performance**: Only used styles are bundled, ~50% smaller CSS (1.53 KB gzipped vs 2.77 KB)

## 📊 Mock Data

The project includes a data generator that creates 500 realistic email entries with:

- Diverse sender names (multiple cultures)
- Realistic email domains (gmail, outlook, company, etc.)
- Varied subject categories (work, personal, newsletters, notifications)
- Dates distributed over the last 30 days
- 2-5 paragraphs of preview text per email
- ~70% read / ~30% unread ratio

**Regenerate data:**
```bash
npm run generate:emails
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Note:** This is a desktop-first demo. Mobile responsive design is not included in P1.

## 📝 License

This is a demonstration project for learning purposes.

## 🤝 Contributing

This is a demo project. Feel free to fork and modify for your own learning!

---

## 🎨 SCSS Modules Architecture

### Variables System

All design tokens are centralized in `src/styles/variables.scss`:

```scss
// Colors
$primary-600: #2563eb;
$gray-100: #f3f4f6;

// Spacing (4px baseline)
$spacing-4: 1rem;  // 16px

// Typography
$text-2xl: 1.5rem;
$font-bold: 700;
```

### Mixins

Reusable patterns in `src/styles/mixins.scss`:

```scss
@mixin truncate { ... }
@mixin badge { ... }
@mixin scrollable { ... }
@mixin flex-between { ... }
```

### Component Styles

Each component has its own `.module.scss` file:

```tsx
// Component.tsx
import styles from './Component.module.scss'

<div className={styles.container}>
  <span className={styles.title}>
</div>
```

```scss
// Component.module.scss
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;

.container {
  padding: vars.$spacing-4;
}

.title {
  @include mix.truncate;
  font-size: vars.$text-2xl;
}
```

### Benefits

- **No className conflicts**: Scoped to component
- **Type-safe**: TypeScript autocomplete for classNames
- **Maintainable**: Clear separation of concerns
- **Performant**: Only used styles are bundled
- **Educational**: CSS patterns are explicit and clear

---

**Built with ❤️ as a Flexbox learning demonstration using SCSS Modules**
