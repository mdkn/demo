# Implementation Tasks: Email View Flexbox Demo

**Spec**: [001-email-view-flexbox-demo.md](./001-email-view-flexbox-demo.md)
**Plan**: [001-email-view-flexbox-demo-plan.md](./001-email-view-flexbox-demo-plan.md)
**Created**: 2026-02-13

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential task identifier (T001, T002, etc.)
- **[P]**: Parallel execution marker (tasks can run independently)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

---

## Phase 0: Project Setup

### Environment Setup
- [ ] T001 [P] Initialize Vite + React + TypeScript project (/)
- [ ] T002 [P] Install Tailwind CSS and configure PostCSS (package.json, tailwind.config.js, postcss.config.js)
- [ ] T003 [P] Configure TypeScript with strict mode (tsconfig.json)
- [ ] T004 [P] Set up ESLint and Prettier (eslintrc, .prettierrc)
- [ ] T005 Create project directory structure (src/components, src/types, src/data, src/hooks, src/utils, scripts)

**Acceptance**: Project builds successfully with `npm run dev`

---

## Phase 1: Type Definitions & Mock Data

### Type System
- [ ] T006 [US1] Create Email interface with all required fields (src/types/email.ts)
- [ ] T007 [US1] Create EmailStats interface for header counts (src/types/email.ts)
- [ ] T008 [US2] Create SortField and SortDirection types for P2 features (src/types/email.ts)

### Mock Data Generation
- [ ] T009 [US1] Create mock data generator script with name/email generators (scripts/generateEmails.ts)
- [ ] T010 [US1] Implement subject line templates (work, personal, newsletters) (scripts/generateEmails.ts)
- [ ] T011 [US1] Implement date distribution logic (last 30 days) (scripts/generateEmails.ts)
- [ ] T012 [US1] Implement preview text generator (2-5 paragraphs) (scripts/generateEmails.ts)
- [ ] T013 [US1] Implement read/unread ratio logic (70/30 split) (scripts/generateEmails.ts)
- [ ] T014 [US1] Generate and save 500 emails to JSON file (src/data/emails.json)
- [ ] T015 Add "generate:emails" script to package.json (package.json)

**Acceptance**: `src/data/emails.json` contains 500 valid email objects with variety

---

## Phase 2: Base Layout Components (US1)

### Layout Foundation
- [ ] T016 [US1] Create index.css with Tailwind imports and global styles (src/index.css)
- [ ] T017 [US1] Create main.tsx React entry point with StrictMode (src/main.tsx)
- [ ] T018 [US1] Update index.html with app title and meta tags (index.html)

### Header Component
- [ ] T019 [US1] Create Header component with props interface (src/components/Header.tsx)
- [ ] T020 [US1] Implement header layout with Tailwind (fixed, flex) (src/components/Header.tsx)
- [ ] T021 [US1] Add app title "Email Viewer Demo" (src/components/Header.tsx)
- [ ] T022 [US1] Add total email count display (src/components/Header.tsx)
- [ ] T023 [US1] Add unread count display (src/components/Header.tsx)
- [ ] T024 [US1] Style header with background, padding, border (src/components/Header.tsx)

### Footer Component
- [ ] T025 [US1] [P] Create Footer component with "Flexbox Layout Demo" text (src/components/Footer.tsx)
- [ ] T026 [US1] [P] Style footer with Tailwind (fixed, background, text-center) (src/components/Footer.tsx)

### Main App Component
- [ ] T027 [US1] Create App component with vertical flexbox layout (src/components/App.tsx)
- [ ] T028 [US1] Import and load emails.json data (src/components/App.tsx)
- [ ] T029 [US1] Calculate email statistics (total, unread count) (src/components/App.tsx)
- [ ] T030 [US1] Implement main layout structure (h-screen, flex, flex-col) (src/components/App.tsx)
- [ ] T031 [US1] Add Header component with email stats (src/components/App.tsx)
- [ ] T032 [US1] Add main content area (flex-1, overflow-hidden) (src/components/App.tsx)
- [ ] T033 [US1] Add Footer component (src/components/App.tsx)

**Acceptance**: Header and footer are fixed, main content fills available space

---

## Phase 3: Email Table Components (US1)

