# Implementation Plan: クリックによるイベント作成

**Spec**: [spec.md](./spec.md)
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F2 (イベント配置), F4 (ドラッグ), F5 (日付移動)

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.6.2（strict mode 有効）
- **Framework**: React 19.0.0（関数コンポーネント + Hooks）
- **Build Tool**: Vite 6.0.7
- **Events**: Pointer Events API（F4, F5, F6 と同じ）
- **Testing**: Vitest 4.0.18
- **Styling**: CSS Modules

### External Dependencies
なし（F1-F6 と同じスタックを継続使用）

**Rationale**:
- F4 の pxToMinutes, snapToMinutes を流用
- F5 の pxToDayIndex を流用
- Pointer Events API でクリック・ドラッグを検出
- 新規ライブラリの追加なし（憲法準拠）

## Architecture

### System Architecture

F7 は DayColumn/DayGrid の背景でクリック・ドラッグを検出し、プレースホルダーを表示する。

```
┌─────────────────────────────────────────────┐
│ App.tsx → useCalendarEvents                  │
│          └─ addEvent() ← F7 で呼び出し       │
├─────────────────────────────────────────────┤
│         Absolute方式        Grid方式         │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ WeekView         │  │ WeekView         │ │
│  │ └─ DayColumn ×7  │  │ └─ DayGrid ×7    │ │
│  │    ├─ useCreateEvent│ │    ├─ useCreateEvent│ ← F7 で新規
│  │    │  └─ onClick/onDrag│ │    └─ onClick/onDrag│
│  │    └─ Placeholder │  │    └─ Placeholder│ ← F7 で新規
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │ shared/utils/dragUtils.ts      │
    │ - pxToMinutes() (F4)           │ ← 流用
    │ - snapToMinutes() (F4)         │ ← 流用
    │ - pxToDayIndex() (F5)          │ ← 流用
    └────────────────────────────────┘
```

### Component Structure

F7 で追加・変更するファイル:

```
src/
├── shared/
│   └── utils/
│       └── dragUtils.ts                  # F4, F5 の関数を流用（新規追加なし）
│
├── absolute/
│   ├── components/
│   │   ├── DayColumn.tsx                 # useCreateEvent を統合
│   │   └── CreationPlaceholder.tsx       # プレースホルダー (新規)
│   │       └── CreationPlaceholder.module.css
│   └── hooks/
│       └── useCreateEvent.ts             # イベント作成処理 (新規)
│
└── grid/
    ├── components/
    │   ├── DayGrid.tsx                   # useCreateEvent を統合
    │   └── CreationPlaceholder.tsx       # プレースホルダー (新規)
    │       └── CreationPlaceholder.module.css
    └── hooks/
        └── useCreateEvent.ts             # イベント作成処理 (新規)
```

**Design Patterns**:
- **Custom Hook**: useCreateEvent でクリック・ドラッグ処理をカプセル化
- **Controlled Component**: addEvent コールバックで親が状態を管理
- **Placeholder Pattern**: 作成中のイベントを一時的に表示

## Data Design

### Creation State (useCreateEvent 内部)

```typescript
type CreationState = {
  isCreating: boolean;
  dayIndex: number;         // 0-6
  startMinutes: number;     // 0-1439
  endMinutes: number;       // 0-1439
  startY: number;           // ドラッグ開始時のY座標（ドラッグ選択用）
  title: string;            // 入力中のタイトル
};
```

### Hook Interface

