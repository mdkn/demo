# Implementation Plan: ドラッグ&ドロップ（時間移動）

**Spec**: [spec.md](./spec.md)
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F2 (イベント配置)

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.6.2（strict mode 有効）
- **Framework**: React 19.0.0（関数コンポーネント + Hooks）
- **Build Tool**: Vite 6.0.7
- **Events**: Pointer Events API（標準 Web API）
- **Testing**: Vitest 4.0.18
- **Styling**: CSS Modules

### External Dependencies
なし（F1, F2, F3 と同じスタックを継続使用）

**Rationale**:
- Pointer Events API は標準仕様で、マウス・タッチ両対応
- DnD ライブラリ（react-dnd, @dnd-kit 等）は憲法で禁止
- 座標計算を自前で実装することで absolute vs Grid の比較が明確になる

## Architecture

### System Architecture

F4 は F2 のイベント要素にドラッグ機能を追加するレイヤーとして実装する。

```
┌─────────────────────────────────────────────┐
│ App.tsx → useCalendarEvents                  │
├─────────────────────────────────────────────┤
│         Absolute方式        Grid方式         │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ DayColumn        │  │ DayGrid          │ │
│  │ └─ EventBlock    │  │ └─ EventBlock    │ │
│  │    ├─ useDragEvent│  │    ├─ useDragEvent│ ← F4 で新規追加
│  │    └─ onPointerDown│ │    └─ onPointerDown│
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │ shared/utils/dragUtils.ts      │ ← F4 で新規追加
    │ - snapToMinutes()              │
    │ - clampMinutes()               │
    │ - calculateNewTime()           │
    └────────────────────────────────┘
```

### Component Structure

F4 で追加するファイル（既存の F1, F2, F3 構造を拡張）:

```
src/
├── shared/
│   └── utils/
│       └── dragUtils.ts                  # スナップ・クランプ処理 (新規)
│
├── absolute/
│   ├── components/
│   │   └── EventBlock.tsx                # useDragEvent を統合
│   │       └── EventBlock.module.css     # .dragging スタイルを追加
│   └── hooks/
│       └── useDragEvent.ts               # absolute 方式のドラッグ処理 (新規)
│
└── grid/
    ├── components/
    │   └── EventBlock.tsx                # useDragEvent を統合
    │       └── EventBlock.module.css     # .dragging スタイルを追加
    └── hooks/
        └── useDragEvent.ts               # Grid 方式のドラッグ処理 (新規)
```

**Design Patterns**:
- **Custom Hook**: useDragEvent でドラッグロジックをカプセル化
- **Controlled Component**: updateEvent コールバックで親が状態を管理
- **Pointer Capture**: setPointerCapture でマウス追従を保証

## Data Design

### Drag State (useDragEvent 内部)

```typescript
type DragState = {
  isDragging: boolean;
  startY: number;           // ドラッグ開始時のマウスY座標
  startMinutes: number;     // ドラッグ開始時のイベント開始分
  originalStartAt: string;  // Escape用の元の開始時刻
  originalEndAt: string;    // Escape用の元の終了時刻
};
```

### Hook Interface

