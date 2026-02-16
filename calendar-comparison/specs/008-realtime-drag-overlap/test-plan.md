# Test Plan: リアルタイムドラッグ重なり検知

**Feature**: 008-realtime-drag-overlap
**Created**: 2026-02-16
**Status**: Active

## Test Strategy

### 1. Unit Tests

#### DragPreviewContext (src/shared/contexts/DragPreviewContext.test.tsx)
- [ ] Context provides initial null state
- [ ] `updateDragPreview` updates state correctly
- [ ] `clearDragPreview` resets state to null
- [ ] Hook throws error outside Provider
- [ ] Multiple updates use latest values

#### RAF Throttle (src/shared/utils/rafThrottle.test.ts)
- [ ] Throttles multiple rapid calls to single RAF frame
- [ ] Uses latest arguments when throttling
- [ ] Executes callback after RAF
- [ ] Handles cleanup correctly

#### useAbsoluteLayout (src/absolute/hooks/useAbsoluteLayout.test.ts)
- [ ] Works without preview (existing behavior)
- [ ] Creates preview event when dragPreview exists
- [ ] Filters out original event when preview exists
- [ ] Recalculates layout with preview event
- [ ] Handles preview with overlap correctly

#### useGridLayout (src/grid/hooks/useGridLayout.test.ts)
- [ ] Works without preview (existing behavior)
- [ ] Creates preview event when dragPreview exists
- [ ] Recalculates LCM with preview event
- [ ] Handles preview with overlap correctly

### 2. Integration Tests

#### US1: Real-time Repositioning
- [ ] **Scenario 1**: 2 events overlapping
  - Drag Event A (10:00-11:00)
  - Overlap with Event B (10:30-11:30)
  - **Expected**: B moves right during drag

- [ ] **Scenario 2**: 3+ events overlapping
  - Drag into position with multiple events
  - **Expected**: All events reposition correctly

- [ ] **Scenario 3**: Drag away from overlap
  - Drag from overlapping position
  - Move to non-overlapping position
  - **Expected**: Remaining events restore width

- [ ] **Scenario 4**: Cross-day drag
  - Drag event to different day
  - **Expected**: Preview shows in new day column

- [ ] **Scenario 5**: Cancel with Escape
  - Start drag
  - Press Escape
  - **Expected**: Preview clears, event returns to original position

#### US2: Performance
- [ ] **Scenario 1**: 60fps during drag
  - Use React DevTools Profiler
  - Measure frame rate during drag
  - **Expected**: ≥60fps

- [ ] **Scenario 2**: Large dataset (50+ events)
  - Create 50+ events
  - Drag event
  - **Expected**: No lag, smooth operation

- [ ] **Scenario 3**: Memory leaks
  - Drag multiple events
  - Check for RAF callback cleanup
  - **Expected**: No memory increase

#### US3: Accurate Overlap Resolution
- [ ] **Scenario 1**: Preview matches final
  - Drag event
  - Observe preview layout
  - Drop event
  - **Expected**: Final layout matches preview

- [ ] **Scenario 2**: Edge cases
  - Events at day boundaries (00:00, 24:00)
  - Events with same start time
  - **Expected**: Correct overlap detection

### 3. Regression Tests

#### Existing Functionality
- [ ] Drag time (F4) still works
- [ ] Drag date (F5) still works
- [ ] Resize (F6) still works
- [ ] Click-create (F7) still works
- [ ] Event placement (F2) unchanged
- [ ] All existing tests pass

### 4. Manual Testing Checklist

#### Absolute Mode
- [ ] Drag single event vertically
- [ ] Drag into overlapping position
- [ ] Drag away from overlapping position
- [ ] Drag across days
- [ ] Cancel drag with Escape
- [ ] Preview updates smoothly

#### Grid Mode
- [ ] Drag single event vertically
- [ ] Drag into overlapping position
- [ ] Drag away from overlapping position
- [ ] Drag across days
- [ ] Cancel drag with Escape
- [ ] Preview updates smoothly

#### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

## Test Data

### Sample Events for Testing

```typescript
// Overlapping events
const event1 = { id: '1', startAt: '2026-02-17T10:00:00', endAt: '2026-02-17T11:00:00' };
const event2 = { id: '2', startAt: '2026-02-17T10:30:00', endAt: '2026-02-17T11:30:00' };
const event3 = { id: '3', startAt: '2026-02-17T10:15:00', endAt: '2026-02-17T11:15:00' };

// Non-overlapping events
const event4 = { id: '4', startAt: '2026-02-17T12:00:00', endAt: '2026-02-17T13:00:00' };
const event5 = { id: '5', startAt: '2026-02-17T13:00:00', endAt: '2026-02-17T14:00:00' };
```

## Performance Benchmarks

### Acceptance Criteria
- Drag start latency: < 100ms
- Layout recalculation: < 16ms (1 frame @ 60fps)
- RAF throttling: max 60 updates/sec
- Drop confirmation: < 50ms

### Measurement Tools
- React DevTools Profiler
- Chrome DevTools Performance tab
- `performance.now()` for micro-benchmarks

## Test Environment

### Setup
```bash
npm run dev
```

### Test Execution
```bash
# Unit tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

## Success Criteria

### MVP (Phase 4 Core)
- ✓ All unit tests pass
- ✓ Integration scenarios 1-5 pass
- ✓ Performance benchmarks met
- ✓ No regression in existing tests

### Full Release (Phase 4 + 5)
- ✓ All manual tests pass
- ✓ Cross-browser compatibility verified
- ✓ Documentation complete
- ✓ Code coverage ≥ 80% for new code

## Known Limitations

- Performance tests are primarily manual
- E2E tests require manual verification
- Touch device testing not in scope

## Test Execution Log

| Date | Tester | Phase | Status | Notes |
|------|--------|-------|--------|-------|
| 2026-02-16 | Auto | Phase 0 | ✓ Pass | Baseline: 99 tests passing |
| | | | | |
