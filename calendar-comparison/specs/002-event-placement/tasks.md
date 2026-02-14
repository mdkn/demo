# Implementation Tasks: イベント配置（静的描画）

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

## Phase 0: Data Layer (共通実装)

### Type Definitions & Constants
- [x] T001 [P] [US1] Define CalendarEvent type in shared types (src/shared/types.ts)
- [x] T002 [P] [US3] Add STORAGE_KEY constant for localStorage (src/shared/constants.ts)
- [x] T003 [P] [US4] Create sample events dataset with 8 events (src/shared/sampleEvents.ts)

### Event Management Hook
- [x] T004 [US3] Implement useCalendarEvents hook for localStorage CRUD (src/shared/hooks/useCalendarEvents.ts)
- [x] T005 [US3] Write unit tests for useCalendarEvents hook (tests/unit/useCalendarEvents.test.ts)

## Phase 1: Shared Utilities (共通実装)

### Date & Time Utilities
- [x] T006 [P] [US1] Add dateToMinutes() to convert Date to minutes from midnight (src/shared/utils/dateUtils.ts)
- [x] T007 [P] [US1] Add filterEventsByDay() to extract events for specific date (src/shared/utils/eventUtils.ts)

### Overlap Detection & Column Assignment
- [x] T008 [US2] Implement detectOverlaps() for detecting overlapping events (src/shared/utils/overlapUtils.ts)
- [x] T009 [US2] Implement assignColumns() for column assignment algorithm (src/shared/utils/overlapUtils.ts)
- [x] T010 [US2] Implement calculateLCM() for least common multiple (src/shared/utils/overlapUtils.ts)
- [x] T011 [US2] Write unit tests for overlapUtils functions (tests/unit/overlapUtils.test.ts)

## Phase 2: Absolute 方式の実装

### Layout Hook
- [x] T012 [US1][US2] Create useAbsoluteLayout hook for position calculation (src/absolute/hooks/useAbsoluteLayout.ts)

### EventBlock Component
- [x] T013 [US1] Create EventBlock component with absolute positioning (src/absolute/components/EventBlock.tsx)
- [x] T014 [US1] Style EventBlock with colors and hover effects (src/absolute/components/EventBlock.module.css)

### Integration
- [x] T015 [US1] Update AbsoluteWeekView to accept events prop (src/absolute/AbsoluteWeekView.tsx)
- [x] T016 [US1][US2] Update DayColumn to render EventBlock components (src/absolute/components/DayColumn.tsx)

## Phase 3: Grid 方式の実装

### Layout Hook
- [x] T017 [US1][US2] Create useGridLayout hook for grid-row/grid-column calculation (src/grid/hooks/useGridLayout.ts)

### EventBlock Component
- [x] T018 [US1] Create EventBlock component with CSS Grid (src/grid/components/EventBlock.tsx)
- [x] T019 [US1] Style EventBlock with colors and hover effects (src/grid/components/EventBlock.module.css)

### Integration
- [x] T020 [US1] Update GridWeekView to accept events prop (src/grid/GridWeekView.tsx)
- [x] T021 [US1][US2] Update DayGrid to render EventBlock components with LCM columns (src/grid/components/DayGrid.tsx)

## Phase 4: Integration & UI Polish

### App Integration
- [x] T022 [US3] Update App.tsx to use useCalendarEvents and pass to WeekViews (src/App.tsx)
- [x] T023 [US4] Add Reset button to Toolbar component (src/shared/components/Toolbar.tsx)
- [x] T024 [US4] Style Reset button in Toolbar CSS (src/shared/components/Toolbar.module.css)

### Manual Verification
- [ ] T025 Verify side-by-side mode displays same events in both approaches (manual test)
- [ ] T026 Manual testing with 8-event sample data for overlap verification (manual test)

## Phase 5: Performance & Testing