### Table Header Component
- [ ] T034 [US1] Create EmailTableHeader component (src/components/EmailTableHeader.tsx)
- [ ] T035 [US1] Implement sticky table header with thead element (src/components/EmailTableHeader.tsx)
- [ ] T036 [US1] Add column headers: Sender, Subject, Date, Status (src/components/EmailTableHeader.tsx)
- [ ] T037 [US1] Style header with sticky positioning and z-index (src/components/EmailTableHeader.tsx)
- [ ] T038 [US1] Add background and border to header (src/components/EmailTableHeader.tsx)

### Email Row Component
- [ ] T039 [US1] Create EmailRow component with props interface (src/components/EmailRow.tsx)
- [ ] T040 [US1] Implement table row structure with 4 columns (src/components/EmailRow.tsx)
- [ ] T041 [US1] Add sender name/email cell (src/components/EmailRow.tsx)
- [ ] T042 [US1] Add subject cell with text truncation (truncate, max-w-xs) (src/components/EmailRow.tsx)
- [ ] T043 [US1] Create date formatting utility function (src/utils/formatDate.ts)
- [ ] T044 [US1] Add date cell using formatDate utility (src/components/EmailRow.tsx)
- [ ] T045 [US1] Add read/unread status indicator (src/components/EmailRow.tsx)
- [ ] T046 [US1] Style read vs unread rows (font-weight) (src/components/EmailRow.tsx)
- [ ] T047 [US1] Add hover state styling (src/components/EmailRow.tsx)
- [ ] T048 [US1] Add onClick handler for row selection (src/components/EmailRow.tsx)

### Email Table Component
- [ ] T049 [US1] Create EmailTable component with props interface (src/components/EmailTable.tsx)
- [ ] T050 [US1] Implement table container with overflow-auto (src/components/EmailTable.tsx)
- [ ] T051 [US1] Add table element with full width (src/components/EmailTable.tsx)
- [ ] T052 [US1] Integrate EmailTableHeader component (src/components/EmailTable.tsx)
- [ ] T053 [US1] Map emails array to EmailRow components (src/components/EmailTable.tsx)
- [ ] T054 [US1] Pass selection state to EmailRow (isSelected prop) (src/components/EmailTable.tsx)
- [ ] T055 [US1] Handle row click events and update selection (src/components/EmailTable.tsx)
- [ ] T056 [US1] Add conditional className based on preview visibility (src/components/EmailTable.tsx)

### Integration with App
- [ ] T057 [US1] Add selectedEmailId state to App component (src/components/App.tsx)
- [ ] T058 [US1] Integrate EmailTable into main content area (src/components/App.tsx)
- [ ] T059 [US1] Pass emails array and selection handlers to EmailTable (src/components/App.tsx)

**Acceptance**: All 500 emails display in scrollable table with sticky header

---

## Phase 4: Email Preview Panel (US2)

### Preview Component
- [ ] T060 [US2] Create EmailPreview component with props interface (src/components/EmailPreview.tsx)
- [ ] T061 [US2] Implement preview panel container with flex-1 (src/components/EmailPreview.tsx)
- [ ] T062 [US2] Add scrollable container for long content (overflow-auto) (src/components/EmailPreview.tsx)
- [ ] T063 [US2] Add sender name display (large, prominent text) (src/components/EmailPreview.tsx)
- [ ] T064 [US2] Add sender email display (smaller, gray text) (src/components/EmailPreview.tsx)
- [ ] T065 [US2] Add subject line (bold, text-xl) (src/components/EmailPreview.tsx)
- [ ] T066 [US2] Add date/time display using formatDate (src/components/EmailPreview.tsx)
- [ ] T067 [US2] Add read/unread badge component (src/components/EmailPreview.tsx)
- [ ] T068 [US2] Add preview text display with whitespace preservation (src/components/EmailPreview.tsx)
- [ ] T069 [US2] Style preview panel with padding, border-right (src/components/EmailPreview.tsx)

### Horizontal Layout Integration
- [ ] T070 [US2] Update App main content area to support horizontal flexbox (src/components/App.tsx)
- [ ] T071 [US2] Add conditional rendering for EmailPreview (only when email selected) (src/components/App.tsx)
- [ ] T072 [US2] Implement 50/50 split layout using flex-1 on both containers (src/components/App.tsx)
- [ ] T073 [US2] Pass selected email data to EmailPreview component (src/components/App.tsx)

