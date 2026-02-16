# Implementation Plan: 現在時刻インジケーター

**Spec**: [spec.md](./spec.md)
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F1 (週間タイムグリッド描画)

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.6.2（strict mode 有効）
- **Framework**: React 19.0.0（関数コンポーネント + Hooks）
- **Build Tool**: Vite 6.0.7
- **Date Library**: date-fns 4.1.0（必要に応じて）
- **Testing**: Vitest 4.0.18
- **Styling**: CSS Modules

### External Dependencies
なし（F1, F2 と同じスタックを継続使用）

**Rationale**:
- 現在時刻の取得は JavaScript 標準の `new Date()` で十分
- date-fns は日付計算が必要な場合のみ使用（今回は不要の可能性高い）
- 憲法原則 I（Simplicity First）に従い、新規ライブラリの追加なし

## Architecture

### System Architecture

F3 は F1 のタイムグリッド上に現在時刻インジケーターを重ねるレイヤーとして実装する。

```
┌─────────────────────────────────────────────┐
│ App.tsx (ViewMode 切替)                      │
├─────────────────────────────────────────────┤
│ useCurrentTime (現在時刻の取得・更新)        │ ← F3 で新規追加
├─────────────────────────────────────────────┤
│         Absolute方式        Grid方式         │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ AbsoluteWeekView │  │ GridWeekView     │ │
│  │ ├─ TimeLabels    │  │ ├─ TimeLabels    │ │
│  │ ├─ WeekHeader    │  │ ├─ WeekHeader    │ │
│  │ └─ DayColumn ×7  │  │ └─ DayGrid ×7    │ │
│  │    ├─ EventBlock │  │    ├─ EventBlock │ │
│  │    └─ NowIndicator│  │    └─ NowIndicator│ │ ← F3 で新規追加
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
         ↓                        ↓
    ┌────────────────────────────────┐
    │ shared/hooks/useCurrentTime.ts │ ← F3 で新規追加
    │ - 現在時刻の取得                │
    │ - 1分ごとの更新                │
    │ - クリーンアップ                │
    └────────────────────────────────┘
```

### Component Structure

F3 で追加するファイル（既存の F1, F2 構造を拡張）:

```
src/
├── shared/
│   └── hooks/
│       └── useCurrentTime.ts             # 現在時刻フック (新規)
│
├── absolute/
│   └── components/
│       ├── NowIndicator.tsx              # インジケーター (新規)
│       └── NowIndicator.module.css
│
└── grid/
    └── components/
        ├── NowIndicator.tsx              # インジケーター (新規)
        └── NowIndicator.module.css
```

**Design Patterns**:
- **Custom Hook**: `useCurrentTime` で時刻管理を共通化
- **Conditional Rendering**: `isToday` による表示制御
- **Interval Cleanup**: useEffect のクリーンアップでメモリリーク防止

## Data Design

### Hook Interface

```typescript
// src/shared/hooks/useCurrentTime.ts

export type CurrentTime = {
  now: Date;
  minutesFromMidnight: number;  // 0-1439
};

export const useCurrentTime = (): CurrentTime => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // 1分 = 60000ms

    return () => clearInterval(interval);
  }, []);

  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  return { now, minutesFromMidnight };
};
```

### Component Props

**Absolute 方式**:
```typescript
// src/absolute/components/NowIndicator.tsx

type NowIndicatorProps = {
  minutesFromMidnight: number;  // 0-1439
  hourHeight: number;           // 60px (通常)
};

// Style:
// position: absolute
// top: (minutesFromMidnight / 60) * hourHeight
// left: 0
// width: 100%
// height: 2px
// z-index: 10
```

**Grid 方式**:
```typescript
// src/grid/components/NowIndicator.tsx

type NowIndicatorProps = {
  minutesFromMidnight: number;  // 0-1439
};

// Style:
// grid-row-start: minutesFromMidnight
// grid-column: 1 / -1  (列全体に跨る)
// height: 2px
// z-index: 10
```

### Data Flow

```
┌──────────────┐
│ setInterval  │
│  (60秒ごと)   │
└──────┬───────┘
       │ new Date()
       ↓
┌──────────────────────────┐
│ useCurrentTime           │
│ - now: Date              │
│ - minutesFromMidnight    │
└──────┬───────────────────┘
       │ minutesFromMidnight
       ↓
┌──────────────────────────┐
│ DayColumn / DayGrid      │
│ if (day.isToday) {       │
│   <NowIndicator />       │
│ }                        │
└──────┬───────────────────┘
       │ minutesFromMidnight
       ↓
┌──────────────────────────┐
│ NowIndicator             │
│ - top or grid-row        │
│ - 赤い線 + ドット         │
└──────────────────────────┘
```

## Implementation Phases

### Phase 0: Shared Hook (共通実装)

