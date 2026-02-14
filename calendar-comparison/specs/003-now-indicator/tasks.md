# Implementation Tasks: 現在時刻インジケーター

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, etc.)
- **filepath**: Specific file to create/modify

## Phase 0: Shared Hook (共通実装)

- [x] T001 [US1][US2] Create useCurrentTime hook with setInterval (src/shared/hooks/useCurrentTime.ts)
- [x] T002 [US1] Export CurrentTime type to shared types (src/shared/types.ts)
- [x] T003 [US2] Write unit tests for useCurrentTime hook (tests/unit/useCurrentTime.test.ts)

## Phase 1: Absolute 方式の実装

- [x] T004 [US1][US4] Create NowIndicator component with absolute positioning (src/absolute/components/NowIndicator.tsx)
- [x] T005 [US1][US4] Style NowIndicator with red line and dot (src/absolute/components/NowIndicator.module.css)
- [x] T006 [US1][US3] Update DayColumn to conditionally render NowIndicator (src/absolute/components/DayColumn.tsx)

## Phase 2: Grid 方式の実装

- [x] T007 [US1][US4] Create NowIndicator component with CSS Grid (src/grid/components/NowIndicator.tsx)
- [x] T008 [US1][US4] Style NowIndicator with red line and dot (src/grid/components/NowIndicator.module.css)
- [x] T009 [US1][US3] Update DayGrid to conditionally render NowIndicator (src/grid/components/DayGrid.tsx)

## Phase 3: Visual Polish & Edge Cases

- [ ] T010 Verify z-index layering above EventBlock (manual test)
- [ ] T011 Test date change edge case at midnight (manual test)
- [ ] T012 Test scroll position for early morning hours (manual test)
- [ ] T013 Verify side-by-side mode displays same time position (manual test)

## Phase 4: Performance & Testing

- [ ] T014 [P] Verify no memory leak with Chrome DevTools (manual profiling)
- [ ] T015 [P] Verify re-render isolation with React Profiler (manual profiling)
- [ ] T016 Manual visual test for 1-minute position updates (manual test)
- [ ] T017 Run all unit tests and verify coverage (npm test)

## Dependency Map

```
T001 → T002
T002 → T003
T003 → T004, T007 (can run in parallel for absolute/grid)
T004 → T005
T005 → T006
T007 → T008
T008 → T009
T006, T009 → T010, T011, T012, T013
T010, T011, T012, T013 → T014, T015, T016 (parallel)
T014, T015, T016 → T017
```

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel:
- **Phase 1/2**: T004-T006 (absolute) and T007-T009 (grid) can be implemented in parallel
- **Phase 4**: T014, T015, T016 (profiling and testing)

## MVP Scope

**Minimum viable product** includes tasks: T001-T013
**Estimated**: 13 tasks for MVP, 17 tasks total

**MVP Deliverables**:
- [US1] Red line displays at current time position ✓
- [US2] Indicator updates every minute ✓
- [US3] Only displays on today's column ✓
- [US4] Red dot at left end of line ✓

**Post-MVP (Performance)**:
- T014-T017: Memory leak verification and performance profiling

## Implementation Order

### Recommended Sequence:
1. **Phase 0** (T001-T003): Shared hook - 2 hours
2. **Phase 1** (T004-T006): Absolute implementation - 2 hours
3. **Phase 2** (T007-T009): Grid implementation - 2 hours
4. **Phase 3** (T010-T013): Edge cases - 1.5 hours
5. **Phase 4** (T014-T017): Performance & testing - 2 hours

**Total estimated time**: 9.5 hours

## Notes

- Each task is LLM-executable without additional context
- Tasks are organized by implementation phase for logical flow
- File paths are specific and actionable
- Parallel tasks (marked [P]) can be executed simultaneously
- Manual testing tasks (T010-T016) require browser verification
- useCurrentTime hook is shared between both layout approaches

## Success Criteria

### User Stories Coverage:
- ✓ US1: Visual display of current time (T001-T009)
- ✓ US2: 1-minute position updates (T001-T003, T016)
- ✓ US3: Only displays on today (T006, T009, T013)
- ✓ US4: Red dot at left end (T004-T005, T007-T008)

### Functional Requirements:
- ✓ FR-001: Get current time (T001)
- ✓ FR-002: Calculate vertical position (T004, T007)
- ✓ FR-003: Update every minute (T001, T003)
- ✓ FR-004: Cleanup interval (T001, T003, T014)
- ✓ FR-005: Today detection (T006, T009)
- ✓ FR-006: z-index control (T005, T008, T010)
- ✓ FR-007: Visual styling (T005, T008)

### Performance Targets:
- No memory leak after 10 minutes (T014)
- No unnecessary re-renders of EventBlock (T015)
- Position accuracy within ±1 minute (T016)

## Next Steps

After completing tasks:
1. Review implementation against spec.md acceptance criteria
2. Verify indicator displays on today's column only
3. Verify 1-minute position updates work correctly
4. Test side-by-side mode for consistency
5. Document any edge cases discovered
