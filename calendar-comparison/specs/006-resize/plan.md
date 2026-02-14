# Implementation Plan: リサイズ（時間変更）

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
なし（F1-F5 と同じスタックを継続使用）

**Rationale**:
- F4 の useDragEvent と並行して useResizeEvent を実装
- Pointer Events API で上端・下端のドラッグを検出
- 新規ライブラリの追加なし（憲法準拠）

## Architecture

### System Architecture

F6 は F4 のドラッグ処理と並行して動作する独立したリサイズ機能として実装する。

```
┌─────────────────────────────────────────────┐
│ App.tsx → useCalendarEvents                  │
├─────────────────────────────────────────────┤
│         Absolute方式        Grid方式         │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ DayColumn        │  │ DayGrid          │ │
│  │ └─ EventBlock    │  │ └─ EventBlock    │ │
│  │    ├─ useDragEvent│  │    ├─ useDragEvent│ (F4/F5)
│  │    └─ useResizeEvent│ │    └─ useResizeEvent│ ← F6 で新規
│  │       ├─ TopHandle│  │       ├─ TopHandle│
│  │       └─ BottomHandle│ │       └─ BottomHandle│
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │ shared/utils/dragUtils.ts      │
    │ - snapToMinutes() (F4)         │ ← 流用
    │ - clampMinutes() (F4)          │ ← 流用
    │ - calculateNewTime() (F4)      │ ← 流用
    └────────────────────────────────┘
```

### Component Structure

F6 で追加・変更するファイル:

```
src/
├── shared/
│   └── utils/
│       └── dragUtils.ts                  # F4 の関数を流用（新規追加なし）
│
├── absolute/
│   ├── components/
│   │   ├── EventBlock.tsx                # useResizeEvent を統合
│   │   │   └── ResizeHandle.tsx          # リサイズハンドル (新規)
│   │   │       └── ResizeHandle.module.css
│   │   └── EventBlock.module.css         # .resizing スタイル追加
│   └── hooks/
│       └── useResizeEvent.ts             # リサイズ処理 (新規)
│
└── grid/
    ├── components/
    │   ├── EventBlock.tsx                # useResizeEvent を統合
    │   │   └── ResizeHandle.tsx          # リサイズハンドル (新規)
    │   │       └── ResizeHandle.module.css
    │   └── EventBlock.module.css         # .resizing スタイル追加
    └── hooks/
        └── useResizeEvent.ts             # リサイズ処理 (新規)
```

**Design Patterns**:
- **Separate Hook**: useResizeEvent を useDragEvent から分離（責務の明確化）
- **Handle Components**: ResizeHandle を独立コンポーネントとして実装
- **Controlled Component**: updateEvent コールバックで親が状態を管理（F4 と同じ）

## Data Design

### Resize State (useResizeEvent 内部)

```typescript
type ResizeState = {
  isResizing: boolean;
  resizeType: 'top' | 'bottom';
  startY: number;           // リサイズ開始時のマウスY座標
  startMinutes: number;     // リサイズ開始時のイベント開始分（上端用）
  endMinutes: number;       // リサイズ開始時のイベント終了分（下端用）
  originalStartAt: string;  // Escape用
  originalEndAt: string;    // Escape用
};
```

### Hook Interface