### Optimization
- [ ] T027 [P] Add React.memo to EventBlock components to prevent unnecessary re-renders (src/absolute/components/EventBlock.tsx, src/grid/components/EventBlock.tsx)

### Performance Measurement
- [ ] T028 [P] Measure rendering time with React Profiler for 100 events (manual profiling)
- [ ] T029 [P] Measure overlap calculation time with console.time (manual profiling)

### Testing
- [ ] T030 Run all unit tests and verify coverage (npm test)
- [ ] T031 Visual regression test with Playwright screenshots (manual test)

## Dependency Map

```
T001, T002, T003 → T004
T004 → T005
T006, T007 (parallel) → T008
T008 → T009, T010
T009, T010 → T011
T011 → T012, T017 (can run in parallel for absolute/grid)
T012 → T013
T013 → T014
T014, T015 → T016
T017 → T018
T018 → T019
T019, T020 → T021
T016, T021 → T022
T022 → T023
T023 → T024
T024 → T025, T026
T025, T026 → T027, T028, T029 (parallel)
T027, T028, T029 → T030, T031
```

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel:
- **Phase 0**: T001, T002, T003 (type definitions and constants)
- **Phase 1**: T006, T007 (date utilities)
- **Phase 2/3**: T012 (absolute) and T017 (grid) can be implemented in parallel
- **Phase 5**: T027, T028, T029 (optimization and profiling)

## MVP Scope

**Minimum viable product** includes tasks: T001-T026
**Estimated**: 26 tasks for MVP, 31 tasks total

**MVP Deliverables**:
- [US1] Events displayed at correct time positions ✓
- [US2] Overlapping events shown side-by-side ✓
- [US3] Events persist in localStorage ✓
- [US4] Reset button restores sample data ✓

**Post-MVP (Performance)**:
- T027-T031: Optimization and performance measurement

## Implementation Order

### Recommended Sequence:
1. **Phase 0** (T001-T005): Data foundation - 3 hours
2. **Phase 1** (T006-T011): Shared utilities - 4 hours
3. **Phase 2** (T012-T016): Absolute implementation - 5 hours
4. **Phase 3** (T017-T021): Grid implementation - 5 hours
5. **Phase 4** (T022-T026): Integration & testing - 3 hours
6. **Phase 5** (T027-T031): Performance tuning - 4 hours

**Total estimated time**: 24 hours

## Notes

- Each task is LLM-executable without additional context
- Tasks are organized by implementation phase for logical flow
- File paths are specific and actionable
- Parallel tasks (marked [P]) can be executed simultaneously
- Tests are integrated throughout (T005, T011, T030, T031)
- Manual testing tasks (T025, T026, T028, T029, T031) require human verification

## Success Criteria

### User Stories Coverage:
- ✓ US1: Time-based positioning (T001-T016)
- ✓ US2: Overlap handling (T008-T021)
- ✓ US3: localStorage persistence (T002-T005, T022)
- ✓ US4: Sample data reset (T003, T023-T024)

### Functional Requirements:
- ✓ FR-001: Vertical position calculation (T006, T012, T017)
- ✓ FR-002: Height calculation (T012, T017)
- ✓ FR-003: Overlap detection (T008, T011)
- ✓ FR-004: Column assignment (T009, T011)
- ✓ FR-005: Width calculation (T012, T017)
- ✓ FR-006: LCM integration for Grid (T010, T021)
- ✓ FR-007: localStorage CRUD (T004, T005)
- ✓ FR-008: Date filtering (T007, T015, T020)

### Performance Targets:
- Initial rendering: <500ms for 100 events (T028)
- Overlap calculation: <50ms for 100 events (T029)
- Visual consistency: <2px difference between absolute/grid (T031)

## Next Steps

After completing tasks:
1. Review implementation against spec.md acceptance criteria
2. Verify all 8 sample events display correctly
3. Test localStorage persistence across browser reloads
4. Document performance comparison results
5. Proceed to F3 (Now Indicator) implementation
