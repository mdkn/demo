# Calendar Comparison - Interactive Week Calendar

週間バーチカルカレンダーを2つの異なる CSS レイアウト手法（position: absolute vs CSS Grid Layout）で実装し、ドラッグ&ドロップ・リサイズ・イベント作成などインタラクティブ機能の実装の複雑さ・パフォーマンス・拡張性を技術検証・学習目的で比較するプロジェクト。

## 技術スタック

- **React** 19.0.0 - 関数コンポーネント + Hooks
- **TypeScript** 5.6.2 - strict mode 有効
- **Vite** 6.0.7 - 開発サーバー・ビルドツール
- **date-fns** 4.1.0 - 日付操作ライブラリ
- **Vitest** 4.0.18 - ユニットテストフレームワーク
- **CSS Modules** - スタイリング（CSS-in-JS は不使用）

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

### インストール

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで開く
# http://localhost:5173 (または別のポート)
```

### ビルド

```bash
# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

### テスト

```bash
# ユニットテストの実行
npm test

# ビルドチェック（TypeScript strict mode）
npm run build
```

## プロジェクト構成

```
src/
├── shared/                         # 両方式で共通のコード
│   ├── types.ts                   # 型定義
│   ├── constants.ts               # 定数
│   ├── sampleEvents.ts            # サンプルイベントデータ
│   ├── utils/
│   │   ├── dateUtils.ts           # 日付操作ユーティリティ
│   │   ├── eventUtils.ts          # イベント処理ユーティリティ
│   │   └── dragUtils.ts           # ドラッグ&ドロップユーティリティ (F4/F5/F6/F7)
│   ├── hooks/
│   │   ├── useCalendarEvents.ts   # イベント管理フック (localStorage 永続化)
│   │   └── useCurrentTime.ts      # 現在時刻フック (F3)
│   └── components/
│       ├── WeekHeader.tsx         # 週ヘッダー
│       ├── TimeLabels.tsx         # 時間ラベル
│       ├── Toolbar.tsx            # 方式切替ツールバー
│       └── Tooltip.tsx            # ツールチップ (F6)
│
├── absolute/                       # position: absolute 方式
│   ├── AbsoluteWeekView.tsx
│   ├── hooks/
│   │   ├── useAbsoluteLayout.ts   # イベント配置計算 (F2)
│   │   ├── useDragEvent.ts        # 時間ドラッグ (F4)
│   │   ├── useDragDate.ts         # 日付ドラッグ (F5)
│   │   ├── useResizeEvent.ts      # リサイズ (F6)
│   │   └── useCreateEvent.ts      # イベント作成 (F7)
│   └── components/
│       ├── DayColumn.tsx
│       ├── GridLines.tsx
│       ├── EventBlock.tsx         # イベントブロック (F2/F4/F5/F6)
│       ├── NowIndicator.tsx       # 現在時刻インジケーター (F3)
│       ├── ResizeHandle.tsx       # リサイズハンドル (F6)
│       └── CreationPlaceholder.tsx # イベント作成プレースホルダー (F7)
│
└── grid/                           # CSS Grid Layout 方式
    ├── GridWeekView.tsx
    ├── hooks/
    │   ├── useGridLayout.ts       # イベント配置計算 (F2)
    │   ├── useDragEvent.ts        # 時間ドラッグ (F4)
    │   ├── useDragDate.ts         # 日付ドラッグ (F5)
    │   ├── useResizeEvent.ts      # リサイズ (F6)
    │   └── useCreateEvent.ts      # イベント作成 (F7)
    └── components/
        ├── DayGrid.tsx
        ├── EventBlock.tsx         # イベントブロック (F2/F4/F5/F6)
        ├── NowIndicator.tsx       # 現在時刻インジケーター (F3)
        ├── ResizeHandle.tsx       # リサイズハンドル (F6)
        └── CreationPlaceholder.tsx # イベント作成プレースホルダー (F7)
```

## 機能

### ✅ 実装済み機能

#### F1: 週間タイムグリッド描画
- **週間タイムグリッド**: 7日分（月〜日）× 24時間（0:00〜24:00）
- **2つの実装方式**:
  - **Absolute 方式**: `position: absolute` + flex layout
  - **Grid 方式**: CSS Grid Layout (`grid-template-rows/columns`)
- **方式切替**: Toolbar で3つのモード切替（Absolute / Grid / 並列表示）
- **週ヘッダー**: 各日の曜日と日付表示
- **時間ラベル**: 左端に 0:00〜23:00 表示
- **グリッド線**: 1時間ごとの水平線、各日の間の垂直線
- **スクロール機能**: 初回表示時に 8:00 付近に自動スクロール
- **今日のハイライト**: 今日の列を `filter: brightness(1.05)` で強調

