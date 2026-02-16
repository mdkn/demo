# Implementation Plan: リアルタイムドラッグ重なり検知

**Spec**: [spec.md](./spec.md)
**Created**: 2026-02-16
**Status**: Draft
**Depends On**: F4 (ドラッグ&ドロップ時間移動), F5 (ドラッグ&ドロップ日付移動), F2 (イベント配置)

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.6.2（strict mode 有効）
- **Framework**: React 19.0.0（関数コンポーネント + Hooks）
- **Build Tool**: Vite 6.0.7
- **Browser API**: requestAnimationFrame（標準 Web API）
- **State Management**: React Context API + useState
- **Testing**: Vitest 4.0.18
- **Styling**: CSS Modules

### External Dependencies
なし（F1-F7 と同じスタックを継続使用）

**Rationale**:
- React Context API は標準機能で、プレビュー状態を効率的に共有できる
- requestAnimationFrame は標準 API で、パフォーマンス最適化に最適
- 憲法原則に従い、外部状態管理ライブラリ（Redux, Zustand 等）は使用しない
- 既存の `detectOverlaps()` アルゴリズムをそのまま活用

## Architecture

### System Architecture

F8 は F4/F5 のドラッグ機能にリアルタイムプレビュー機能を追加するレイヤーとして実装する。

```
┌─────────────────────────────────────────────────────────┐
│ App.tsx                                                  │
│ └─ DragPreviewProvider (F8 新規)                        │ ← Context でプレビュー状態を提供
│    └─ useCalendarEvents                                 │
├─────────────────────────────────────────────────────────┤
│         Absolute方式           Grid方式                  │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ DayColumn            │  │ DayGrid              │    │
│  │ ├─ useAbsoluteLayout │  │ ├─ useGridLayout     │    │ ← F8 でプレビュー統合
│  │ │  └─ useDragPreview │  │ │  └─ useDragPreview │    │
│  │ └─ EventBlock        │  │ └─ EventBlock        │    │
│  │    └─ useDragEvent   │  │    └─ useDragEvent   │    │ ← F8 でプレビュー更新
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
    ┌───────────────────────────────────────────┐
    │ shared/contexts/DragPreviewContext.tsx    │ ← F8 新規
    │ - DragPreviewProvider                     │
    │ - useDragPreview()                        │
    └───────────────────────────────────────────┘
         ↓
    ┌───────────────────────────────────────────┐
    │ shared/utils/rafThrottle.ts               │ ← F8 新規
    │ - createRafThrottle()                     │
    └───────────────────────────────────────────┘
         ↓
    ┌───────────────────────────────────────────┐
    │ shared/utils/overlapUtils.ts              │ ← F2 既存（変更なし）
    │ - detectOverlaps()                        │
    │ - assignColumns()                         │
    └───────────────────────────────────────────┘
```

### Component Structure

F8 で追加・修正するファイル:

```
src/
├── App.tsx                                 # DragPreviewProvider を追加
│
├── shared/
│   ├── contexts/
│   │   └── DragPreviewContext.tsx          # プレビュー状態管理 (新規)
│   └── utils/
│       └── rafThrottle.ts                  # RAF スロットリング (新規)
│
├── absolute/
│   ├── hooks/
│   │   ├── useAbsoluteLayout.ts            # プレビュー統合（修正）
│   │   └── useDragEvent.ts                 # プレビュー更新（修正）
│
└── grid/
    └── hooks/
        ├── useGridLayout.ts                # プレビュー統合（修正）
        └── useDragEvent.ts                 # プレビュー更新（修正）
```

**Design Patterns**:
- **Context Pattern**: プレビュー状態をグローバルに共有
- **RAF Throttling**: パフォーマンス最適化のためのフレームレート制限
- **Separation of Concerns**: プレビュー管理とレイアウト計算を分離
- **Immutable Updates**: プレビューイベントは元のイベントを変更せず新しいオブジェクトを作成

## Data Design

### DragPreview State (Context)

```typescript
type DragPreview = {
  eventId: string;      // ドラッグ中のイベント ID
  tempStartAt: string;  // 仮の開始時刻 (ISO 8601)
  tempEndAt: string;    // 仮の終了時刻 (ISO 8601)
} | null;
```

### Context Interface

```typescript
interface DragPreviewContextValue {
  dragPreview: DragPreview;
  updateDragPreview: (eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => void;
  clearDragPreview: () => void;
}
```

### Data Flow

