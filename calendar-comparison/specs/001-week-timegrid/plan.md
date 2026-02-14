# Implementation Plan: 週間タイムグリッド描画 (Week Time Grid Display)

**Branch**: `001-week-timegrid` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-week-timegrid/spec.md`

## Summary

週間バーチカルカレンダーの基盤となるタイムグリッドを実装する。7日分（月曜〜日曜）の列と24時間分（0:00〜24:00）の時間グリッドを描画し、position: absolute 方式と CSS Grid Layout 方式の2パターンで実装する。両方式で完全に同一の見た目と動作を提供し、実装の複雑さ・パフォーマンス・コードの書きやすさを比較検証する。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**:
- React 19.x (関数コンポーネント + Hooks)
- date-fns 4.x (日付操作)
- Vite 6.x (開発サーバー・ビルドツール)

**Storage**: N/A (この機能ではデータ永続化なし)
**Testing**: Vitest 3.x (共通ロジックのユニットテスト)
**Target Platform**: モダンブラウザ (Chrome, Firefox, Safari 最新版), デスクトップ幅 1024px 以上
**Project Type**: Web (単一 Vite アプリ、ディレクトリ分離方式)
**Performance Goals**:
- 初回レンダリング時間 1秒以内
- 100件のイベント描画時のレンダリング時間を React Profiler で計測（F2以降で使用）

**Constraints**:
- CSS-in-JS 禁止（CSS Modules のみ使用）
- DnD ライブラリ禁止（pointer events で自作）
- 状態管理ライブラリ禁止（useState/useReducer のみ）
- 外部ライブラリは date-fns のみ許可
- レスポンシブ対応不要（1024px 以上固定）

**Scale/Scope**:
- 7日 × 24時間のグリッド（合計 168 時間スロット）
- 1時間 = 60px（合計高さ 1440px）
- 両方式（absolute + Grid）の並列実装

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Simplicity First (NON-NEGOTIABLE)

- ✅ 機能要件書（spec.md）に明記された F1 機能のみ実装
- ✅ 外部ライブラリは date-fns のみ（DnD, 状態管理, CSS-in-JS は使用しない）
- ✅ 抽象化は最小限（両方式で共通化できる部分のみ shared/ に配置）
- ✅ コード行数を両方式で計測・比較する

### ✅ II. Strict Scope Adherence

- ✅ スコープ外事項を実装しない:
  - 週の切り替えナビゲーション
  - 月ビュー・年ビュー
  - レスポンシブ対応
  - アクセシビリティ（ARIA 属性）
  - アニメーション

### ✅ III. Separation of Concerns

- ✅ 共通コンポーネント: `shared/components/` (WeekHeader, TimeLabels)
- ✅ 共通ユーティリティ: `shared/utils/` (dateUtils.ts)
- ✅ 方式別実装: `absolute/` と `grid/` に分離
- ✅ 依存ルール遵守: shared/ は absolute/grid/ を import しない

### ✅ IV. Fair Comparison Environment

- ✅ 両方式で同一のコンポーネント構造
- ✅ side-by-side モードで並列表示可能
- ✅ 同一のサンプルデータ（今回はデータなし、グリッド構造のみ）
- ✅ React Profiler で計測可能な実装

### ✅ V. TypeScript Strict Mode

- ✅ tsconfig.json で strict: true を設定
- ✅ 全関数に明示的な戻り値の型
- ✅ any 禁止、イベントハンドラーは React 標準型を使用

**Gate Status**: ✅ **PASSED** - 全ての憲法原則に準拠

## Project Structure

### Documentation (this feature)

```text
specs/001-week-timegrid/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (technical research)
├── data-model.md        # Phase 1 output (component/entity model)
├── quickstart.md        # Phase 1 output (developer guide)
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── contracts/           # N/A (no API for this UI-only feature)
```

### Source Code (repository root)

```text
src/
├── main.tsx                          # エントリポイント
├── App.tsx                           # ルート（方式切替 UI）
├── App.module.css
│
├── shared/                           # ★ 両方式で共通のコード
│   ├── types.ts                      # 型定義
│   ├── constants.ts                  # HOUR_HEIGHT, 定数
│   ├── utils/
│   │   └── dateUtils.ts              # 日付操作ユーティリティ
│   └── components/
│       ├── WeekHeader.tsx            # 日付ヘッダー（曜日 + 日付）
│       ├── WeekHeader.module.css
│       ├── TimeLabels.tsx            # 左端の時間ラベル列
│       ├── TimeLabels.module.css
│       ├── Toolbar.tsx               # 方式切替トグル、リセットボタン
│       └── Toolbar.module.css
│
├── absolute/                         # ★ position: absolute 方式
│   ├── AbsoluteWeekView.tsx          # 週ビュー（absolute版のルート）
│   ├── AbsoluteWeekView.module.css
│   └── components/
│       ├── DayColumn.tsx             # 1日分のカラム
│       ├── DayColumn.module.css
│       └── GridLines.tsx             # 1時間ごとの水平線
│
└── grid/                             # ★ CSS Grid Layout 方式
    ├── GridWeekView.tsx              # 週ビュー（grid版のルート）
    ├── GridWeekView.module.css
    └── components/
        ├── DayGrid.tsx               # 1日分の Grid コンテナ
        ├── DayGrid.module.css
        └── GridLines.tsx             # 水平線（grid 上の要素）

