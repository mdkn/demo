# Implementation Plan: ドラッグ&ドロップ（日付移動）

**Spec**: [spec.md](./spec.md)
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F4 (ドラッグ&ドロップ - 時間移動)

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.6.2（strict mode 有効）
- **Framework**: React 19.0.0（関数コンポーネント + Hooks）
- **Build Tool**: Vite 6.0.7
- **Events**: Pointer Events API（F4 と同じ）
- **Testing**: Vitest 4.0.18
- **Styling**: CSS Modules

### External Dependencies
なし（F1-F4 と同じスタックを継続使用）

**Rationale**:
- F4 の useDragEvent フックを拡張する形で実装
- 新規ライブラリの追加なし（憲法準拠）
- Pointer Events API で X 軸方向のドラッグも対応可能

## Architecture

### System Architecture

F5 は F4 のドラッグ処理を拡張し、2次元ドラッグ（時刻+日付）を実現する。

```
┌─────────────────────────────────────────────┐
│ App.tsx → useCalendarEvents                  │
├─────────────────────────────────────────────┤
│         Absolute方式        Grid方式         │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ WeekView         │  │ WeekView         │ │
│  │ └─ DayColumn ×7  │  │ └─ DayGrid ×7    │ │
│  │    ├─ EventBlock │  │    ├─ EventBlock │ │
│  │    │  └─ useDragEvent│  │    └─ useDragEvent│ ← F5 で拡張
│  │    └─ .dropTarget │  │    └─ .dropTarget│ ← F5 で新規
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │ shared/utils/dragUtils.ts      │
    │ - pxToDayIndex() (新規)        │ ← F5 で追加
    │ - calculateNewDate() (新規)    │
    └────────────────────────────────┘
```

### Component Structure

F5 で追加・変更するファイル:

```
src/
├── shared/
│   └── utils/
│       └── dragUtils.ts                  # pxToDayIndex, calculateNewDate を追加
│
├── absolute/
│   ├── components/
│   │   ├── DayColumn.tsx                 # .dropTarget クラス追加
│   │   └── DayColumn.module.css          # .dropTarget スタイル (新規)
│   └── hooks/
│       └── useDragEvent.ts               # F4 から拡張（deltaX 処理追加）
│
└── grid/
    ├── components/
    │   ├── DayGrid.tsx                   # .dropTarget クラス追加
    │   └── DayGrid.module.css            # .dropTarget スタイル (新規)
    └── hooks/
        └── useDragEvent.ts               # F4 から拡張（deltaX 処理追加）
```

**Design Patterns**:
- **Hook Extension**: F4 の useDragEvent を拡張（破壊的変更なし）
- **State Lifting**: 列ハイライトの状態を WeekView で管理
- **Ref Forwarding**: DayColumn/DayGrid の DOM 参照を useDragEvent に渡す

## Data Design

### Drag State (F4 からの拡張)

```typescript
// F4 の DragState に以下を追加
type DragState = {
  isDragging: boolean;
  startX: number;           // 新規: ドラッグ開始時のマウスX座標
  startY: number;           // F4
  startMinutes: number;     // F4
  startDayIndex: number;    // 新規: ドラッグ開始時の日付列インデックス
  currentDayIndex: number;  // 新規: ドラッグ中の現在列インデックス
  originalStartAt: string;  // F4
  originalEndAt: string;    // F4
};
```

### Hook Interface (F4 からの拡張)

```typescript
// F4 の useDragEvent に以下を追加
type UseDragEventProps = {
  event: CalendarEvent;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  // 新規:
  dayColumns: DayInfo[];    // 7日分の情報
  onDayHover?: (dayIndex: number | null) => void;  // 列ハイライト用
};

export const useDragEvent = (props: UseDragEventProps) => {
  // F4 の処理に加えて:
  // 1. handlePointerDown で startX, startDayIndex を記録
  // 2. handlePointerMove で deltaX → dayIndex を判定
  // 3. onDayHover(dayIndex) を呼び出し
  // 4. handlePointerUp で新しい日付を計算

  return {
    isDragging: boolean;
    currentDayIndex: number | null;
    eventHandlers: {
      onPointerDown: handlePointerDown;
    };
  };
};
```

### Data Flow

```
F4 の処理（上下ドラッグ）
    ↓
F5 の拡張（左右ドラッグ）
    ↓
pointerdown
    ↓ startX, startY, startDayIndex を記録
pointermove
    ├─ deltaY → minutes (F4)
    └─ deltaX → dayIndex (F5)
    ↓
onDayHover(dayIndex) → WeekView が列ハイライト更新
    ↓
pointerup
    ├─ calculateNewTime(minutes) (F4)
    └─ calculateNewDate(dayIndex) (F5)
    ↓
updateEvent({ startAt, endAt })
    ↓
localStorage 保存
```

