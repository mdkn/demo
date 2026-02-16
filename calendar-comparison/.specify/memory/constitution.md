<!--
Sync Impact Report:
- Version change: none → 1.0.0
- Initial constitution creation
- No prior principles to modify
- Templates requiring updates: None (initial setup)
- Follow-up TODOs: None
-->

# Calendar Comparison Project Constitution

## Core Principles

### I. Simplicity First (NON-NEGOTIABLE)

**YAGNI (You Aren't Gonna Need It) を厳守する。**

- 機能要件書に明記されていない機能は実装しない
- 抽象化は 3 回同じパターンが出現するまで行わない
- 外部ライブラリは必要最小限に抑える（date-fns のみ許可）
- DnD ライブラリ、状態管理ライブラリ、CSS-in-JS は禁止
- コード行数を KPI として測定し、両方式で比較する

**Rationale**: このプロジェクトは技術検証・学習が目的であり、プロダクション品質やスケーラビリティは求められない。実装の複雑さを正確に比較するため、抽象化レイヤーを最小限にする必要がある。

### II. Strict Scope Adherence

**機能要件書のスコープ外事項には一切手を出さない。**

スコープ外として明示されている項目:
- 月ビュー / 年ビュー
- 終日イベント（allday event）
- 複数日にまたがるイベント
- イベント詳細の編集モーダル（タイトル入力のみ対応）
- アニメーション / トランジション
- レスポンシブ対応（デスクトップ幅固定で検証）
- アクセシビリティ（ARIA 属性等）
- バックエンド連携（API / DB）
- 週の切り替え（前週・次週のナビゲーション）
- カレンダーの色分け設定 UI

**Rationale**: スコープクリープを防ぎ、absolute vs Grid の純粋な比較に集中する。追加機能の提案は原則却下する。

### III. Separation of Concerns (Shared vs Method-Specific)

**共通コードと方式別コードの境界を厳格に守る。**

境界ルール:
1. `shared/` は `absolute/` や `grid/` を import しない（逆方向の依存は OK）
2. `absolute/` と `grid/` は互いを import しない
3. データ層（localStorage CRUD）は完全に共通化し、両方式から同一のフックを使用
4. 重なり検出・座標変換は純粋関数として `shared/utils/` に配置
5. レイアウト計算・ドラッグ/リサイズ処理は各方式ディレクトリに分離

**Rationale**: 共通ロジックを最大化することで、比較結果の公平性を保つ。方式固有のコードのみを分離することで、差分が明確になる。

### IV. Fair Comparison Environment

**両方式の実装条件を完全に揃える。**

必須条件:
- 同一のサンプルデータを使用
- 同一の DOM 構造測定ツールで評価
- React Profiler で同一条件下のパフォーマンスを計測
- コード行数は空行・コメントを除いた実行コード行数で比較
- 両方式で同一の機能セット（F1〜F7）を実装
- side-by-side モードで同時表示し、挙動の差異を視覚的に確認可能にする

**Rationale**: 技術検証が目的であるため、比較の公平性が最優先。一方だけに最適化やショートカットを適用してはならない。

### V. TypeScript Strict Mode

**TypeScript の strict モードを有効にし、型安全性を確保する。**

- `any` の使用は原則禁止（やむを得ない場合はコメントで理由を明記）
- 全ての関数に明示的な戻り値の型を指定
- `!` (non-null assertion) は最小限に抑える
- イベントハンドラーの型は React の標準型を使用

**Rationale**: 型エラーによるバグを防ぎ、リファクタリング時の安全性を確保する。

## Testing Standards

### Test Coverage Requirements

**共通ロジック層のユニットテストを優先する。**

必須テスト対象:
- `shared/utils/overlapUtils.ts` — 重なり検出、カラム割り当て、LCM 計算
- `shared/utils/dateUtils.ts` — 座標変換（pxToMinutes, minutesToPx）
- `shared/hooks/useCalendarEvents.ts` — localStorage CRUD の動作

テスト不要:
- 方式別のコンポーネント（手動の視覚的検証で代替）
- ドラッグ/リサイズのフック（統合テストの範囲外）

**Rationale**: 限られた時間で最大の効果を得るため、バグの影響範囲が大きい共通ロジックにテストを集中させる。

## Code Style & Formatting

### React Component Standards

- 関数コンポーネント + Hooks のみ使用（クラスコンポーネント禁止）
- アロー関数形式で定義: `export const ComponentName = () => { ... }`
- Props の型は `type ComponentNameProps = { ... }` で定義
- CSS Modules を使用し、クラス名は `styles.className` でアクセス

### File Naming Conventions

- コンポーネント: PascalCase（例: `EventBlock.tsx`, `EventBlock.module.css`）
- フック: camelCase with `use` prefix（例: `useCalendarEvents.ts`）
- ユーティリティ: camelCase（例: `dateUtils.ts`, `overlapUtils.ts`）

### Import Order

1. React / React DOM
2. 外部ライブラリ（date-fns）
3. `@shared/*` からの import
4. 同一方式ディレクトリ内からの import
5. CSS Modules（最後）

## Performance Standards

### Rendering Performance

**React Profiler で 100 件のイベント描画時のレンダリング時間を計測する。**

計測条件:
- Chrome DevTools の React Profiler を使用
- Commit phase の時間を記録
- 初回レンダリングと更新時レンダリングの両方を計測
- 結果は `docs/performance-comparison.md` に記録

### Memory Constraints

- localStorage のサイズ上限は考慮しない（サンプルデータは 100 件以下）
- メモリリークの防止: useEffect のクリーンアップを必ず実装

## Governance

### Amendment Process

憲法の修正は以下のプロセスに従う:

1. 修正提案の背景と理由を文書化
2. 影響範囲の特定（affected templates, components, hooks）
3. バージョン番号の決定（Semantic Versioning に従う）
4. 依存テンプレートの更新
5. Sync Impact Report を憲法ファイルの先頭に追記

### Versioning Policy

- **MAJOR**: 原則の削除、非互換な変更（例: TypeScript strict mode の無効化）
- **MINOR**: 新しい原則の追加、セクションの拡張
- **PATCH**: 文言の明確化、誤字修正

### Compliance Review

全ての PR は以下を確認する:

- スコープ外機能が含まれていないか
- 依存ルールが守られているか（shared / absolute / grid の境界）
- 禁止ライブラリが追加されていないか
- TypeScript strict mode でエラーが出ないか

**Version**: 1.0.0 | **Ratified**: 2026-02-14 | **Last Amended**: 2026-02-14
