# Implementation Tasks: 週間タイムグリッド描画 (Week Time Grid Display)

**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Created**: 2026-02-14

## Task Format

Tasks follow: `- [ ] [ID] [P?] [Story?] Description (filepath)`

- **[ID]**: Sequential (T001, T002, etc.)
- **[P]**: Parallel execution marker (optional)
- **[Story]**: Related user story (US1, US2, US3)
- **filepath**: Specific file to create/modify

---

## Phase 0: Project Setup

### Environment Configuration

- [x] T001 [P] Create Vite React TypeScript project (/)
- [x] T002 [P] Install date-fns dependency (package.json)
- [x] T003 [P] Install Vitest for testing (package.json)
- [x] T004 Configure TypeScript strict mode and path aliases (tsconfig.json)
- [x] T005 Configure Vite path aliases for @shared, @absolute, @grid (vite.config.ts)
- [x] T006 [P] Create shared directory structure (src/shared/components, src/shared/utils)
- [x] T007 [P] Create absolute directory structure (src/absolute/components)
- [x] T008 [P] Create grid directory structure (src/grid/components)
- [x] T009 [P] Create tests directory structure (tests/unit)

---

## Phase 1: Foundation - Shared Layer

### Type Definitions & Constants

- [x] T010 [P] [US1] Define DayInfo type (src/shared/types.ts)
- [x] T011 [P] [US1] Define ViewMode type (src/shared/types.ts)
- [x] T012 [P] [US1] Define TimeSlot type (src/shared/types.ts)
- [x] T013 [P] [US1] Define HOUR_HEIGHT constant (src/shared/constants.ts)
- [x] T014 [P] [US1] Define TOTAL_HEIGHT constant (src/shared/constants.ts)
- [x] T015 [P] [US1] Define DAYS_IN_WEEK constant (src/shared/constants.ts)
- [x] T016 [P] [US2] Define DEFAULT_SCROLL_TOP constant (src/shared/constants.ts)

### Date Utilities

- [x] T017 [US1] Implement getWeekDays function (src/shared/utils/dateUtils.ts)
- [x] T018 [US1] Implement generateTimeSlots function (src/shared/utils/dateUtils.ts)
- [x] T019 [US1] Write unit tests for getWeekDays (tests/unit/dateUtils.test.ts)
- [x] T020 [US1] Write unit tests for generateTimeSlots (tests/unit/dateUtils.test.ts)

---

## Phase 2: User Stories (Priority Order)

### P1 Story: US1 - View Weekly Calendar Structure

#### Shared Components (Foundation)

- [x] T021 [US1] Create WeekHeader component structure (src/shared/components/WeekHeader.tsx)
- [x] T022 [US1] Style WeekHeader with flex layout (src/shared/components/WeekHeader.module.css)
- [x] T023 [US1] Add today highlighting to WeekHeader (src/shared/components/WeekHeader.module.css)
- [x] T024 [US1] Create TimeLabels component structure (src/shared/components/TimeLabels.tsx)
- [x] T025 [US1] Style TimeLabels with absolute positioning (src/shared/components/TimeLabels.module.css)

#### Absolute Method Implementation

- [x] T026 [US1] Create AbsoluteWeekView component structure (src/absolute/AbsoluteWeekView.tsx)
- [x] T027 [US1] Style AbsoluteWeekView container with flex layout (src/absolute/AbsoluteWeekView.module.css)
- [x] T028 [US1] Create DayColumn component for absolute method (src/absolute/components/DayColumn.tsx)
- [x] T029 [US1] Style DayColumn with position relative and flex sizing (src/absolute/components/DayColumn.module.css)
- [x] T030 [US1] Create GridLines component for absolute method (src/absolute/components/GridLines.tsx)
- [x] T031 [US1] Style GridLines with absolute positioning (src/absolute/components/GridLines.module.css)
- [x] T032 [US1] Wire AbsoluteWeekView to render 7 DayColumns (src/absolute/AbsoluteWeekView.tsx)
- [x] T033 [US1] Add vertical border lines between day columns (src/absolute/components/DayColumn.module.css)

#### Grid Method Implementation

- [x] T034 [US1] Create GridWeekView component structure (src/grid/GridWeekView.tsx)
- [x] T035 [US1] Style GridWeekView with CSS Grid layout (src/grid/GridWeekView.module.css)
- [x] T036 [US1] Configure grid-template-rows for 24 hourly slots (src/grid/GridWeekView.module.css)
- [x] T037 [US1] Configure grid-template-columns for 7 day columns (src/grid/GridWeekView.module.css)
- [x] T038 [US1] Create DayGrid component for grid method (src/grid/components/DayGrid.tsx)
- [x] T039 [US1] Style DayGrid with grid positioning (src/grid/components/DayGrid.module.css)
- [x] T040 [US1] Add horizontal grid lines using repeating-linear-gradient (src/grid/GridWeekView.module.css)
- [x] T041 [US1] Wire GridWeekView to render 7 DayGrid components (src/grid/GridWeekView.tsx)
- [x] T042 [US1] Add vertical border lines between day columns (src/grid/components/DayGrid.module.css)

