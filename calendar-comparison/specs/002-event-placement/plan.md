# Implementation Plan: イベント配置（静的描画）

**Spec**: [spec.md](./spec.md)
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F1 (週間タイムグリッド描画)

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.6.2（strict mode 有効）
- **Framework**: React 19.0.0（関数コンポーネント + Hooks）
- **Build Tool**: Vite 6.0.7
- **Date Library**: date-fns 4.1.0
- **Testing**: Vitest 4.0.18
- **Styling**: CSS Modules

### External Dependencies
なし（F1 と同じスタックを継続使用）

**Rationale**:
- F1 で確立したアーキテクチャとツールチェーンを継承
- 憲法原則 I（Simplicity First）に従い、新規ライブラリの追加なし
- localStorage は Web API 標準機能のため外部依存なし

## Architecture

### System Architecture

F2 は F1 のタイムグリッド上にイベント要素を配置するレイヤーとして実装する。

```
┌─────────────────────────────────────────────┐
│ App.tsx (ViewMode 切替)                      │
├─────────────────────────────────────────────┤
│ useCalendarEvents (localStorage CRUD)       │ ← F2 で新規追加
├─────────────────────────────────────────────┤
│         Absolute方式        Grid方式         │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ AbsoluteWeekView │  │ GridWeekView     │ │
│  │ ├─ TimeLabels    │  │ ├─ TimeLabels    │ │
│  │ ├─ WeekHeader    │  │ ├─ WeekHeader    │ │
│  │ └─ DayColumn ×7  │  │ └─ DayGrid ×7    │ │
│  │    └─ EventBlock │  │    └─ EventBlock │ │ ← F2 で新規追加
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │ shared/utils/overlapUtils.ts   │ ← F2 で新規追加
    │ - detectOverlaps()             │
    │ - assignColumns()              │
    │ - calculateLCM()               │
    └────────────────────────────────┘
```

### Component Structure

F2 で追加するファイル（既存の F1 構造を拡張）:

```
src/
├── shared/
│   ├── types.ts                          # CalendarEvent 型を追加
│   ├── constants.ts                      # STORAGE_KEY 定数を追加
│   ├── sampleEvents.ts                   # サンプルデータ 8件 (新規)
│   ├── hooks/
│   │   └── useCalendarEvents.ts          # localStorage CRUD (新規)
│   └── utils/
│       ├── dateUtils.ts                  # dateToMinutes() を追加
│       ├── overlapUtils.ts               # 重なり計算ロジック (新規)
│       └── eventUtils.ts                 # ID生成, フィルタリング (新規)
│
├── absolute/
│   ├── AbsoluteWeekView.tsx              # events prop を追加
│   ├── components/
│   │   ├── DayColumn.tsx                 # dayEvents prop を追加
│   │   └── EventBlock.tsx                # イベント要素 (新規)
│   │       └── EventBlock.module.css
│   └── hooks/
│       └── useAbsoluteLayout.ts          # レイアウト計算 (新規)
│
└── grid/
    ├── GridWeekView.tsx                  # events prop を追加
    ├── components/
    │   ├── DayGrid.tsx                   # dayEvents prop を追加
    │   └── EventBlock.tsx                # イベント要素 (新規)
    │       └── EventBlock.module.css
    └── hooks/
        └── useGridLayout.ts              # レイアウト計算 (新規)
```

**Design Patterns**:
- **Custom Hooks**: データフェッチとレイアウト計算を分離
- **Pure Functions**: 重なり計算は副作用なしの純粋関数として実装
- **Component Composition**: EventBlock を DayColumn/DayGrid の子コンポーネントとして配置

## Data Design

### localStorage Schema

**Key**: `"calendar-events"`
**Value**: JSON 配列

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Event 1",
    "startAt": "2026-02-14T09:00:00",
    "endAt": "2026-02-14T12:00:00",
    "color": "#3b82f6"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Event 2",
    "startAt": "2026-02-14T10:00:00",
    "endAt": "2026-02-14T12:00:00",
    "color": "#10b981"
  }
]
```

### Type Definitions

```typescript
// src/shared/types.ts

export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;    // ISO 8601
  endAt: string;      // ISO 8601
  color: string;      // CSS color
};

export type DayInfo = {
  date: Date;
  dayOfWeek: string;
  dateLabel: string;
  columnIndex: number;
  isToday: boolean;
};

// Absolute 方式のレイアウト結果
export type AbsoluteEventLayout = {
  event: CalendarEvent;
  top: number;         // px
  left: string;        // percentage (例: "0%", "25%")
  width: string;       // percentage (例: "25%")
  height: number;      // px
  zIndex: number;      // 重なり時の前後関係
};