tests/
├── unit/
│   └── dateUtils.test.ts             # 日付ユーティリティのテスト
└── integration/
    └── (F2 以降で追加予定)

package.json
tsconfig.json
vite.config.ts
index.html
```

**Structure Decision**:

単一 Vite アプリ内で `shared/`, `absolute/`, `grid/` の3ディレクトリに分離する方式を採用。

**理由**:
1. セットアップが `npm create vite` 一発で済む
2. 共通コードの import が相対パスで完結（ビルド設定不要）
3. UI 上で absolute/grid をトグルまたは並列表示でき、即座に比較できる
4. 比較検証が目的なのでパッケージ境界の厳密さは優先度が低い

**tsconfig パスエイリアス**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@absolute/*": ["src/absolute/*"],
      "@grid/*": ["src/grid/*"]
    }
  }
}
```

## Complexity Tracking

**No violations** - この機能は憲法に完全準拠しているため、複雑性の正当化は不要。

## Phase 0: Research Tasks

以下の技術調査を実施し、`research.md` にまとめる:

1. **日付操作**: date-fns での週の開始日（月曜日）取得、曜日フォーマット
2. **CSS Grid 1440行問題**: `grid-template-rows: repeat(1440, 1px)` の実用性とパフォーマンス影響
3. **スクロール位置の初期化**: useEffect での scrollTo タイミング（レンダリング後の実行保証）
4. **今日のハイライト**: 背景色の微調整方法（HSL, opacity, filter等の比較）
5. **Vite + CSS Modules**: セットアップ確認（標準サポートの検証）

## Phase 1: Design Artifacts

### data-model.md

以下のコンポーネントとエンティティのモデルを定義:

1. **共通コンポーネント**:
   - `WeekHeader`: Props, 責務, レンダリング内容
   - `TimeLabels`: Props, 責務, 時間ラベル生成ロジック
   - `Toolbar`: Props, 方式切替の状態管理

2. **Absolute 方式コンポーネント**:
   - `AbsoluteWeekView`: Props, レイアウト構造（flex）
   - `DayColumn`: Props, position: relative の設定
   - `GridLines`: Props, 水平線の描画方法

3. **Grid 方式コンポーネント**:
   - `GridWeekView`: Props, Grid レイアウト定義
   - `DayGrid`: Props, grid-template-rows/columns 設定
   - `GridLines`: Props, grid item としての水平線

4. **型定義** (`shared/types.ts`):
   - `DayInfo`: 日付、曜日、列インデックス
   - `ViewMode`: "absolute" | "grid" | "side-by-side"

### quickstart.md

開発者向けの実装ガイド:

1. **環境セットアップ**:
   ```bash
   npm create vite@latest calendar-comparison -- --template react-ts
   cd calendar-comparison
   npm install date-fns
   npm install -D vitest
   ```

2. **ディレクトリ作成**:
   ```bash
   mkdir -p src/{shared/{components,utils},absolute/components,grid/components}
   ```

3. **実装順序**:
   - Step 1: 共通定数・型定義 (constants.ts, types.ts)
   - Step 2: 日付ユーティリティ (dateUtils.ts)
   - Step 3: 共通コンポーネント (WeekHeader, TimeLabels, Toolbar)
   - Step 4: Absolute 方式の実装 (AbsoluteWeekView, DayColumn, GridLines)
   - Step 5: Grid 方式の実装 (GridWeekView, DayGrid, GridLines)
   - Step 6: App.tsx での方式切替実装
   - Step 7: スタイリング調整（両方式の見た目を完全に一致させる）

4. **動作確認**:
   - npm run dev で開発サーバー起動
   - side-by-side モードで両方式を並べて表示
   - 視覚的な差異がないことを確認

### contracts/

**N/A** - この機能は UI のみでバックエンド API は不要。

## Next Steps

1. ✅ Phase 0 完了: `research.md` を作成
2. ✅ Phase 1 完了: `data-model.md`, `quickstart.md` を作成
3. ⏭️ Phase 2: `/speckit.tasks` でタスク分解（plan.md 完了後に実行）

**Ready for**: `/speckit.tasks` - Break the plan into actionable tasks
