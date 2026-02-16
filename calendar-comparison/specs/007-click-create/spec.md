# Feature Specification: クリックによるイベント作成

**Feature ID**: F7
**Branch**: feature/007-click-create
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F2 (イベント配置)

## Overview

グリッドの空白領域をクリックまたはドラッグ選択して新規イベントを作成する。クリック位置から時刻と日付を判定し、インライン入力欄でタイトルを入力後、Enter で確定する。

## User Stories

### [US1] [P1] シングルクリックでイベント作成

**As a** カレンダーユーザー
**I want** 空白領域をクリックするとその時刻に1時間のイベントが作成される
**So that** 素早く予定を追加できる

**Acceptance Criteria**:
- Given: 月曜日の 10:00 付近の空白領域をクリック
- When: クリックを離す
- Then: 10:00-11:00 のプレースホルダーイベントが表示され、タイトル入力欄にフォーカス

**Independent Testability**: click イベントをシミュレートし、プレースホルダーが正しい位置に表示されることを確認

### [US2] [P1] ドラッグ選択で時間範囲指定

**As a** カレンダーユーザー
**I want** 空白領域をドラッグして開始〜終了時刻を範囲指定できる
**So that** 長い会議も一度の操作で作成できる

**Acceptance Criteria**:
- Given: 月曜日の 10:00 から 12:00 までドラッグ
- When: ドラッグを離す
- Then: 10:00-12:00 のプレースホルダーイベントが表示され、タイトル入力欄にフォーカス

**Independent Testability**: pointerdown → pointermove → pointerup をシミュレートし、選択範囲が正しいことを確認

### [US3] [P1] タイトル入力と確定

**As a** カレンダーユーザー
**I want** プレースホルダー上でタイトルを入力し、Enter で確定できる
**So that** イベントが保存される

**Acceptance Criteria**:
- Given: プレースホルダーが表示され、入力欄にフォーカスがある
- When: "会議" と入力して Enter を押す
- Then: タイトル "会議" のイベントが作成され、localStorage に保存される

**Independent Testability**: 入力欄に値を設定し、Enter キーイベントをシミュレートして addEvent が呼ばれることを確認

### [US4] [P2] Escape でキャンセル

**As a** カレンダーユーザー
**I want** Escape キーを押すと作成をキャンセルできる
**So that** 誤操作時にプレースホルダーを削除できる

**Acceptance Criteria**:
- Given: プレースホルダーが表示されている
- When: Escape キーを押す
- Then: プレースホルダーが消え、イベントは作成されない

**Independent Testability**: Escape キーイベントをシミュレートし、プレースホルダーが削除されることを確認

### [US5] [P2] 入力欄外クリックでキャンセル

**As a** カレンダーユーザー
**I want** 入力欄外をクリックすると作成をキャンセルできる
**So that** 別の操作に移れる

**Acceptance Criteria**:
- Given: プレースホルダーが表示されている
- When: グリッドの別の場所をクリック
- Then: プレースホルダーが消え、イベントは作成されない

**Independent Testability**: プレースホルダー外の領域でクリックイベントをシミュレートし、キャンセルされることを確認

## Functional Requirements

### FR-001: クリック位置の判定 [P1]
**Description**: クリック位置（clientX, clientY）から日付と時刻を計算する
**Acceptance**:
- clientY → pxToMinutes() → 開始分
- clientX → pxToDayIndex() → 日付列インデックス
- 15分スナップ
**Related Stories**: US1

### FR-002: ドラッグ選択の範囲計算 [P1]
**Description**: ドラッグ開始〜終了位置から時間範囲を計算する
**Acceptance**:
- startY, endY → startMinutes, endMinutes
- 小さい方が開始、大きい方が終了
- 15分スナップ
**Related Stories**: US2

### FR-003: プレースホルダーの描画 [P1]
**Description**: 半透明のプレースホルダーイベントを F2 のレイアウトで描画
**Acceptance**:
- background: rgba(59, 130, 246, 0.3)
- position: absolute (absolute) or grid-row (grid)
- z-index: 5（既存イベントより下）
**Related Stories**: US1, US2

### FR-004: インライン入力欄の表示 [P1]
**Description**: プレースホルダー内にテキスト入力欄を表示し、自動フォーカス
**Acceptance**:
- <input type="text" /> をプレースホルダー内に配置
- autoFocus で即座にフォーカス
- placeholder="イベント名"
**Related Stories**: US3

### FR-005: Enter キーで確定 [P1]
**Description**: 入力欄で Enter を押すと addEvent を呼び出し、プレースホルダーを削除
**Acceptance**:
- e.key === "Enter" → addEvent({ title, startAt, endAt, color })
- color はランダムまたは固定色
- id は crypto.randomUUID()
**Related Stories**: US3