**Absolute 方式**:
```typescript
// src/absolute/hooks/useDragEvent.ts

type UseDragEventProps = {
  event: CalendarEvent;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const useDragEvent = (props: UseDragEventProps) => {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // リサイズハンドル領域を除外（上端8px, 下端8px）
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    if (offsetY < 8 || offsetY > rect.height - 8) return;

    // ポインターキャプチャ
    e.currentTarget.setPointerCapture(e.pointerId);

    // ドラッグ開始
    setDragState({
      isDragging: true,
      startY: e.clientY,
      startMinutes: dateToMinutes(new Date(event.startAt)),
      originalStartAt: event.startAt,
      originalEndAt: event.endAt,
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragState?.isDragging) return;

    // マウスY座標 → 分に変換
    const deltaY = e.clientY - dragState.startY;
    const deltaMi
nutes = (deltaY / hourHeight) * 60;
    let newStartMinutes = dragState.startMinutes + deltaMinutes;

    // 15分スナップ
    newStartMinutes = snapToMinutes(newStartMinutes, 15);

    // 範囲クランプ
    const duration = /* ... */;
    newStartMinutes = clampMinutes(newStartMinutes, duration);

    // EventBlock の top を更新（リアルタイム）
    // ※ state 更新ではなく ref.current.style.top で直接操作
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!dragState?.isDragging) return;

    // 最終位置を確定
    const newStartAt = /* 計算 */;
    const newEndAt = /* 計算 */;

    onUpdate(event.id, { startAt: newStartAt, endAt: newEndAt });
    setDragState(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && dragState?.isDragging) {
      // 元の位置に戻す
      setDragState(null);
    }
  };

  return {
    isDragging: dragState?.isDragging ?? false,
    eventHandlers: {
      onPointerDown: handlePointerDown,
    },
  };
};
```

**Grid 方式**:
```typescript
// src/grid/hooks/useDragEvent.ts

// Interface は absolute と同じ
// 違い: PointerMove 時に grid-row を更新
```

### Data Flow

```
pointerdown (EventBlock)
    ↓
setPointerCapture
    ↓
setDragState (開始)
    ↓
pointermove (document)
    ↓ deltaY
pxToMinutes → snapToMinutes → clampMinutes
    ↓
style.top (absolute) or style.gridRow (grid)
    ↓
pointerup (document)
    ↓
calculateNewTime → updateEvent
    ↓
localStorage 保存
    ↓
setDragState(null)
```

## Implementation Phases

### Phase 0: Shared Utilities (共通実装)

**Goal**: スナップ・クランプ処理の純粋関数を実装

- [ ] T001 Create dragUtils.ts (src/shared/utils/dragUtils.ts)
  - snapToMinutes(minutes, snap): 15分単位に丸める
  - clampMinutes(startMin, duration, maxMin=1440): 範囲制限
  - calculateNewTime(originalDate, newMinutes): ISO 8601 文字列を生成
- [ ] T002 Write unit tests for dragUtils.ts
  - snapToMinutes: 7→0, 8→15, 22→15, 23→30
  - clampMinutes: -10→0, 1450→(1440-60)=1380
  - calculateNewTime: 日付は維持、時刻のみ変更

**Estimated Time**: 2 hours

### Phase 1: Absolute 方式の実装

**Goal**: position: absolute でドラッグを実装

- [ ] T003 Create useDragEvent hook (src/absolute/hooks/useDragEvent.ts)
  - useState<DragState | null>
  - handlePointerDown: リサイズ領域除外、setPointerCapture
  - handlePointerMove: deltaY → minutes → snapToMinutes → clampMinutes → style.top 更新
  - handlePointerUp: updateEvent 呼び出し
  - handleKeyDown: Escape でキャンセル
  - useEffect: pointermove, pointerup, keydown のリスナー登録・解放
- [ ] T004 Update EventBlock to use useDragEvent
  - useDragEvent フックを呼び出し
  - onPointerDown を EventBlock に渡す
  - isDragging に応じて .dragging クラスを追加
- [ ] T005 Add .dragging style (src/absolute/components/EventBlock.module.css)
  - opacity: 0.7
  - box-shadow: 0 4px 12px rgba(0,0,0,0.3)
  - cursor: grabbing
- [ ] T006 Add .grabbable style (hover 時)
  - cursor: grab
- [ ] T007 Test リサイズハンドル領域の除外
  - 上端 8px / 下端 8px でドラッグが開始しないことを確認

**Estimated Time**: 6 hours

### Phase 2: Grid 方式の実装

**Goal**: CSS Grid でドラッグを実装