## Implementation Phases

### Phase 0: Shared Utilities (F4 からの追加)

**Goal**: 日付列判定・日付計算の純粋関数を実装

- [ ] T001 Add pxToDayIndex() to dragUtils.ts
  - Input: clientX, dayColumnRects[]
  - Output: dayIndex (0-6) または null
  - ロジック: clientX が各列の left〜right の範囲内にあるか判定
- [ ] T002 Add calculateNewDate() to dragUtils.ts
  - Input: originalDate, newDayIndex, startDayIndex
  - Output: 新しい日付（時刻部分は維持）
  - ロジック: dayIndex の差分から日数を計算し、addDays() で日付を変更
- [ ] T003 Write unit tests for new functions
  - pxToDayIndex: 各列の範囲内での判定
  - calculateNewDate: dayIndex 差分からの日付計算

**Estimated Time**: 2 hours

### Phase 1: Absolute 方式の拡張

**Goal**: F4 の useDragEvent に左右ドラッグ機能を追加

- [ ] T004 Extend useDragEvent hook (src/absolute/hooks/useDragEvent.ts)
  - Props に dayColumns, onDayHover を追加
  - handlePointerDown で startX, startDayIndex を記録
  - handlePointerMove で:
    - deltaX → pxToDayIndex() → currentDayIndex
    - onDayHover(currentDayIndex) を呼び出し
  - handlePointerUp で:
    - calculateNewDate() で新しい日付を計算
    - calculateNewTime() と組み合わせて startAt/endAt を生成
- [ ] T005 Update AbsoluteWeekView to manage hover state
  - useState<number | null> で hoveredDayIndex を管理
  - onDayHover コールバックを useDragEvent に渡す
  - hoveredDayIndex を DayColumn に渡す
- [ ] T006 Update DayColumn to show dropTarget style
  - Props に isDropTarget を追加
  - isDropTarget === true の場合、.dropTarget クラスを追加
- [ ] T007 Add .dropTarget style (src/absolute/components/DayColumn.module.css)
  - background-color: rgba(59, 130, 246, 0.1)
  - transition: background-color 0.15s ease

**Estimated Time**: 5 hours

### Phase 2: Grid 方式の拡張

**Goal**: Grid 方式でも同じ左右ドラッグ機能を実装

- [ ] T008 Extend useDragEvent hook (src/grid/hooks/useDragEvent.ts)
  - T004 と同じ拡張（absolute 版と並行実装）
  - Grid 特有の調整（grid-column の更新が必要な場合）
- [ ] T009 Update GridWeekView to manage hover state
  - T005 と同じ（hoveredDayIndex の管理）
- [ ] T010 Update DayGrid to show dropTarget style
  - T006 と同じ（isDropTarget による .dropTarget クラス追加）
- [ ] T011 Add .dropTarget style (src/grid/components/DayGrid.module.css)
  - T007 と同じスタイル

**Estimated Time**: 5 hours

### Phase 3: Integration & Edge Cases

**Goal**: 2次元ドラッグの統合テストとエッジケース対応

- [ ] T012 Test 2D drag (diagonal)
  - 斜めドラッグで時刻と日付が同時に変更されることを確認
- [ ] T013 Test week boundary clamping
  - 月曜日より左、日曜日より右にドラッグできないことを確認
  - dayIndex が 0-6 にクランプされることを確認
- [ ] T014 Test same-day drag (vertical only)
  - F4 の動作が壊れていないことを確認（時刻のみ変更）
- [ ] T015 Test column highlight performance
  - pointermove 時の列ハイライト更新が 60fps を維持することを確認
- [ ] T016 Verify side-by-side mode
  - absolute と grid で同じドラッグ挙動を確認

**Estimated Time**: 3 hours

### Phase 4: Performance & Polish

**Goal**: パフォーマンス最適化と仕上げ

- [ ] T017 Optimize column highlight updates
  - 前回の hoveredDayIndex と比較し、変更時のみ setState
- [ ] T018 Manual 2D drag test
  - 実際に斜めドラッグして、滑らかさと正確性を体感
- [ ] T019 Test with 100 events
  - 大量のイベントがある状態でドラッグのパフォーマンスを確認
- [ ] T020 Verify F4 compatibility
  - F5 の実装が F4 の機能を壊していないことを確認

**Estimated Time**: 3 hours

## Testing Strategy

### Unit Tests

**Testing Framework**: Vitest 4.0.18

**Test Files**:
1. `tests/unit/dragUtils.test.ts` (F4 から拡張)
   - pxToDayIndex(): 列範囲の判定
   - calculateNewDate(): dayIndex 差分からの日付計算

**Coverage Target**: 新規追加関数の 100%

### Integration Tests

**Method**: 手動テスト

