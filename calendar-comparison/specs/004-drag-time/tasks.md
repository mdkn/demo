# Implementation Tasks: ドラッグ&ドロップ（時間移動）

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

## Phase 0: Shared Utilities (共通実装)

- [x] T001 [US2][US5] Create dragUtils with snap and clamp functions (src/shared/utils/dragUtils.ts)
- [x] T002 [US2][US5] Write unit tests for dragUtils (tests/unit/dragUtils.test.ts)

## Phase 1: Absolute 方式の実装

- [x] T003 [US1][US2][US3][US4] Create useDragEvent hook for absolute layout (src/absolute/hooks/useDragEvent.ts)
- [x] T004 [US1][US3] Update EventBlock to integrate useDragEvent (src/absolute/components/EventBlock.tsx)
- [x] T005 [US3] Add .dragging style with opacity and shadow (src/absolute/components/EventBlock.module.css)
- [x] T006 [US3] Add .grabbable style for hover state (src/absolute/components/EventBlock.module.css)
- [x] T007 [US1] Test resize handle exclusion (manual test)

## Phase 2: Grid 方式の実装

- [x] T008 [US1][US2][US3][US4] Create useDragEvent hook for grid layout (src/grid/hooks/useDragEvent.ts)
- [x] T009 [US1][US3] Update EventBlock to integrate useDragEvent (src/grid/components/EventBlock.tsx)
- [x] T010 [US3] Add .dragging and .grabbable styles (src/grid/components/EventBlock.module.css)
- [ ] T011 [P] Test grid-row update performance with React Profiler (manual profiling)

## Phase 3: Edge Cases & Polish

- [x] T012 [US4] Implement Escape key cancellation (src/absolute/hooks/useDragEvent.ts, src/grid/hooks/useDragEvent.ts)
- [x] T013 [US1] Implement pointercancel handling (src/absolute/hooks/useDragEvent.ts, src/grid/hooks/useDragEvent.ts)
- [x] T014 [US5] Test range clamping at 0:00 and 24:00 boundaries (manual test)
- [x] T015 [US1] Test drag overlap with other events (manual test)
- [N/A] T016 Verify consistent drag behavior in side-by-side mode (manual test) - Side-by-side mode not implemented

## Phase 4: Performance & Integration

- [ ] T017 [P] Implement requestAnimationFrame throttling for pointermove (src/absolute/hooks/useDragEvent.ts, src/grid/hooks/useDragEvent.ts)
- [ ] T018 [P] Verify no memory leak after drag completion (manual profiling)
- [ ] T019 [P] Measure drag performance with React Profiler (manual profiling)
- [ ] T020 Manual drag smoothness test (manual test)
- [ ] T021 Test drag performance with 100 events (manual test)

## Dependency Map

```
T001 → T002
T002 → T003, T008 (can run in parallel for absolute/grid)
T003 → T004, T005, T006
T004, T005, T006 → T007
T008 → T009, T010
T009, T010 → T011
T007, T011 → T012, T013, T014, T015, T016
T012, T013, T014, T015, T016 → T017, T018, T019 (parallel)
T017, T018, T019 → T020, T021
```

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel:
- **Phase 1/2**: T003-T007 (absolute) and T008-T011 (grid) can be implemented in parallel after T002
- **Phase 4**: T011, T017, T018, T019 (profiling and optimization)

## MVP Scope

**Minimum viable product** includes tasks: T001-T016
**Estimated**: 16 tasks for MVP, 21 tasks total

**MVP Deliverables**:
- [US1] Drag events up/down to change time ✓
- [US2] 15-minute snap on drag ✓
- [US3] Visual feedback during drag ✓
- [US4] Escape key to cancel drag ✓
- [US5] Range clamping (0:00-24:00) ✓

**Post-MVP (Performance)**:
- T017-T021: Performance optimization and large-scale testing

## Implementation Order

### Recommended Sequence:
1. **Phase 0** (T001-T002): Shared utilities - 2 hours
2. **Phase 1** (T003-T007): Absolute implementation - 6 hours
3. **Phase 2** (T008-T011): Grid implementation - 6 hours
4. **Phase 3** (T012-T016): Edge cases - 4 hours
5. **Phase 4** (T017-T021): Performance & integration - 4 hours

**Total estimated time**: 22 hours

## Notes

- Each task is LLM-executable without additional context
- Tasks are organized by implementation phase for logical flow
- File paths are specific and actionable
- Parallel tasks (marked [P]) can be executed simultaneously
- Manual testing tasks (T007, T011, T014-T016, T018-T021) require browser verification
- useDragEvent hook is separated between absolute and grid due to different coordinate calculations

## Success Criteria

### User Stories Coverage:
- ✓ US1: Drag events up/down (T003-T004, T008-T009)
- ✓ US2: 15-minute snap (T001-T002)
- ✓ US3: Visual feedback (T005-T006, T010)
- ✓ US4: Escape cancellation (T012)
- ✓ US5: Range clamping (T001-T002, T014)

### Functional Requirements:
- ✓ FR-001: Drag start detection (T003, T008)
- ✓ FR-002: Mouse tracking on drag (T003, T008)
- ✓ FR-003: Update event on drop (T003, T008)
- ✓ FR-004: Maintain duration (T003, T008)
- ✓ FR-005: 15-minute snap calculation (T001-T002)
- ✓ FR-006: Drag visual style (T005-T006, T010)
- ✓ FR-007: Escape key handling (T012)
- ✓ FR-008: Range clamping (T001-T002, T014)
- ✓ FR-009: Pointer capture (T003, T008)

### Performance Targets:
- 60fps during drag (T011, T019)
- No memory leak after completion (T018)
- < 16ms processing time per frame (T019)

## Next Steps

After completing tasks:
1. Review implementation against spec.md acceptance criteria
2. Verify drag smoothness and 15-minute snap feel natural
3. Test edge cases (boundaries, cancellation, overlaps)
4. Compare absolute vs grid implementation complexity
5. Document any performance findings

## Technical Notes

### Pointer Events API
- Use `pointerdown`, `pointermove`, `pointerup` events
- Call `setPointerCapture()` to ensure tracking outside element
- Handle `pointercancel` for cleanup

### Coordinate Calculation
- **Absolute**: deltaY → minutes → snap → clamp → update `style.top`
- **Grid**: deltaY → minutes → snap → clamp → update `style.gridRowStart`

### Resize Handle Exclusion
- Top 8px and bottom 8px are reserved for resize (F6)
- Check offsetY in `onPointerDown` and skip drag if in resize zone

### Performance Considerations
- Use `requestAnimationFrame` for smooth 60fps updates
- Update only dragging event, not other events
- Clean up event listeners in `useEffect` return function