**Goal**: 現在時刻を 1分ごとに更新するフックを実装

- [ ] T001 Create useCurrentTime hook (src/shared/hooks/useCurrentTime.ts)
  - useState で現在時刻を保持
  - useEffect + setInterval で 60秒ごとに更新
  - クリーンアップで clearInterval
  - minutesFromMidnight を計算して返す
- [ ] T002 Export CurrentTime type (src/shared/types.ts)
  - useCurrentTime の戻り値の型を定義
- [ ] T003 Write unit tests for useCurrentTime (tests/unit/useCurrentTime.test.ts)
  - jest.useFakeTimers() でタイマーをモック
  - 1分進めて now が更新されることを確認
  - アンマウント時に clearInterval が呼ばれることを確認

**Estimated Time**: 2 hours

### Phase 1: Absolute 方式の実装

**Goal**: position: absolute でインジケーターを配置

- [ ] T004 Create NowIndicator component (src/absolute/components/NowIndicator.tsx)
  - Props: minutesFromMidnight, hourHeight
  - top を計算: `(minutesFromMidnight / 60) * hourHeight`
  - 赤い線（2px 高さ）と左端のドット（8px 直径）を描画
- [ ] T005 Style NowIndicator (src/absolute/components/NowIndicator.module.css)
  - `.line`: position: absolute, background: #ef4444, height: 2px, width: 100%, z-index: 10
  - `.dot`: position: absolute, left: 0, top: -3px (線の中央), width: 8px, height: 8px, border-radius: 50%, background: #ef4444
  - pointer-events: none (クリック不可)
- [ ] T006 Update DayColumn to render NowIndicator
  - useCurrentTime() を呼び出し
  - day.isToday が true の場合のみ <NowIndicator /> を描画
  - minutesFromMidnight と HOUR_HEIGHT を props で渡す

**Estimated Time**: 2 hours

### Phase 2: Grid 方式の実装

**Goal**: CSS Grid でインジケーターを配置

- [ ] T007 Create NowIndicator component (src/grid/components/NowIndicator.tsx)
  - Props: minutesFromMidnight
  - grid-row-start を設定: `minutesFromMidnight`
  - grid-column を設定: `1 / -1` (全列に跨る)
- [ ] T008 Style NowIndicator (src/grid/components/NowIndicator.module.css)
  - `.line`: background: #ef4444, height: 2px, z-index: 10
  - `.dot`: absolute 版と同じスタイル（grid 内での位置調整）
  - pointer-events: none
- [ ] T009 Update DayGrid to render NowIndicator
  - useCurrentTime() を呼び出し
  - day.isToday が true の場合のみ <NowIndicator /> を描画
  - minutesFromMidnight を props で渡す

**Estimated Time**: 2 hours

### Phase 3: Visual Polish & Edge Cases

**Goal**: 視覚的な調整とエッジケースの対応

- [ ] T010 Verify z-index layering
  - EventBlock (z-index: 1) の上に NowIndicator (z-index: 10) が表示されることを確認
- [ ] T011 Test date change edge case
  - 23:59 から 00:00 に変わる際、インジケーターが消えることを確認（手動テスト）
- [ ] T012 Test scroll position edge case
  - 0:00 〜 8:00 の時間帯で、インジケーターが画面外にあることを確認
  - 上にスクロールすると表示されることを確認
- [ ] T013 Verify side-by-side mode displays same time
  - absolute と grid で同じ位置にインジケーターが表示されることを確認

**Estimated Time**: 1.5 hours

### Phase 4: Performance & Testing

**Goal**: パフォーマンス検証とテスト

- [ ] T014 Verify no memory leak
  - Chrome DevTools の Memory Profiler で 10分間の動作を監視
  - メモリ使用量が増加しないことを確認
- [ ] T015 Verify re-render isolation
  - React DevTools の Profiler で、インジケーター更新時に他のコンポーネントが再レンダリングされないことを確認
- [ ] T016 Manual visual test
  - 実際の時刻と表示位置が一致することを確認
  - 1分経過後、インジケーターが 1px 下に移動することを確認
- [ ] T017 Run all unit tests
  - `npm test` で useCurrentTime のテストが通ることを確認

**Estimated Time**: 2 hours

## Testing Strategy

### Unit Tests

**Testing Framework**: Vitest 4.0.18

**Test Files**:
1. `tests/unit/useCurrentTime.test.ts`
   - タイマーのモック（jest.useFakeTimers）
   - 1分進めて now が更新されることを確認
   - クリーンアップの動作確認

**Coverage Target**: useCurrentTime の 100%

### Integration Tests

**Method**: 手動テスト

**Test Cases**:
1. 今日の列にインジケーターが表示される
2. 今日以外の列にはインジケーターが表示されない
3. side-by-side モードで absolute と grid の位置が一致
4. 1分経過後、位置が更新される

