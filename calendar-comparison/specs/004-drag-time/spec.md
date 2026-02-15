# Feature Specification: ドラッグ&ドロップ（時間移動）

**Feature ID**: F4
**Branch**: feature/004-drag-time
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F2 (イベント配置)

## Overview

イベント要素を上下にドラッグして開始・終了時刻を変更する。ドラッグ中はマウスのY座標に追従し、15分単位でスナップする。Escapeキーでキャンセル可能。

## User Stories

### [US1] [P1] イベントの上下ドラッグ

**As a** カレンダーユーザー
**I want** イベントをマウスでドラッグして上下に移動できる
**So that** 会議の時間を簡単に変更できる

**Acceptance Criteria**:
- Given: Event1 が 9:00-10:00 に配置されている
- When: イベントの中央部分をクリックして下に 60px ドラッグ
- Then: イベントが 10:00-11:00 に移動する（duration 維持）

**Independent Testability**: ドラッグ開始（pointerdown）→ 移動（pointermove）→ ドロップ（pointerup）のイベントをシミュレートし、updateEvent が正しい時刻で呼ばれることを確認

### [US2] [P1] 15分単位のスナップ

**As a** カレンダーユーザー
**I want** ドラッグ時に 15分単位でスナップする
**So that** 中途半端な時刻（例: 9:03）にならず、整った時刻（9:00, 9:15, 9:30, 9:45）に設定できる

**Acceptance Criteria**:
- Given: イベントを自由にドラッグ中
- When: マウスが 9:07 の位置にある
- Then: イベントは 9:00 にスナップされる（最も近い 15分単位）

**Independent Testability**: pxToMinutes() の結果を 15で割った余りで丸め処理を確認

### [US3] [P1] ドラッグ中の視覚的フィードバック

**As a** カレンダーユーザー
**I want** ドラッグ中にイベントが半透明になる
**So that** 移動中であることが視覚的に分かる

**Acceptance Criteria**:
- Given: イベントをドラッグ開始
- When: ドラッグ中
- Then: opacity: 0.7, box-shadow が追加される

**Independent Testability**: ドラッグ中の className に `dragging` が追加されることを確認

### [US4] [P2] Escapeキーでキャンセル

**As a** カレンダーユーザー
**I want** Escapeキーを押すとドラッグをキャンセルできる
**So that** 誤操作時に元の位置に戻せる

**Acceptance Criteria**:
- Given: イベントをドラッグ中
- When: Escapeキーを押す
- Then: イベントが元の位置に戻り、updateEvent は呼ばれない

**Independent Testability**: keydown イベント（key: "Escape"）をシミュレートし、ドラッグ状態がリセットされることを確認

### [US5] [P2] 範囲制限（0:00〜24:00）

**As a** カレンダーユーザー
**I want** イベントを 0:00 より上や 24:00 より下にドラッグできない
**So that** 無効な時刻に設定されることを防げる

**Acceptance Criteria**:
- Given: Event1 が 0:30-1:30 に配置されている
- When: イベントを上に 60px ドラッグ（0:00 より上に移動しようとする）
- Then: イベントは 0:00-1:00 に制限される（それ以上上には行かない）

**Independent Testability**: 計算結果が 0 未満の場合 0 にクランプ、1440 以上の場合 (1440 - duration) にクランプされることを確認

## Functional Requirements

### FR-001: ドラッグ開始の検出 [P1]
**Description**: イベント要素の中央部分（上下端を除く）で pointerdown イベントを検出し、ドラッグ状態を開始する
**Acceptance**:
- リサイズハンドル領域（上端 8px, 下端 8px）以外でクリック → ドラッグ開始
- リサイズハンドル領域でクリック → ドラッグしない（F6 のリサイズ処理）
**Related Stories**: US1

### FR-002: ドラッグ中のマウス追従 [P1]
**Description**: pointermove イベントで clientY を取得し、コンテナ基準の相対位置を計算してイベントを移動
**Acceptance**:
- マウスY座標 - コンテナ offsetTop → 相対位置
- 相対位置 → 分に変換（pxToMinutes）
- 分 → 15分単位にスナップ
**Related Stories**: US1, US2

### FR-003: ドロップ時のイベント更新 [P1]
**Description**: pointerup イベントで最終位置を確定し、updateEvent コールバックを呼び出す
**Acceptance**:
- 新しい startAt = 元の日付 + 新しい分
- 新しい endAt = startAt + duration
- updateEvent(event.id, { startAt, endAt }) を呼び出し
**Related Stories**: US1

### FR-004: duration の維持 [P1]
**Description**: ドラッグで移動しても、イベントの長さ（endAt - startAt）は変更しない
**Acceptance**:
- 元の duration: 60分 → ドラッグ後も 60分
**Related Stories**: US1

### FR-005: 15分スナップの計算 [P1]
**Description**: 分を 15で割った余りを計算し、最も近い 15分単位に丸める
**Algorithm**:
```typescript
const snapToMinutes = (minutes: number, snap: number = 15): number => {
  return Math.round(minutes / snap) * snap;
};
```
**Acceptance**:
- 7分 → 0分, 8分 → 15分, 22分 → 15分, 23分 → 30分
**Related Stories**: US2