```typescript
// src/absolute/hooks/useCreateEvent.ts

type UseCreateEventProps = {
  onAdd: (event: Omit<CalendarEvent, 'id'>) => void;
  hourHeight: number;
  dayInfo: DayInfo;         // この列の日付情報
  containerRef: React.RefObject<HTMLDivElement>;
};

export const useCreateEvent = (props: UseCreateEventProps) => {
  const [creationState, setCreationState] = useState<CreationState | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 既存イベント上のクリックは無視
    if ((e.target as HTMLElement).closest('.eventBlock')) return;

    // クリック位置 → 時刻
    const rect = containerRef.current!.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    let startMinutes = pxToMinutes(offsetY, hourHeight);
    startMinutes = snapToMinutes(startMinutes, 15);

    // デフォルト duration: 1時間
    const endMinutes = Math.min(startMinutes + 60, 1440);

    setCreationState({
      isCreating: true,
      dayIndex: dayInfo.columnIndex,
      startMinutes,
      endMinutes,
      startY: e.clientY,
      title: '',
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 既存イベント上のドラッグは無視
    if ((e.target as HTMLElement).closest('.eventBlock')) return;

    const rect = containerRef.current!.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    let startMinutes = pxToMinutes(offsetY, hourHeight);
    startMinutes = snapToMinutes(startMinutes, 15);

    setCreationState({
      isCreating: true,
      dayIndex: dayInfo.columnIndex,
      startMinutes,
      endMinutes: startMinutes, // 初期値は同じ
      startY: e.clientY,
      title: '',
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!creationState?.isCreating) return;

    const rect = containerRef.current!.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    let endMinutes = pxToMinutes(offsetY, hourHeight);
    endMinutes = snapToMinutes(endMinutes, 15);

    // 最小 15分
    if (Math.abs(endMinutes - creationState.startMinutes) < 15) {
      endMinutes = creationState.startMinutes + 15;
    }

    // 上下反転対応
    const start = Math.min(creationState.startMinutes, endMinutes);
    const end = Math.max(creationState.startMinutes, endMinutes);

    setCreationState({
      ...creationState,
      startMinutes: start,
      endMinutes: end,
    });
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!creationState?.isCreating) return;

    // ドラッグ量が小さい場合はクリックとみなす
    const deltaY = Math.abs(e.clientY - creationState.startY);
    if (deltaY < 5) {
      // クリック → デフォルト 1時間
      setCreationState({
        ...creationState,
        endMinutes: Math.min(creationState.startMinutes + 60, 1440),
      });
    }

    // プレースホルダー表示（入力待ち状態）
  };

  const handleConfirm = (title: string) => {
    if (!creationState) return;

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: title || "新しいイベント",
      startAt: calculateDateTime(dayInfo.date, creationState.startMinutes),
      endAt: calculateDateTime(dayInfo.date, creationState.endMinutes),
      color: "#3b82f6",
    };

    onAdd(newEvent);
    setCreationState(null);
  };

  const handleCancel = () => {
    setCreationState(null);
  };

  return {
    creationState,
    eventHandlers: {
      onClick: handleClick,
      onPointerDown: handlePointerDown,
    },
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
};
```

### Data Flow

```
click/pointerdown (DayColumn背景)
    ↓
既存イベント判定（e.target.closest('.eventBlock')）
    ↓ 空白領域
pxToMinutes → snapToMinutes
    ↓
setCreationState (開始)
    ↓
pointermove (ドラッグ選択の場合)
    ↓ deltaY
endMinutes 更新（リアルタイム）
    ↓
pointerup
    ↓
プレースホルダー表示 + 入力欄フォーカス
    ↓
Enter (onConfirm)
    ↓
calculateDateTime → addEvent
    ↓
localStorage 保存
    ↓
setCreationState(null)
```

## Implementation Phases

### Phase 0: Shared Utilities (F4, F5 から流用)

**Goal**: 座標変換ロジックの確認（新規実装なし）

- [ ] T001 Verify pxToMinutes() availability (F4)
- [ ] T002 Verify snapToMinutes() availability (F4)
- [ ] T003 Verify pxToDayIndex() availability (F5)
- [ ] T004 Add calculateDateTime() to dragUtils.ts
  - Input: date, minutes
  - Output: ISO 8601 string
  - ロジック: date の日付部分 + minutes の時刻部分を結合

**Estimated Time**: 1 hour

### Phase 1: Absolute 方式の実装

**Goal**: クリック・ドラッグでプレースホルダーを表示

