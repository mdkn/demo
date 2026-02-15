# Implementation Tasks: リサイズ（時間変更）

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

## Phase 0: Component Structure（リサイズハンドル作成）

- [x] T001 [US3] Create ResizeHandle component for Absolute (src/absolute/components/ResizeHandle.tsx)
- [x] T002 [US3] Style ResizeHandle for Absolute (src/absolute/components/ResizeHandle.module.css)
- [x] T003 [US3] Create ResizeHandle component for Grid (src/grid/components/ResizeHandle.tsx)
- [x] T004 [US3] Style ResizeHandle for Grid (src/grid/components/ResizeHandle.module.css)

## Phase 1: Absolute 方式の実装

- [x] T005 [US1][US2] Create useResizeEvent hook (src/absolute/hooks/useResizeEvent.ts)
- [x] T006 [US1][US2][US3] Update EventBlock to use useResizeEvent (src/absolute/components/EventBlock.tsx)
- [x] T007 [US1][US2] Add .resizing style to EventBlock (src/absolute/components/EventBlock.module.css)
- [ ] T008 [US1][US2] Test top/bottom handle separation (manual test)

## Phase 2: Grid 方式の実装

- [x] T009 [US1][US2] Create useResizeEvent hook for Grid (src/grid/hooks/useResizeEvent.ts)
- [x] T010 [US1][US2][US3] Update EventBlock to use useResizeEvent (src/grid/components/EventBlock.tsx)
- [x] T011 [US1][US2] Add .resizing style to EventBlock (src/grid/components/EventBlock.module.css)
- [ ] T012 [US1][US2] Test grid-row updates (manual test)

## Phase 3: Edge Cases & Constraints

- [x] T013 [US4] Implement minimum duration (15min) in useResizeEvent (src/absolute/hooks/useResizeEvent.ts, src/grid/hooks/useResizeEvent.ts)
- [x] T014 [US1][US2] Implement range clamping (0:00-24:00) (src/absolute/hooks/useResizeEvent.ts, src/grid/hooks/useResizeEvent.ts)
- [x] T015 Implement Escape key cancel (src/absolute/hooks/useResizeEvent.ts, src/grid/hooks/useResizeEvent.ts)
- [ ] T016 Test F4 compatibility (resize vs drag separation) (manual test)

## Phase 4: Tooltip (Optional - P2)

- [x] T017 [US5] Create Tooltip component (src/shared/components/Tooltip.tsx)
- [x] T018 [US5] Style Tooltip component (src/shared/components/Tooltip.module.css)
- [x] T019 [US5] Integrate Tooltip with Absolute useResizeEvent (src/absolute/hooks/useResizeEvent.ts)
- [x] T020 [US5] Integrate Tooltip with Grid useResizeEvent (src/grid/hooks/useResizeEvent.ts)

## Phase 5: Performance & Testing

- [ ] T021 [P] Measure resize performance with React Profiler (manual test)
- [ ] T022 [P] Manual resize smoothness test (manual test)
- [ ] T023 [P] Test with 100 events (manual test)
- [ ] T024 Verify side-by-side mode consistency (manual test)

## Dependency Map

```
T001, T002 → T005, T006
T003, T004 → T009, T010
T005 → T006, T007, T008
T006, T007 → T013, T014, T015, T016
T009 → T010, T011, T012
T010, T011 → T013, T014, T015, T016
T013, T014, T015, T016 → T017, T018, T019, T020 (optional)
T013, T014, T015, T016 → T021, T022, T023, T024 (parallel)
```

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel:
- **Phase 0**: T001-T002 (Absolute) and T003-T004 (Grid) can be implemented in parallel
- **Phase 1/2**: T005-T008 (Absolute) and T009-T012 (Grid) can be implemented in parallel after Phase 0
- **Phase 5**: T021, T022, T023 (testing and performance)

## MVP Scope

**Minimum viable product** includes tasks: T001-T016
**Estimated**: 16 tasks for MVP, 24 tasks total

**MVP Deliverables**:
- [US1] Drag top edge to change start time
- [US2] Drag bottom edge to change end time
- [US3] Resize handle hover cursor (ns-resize)
- [US4] Minimum duration constraint (15 minutes)

