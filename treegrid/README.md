# Treegrid Demo

An accessible treegrid component built with React, TypeScript, and Tailwind CSS, following the [WAI-ARIA Treegrid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/).

## Overview

This demo presents a hierarchical file system browser as a treegrid. Folders can be expanded or collapsed to reveal their child items. Both rows and cells are focusable via keyboard navigation.

## Data Model

Each node in the tree has the following shape:

| Field      | Type            | Description                                |
| ---------- | --------------- | ------------------------------------------ |
| id         | string          | Unique identifier                          |
| name       | string          | File or folder name                        |
| type       | "file" \| "folder" | Node type                               |
| size       | string          | Display size (e.g. "4.2 KB", "—")          |
| modified   | string          | Last modified date (e.g. "2025-01-15")     |
| children?  | Node[]          | Child nodes (folders only)                 |

### Columns

| #  | Column    | Description              |
| -- | --------- | ------------------------ |
| 1  | Name      | File/folder name with indent and expand/collapse indicator |
| 2  | Size      | File size                |
| 3  | Modified  | Last modified date       |

## Keyboard Interaction

### Navigation

| Key              | Row Focused                                      | Cell Focused                                      |
| ---------------- | ------------------------------------------------ | ------------------------------------------------- |
| `↓`              | Move focus to the next visible row                | Move focus one cell down                           |
| `↑`              | Move focus to the previous visible row            | Move focus one cell up                             |
| `→`              | Expand row if collapsed; otherwise focus first cell | Move focus one cell to the right                  |
| `←`              | Collapse row if expanded; otherwise no action     | Move focus one cell to the left; if on first cell, focus the row |
| `Enter`          | Toggle expand/collapse if folder                  | Perform default action for cell                    |
| `Home`           | Move focus to the first row                       | Move focus to the first cell in the row            |
| `End`            | Move focus to the last visible row                | Move focus to the last cell in the row             |
| `Ctrl + Home`    | Move focus to the first row                       | Move focus to the same column in the first row     |
| `Ctrl + End`     | Move focus to the last visible row                | Move focus to the same column in the last row      |
| `Page Down`      | Move focus down by a page (10 rows)               | Move focus down by a page (10 rows)                |
| `Page Up`        | Move focus up by a page (10 rows)                 | Move focus up by a page (10 rows)                  |
| `Tab`            | Move focus out of the treegrid                    | Move focus out of the treegrid                     |

### Focus Model

- The treegrid uses a **roving tabindex** strategy.
- Only one cell or row has `tabindex="0"` at a time; all others have `tabindex="-1"`.
- Initial focus goes to the first row.

## WAI-ARIA Roles, States, and Properties

| Element         | Attribute                      | Value / Notes                                        |
| --------------- | ------------------------------ | ---------------------------------------------------- |
| Table container | `role="treegrid"`              |                                                      |
|                 | `aria-label`                   | "File browser"                                       |
| Header row      | `role="row"`                   | Inside `<thead>`                                     |
| Header cell     | `role="columnheader"`          |                                                      |
| Body row        | `role="row"`                   |                                                      |
|                 | `aria-level`                   | Depth in the tree (1-based)                          |
|                 | `aria-posinset`                | Position among siblings (1-based)                    |
|                 | `aria-setsize`                 | Total number of siblings                             |
|                 | `aria-expanded="true\|false"`  | Only on rows with children                           |
| Body cell       | `role="gridcell"`              |                                                      |

## Tech Stack

| Technology | Purpose                    |
| ---------- | -------------------------- |
| React 19   | UI framework               |
| TypeScript | Type safety                |
| Tailwind CSS 4 | Styling                |
| Vite       | Build tool / dev server    |

## Project Structure

```
treegrid/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx              # Entry point
    ├── App.tsx               # App root
    ├── data.ts               # Sample file tree data
    ├── types.ts              # TreeNode type definition
    ├── hooks/
    │   └── useTreegridNav.ts # Keyboard navigation logic
    └── components/
        ├── Treegrid.tsx      # Treegrid container (<table role="treegrid">)
        └── TreegridRow.tsx   # Single row with expand/collapse + indent
```

## Usage

```sh
npm install
npm run dev
```

Open the URL shown in the terminal (default: http://localhost:5173).

## References

- [Treegrid Pattern — WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/)
- [Treegrid Example — WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/examples/treegrid-1/)
- [Grid and Table Properties Practice](https://www.w3.org/WAI/ARIA/apg/practices/grid-and-table-properties/)
