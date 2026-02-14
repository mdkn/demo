# Data Model: 週間タイムグリッド描画

**Feature**: 001-week-timegrid
**Date**: 2026-02-14

## Overview

F1 機能で使用するコンポーネント、型定義、およびデータモデルを定義する。absolute 方式と Grid 方式の両方で共通して使用する型と、各方式固有のコンポーネントを明確に分離する。

---

## 型定義 (shared/types.ts)

### DayInfo

1日分の情報を表現する型。

```typescript
export type DayInfo = {
  date: Date;           // 日付オブジェクト
  dayOfWeek: string;    // 曜日（"月", "火", ...）
  dateLabel: string;    // 日付ラベル（"2/17"）
  columnIndex: number;  // 列インデックス（0-6: 月曜=0, 日曜=6）
  isToday: boolean;     // 今日かどうか
};
```

**Usage**:
- WeekHeader で7日分の DayInfo を受け取り、ヘッダーを描画
- DayColumn / DayGrid で各日の情報を受け取り、列を描画

---

### ViewMode

方式切替の状態を表現する型。

```typescript
export type ViewMode = 'absolute' | 'grid' | 'side-by-side';
```

**Values**:
- `'absolute'`: absolute 方式のみ表示
- `'grid'`: Grid 方式のみ表示
- `'side-by-side'`: 両方式を並列表示（比較用）

**Usage**:
- App.tsx で useState\<ViewMode\> として管理
- Toolbar で切替ボタンを提供

---

### TimeSlot

1時間単位の時間スロット情報。

```typescript
export type TimeSlot = {
  hour: number;        // 時刻（0-23）
  label: string;       // 表示ラベル（"0:00", "1:00", ...）
  topPosition: number; // 縦位置（ピクセル）
};
```

**Usage**:
- TimeLabels で24時間分の TimeSlot を生成し、時間ラベルを描画
- GridLines で水平線の位置を計算

---

## 定数 (shared/constants.ts)

```typescript
// 1時間あたりのピクセル数
export const HOUR_HEIGHT = 60;

// 24時間分の合計高さ
export const TOTAL_HEIGHT = HOUR_HEIGHT * 24; // 1440px

// 週の日数
export const DAYS_IN_WEEK = 7;

// デフォルトのスクロール位置（8:00 = 480px）
export const DEFAULT_SCROLL_TOP = HOUR_HEIGHT * 8;
```

---

## 共通コンポーネント (shared/components/)

### WeekHeader

**責務**: 7日分の日付ヘッダーを描画

**Props**:
```typescript
type WeekHeaderProps = {
  days: DayInfo[];  // 7日分の情報
};
```

**レンダリング内容**:
```tsx
<div className={styles.weekHeader}>
  <div className={styles.timeLabelSpacer} /> {/* 左端の時間ラベル列の幅分 */}
  {days.map((day) => (
    <div key={day.columnIndex} className={styles.dayHeader}>
      <span className={styles.dayOfWeek}>{day.dayOfWeek}</span>
      <span className={styles.dateLabel}>{day.dateLabel}</span>
    </div>
  ))}
</div>
```

**スタイリング**:
- flex レイアウトで7日分を均等配置
- 今日の列は特別なスタイリング（太字、色変更等）

---

### TimeLabels

**責務**: 左端に24時間分の時間ラベルを描画

**Props**:
```typescript
type TimeLabelsProps = {
  // Props なし（静的コンポーネント）
};
```

**レンダリング内容**:
```tsx
<div className={styles.timeLabels}>
  {Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={styles.timeLabel}
      style={{ top: hour * HOUR_HEIGHT }}
    >
      {`${hour}:00`}
    </div>
  ))}
</div>
```

**スタイリング**:
- position: absolute で各時間ラベルを配置
- 高さは HOUR_HEIGHT に合わせる

---

### Toolbar

**責務**: 方式切替ボタンを提供

**Props**:
```typescript
type ToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};
```

**レンダリング内容**:
```tsx
<div className={styles.toolbar}>
  <button onClick={() => onViewModeChange('absolute')}>
    Absolute Only
  </button>
  <button onClick={() => onViewModeChange('grid')}>
    Grid Only
  </button>
  <button onClick={() => onViewModeChange('side-by-side')}>
    Side by Side
  </button>
</div>
```

---

## Absolute 方式コンポーネント (absolute/components/)

### AbsoluteWeekView

**責務**: absolute 方式の週ビューのルートコンポーネント

**Props**:
```typescript
type AbsoluteWeekViewProps = {
  days: DayInfo[];
};
```

**レイアウト構造**:
```tsx
<div className={styles.weekView}>
  <TimeLabels />
  <div className={styles.dayColumnsContainer}>
    {days.map((day) => (
      <DayColumn key={day.columnIndex} day={day} />
    ))}
  </div>
</div>
```

**CSS (AbsoluteWeekView.module.css)**:
```css
.weekView {
  display: flex;
  height: 1440px; /* 24時間 × 60px */
}

.dayColumnsContainer {
  display: flex;
  flex: 1;
  overflow-y: scroll;
}
```

---

### DayColumn

**責務**: 1日分のカラムを描画（absolute 方式）

**Props**:
```typescript
type DayColumnProps = {
  day: DayInfo;
};
```

**レイアウト構造**:
```tsx
<div
  className={`${styles.dayColumn} ${day.isToday ? styles.today : ''}`}
>
  <GridLines />
  {/* F2 以降でイベントブロックがここに追加される */}
</div>
```

