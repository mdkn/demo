# Feature Specification: 現在時刻インジケーター

**Feature ID**: F3
**Branch**: feature/003-now-indicator
**Created**: 2026-02-14
**Status**: Draft
**Depends On**: F1 (週間タイムグリッド描画)

## Overview

週間カレンダーの「今日」の列に、現在時刻を示す赤い水平線を表示する。1分ごとに位置を更新し、時間の経過を視覚的に表現する。

## User Stories

### [US1] [P1] 現在時刻の視覚的表示

**As a** カレンダーユーザー
**I want** 今日の列に現在時刻を示す赤い線が表示される
**So that** 現在時刻を一目で把握し、予定との時間関係を理解できる

**Acceptance Criteria**:
- Given: 今日が 2026-02-14 で、現在時刻が 14:30
- When: その週のカレンダーを表示
- Then: 2026-02-14 の列に、14:30 の位置（870px = 14.5時間 × 60px）に赤い水平線が表示される

**Independent Testability**: 現在時刻を固定値（例: 10:00）にモックして、線が 600px の位置に表示されることを確認

### [US2] [P1] 1分ごとの位置更新

**As a** カレンダーユーザー
**I want** 時刻インジケーターが1分ごとに自動で移動する
**So that** 常に最新の現在時刻が表示される

**Acceptance Criteria**:
- Given: 現在時刻が 14:30:00
- When: 1分経過して 14:31:00 になる
- Then: インジケーターが 1px 下に移動する（1分 = 1px）

**Independent Testability**: setInterval を jest.useFakeTimers() でモックし、1分進めて位置が更新されることを確認

### [US3] [P2] 今日以外の日には表示しない

**As a** カレンダーユーザー
**I want** 今日の列にのみインジケーターが表示される
**So that** 過去や未来の日付と混同しない

**Acceptance Criteria**:
- Given: 今日が 2026-02-14（金曜日）
- When: 週間ビュー（2026-02-10 〜 2026-02-16）を表示
- Then: 金曜日の列にのみ赤い線が表示され、他の 6 日には表示されない

**Independent Testability**: 各 DayColumn に `isToday` prop を渡し、true の列のみインジケーターが描画されることを確認

### [US4] [P2] 左端の赤いドット

**As a** カレンダーユーザー
**I want** インジケーターの左端に赤い丸が表示される
**So that** 線の開始位置が明確になり、視認性が向上する

**Acceptance Criteria**:
- Given: 現在時刻インジケーターが表示されている
- When: インジケーターを拡大して確認
- Then: 線の左端に直径 8px の赤い円が表示される

**Independent Testability**: NowIndicator コンポーネントの DOM に `.dot` クラスの要素が存在することを確認

## Functional Requirements

### FR-001: 現在時刻の取得 [P1]
**Description**: JavaScript の `new Date()` で現在時刻を取得し、その日の 0:00 からの経過分を計算する
**Acceptance**:
- 14:30 → 870分 (14 × 60 + 30)
- 23:59 → 1439分
**Related Stories**: US1

### FR-002: 縦位置の計算 [P1]
**Description**: 経過分 × (HOUR_HEIGHT / 60) でピクセル位置を計算する
**Acceptance**:
- HOUR_HEIGHT = 60px の場合、870分 → 870px
- absolute 方式: `top: 870px`
- Grid 方式: `grid-row-start: 870` (1px = 1分として)
**Related Stories**: US1

### FR-003: 1分間隔の更新 [P1]
**Description**: `setInterval` で 60秒ごとに現在時刻を再取得し、位置を更新する
**Acceptance**: インジケーターの位置が 1分ごとに 1px 下に移動する
**Related Stories**: US2

### FR-004: クリーンアップ [P1]
**Description**: コンポーネントのアンマウント時に `clearInterval` でタイマーを解放する
**Acceptance**: useEffect のクリーンアップ関数で clearInterval が呼ばれる
**Related Stories**: US2
**Note**: メモリリーク防止のため必須

### FR-005: 今日判定 [P1]
**Description**: 表示中の日付が今日かどうかを判定し、今日の列のみインジケーターを描画する
**Acceptance**:
- `day.isToday === true` の DayColumn にのみ NowIndicator を描画
- F1 で既に実装済みの `isToday` フラグを使用
**Related Stories**: US3

### FR-006: z-index の制御 [P2]
**Description**: インジケーターがイベント要素の上に表示されるよう z-index を設定する
**Acceptance**:
- EventBlock: z-index: 1
- NowIndicator: z-index: 10
**Related Stories**: US1

