# Implementation Tasks: クリックによるイベント作成

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

## Phase 0: Shared Utilities（F4, F5からの流用確認）

- [x] T001 [P] Verify pxToMinutes() availability from F4 (src/shared/utils/dragUtils.ts)
- [x] T002 [P] Verify snapToMinutes() availability from F4 (src/shared/utils/dragUtils.ts)
- [x] T003 [P] Verify pxToDayIndex() availability from F5 (src/shared/utils/dragUtils.ts)
- [x] T004 Add calculateDateTime() helper function (src/shared/utils/dragUtils.ts)

## Phase 1: Absolute 方式の実装

- [x] T005 [US1][US2] Create useCreateEvent hook (src/absolute/hooks/useCreateEvent.ts)
- [x] T006 [US3] Create CreationPlaceholder component (src/absolute/components/CreationPlaceholder.tsx)
- [x] T007 [US3] Style CreationPlaceholder (src/absolute/components/CreationPlaceholder.module.css)
- [x] T008 [US1][US2][US3] Update DayColumn to use useCreateEvent (src/absolute/components/DayColumn.tsx)

## Phase 2: Grid 方式の実装

- [ ] T009 [US1][US2] Create useCreateEvent hook for Grid (src/grid/hooks/useCreateEvent.ts)
- [ ] T010 [US3] Create CreationPlaceholder component for Grid (src/grid/components/CreationPlaceholder.tsx)
- [ ] T011 [US3] Style CreationPlaceholder for Grid (src/grid/components/CreationPlaceholder.module.css)
- [ ] T012 [US1][US2][US3] Update DayGrid to use useCreateEvent (src/grid/components/DayGrid.tsx)

## Phase 3: Edge Cases & Integration

- [ ] T013 Implement existing event collision detection (src/absolute/hooks/useCreateEvent.ts, src/grid/hooks/useCreateEvent.ts)
- [ ] T014 [US2] Implement minimum duration (15min) clamping (src/absolute/hooks/useCreateEvent.ts, src/grid/hooks/useCreateEvent.ts)
- [ ] T015 [US3] Implement default title "新しいイベント" (src/absolute/hooks/useCreateEvent.ts, src/grid/hooks/useCreateEvent.ts)
- [ ] T016 [US4][US5] Implement outside click cancel (src/absolute/hooks/useCreateEvent.ts, src/grid/hooks/useCreateEvent.ts)
- [ ] T017 Verify side-by-side mode consistency (manual test)

## Phase 4: Performance & Polish

- [ ] T018 [P] Implement requestAnimationFrame throttling for drag (src/absolute/hooks/useCreateEvent.ts, src/grid/hooks/useCreateEvent.ts)
- [ ] T019 [P] Test with 100 events (manual test)
- [ ] T020 Manual click/drag/input test (manual test)
- [ ] T021 Verify F2 integration (overlap handling after creation) (manual test)

## Dependency Map

```
T001, T002, T003 → T004
T004 → T005, T009 (can run in parallel for absolute/grid)
T005 → T006, T007, T008
T006, T007 → T008
T008 → T013, T014, T015, T016
T009 → T010, T011, T012
T010, T011 → T012
T012 → T013, T014, T015, T016
T013, T014, T015, T016 → T017, T018, T019, T020, T021 (parallel)
```

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel:
- **Phase 0**: T001, T002, T003 (verification tasks)
- **Phase 1/2**: T005-T008 (Absolute) and T009-T012 (Grid) can be implemented in parallel after T004
- **Phase 4**: T018, T019 (performance testing)

## MVP Scope

**Minimum viable product** includes tasks: T001-T017
**Estimated**: 17 tasks for MVP, 21 tasks total

**MVP Deliverables**:
- [US1] Single click creates 1-hour event
- [US2] Drag selection creates custom duration event
- [US3] Inline title input with Enter to confirm
- [US4] Escape key to cancel
- [US5] Outside click to cancel

**Post-MVP (Performance)**:
- T018-T021: Performance optimization and testing

## Implementation Order

