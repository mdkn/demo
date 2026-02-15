# Feature Specification: ドラッグ&ドロップ（日付移動）

**Feature ID**: F5
**Branch**: feature/005-drag-date
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F4 (ドラッグ&ドロップ - 時間移動)

## Overview

イベント要素を左右にドラッグして別の日に移動する。F4 の上下ドラッグと組み合わせて、2次元ドラッグ（時刻+日付の同時変更）を実現する。

## User Stories

### [US1] [P1] イベントの左右ドラッグ

**As a** カレンダーユーザー
**I want** イベントをマウスでドラッグして左右に移動できる
**So that** 会議の日付を簡単に変更できる

**Acceptance Criteria**:
- Given: Event1 が月曜日の 9:00-10:00 に配置されている
- When: イベントを右に 1列分ドラッグ
- Then: イベントが火曜日の 9:00-10:00 に移動する（時刻維持）

**Independent Testability**: ドラッグ中の clientX から日付列を判定し、updateEvent が正しい日付で呼ばれることを確認

### [US2] [P1] 2次元ドラッグ（時刻+日付）

**As a** カレンダーユーザー
**I want** イベントを斜めにドラッグして時刻と日付を同時に変更できる
**So that** 柔軟にスケジュールを調整できる

**Acceptance Criteria**:
- Given: Event1 が月曜日の 9:00-10:00 に配置されている
- When: イベントを右下に斜めドラッグ（火曜日の 10:00 位置）
- Then: イベントが火曜日の 10:00-11:00 に移動する

**Independent Testability**: deltaX と deltaY を同時に計算し、日付と時刻が両方変更されることを確認

### [US3] [P1] ドラッグ中の列ハイライト

**As a** カレンダーユーザー
**I want** ドラッグ中にホバーしている日付列が薄くハイライトされる
**So that** どの日にドロップするか視覚的に分かる

**Acceptance Criteria**:
- Given: イベントをドラッグ中
- When: マウスが火曜日の列上にある
- Then: 火曜日の列の背景が `rgba(59, 130, 246, 0.1)` でハイライトされる

**Independent Testability**: ドラッグ中の DayColumn に `.dropTarget` クラスが追加されることを確認

### [US4] [P2] 週の範囲内に制限

**As a** カレンダーユーザー
**I want** イベントを表示中の週（月〜日）の範囲内にしか移動できない
**So that** 週をまたぐ複雑な移動を防げる

**Acceptance Criteria**:
- Given: イベントが日曜日に配置されている
- When: さらに右にドラッグしようとする
- Then: 日曜日の列で止まり、それ以上右には行かない

**Independent Testability**: dayIndex が 0-6 の範囲内にクランプされることを確認

## Functional Requirements

### FR-001: 日付列の判定 [P1]
**Description**: ドラッグ中の clientX から、マウスがどの日付列上にあるかを判定する
**Acceptance**:
- 各 DayColumn の getBoundingClientRect() を取得
- clientX が rect.left 〜 rect.right の範囲にある列を特定
- dayIndex (0-6) を返す
**Related Stories**: US1

### FR-002: 日付の計算 [P1]
**Description**: 元の日付と新しい dayIndex から、新しい startAt/endAt を計算する
**Acceptance**:
- 元の日付が月曜日（dayIndex: 0）、新しい dayIndex が 2 → 水曜日
- startAt/endAt の日付部分を変更、時刻部分は維持（F4で変更された時刻を使用）
**Related Stories**: US1, US2

### FR-003: 2次元ドラッグの統合 [P1]
**Description**: F4 の上下ドラッグと F5 の左右ドラッグを統合し、deltaX と deltaY を同時に処理
**Acceptance**:
- pointermove で deltaX → dayIndex 判定
- pointermove で deltaY → minutes 計算
- 両方を組み合わせて新しい startAt/endAt を生成
**Related Stories**: US2

### FR-004: 列ハイライトの制御 [P1]
**Description**: ドラッグ中にホバーしている DayColumn に `.dropTarget` クラスを追加
**Acceptance**:
- ドラッグ開始時: 全列の `.dropTarget` を削除
- pointermove 時: 現在の列にのみ `.dropTarget` を追加
- ドロップ時: 全列の `.dropTarget` を削除
**Related Stories**: US3