#### Main App Integration

- [x] T043 [US1] Create Toolbar component for view mode toggle (src/shared/components/Toolbar.tsx)
- [x] T044 [US1] Style Toolbar with button group layout (src/shared/components/Toolbar.module.css)
- [x] T045 [US1] Update App.tsx to manage ViewMode state (src/App.tsx)
- [x] T046 [US1] Implement view mode switching logic in App.tsx (src/App.tsx)
- [x] T047 [US1] Render WeekHeader in App.tsx (src/App.tsx)
- [x] T048 [US1] Conditionally render AbsoluteWeekView based on ViewMode (src/App.tsx)
- [x] T049 [US1] Conditionally render GridWeekView based on ViewMode (src/App.tsx)
- [x] T050 [US1] Implement side-by-side layout for comparison mode (src/App.module.css)

---

### P2 Story: US2 - Navigate Through Time Range

#### Scrollable Container Setup

- [x] T051 [US2] Add scrollable container to AbsoluteWeekView (src/absolute/AbsoluteWeekView.tsx)
- [x] T052 [US2] Style scrollable container with overflow-y scroll (src/absolute/AbsoluteWeekView.module.css)
- [x] T053 [US2] Set container height to 1440px (24 hours × 60px) (src/absolute/AbsoluteWeekView.module.css)
- [x] T054 [US2] Add scrollable container to GridWeekView (src/grid/GridWeekView.tsx)
- [x] T055 [US2] Style scrollable container with overflow-y scroll (src/grid/GridWeekView.module.css)
- [x] T056 [US2] Set container height to 1440px (24 hours × 60px) (src/grid/GridWeekView.module.css)

#### Initial Scroll Position

- [x] T057 [US2] Add useRef for scroll container in AbsoluteWeekView (src/absolute/AbsoluteWeekView.tsx)
- [x] T058 [US2] Implement useEffect to set initial scroll position to 8:00 (src/absolute/AbsoluteWeekView.tsx)
- [x] T059 [US2] Add useRef for scroll container in GridWeekView (src/grid/GridWeekView.tsx)
- [x] T060 [US2] Implement useEffect to set initial scroll position to 8:00 (src/grid/GridWeekView.tsx)

---

### P3 Story: US3 - Identify Current Day Visually

#### Today Highlighting

- [x] T061 [US3] Add isToday logic to DayColumn component (src/absolute/components/DayColumn.tsx)
- [x] T062 [US3] Apply today CSS class conditionally in DayColumn (src/absolute/components/DayColumn.tsx)
- [x] T063 [US3] Style today class with filter brightness (src/absolute/components/DayColumn.module.css)
- [x] T064 [US3] Add isToday logic to DayGrid component (src/grid/components/DayGrid.tsx)
- [x] T065 [US3] Apply today CSS class conditionally in DayGrid (src/grid/components/DayGrid.tsx)
- [x] T066 [US3] Style today class with filter brightness (src/grid/components/DayGrid.module.css)

---

## Phase 3: Polish & Verification

### Visual Consistency

- [x] T067 [P] Verify grid line colors match between both methods (src/absolute/components/GridLines.module.css, src/grid/GridWeekView.module.css)
- [x] T068 [P] Verify column border colors match between both methods (src/absolute/components/DayColumn.module.css, src/grid/components/DayGrid.module.css)
- [x] T069 [P] Verify today highlight intensity matches between both methods (src/absolute/components/DayColumn.module.css, src/grid/components/DayGrid.module.css)
- [x] T070 Verify font sizes and spacing match in WeekHeader and TimeLabels (src/shared/components/*.module.css)

### Code Quality

- [x] T071 [P] Add TypeScript return types to all functions (src/**/*.tsx, src/**/*.ts)
- [x] T072 [P] Remove any usage of 'any' type (src/**/*.tsx, src/**/*.ts)
- [x] T073 Verify strict mode compliance with no TypeScript errors (/)
- [x] T074 Run unit tests and verify all pass (tests/unit/dateUtils.test.ts)

### Documentation & Cleanup

- [x] T075 [P] Add JSDoc comments to utility functions (src/shared/utils/dateUtils.ts)
- [x] T076 [P] Remove unused imports and variables (src/**/*.tsx)
- [x] T077 Add README with setup and run instructions (README.md)

---

## Dependency Map

