# Feature Specification: イベント配置（静的描画）

**Feature ID**: F2
**Branch**: feature/002-event-placement
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F1 (週間タイムグリッド描画)

## Overview

週間タイムグリッド上に CalendarEvent を時刻に基づいて配置し、同一時間帯に複数のイベントが重なる場合に横幅を分割して表示する。localStorage からイベントを読み込み、サンプルデータで重なりパターンを検証する。

## User Stories

### [US1] [P1] イベントの時刻ベース配置

**As a** カレンダーユーザー
**I want** イベントが開始・終了時刻に対応する位置に正確に表示される
**So that** 1日のスケジュールを視覚的に把握できる

**Acceptance Criteria**:
- Given: CalendarEvent が `startAt: "2026-02-14T09:00:00"`, `endAt: "2026-02-14T12:00:00"` で定義されている
- When: 2026年2月14日の週間ビューを表示
- Then: イベントが 9:00 の位置から始まり、12:00 の位置で終わる（高さ 180px = 3時間 × 60px）

**Independent Testability**: 重なりのないイベント1件のみを表示し、top/height または grid-row が正しいことを確認

### [US2] [P1] 重なりイベントの横幅分割

**As a** カレンダーユーザー
**I want** 同じ時間帯に複数のイベントがある場合、横に並べて全て表示される
**So that** ダブルブッキングや並行タスクを把握できる

**Acceptance Criteria**:
- Given: Event1 (9:00-12:00), Event2 (10:00-12:00), Event3 (11:00-13:00) が同一日に存在
- When: その日を含む週間ビューを表示
- Then: 10:00-12:00 の時間帯で 3 つのイベントが横に並び、それぞれ約 33% の幅を持つ

**Independent Testability**: サンプルデータの重なり数 = 4 のゾーン (Event1, 2, 3, 5) で 4 カラム表示を確認

### [US3] [P2] localStorage からのイベント読み込み

**As a** カレンダーユーザー
**I want** ブラウザをリロードしても作成したイベントが保持される
**So that** データを失わずに作業を継続できる

**Acceptance Criteria**:
- Given: localStorage に `calendar-events` キーでイベントデータが保存されている
- When: アプリを再読み込み
- Then: 保存されていたイベントがグリッド上に再表示される

**Independent Testability**: localStorage に手動で JSON を保存し、リロード後に表示を確認

### [US4] [P2] サンプルデータのリセット

**As a** 開発者/検証者
**I want** リセットボタンでサンプルデータに戻せる
**So that** 重なりパターンを繰り返し検証できる

**Acceptance Criteria**:
- Given: localStorage に任意のイベントデータが保存されている
- When: リセットボタンをクリック
- Then: サンプルデータ（8件）に置き換わり、グリッド上に再表示される

**Independent Testability**: Toolbar の Reset ボタンをクリックし、サンプルイベント 8 件が表示されることを確認

## Functional Requirements

### FR-001: 縦位置の計算 [P1]
**Description**: イベントの `startAt` から当日 0:00 からの経過分を計算し、縦位置（top または grid-row-start）を決定する
**Acceptance**:
- 9:00 開始 → 540分 → top: 540px (absolute) or grid-row-start: 540 (grid)
- 14:30 開始 → 870分 → top: 870px or grid-row-start: 870
**Related Stories**: US1

### FR-002: 高さの計算 [P1]
**Description**: `endAt - startAt` の分数から高さ（height または grid-row span）を計算する
**Acceptance**:
- 3時間 (180分) → height: 180px or grid-row: span 180
- 15分 → height: 15px or grid-row: span 15（最小表示高さ）
**Related Stories**: US1

### FR-003: 重なり検出 [P1]
**Description**: 同一日の全イベントを時系列でスキャンし、重なり関係を検出する
**Algorithm**: `eventA.start < eventB.end && eventB.start < eventA.end`
**Acceptance**: Event1 (9:00-12:00) と Event2 (10:00-12:00) は重なりあり、Event4 (14:00-15:00) とは重ならない
**Related Stories**: US2

### FR-004: カラム割り当て [P1]
**Description**: 重なるイベント群を開始時刻順にソートし、空いている列（カラム）に順次割り当てる
**Acceptance**:
- Event1 → col 0
- Event2 (Event1と重なる) → col 1
- Event3 (Event1, 2と重なる) → col 2
- Event5 (Event1, 2, 3と重なる) → col 3
**Related Stories**: US2

### FR-005: 横幅の計算 [P1]
**Description**: カラム割り当て結果から、各イベントの横幅（width または grid-column span）を決定する
**Acceptance**:
- 重なり数 4 → width: 25% or grid-column: span 1（サブグリッド 4列のうち1列）
**Related Stories**: US2

### FR-006: LCM 統合（Grid 方式のみ） [P2]
**Description**: Grid 方式で異なる重なり数のゾーンが混在する場合、LCM（最小公倍数）で列数を統一する
**Acceptance**: 重なり数 3 と 4 のゾーンが混在 → LCM(3, 4) = 12 列の Grid を生成
**Related Stories**: US2
**Note**: absolute 方式ではパーセント幅のため不要

### FR-007: localStorage CRUD [P2]
**Description**: `useCalendarEvents` フックで localStorage の読み書きを管理する
**Acceptance**:
- 初回起動: localStorage なし → サンプルデータで初期化
- リロード: localStorage あり → 保存データを読み込み
- リセット: `resetEvents()` 呼び出し → サンプルデータで上書き
**Related Stories**: US3, US4