**Absolute 方式**:
```typescript
// src/absolute/hooks/useResizeEvent.ts

type UseResizeEventProps = {
  event: CalendarEvent;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const useResizeEvent = (props: UseResizeEventProps) => {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  const handleTopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // F4 のドラッグを防ぐ
    e.currentTarget.setPointerCapture(e.pointerId);

    setResizeState({
      isResizing: true,
      resizeType: 'top',
      startY: e.clientY,
      startMinutes: dateToMinutes(new Date(event.startAt)),
      endMinutes: dateToMinutes(new Date(event.endAt)),
      originalStartAt: event.startAt,
      originalEndAt: event.endAt,
    });
  };

  const handleBottomPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // F4 のドラッグを防ぐ
    // 上端と同様の処理
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!resizeState?.isResizing) return;

    const deltaY = e.clientY - resizeState.startY;
    const deltaMinutes = (deltaY / hourHeight) * 60;

    if (resizeState.resizeType === 'top') {
      // 上端リサイズ: startAt のみ変更
      let newStartMinutes = resizeState.startMinutes + deltaMinutes;
      newStartMinutes = snapToMinutes(newStartMinutes, 15);

      // 最小duration（15分）を保証
      const maxStartMinutes = resizeState.endMinutes - 15;
      newStartMinutes = Math.min(newStartMinutes, maxStartMinutes);

      // 範囲クランプ
      newStartMinutes = Math.max(0, newStartMinutes);

      // style.top と style.height を更新（リアルタイム）
    } else {
      // 下端リサイズ: endAt のみ変更
      let newEndMinutes = resizeState.endMinutes + deltaMinutes;
      newEndMinutes = snapToMinutes(newEndMinutes, 15);

      // 最小duration（15分）を保証
      const minEndMinutes = resizeState.startMinutes + 15;
      newEndMinutes = Math.max(newEndMinutes, minEndMinutes);

      // 範囲クランプ
      newEndMinutes = Math.min(1440, newEndMinutes);

      // style.height を更新（リアルタイム）
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!resizeState?.isResizing) return;

    // 最終値を確定
    const newStartAt = /* 計算 */;
    const newEndAt = /* 計算 */;

    onUpdate(event.id, { startAt: newStartAt, endAt: newEndAt });
    setResizeState(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && resizeState?.isResizing) {
      // 元のサイズに戻す
      setResizeState(null);
    }
  };

  return {
    isResizing: resizeState?.isResizing ?? false,
    resizeType: resizeState?.resizeType ?? null,
    topHandleProps: {
      onPointerDown: handleTopPointerDown,
    },
    bottomHandleProps: {
      onPointerDown: handleBottomPointerDown,
    },
  };
};
```

**Grid 方式**:
```typescript
// src/grid/hooks/useResizeEvent.ts

// Interface は absolute と同じ
// 違い: PointerMove 時に grid-row-start / grid-row-end を更新
```

### Data Flow

```
pointerdown (TopHandle or BottomHandle)
    ↓
stopPropagation (F4 のドラッグを防ぐ)
    ↓
setPointerCapture
    ↓
setResizeState (開始)
    ↓
pointermove (document)
    ↓ deltaY
pxToMinutes → snapToMinutes → clampMinutes
    ↓
if (top) {
  style.top + style.height 更新 (absolute)
  grid-row-start 更新 (grid)
} else {
  style.height 更新 (absolute)
  grid-row-end / span 更新 (grid)
}
    ↓
pointerup (document)
    ↓
calculateNewTime → updateEvent
    ↓
localStorage 保存
    ↓
setResizeState(null)
```

## Implementation Phases

### Phase 0: Component Structure (共通実装)

**Goal**: リサイズハンドルコンポーネントの作成

- [ ] T001 Create ResizeHandle component (src/absolute/components/ResizeHandle.tsx)
  - Props: position ('top' | 'bottom'), onPointerDown
  - 8px 高さの透明な領域
  - hover 時に cursor: ns-resize
- [ ] T002 Style ResizeHandle (src/absolute/components/ResizeHandle.module.css)
  - .resizeHandle: height: 8px, position: absolute, width: 100%, cursor: ns-resize
  - .top: top: 0
  - .bottom: bottom: 0
- [ ] T003 Copy ResizeHandle to Grid (src/grid/components/)
  - absolute 版と同じコンポーネント（スタイルも同じ）

**Estimated Time**: 2 hours

### Phase 1: Absolute 方式の実装

**Goal**: position: absolute でリサイズを実装

- [ ] T004 Create useResizeEvent hook (src/absolute/hooks/useResizeEvent.ts)
  - useState<ResizeState | null>
  - handleTopPointerDown: 上端リサイズ開始
  - handleBottomPointerDown: 下端リサイズ開始
  - handlePointerMove: deltaY → top/height 更新
  - handlePointerUp: updateEvent 呼び出し
  - handleKeyDown: Escape でキャンセル
  - useEffect: pointermove, pointerup, keydown のリスナー登録・解放
- [ ] T005 Update EventBlock to use useResizeEvent
  - useResizeEvent フックを呼び出し
  - ResizeHandle を上端・下端に配置
  - topHandleProps, bottomHandleProps を渡す