### E2E Tests

スコープ外（手動テストで十分）

## Risk Analysis

### Risk 1: setInterval のブラウザスロットリング
- **Impact**: Low（非アクティブタブで更新頻度が下がる可能性）
- **Probability**: Medium
- **Mitigation**:
  - 1分間隔なので精度への影響は軽微
  - タブアクティブ時に即座に再計算する必要なし（次回の setInterval で自動補正）

### Risk 2: Grid 方式での z-index 制御
- **Impact**: Medium（イベントの上に表示されない可能性）
- **Probability**: Low
- **Mitigation**:
  - T010 で早期に検証
  - 問題があれば、インジケーターを別レイヤー（absolute overlay）として描画

### Risk 3: メモリリーク（clearInterval 忘れ）
- **Impact**: High（長時間使用でブラウザが重くなる）
- **Probability**: Low（useEffect クリーンアップで対応済み）
- **Mitigation**:
  - T014 で Memory Profiler で検証
  - コードレビューでクリーンアップを必ず確認

### Risk 4: absolute と grid の見た目の差異
- **Impact**: Low（±1px の誤差は許容範囲）
- **Probability**: Low
- **Mitigation**:
  - T013 で視覚的に確認
  - 両方式で同じ minutesFromMidnight を使用するため、計算ロジックは同一

## Constitution Compliance

### ✓ Principle I: Simplicity First (NON-NEGOTIABLE)
- **YAGNI 厳守**: 秒単位の更新、カスタマイズ UI 等は実装しない
- **外部ライブラリ**: なし（JavaScript 標準の Date のみ）
- **抽象化**: useCurrentTime フックのみ共通化（1 回のみの実装）

### ✓ Principle II: Strict Scope Adherence
- **スコープ外事項**: アニメーション、カスタマイズ、複数タイムゾーン等は実装しない

### ✓ Principle III: Separation of Concerns
- **依存ルール**:
  - useCurrentTime は `shared/hooks/` に配置 ✓
  - NowIndicator は各方式ディレクトリに分離（描画方法が異なる） ✓
  - DayColumn/DayGrid が NowIndicator を条件付きでレンダリング ✓

### ✓ Principle IV: Fair Comparison Environment
- **同一ロジック**: minutesFromMidnight の計算は共通（useCurrentTime） ✓
- **同一データ**: 両方式で同じ現在時刻を使用 ✓
- **side-by-side**: T013 で視覚的差異を確認 ✓

### ✓ Principle V: TypeScript Strict Mode
- **any 禁止**: 全ての型を明示的に定義 ✓
- **戻り値の型**: useCurrentTime の戻り値は CurrentTime 型 ✓
- **クリーンアップ関数**: () => void 型 ✓

## Open Technical Questions

### Q1: Grid 方式で grid-row-start に分単位の値を直接指定できるか？

**Options**:
- A: `grid-row-start: 870` のように直接指定
  - Pros: シンプルで absolute と同じ考え方
  - Cons: grid-template-rows が 1440 行定義されている前提
- B: absolute overlay として描画
  - Pros: Grid の行定義に依存しない
  - Cons: absolute と実質同じになり比較の意味が薄れる

**Decision**: Option A を採用（F2 で grid-template-rows: repeat(1440, 1px) を定義済み）

### Q2: インジケーターの更新時、他のコンポーネントの再レンダリングを防ぐ必要があるか？

**Options**:
- A: useCurrentTime を DayColumn/DayGrid 内で呼び出す
  - Pros: シンプル
  - Cons: minutesFromMidnight 変更時に DayColumn 全体が再レンダリング
- B: useCurrentTime を WeekView で呼び出し、props で渡す
  - Pros: 再レンダリング範囲を限定
  - Cons: props ドリリングが発生

**Decision**: Option A を採用。React.memo を NowIndicator に適用すれば、EventBlock の再レンダリングは防げる（T015 で検証）

## Out of Scope (Technical)

- **秒単位の更新**: setInterval を 1秒ごとにする機能
- **アニメーション**: インジケーターが滑らかに移動する CSS transition
- **カスタマイズ UI**: 色・太さの変更設定
- **タイムゾーン対応**: UTC や他のタイムゾーンでの表示
- **表示/非表示トグル**: インジケーターを隠す設定
- **複数インジケーター**: 今日以外の日にも表示する機能

## Next Steps

1. ✅ 仕様書（spec.md）のレビュー
2. ✅ 実装計画（plan.md）のレビュー
3. ⏭️ **Run `/speckit.tasks`** to create task breakdown
4. ⏭️ Phase 0 から順次実装開始
5. ⏭️ T016 で手動テスト、T017 で自動テスト
6. ⏭️ F1, F2 との統合確認