### FR-008: 日付フィルタリング [P1]
**Description**: 表示中の週（7日間）に含まれるイベントのみをフィルタリングする
**Acceptance**: 2026-02-14 の週を表示中、2026-02-21 のイベントは表示されない
**Related Stories**: US1

## Data Model

### Entity: CalendarEvent

```typescript
type CalendarEvent = {
  id: string;              // UUID (crypto.randomUUID())
  title: string;           // イベント名
  startAt: string;         // ISO 8601 形式 (例: "2026-02-14T09:00:00")
  endAt: string;           // ISO 8601 形式
  color: string;           // CSS color (例: "#3b82f6")
};
```

**Relationships**: なし（単一エンティティ）
**Validation**:
- `startAt < endAt` （開始 < 終了）
- `endAt - startAt >= 15分` （最小イベント長）
- `id` は重複不可

### Entity: EventLayout (方式別の出力型)

**Absolute 方式**:
```typescript
type AbsoluteEventLayout = {
  top: number;             // px
  left: string;            // パーセント（例: "25%"）
  width: string;           // パーセント（例: "25%"）
  height: number;          // px
  dayIndex: number;        // 0-6（月曜=0）
};
```

**Grid 方式**:
```typescript
type GridEventLayout = {
  gridRow: string;         // "540 / span 180"
  gridColumn: string;      // "2 / span 3"（日列 + カラム内位置）
  dayIndex: number;        // 0-6
};
```

### Storage Schema (localStorage)

**Key**: `calendar-events`
**Value**: `JSON.stringify(CalendarEvent[])`

**Example**:
```json
[
  {
    "id": "a1b2c3d4",
    "title": "Meeting",
    "startAt": "2026-02-14T09:00:00",
    "endAt": "2026-02-14T10:00:00",
    "color": "#3b82f6"
  }
]
```

## Edge Cases

### Case 1: 15分未満のイベント
**Behavior**: 最小表示高さ 15px (15分相当) で描画する
**Reason**: それ未満では視認性が低下しクリック不可能になる

### Case 2: 0:00 をまたぐイベント
**Behavior**: スコープ外（複数日イベント）として扱わない
**Reason**: 仕様上、単一日内のイベントのみ対応

### Case 3: 同一時刻に開始する複数イベント
**Behavior**: 開始時刻が同じ場合、ID の辞書順でソート
**Reason**: カラム割り当ての決定性を保証

### Case 4: 完全に重なるイベント（開始・終了が同じ）
**Behavior**: 2 カラムに分割し、両方とも幅 50%
**Reason**: 重なり検出ロジックで同一時刻も重なりと判定

### Case 5: 重なり数が時間帯ごとに変化
**Example**: 9:00-10:00 (2件), 10:00-11:00 (4件), 11:00-12:00 (2件)
**Behavior**:
- absolute: 各ゾーンで最大重なり数の幅（25%）を適用
- Grid: LCM で統一（grid-template-columns の列数を固定）

### Case 6: localStorage が破損
**Behavior**: JSON.parse エラー時はサンプルデータで初期化
**Reason**: データ損失よりアプリの動作継続を優先

## Success Criteria

### User Experience
- **イベント視認性**: 15分のイベントでもタイトルが読める（最小 font-size: 10px）
- **重なり判別**: 4件重なりのゾーンで全てのイベントがクリック可能

### System Performance
- **初回レンダリング**: 100件のイベント描画が 500ms 以内（React Profiler 計測）
- **重なり計算**: 100件のイベントで重なり検出 + カラム割り当てが 50ms 以内

### Business Impact (Technical Validation)
- **absolute vs Grid の複雑さ比較**: 重なり処理のコード行数を比較（目標: ±20% 以内）
- **side-by-side 表示**: 両方式で同一データを表示し、見た目の差異が 2px 以内

## Non-Functional Requirements

### Performance
- **メモリ使用量**: 100件のイベントで増加量 10MB 以内
- **再レンダリング**: イベント追加時、変更されたイベントのみ再レンダリング（React.memo 適用）

### Usability
- **エラーメッセージ**: localStorage 読み込み失敗時、コンソールにエラーログを出力
- **視覚的フィードバック**: イベントにホバー時、カーソルを pointer に変更

### Maintainability
- **コードの共通化率**: 重なり検出・座標変換ロジックの 100% を `shared/utils/` に配置
- **型安全性**: TypeScript strict mode でエラーゼロ

## Open Questions

- **Q1**: 重なり数が 10 件を超えた場合、Grid の列数上限をどうするか？
  - **A**: 現時点ではサンプルデータが最大 4 件重なりなので、F2 のスコープ外。F4 以降で検討

- **Q2**: absolute 方式で LCM 統合は必要か？
  - **A**: 不要。パーセント幅で動的に調整可能なため

## Out of Scope

- イベントの作成・編集・削除（F7 で実装）
- ドラッグ&ドロップ（F4, F5 で実装）
- リサイズ（F6 で実装）
- 現在時刻インジケーター（F3 で実装）
- 色の選択 UI（サンプルデータの color をそのまま使用）
- イベントの検索・フィルタリング
- 週の切り替え（前週・次週のナビゲーション）
