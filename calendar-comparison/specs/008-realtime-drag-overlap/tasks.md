# Implementation Tasks: リアルタイムドラッグ重なり検知

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-16

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, US3)
- **filepath**: Specific file to create/modify

## Phase 0: Setup & Verification

- [ ] T001 [P] Verify existing drag functionality works (manual test)
- [ ] T002 [P] Verify existing overlap detection works (npm run test)
- [ ] T003 [P] Create test plan document (specs/008-realtime-drag-overlap/test-plan.md)

## Phase 1: Core Infrastructure

### Context Layer (Foundation)

- [ ] T004 [US1] [US2] Create DragPreviewContext with TypeScript types (src/shared/contexts/DragPreviewContext.tsx)
- [ ] T005 [US1] [US2] Implement DragPreviewProvider component (src/shared/contexts/DragPreviewContext.tsx)
- [ ] T006 [US1] [US2] Implement useDragPreview hook (src/shared/contexts/DragPreviewContext.tsx)
- [ ] T007 [US1] [US2] Add Context unit tests (src/shared/contexts/DragPreviewContext.test.tsx)

### Performance Utilities

- [ ] T008 [US2] Create RAF throttle utility function (src/shared/utils/rafThrottle.ts)
- [ ] T009 [US2] Add RAF throttle unit tests (src/shared/utils/rafThrottle.test.ts)

### Provider Integration

- [ ] T010 [US1] Wrap App component with DragPreviewProvider (src/App.tsx)

## Phase 2: Layout Hook Integration

### Absolute Layout

- [ ] T011 [US1] Import useDragPreview in useAbsoluteLayout (src/absolute/hooks/useAbsoluteLayout.ts)
- [ ] T012 [US1] Add dragPreview to useMemo dependencies (src/absolute/hooks/useAbsoluteLayout.ts)
- [ ] T013 [US1] Create preview event when dragPreview exists (src/absolute/hooks/useAbsoluteLayout.ts)
- [ ] T014 [US1] Filter out original event and add preview event (src/absolute/hooks/useAbsoluteLayout.ts)
- [ ] T015 [US1] Add unit tests for preview integration (src/absolute/hooks/useAbsoluteLayout.test.ts)

### Grid Layout

- [ ] T016 [US1] Import useDragPreview in useGridLayout (src/grid/hooks/useGridLayout.ts)
- [ ] T017 [US1] Add dragPreview to useMemo dependencies (src/grid/hooks/useGridLayout.ts)
- [ ] T018 [US1] Create preview event when dragPreview exists (src/grid/hooks/useGridLayout.ts)
- [ ] T019 [US1] Filter out original event and add preview event (src/grid/hooks/useGridLayout.ts)
- [ ] T020 [US1] Add unit tests for preview integration (src/grid/hooks/useGridLayout.test.ts)

## Phase 3: Drag Handler Updates

### Absolute Mode Drag Handler

- [ ] T021 [US1] [US2] Import useDragPreview and createRafThrottle (src/absolute/hooks/useDragEvent.ts)
- [ ] T022 [US1] [US2] Get updateDragPreview and clearDragPreview from context (src/absolute/hooks/useDragEvent.ts)
- [ ] T023 [US2] Create throttled update function with useMemo (src/absolute/hooks/useDragEvent.ts)
- [ ] T024 [US1] Update handlePointerMove to call throttledUpdate with new times (src/absolute/hooks/useDragEvent.ts)
- [ ] T025 [US1] [US3] Update handlePointerUp to clearDragPreview before onUpdate (src/absolute/hooks/useDragEvent.ts)
- [ ] T026 [US1] Update handleKeyDown (Escape) to clearDragPreview (src/absolute/hooks/useDragEvent.ts)
- [ ] T027 [US1] Update handlePointerCancel to clearDragPreview (src/absolute/hooks/useDragEvent.ts)

### Grid Mode Drag Handler

- [ ] T028 [US1] [US2] Import useDragPreview and createRafThrottle (src/grid/hooks/useDragEvent.ts)
- [ ] T029 [US1] [US2] Get updateDragPreview and clearDragPreview from context (src/grid/hooks/useDragEvent.ts)
- [ ] T030 [US2] Create throttled update function with useMemo (src/grid/hooks/useDragEvent.ts)
- [ ] T031 [US1] Update handlePointerMove to call throttledUpdate with new times (src/grid/hooks/useDragEvent.ts)
- [ ] T032 [US1] [US3] Update handlePointerUp to clearDragPreview before onUpdate (src/grid/hooks/useDragEvent.ts)
- [ ] T033 [US1] Update handleKeyDown (Escape) to clearDragPreview (src/grid/hooks/useDragEvent.ts)
- [ ] T034 [US1] Update handlePointerCancel to clearDragPreview (src/grid/hooks/useDragEvent.ts)

## Phase 4: Testing & Validation

### Unit Tests

- [ ] T035 [P] [US1] Test DragPreviewContext state updates (src/shared/contexts/DragPreviewContext.test.tsx)
- [ ] T036 [P] [US1] Test DragPreviewContext clear functionality (src/shared/contexts/DragPreviewContext.test.tsx)
- [ ] T037 [P] [US2] Test RAF throttle batches multiple calls (src/shared/utils/rafThrottle.test.ts)
- [ ] T038 [P] [US2] Test RAF throttle uses latest arguments (src/shared/utils/rafThrottle.test.ts)
- [ ] T039 [P] [US1] Test useAbsoluteLayout with no preview (src/absolute/hooks/useAbsoluteLayout.test.ts)
- [ ] T040 [P] [US1] Test useAbsoluteLayout with preview event (src/absolute/hooks/useAbsoluteLayout.test.ts)
- [ ] T041 [P] [US1] Test useGridLayout with preview event (src/grid/hooks/useGridLayout.test.ts)

