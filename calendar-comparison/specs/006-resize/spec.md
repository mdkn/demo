# Feature Specification: リサイズ（時間変更）

**Feature ID**: F6
**Branch**: feature/006-resize
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F4 (ドラッグ&ドロップ - 時間移動)

## Overview

イベント要素の上端・下端をドラッグして開始時刻・終了時刻を個別に変更する。15分単位でスナップし、最小15分の長さを保証する。

## User Stories

### [US1] [P1] 上端ドラッグで開始時刻を変更

**As a** カレンダーユーザー
**I want** イベントの上端をドラッグして開始時刻を変更できる
**So that** 会議の開始時間を後ろにずらしたり前倒ししたりできる

**Acceptance Criteria**:
- Given: Event1 が 9:00-10:00 に配置されている
- When: 上端を下に 30分ドラッグ
- Then: イベントが 9:30-10:00 に変更される（終了時刻固定）

**Independent Testability**: 上端8pxの領域でドラッグ開始し、startAt のみ変更されることを確認

### [US2] [P1] 下端ドラッグで終了時刻を変更

**As a** カレンダーユーザー
**I want** イベントの下端をドラッグして終了時刻を変更できる
**So that** 会議の終了時間を延長したり短縮したりできる

**Acceptance Criteria**:
- Given: Event1 が 9:00-10:00 に配置されている
- When: 下端を下に 30分ドラッグ
- Then: イベントが 9:00-10:30 に変更される（開始時刻固定）

**Independent Testability**: 下端8pxの領域でドラッグ開始し、endAt のみ変更されることを確認

### [US3] [P1] リサイズハンドルのホバー表示

**As a** カレンダーユーザー
**I want** イベントの上端・下端にホバーするとカーソルが変わる
**So that** リサイズ可能な領域が視覚的に分かる

**Acceptance Criteria**:
- Given: イベントが表示されている
- When: マウスを上端8px または下端8px の領域にホバー
- Then: カーソルが `ns-resize` に変わる

**Independent Testability**: CSS の `:hover` セレクタで cursor が設定されることを確認

### [US4] [P2] 最小時間の制限（15分）

**As a** カレンダーユーザー
**I want** イベントを15分未満にリサイズできない
**So that** 極端に短いイベントにならない

**Acceptance Criteria**:
- Given: Event1 が 9:00-10:00 に配置されている
- When: 下端を上に 50分ドラッグ（9:10にしようとする）
- Then: イベントは 9:00-9:15 で止まる（15分が最小）

**Independent Testability**: リサイズ計算で duration < 15分 の場合、15分にクランプされることを確認

### [US5] [P2] リサイズ中のツールチップ表示

**As a** カレンダーユーザー
**I want** リサイズ中に変更後の時刻がツールチップで表示される
**So that** 正確な時刻を確認しながら調整できる

**Acceptance Criteria**:
- Given: イベントの上端をドラッグ中
- When: マウスを 9:30 の位置に移動
- Then: "9:30 - 10:00" というツールチップが表示される

**Independent Testability**: リサイズ中に `.tooltip` 要素が描画されることを確認

## Functional Requirements

### FR-001: リサイズハンドル領域の判定 [P1]
**Description**: イベント要素の上端8px / 下端8px でドラッグ開始を検出
**Acceptance**:
- offsetY < 8 → 上端リサイズ
- offsetY > height - 8 → 下端リサイズ
- それ以外 → 通常のドラッグ（F4）
**Related Stories**: US1, US2

### FR-002: 上端リサイズの計算 [P1]
**Description**: マウスY座標から新しい startAt を計算し、endAt は固定
**Acceptance**:
- deltaY → 新しい startMinutes
- 15分スナップ
- 最小duration（15分）を保証
**Related Stories**: US1

### FR-003: 下端リサイズの計算 [P1]
**Description**: マウスY座標から新しい endAt を計算し、startAt は固定
**Acceptance**:
- deltaY → 新しい endMinutes
- 15分スナップ
- 最小duration（15分）を保証
**Related Stories**: US2

### FR-004: リサイズハンドルのカーソル変更 [P1]
**Description**: CSS の `:hover` で上端・下端のカーソルを `ns-resize` に変更
**Acceptance**:
- `.resizeHandleTop:hover` → cursor: ns-resize
- `.resizeHandleBottom:hover` → cursor: ns-resize
**Related Stories**: US3

### FR-005: 最小duration の保証 [P2]
**Description**: リサイズ計算で duration < 15分 の場合、15分にクランプ
**Acceptance**:
- 上端リサイズ: newStartMinutes > endMinutes - 15 → newStartMinutes = endMinutes - 15
- 下端リサイズ: newEndMinutes < startMinutes + 15 → newEndMinutes = startMinutes + 15
**Related Stories**: US4

