# Quickstart Guide: 週間タイムグリッド描画 (F1)

**Feature**: 001-week-timegrid
**Date**: 2026-02-14
**Target**: 開発者

## Overview

この ガイドでは、F1 (週間タイムグリッド描画) 機能を実装するための環境セットアップから実装手順、動作確認までを段階的に説明する。

---

## Prerequisites

- Node.js 18.x 以上
- npm 9.x 以上
- モダンブラウザ（Chrome, Firefox, Safari 最新版）

---

## Step 1: プロジェクトセットアップ

### 1.1 Vite プロジェクトの作成

```bash
# Vite + React + TypeScript テンプレートで新規プロジェクト作成
npm create vite@latest calendar-comparison -- --template react-ts

# プロジェクトディレクトリに移動
cd calendar-comparison

# 依存パッケージをインストール
npm install
```

### 1.2 追加パッケージのインストール

```bash
# date-fns（日付操作ライブラリ）
npm install date-fns

# Vitest（テストフレームワーク）
npm install -D vitest
```

### 1.3 ディレクトリ構造の作成

```bash
# shared, absolute, grid の3つのディレクトリを作成
mkdir -p src/shared/{components,utils}
mkdir -p src/absolute/components
mkdir -p src/grid/components
mkdir -p tests/unit
```

---

## Step 2: TypeScript 設定

### 2.1 tsconfig.json の更新

パスエイリアスと strict mode を設定する。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Strict Mode (憲法原則 V) */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@absolute/*": ["src/absolute/*"],
      "@grid/*": ["src/grid/*"]
    },

    /* Module Resolution */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.2 vite.config.ts の更新

パスエイリアスを Vite でも解決できるように設定する。

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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

---

## Step 3: 実装順序

以下の順序で実装することで、段階的に機能を構築できる。

### 3.1 共通定数・型定義

**ファイル**: `src/shared/constants.ts`

```typescript
export const HOUR_HEIGHT = 60;
export const TOTAL_HEIGHT = HOUR_HEIGHT * 24; // 1440px
export const DAYS_IN_WEEK = 7;
export const DEFAULT_SCROLL_TOP = HOUR_HEIGHT * 8; // 8:00
```

**ファイル**: `src/shared/types.ts`

```typescript
export type DayInfo = {
  date: Date;
  dayOfWeek: string;
  dateLabel: string;
  columnIndex: number;
  isToday: boolean;
};

export type ViewMode = 'absolute' | 'grid' | 'side-by-side';

export type TimeSlot = {
  hour: number;
  label: string;
  topPosition: number;
};
```

---

### 3.2 日付ユーティリティ

**ファイル**: `src/shared/utils/dateUtils.ts`

```typescript
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DayInfo, TimeSlot } from '@shared/types';
import { HOUR_HEIGHT, DAYS_IN_WEEK } from '@shared/constants';

export const getWeekDays = (baseDate: Date = new Date()): DayInfo[] => {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  const today = new Date();

  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date,
      dayOfWeek: format(date, 'E', { locale: ja }),
      dateLabel: format(date, 'M/d'),
      columnIndex: i,
      isToday: isSameDay(date, today),
    };
  });
};

export const generateTimeSlots = (): TimeSlot[] => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour}:00`,
    topPosition: hour * HOUR_HEIGHT,
  }));
};
```

**テスト**: `tests/unit/dateUtils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getWeekDays, generateTimeSlots } from '@shared/utils/dateUtils';

describe('dateUtils', () => {
  it('should return 7 days starting from Monday', () => {
    const days = getWeekDays(new Date('2026-02-17')); // Tuesday
    expect(days).toHaveLength(7);
    expect(days[0].dayOfWeek).toBe('月'); // Monday
    expect(days[6].dayOfWeek).toBe('日'); // Sunday
  });

  it('should generate 24 time slots', () => {
    const slots = generateTimeSlots();
    expect(slots).toHaveLength(24);
    expect(slots[0].label).toBe('0:00');
    expect(slots[23].label).toBe('23:00');
  });
});
```

---

### 3.3 共通コンポーネント

**ファイル**: `src/shared/components/WeekHeader.tsx`

```typescript
import { DayInfo } from '@shared/types';
import styles from './WeekHeader.module.css';

type WeekHeaderProps = {
  days: DayInfo[];
};

export const WeekHeader = ({ days }: WeekHeaderProps): JSX.Element => {
  return (
    <div className={styles.weekHeader}>
      <div className={styles.timeLabelSpacer} />
      {days.map((day) => (
        <div
          key={day.columnIndex}
          className={`${styles.dayHeader} ${day.isToday ? styles.today : ''}`}
        >
          <span className={styles.dayOfWeek}>{day.dayOfWeek}</span>
          <span className={styles.dateLabel}>{day.dateLabel}</span>
        </div>
      ))}
    </div>
  );
};
```

**ファイル**: `src/shared/components/WeekHeader.module.css`

```css
.weekHeader {
  display: flex;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
}

.timeLabelSpacer {
  width: 60px; /* 時間ラベル列の幅 */
  flex-shrink: 0;
}

.dayHeader {
  flex: 1;
  padding: 8px;
  text-align: center;
  border-right: 1px solid #ddd;
}

.dayHeader.today {
  font-weight: bold;
  color: #1976d2;
}