- [ ] T005 Create useCreateEvent hook (src/absolute/hooks/useCreateEvent.ts)
  - handleClick: シングルクリック → 1時間デフォルト
  - handlePointerDown/Move/Up: ドラッグ選択
  - handleConfirm: Enter で確定
  - handleCancel: Escape / 外クリックでキャンセル
- [ ] T006 Create CreationPlaceholder component (src/absolute/components/CreationPlaceholder.tsx)
  - Props: creationState, onConfirm, onCancel
  - position: absolute で top, height を設定
  - <input type="text" autoFocus /> を内包
  - onKeyDown で Enter / Escape を検出
- [ ] T007 Style CreationPlaceholder (src/absolute/components/CreationPlaceholder.module.css)
  - background: rgba(59, 130, 246, 0.3)
  - border: 2px dashed #3b82f6
  - z-index: 5
  - input: border: none, background: transparent
- [ ] T008 Update DayColumn to use useCreateEvent
  - useCreateEvent フックを呼び出し
  - onClick, onPointerDown を DayColumn 背景に渡す
  - creationState が存在する場合、CreationPlaceholder を描画

**Estimated Time**: 6 hours

### Phase 2: Grid 方式の実装

**Goal**: Grid 方式でも同じ機能を実装

- [ ] T009 Create useCreateEvent hook (src/grid/hooks/useCreateEvent.ts)
  - T005 とほぼ同じ
  - プレースホルダーの位置は grid-row で指定
- [ ] T010 Create CreationPlaceholder component (src/grid/components/CreationPlaceholder.tsx)
  - grid-row: `${startMinutes} / ${endMinutes}` で配置
  - T006 と同じ入力欄・キーハンドリング
- [ ] T011 Style CreationPlaceholder
  - T007 と同じスタイル
- [ ] T012 Update DayGrid to use useCreateEvent
  - T008 と同じ統合方法

**Estimated Time**: 6 hours

### Phase 3: Edge Cases & Integration

**Goal**: エッジケースの対応と他機能との統合

- [ ] T013 Implement existing event collision detection
  - e.target.closest('.eventBlock') で既存イベント判定
  - 既存イベント上ではプレースホルダー作成しない
- [ ] T014 Implement minimum duration (15min)
  - ドラッグ選択で duration < 15分 の場合、15分にクランプ
- [ ] T015 Implement default title
  - title が空の場合、"新しいイベント" で作成
- [ ] T016 Test outside click cancel
  - document.addEventListener('click') で外クリック検出
  - プレースホルダー外クリック → キャンセル
- [ ] T017 Verify side-by-side mode
  - absolute と grid で同じ動作を確認

**Estimated Time**: 4 hours

### Phase 4: Performance & Polish

**Goal**: パフォーマンス最適化と仕上げ

- [ ] T018 Implement requestAnimationFrame throttling
  - pointermove をスロットリング（F4 と同じ）
- [ ] T019 Test with 100 events
  - 大量のイベントがある状態でプレースホルダー作成のパフォーマンスを確認
- [ ] T020 Manual click/drag test
  - 実際にクリック・ドラッグして、UX を体感
  - 入力 → Enter → 保存の流れを確認
- [ ] T021 Verify F2 integration
  - 作成後のレイアウト調整（重なり処理）が自動的に動作することを確認

**Estimated Time**: 3 hours

## Testing Strategy

### Unit Tests

**Testing Framework**: Vitest 4.0.18

**Test Files**:
1. `tests/unit/dragUtils.test.ts` (F4, F5 から流用)
   - calculateDateTime(): 日付 + 時刻の結合

**Coverage Target**: calculateDateTime() の 100%

### Integration Tests

**Method**: 手動テスト

**Test Cases**:
1. シングルクリックでプレースホルダー表示
2. ドラッグ選択で範囲指定
3. Enter で確定 → イベント作成
4. Escape でキャンセル
5. 外クリックでキャンセル
6. 既存イベント上でクリック → 何もしない

### E2E Tests

スコープ外（手動テストで十分）

## Risk Analysis