```
1. ドラッグ開始 (useDragEvent)
   └─ dragPreview = null

2. ドラッグ中 (handlePointerMove)
   └─ 新しい時刻を計算
   └─ updateDragPreview(eventId, { tempStartAt, tempEndAt })
   └─ RAF でスロットリング
   └─ Context 状態更新
   └─ useAbsoluteLayout/useGridLayout が再計算

3. ドロップ (handlePointerUp)
   └─ clearDragPreview()
   └─ onUpdate(id, { startAt, endAt })
```

## Implementation Phases

### Phase 0: Foundation Setup
- [x] 仕様レビュー完了
- [x] 既存コード調査完了
- [ ] テスト計画策定

### Phase 1: Core Infrastructure (2-3 hours)

#### Task 1.1: DragPreviewContext の作成
**File**: `src/shared/contexts/DragPreviewContext.tsx`

```typescript
import { createContext, useContext, useState, type ReactNode } from 'react';

type DragPreview = {
  eventId: string;
  tempStartAt: string;
  tempEndAt: string;
} | null;

interface DragPreviewContextValue {
  dragPreview: DragPreview;
  updateDragPreview: (eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => void;
  clearDragPreview: () => void;
}

const DragPreviewContext = createContext<DragPreviewContextValue | undefined>(undefined);

export const DragPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [dragPreview, setDragPreview] = useState<DragPreview>(null);

  const updateDragPreview = (eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => {
    setDragPreview({ eventId, ...times });
  };

  const clearDragPreview = () => {
    setDragPreview(null);
  };

  return (
    <DragPreviewContext.Provider value={{ dragPreview, updateDragPreview, clearDragPreview }}>
      {children}
    </DragPreviewContext.Provider>
  );
};

export const useDragPreview = () => {
  const context = useContext(DragPreviewContext);
  if (!context) {
    throw new Error('useDragPreview must be used within DragPreviewProvider');
  }
  return context;
};
```

**Tests**: Context の基本動作テスト

#### Task 1.2: RAF Throttle ユーティリティの作成
**File**: `src/shared/utils/rafThrottle.ts`

```typescript
/**
 * requestAnimationFrame を使ってコールバックをスロットリングする
 * 複数の呼び出しを1フレームに統合し、最大60回/秒に制限
 */
export const createRafThrottle = <T extends (...args: any[]) => void>(
  callback: T
): T => {
  let rafId: number | null = null;
  let latestArgs: any[] | null = null;

  const throttled = (...args: any[]) => {
    latestArgs = args;

    if (rafId !== null) {
      // すでに RAF が予約されている場合は引数のみ更新
      return;
    }

    rafId = requestAnimationFrame(() => {
      if (latestArgs !== null) {
        callback(...latestArgs);
        latestArgs = null;
      }
      rafId = null;
    });
  };

  return throttled as T;
};
```

**Tests**: スロットリング動作のテスト

#### Task 1.3: App.tsx に Provider を追加
**File**: `src/App.tsx`

```typescript
import { DragPreviewProvider } from '@shared/contexts/DragPreviewContext';

function App() {
  return (
    <DragPreviewProvider>
      {/* 既存のコンポーネントツリー */}
    </DragPreviewProvider>
  );
}
```

### Phase 2: Layout Hook Integration (3-4 hours)

#### Task 2.1: useAbsoluteLayout にプレビュー統合
**File**: `src/absolute/hooks/useAbsoluteLayout.ts`

```typescript
import { useDragPreview } from '@shared/contexts/DragPreviewContext';

export const useAbsoluteLayout = (
  events: CalendarEvent[],
  hourHeight: number
): AbsoluteEventLayout[] => {
  const { dragPreview } = useDragPreview();

  return useMemo(() => {
    // プレビューイベントを作成
    let allEvents = events;

    if (dragPreview) {
      const originalEvent = events.find(e => e.id === dragPreview.eventId);
      if (originalEvent) {
        // 元のイベントを除外
        const otherEvents = events.filter(e => e.id !== dragPreview.eventId);

        // プレビューイベントを追加
        const previewEvent: CalendarEvent = {
          ...originalEvent,
          startAt: dragPreview.tempStartAt,
          endAt: dragPreview.tempEndAt,
        };

        allEvents = [...otherEvents, previewEvent];
      }
    }

    // 既存のレイアウトロジック（変更なし）
    if (allEvents.length === 0) return [];
    const groups = detectOverlaps(allEvents);
    // ... 残りのロジック
  }, [events, dragPreview, hourHeight]);
};
```

**Tests**: プレビュー有無でのレイアウト計算テスト

#### Task 2.2: useGridLayout にプレビュー統合
**File**: `src/grid/hooks/useGridLayout.ts`