### FR-006: ツールチップの表示 [P2]
**Description**: リサイズ中にマウス位置に時刻ツールチップを表示
**Acceptance**:
- 上端リサイズ: "新startAt - 元endAt"
- 下端リサイズ: "元startAt - 新endAt"
- position: absolute で マウス座標 + (10px, 10px) に配置
**Related Stories**: US5

### FR-007: 15分スナップ [P1]
**Description**: F4 と同じく、snapToMinutes() で 15分単位に丸める
**Acceptance**: F4 の FR-005 と同じ
**Related Stories**: US1, US2

### FR-008: 範囲制限 [P2]
**Description**: 0:00 〜 24:00 の範囲内にクランプ
**Acceptance**:
- startAt < 0:00 → 0:00
- endAt > 24:00 → 24:00
**Related Stories**: US1, US2

## Data Model

### Resize State (コンポーネント内部状態)

```typescript
type ResizeState = {
  isResizing: boolean;
  resizeType: 'top' | 'bottom';  // 上端 or 下端
  startY: number;                // リサイズ開始時のマウスY座標
  originalStartAt: string;       // Escape用
  originalEndAt: string;         // Escape用
  currentStartAt: string;        // ツールチップ表示用
  currentEndAt: string;          // ツールチップ表示用
};
```

### Hook Interface

```typescript
const useResizeEvent = (
  event: CalendarEvent,
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void,
  hourHeight: number,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const handleTopResize = (e: React.PointerEvent<HTMLDivElement>) => void;
  const handleBottomResize = (e: React.PointerEvent<HTMLDivElement>) => void;

  return {
    isResizing: boolean;
    resizeType: 'top' | 'bottom' | null;
    currentStartAt: string;
    currentEndAt: string;
    topHandleProps: {
      onPointerDown: handleTopResize;
      className: styles.resizeHandleTop;
    };
    bottomHandleProps: {
      onPointerDown: handleBottomResize;
      className: styles.resizeHandleBottom;
    };
  };
};
```

## Edge Cases

### Case 1: リサイズハンドルとドラッグの競合
**Behavior**: 上端8px / 下端8px → リサイズ、それ以外 → ドラッグ（F4）
**Reason**: FR-001 で領域を明確に分離

### Case 2: 最小duration（15分）以下にリサイズ
**Behavior**: 15分で止まる
**Reason**: FR-005 でクランプ

### Case 3: リサイズ中に別のイベントと重なる
**Behavior**: 重なりを許可し、F2 の重なり処理でレイアウト調整
**Reason**: F4 と同じ（衝突判定はスコープ外）

### Case 4: Escapeキーでキャンセル
**Behavior**: F4 と同じく、Escape で元のサイズに戻る
**Reason**: F4 の FR-007 を流用

### Case 5: リサイズ中に0:00 / 24:00を超える
**Behavior**: 範囲内にクランプ
**Reason**: FR-008

### Case 6: 上端と下端が同じ位置（duration = 0）
**Behavior**: 最小15分を保証するため発生しない
**Reason**: FR-005

## Success Criteria

### User Experience
- **リサイズの滑らかさ**: 60fps で描画され、カクつきがない
- **ツールチップの可読性**: 時刻が明確に読める

### System Performance
- **リサイズ応答性**: pointermove から描画更新まで 16ms 以内（60fps）
- **F4 との共存**: ドラッグとリサイズが競合せず、どちらも正常動作

### Business Impact (Technical Validation)
- **absolute vs Grid の実装難易度**: リサイズ処理のコード量を比較
- **top/height vs grid-row の操作性**: absolute は直接操作、Grid は span 更新の違いを検証

## Non-Functional Requirements

### Performance
- **リサイズ中の再レンダリング**: リサイズ中のイベントのみ更新
- **ツールチップの軽量化**: DOM 要素は1つのみ（複数イベントで使い回し）

### Usability
- **カーソル変化**: リサイズハンドル領域で `ns-resize`、リサイズ中も `ns-resize` 維持
- **ツールチップの位置**: マウスから少しずらして表示（マウスで隠れない）

### Maintainability
- **F4 との分離**: useResizeEvent を別フックとして実装（useDragEvent と独立）
- **共通ユーティリティ**: snapToMinutes, clampMinutes は F4 から流用

## Open Questions

- **Q1**: useDragEvent と useResizeEvent を統合するか、分離するか？
  - **A**: 分離する（責務が異なる、コードが複雑化しない）

- **Q2**: ツールチップは必須か？
  - **A**: P2 機能として実装（時間があれば追加）

## Out of Scope

- リサイズ中の日付変更（左右方向のリサイズ）
- リサイズ中のアニメーション
- リサイズ中の衝突検出・警告
- 複数イベントの一括リサイズ
- リサイズ量の数値入力UI