**CSS (DayColumn.module.css)**:
```css
.dayColumn {
  position: relative;
  flex: 1;
  min-width: 100px;
  border-right: 1px solid #ddd;
  background-color: var(--bg-color);
}

.dayColumn.today {
  filter: brightness(1.05);
}
```

---

### GridLines

**責務**: 1時間ごとの水平線を描画（absolute 方式）

**Props**:
```typescript
type GridLinesProps = {
  // Props なし（静的コンポーネント）
};
```

**レンダリング内容**:
```tsx
<>
  {Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={styles.gridLine}
      style={{ top: hour * HOUR_HEIGHT }}
    />
  ))}
</>
```

**CSS (GridLines.module.css)**:
```css
.gridLine {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
  pointer-events: none; /* クリックイベントを透過 */
}
```

---

## Grid 方式コンポーネント (grid/components/)

### GridWeekView

**責務**: Grid 方式の週ビューのルートコンポーネント

**Props**:
```typescript
type GridWeekViewProps = {
  days: DayInfo[];
};
```

**レイアウト構造**:
```tsx
<div className={styles.weekView}>
  <TimeLabels />
  <div className={styles.weekGrid}>
    {days.map((day) => (
      <DayGrid key={day.columnIndex} day={day} />
    ))}
  </div>
</div>
```

**CSS (GridWeekView.module.css)**:
```css
.weekView {
  display: flex;
  height: 1440px;
}

.weekGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(24, 60px);
  flex: 1;
  overflow-y: scroll;
}
```

---

### DayGrid

**責務**: 1日分のグリッド列を描画（Grid 方式）

**Props**:
```typescript
type DayGridProps = {
  day: DayInfo;
};
```

**レイアウト構造**:
```tsx
<div
  className={`${styles.dayGrid} ${day.isToday ? styles.today : ''}`}
  style={{ gridColumn: day.columnIndex + 1 }}
>
  <GridLines />
  {/* F2 以降でイベントブロックがここに追加される */}
</div>
```

**CSS (DayGrid.module.css)**:
```css
.dayGrid {
  grid-row: 1 / span 24;
  border-right: 1px solid #ddd;
  background-color: var(--bg-color);
}

.dayGrid.today {
  filter: brightness(1.05);
}
```

---

### GridLines (Grid 方式)

**責務**: 1時間ごとの水平線を描画（Grid 方式）

**実装方法**:

Grid 方式では、水平線を Grid item として配置するか、背景画像として描画する2つの選択肢がある。

**Option 1: Grid item として配置**
```tsx
<>
  {Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={styles.gridLine}
      style={{
        gridRow: hour + 1,
        gridColumn: '1 / -1', // 全列にまたがる
      }}
    />
  ))}
</>
```

**Option 2: 背景画像として描画**
```css
.weekGrid {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 59px,
    #e0e0e0 59px,
    #e0e0e0 60px
  );
}
```

**選定**: Option 2 (背景画像) を採用
- DOM ノード数が削減される（24個のグリッド線要素が不要）
- CSS のみで実装可能
- absolute 方式との公平な比較のため、DOM 構造をシンプルに保つ

---

## ユーティリティ関数 (shared/utils/dateUtils.ts)

### getWeekDays

週の7日分の DayInfo を生成する。

```typescript
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

export const getWeekDays = (baseDate: Date = new Date()): DayInfo[] => {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date,
      dayOfWeek: format(date, 'E', { locale: ja }), // "月", "火", ...
      dateLabel: format(date, 'M/d'),               // "2/17"
      columnIndex: i,
      isToday: isSameDay(date, today),
    };
  });
};
```

---

### generateTimeSlots

24時間分の TimeSlot を生成する。

```typescript
export const generateTimeSlots = (): TimeSlot[] => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour}:00`,
    topPosition: hour * HOUR_HEIGHT,
  }));
};
```

---

## コンポーネント依存関係図

```
App.tsx
├── Toolbar
│   └── (方式切替ボタン)
├── WeekHeader
│   └── (7日分のヘッダー)
└── (ViewMode に応じて以下のいずれかを表示)
    ├── AbsoluteWeekView
    │   ├── TimeLabels
    │   └── DayColumn (×7)
    │       └── GridLines
    └── GridWeekView
        ├── TimeLabels
        └── DayGrid (×7)
            └── GridLines (背景画像で実装)
```

---

## データフロー

1. **App.tsx** で `getWeekDays()` を呼び出し、7日分の `DayInfo[]` を取得
2. **WeekHeader** に `days` を渡してヘッダーを描画
3. **ViewMode** に応じて AbsoluteWeekView または GridWeekView を描画
4. 各方式のコンポーネントに `days` を渡し、7日分の列を描画
5. **TimeLabels** は静的に24時間分のラベルを描画（props なし）

---

## Summary

- **共通型定義**: DayInfo, ViewMode, TimeSlot を `shared/types.ts` に配置
- **共通コンポーネント**: WeekHeader, TimeLabels, Toolbar を `shared/components/` に配置
- **方式別コンポーネント**: absolute/ と grid/ に分離し、互いに依存しない
- **ユーティリティ関数**: dateUtils.ts で日付操作を純粋関数として実装

すべてのコンポーネントとデータモデルが定義され、実装準備が完了した。
