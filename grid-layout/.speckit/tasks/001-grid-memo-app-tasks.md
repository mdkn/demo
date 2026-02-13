# Implementation Tasks: Grid Memo App

**Spec**: `.speckit/features/001-grid-memo-app.md`
**Plan**: `.speckit/plans/001-grid-memo-app-plan.md`
**Created**: 2026-02-13

---

## Task Format

Tasks follow: `- [ ] T### [Priority] Description (filepath)`

- **T###**: Sequential task ID
- **[P1/P2]**: Priority from spec (P1 = must-have, P2 = should-have)
- **[P]**: Parallel execution marker (can run independently)
- **filepath**: Specific file to create/modify

---

## Phase 0: Project Setup (Parallel)

- [ ] T001 [P] [P1] Initialize Vite React+TypeScript project (/)
- [ ] T002 [P] [P1] Install react-grid-layout and types (package.json)
- [ ] T003 [P] [P1] Install sass for SCSS modules (package.json)

**Dependencies**: None (all can run in parallel)

---

## Phase 1: Type System & Constants

- [ ] T004 [P1] Create TypeScript interfaces for Memo, LayoutItem, AppState (src/types/index.ts)
- [ ] T005 [P1] Create color palette constants (src/constants/colors.ts)
- [ ] T006 [P1] Create grid configuration constants (src/constants/colors.ts)
- [ ] T007 [P1] Create default values constants (src/constants/colors.ts)

**Dependencies**: T001, T002, T003 → T004, T005, T006, T007

---

## Phase 2: Core Hooks (Foundation)

### Persistence Hook
- [ ] T008 [P1] Implement useLocalStorage hook with JSON parsing (src/hooks/useLocalStorage.ts)
- [ ] T009 [P1] Add error handling for localStorage quota (src/hooks/useLocalStorage.ts)

### Business Logic Hook
- [ ] T010 [P1] Create useMemos hook skeleton with state (src/hooks/useMemos.ts)
- [ ] T011 [P1] Implement addMemo with position calculation logic (src/hooks/useMemos.ts)
- [ ] T012 [P1] Implement findNearestEmptySpace helper (src/hooks/useMemos.ts)
- [ ] T013 [P1] Implement updateMemo function (src/hooks/useMemos.ts)
- [ ] T014 [P1] Implement deleteMemo function (src/hooks/useMemos.ts)
- [ ] T015 [P2] Implement updateMemoColor function (src/hooks/useMemos.ts)
- [ ] T016 [P1] Implement updateLayout function (src/hooks/useMemos.ts)
- [ ] T017 [P2] Implement resetAll function (src/hooks/useMemos.ts)

**Dependencies**:
- T004, T005, T006, T007 → T008
- T008 → T010
- T010 → T011, T012, T013, T014, T015, T016, T017

---

## Phase 3: Component Layer

### P2: Header Component (can build early)
- [ ] T018 [P2] Create Header component structure (src/components/Header/Header.tsx)
- [ ] T019 [P2] Add reset button with confirmation dialog (src/components/Header/Header.tsx)
- [ ] T020 [P2] Style Header component (src/components/Header/Header.module.scss)

### P2: ColorPicker Component
- [ ] T021 [P2] Create ColorPicker component structure (src/components/ColorPicker/ColorPicker.tsx)
- [ ] T022 [P2] Implement color swatch grid (src/components/ColorPicker/ColorPicker.tsx)
- [ ] T023 [P2] Add click-outside-to-close behavior (src/components/ColorPicker/ColorPicker.tsx)
- [ ] T024 [P2] Style ColorPicker popup (src/components/ColorPicker/ColorPicker.module.scss)