### Selection Hook (Optional Refactor)
- [ ] T074 [US2] Create useEmailSelection custom hook (src/hooks/useEmailSelection.ts)
- [ ] T075 [US2] Move selection state logic into custom hook (src/hooks/useEmailSelection.ts)
- [ ] T076 [US2] Refactor App to use useEmailSelection hook (src/components/App.tsx)

**Acceptance**: Clicking email shows preview panel on right with 50/50 split

---

## Phase 5: Visual Polish & Styling (US1, US2)

### Enhanced Styling
- [ ] T077 [US1] [P] Add color scheme variables to Tailwind config (tailwind.config.js)
- [ ] T078 [US1] [P] Style selected email row with highlight (bg-blue-50, border-l-4) (src/components/EmailRow.tsx)
- [ ] T079 [US1] [P] Enhance read/unread visual distinction (font-semibold for unread) (src/components/EmailRow.tsx)
- [ ] T080 [US2] [P] Style read/unread badge with colors (src/components/EmailPreview.tsx)
- [ ] T081 [US1] [P] Add proper table column width distribution (src/components/EmailTableHeader.tsx)
- [ ] T082 [US2] [P] Add visual divider between preview and table (src/components/EmailPreview.tsx)
- [ ] T083 [US1] [P] Polish header styling (shadows, gradients if desired) (src/components/Header.tsx)
- [ ] T084 [US1] [P] Polish footer styling (src/components/Footer.tsx)