### FR-007: 視覚スタイル [P1]
**Description**: 赤い線（2px 高さ）と左端の赤いドット（8px 直径）を CSS で定義する
**Acceptance**:
- 線: `background-color: #ef4444`, `height: 2px`, `width: 100%`
- ドット: `width: 8px`, `height: 8px`, `border-radius: 50%`, `background-color: #ef4444`
**Related Stories**: US1, US4

## Data Model

### Entity: CurrentTime (状態管理)

```typescript
type CurrentTime = {
  now: Date;              // 現在時刻
  minutesFromMidnight: number;  // 0:00 からの経過分 (0-1439)
};
```

**Note**: これは状態として保持するのではなく、useCurrentTime フックが返す値

### Hook Interface

```typescript
const useCurrentTime = (): CurrentTime => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // 1分 = 60000ms

    return () => clearInterval(interval);
  }, []);

  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  return { now, minutesFromMidnight };
};
```

## Edge Cases

### Case 1: 日付が変わる瞬間（23:59 → 00:00）
**Behavior**: 翌日の 0:00 にインジケーターが消える（isToday が false になる）
**Reason**: 今日の列のみ表示するため、日付変更で自然に非表示になる

### Case 2: 0:00 〜 8:00 の時間帯
**Behavior**: インジケーターが画面外（スクロール領域の上部）にある
**Reason**: F1 の仕様で初期スクロール位置が 8:00 付近のため、ユーザーが上にスクロールすれば表示される

### Case 3: 24:00 を超える時刻（存在しない）
**Behavior**: minutesFromMidnight の上限は 1439（23:59）
**Reason**: JavaScript の Date オブジェクトは 24:00 を翌日の 0:00 として扱う

### Case 4: 週の表示範囲外の日が「今日」
**Behavior**: インジケーターは表示されない
**Reason**: 週ビューに今日の列が含まれていない場合、DayColumn 自体が存在しない

### Case 5: ブラウザタブが非アクティブ
**Behavior**: setInterval は引き続き動作するが、ブラウザによってはスロットリングされる可能性
**Mitigation**: 1分間隔なので精度への影響は軽微。タブアクティブ時に即座に再計算する必要なし

### Case 6: システム時刻の変更
**Behavior**: 次の setInterval 実行時（最大 1分後）に新しい時刻を反映
**Reason**: リアルタイムでの同期は不要（1分間隔で十分）

## Success Criteria

### User Experience
- **視認性**: 赤い線が他の UI 要素と区別でき、現在時刻が 3秒以内に認識できる
- **精度**: 実際の時刻と表示位置の誤差が ±1分以内

### System Performance
- **メモリリーク**: 10分間の連続表示でメモリ使用量が増加しない（clearInterval が正しく動作）
- **レンダリング負荷**: インジケーターの更新が他のコンポーネントの再レンダリングを引き起こさない

### Business Impact (Technical Validation)
- **absolute vs Grid の実装難易度**: 両方式で同等のコード量（±10行以内）
- **z-index 制御の複雑さ**: absolute 方式がシンプルか、Grid 方式でも同等か

## Non-Functional Requirements

### Performance
- **更新頻度**: 1分ごと（60秒間隔）で十分。秒単位の更新は不要
- **CPU 使用率**: setInterval による CPU 負荷が 1% 未満

### Usability
- **色のコントラスト**: 赤い線（#ef4444）が白背景で十分なコントラストを持つ
- **ホバー動作**: インジケーターはホバー不可（pointer-events: none）

### Maintainability
- **共通フック**: useCurrentTime は `shared/hooks/` に配置し、両方式で共有
- **コンポーネント分離**: NowIndicator は各方式ディレクトリに配置（absolute/grid で描画方法が異なるため）

## Open Questions

- **Q1**: 秒単位の更新は必要か？
  - **A**: 不要。1分間隔で十分（仕様書に明記）

- **Q2**: 週の表示範囲を変更する機能（前週・次週）が追加された場合、インジケーターはどうなるか？
  - **A**: スコープ外（週の切り替え自体が実装されない）

## Out of Scope

- 秒単位の更新（1分間隔のみ）
- インジケーターのアニメーション（滑らかに移動する効果）
- インジケーターのカスタマイズ（色・太さの変更 UI）
- インジケーターのクリック・ドラッグ操作
- 複数タイムゾーンの対応（ローカル時刻のみ）
- インジケーターの表示/非表示トグル
- 今日以外の日にもインジケーターを表示する設定