### P1: MemoCard Component (Core)
- [ ] T025 [P1] Create MemoCard component structure (src/components/MemoCard/MemoCard.tsx)
- [ ] T026 [P1] Implement edit mode state and double-click handler (src/components/MemoCard/MemoCard.tsx)
- [ ] T027 [P1] Add textarea with auto-focus and blur handlers (src/components/MemoCard/MemoCard.tsx)
- [ ] T028 [P1] Add Escape key handler to exit edit mode (src/components/MemoCard/MemoCard.tsx)
- [ ] T029 [P1] Implement delete button (src/components/MemoCard/MemoCard.tsx)
- [ ] T030 [P2] Integrate ColorPicker component (src/components/MemoCard/MemoCard.tsx)
- [ ] T031 [P1] Style MemoCard base layout (src/components/MemoCard/MemoCard.module.scss)
- [ ] T032 [P1] Style edit mode textarea (src/components/MemoCard/MemoCard.module.scss)
- [ ] T033 [P2] Style color picker button (src/components/MemoCard/MemoCard.module.scss)

### P1: MemoGrid Component (Core)
- [ ] T034 [P1] Create MemoGrid component structure (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T035 [P1] Integrate ReactGridLayout with config (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T036 [P1] Implement calculateGridPosition helper (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T037 [P1] Add double-click handler with position calculation (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T038 [P1] Implement boundary snapping logic (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T039 [P1] Map memos to MemoCard components with layout (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T040 [P1] Wire onLayoutChange callback (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T041 [P1] Disable dragging for memos in edit mode (src/components/MemoGrid/MemoGrid.tsx)
- [ ] T042 [P1] Style MemoGrid container (src/components/MemoGrid/MemoGrid.module.scss)
- [ ] T043 [P1] Import react-grid-layout CSS (src/components/MemoGrid/MemoGrid.tsx)

**Dependencies**:
- T004, T005 → T018, T019 (Header)
- T005 → T021, T022, T023 (ColorPicker)
- T004, T021 → T025, T026, T027, T028, T029, T030 (MemoCard)
- T004, T005, T006, T011, T025 → T034, T035, T036, T037, T038, T039, T040, T041 (MemoGrid)

---

## Phase 4: App Integration

- [ ] T044 [P1] Update App.tsx to use useMemos hook (src/App.tsx)
- [ ] T045 [P1] Render Header with resetAll handler (src/App.tsx)
- [ ] T046 [P1] Render MemoGrid with all props (src/App.tsx)
- [ ] T047 [P1] Create App layout with flexbox (src/App.module.scss)
- [ ] T048 [P1] Import react-grid-layout base CSS (src/App.tsx)

**Dependencies**: T010-T017 (hooks), T018-T043 (components) → T044, T045, T046, T047, T048

---

## Phase 5: Global Styling & Polish

- [ ] T049 [P1] Create global CSS reset (src/index.css)
- [ ] T050 [P1] Add base typography styles (src/index.css)
- [ ] T051 [P2] Add hover states to all interactive elements (*.module.scss)
- [ ] T052 [P2] Add smooth transitions (*.module.scss)
- [ ] T053 [P2] Style resize handles (src/components/MemoGrid/MemoGrid.module.scss)
- [ ] T054 [P2] Add focus styles for accessibility (*.module.scss)

**Dependencies**: T044-T048 → T049, T050, T051, T052, T053, T054

---

## Phase 6: Testing & Verification

### P1 Core Functionality
- [ ] T055 [P1] Test: Create memo by double-clicking empty space
- [ ] T056 [P1] Test: Edit memo content inline
- [ ] T057 [P1] Test: Delete memo
- [ ] T058 [P1] Test: Drag memo to new position
- [ ] T059 [P1] Test: Resize memo
- [ ] T060 [P1] Test: State persists after page reload
- [ ] T061 [P1] Test: Multiple memos don't overlap

### P2 Enhanced Features
- [ ] T062 [P2] Test: Change memo background color
- [ ] T063 [P2] Test: Reset workspace
- [ ] T064 [P2] Test: Color picker opens/closes correctly

### Edge Cases (from clarifications)
- [ ] T065 [P1] Test: Dragging disabled while in edit mode
- [ ] T066 [P1] Test: Memo creation near grid boundaries (snapping)
- [ ] T067 [P1] Test: Memo creation on occupied space (nearest empty)
- [ ] T068 [P1] Test: Empty content handling
- [ ] T069 [P1] Test: Rapid clicking/dragging
- [ ] T070 [P1] Test: localStorage quota handling

### Bug Fixes
- [ ] T071 [P1] Fix any bugs discovered during testing

**Dependencies**: T049-T054 → T055-T070 → T071

---

## Dependency Map

```
Phase 0 (Setup):
  T001, T002, T003 (parallel)

Phase 1 (Types & Constants):
  T001, T002, T003 → T004, T005, T006, T007

Phase 2 (Hooks):
  T004, T005, T006, T007 → T008 → T010 → T011-T017

Phase 3 (Components):
  Header:    T004, T005 → T018 → T019, T020
  ColorPicker: T005 → T021 → T022, T023, T024
  MemoCard:  T004, T021 → T025 → T026-T033
  MemoGrid:  T004-T007, T011, T025 → T034 → T035-T043

Phase 4 (Integration):
  T010-T017, T018-T043 → T044 → T045, T046, T047, T048

Phase 5 (Polish):
  T044-T048 → T049-T054

Phase 6 (Testing):
  T049-T054 → T055-T070 → T071
```

---

## Parallel Execution Opportunities

**Phase 0** (all parallel):
- T001: Initialize Vite
- T002: Install react-grid-layout
- T003: Install sass

**Phase 3** (some parallel):
- T018-T020: Header (independent)
- T021-T024: ColorPicker (needs T005)
- T025-T033: MemoCard (after ColorPicker)
- T034-T043: MemoGrid (after MemoCard)

---

## MVP Scope

**Minimum Viable Product** includes P1 tasks only:

**Setup**: T001-T003
**Foundation**: T004-T014, T016
**Core Components**: T025-T029, T031-T032, T034-T043
**Integration**: T044-T048
**Styling**: T049-T050
**Testing**: T055-T061, T065-T071

**MVP Task Count**: 52 tasks
**Full Implementation**: 71 tasks

**P1-only** delivers:
- ✅ Create, edit, delete memos
- ✅ Drag and resize
- ✅ localStorage persistence
- ✅ Edit mode with drag disable
- ✅ Boundary snapping
- ✅ Occupied space handling

**P2 adds**:
- ✅ Color customization
- ✅ Reset functionality
- ✅ Polished UI/UX

---

## Task Checklist Summary

| Phase | P1 Tasks | P2 Tasks | Total |
|-------|----------|----------|-------|
| 0: Setup | 3 | 0 | 3 |
| 1: Types/Constants | 4 | 0 | 4 |
| 2: Hooks | 8 | 2 | 10 |
| 3: Components | 20 | 9 | 29 |
| 4: Integration | 5 | 0 | 5 |
| 5: Polish | 2 | 4 | 6 |
| 6: Testing | 11 | 3 | 14 |
| **Total** | **53** | **18** | **71** |

---

## Estimated Effort

Based on implementation plan estimates:

- **Phase 0**: 15 min
- **Phase 1**: 15 min
- **Phase 2**: 45 min
- **Phase 3**: 3 hrs
- **Phase 4**: 30 min
- **Phase 5**: 1 hr
- **Phase 6**: 45 min

**Total Estimated Time**: 6-7 hours

---

## Critical Path

The critical path for MVP:

1. Setup → Types → Hooks → MemoCard → MemoGrid → Integration → Testing

**Blocking tasks** (must complete before others):
- T001-T003: All other tasks blocked
- T010: useMemos skeleton (blocks all memo operations)
- T025: MemoCard structure (blocks MemoGrid)
- T034: MemoGrid structure (blocks integration)
- T044: App integration (blocks testing)

---

## Success Criteria

✅ All P1 tasks completed
✅ All P1 tests passing
✅ No TypeScript errors
✅ State persists correctly
✅ Drag/resize smooth
✅ Edit mode works correctly
✅ Boundary handling works
✅ Code is clean and documented

**Stretch Goals** (P2):
✅ All P2 tasks completed
✅ Color picker functional
✅ Reset workspace works
✅ Polished styling

---

## Next Steps

1. Review this task list
2. Confirm scope (MVP only vs full P1+P2)
3. Run `/speckit.implement` to begin execution
4. Tasks will be executed in dependency order
5. Progress tracked via task status updates