**Test Cases**:
1. 左右ドラッグでイベントが別の日に移動
2. 斜めドラッグで時刻と日付が同時に変更
3. 列ハイライトの表示
4. 週の範囲外にドラッグできない
5. F4 の上下ドラッグが引き続き動作

### E2E Tests

スコープ外（手動テストで十分）

## Risk Analysis

### Risk 1: F4 との統合による複雑化
- **Impact**: High（バグの温床になる可能性）
- **Probability**: Medium
- **Mitigation**:
  - F4 のロジックを壊さないよう、拡張部分を明確に分離
  - T014, T020 で F4 の動作を回帰テスト

### Risk 2: 列ハイライトの頻繁な更新による再レンダリング
- **Impact**: Medium（パフォーマンス低下）
- **Probability**: Low
- **Mitigation**:
  - T017 で hoveredDayIndex の変更時のみ setState
  - React.memo を DayColumn/DayGrid に適用

### Risk 3: getBoundingClientRect() の計算コスト
- **Impact**: Low（7列のみなので軽微）
- **Probability**: Low
- **Mitigation**:
  - ドラッグ開始時に 1回だけ取得し、キャッシュ
  - ウィンドウリサイズは考慮しない（ドラッグ中のリサイズは稀）

### Risk 4: absolute と grid の実装差異
- **Impact**: Low（列判定ロジックは共通）
- **Probability**: Low
- **Mitigation**:
  - pxToDayIndex() は shared で共通化
  - T016 で side-by-side モードで視覚的に確認

## Constitution Compliance

### ✓ Principle I: Simplicity First (NON-NEGOTIABLE)
- **YAGNI 厳守**: 週をまたぐドラッグ、衝突検出等は実装しない
- **外部ライブラリ**: F4 と同じく Pointer Events API のみ ✓
- **抽象化**: F4 の useDragEvent を拡張（新規フック作成なし）

### ✓ Principle II: Strict Scope Adherence
- **スコープ外事項**: 週をまたぐドラッグ、衝突検出等は実装しない

### ✓ Principle III: Separation of Concerns
- **依存ルール**:
  - pxToDayIndex, calculateNewDate は shared に配置 ✓
  - useDragEvent は各方式ディレクトリに分離 ✓
  - 列ハイライトは WeekView が管理 ✓

### ✓ Principle IV: Fair Comparison Environment
- **同一ロジック**: pxToDayIndex, calculateNewDate は共通 ✓
- **同一挙動**: 両方式で同じ列ハイライト、dayIndex クランプ ✓
- **パフォーマンス計測**: T015 で両方式を同条件で測定 ✓

### ✓ Principle V: TypeScript Strict Mode
- **any 禁止**: DragState, UseDragEventProps の型を明示 ✓
- **戻り値の型**: 全ての関数に型を指定 ✓
- **イベントハンドラー**: React.PointerEvent<HTMLDivElement> 使用 ✓

## Open Technical Questions

### Q1: 列ハイライトの状態を WeekView で管理するか、各 DayColumn で管理するか？

**Options**:
- A: WeekView で hoveredDayIndex を管理
  - Pros: 一元管理で分かりやすい
  - Cons: props ドリリングが発生
- B: 各 DayColumn が自分でハイライト判定
  - Pros: props ドリリング不要
  - Cons: ドラッグ中のマウス位置を全列に伝える必要がある

**Decision**: Option A を採用（一元管理が明確、props ドリリングは1層のみ）

### Q2: dayColumnRects をドラッグ開始時に1回だけ取得するか、毎フレーム取得するか？

**Options**:
- A: ドラッグ開始時に1回取得してキャッシュ
  - Pros: パフォーマンス向上
  - Cons: ウィンドウリサイズ時にずれる
- B: 毎フレーム getBoundingClientRect() を呼び出し
  - Pros: 常に正確
  - Cons: 7回の DOM アクセスが発生

**Decision**: Option A を採用（ドラッグ中のリサイズは稀、7列程度なら計算コストは軽微）

## Out of Scope (Technical)

- **週をまたぐドラッグ**: 前週・次週への移動
- **衝突検出**: ドラッグ中の他イベントとの重なり警告
- **列の自動スクロール**: 列の境界での自動スクロール（週ビューは固定幅）
- **アニメーション**: ドロップ時の列移動アニメーション
- **複数イベントの一括移動**: Shift+ドラッグ等

## Next Steps

1. ✅ 仕様書（spec.md）のレビュー
2. ✅ 実装計画（plan.md）のレビュー
3. ⏭️ **Run `/speckit.tasks`** to create task breakdown
4. ⏭️ Phase 0 から順次実装開始
5. ⏭️ T012 で 2次元ドラッグのテスト（重要）
6. ⏭️ T020 で F4 との互換性確認