### Integration Tests

- [ ] T042 [US1] [US3] Test 2 events overlapping during drag (manual + automated)
- [ ] T043 [US1] [US3] Test 3+ events overlapping during drag (manual + automated)
- [ ] T044 [US1] Test dragging away from overlap (manual + automated)
- [ ] T045 [US1] Test cross-day drag with preview (manual + automated)
- [ ] T046 [US1] Test Escape key clears preview (manual + automated)

### Performance Tests

- [ ] T047 [US2] Measure drag performance with React DevTools Profiler (manual)
- [ ] T048 [US2] Test with 50+ events and verify 60fps (manual)
- [ ] T049 [US2] Verify no memory leaks from RAF callbacks (manual)

### Regression Tests

- [ ] T050 [US3] Run all existing tests to ensure no regression (npm run test)
- [ ] T051 [US3] Test existing drag functionality still works (manual)
- [ ] T052 [US3] Test existing resize functionality still works (manual)
- [ ] T053 [US3] Test existing click-create functionality still works (manual)

## Phase 5: Documentation & Polish

- [ ] T054 [P] Add JSDoc comments to DragPreviewContext (src/shared/contexts/DragPreviewContext.tsx)
- [ ] T055 [P] Add JSDoc comments to rafThrottle (src/shared/utils/rafThrottle.ts)
- [ ] T056 [P] Update README with new feature description (README.md)
- [ ] T057 Document performance characteristics (specs/008-realtime-drag-overlap/performance.md)

## Dependency Map

```
Phase 0 (Verification):
T001, T002, T003 (can run in parallel)

Phase 1 (Infrastructure):
T001, T002 → T004
T004 → T005, T006
T006 → T007
T003 → T008
T008 → T009
T007, T009 → T010

Phase 2 (Layout Hooks):
T010 → T011, T016 (can start in parallel)
T011 → T012 → T013 → T014 → T015
T016 → T017 → T018 → T019 → T020

Phase 3 (Drag Handlers):
T015 → T021
T021 → T022 → T023 → T024 → T025 → T026 → T027
T020 → T028
T028 → T029 → T030 → T031 → T032 → T033 → T034

Phase 4 (Testing):
T027, T034 → T035, T036, T037, T038, T039, T040, T041 (parallel unit tests)
T041 → T042 → T043 → T044 → T045 → T046 (sequential integration tests)
T046 → T047 → T048 → T049 (sequential performance tests)
T049 → T050 → T051 → T052 → T053 (sequential regression tests)

Phase 5 (Documentation):
T053 → T054, T055, T056, T057 (can run in parallel)
```

## Parallel Execution Opportunities

**Phase 0**:
- T001, T002, T003 (all verification tasks)

**Phase 2**:
- T011-T015 (Absolute) and T016-T020 (Grid) can be done in parallel

**Phase 3**:
- T021-T027 (Absolute) and T028-T034 (Grid) can be done in parallel

**Phase 4**:
- T035-T041 (all unit tests)
- T054-T057 (all documentation)

## MVP Scope

**Minimum viable product** includes core functionality tasks:
- Phase 0: T001-T003 (3 tasks)
- Phase 1: T004-T010 (7 tasks)
- Phase 2: T011-T020 (10 tasks)
- Phase 3: T021-T034 (14 tasks)
- Phase 4: T042-T046, T050 (6 tasks)

**MVP Total**: 40 tasks
**Full Total**: 57 tasks

## User Story Coverage

### US1: ドラッグ中のリアルタイム再配置 (P0)
**Tasks**: T004-T007, T010-T027, T035-T036, T039-T046
**Total**: 33 tasks
**Status**: Core implementation + testing

### US2: スムーズなパフォーマンス (P0)
**Tasks**: T008-T009, T023, T030, T037-T038, T047-T049
**Total**: 8 tasks
**Status**: RAF throttling + performance validation

### US3: 正確な重なり解消 (P0)
**Tasks**: T025, T032, T042-T046, T050-T053
**Total**: 10 tasks
**Status**: Integration testing + regression prevention

## Critical Path

The critical path (longest sequential dependency chain) is:

```
T002 → T004 → T005 → T006 → T007 → T010 → T011 → T012 → T013 → T014 → T015 → T021 → T022 → T023 → T024 → T025 → T026 → T027 → T042 → T043 → T044 → T045 → T046 → T047 → T048 → T049 → T050 → T051 → T052 → T053
```

**Critical Path Length**: 30 tasks

## Estimated Effort

Based on plan estimates:
- Phase 0: 0.5-1 hour
- Phase 1: 2-3 hours
- Phase 2: 3-4 hours
- Phase 3: 4-5 hours
- Phase 4: 3-4 hours
- Phase 5: 1-2 hours

**Total**: 13.5-19 hours

**MVP (without polish)**: 12-17 hours

## Notes

- Each task is specific and LLM-executable
- File paths are exact and actionable
- Tasks are organized by phase and user story
- Parallel execution opportunities are marked with [P]
- Tests are integrated throughout, not deferred to end
- MVP scope covers all P0 user stories
- Full scope adds comprehensive testing and documentation

## Next Steps

After reviewing this task list:
1. Verify all user stories are covered
2. Check dependency sequencing
3. Run `/speckit.implement` to begin execution