- [ ] T008 Create useDragEvent hook (src/grid/hooks/useDragEvent.ts)
  - absolute 版とほぼ同じ
  - 違い: handlePointerMove で grid-row-start を更新
    - `element.style.gridRowStart = String(newStartMinutes)`
  - または: 一時的に absolute に切り替える方式も検討（T015 で判断）
- [ ] T009 Update EventBlock to use useDragEvent
  - absolute 版と同じ統合方法
- [ ] T010 Add .dragging and .grabbable styles
  - absolute 版と同じスタイル
- [ ] T011 Test grid-row 更新のパフォーマンス
  - pointermove 時の再レンダリング負荷を React Profiler で計測
  - 60fps を維持できるか確認

**Estimated Time**: 6 hours

### Phase 3: Edge Cases & Polish

**Goal**: エッジケースの対応と視覚的調整

- [ ] T012 Implement Escape key cancel
  - keydown イベントで Escape を検出
  - 元の位置に戻す（originalStartAt, originalEndAt を使用）
- [ ] T013 Implement pointercancel handling
  - ブラウザウィンドウが非アクティブになった場合のクリーンアップ
- [ ] T014 Test 範囲クランプ
  - 0:00 より上にドラッグ → 0:00 で止まる
  - 24:00 より下にドラッグ → (1440 - duration) で止まる
- [ ] T015 Test ドラッグ中の重なり
  - ドラッグで他のイベントと重なった場合、ドロップ後にレイアウトが再計算されることを確認
- [ ] T016 Verify side-by-side mode
  - absolute と grid で同じドラッグ挙動を確認

**Estimated Time**: 4 hours

### Phase 4: Performance & Integration

**Goal**: パフォーマンス最適化と統合テスト

- [ ] T017 Implement requestAnimationFrame throttling
  - pointermove を requestAnimationFrame でスロットリング（60fps 保証）
- [ ] T018 Verify no memory leak
  - ドラッグ終了後、イベントリスナーが解放されることを確認
- [ ] T019 Measure drag performance
  - React Profiler で pointermove 時の処理時間を計測（目標: < 16ms）
- [ ] T020 Manual drag test
  - 実際にマウスでドラッグし、スムーズさを体感
  - 15分スナップが自然に感じられるか確認
- [ ] T021 Test with 100 events
  - 多数のイベントがある状態でドラッグのパフォーマンスを確認

**Estimated Time**: 4 hours

## Testing Strategy

### Unit Tests

**Testing Framework**: Vitest 4.0.18

**Test Files**:
1. `tests/unit/dragUtils.test.ts`
   - snapToMinutes() の丸め処理
   - clampMinutes() の範囲制限
   - calculateNewTime() の ISO 8601 生成

**Coverage Target**: dragUtils の 100%

### Integration Tests

**Method**: 手動テスト + Playwright（オプション）

**Test Cases**:
1. 上下ドラッグでイベントが移動
2. 15分スナップの動作
3. Escape キーでキャンセル
4. 範囲制限（0:00, 24:00）
5. リサイズハンドル領域でドラッグしない
6. ドラッグ中の視覚的フィードバック

### E2E Tests

スコープ外（手動テストで十分）

## Risk Analysis

### Risk 1: Grid 方式で grid-row を毎フレーム更新する負荷
- **Impact**: High（60fps を維持できない可能性）
- **Probability**: Medium
- **Mitigation**:
  - T011 で早期に計測
  - 問題があれば、ドラッグ中のみ absolute に切り替え（transform: translateY() を使用）
  - 代替案: ドラッグ中はプレースホルダーを表示し、ドロップ時のみ grid-row を更新

### Risk 2: ポインターキャプチャの未対応ブラウザ
- **Impact**: Medium（古いブラウザでドラッグが不安定）
- **Probability**: Low（Pointer Events は広くサポート済み）
- **Mitigation**:
  - 現代ブラウザのみ対象とし、ポリフィル不要
  - Safari, Chrome, Firefox でテスト