```
Phase 0 (Setup):
T001, T002, T003 → T004, T005
T004, T005 → T006, T007, T008, T009

Phase 1 (Foundation):
T006 → T010, T011, T012, T013, T014, T015, T016
T010, T011, T012, T013, T014, T015 → T017, T018
T017, T018 → T019, T020

Phase 2 (User Stories):
US1 Shared:
T017 → T021, T024
T021 → T022, T023
T024 → T025

US1 Absolute:
T007, T017 → T026
T026 → T027
T026 → T028
T028 → T029, T030, T033
T030 → T031
T026, T028 → T032

US1 Grid:
T008, T017 → T034
T034 → T035, T036, T037, T040
T034 → T038
T038 → T039, T042
T034, T038 → T041

US1 Integration:
T021, T024 → T043
T043 → T044
T026, T034, T043 → T045, T046
T045, T046 → T047, T048, T049, T050

US2:
T032 → T051, T052, T053
T051, T052, T053 → T057, T058
T041 → T054, T055, T056
T054, T055, T056 → T059, T060

US3:
T028 → T061, T062, T063
T038 → T064, T065, T066

Phase 3 (Polish):
T032, T041 → T067, T068, T069, T070
All code tasks → T071, T072, T073
T019, T020 → T074
All tasks → T075, T076, T077
```

---

## Parallel Execution Opportunities

Tasks marked [P] can run in parallel within their phase:

**Phase 0**:
- T001, T002, T003 (initial setup)
- T006, T007, T008, T009 (directory creation)

**Phase 1**:
- T010, T011, T012, T013, T014, T015, T016 (type & constant definitions)

**Phase 3**:
- T067, T068, T069 (visual verification)
- T071, T072 (code quality)
- T075, T076 (documentation)

---

## MVP Scope

**Minimum viable product** includes tasks: **T001-T050** (US1 完全実装)

これにより以下が達成される:
- ✅ 7日分のタイムグリッドが表示される
- ✅ absolute 方式と Grid 方式の両方が実装される
- ✅ side-by-side モードで比較可能
- ✅ 週ヘッダーと時間ラベルが表示される

**US2 (スクロール)** と **US3 (今日のハイライト)** は MVP 後に追加可能。

**Estimated**: 50 tasks for MVP, 77 tasks total

---

## Success Criteria Mapping

### SC-001: 1秒以内の初回レンダリング
- 達成タスク: T001-T050 (基本実装)
- 検証: React Profiler で計測（Phase 3）

### SC-002: 8:00 付近が初回表示される
- 達成タスク: T057-T060 (スクロール位置初期化)
- 検証: ブラウザで目視確認

### SC-003: 0:00〜24:00 の全範囲にアクセス可能
- 達成タスク: T051-T056 (スクロール可能コンテナ)
- 検証: スクロールバーの動作確認

### SC-004: 今日の日付列が視覚的に識別可能
- 達成タスク: T061-T066 (今日のハイライト)
- 検証: ブラウザで目視確認

### SC-005: 両方式で同一の見た目と動作
- 達成タスク: T067-T070 (視覚的一貫性)
- 検証: side-by-side モードでピクセル比較

---

## Implementation Notes

### Task Execution Guidelines

1. **Phase 0 から順に実行**: セットアップタスクを完了してから実装に入る
2. **共通レイヤーを先に実装**: shared/ のコードを先に完成させることで、両方式で再利用可能
3. **片方の方式を完成させてから他方へ**: absolute を完成させてから Grid に移ると、パターンが明確になる
4. **Visual verification は最後**: 両方式の実装が完了してから見た目を揃える

### File Path Conventions

- **Component files**: PascalCase (例: `WeekHeader.tsx`)
- **CSS Modules**: Component名.module.css (例: `WeekHeader.module.css`)
- **Utility files**: camelCase (例: `dateUtils.ts`)
- **Test files**: 対象ファイル名.test.ts (例: `dateUtils.test.ts`)

### Constitution Compliance Checklist

実装中に以下を常に確認:

- [ ] スコープ外機能を追加していないか
- [ ] date-fns 以外の外部ライブラリを使用していないか
- [ ] CSS-in-JS を使用していないか
- [ ] `any` 型を使用していないか
- [ ] shared/ が absolute/ または grid/ を import していないか

---

## Next Steps

After completing tasks:

1. **Manual Testing**: ブラウザで side-by-side モードを表示し、両方式の見た目が完全に一致することを確認
2. **Performance Measurement**: React Profiler で初回レンダリング時間を計測
3. **Code Review**: 憲法原則への準拠を再確認
4. **Commit**: 完成したコードを git にコミット
5. **Next Feature**: F2 (イベント配置と重なり処理) の仕様作成に進む

**Ready for**: `/speckit.implement` - Execute implementation tasks