#### F2: イベント配置と重なり処理
- **イベント表示**: タイトル・時間範囲・色付き背景
- **重なり検出**: 時間が重複するイベントを自動検出
- **レイアウトアルゴリズム**:
  - **Absolute**: 幅を分割して並列配置 (`width: 1/n`, `left: offset`)
  - **Grid**: 列を動的生成して配置 (`grid-column`, LCM計算)
- **イベントデータ永続化**: localStorage でイベントを保存

#### F3: 現在時刻インジケーター
- **リアルタイム更新**: 1分ごとに現在時刻を更新
- **視覚的表示**: 赤い水平線で現在時刻を表示
- **今日のみ表示**: 今日の日付列にのみインジケーターを表示

#### F4: ドラッグ&ドロップ（時間移動）
- **Pointer Events API**: pointerdown/move/up でドラッグ検出
- **15分スナップ**: 時間を15分単位に自動スナップ
- **範囲制約**: 0:00〜24:00 内に制限
- **ドラッグ中プレビュー**: ドラッグ中は半透明表示
- **stopPropagation**: イベント伝播を防止してドラッグの競合を回避

#### F5: ドラッグ&ドロップ（日付移動）
- **日付間ドラッグ**: イベントを別の日にドラッグ移動
- **列ハイライト**: ドラッグ中のドロップターゲット列をハイライト
- **日付計算**: 元の時刻を保持したまま日付のみ変更
- **キャンセル**: Escape キーでドラッグをキャンセル

#### F6: リサイズ（時間変更）
- **上下エッジリサイズ**: イベントの上端・下端をドラッグして時間変更
- **リサイズハンドル**: 8px の専用ハンドル領域（`ns-resize` カーソル）
- **15分スナップ**: リサイズ中も15分単位にスナップ
- **15分最小継続時間**: イベントは最低15分以上
- **リサイズ中ツールチップ**: 開始〜終了時刻をリアルタイム表示
- **stopPropagation**: ドラッグとの競合を回避

#### F7: クリックによるイベント作成
- **シングルクリック作成**: 空白領域をクリックして1時間イベントを作成
- **ドラッグ選択**: 空白領域をドラッグして任意の時間範囲を指定
- **インラインタイトル入力**: プレースホルダー上で直接タイトルを入力
- **Enter で確定**: Enter キーでイベントを保存
- **Escape でキャンセル**: Escape キーで作成をキャンセル
- **外部クリックキャンセル**: プレースホルダー外をクリックでキャンセル
- **デフォルトタイトル**: 空白の場合「新しいイベント」を設定
- **衝突検出**: 既存イベント上のクリックを無視

## 開発プロセス

このプロジェクトは Spec-Kit ワークフローに従って開発されています。各機能（F1〜F7）ごとに以下のドキュメントを作成:

```
specs/
├── 001-week-timegrid/      # F1: 週間タイムグリッド
├── 002-event-layout/       # F2: イベント配置
├── 003-now-indicator/      # F3: 現在時刻インジケーター
├── 004-drag-time/          # F4: 時間ドラッグ
├── 005-drag-date/          # F5: 日付ドラッグ
├── 006-resize/             # F6: リサイズ
└── 007-click-create/       # F7: クリック作成
    ├── spec.md             # 機能仕様（WHAT & WHY）
    ├── plan.md             # 実装計画（HOW）
    └── tasks.md            # タスクリスト（チェックボックス）
```

### Spec-Kit ワークフロー

1. **`/speckit.spec`**: 機能仕様を作成（ユーザーストーリー・受入基準）
2. **`/speckit.plan`**: 実装計画を作成（技術選定・アーキテクチャ）
3. **`/speckit.tasks`**: タスクリストを生成（優先度・依存関係）
4. **`/speckit.implement`**: タスクを順次実装
5. **手動テスト**: 受入基準を確認

## 憲法原則（Constitution）

このプロジェクトは以下の原則に従って開発されています:

1. **Simplicity First (NON-NEGOTIABLE)**: YAGNI 厳守、外部ライブラリは date-fns のみ
2. **Strict Scope Adherence**: スコープ外機能は実装しない
3. **Separation of Concerns**: shared/ と方式別コードの境界を厳格に守る
4. **Fair Comparison Environment**: 両方式で同一の見た目と動作
5. **TypeScript Strict Mode**: 型安全性の確保