### FR-006: Escape キーでキャンセル [P2]
**Description**: Escape を押すとプレースホルダーを削除し、入力をキャンセル
**Acceptance**:
- e.key === "Escape" → プレースホルダー state を null にする
**Related Stories**: US4

### FR-007: 入力欄外クリックでキャンセル [P2]
**Description**: プレースホルダー以外の領域をクリックするとキャンセル
**Acceptance**:
- useEffect で document に click リスナーを登録
- e.target が入力欄外 → プレースホルダー state を null
**Related Stories**: US5

### FR-008: 既存イベントとの衝突判定 [P2]
**Description**: クリック位置に既存イベントがある場合、作成しない
**Acceptance**:
- e.target が EventBlock の場合 → 何もしない
- e.target が DayColumn/DayGrid の背景の場合 → プレースホルダー作成
**Related Stories**: US1

### FR-009: デフォルト duration（1時間） [P1]
**Description**: シングルクリックの場合、1時間のイベントを作成
**Acceptance**:
- クリック位置の時刻 → 開始
- 開始 + 60分 → 終了
**Related Stories**: US1

## Data Model

### Creation State (コンポーネント内部状態)

```typescript
type CreationState = {
  isCreating: boolean;
  dayIndex: number;         // 0-6
  startMinutes: number;     // 0-1439
  endMinutes: number;       // 0-1439
  title: string;            // 入力中のタイトル
};
```

### Hook Interface

```typescript
const useCreateEvent = (
  onAdd: (event: Omit<CalendarEvent, 'id'>) => void,
  hourHeight: number,
  dayColumns: DayInfo[]
) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => void;
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => void;
  const handlePointerMove = (e: PointerEvent) => void;
  const handlePointerUp = (e: PointerEvent) => void;

  return {
    creationState: CreationState | null;
    placeholderElement: JSX.Element | null;
  };
};
```

## Edge Cases

### Case 1: 既存イベント上でクリック
**Behavior**: プレースホルダーを作成しない
**Reason**: FR-008（e.target が EventBlock の場合は無視）

### Case 2: ドラッグ選択が 15分未満
**Behavior**: 最小 15分（F6 と同じ）
**Reason**: duration < 15分 の場合、15分にクランプ

### Case 3: 24:00 を超える範囲選択
**Behavior**: endMinutes を 1440 にクランプ
**Reason**: F4 と同じ範囲制限

### Case 4: タイトルが空で Enter
**Behavior**: デフォルトタイトル "新しいイベント" で作成
**Reason**: 空タイトルを許可しない

### Case 5: ドラッグ選択中に既存イベントを通過
**Behavior**: プレースホルダーを描画し続ける（衝突は無視）
**Reason**: ドラッグ中の衝突判定は複雑化するため、作成後に F2 のレイアウト調整に任せる

### Case 6: 複数のプレースホルダーを同時作成
**Behavior**: 1つずつしか作成できない（既存のプレースホルダーがある場合は無視）
**Reason**: state は1つのみ

## Success Criteria

### User Experience
- **作成の速さ**: クリック → 入力 → Enter が 3秒以内で完了できる
- **ドラッグの滑らかさ**: プレースホルダーがリアルタイムで追従

### System Performance
- **プレースホルダーの描画**: 16ms 以内（60fps）
- **イベント作成後の再レンダリング**: 新規イベントのみ描画

### Business Impact (Technical Validation)
- **absolute vs Grid の実装難易度**: プレースホルダー描画のコード量を比較
- **F2 との統合**: 作成後のレイアウト調整が自動的に動作

## Non-Functional Requirements

### Performance
- **ドラッグ選択のスロットリング**: requestAnimationFrame で 60fps に制限

### Usability
- **入力欄のフォーカス**: プレースホルダー表示と同時に自動フォーカス
- **視覚的フィードバック**: ドラッグ中にプレースホルダーがリアルタイム表示

### Maintainability
- **F4 との共通化**: pxToMinutes, snapToMinutes を流用
- **F5 との共通化**: pxToDayIndex を流用

## Open Questions

- **Q1**: デフォルトの色はランダムか固定か？
  - **A**: 固定色（例: #3b82f6）で統一。色選択 UI はスコープ外

- **Q2**: タイトルが空の場合、イベントを作成するか？
  - **A**: デフォルトタイトル "新しいイベント" で作成

## Out of Scope

- イベントの色選択 UI
- タイトル以外のフィールド（説明、場所等）の入力
- 複数イベントの一括作成
- ドラッグ選択中の衝突検出
- 作成時のアニメーション
- ダブルクリックでの作成