**Post-MVP (Optional)**:
- T017-T020: Tooltip display during resize (P2)
- T021-T024: Performance optimization and testing

## Implementation Order

### Recommended Sequence:
1. **Phase 0** (T001-T004): ResizeHandle component structure - 2 hours
2. **Phase 1** (T005-T008): Absolute implementation - 6 hours
3. **Phase 2** (T009-T012): Grid implementation - 6 hours
4. **Phase 3** (T013-T016): Constraints and edge cases - 3 hours
5. **Phase 4** (T017-T020): Tooltip (optional) - 3 hours
6. **Phase 5** (T021-T024): Performance & testing - 3 hours

**Total estimated time**: 23 hours (16 hours for MVP)

## Notes

- Each task is LLM-executable without additional context
- Tasks are organized by implementation phase for logical flow
- File paths are specific and actionable
- Parallel tasks can be executed simultaneously
- Manual testing tasks (T008, T012, T016, T021-T024) require browser verification
- useResizeEvent hook is separate from useDragEvent (F4) for clear separation of concerns
- Shared utilities from F4 (snapToMinutes, clampMinutes, calculateNewTime) are reused

## Success Criteria

### User Stories Coverage:
- US1: Top edge resize (T005-T016)
- US2: Bottom edge resize (T005-T016)
- US3: Hover cursor (T001-T004, T006, T010)
- US4: Minimum duration (T013)
- US5: Tooltip (T017-T020, optional)

### Functional Requirements:
- FR-001: Handle area detection (T001-T004, T005, T009)
- FR-002: Top resize calculation (T005, T009, T013)
- FR-003: Bottom resize calculation (T005, T009, T013)
- FR-004: Cursor change (T002, T004)
- FR-005: Minimum duration guarantee (T013)
- FR-006: Tooltip display (T017-T020, optional)
- FR-007: 15-minute snap (T005, T009, using F4's snapToMinutes)
- FR-008: Range limit (T014)

### Performance Targets:
- 60fps during resize (T021, T023)
- Resize update < 16ms (T021)
- No regression from F4 drag functionality (T016)

## Next Steps

After completing tasks:
1. Review implementation against spec.md acceptance criteria
2. Verify resize feels smooth and accurate
3. Test top/bottom handle separation (no conflict with F4 drag)
4. Verify minimum duration constraint works
5. Test Escape key cancellation
6. Document any performance findings

## Technical Notes

### Pointer Events API Extension
- Use `offsetY` to detect handle area (< 8px for top, > height - 8px for bottom)
- Call `stopPropagation()` in ResizeHandle to prevent F4 drag
- Use `setPointerCapture()` to track pointer outside element

### Resize Calculation
- Top resize: `newStartMinutes = startMinutes + (deltaY / hourHeight) * 60`
- Bottom resize: `newEndMinutes = endMinutes + (deltaY / hourHeight) * 60`
- Apply `snapToMinutes(newMinutes, 15)` for 15-minute snap
- Apply minimum duration: `Math.max(15, duration)` or `Math.min(endMinutes - 15, newStartMinutes)`

### Handle Component Structure
- ResizeHandle: 8px height, transparent, absolute positioned
- Top handle: `top: 0`
- Bottom handle: `bottom: 0`
- CSS: `cursor: ns-resize` on hover

### F4 Integration
- useResizeEvent is separate from useDragEvent (not integrated)
- ResizeHandle calls `stopPropagation()` to prevent drag
- EventBlock uses both hooks independently
- Middle area (not in handle) triggers F4 drag

### Performance Considerations
- Optimize resize updates: only update resizing event
- Reuse F4's shared utilities (snapToMinutes, clampMinutes)
- Cache initial state in ResizeState (avoid recalculation)
- Use React.memo for ResizeHandle if needed

### Absolute vs Grid Differences
- Absolute: Update `style.top` and `style.height` during pointermove
- Grid: Update `style.gridRowStart` and `style.gridRowEnd` during pointermove
- Both use same calculation logic (only rendering differs)