### FR-005: 週範囲内の制限 [P2]
**Description**: dayIndex が 0-6 の範囲外にならないようクランプする
**Acceptance**:
- dayIndex < 0 → dayIndex = 0
- dayIndex > 6 → dayIndex = 6
**Related Stories**: US4

### FR-006: duration の維持 [P1]
**Description**: F4 と同様、日付移動でも duration (endAt - startAt) は変更しない
**Acceptance**:
- 元の duration: 60分 → 日付移動後も 60分
**Related Stories**: US1, US2

## Data Model

### Drag State (F4 からの拡張)

```typescript
type DragState = {
  isDragging: boolean;
  startX: number;           // ドラッグ開始時のマウスX座標 (新規)
  startY: number;           // ドラッグ開始時のマウスY座標 (F4)
  startMinutes: number;     // ドラッグ開始時のイベント開始分 (F4)
  startDayIndex: number;    // ドラッグ開始時の日付列インデックス (新規)
  originalEvent: CalendarEvent;  // Escape用 (F4)
};
```

### Hook Interface (F4 からの拡張)

```typescript
const useDragEvent = (
  event: CalendarEvent,
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void,
  hourHeight: number,
  dayColumns: DayInfo[],    // 新規: 7日分の情報
  dayColumnRefs: React.RefObject<HTMLDivElement>[]  // 新規: 列の DOM 参照
) => {
  // F4 の処理に加えて:
  // - deltaX から dayIndex を判定
  // - 列ハイライトの追加・削除
  // - 日付変更の計算
};
```

## Edge Cases

### Case 1: 週の範囲外にドラッグ
**Behavior**: 月曜日より左、日曜日より右にはドラッグできない（dayIndex でクランプ）
**Reason**: 週の切り替え機能がないため

### Case 2: ドラッグ中に別のイベントと重なる
**Behavior**: 重なりを許可し、F2 の重なり処理で自動的にレイアウト調整
**Reason**: F4 と同じ（衝突判定はスコープ外）

### Case 3: 異なる日の列幅が異なる場合
**Behavior**: getBoundingClientRect() で実際の幅を取得するため問題なし
**Reason**: 列幅はすべて同じ（flex: 1 or grid-template-columns: repeat(7, 1fr)）

### Case 4: ドラッグ開始列とドロップ列が同じ
**Behavior**: 時刻のみ変更される（F4 の動作と同じ）
**Reason**: dayIndex が変わらないため、日付変更は発生しない

### Case 5: 今日の列から別の日に移動
**Behavior**: 移動可能（制限なし）
**Reason**: 過去・未来の日付への移動も許可

## Success Criteria

### User Experience
- **ドラッグの滑らかさ**: 2次元ドラッグが自然に感じられる
- **列ハイライトの視認性**: ドロップ先が明確に分かる

### System Performance
- **ドラッグ応答性**: F4 と同じく 60fps を維持
- **列ハイライトの遅延**: pointermove から列ハイライト更新まで < 16ms

### Business Impact (Technical Validation)
- **F4 との統合の複雑さ**: コード変更量を記録（目標: F4 に +50行以内）
- **absolute vs Grid の実装差**: 列判定ロジックは共通、座標更新のみ異なる

## Non-Functional Requirements

### Performance
- **列ハイライトの最適化**: 毎フレーム全列を走査しない（前回の列と比較して変更時のみ更新）

### Usability
- **列ハイライトの色**: 薄い青（rgba(59, 130, 246, 0.1)）で主張しすぎない

### Maintainability
- **F4 との共通化**: useDragEvent フックを拡張し、F4 のロジックを維持

## Open Questions

- **Q1**: 週をまたぐドラッグ（前週・次週）は必要か？
  - **A**: スコープ外（週の切り替え機能自体が未実装）

- **Q2**: ドラッグ中に列の境界でスクロールするか？
  - **A**: しない（週ビューは固定幅）

## Out of Scope

- 週をまたぐドラッグ（前週・次週への移動）
- 列の境界での自動スクロール
- 複数イベントの一括日付移動
- ドラッグ中の衝突検出・警告
- 異なる週への移動（月ビュー等がないため）
