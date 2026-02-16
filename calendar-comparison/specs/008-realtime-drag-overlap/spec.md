# Specification: リアルタイムドラッグ重なり検知

**Feature Number**: 008
**Feature Name**: realtime-drag-overlap
**Created**: 2026-02-16
**Status**: Draft
**Priority**: P0 (Critical UX Improvement)

## Overview

イベントをドラッグする際、他のイベントがリアルタイムで再配置されるようにし、Google Calendar のような直感的なドラッグ体験を提供します。

## Problem Statement

### 現在の問題

1. **ドラッグ中の視覚的不整合**
   - イベントをドラッグしている間、他のイベントは元の位置のまま
   - ドロップした瞬間に突然再配置される
   - 最終的な配置が予測できない

2. **重なり検知のタイミング**
   - 重なり検知はドロップ**後**にのみ実行される
   - ドラッグ中のプレビューがない

3. **ユーザー体験の悪さ**
   - ドラッグ先の状態が分からない
   - トライ&エラーが必要
   - プロフェッショナルな印象に欠ける

### 期待される動作

Google Calendar のように：
- ドラッグ中、他のイベントがリアルタイムで横にずれる
- ドロップ前に最終的な配置が見える
- スムーズで予測可能な操作感

## User Stories

### US1: ドラッグ中のリアルタイム再配置 (P0)

**As a** カレンダーユーザー
**I want** イベントをドラッグする際、他のイベントがリアルタイムで再配置されること
**So that** ドロップ前に最終的な配置を確認できる

**Acceptance Criteria:**
- [ ] イベントをドラッグすると、重なる他のイベントが即座に横にずれる
- [ ] ドラッグ中も全イベントの配置が視覚的に正しい
- [ ] absolute モードで動作する
- [ ] grid モードで動作する

**Test Scenarios:**
1. 2つのイベントが重なる場合
   - イベントA (10:00-11:00) をドラッグ
   - イベントB (10:30-11:30) と重なる位置に移動
   - → ドラッグ中、B が右側に移動する

2. 3つ以上のイベントが重なる場合
   - 複数イベントが存在する位置にドラッグ
   - → すべてのイベントが適切に再配置される

3. 重なりから離れる場合
   - 重なっている位置からドラッグして離す
   - → 残ったイベントが元の幅に戻る

### US2: スムーズなパフォーマンス (P0)

**As a** カレンダーユーザー
**I want** ドラッグ操作が滑らかであること
**So that** ストレスなく操作できる

**Acceptance Criteria:**
- [ ] ドラッグ中のフレームレートが 60fps を維持
- [ ] ラグや遅延を感じない
- [ ] 大量のイベント（50+）でも性能劣化しない

**Performance Requirements:**
- レイアウト再計算: 最大 60回/秒
- ドラッグ開始の遅延: < 100ms
- ドロップ後の確定: < 50ms

### US3: 正確な重なり解消 (P0)

**As a** カレンダーユーザー
**I want** ドロップ後に重なりが正しく解消されること
**So that** イベントが重なったままにならない

**Acceptance Criteria:**
- [ ] ドロップ後、すべてのイベントが正しく配置される
- [ ] ドラッグ中のプレビューとドロップ後の配置が一致する
- [ ] エッジケース（完全に含まれる、境界が接触）でも正しく動作

## Functional Requirements

### FR1: ドラッグプレビュー状態の管理

- ドラッグ中のイベントの仮の時刻・位置を状態として保持
- プレビュー状態: `{ eventId: string, tempStartAt: string, tempEndAt: string }`
- ドラッグ終了時にプレビューをクリア

### FR2: リアルタイムレイアウト再計算

- ドラッグ中、プレビューイベントを含めて `detectOverlaps()` を実行
- レイアウトフックがプレビューを受け取る
- プレビュー変更時に再レンダリングをトリガー

### FR3: パフォーマンス最適化

- `requestAnimationFrame` でレイアウト再計算をスロットリング
- 毎秒60+回の `pointermove` → 最大60回/秒のレイアウト計算
- 不要な再レンダリングを防止

### FR4: 両モードでの統一動作

- absolute モードで動作
- grid モードで動作
- 同じプレビューメカニズムを共有

## Non-Functional Requirements

### NFR1: パフォーマンス

- ドラッグ中: 60fps を維持
- レイアウト再計算: < 16ms (1フレーム)
- メモリリーク: RAF コールバックの適切なクリーンアップ

### NFR2: 互換性

- 既存の機能（ドラッグ、リサイズ、作成）に影響なし
- 既存のテストがすべてパス
- レイアウトアルゴリズムは不変

### NFR3: コード品質

- TypeScript 型安全性を維持
- React のベストプラクティスに従う
- テストカバレッジ: 新規コード 80%+

## Data Requirements

### ドラッグプレビュー状態

```typescript
type DragPreview = {
  eventId: string;      // ドラッグ中のイベント ID
  tempStartAt: string;  // 仮の開始時刻 (ISO 8601)
  tempEndAt: string;    // 仮の終了時刻 (ISO 8601)
} | null;
```

## Edge Cases

### EC1: 高速ドラッグ

- 毎秒100+回の pointermove イベント
- RAF スロットリングで処理

### EC2: ドラッグキャンセル (Escape)

- プレビューをクリア
- 元の位置に戻す

### EC3: 同時に複数イベントが重なる

- 3つ以上のイベントが重なる場合
- 正しいカラム割り当て

### EC4: クロスデイドラッグ

- 別の日にドラッグ
- プレビューも新しい日で表示

### EC5: ブラウザの互換性

- Chrome, Firefox, Safari でテスト
- PointerEvent API のサポート

## Constraints

### Technical Constraints

- React 18+ の機能を使用
- 既存の `detectOverlaps()` アルゴリズムを変更しない
- DOM の直接操作を維持（即座の視覚フィードバック）

### Business Constraints

- 既存機能への影響を最小化
- リリース後のロールバック可能性を確保

## Success Metrics

- [ ] ドラッグ中のリアルタイム再配置が実装される
- [ ] パフォーマンス: 60fps 維持
- [ ] 既存テストがすべてパス
- [ ] 新規テストカバレッジ 80%+
- [ ] ユーザーテストで満足度向上

## Out of Scope

以下は本機能の範囲外：
- マルチイベントドラッグ（複数選択してドラッグ）
- ドラッグ中のスナップ改善
- アニメーション効果の追加
- タッチデバイス最適化（既存の動作を維持）

## Dependencies

### 既存コンポーネント

- `src/shared/utils/overlapUtils.ts` - 重なり検知ロジック（変更なし）
- `src/absolute/hooks/useAbsoluteLayout.ts` - 修正が必要
- `src/grid/hooks/useGridLayout.ts` - 修正が必要
- `src/absolute/hooks/useDragEvent.ts` - 修正が必要
- `src/grid/hooks/useDragEvent.ts` - 修正が必要

### 新規コンポーネント

- プレビュー状態管理（Context または custom hook）
- RAF スロットリングユーティリティ

## References

- 既存実装: Features 004 (drag-time), 005 (drag-date)
- 重なり検知: Feature 002 (event-placement)
- Google Calendar の UX パターン