### Risk 1: 既存イベントとの衝突判定の漏れ
- **Impact**: Medium（既存イベント上にプレースホルダーが表示される）
- **Probability**: Low
- **Mitigation**:
  - T013 で e.target.closest('.eventBlock') を厳密にチェック
  - EventBlock に `.eventBlock` クラスを追加

### Risk 2: F4/F6 のドラッグとの競合
- **Impact**: High（ドラッグが動作しなくなる）
- **Probability**: Low
- **Mitigation**:
  - DayColumn/DayGrid の背景のみでイベントを検出
  - EventBlock 上のイベントは stopPropagation で遮断（既に F4/F6 で実装済み）

### Risk 3: 入力欄のフォーカス管理
- **Impact**: Medium（autoFocus が効かない可能性）
- **Probability**: Low
- **Mitigation**:
  - useEffect で明示的に focus() を呼び出す
  - T020 で手動テスト

### Risk 4: プレースホルダーの z-index
- **Impact**: Low（既存イベントの下に隠れる可能性）
- **Probability**: Low
- **Mitigation**:
  - z-index: 5 を設定（EventBlock は z-index: 1、NowIndicator は z-index: 10）

## Constitution Compliance

### ✓ Principle I: Simplicity First (NON-NEGOTIABLE)
- **YAGNI 厳守**: 色選択 UI、複数作成等は実装しない
- **外部ライブラリ**: Pointer Events API のみ ✓
- **抽象化**: F4, F5 の dragUtils を流用（重複実装なし）

### ✓ Principle II: Strict Scope Adherence
- **スコープ外事項**: タイトル以外のフィールド、複数作成等は実装しない

### ✓ Principle III: Separation of Concerns
- **依存ルール**:
  - dragUtils（F4, F5）を流用 ✓
  - useCreateEvent は各方式ディレクトリに分離 ✓
  - CreationPlaceholder は独立コンポーネント ✓

### ✓ Principle IV: Fair Comparison Environment
- **同一ロジック**: pxToMinutes, snapToMinutes, pxToDayIndex は共通 ✓
- **同一挙動**: 両方式で同じクリック・ドラッグ処理 ✓
- **パフォーマンス計測**: T019 で両方式を同条件で測定 ✓

### ✓ Principle V: TypeScript Strict Mode
- **any 禁止**: CreationState, UseCreateEventProps の型を明示 ✓
- **戻り値の型**: useCreateEvent の戻り値型を定義 ✓
- **イベントハンドラー**: React.MouseEvent<HTMLDivElement> 使用 ✓

## Open Technical Questions

### Q1: プレースホルダーを WeekView で管理するか、各 DayColumn で管理するか？

**Options**:
- A: 各 DayColumn が独立して管理
  - Pros: シンプル
  - Cons: 複数のプレースホルダーが同時に存在する可能性
- B: WeekView で一元管理
  - Pros: 1つのみ保証
  - Cons: props ドリリング

**Decision**: Option A を採用（1つのみの制約は useCreateEvent 内で管理、複雑化を避ける）

### Q2: デフォルトの色は固定か、ランダムか？

**Options**:
- A: 固定色（#3b82f6）
  - Pros: シンプル
  - Cons: 単調
- B: ランダム色（配列からランダム選択）
  - Pros: 視覚的に区別しやすい
  - Cons: やや複雑

**Decision**: Option A を採用（憲法の Simplicity First に従う）

## Out of Scope (Technical)

- **色選択 UI**: イベント作成時に色を選択する機能
- **複数フィールド入力**: タイトル以外（説明、場所等）の入力
- **複数イベント一括作成**: Ctrl+ドラッグ等
- **ダブルクリック作成**: シングルクリックのみ対応
- **作成時のアニメーション**: フェードイン効果等

## Next Steps

1. ✅ 仕様書（spec.md）のレビュー
2. ✅ 実装計画（plan.md）のレビュー
3. ⏭️ **Run `/speckit.tasks`** to create task breakdown
4. ⏭️ Phase 0 から順次実装開始
5. ⏭️ T013 で既存イベント衝突判定のテスト（重要）
6. ⏭️ T020 で手動テスト、UX 確認