### Responsive Touch-ups
- [ ] T085 [P] Ensure proper overflow handling on all containers (src/components/*.tsx)
- [ ] T086 [P] Test and adjust spacing/padding across components (src/components/*.tsx)
- [ ] T087 [P] Verify text truncation works correctly (src/components/EmailRow.tsx)

**Acceptance**: Clean, professional UI with clear visual hierarchy

---

## Phase 6: P2 Features (Future Enhancements)

### Sorting (US3)
- [ ] T088 [US3] Add sort state (sortField, sortDirection) to App (src/components/App.tsx)
- [ ] T089 [US3] Add click handlers to table header columns (src/components/EmailTableHeader.tsx)
- [ ] T090 [US3] Implement sort logic for date, sender, subject (src/components/App.tsx)
- [ ] T091 [US3] Add visual indicators for active sort column (src/components/EmailTableHeader.tsx)
- [ ] T092 [US3] Toggle sort direction on repeated clicks (src/components/EmailTableHeader.tsx)

### Filtering (US4)
- [ ] T093 [US4] Add filter controls to header (read/unread filter) (src/components/Header.tsx)
- [ ] T094 [US4] Add search input to header (src/components/Header.tsx)
- [ ] T095 [US4] Add filter state to App component (src/components/App.tsx)
- [ ] T096 [US4] Implement read/unread filter logic (src/components/App.tsx)
- [ ] T097 [US4] Implement text search logic (sender + subject) (src/components/App.tsx)
- [ ] T098 [US4] Update email count to show filtered results (src/components/App.tsx)

### Mark as Read/Unread (US5)
- [ ] T099 [US5] Add "Mark as Read/Unread" button to preview panel (src/components/EmailPreview.tsx)
- [ ] T100 [US5] Implement toggle read status handler (src/components/App.tsx)
- [ ] T101 [US5] Update email in state array (src/components/App.tsx)
- [ ] T102 [US5] Update header counts when status changes (src/components/App.tsx)
- [ ] T103 [US5] Update visual styling immediately (src/components/EmailRow.tsx)

**Note**: P2 features deferred until after P1 validation

---

## Phase 7: Documentation & Quality

### Documentation
- [ ] T104 [P] Create README with project overview (README.md)
- [ ] T105 [P] Add setup instructions to README (README.md)
- [ ] T106 [P] Add flexbox patterns documentation (README.md)
- [ ] T107 [P] Add comments explaining flexbox patterns in code (src/components/*.tsx)

### Quality Checks
- [ ] T108 Run TypeScript type checking (npm run type-check)
- [ ] T109 Run ESLint and fix warnings (npm run lint)
- [ ] T110 Test application in Chrome (manual testing)
- [ ] T111 Test application in Firefox (manual testing)
- [ ] T112 Test application in Safari (manual testing)
- [ ] T113 Test application in Edge (manual testing)
- [ ] T114 Verify all success criteria from spec (manual checklist)

**Acceptance**: Documentation complete, no type/lint errors, all browsers work

---

## Dependency Map

```
Phase 0 (Setup):
T001, T002, T003, T004 → T005

Phase 1 (Types & Data):
T005 → T006, T007, T008 (parallel)
T008 → T009
T009 → T010, T011, T012, T013 (sequential in script)
T013 → T014, T015

Phase 2 (Base Layout):
T015 → T016, T017, T018 (parallel)
T016 → T019, T025, T027 (parallel)
T019 → T020 → T021, T022, T023 → T024
T025 → T026
T027 → T028 → T029 → T030 → T031, T032, T033

Phase 3 (Email Table):
T033 → T034, T039, T049 (parallel)
T034 → T035 → T036 → T037 → T038
T039 → T040 → T041, T042, T043 → T044, T045 → T046, T047, T048
T049 → T050 → T051 → T052, T053 → T054 → T055 → T056
T056 → T057 → T058 → T059

Phase 4 (Preview Panel):
T059 → T060
T060 → T061 → T062 → T063, T064, T065, T066, T067, T068 → T069
T069 → T070 → T071 → T072 → T073
T073 → T074 (optional) → T075 → T076

Phase 5 (Polish):
T076 → T077, T078, T079, T080, T081, T082, T083, T084, T085, T086, T087 (all parallel)

Phase 6 (P2 Features - Future):
T087 → T088 → T089, T090, T091, T092 (sorting)
T087 → T093 → T094, T095, T096, T097, T098 (filtering)
T087 → T099 → T100 → T101 → T102 → T103 (mark as read)

Phase 7 (Documentation):
T087 → T104, T105, T106, T107, T108, T109 (parallel)
T109 → T110, T111, T112, T113 (manual testing parallel)
T113 → T114
```

---

## Parallel Execution Opportunities

**Phase 0**: T001, T002, T003, T004 can run in parallel
**Phase 1**: T006, T007, T008 can run in parallel
**Phase 2**: T016, T017, T018 can run in parallel; T019 and T025 and T027 can start in parallel
**Phase 5**: T077-T087 can all run in parallel
**Phase 7**: T104-T109 can run in parallel

---

## MVP Scope

**Minimum Viable Product (P1)** includes tasks: **T001-T087**

- ✅ Complete project setup
- ✅ Mock data generation (500 emails)
- ✅ Fixed header/footer layout
- ✅ Scrollable email table with sticky header
- ✅ Email selection
- ✅ Preview panel with 50/50 split
- ✅ Visual polish and styling

**Estimated MVP**: 87 tasks
**P2 Features**: 16 tasks (T088-T103)
**Documentation**: 11 tasks (T104-T114)
**Total**: 114 tasks

---

## Task Execution Notes

### For LLM Execution
- Each task is self-contained and executable with context from spec and plan
- File paths are specific and actionable
- Tasks follow dependency order for sequential execution
- Parallel tasks marked [P] can be batched for efficiency

### Testing Checkpoints
- After T033: Verify header/footer/layout structure
- After T059: Verify email table displays and scrolls
- After T073: Verify preview panel and selection works
- After T087: Verify all P1 visual requirements met
- After T114: Final validation against spec success criteria

### Success Criteria Mapping
- **SC-001** (Performance): Validated in T110-T113
- **SC-002** (Sticky header): Verified in T037-T038
- **SC-003** (Fixed header/footer): Verified in T033
- **SC-004** (Selection speed): Verified in T073
- **SC-005** (50/50 split): Verified in T072
- **SC-006** (Preview content): Verified in T063-T068
- **SC-007** (Mock data): Verified in T014
- **SC-008** (Visual distinction): Verified in T046, T079
- **SC-009** (Flexbox patterns): Verified in T107, T114
- **SC-010** (Code quality): Verified in T108-T109

---

## Next Steps

1. ✅ Task breakdown created and documented
2. ⏭️ Run `/speckit.implement` to begin execution
3. ⏭️ Execute Phase 0-5 tasks (MVP scope)
4. ⏭️ Perform manual testing (Phase 7)
5. ⏭️ Optionally implement P2 features (Phase 6)