- [ ] T006 Add .resizing style (src/absolute/components/EventBlock.module.css)
  - opacity: 0.7（F4 の .dragging と同じ）
  - box-shadow: 0 4px 12px rgba(0,0,0,0.3)
- [ ] T007 Test top/bottom handle separation
  - 上端8px → 上端リサイズ
  - 下端8px → 下端リサイズ
  - 中央 → F4 のドラッグ（競合しない）

**Estimated Time**: 6 hours

### Phase 2: Grid 方式の実装

**Goal**: CSS Grid でリサイズを実装

- [ ] T008 Create useResizeEvent hook (src/grid/hooks/useResizeEvent.ts)
  - T004 とほぼ同じ
  - 違い: handlePointerMove で grid-row-start / grid-row-end を更新
    - 上端: `element.style.gridRowStart = String(newStartMinutes)`
    - 下端: `element.style.gridRowEnd = String(newEndMinutes + 1)` (grid は end-exclusive)
- [ ] T009 Update EventBlock to use useResizeEvent
  - T005 と同じ統合方法
- [ ] T010 Add .resizing style
  - T006 と同じスタイル
- [ ] T011 Test grid-row updates
  - リサイズ中の grid-row-start / grid-row-end が正しく更新されることを確認

**Estimated Time**: 6 hours

### Phase 3: Edge Cases & Constraints

**Goal**: 最小duration、範囲制限、Escape キャンセルの実装

- [ ] T012 Implement minimum duration (15min)
  - 上端リサイズ: newStartMinutes > endMinutes - 15 → クランプ
  - 下端リサイズ: newEndMinutes < startMinutes + 15 → クランプ
- [ ] T013 Implement range clamping
  - startMinutes < 0 → 0
  - endMinutes > 1440 → 1440
- [ ] T014 Implement Escape key cancel
  - keydown イベントで Escape を検出
  - 元のサイズに戻す
- [ ] T015 Test F4 compatibility
  - リサイズハンドル以外の領域でドラッグ → F4 の動作
  - stopPropagation が正しく動作することを確認

**Estimated Time**: 3 hours

### Phase 4: Tooltip (Optional - P2)

**Goal**: リサイズ中の時刻ツールチップ表示

- [ ] T016 Create Tooltip component (src/shared/components/Tooltip.tsx)
  - position: fixed でマウス座標 + (10px, 10px) に配置
  - "HH:MM - HH:MM" 形式で表示
- [ ] T017 Integrate Tooltip with useResizeEvent
  - リサイズ中に Tooltip を表示
  - currentStartAt, currentEndAt を計算して渡す
- [ ] T018 Style Tooltip
  - background: rgba(0, 0, 0, 0.8)
  - color: white
  - padding: 4px 8px
  - border-radius: 4px
  - font-size: 12px

**Estimated Time**: 3 hours

### Phase 5: Performance & Testing

**Goal**: パフォーマンス検証とテスト

- [ ] T019 Measure resize performance
  - React Profiler で pointermove 時の処理時間を計測（目標: < 16ms）
- [ ] T020 Manual resize test
  - 実際にマウスでリサイズして、滑らかさを体感
  - 15分スナップが自然に感じられるか確認
- [ ] T021 Test with 100 events
  - 大量のイベントがある状態でリサイズのパフォーマンスを確認
- [ ] T022 Verify side-by-side mode
  - absolute と grid で同じリサイズ挙動を確認

**Estimated Time**: 3 hours

## Testing Strategy

### Unit Tests

**Testing Framework**: Vitest 4.0.18

**Test Files**:
1. `tests/unit/dragUtils.test.ts` (F4 から流用)
   - snapToMinutes(), clampMinutes() は既存テストで検証済み

**Coverage Target**: F4 の共通関数を流用するため、新規テストは不要

### Integration Tests

**Method**: 手動テスト

**Test Cases**:
1. 上端リサイズで開始時刻が変更
2. 下端リサイズで終了時刻が変更
3. 最小duration（15分）の制限
4. Escape キャンセル
5. リサイズハンドルとドラッグの競合なし
6. ツールチップ表示（P2）

### E2E Tests