詳細は `.claude/projects/-Users-mdkn-src-demo/memory/constitution.md` を参照。

## 技術的ハイライト

### イベント配置アルゴリズム (F2)

**Absolute 方式**:
```typescript
// 重なるイベントをグループ化
// 各イベントの幅 = 1 / グループ内の最大同時イベント数
// left オフセット = 列インデックス × 幅
width: `${100 / maxConcurrent}%`
left: `${(columnIndex / maxConcurrent) * 100}%`
```

**Grid 方式**:
```typescript
// 全イベントグループの列数の最小公倍数 (LCM) を計算
// 各イベントに開始列と列幅を割り当て
grid-template-columns: repeat(${lcm}, 1fr)
grid-column: ${startCol} / span ${colSpan}
```

### Pointer Events API によるドラッグ実装 (F4/F5/F6)

```typescript
// ポインターキャプチャで確実なドラッグ追跡
onPointerDown: (e) => {
  e.currentTarget.setPointerCapture(e.pointerId);
  // ドラッグ開始
}

// stopPropagation で競合回避
onPointerDown: (e) => {
  e.stopPropagation(); // 親のハンドラーを防止
}
```

### 時間計算ユーティリティ (dragUtils.ts)

- `pxToMinutes()`: ピクセル → 分変換
- `minutesToPx()`: 分 → ピクセル変換
- `snapToMinutes()`: 15分スナップ
- `clampMinutes()`: 0:00〜24:00 範囲制約
- `calculateNewTime()`: 日付保持で時刻のみ変更
- `calculateNewDate()`: 時刻保持で日付のみ変更
- `calculateDateTime()`: 日付 + 分から ISO 8601 生成

### localStorage による永続化 (useCalendarEvents.ts)

```typescript
// 初回: サンプルデータで初期化
// 以降: localStorage から復元
// 変更時: 自動で localStorage に保存
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}, [events]);
```

## パフォーマンス検証

### 計測方法

```bash
# 開発サーバー起動
npm run dev

# Chrome DevTools を開く
# Components タブ → Profiler タブ
# Record ボタンでレンダリングを計測
```

### 目標値

- ✅ 初回レンダリング: < 1秒（両方式とも達成）
- ✅ イベント100個でも60fps維持
- ✅ ドラッグ操作の遅延 < 16ms
- ✅ リサイズ操作の遅延 < 16ms

## 比較ポイント

両方式の実装比較:

| 観点 | Absolute 方式 | Grid 方式 |
|------|---------------|-----------|
| **コード量** | シンプル | やや複雑 |
| **グリッド線** | DOM 要素（24個） | CSS背景（repeating-linear-gradient） |
| **縦配置** | `top` ピクセル指定 | `grid-row` |
| **横配置** | `width` 分割 + `left` オフセット | `grid-column` 動的生成 |
| **重なり処理** | 幅計算のみ | LCM計算で列数決定 |
| **ドラッグ&ドロップ** | 同じ（Pointer Events API） | 同じ（Pointer Events API） |
| **リサイズ** | `top`/`height` 変更 | `grid-row` 変更 |
| **イベント作成** | `position: absolute` | `grid-row` 配置 |
| **パフォーマンス** | 高速（シンプル） | 高速（CSS最適化） |
| **拡張性** | ピクセル計算が必要 | Grid定義が柔軟 |

## インタラクション仕様

### キーボードショートカット
- **Escape**: ドラッグ・リサイズ・作成をキャンセル
- **Enter**: イベント作成時にタイトルを確定

### マウス操作
- **シングルクリック（空白）**: 1時間イベントを作成
- **ドラッグ（空白）**: カスタム時間範囲でイベントを作成
- **ドラッグ（イベント本体）**: 時間移動または日付移動
- **ドラッグ（上端/下端）**: 開始時刻/終了時刻をリサイズ
- **外部クリック**: イベント作成をキャンセル

### 時間制約
- **スナップ**: 15分単位
- **最小継続時間**: 15分
- **範囲**: 0:00〜24:00（1日の境界内）

## 参考文献

このプロジェクトの F2（イベント配置と重なり処理）のアルゴリズムは、以下の記事を参考にしています:

- [カレンダーUIにおける予定の重なり表示アルゴリズム - TimeTree開発者ブログ](https://zenn.dev/timetree/articles/5bc01beae5fd60)
  - イベントの重なり検出とレイアウトアルゴリズムの実装例
  - 本プロジェクトでは Absolute 方式と Grid 方式で異なるアプローチを採用

## ライセンス

MIT

## 開発者

このプロジェクトは技術検証・学習目的で作成されました。