.dayOfWeek {
  margin-right: 4px;
}
```

**同様に作成**:
- `TimeLabels.tsx` / `TimeLabels.module.css`
- `Toolbar.tsx` / `Toolbar.module.css`

（詳細は data-model.md を参照）

---

### 3.4 Absolute 方式の実装

**実装ファイル**:
1. `src/absolute/AbsoluteWeekView.tsx`
2. `src/absolute/AbsoluteWeekView.module.css`
3. `src/absolute/components/DayColumn.tsx`
4. `src/absolute/components/DayColumn.module.css`
5. `src/absolute/components/GridLines.tsx`

（詳細は data-model.md を参照）

**重要ポイント**:
- `position: relative` のコンテナ内に `position: absolute` で子要素を配置
- flex レイアウトで7日分の列を横並び
- useEffect でスクロール位置を初期化（8:00 付近）

---

### 3.5 Grid 方式の実装

**実装ファイル**:
1. `src/grid/GridWeekView.tsx`
2. `src/grid/GridWeekView.module.css`
3. `src/grid/components/DayGrid.tsx`
4. `src/grid/components/DayGrid.module.css`

（詳細は data-model.md を参照）

**重要ポイント**:
- `grid-template-rows: repeat(24, 60px)` で1時間単位のグリッド
- 水平線は背景画像（`repeating-linear-gradient`）で実装
- `grid-column` で各日の列位置を指定

---

### 3.6 App.tsx での方式切替

**ファイル**: `src/App.tsx`

```typescript
import { useState } from 'react';
import { ViewMode } from '@shared/types';
import { getWeekDays } from '@shared/utils/dateUtils';
import { WeekHeader } from '@shared/components/WeekHeader';
import { Toolbar } from '@shared/components/Toolbar';
import { AbsoluteWeekView } from '@absolute/AbsoluteWeekView';
import { GridWeekView } from '@grid/GridWeekView';
import styles from './App.module.css';

export const App = (): JSX.Element => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const days = getWeekDays();

  return (
    <div className={styles.app}>
      <h1>Calendar Comparison: Week Time Grid (F1)</h1>
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} />
      <WeekHeader days={days} />

      <div className={styles.viewContainer}>
        {(viewMode === 'absolute' || viewMode === 'side-by-side') && (
          <div className={styles.view}>
            <h2>Absolute 方式</h2>
            <AbsoluteWeekView days={days} />
          </div>
        )}

        {(viewMode === 'grid' || viewMode === 'side-by-side') && (
          <div className={styles.view}>
            <h2>Grid 方式</h2>
            <GridWeekView days={days} />
          </div>
        )}
      </div>
    </div>
  );
};
```

**ファイル**: `src/App.module.css`

```css
.app {
  max-width: 100%;
  margin: 0;
  padding: 16px;
}

.viewContainer {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.view {
  flex: 1;
  min-width: 0; /* flexbox での縮小を許可 */
}
```

---

## Step 4: 動作確認

### 4.1 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### 4.2 確認項目

以下をチェックする:

- [ ] 7日分の列（月〜日）が横に並んで表示される
- [ ] 各日のヘッダーに曜日と日付（例: "月 2/17"）が表示される
- [ ] 左端に 0:00〜23:00 の時間ラベルが表示される
- [ ] 1時間ごとに水平線が描画される
- [ ] 初回表示時にスクロール位置が 8:00 付近になっている
- [ ] 今日の日付列の背景がわずかにハイライトされている
- [ ] side-by-side モードで absolute 方式と Grid 方式が並列表示される
- [ ] **両方式の見た目に差異がない**（重要）

### 4.3 テスト実行

```bash
npm run test
```

`dateUtils.test.ts` が通ることを確認する。

---

## Step 5: スタイリング調整

両方式で完全に同一の見た目にするため、以下を調整する:

1. **グリッド線の色・太さ**: absolute と Grid で統一
2. **列の境界線**: 同じ色・太さ
3. **今日のハイライト**: `filter: brightness(1.05)` で統一
4. **フォントサイズ・余白**: WeekHeader, TimeLabels で統一

---

## Troubleshooting

### 問題: スクロール位置が 8:00 にならない

**原因**: useEffect の実行タイミングが早すぎる

**解決策**: `setTimeout` で少しディレイを入れる

```typescript
useEffect(() => {
  setTimeout(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = DEFAULT_SCROLL_TOP;
    }
  }, 0);
}, []);
```

---

### 問題: Grid 方式の水平線が表示されない

**原因**: `repeating-linear-gradient` の指定ミス

**解決策**: 正しい構文を確認

```css
background-image: repeating-linear-gradient(
  to bottom,
  transparent,
  transparent 59px,
  #e0e0e0 59px,
  #e0e0e0 60px
);
```

---

### 問題: パスエイリアス（@shared 等）が解決されない

**原因**: tsconfig.json と vite.config.ts の設定不足

**解決策**: Step 2 の設定を再確認。Vite を再起動する。

---

## Performance Tips

### React Profiler での計測

初回レンダリング時間を計測する:

1. Chrome DevTools → Components タブを開く
2. Profiler タブに切り替え
3. 🔴 Record ボタンを押してページをリロード
4. Flamegraph で AbsoluteWeekView と GridWeekView の Commit time を比較

### 目標値

- 初回レンダリング: < 100ms（absolute, Grid 両方）
- 合計描画時間: < 1秒

---

## Next Steps

F1 の実装が完了したら、次の機能に進む:

1. **F2**: イベント配置と重なり処理
2. **F3**: 現在時刻インジケーター
3. **F4**: ドラッグ&ドロップ（時間移動）

各機能の仕様は元の機能要件書を参照。

---

## Summary

- ✅ Vite + React + TypeScript の環境セットアップ完了
- ✅ shared/absolute/grid の3ディレクトリ構成を作成
- ✅ 共通コンポーネントとユーティリティを実装
- ✅ absolute 方式と Grid 方式を並列実装
- ✅ side-by-side モードで視覚的な比較が可能

**Ready for**: F2 以降の機能実装、または `/speckit.tasks` でタスク分解