### FR-006: ドラッグ中の視覚スタイル [P1]
**Description**: ドラッグ中に `.dragging` クラスを追加し、opacity と box-shadow を変更
**Acceptance**:
- opacity: 0.7
- box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
- cursor: grabbing
**Related Stories**: US3

### FR-007: Escapeキーのハンドリング [P2]
**Description**: keydown イベント（key === "Escape"）を監視し、ドラッグをキャンセル
**Acceptance**:
- Escape押下 → イベント位置を元に戻す
- pointerup イベントをキャンセル（updateEvent を呼ばない）
**Related Stories**: US4

### FR-008: 範囲クランプ [P2]
**Description**: 計算結果が 0 未満または 1440 以上の場合、有効範囲内に制限
**Acceptance**:
- startMin < 0 → startMin = 0
- endMin > 1440 → startMin = 1440 - duration
**Related Stories**: US5

### FR-009: ポインターキャプチャ [P1]
**Description**: pointerdown 時に setPointerCapture を呼び出し、マウスが要素外に出てもドラッグを継続
**Acceptance**: ドラッグ中にマウスがウィンドウ外に出ても pointermove イベントを受信
**Related Stories**: US1

## Data Model

### Drag State (コンポーネント内部状態)

```typescript
type DragState = {
  isDragging: boolean;
  startY: number;           // ドラッグ開始時のマウスY座標
  startMinutes: number;     // ドラッグ開始時のイベント開始分
  originalEvent: CalendarEvent;  // Escape用に元のイベントを保持
};
```

### Hook Interface

```typescript
const useDragEvent = (
  event: CalendarEvent,
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void,
  hourHeight: number
) => {
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => void;
  const handlePointerMove = (e: PointerEvent) => void;
  const handlePointerUp = (e: PointerEvent) => void;
  const handleKeyDown = (e: KeyboardEvent) => void;

  return {
    isDragging: boolean;
    eventHandlers: {
      onPointerDown: handlePointerDown;
    };
  };
};
```

## Edge Cases

### Case 1: ドラッグ中に別のイベントと重なる
**Behavior**: 重なりを許可し、F2 の重なり処理で自動的に横幅調整される
**Reason**: ドラッグ中の衝突判定は複雑になるため、ドロップ後のレイアウト再計算に任せる

### Case 2: リサイズハンドル領域でのドラッグ開始
**Behavior**: ドラッグしない（F6 のリサイズ処理として扱う）
**Reason**: 上端 8px / 下端 8px はリサイズ専用領域

### Case 3: ドラッグ中に親コンテナがスクロール
**Behavior**: スクロールによる座標のずれは考慮しない（ドラッグ中のスクロールは非推奨）
**Reason**: スクロール検出とオフセット計算が複雑化するため、F4 のスコープ外

### Case 4: 複数イベントの同時ドラッグ
**Behavior**: 1つずつしかドラッグできない
**Reason**: 複数選択・一括移動は仕様外

### Case 5: ドラッグ中にブラウザウィンドウが非アクティブ
**Behavior**: pointerup イベントが失われる可能性がある → ドラッグ状態が残る
**Mitigation**: pointercancel イベントでクリーンアップ

### Case 6: 終日イベント（スコープ外）
**Behavior**: 対象外（F4 は時刻ベースのイベントのみ対応）

## Success Criteria

### User Experience
- **ドラッグの滑らかさ**: 60fps で描画され、カクつきがない
- **スナップの体感**: 15分単位のスナップが自然に感じられる

### System Performance
- **ドラッグ応答性**: pointermove から描画更新まで 16ms 以内（60fps）
- **メモリリーク**: ドラッグ終了後、イベントリスナーが正しく解放される

### Business Impact (Technical Validation)
- **absolute vs Grid の実装難易度**: ドラッグ処理のコード量を比較（目標: ±30行以内）
- **座標計算の自然さ**: absolute は top 直接操作、Grid は grid-row 更新の違いを検証

## Non-Functional Requirements

### Performance
- **ドラッグ中の再レンダリング**: ドラッグ中のイベントのみ更新し、他のイベントは再レンダリングしない
- **スロットリング**: pointermove は requestAnimationFrame で制御

### Usability
- **カーソル変化**: ドラッグ可能領域で `cursor: grab`、ドラッグ中は `cursor: grabbing`
- **視覚的フィードバック**: ドラッグ中の透明度とシャドウで状態を明示

### Maintainability
- **フックの分離**: useDragEvent フックを各方式ディレクトリに配置（座標計算ロジックが異なるため）
- **共通ユーティリティ**: snapToMinutes, clampMinutes は `shared/utils/` に配置

## Open Questions

- **Q1**: Grid 方式でドラッグ中に grid-row を毎フレーム更新するのはパフォーマンス的に問題ないか？
  - **A**: T015 で検証。問題があれば一時的に absolute に切り替える

- **Q2**: ドラッグ中に localStorage に自動保存するか？
  - **A**: しない。ドロップ時のみ updateEvent → localStorage 保存

## Out of Scope

- 左右方向のドラッグ（日付移動は F5 で実装）
- リサイズ（F6 で実装）
- イベントの複製（Ctrl+ドラッグ等）
- 複数イベントの一括ドラッグ
- ドラッグ中のスクロール自動化
- アニメーション（元の位置に戻る際の transition）
- タッチデバイス対応（Pointer Events で基本的には動作するが、検証はスコープ外）