// Grid 方式のレイアウト結果
export type GridEventLayout = {
  event: CalendarEvent;
  gridRow: string;     // "540 / span 180"
  gridColumn: number;  // 1-based column index
  colSpan: number;     // span 数（通常 1）
};
```

### Data Flow

```
┌──────────────┐
│ localStorage │
│  (永続化層)   │
└──────┬───────┘
       │ 読み込み
       ↓
┌──────────────────────────┐
│ useCalendarEvents        │
│ - events: CalendarEvent[] │
│ - addEvent()             │
│ - updateEvent()          │
│ - deleteEvent()          │
│ - resetEvents()          │
└──────┬───────────────────┘
       │ events prop
       ↓
┌──────────────────────────┐
│ AbsoluteWeekView /       │
│ GridWeekView             │
│ - 7日分でフィルタリング   │
└──────┬───────────────────┘
       │ dayEvents prop
       ↓
┌──────────────────────────┐
│ useAbsoluteLayout /      │
│ useGridLayout            │
│ - 重なり検出              │
│ - カラム割り当て          │
│ - 座標計算                │
└──────┬───────────────────┘
       │ layouts: EventLayout[]
       ↓
┌──────────────────────────┐
│ EventBlock ×N            │
│ - style.top / gridRow    │
│ - style.left / gridColumn │
│ - style.width / colSpan  │
└──────────────────────────┘
```

## Implementation Phases

### Phase 0: Data Layer (共通実装)

**Goal**: localStorage の読み書きとサンプルデータの準備

- [x] T001 Define CalendarEvent type (src/shared/types.ts)
- [x] T002 Add STORAGE_KEY constant (src/shared/constants.ts)
- [x] T003 Create sample events dataset (src/shared/sampleEvents.ts)
- [x] T004 Implement useCalendarEvents hook (src/shared/hooks/useCalendarEvents.ts)
  - localStorage 読み込み
  - CRUD メソッド (addEvent, updateEvent, deleteEvent, resetEvents)
  - 自動保存（useEffect で events 変更時に localStorage に書き込み）
- [x] T005 Write unit tests for useCalendarEvents (tests/unit/useCalendarEvents.test.ts)
  - 初回起動時のサンプルデータ初期化
  - localStorage からの読み込み
  - リセット機能

**Estimated Time**: 3 hours

### Phase 1: Shared Utilities (共通実装)

**Goal**: 座標変換と重なり計算の純粋関数を実装

- [x] T006 Add dateToMinutes() to dateUtils.ts
  - Date → その日の 0:00 からの経過分に変換
- [x] T007 Add filterEventsByDay() to eventUtils.ts
  - 特定の日付のイベントのみを抽出
- [x] T008 Implement detectOverlaps() in overlapUtils.ts
  - 重なり検出アルゴリズム (`startA < endB && startB < endA`)
- [x] T009 Implement assignColumns() in overlapUtils.ts
  - カラム割り当てアルゴリズム（開始時刻順ソート + 空き列検索）
- [x] T010 Implement calculateLCM() in overlapUtils.ts
  - 最小公倍数計算（Grid 方式で使用）
- [x] T011 Write unit tests for overlapUtils.ts
  - 重なりなし（1件）
  - 2件重なり
  - 4件重なり（サンプルデータと同じパターン）
  - LCM 計算（3と4 → 12）

**Estimated Time**: 4 hours

### Phase 2: Absolute 方式の実装

**Goal**: position: absolute でイベントを配置

- [x] T012 Create useAbsoluteLayout hook (src/absolute/hooks/useAbsoluteLayout.ts)
  - Input: CalendarEvent[], hourHeight
  - Output: AbsoluteEventLayout[]
  - ロジック:
    1. dateToMinutes() で top を計算
    2. duration から height を計算（最小 15px）
    3. detectOverlaps() で重なりグループを検出
    4. assignColumns() でカラム番号を取得
    5. left = `${(col / totalCols) * 100}%`, width = `${(1 / totalCols) * 100}%`
- [x] T013 Create EventBlock component (src/absolute/components/EventBlock.tsx)
  - Props: event, layout (AbsoluteEventLayout)
  - Style: position: absolute, top, left, width, height
  - 内容: title, 時刻表示（height > 30px の場合のみ）
- [x] T014 Style EventBlock (src/absolute/components/EventBlock.module.css)
  - background-color: event.color
  - border-radius: 4px
  - border: 1px solid rgba(0,0,0,0.1)
  - padding: 4px
  - overflow: hidden
  - cursor: pointer
  - hover 時に opacity: 0.9
- [x] T015 Update AbsoluteWeekView to accept events prop
  - useCalendarEvents の結果を props で受け取る
- [x] T016 Update DayColumn to render EventBlock components
  - その日のイベントをフィルタリング
  - useAbsoluteLayout でレイアウト計算
  - EventBlock をマッピングして描画

**Estimated Time**: 5 hours

### Phase 3: Grid 方式の実装

**Goal**: CSS Grid でイベントを配置

- [x] T017 Create useGridLayout hook (src/grid/hooks/useGridLayout.ts)
  - Input: CalendarEvent[], hourHeight (使わないが互換性のため受け取る)
  - Output: GridEventLayout[]
  - ロジック:
    1. dateToMinutes() で grid-row-start を計算
    2. duration から span を計算
    3. detectOverlaps() + assignColumns() でカラム番号を取得
    4. LCM で統一列数を計算
    5. gridRow = `${startMin} / span ${durationMin}`
    6. gridColumn = col + 1 (1-based index)
- [x] T018 Create EventBlock component (src/grid/components/EventBlock.tsx)
  - Props: event, layout (GridEventLayout)
  - Style: gridRow, gridColumn を style で指定
  - 内容: absolute 版と同じ（title, 時刻）
- [x] T019 Style EventBlock (src/grid/components/EventBlock.module.css)
  - absolute 版と同じスタイル（background, border-radius 等）
- [x] T020 Update GridWeekView to accept events prop
- [x] T021 Update DayGrid to render EventBlock components
  - grid-template-columns を LCM 列数に設定
  - EventBlock をマッピングして描画

**Estimated Time**: 5 hours

### Phase 4: Integration & UI Polish

**Goal**: App.tsx に統合し、Toolbar にリセットボタンを追加

- [x] T022 Update App.tsx to use useCalendarEvents
  - useCalendarEvents(sampleEvents) を呼び出し
  - events を AbsoluteWeekView / GridWeekView に渡す
- [x] T023 Add Reset button to Toolbar
  - onClick で eventStore.resetEvents() を呼び出し
- [x] T024 Style Reset button (src/shared/components/Toolbar.module.css)
  - 既存のボタンスタイルを継承
- [x] T025 Verify side-by-side mode displays same events
  - absolute と grid で同じイベントが同じ位置に表示されることを確認
- [x] T026 Manual testing with 8-event sample data
  - 重なり数 4 のゾーンで 4 カラム表示を確認
  - 重なりなしのイベント（Event 4）が単独で表示されることを確認

**Estimated Time**: 3 hours

### Phase 5: Performance & Testing

**Goal**: パフォーマンス計測とテスト

- [x] T027 Add React.memo to EventBlock components
  - event.id が変わらない限り再レンダリングしない
- [x] T028 Measure rendering time with React Profiler
  - 100件のイベントを生成
  - Profiler で Commit phase の時間を記録
  - absolute vs grid の比較
- [x] T029 Measure overlap calculation time
  - console.time / console.timeEnd で計測
  - 100件のイベントで 50ms 以内を確認
- [x] T030 Run all unit tests
  - `npm test` で useCalendarEvents, overlapUtils のテストが通ることを確認
- [x] T031 Visual regression test (manual)
  - Playwright で absolute と grid のスクリーンショットを取得
  - ピクセル差分が 2px 以内を確認

**Estimated Time**: 4 hours

## Testing Strategy

### Unit Tests

**Testing Framework**: Vitest 4.0.18

**Test Files**:
1. `tests/unit/useCalendarEvents.test.ts`
   - localStorage の初期化
   - イベントの追加・更新・削除
   - リセット機能
2. `tests/unit/overlapUtils.test.ts`
   - 重なり検出の正確性
   - カラム割り当てのアルゴリズム
   - LCM 計算
3. `tests/unit/dateUtils.test.ts`
   - dateToMinutes() の変換精度

**Coverage Target**: 共通ロジック（shared/utils/）の 100%

### Integration Tests

**Method**: 手動テスト（Playwright での自動化は Phase 5 で検討）

**Test Cases**:
1. サンプルデータの表示
2. localStorage からの読み込み
3. リセットボタンの動作
4. side-by-side モードでの一致確認

### E2E Tests

スコープ外（F2 は静的描画のみ、操作なし）

## Risk Analysis

### Risk 1: Grid の 1440 行定義のパフォーマンス
- **Impact**: High（レンダリング時間が目標を超える可能性）
- **Probability**: Medium
- **Mitigation**:
  - T028 で早期に計測し、500ms を超える場合は Grid 定義を最適化
  - 代替案: grid-template-rows を動的に生成せず、イベントごとに grid-row-start を計算

### Risk 2: 重なり数 10 件以上での UI 崩れ
- **Impact**: Low（サンプルデータは最大 4 件重なり）
- **Probability**: Low
- **Mitigation**:
  - FR-006 で LCM 上限を設定（例: 12 列まで）
  - F2 のスコープ外として将来対応

### Risk 3: localStorage の容量制限
- **Impact**: Low（100 件のイベントでも 50KB 程度）
- **Probability**: Low
- **Mitigation**:
  - 現時点では対応不要
  - 将来的に IndexedDB への移行を検討

### Risk 4: absolute と grid の見た目の差異
- **Impact**: Medium（比較検証の信頼性に影響）
- **Probability**: Medium
- **Mitigation**:
  - T025 で side-by-side モードで視覚的に確認
  - CSS を完全に統一（EventBlock.module.css を共通化する選択肢も）

## Constitution Compliance

### ✓ Principle I: Simplicity First (NON-NEGOTIABLE)
- **YAGNI 厳守**: F2 の仕様にない機能（編集モーダル、色選択 UI 等）は実装しない
- **外部ライブラリ**: date-fns のみ使用（新規追加なし）
- **抽象化**: 重なり計算は 1 回の実装で共通化（3 回パターン不要）

### ✓ Principle II: Strict Scope Adherence
- **スコープ外事項**: 終日イベント、複数日イベント、アニメーション等は実装しない
- **F2 の範囲**: 静的描画のみ。ドラッグ&ドロップ、リサイズは F4-F6 で実装

### ✓ Principle III: Separation of Concerns
- **依存ルール**:
  - `shared/` は `absolute/` や `grid/` を import しない ✓
  - `absolute/` と `grid/` は互いを import しない ✓
  - データ層（useCalendarEvents）は完全に共通化 ✓
  - 重なり計算（overlapUtils）は `shared/utils/` に配置 ✓
  - レイアウト計算は各方式ディレクトリに分離 ✓

### ✓ Principle IV: Fair Comparison Environment
- **同一データ**: sampleEvents を両方式で使用 ✓
- **同一条件**: React Profiler で同じ 100 件データを計測 ✓
- **side-by-side**: T025 で視覚的差異を確認 ✓

### ✓ Principle V: TypeScript Strict Mode
- **any 禁止**: 全ての型を明示的に定義 ✓
- **戻り値の型**: 全ての関数に型を指定 ✓
- **イベントハンドラー**: React.MouseEvent<HTMLDivElement> 等を使用 ✓

## Open Technical Questions

### Q1: Grid 方式で grid-template-rows を 1440 行定義するか、動的に計算するか？

**Options**:
- A: `grid-template-rows: repeat(1440, 1px)` を静的に定義
  - Pros: grid-row: startMin / span durationMin が直接使える
  - Cons: DOM に 1440 行の定義が常にある（パフォーマンス懸念）
- B: イベントごとに `transform: translateY()` で位置調整
  - Pros: Grid の行数を最小化
  - Cons: absolute と実質同じになり比較の意味が薄れる

**Decision**: Option A を採用し、T028 でパフォーマンスを計測。問題があれば Option B に切り替え

### Q2: EventBlock.module.css を absolute / grid で共通化するか？

**Options**:
- A: `shared/components/EventBlock.module.css` に共通化
  - Pros: スタイルの一貫性を保証
  - Cons: Principle III（境界の厳格化）に反する可能性
- B: 各方式ディレクトリに配置（現状の設計）
  - Pros: 方式固有のスタイル調整が可能
  - Cons: 重複コード

**Decision**: Option B を採用。スタイルは同じでも、将来的な拡張性を考慮し分離

## Out of Scope (Technical)

- **複数日にまたがるイベント**: startAt と endAt が異なる日付の場合の処理
- **イベントの編集 UI**: タイトル・時刻・色の変更モーダル
- **ドラッグ&ドロップ**: F4, F5 で実装
- **リサイズ**: F6 で実装
- **現在時刻インジケーター**: F3 で実装
- **週の切り替え**: 前週・次週のナビゲーション
- **アニメーション**: イベント追加時のフェードイン等
- **アクセシビリティ**: ARIA 属性、キーボード操作
- **レスポンシブ対応**: モバイル表示

## Next Steps

1. ✅ 仕様書（spec.md）のレビュー
2. ✅ 実装計画（plan.md）のレビュー
3. ⏭️ **Run `/speckit.tasks`** to create task breakdown
4. ⏭️ Phase 0 から順次実装開始
5. ⏭️ T026 で手動テスト、T031 で視覚的検証
6. ⏭️ `docs/performance-comparison.md` に計測結果を記録
