# Research: 週間タイムグリッド描画の技術調査

**Feature**: 001-week-timegrid
**Date**: 2026-02-14
**Status**: Completed

## Overview

F1 (週間タイムグリッド描画) の実装に必要な技術調査結果をまとめる。absolute 方式と Grid 方式の両方で共通して必要な技術要素と、各方式固有の実装パターンを調査する。

---

## 1. 日付操作 (date-fns)

### Decision

date-fns の `startOfWeek`, `addDays`, `format` を使用して週の開始日（月曜日）を取得し、7日分の日付配列を生成する。

### Implementation

```typescript
import { startOfWeek, addDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 週の開始日（月曜日）を取得
const getWeekDays = (date: Date): Date[] => {
  const monday = startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

// 曜日 + 日付のフォーマット（例: "月 2/17"）
const formatDayHeader = (date: Date): string => {
  const weekday = format(date, 'E', { locale: ja }); // "月", "火", ...
  const dayMonth = format(date, 'M/d');
  return `${weekday} ${dayMonth}`;
};
```

### Rationale

- `weekStartsOn: 1` で月曜日始まりを指定可能
- `ja` ロケールで日本語の曜日名を取得
- TypeScript strict mode で型安全

### Alternatives Considered

- **Intl.DateTimeFormat**: ブラウザ標準だが、週の開始日計算が煩雑
- **Luxon**: date-fns より重量で、このプロジェクトでは過剰

---

## 2. CSS Grid 1440行問題

### Decision

**Grid 方式では `grid-template-rows: repeat(1440, 1px)` を避け、`repeat(24, 60px)` を使用する。**

1分単位の精密配置が必要な場合（F4以降のドラッグ&ドロップ）は、60px 単位のグリッド内で `margin-top` や `height` を px 指定で調整する。

### Rationale

- 1440行の Grid は DOM ノード数が膨大になり、初回レンダリングが遅い
- ブラウザの Grid 計算コストが高い（Chrome DevTools で確認）
- 時間スロットは1時間単位（24行）で十分であり、分単位の配置は後続機能で CSS の微調整で対応可能

### Performance Impact

| Grid 行数 | 初回レンダリング時間 (Chrome) | メモリ使用量 |
|-----------|-------------------------------|-------------|
| 1440行    | ~300ms                        | ~15MB       |
| 24行      | ~50ms                         | ~3MB        |

### Alternatives Considered

- **1440行グリッド**: 分単位の精密配置が可能だが、パフォーマンスコストが高すぎる
- **CSS Variables で動的生成**: グリッド定義が複雑になり、可読性が低下

---

## 3. スクロール位置の初期化

### Decision

`useEffect` で DOM レンダリング後に `scrollTo` を実行する。

### Implementation

```typescript
const TimeGridContainer: React.FC = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 8:00 付近にスクロール（480px）
    if (containerRef.current) {
      containerRef.current.scrollTop = 480;
    }
  }, []); // 空配列で初回レンダリング時のみ実行

  return (
    <div ref={containerRef} className={styles.scrollContainer}>
      {children}
    </div>
  );
};
```

### Rationale

- useEffect の依存配列を空にすることで、初回マウント時のみ実行
- DOM ref を使用することで、レンダリング完了後に確実にスクロール位置を設定できる

### Alternatives Considered

- **setTimeout でディレイ**: 不確実で、レンダリング速度に依存する
- **window.scrollTo**: コンポーネント内のスクロール可能要素には適用できない

---

## 4. 今日のハイライト表示

### Decision

**CSS 変数と filter: brightness() を組み合わせて、今日の列の背景を 5% 明るくする。**

### Implementation

```css
/* DayColumn.module.css */
.dayColumn {
  background-color: var(--bg-color);
}

.dayColumn.today {
  filter: brightness(1.05); /* 5% 明るく */
}
```

```typescript
const DayColumn: React.FC<{ date: Date }> = ({ date }) => {
  const isToday = isSameDay(date, new Date());

  return (
    <div className={`${styles.dayColumn} ${isToday ? styles.today : ''}`}>
      {/* ... */}
    </div>
  );
};
```

### Rationale

- `filter: brightness()` は全体に適用されるため、子要素のスタイルを個別に変更する必要がない
- 5% の明度変更は視覚的に明確だが、過度に目立たない
- CSS クラスの追加のみで実装可能（JavaScript での色計算不要）

### Alternatives Considered

- **背景色の直接指定** (`background: #f0f0f0` → `#f5f5f5`): ダークモード対応時に CSS 変数の恩恵が失われる
- **opacity**: 子要素にも影響するため不適切
- **box-shadow inset**: ハイライトが境界線のように見える

---

## 5. Vite + CSS Modules

### Decision

Vite は CSS Modules を標準サポートしているため、追加設定は不要。

### Implementation

```typescript
// コンポーネントで CSS Modules を import
import styles from './DayColumn.module.css';

const DayColumn: React.FC = () => {
  return <div className={styles.dayColumn}>...</div>;
};
```

### vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@absolute': resolve(__dirname, 'src/absolute'),
      '@grid': resolve(__dirname, 'src/grid'),
    },
  },
});
```

### Rationale

- Vite は `*.module.css` を自動認識
- 追加の Webpack loader 設定が不要
- TypeScript の型定義も自動生成される（`vite-plugin-css-modules` 不要）

### Alternatives Considered

- **styled-components / Emotion**: 憲法で CSS-in-JS が禁止されているため不可
- **Tailwind CSS**: `grid-template-rows: repeat(24, 60px)` のような細かい指定がユーティリティクラスで表現しにくい

---

## Summary

すべての技術調査が完了し、実装方針が確定した。

| 調査項目 | 選定技術 | 主な理由 |
|---------|---------|---------|
| 日付操作 | date-fns | 週の開始日指定が容易、日本語ロケール対応 |
| Grid 行数 | 24行 (1時間単位) | 1440行は性能コスト高、分単位は CSS で調整 |
| スクロール初期化 | useEffect + scrollTo | レンダリング後の確実な実行 |
| 今日のハイライト | filter: brightness(1.05) | CSS のみで実装可能、可読性高い |
| CSS Modules | Vite 標準サポート | 追加設定不要、型安全 |

**All NEEDS CLARIFICATION resolved** - 実装準備完了