### Risk 3: ドラッグ中のメモリリーク
- **Impact**: High（長時間使用でブラウザが重くなる）
- **Probability**: Low（useEffect クリーンアップで対応済み）
- **Mitigation**:
  - T018 で Memory Profiler で検証
  - pointermove, pointerup, keydown のリスナーを必ず解放

### Risk 4: absolute と grid の実装複雑度の差
- **Impact**: Medium（比較検証の公平性に影響）
- **Probability**: Medium
- **Mitigation**:
  - コード行数を記録し、±30行以内に収める
  - Grid で問題があれば、absolute への一時切り替え方式を採用（これも比較データとして記録）

## Constitution Compliance

### ✓ Principle I: Simplicity First (NON-NEGOTIABLE)
- **YAGNI 厳守**: 複数イベント一括ドラッグ、アニメーション等は実装しない
- **外部ライブラリ**: DnD ライブラリ禁止 → Pointer Events API で自前実装 ✓
- **抽象化**: 共通ユーティリティ（snapToMinutes 等）のみ共通化

### ✓ Principle II: Strict Scope Adherence
- **スコープ外事項**: 左右ドラッグ（F5）、リサイズ（F6）、タッチ対応等は実装しない

### ✓ Principle III: Separation of Concerns
- **依存ルール**:
  - dragUtils は `shared/utils/` に配置 ✓
  - useDragEvent は各方式ディレクトリに分離（座標計算が異なる） ✓
  - EventBlock が useDragEvent を使用 ✓

### ✓ Principle IV: Fair Comparison Environment
- **同一ロジック**: snapToMinutes, clampMinutes は共通 ✓
- **同一挙動**: 両方式で同じ15分スナップ、Escape キャンセル ✓
- **パフォーマンス計測**: T019 で両方式を同条件で測定 ✓

### ✓ Principle V: TypeScript Strict Mode
- **any 禁止**: PointerEvent, DragState の型を明示 ✓
- **戻り値の型**: useDragEvent の戻り値型を定義 ✓
- **イベントハンドラー**: React.PointerEvent<HTMLDivElement> 使用 ✓

## Open Technical Questions

### Q1: Grid 方式でドラッグ中に grid-row を更新するか、absolute に切り替えるか？

**Options**:
- A: grid-row-start を毎フレーム更新
  - Pros: Grid の機能を純粋に使用
  - Cons: 再レンダリング負荷が高い可能性
- B: ドラッグ中のみ absolute（transform: translateY()）に切り替え
  - Pros: パフォーマンスが安定
  - Cons: Grid の利点が失われる

**Decision**: T011 でパフォーマンスを計測し判断。Option A で 60fps を維持できれば採用、できなければ Option B

### Q2: pointermove を requestAnimationFrame でスロットリングするか？

**Options**:
- A: 毎回の pointermove で処理
  - Pros: シンプル
  - Cons: 無駄な処理が発生
- B: requestAnimationFrame でスロットリング
  - Pros: 60fps に最適化
  - Cons: 実装が複雑

**Decision**: Option B を採用（T017 で実装）。ドラッグの滑らかさが重要

## Out of Scope (Technical)

- **左右ドラッグ**: F5 で実装
- **リサイズ**: F6 で実装
- **タッチデバイス最適化**: Pointer Events で基本動作はするが、長押し等の最適化はしない
- **アニメーション**: ドロップ時の transition 効果
- **アンドゥ/リドゥ**: ドラッグ操作の取り消し
- **衝突検出**: ドラッグ中の他イベントとの重なり警告

## Next Steps

1. ✅ 仕様書（spec.md）のレビュー
2. ✅ 実装計画（plan.md）のレビュー
3. ⏭️ **Run `/speckit.tasks`** to create task breakdown
4. ⏭️ Phase 0 から順次実装開始
5. ⏭️ T011 で Grid のパフォーマンス検証（重要な分岐点）
6. ⏭️ T020 で手動テスト、T021 で大量データテスト