スコープ外（手動テストで十分）

## Risk Analysis

### Risk 1: F4 のドラッグとの競合
- **Impact**: High（ドラッグが動作しなくなる可能性）
- **Probability**: Medium
- **Mitigation**:
  - ResizeHandle の onPointerDown で stopPropagation を呼び出し
  - T015 で F4 の動作を回帰テスト

### Risk 2: Grid 方式で grid-row を毎フレーム更新する負荷
- **Impact**: Medium（パフォーマンス低下）
- **Probability**: Medium（F4 と同じリスク）
- **Mitigation**:
  - T011, T019 で早期に計測
  - 問題があれば、リサイズ中のみ absolute に切り替え

### Risk 3: 最小duration（15分）の実装漏れ
- **Impact**: Medium（極端に短いイベントが作成される）
- **Probability**: Low
- **Mitigation**:
  - T012 で明示的にテスト
  - clampMinutes() でロジックを共通化

### Risk 4: ツールチップの実装コスト
- **Impact**: Low（P2 機能）
- **Probability**: Low
- **Mitigation**:
  - T016-T018 をオプションとして扱う
  - 時間がなければスキップ可能

## Constitution Compliance

### ✓ Principle I: Simplicity First (NON-NEGOTIABLE)
- **YAGNI 厳守**: 複数イベント一括リサイズ、アニメーション等は実装しない
- **外部ライブラリ**: F4 と同じく Pointer Events API のみ ✓
- **抽象化**: F4 の dragUtils を流用（重複実装なし）

### ✓ Principle II: Strict Scope Adherence
- **スコープ外事項**: 日付方向のリサイズ、衝突検出等は実装しない

### ✓ Principle III: Separation of Concerns
- **依存ルール**:
  - dragUtils（F4）を流用 ✓
  - useResizeEvent は各方式ディレクトリに分離 ✓
  - ResizeHandle は独立コンポーネント ✓

### ✓ Principle IV: Fair Comparison Environment
- **同一ロジック**: snapToMinutes, clampMinutes は F4 から流用 ✓
- **同一挙動**: 両方式で同じ15分スナップ、最小duration ✓
- **パフォーマンス計測**: T019 で両方式を同条件で測定 ✓

### ✓ Principle V: TypeScript Strict Mode
- **any 禁止**: ResizeState, UseResizeEventProps の型を明示 ✓
- **戻り値の型**: useResizeEvent の戻り値型を定義 ✓
- **イベントハンドラー**: React.PointerEvent<HTMLDivElement> 使用 ✓

## Open Technical Questions

### Q1: useDragEvent と useResizeEvent を統合するか、分離するか？

**Options**:
- A: 統合して1つの useDragAndResize フック
  - Pros: コード量削減
  - Cons: 複雑化、責務が不明確
- B: 分離して2つのフック
  - Pros: 責務が明確、テストしやすい
  - Cons: コード量が増える

**Decision**: Option B を採用（責務の明確化を優先）

### Q2: ResizeHandle を独立コンポーネントにするか、EventBlock に埋め込むか？

**Options**:
- A: 独立コンポーネント（ResizeHandle.tsx）
  - Pros: 再利用可能、テストしやすい
  - Cons: ファイル数が増える
- B: EventBlock 内に埋め込み
  - Pros: シンプル
  - Cons: EventBlock が肥大化

**Decision**: Option A を採用（コンポーネントの責務分離）

## Out of Scope (Technical)

- **日付方向のリサイズ**: イベントの左端・右端をドラッグして日数を変更
- **アニメーション**: リサイズ時の滑らかな transition 効果
- **衝突検出**: リサイズ中の他イベントとの重なり警告
- **複数イベントの一括リサイズ**: Shift+ドラッグ等
- **数値入力UI**: 時刻を手動入力してリサイズ

## Next Steps

1. ✅ 仕様書（spec.md）のレビュー
2. ✅ 実装計画（plan.md）のレビュー
3. ⏭️ **Run `/speckit.tasks`** to create task breakdown
4. ⏭️ Phase 0 から順次実装開始
5. ⏭️ T015 で F4 との互換性確認（重要）
6. ⏭️ T016-T018 はオプション（時間があれば実装）