### Recommended Sequence:
1. **Phase 0** (T001-T004): Verify utilities and add calculateDateTime - 1 hour
2. **Phase 1** (T005-T008): Absolute implementation - 6 hours
3. **Phase 2** (T009-T012): Grid implementation - 6 hours
4. **Phase 3** (T013-T017): Edge cases and integration - 4 hours
5. **Phase 4** (T018-T021): Performance & polish - 3 hours

**Total estimated time**: 20 hours (17 hours for MVP)

## Notes

- Each task is LLM-executable without additional context
- Tasks are organized by implementation phase for logical flow
- File paths are specific and actionable
- Parallel tasks can be executed simultaneously
- Manual testing tasks (T017, T019-T021) require browser verification
- useCreateEvent hook manages creation state independently from drag/resize
- Shared utilities from F4 (pxToMinutes, snapToMinutes) and F5 (pxToDayIndex) are reused

## Success Criteria

### User Stories Coverage:
- US1: Single click creation (T005-T008, T009-T012)
- US2: Drag selection (T005-T008, T009-T012, T014)
- US3: Title input (T006-T007, T010-T011, T015)
- US4: Escape cancel (T016)
- US5: Outside click cancel (T016)

### Functional Requirements:
- FR-001: Click position detection (T005, T009)
- FR-002: Drag range calculation (T005, T009)
- FR-003: Placeholder rendering (T006-T007, T010-T011)
- FR-004: Inline input display (T006, T010)
- FR-005: Enter key confirm (T006, T010)
- FR-006: Escape key cancel (T016)
- FR-007: Outside click cancel (T016)
- FR-008: Existing event collision (T013)
- FR-009: Default duration (1 hour) (T005, T009)

### Performance Targets:
- Placeholder rendering < 16ms (60fps) (T018, T019)
- No performance regression with 100 events (T019)
- F2 overlap handling works after creation (T021)

## Next Steps

After completing tasks:
1. Review implementation against spec.md acceptance criteria
2. Verify click/drag creation feels natural
3. Test title input flow (type → Enter → save)
4. Test cancel operations (Escape, outside click)
5. Verify collision detection with existing events
6. Document any UX findings

## Technical Notes

### Pointer Events API Usage
- Use `onClick` for single click (< 5px drag delta)
- Use `onPointerDown` + `pointermove` + `pointerup` for drag selection
- Call `e.target.closest('.eventBlock')` to avoid creating on existing events

### Creation State Management
- `CreationState` holds: dayIndex, startMinutes, endMinutes, title
- Placeholder displayed when `creationState !== null`
- Clear state on confirm (Enter) or cancel (Escape, outside click)

### Placeholder Rendering
- Absolute: `position: absolute`, `top: ${topPx}px`, `height: ${heightPx}px`
- Grid: `grid-row: ${startMinutes + 1} / ${endMinutes + 1}`
- Style: `background: rgba(59, 130, 246, 0.3)`, `border: 2px dashed #3b82f6`
- z-index: 5 (below drag handles, above event blocks)

### Input Handling
- autoFocus on placeholder render
- Enter key: confirm and call `onAdd(newEvent)`
- Escape key: cancel and clear state
- Outside click: detect via `document.addEventListener('click')`

### Date/Time Calculation
- `calculateDateTime(date, minutes)`: combine date + time into ISO 8601
- Use F4's `pxToMinutes()` for Y coordinate → minutes
- Use F5's `pxToDayIndex()` for X coordinate → day index (if needed)
- Apply F4's `snapToMinutes(minutes, 15)` for 15-minute snap

### Default Values
- Single click: 1-hour duration
- Empty title: "新しいイベント"
- Default color: "#3b82f6"
- Minimum duration: 15 minutes

### F2 Integration
- After creation, F2's layout algorithm automatically handles overlap
- No special logic needed in useCreateEvent
- Verify in T021 that overlap resolution works

### Performance Considerations
- Throttle `pointermove` with `requestAnimationFrame` (T018)
- Only re-render placeholder component during drag
- Reuse F4/F5 utilities to avoid duplicate code