同様の変更を `useGridLayout` にも適用。

**Tests**: Grid モードでのプレビューテスト

### Phase 3: Drag Handler Updates (4-5 hours)

#### Task 3.1: useDragEvent (Absolute) にプレビュー更新を追加
**File**: `src/absolute/hooks/useDragEvent.ts`

```typescript
import { useMemo } from 'react';
import { useDragPreview } from '@shared/contexts/DragPreviewContext';
import { createRafThrottle } from '@shared/utils/rafThrottle';

export const useDragEvent = ({ ... }) => {
  const { updateDragPreview, clearDragPreview } = useDragPreview();

  // RAF スロットリングされた更新関数
  const throttledUpdate = useMemo(
    () => createRafThrottle(updateDragPreview),
    [updateDragPreview]
  );

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();

      // 既存の計算ロジック
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);
      let newStartMinutes = dragState.startMinutes + deltaMinutes;
      newStartMinutes = snapToMinutes(newStartMinutes, 15);
      newStartMinutes = clampMinutes(newStartMinutes, durationMinutes);

      const currentDayIndex = pxToDayIndex(e.clientX, dayColumnRectsRef.current);

      // 新しい時刻を計算
      let newStartAt = calculateNewTime(event.startAt, newStartMinutes);
      let newEndAt = calculateNewTime(event.endAt, newStartMinutes + durationMinutes);

      // 日付変更がある場合
      if (currentDayIndex !== null && currentDayIndex !== dragState.startDayIndex) {
        newStartAt = calculateNewDate(newStartAt, currentDayIndex, dragState.startDayIndex);
        newEndAt = calculateNewDate(newEndAt, currentDayIndex, dragState.startDayIndex);
      }

      // プレビューを更新（RAF でスロットリング）
      throttledUpdate(event.id, {
        tempStartAt: newStartAt,
        tempEndAt: newEndAt,
      });

      // DOM も直接更新（即座の視覚フィードバック）
      if (elementRef.current) {
        const topPx = (newStartMinutes / 60) * hourHeight;
        elementRef.current.style.top = `${topPx}px`;
        if (currentDayIndex !== null) {
          const dayWidth = 100 / dayColumnRectsRef.current.length;
          elementRef.current.style.left = `${currentDayIndex * dayWidth}%`;
        }
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [dragState, event, hourHeight, durationMinutes, throttledUpdate]);

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handlePointerUp = (e: PointerEvent) => {
      // ... 既存の計算ロジック ...

      // プレビューをクリア
      clearDragPreview();

      // 実際の更新を実行
      onUpdate(event.id, { startAt: newStartAt, endAt: newEndAt });

      // ... 残りのクリーンアップ ...
    };

    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, clearDragPreview, ...]);

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();

        // プレビューをクリア
        clearDragPreview();

        // ... 既存のキャンセルロジック ...
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState, clearDragPreview, ...]);
};
```

**Tests**: ドラッグ中のプレビュー更新テスト

#### Task 3.2: useDragEvent (Grid) にプレビュー更新を追加
**File**: `src/grid/hooks/useDragEvent.ts`

同様の変更を Grid モードにも適用。

**Tests**: Grid モードでのドラッグプレビューテスト

### Phase 4: Testing & Refinement (3-4 hours)

#### Task 4.1: 単体テスト作成
**Files**:
- `src/shared/contexts/DragPreviewContext.test.tsx`
- `src/shared/utils/rafThrottle.test.ts`
- `src/absolute/hooks/useAbsoluteLayout.test.ts` (既存に追加)
- `src/grid/hooks/useGridLayout.test.ts` (既存に追加)

**Test Cases**:
- プレビュー状態の更新・クリア
- RAF スロットリングの動作
- プレビューイベントを含むレイアウト計算
- エッジケース（プレビュー中のイベント削除等）

#### Task 4.2: 統合テスト
**Test Scenarios**:
1. 2つのイベントが重なる場合のリアルタイム再配置
2. 3つ以上のイベントが重なる場合
3. 重なりから離れる場合
4. クロスデイドラッグ
5. ドラッグキャンセル (Escape)

#### Task 4.3: パフォーマンステスト
**Metrics**:
- React DevTools Profiler でフレームレート測定
- 50+ イベントでの性能確認
- メモリリークの確認（RAF コールバックのクリーンアップ）

### Phase 5: Documentation & Polish (1-2 hours)

#### Task 5.1: コードコメント追加
- DragPreviewContext の使用方法
- RAF スロットリングの動作説明
- パフォーマンス考慮事項

#### Task 5.2: README 更新
- 新機能の説明
- パフォーマンス特性

