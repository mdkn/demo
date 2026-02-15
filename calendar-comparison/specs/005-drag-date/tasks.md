# Implementation Tasks: ドラッグ&ドロップ（日付移動）

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

## Phase 0: Shared Utilities (日付列判定・日付計算)

- [x] T001 [US1] Add pxToDayIndex() to dragUtils (src/shared/utils/dragUtils.ts)
- [x] T002 [US1][US2] Add calculateNewDate() to dragUtils (src/shared/utils/dragUtils.ts)
- [x] T003 [US1][US2] Write unit tests for new drag date functions (tests/unit/dragUtils.test.ts)

## Phase 1: Absolute 方式の拡張

- [x] T004 [US1][US2][US3] Extend useDragEvent hook for horizontal drag (src/absolute/hooks/useDragEvent.ts)
- [x] T005 [US3] Update AbsoluteWeekView to manage hover state (src/absolute/AbsoluteWeekView.tsx)
- [x] T006 [US3] Update DayColumn to show dropTarget style (src/absolute/components/DayColumn.tsx)
- [x] T007 [US3] Add .dropTarget style to DayColumn (src/absolute/components/DayColumn.module.css)

## Phase 2: Grid 方式の拡張

- [x] T008 [US1][US2][US3] Extend useDragEvent hook for horizontal drag (src/grid/hooks/useDragEvent.ts)
- [x] T009 [US3] Update GridWeekView to manage hover state (src/grid/GridWeekView.tsx)
- [x] T010 [US3] Update DayGrid to show dropTarget style (src/grid/components/DayGrid.tsx)
- [x] T011 [US3] Add .dropTarget style to DayGrid (src/grid/components/DayGrid.module.css)

## Phase 3: Integration & Edge Cases

- [ ] T012 [US2] Test 2D drag (diagonal) in both layouts (manual test)
- [ ] T013 [US4] Test week boundary clamping (manual test)
- [ ] T014 [US1] Test same-day drag (vertical only, F4 compatibility) (manual test)
- [ ] T015 [US3] Test column highlight performance (manual test)
- [ ] T016 [P] Verify side-by-side mode consistency (manual test)

## Phase 4: Performance & Polish

- [ ] T017 [P] Optimize column highlight updates (src/absolute/AbsoluteWeekView.tsx, src/grid/GridWeekView.tsx)
- [ ] T018 [P] Manual 2D drag smoothness test (manual test)
- [ ] T019 [P] Test drag performance with 100 events (manual test)
- [ ] T020 Verify F4 compatibility (manual test)

## Dependency Map

```
T001, T002 → T003
T003 → T004, T008 (can run in parallel for absolute/grid)
T004 → T005, T006, T007
T005, T006, T007 → T012, T013, T014
T008 → T009, T010, T011
T009, T010, T011 → T012, T013, T014
T012, T013, T014 → T015, T016, T017, T018, T019, T020 (parallel)
```

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel:
- **Phase 1/2**: T004-T007 (absolute) and T008-T011 (grid) can be implemented in parallel after T003
- **Phase 4**: T016, T017, T018, T019, T020 (testing and optimization)

## MVP Scope

**Minimum viable product** includes tasks: T001-T016
**Estimated**: 16 tasks for MVP, 20 tasks total

**MVP Deliverables**:
- [US1] Drag events left/right to change date
- [US2] 2D drag (diagonal) to change time and date simultaneously
- [US3] Column highlight during drag
- [US4] Week boundary clamping (0-6)

**Post-MVP (Performance)**:
- T017-T020: Performance optimization and large-scale testing

## Implementation Order

### Recommended Sequence:
1. **Phase 0** (T001-T003): Shared utilities - 2 hours
2. **Phase 1** (T004-T007): Absolute implementation - 5 hours
3. **Phase 2** (T008-T011): Grid implementation - 5 hours
4. **Phase 3** (T012-T016): Integration and edge cases - 3 hours
5. **Phase 4** (T017-T020): Performance & polish - 3 hours

**Total estimated time**: 18 hours

## Notes

- Each task is LLM-executable without additional context
- Tasks are organized by implementation phase for logical flow
- File paths are specific and actionable
- Parallel tasks (marked [P]) can be executed simultaneously
- Manual testing tasks (T012-T020) require browser verification
- useDragEvent hook is extended from F4 to include horizontal drag support

## Success Criteria

### User Stories Coverage:
- US1: Drag events left/right (T001-T002, T004-T011)
- US2: 2D drag (T001-T002, T004-T011, T012)
- US3: Column highlight (T005-T011, T015)
- US4: Week boundary clamping (T001, T013)

### Functional Requirements:
- FR-001: Day column detection (T001)
- FR-002: Date calculation (T002)
- FR-003: 2D drag integration (T004, T008, T012)
- FR-004: Column highlight control (T005-T011)
- FR-005: Week range clamping (T001, T013)
- FR-006: Duration maintenance (T002)

### Performance Targets:
- 60fps during 2D drag (T015, T019)
- Column highlight update < 16ms (T015, T017)
- No performance regression from F4 (T020)

## Next Steps

After completing tasks:
1. Review implementation against spec.md acceptance criteria
2. Verify 2D drag feels natural and accurate
3. Test column highlight visibility
4. Verify F4 compatibility (no regression)
5. Document any performance findings

## Technical Notes

### Pointer Events API Extension
- Use `clientX` in addition to `clientY` for 2D drag
- Calculate both `deltaX` and `deltaY` in pointermove
- Call `onDayHover(dayIndex)` to update column highlight

### Day Column Detection
- Get `getBoundingClientRect()` for all 7 DayColumns at drag start
- Cache rects for performance (no resize during drag)
- Use `pxToDayIndex(clientX, rects)` to find current column

### Date Calculation
- Calculate dayIndex difference: `newDayIndex - startDayIndex`
- Add days to original date: `addDays(originalDate, dayDiff)`
- Preserve time portion from F4's time calculation

### Column Highlight
- WeekView manages `hoveredDayIndex` state
- Pass `isDropTarget={hoveredDayIndex === index}` to each DayColumn/DayGrid
- Use `rgba(59, 130, 246, 0.1)` for subtle blue highlight

### F4 Integration
- Extend F4's `useDragEvent` hook (not replace)
- Add `startX`, `startDayIndex`, `currentDayIndex` to DragState
- Combine F4's time calculation with F5's date calculation in pointerup

### Performance Considerations
- Optimize column highlight updates: only setState if dayIndex changed
- Cache dayColumnRects at drag start (getBoundingClientRect once)
- Use React.memo for DayColumn/DayGrid if needed
