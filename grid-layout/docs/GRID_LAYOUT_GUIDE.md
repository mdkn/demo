# React Grid Layout 使い方ガイド

このドキュメントでは、Grid Memoアプリで使用している`react-grid-layout`の実装方法と使い方を解説します。

## 目次

1. [概要](#概要)
2. [基本的なセットアップ](#基本的なセットアップ)
3. [グリッド設定](#グリッド設定)
4. [レイアウトデータ構造](#レイアウトデータ構造)
5. [主要な機能](#主要な機能)
6. [イベント処理](#イベント処理)
7. [応用テクニック](#応用テクニック)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

`react-grid-layout`は、Reactでドラッグ&ドロップ可能なグリッドレイアウトを実装するためのライブラリです。

### 主な機能

- ✅ ドラッグ&ドロップによるアイテム移動
- ✅ リサイズ可能なアイテム
- ✅ 自動レイアウト調整（重なり防止）
- ✅ レスポンシブ対応（オプション）
- ✅ 状態の永続化

---

## 基本的なセットアップ

### 1. インストール

```bash
npm install react-grid-layout
npm install --save-dev @types/react-grid-layout
```

### 2. CSSのインポート

```typescript
import 'react-grid-layout/css/styles.css';
```

### 3. 型定義の作成

react-grid-layoutの型定義が不完全な場合があるため、プロジェクトで型定義を作成します：

```typescript
// src/types/react-grid-layout.d.ts
declare module 'react-grid-layout' {
  import * as React from 'react';

  export interface Layout {
    i: string;        // アイテムの一意なID
    x: number;        // X座標（カラム単位）
    y: number;        // Y座標（行単位）
    w: number;        // 幅（カラム単位）
    h: number;        // 高さ（行単位）
    minW?: number;    // 最小幅
    maxW?: number;    // 最大幅
    minH?: number;    // 最小高さ
    maxH?: number;    // 最大高さ
    static?: boolean; // 固定（移動・リサイズ不可）
    isDraggable?: boolean;  // ドラッグ可否
    isResizable?: boolean;  // リサイズ可否
  }

  export interface GridLayoutProps {
    className?: string;
    layout?: Layout[];
    cols?: number;
    rowHeight?: number;
    width?: number;
    margin?: [number, number];
    containerPadding?: [number, number];
    onLayoutChange?: (layout: Layout[]) => void;
    // ... その他のプロパティ
  }

  export default class GridLayout extends React.Component<GridLayoutProps> {}
}
```

---

## グリッド設定

### 基本設定

```typescript
// src/constants/colors.ts
export const GRID_CONFIG: {
  readonly cols: 12;
  readonly rowHeight: 30;
  readonly margin: readonly [number, number];
  readonly containerPadding: readonly [number, number];
} = {
  cols: 12,                      // グリッドのカラム数
  rowHeight: 30,                 // 1行の高さ（px）
  margin: [10, 10],              // アイテム間のマージン [横, 縦]
  containerPadding: [10, 10],    // コンテナのパディング [横, 縦]
};
```

### 設定パラメータの説明

| パラメータ | 説明 | 推奨値 |
|-----------|------|--------|
| `cols` | グリッドの列数 | 12 (Bootstrap標準) |
| `rowHeight` | 1行の高さ（px） | 30-50px |
| `margin` | アイテム間の余白 [横, 縦] | [10, 10] |
| `containerPadding` | コンテナの内側余白 | [10, 10] |
| `width` | コンテナの幅（px） | 自動計算が推奨 |

---

## レイアウトデータ構造

### Layout配列

各アイテムの位置とサイズを定義します：

```typescript
const layout: Layout[] = [
  {
    i: 'memo-1',  // 一意なID（必須）
    x: 0,         // X座標: 0カラム目
    y: 0,         // Y座標: 0行目
    w: 2,         // 幅: 2カラム分
    h: 2,         // 高さ: 2行分
  },
  {
    i: 'memo-2',
    x: 2,
    y: 0,
    w: 3,
    h: 4,
  },
];
```

### 座標系

```
  0   1   2   3   4   5   6   7   8   9  10  11  (カラム)
0 [----memo-1----][------memo-2------]
1 [----memo-1----][------memo-2------]
2                 [------memo-2------]
3                 [------memo-2------]
4
5
```

### 計算式

```typescript
// アイテムの実際のピクセル位置
const pixelX = x * (columnWidth + marginX) + containerPaddingX;
const pixelY = y * (rowHeight + marginY) + containerPaddingY;

// アイテムの実際のピクセルサイズ
const pixelWidth = w * columnWidth + (w - 1) * marginX;
const pixelHeight = h * rowHeight + (h - 1) * marginY;
```

---

## 主要な機能

### 1. 基本的な実装

```typescript
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

function MyGrid() {
  const [layout, setLayout] = useState<Layout[]>([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
  ]);

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={(newLayout) => setLayout(newLayout)}
    >
      <div key="a">アイテムA</div>
      <div key="b">アイテムB</div>
    </GridLayout>
  );
}
```

### 2. 動的にアイテムを追加

```typescript
const addItem = (x: number, y: number) => {
  const newId = `item-${Date.now()}`;

  setLayout([
    ...layout,
    { i: newId, x, y, w: 2, h: 2 },
  ]);

  setItems([
    ...items,
    { id: newId, content: '新しいアイテム' },
  ]);
};
```

### 3. アイテムを削除

```typescript
const removeItem = (id: string) => {
  setLayout(layout.filter(item => item.i !== id));
  setItems(items.filter(item => item.id !== id));
};
```

### 4. ドラッグ・リサイズの制御

```typescript
// 特定のアイテムのみドラッグ無効化
const layoutWithControl = layout.map(item => ({
  ...item,
  isDraggable: item.i !== 'fixed-item',
  isResizable: item.i !== 'fixed-item',
}));

<GridLayout layout={layoutWithControl} {...config}>
  {/* ... */}
</GridLayout>
```

---

## イベント処理

### 1. レイアウト変更の検知

```typescript
const handleLayoutChange = (newLayout: Layout[]) => {
  console.log('レイアウトが変更されました', newLayout);

  // localStorageに保存
  localStorage.setItem('layout', JSON.stringify(newLayout));

  // 状態を更新
  setLayout(newLayout);
};

<GridLayout onLayoutChange={handleLayoutChange} {...props} />
```

### 2. ドラッグイベント

```typescript
<GridLayout
  onDragStart={(layout, oldItem, newItem) => {
    console.log('ドラッグ開始:', newItem.i);
  }}
  onDrag={(layout, oldItem, newItem) => {
    console.log('ドラッグ中:', newItem.x, newItem.y);
  }}
  onDragStop={(layout, oldItem, newItem) => {
    console.log('ドラッグ終了:', newItem);
  }}
/>
```

### 3. リサイズイベント

```typescript
<GridLayout
  onResizeStart={(layout, oldItem, newItem) => {
    console.log('リサイズ開始:', newItem.i);
  }}
  onResize={(layout, oldItem, newItem) => {
    console.log('リサイズ中:', newItem.w, newItem.h);
  }}
  onResizeStop={(layout, oldItem, newItem) => {
    console.log('リサイズ終了:', newItem);
  }}
/>
```

---

## 応用テクニック

### 1. クリック座標からグリッド座標への変換

```typescript
const calculateGridPosition = (
  clientX: number,
  clientY: number,
  containerRef: React.RefObject<HTMLDivElement>
): { x: number; y: number } => {
  if (!containerRef.current) {
    return { x: 0, y: 0 };
  }

  const rect = containerRef.current.getBoundingClientRect();
  const { cols, rowHeight, margin, containerPadding } = GRID_CONFIG;

  // コンテナ内の相対位置
  const relativeX = clientX - rect.left - containerPadding[0];
  const relativeY = clientY - rect.top - containerPadding[1];

  // カラム幅を計算
  const totalMarginWidth = margin[0] * (cols - 1);
  const availableWidth = rect.width - containerPadding[0] * 2 - totalMarginWidth;
  const columnWidth = availableWidth / cols;

  // グリッド座標に変換
  const x = Math.floor(relativeX / (columnWidth + margin[0]));
  const y = Math.floor(relativeY / (rowHeight + margin[1]));

  return {
    x: Math.max(0, Math.min(x, cols - 1)),
    y: Math.max(0, y),
  };
};
```

### 2. 境界スナッピング（範囲内に収める）

```typescript
const snapToGrid = (
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } => {
  const { cols } = GRID_CONFIG;

  // 右端を超えないように調整
  const adjustedX = Math.min(x, cols - width);

  return {
    x: Math.max(0, adjustedX),
    y: Math.max(0, y),
  };
};
```

### 3. 空きスペースの検索

```typescript
const findNearestEmptySpace = (
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  currentLayout: Layout[]
): { x: number; y: number } => {
  const hasOverlap = (x: number, y: number, w: number, h: number): boolean => {
    return currentLayout.some((item) => {
      const xOverlap = x < item.x + item.w && x + w > item.x;
      const yOverlap = y < item.y + item.h && y + h > item.y;
      return xOverlap && yOverlap;
    });
  };

  // 境界調整
  let x = Math.min(targetX, GRID_CONFIG.cols - width);
  let y = targetY;

  // 重なりがなければそのまま返す
  if (!hasOverlap(x, y, width, height)) {
    return { x, y };
  }

  // 螺旋状に検索
  let searchRadius = 1;
  const maxSearch = 20;

  while (searchRadius < maxSearch) {
    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        if (Math.abs(dx) === searchRadius || Math.abs(dy) === searchRadius) {
          const testX = Math.max(0, Math.min(GRID_CONFIG.cols - width, targetX + dx));
          const testY = Math.max(0, targetY + dy);

          if (!hasOverlap(testX, testY, width, height)) {
            return { x: testX, y: testY };
          }
        }
      }
    }
    searchRadius++;
  }

  // 見つからない場合は一番下に配置
  const maxY = currentLayout.length > 0
    ? Math.max(...currentLayout.map(item => item.y + item.h))
    : 0;

  return { x: 0, y: maxY };
};
```

### 4. 編集中はドラッグ無効化

```typescript
const [editingId, setEditingId] = useState<string | null>(null);

const getLayoutWithEditMode = () => {
  return layout.map((item) => ({
    ...item,
    isDraggable: item.i !== editingId,
    isResizable: item.i !== editingId,
  }));
};

<GridLayout layout={getLayoutWithEditMode()} {...config}>
  {items.map((item) => (
    <div key={item.id}>
      <ItemCard
        item={item}
        isEditing={editingId === item.id}
        onEditStart={() => setEditingId(item.id)}
        onEditEnd={() => setEditingId(null)}
      />
    </div>
  ))}
</GridLayout>
```

---

## トラブルシューティング

### 問題1: アイテムが重なってしまう

**原因**: `preventCollision`が`true`になっている

**解決策**:
```typescript
<GridLayout
  preventCollision={false}  // 自動調整を有効化
  compactType="vertical"    // 縦方向に詰める（または "horizontal" / null）
  {...config}
/>
```

### 問題2: ドラッグ中にイベントが伝播する

**原因**: 子要素のイベントがバブリングしている

**解決策**:
```typescript
const handleDoubleClick = (e: React.MouseEvent) => {
  e.stopPropagation();  // イベント伝播を停止
  // 編集モードに入る処理
};
```

### 問題3: TypeScriptの型エラー

**原因**: react-grid-layoutの型定義が不完全

**解決策**:
```typescript
// src/types/react-grid-layout.d.ts を作成
// プロジェクト固有の型定義を追加
```

### 問題4: リサイズハンドルが表示されない

**原因**: CSSが読み込まれていない

**解決策**:
```typescript
// メインファイルでCSSをインポート
import 'react-grid-layout/css/styles.css';

// または、カスタムスタイルを追加
.react-grid-item > .react-resizable-handle::after {
  content: '';
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid rgba(0, 0, 0, 0.4);
}
```

### 問題5: 幅が正しく計算されない

**原因**: コンテナのrefが初期化される前にレンダリングされる

**解決策**:
```typescript
const gridRef = useRef<HTMLDivElement>(null);

<div ref={gridRef}>
  <GridLayout
    width={gridRef.current?.clientWidth || 1200}
    {...config}
  />
</div>
```

---

## パフォーマンス最適化

### 1. React.memoの使用

```typescript
const MemoCard = React.memo(({ item, onUpdate, onDelete }: MemoCardProps) => {
  // コンポーネントの実装
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.content === nextProps.item.content;
});
```

### 2. useMemoでレイアウト計算をキャッシュ

```typescript
const processedLayout = useMemo(() => {
  return layout.map(item => ({
    ...item,
    isDraggable: item.i !== editingId,
  }));
}, [layout, editingId]);
```

### 3. useCallbackでハンドラーをメモ化

```typescript
const handleLayoutChange = useCallback((newLayout: Layout[]) => {
  setLayout(newLayout);
  localStorage.setItem('layout', JSON.stringify(newLayout));
}, []);
```

---

## まとめ

このガイドでは、react-grid-layoutの基本的な使い方から応用テクニックまでを解説しました。

### チェックリスト

- ✅ 必要なパッケージのインストール
- ✅ 型定義の作成
- ✅ グリッド設定の定義
- ✅ レイアウトデータ構造の理解
- ✅ イベント処理の実装
- ✅ 応用テクニックの活用
- ✅ パフォーマンス最適化

### 参考リンク

- [react-grid-layout公式ドキュメント](https://github.com/react-grid-layout/react-grid-layout)
- [Grid Memo実装例](../src/components/MemoGrid/MemoGrid.tsx)
- [カスタム型定義](../src/types/react-grid-layout.d.ts)

---

**最終更新**: 2026-02-13
