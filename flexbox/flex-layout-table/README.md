# Email Viewer - Flexbox Demo

A demonstration project showcasing various CSS Flexbox layout patterns through a functional email viewer interface.

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
│   ├── Header.tsx      # Fixed header with email counts
│   ├── Footer.tsx      # Fixed footer
│   ├── EmailTable.tsx  # Scrollable email list container
│   ├── EmailTableHeader.tsx  # Sticky table header
│   ├── EmailRow.tsx    # Individual email row
│   └── EmailPreview.tsx      # Email preview panel
├── types/              # TypeScript type definitions
│   └── email.ts        # Email interface and types
├── data/               # Mock data
│   └── emails.json     # Generated 500 emails
├── utils/              # Utility functions
│   └── formatDate.ts   # Date formatting helper
├── main.tsx            # React entry point
└── index.css           # Global styles + Tailwind imports

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

```tsx
<div className="h-screen flex flex-col">
  <header className="flex-shrink-0">Fixed Header</header>
  <main className="flex-1 overflow-hidden">Flexible Content</main>
  <footer className="flex-shrink-0">Fixed Footer</footer>
</div>
```

**CSS Equivalent:**
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
  flex: 1;  /* Grow to fill space */
}
```

### Pattern 2: Horizontal 50/50 Split

```tsx
<main className="flex">
  <div className="flex-1">Email Table (50% - LEFT)</div>
  <div className="flex-1">Preview Panel (50% - RIGHT)</div>
</main>
```

**CSS Equivalent:**
```css
.container {
  display: flex;
  flex-direction: row;
}
.panel-left, .panel-right {
  flex: 1;  /* Equal distribution */
}
```

### Pattern 3: Sticky Positioning in Flex Container

```tsx
<thead className="sticky top-0 z-10 bg-white">
  <tr>...</tr>
</thead>
```

**CSS Equivalent:**
```css
.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}
```

### Pattern 4: Text Truncation with Ellipsis

```tsx
<div className="truncate max-w-md">
  Very long email subject that will be truncated...
</div>
```

**CSS Equivalent:**
```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 28rem;
}
```

### Pattern 5: Scrollable Flex Items

```tsx
<div className="flex-1 overflow-auto">
  <table>...</table>
</div>
```

**CSS Equivalent:**
```css
.scrollable {
  flex: 1;
  overflow: auto;
}
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Utility-first styling
- **ESLint + Prettier** - Code quality

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

**Built with ❤️ as a Flexbox learning demonstration**