## Testing Strategy

### Unit Tests (Vitest)

**新規テストファイル**:
```typescript
// src/shared/contexts/DragPreviewContext.test.tsx
describe('DragPreviewContext', () => {
  it('初期状態は null', () => { ... });
  it('updateDragPreview で状態更新', () => { ... });
  it('clearDragPreview で null に戻る', () => { ... });
});

// src/shared/utils/rafThrottle.test.ts
describe('createRafThrottle', () => {
  it('複数呼び出しを1フレームに統合', () => { ... });
  it('最新の引数が使用される', () => { ... });
});
```

**既存テスト拡張**:
```typescript
// src/absolute/hooks/useAbsoluteLayout.test.ts
describe('useAbsoluteLayout with preview', () => {
  it('プレビューなしで既存動作を維持', () => { ... });
  it('プレビューありで仮の位置を使用', () => { ... });
  it('元のイベントが除外される', () => { ... });
});
```

### Integration Tests

**E2E シナリオ（手動テスト）**:
1. イベントをドラッグ → 他のイベントがリアルタイムで横移動
2. ドロップ → プレビュー位置で確定
3. Escape → 元の位置に戻る
4. 高速ドラッグ → 滑らかな動作

### Performance Tests

**測定項目**:
- ドラッグ中の FPS（目標: 60fps）
- レイアウト再計算時間（目標: < 16ms）
- メモリ使用量（RAF コールバックのリーク確認）

## Risk Analysis

### Risk 1: パフォーマンス劣化
- **Impact**: High
- **Probability**: Medium
- **Mitigation**:
  - RAF スロットリングで再レンダリングを最大60回/秒に制限
  - useMemo でレイアウト計算をメモ化
  - React DevTools Profiler で継続的に監視

### Risk 2: 既存機能への影響
- **Impact**: High
- **Probability**: Low
- **Mitigation**:
  - プレビューが null の場合、既存動作と完全に同じ
  - 既存テストをすべて実行して回帰を防止
  - レイアウトアルゴリズム（detectOverlaps）は変更しない

### Risk 3: Context の過度な再レンダリング
- **Impact**: Medium
- **Probability**: Low
- **Mitigation**:
  - Context は最上位（App.tsx）に配置
  - 必要なコンポーネント（レイアウトフック）のみが購読
  - useMemo で計算をメモ化

### Risk 4: クロスブラウザ互換性
- **Impact**: Medium
- **Probability**: Low
- **Mitigation**:
  - requestAnimationFrame は全モダンブラウザでサポート
  - Chrome, Firefox, Safari でテスト
  - PointerEvent API は既存機能で使用済み

## Constitution Compliance

### Simplicity First
✓ **準拠**: 外部ライブラリなし、React 標準機能のみ使用

### Explicit over Implicit
✓ **準拠**: プレビュー状態は明示的な Context で管理、型安全性を維持

### No Over-Engineering
✓ **準拠**: 既存のレイアウトアルゴリズムを再利用、最小限の変更で実装

### Performance Matters
✓ **準拠**: RAF スロットリング、useMemo によるパフォーマンス最適化

### Testability
✓ **準拠**: Context、ユーティリティ、フックすべてテスト可能な設計

## Open Technical Questions

なし（既存の技術スタックで実装可能）

## Out of Scope (Technical)

以下は本実装の範囲外：
- マルチイベント同時ドラッグ（複雑性が高い）
- ドラッグアニメーション効果（仕様に含まれない）
- タッチデバイス専用の最適化（既存動作を維持）
- レイアウトアルゴリズムの最適化（F2 で実装済み）

## Summary

### 実装規模
- **新規ファイル**: 2ファイル（Context, rafThrottle）
- **修正ファイル**: 5ファイル（App.tsx, 2つのレイアウトフック, 2つのドラッグフック）
- **新規テスト**: 3-4ファイル
- **総実装時間**: 12-18時間（テスト含む）

### 技術スタック
- React Context API（プレビュー状態管理）
- requestAnimationFrame（パフォーマンス最適化）
- 既存の detectOverlaps/assignColumns（変更なし）

### 主要な設計判断
1. **Context vs Props**: Context を選択（複数層のコンポーネント間で状態共有）
2. **RAF Throttling**: 毎秒60+回の更新を60回/秒に制限
3. **Immutable Preview**: 元のイベントを変更せず、新しいオブジェクトを作成

### 次のステップ
実装プラン承認後:
1. Phase 1 から順次実装
2. 各フェーズでテスト実行
3. パフォーマンス測定
4. `/speckit.tasks` でタスク分解（オプション）
