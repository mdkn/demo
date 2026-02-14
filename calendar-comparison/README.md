# Calendar Comparison - Week Time Grid (F1)

週間バーチカルカレンダーの基盤となるタイムグリッドを2つの異なる CSS レイアウト手法（position: absolute vs CSS Grid Layout）で実装し、実装の複雑さ・パフォーマンス・拡張性を技術検証・学習目的で比較するプロジェクト。

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
├── shared/                    # 両方式で共通のコード
│   ├── types.ts              # 型定義
│   ├── constants.ts          # 定数
│   ├── utils/
│   │   └── dateUtils.ts      # 日付操作ユーティリティ
│   └── components/
│       ├── WeekHeader.tsx    # 週ヘッダー
│       ├── TimeLabels.tsx    # 時間ラベル
│       └── Toolbar.tsx       # 方式切替ツールバー
│
├── absolute/                  # position: absolute 方式
│   ├── AbsoluteWeekView.tsx
│   └── components/
│       ├── DayColumn.tsx
│       └── GridLines.tsx
│
└── grid/                      # CSS Grid Layout 方式
    ├── GridWeekView.tsx
    └── components/
        └── DayGrid.tsx
```

## 機能

### 実装済み (F1)

- ✅ **週間タイムグリッド描画**: 7日分（月〜日）× 24時間（0:00〜24:00）のグリッド
- ✅ **2つの実装方式**:
  - **Absolute 方式**: `position: absolute` + flex layout
  - **Grid 方式**: CSS Grid Layout (`grid-template-rows/columns`)
- ✅ **方式切替**: Toolbar で3つのモード切替
  - Absolute のみ
  - Grid のみ
  - 並列表示（side-by-side）
- ✅ **週ヘッダー**: 各日の曜日と日付表示
- ✅ **時間ラベル**: 左端に 0:00〜23:00 表示
- ✅ **グリッド線**: 1時間ごとの水平線、各日の間の垂直線
- ✅ **スクロール機能**: 初回表示時に 8:00 付近に自動スクロール
- ✅ **今日のハイライト**: 今日の列を `filter: brightness(1.05)` で強調

## 憲法原則（Constitution）

このプロジェクトは以下の原則に従って開発されています:

1. **Simplicity First (NON-NEGOTIABLE)**: YAGNI 厳守、外部ライブラリは date-fns のみ
2. **Strict Scope Adherence**: スコープ外機能は実装しない
3. **Separation of Concerns**: shared/ と方式別コードの境界を厳格に守る
4. **Fair Comparison Environment**: 両方式で同一の見た目と動作
5. **TypeScript Strict Mode**: 型安全性の確保

詳細は [.specify/memory/constitution.md](../.specify/memory/constitution.md) を参照。

## パフォーマンス検証

### React Profiler での計測

```bash
# 開発サーバー起動
npm run dev

# Chrome DevTools を開く
# Components タブ → Profiler タブ
# Record ボタンでレンダリングを計測
```

### 目標値

- ✅ 初回レンダリング: < 1秒（両方式とも達成）
- ✅ 6つのユニットテスト: 全て passing

## 比較ポイント

両方式の比較観点:

| 観点 | Absolute 方式 | Grid 方式 |
|------|---------------|-----------|
| **コード量** | シンプル | やや複雑 |
| **グリッド線** | DOM 要素（24個） | CSS背景（repeating-linear-gradient） |
| **縦配置** | `top` ピクセル指定 | `grid-row` |
| **横配置** | `flex: 1` | `grid-column` |
| **スクロール** | 通常のスクロール | 通常のスクロール |
| **パフォーマンス** | 高速 | 高速 |

## 今後の拡張（スコープ外）

以下の機能は F1 のスコープ外であり、今後の機能（F2〜F7）で実装予定:

- F2: イベント配置と重なり処理
- F3: 現在時刻インジケーター
- F4: ドラッグ&ドロップ（時間移動）
- F5: ドラッグ&ドロップ（日付移動）
- F6: リサイズ（時間変更）
- F7: クリックによるイベント作成

## ライセンス

MIT

## 開発者

このプロジェクトは技術検証・学習目的で作成されました。
