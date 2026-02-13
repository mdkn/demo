# React Grid Layout クイックリファレンス

Grid Memoアプリで使用している`react-grid-layout`の主要なコードスニペット集

---

## 基本セットアップ

```typescript
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const MyGrid = () => {
  const [layout, setLayout] = useState<Layout[]>([]);

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={setLayout}
    >
      {/* アイテム */}
    </GridLayout>
  );
};
```

---

## レイアウトデータ

```typescript
const layout: Layout[] = [
  {
    i: 'unique-id',  // 必須: 一意なID
    x: 0,            // X座標（カラム）
    y: 0,            // Y座標（行）
    w: 2,            // 幅（カラム数）
    h: 2,            // 高さ（行数）
  },
];
```

---

## グリッド設定

```typescript
export const GRID_CONFIG = {
  cols: 12,                    // カラム数
  rowHeight: 30,               // 行の高さ（px）
  margin: [10, 10],            // マージン [横, 縦]
  containerPadding: [10, 10],  // パディング [横, 縦]
};
```

---

## よく使うプロパティ

```typescript
<GridLayout
  // 必須
  layout={layout}
  cols={12}
  rowHeight={30}
  width={1200}

  // レイアウト制御
  compactType={null}           // 自動整列: "vertical" | "horizontal" | null
  preventCollision={false}     // 衝突防止: true で重なり許可しない

  // マージン
  margin={[10, 10]}            // アイテム間の余白
  containerPadding={[10, 10]}  // コンテナの内側余白

  // イベント
  onLayoutChange={handleChange}
  onDragStart={handleDragStart}
  onDragStop={handleDragStop}
  onResizeStop={handleResizeStop}
>
  {children}
</GridLayout>
```

---

## アイテムの追加

```typescript
const addItem = (x: number, y: number) => {
  const newId = crypto.randomUUID();

  setLayout([
    ...layout,
    { i: newId, x, y, w: 2, h: 2 },
  ]);
};
```

---

## アイテムの削除

```typescript
const removeItem = (id: string) => {
  setLayout(layout.filter(item => item.i !== id));
};
```

---

## ドラッグ・リサイズの制御

```typescript
// 個別に制御
const controlledLayout = layout.map(item => ({
  ...item,
  isDraggable: item.i !== 'locked-item',
  isResizable: item.i !== 'locked-item',
  static: item.i === 'fixed-item',  // 完全に固定
}));

<GridLayout layout={controlledLayout} {...props} />
```

---

## クリック座標 → グリッド座標

```typescript
const clickToGrid = (clientX: number, clientY: number) => {
  const rect = containerRef.current.getBoundingClientRect();
  const relativeX = clientX - rect.left - padding[0];
  const relativeY = clientY - rect.top - padding[1];

  const columnWidth = (rect.width - totalMargin) / cols;

  return {
    x: Math.floor(relativeX / (columnWidth + margin[0])),
    y: Math.floor(relativeY / (rowHeight + margin[1])),
  };
};
```

---

## 境界チェック

```typescript
const snapToBounds = (x: number, y: number, w: number, h: number) => ({
  x: Math.max(0, Math.min(x, cols - w)),
  y: Math.max(0, y),
});
```

---

## 重なりチェック

```typescript
const hasOverlap = (
  x: number, y: number, w: number, h: number,
  layout: Layout[]
): boolean => {
  return layout.some((item) => {
    const xOverlap = x < item.x + item.w && x + w > item.x;
    const yOverlap = y < item.y + item.h && y + h > item.y;
    return xOverlap && yOverlap;
  });
};
```

---

## localStorage連携

```typescript
// 保存
const saveLayout = (layout: Layout[]) => {
  localStorage.setItem('grid-layout', JSON.stringify(layout));
};

// 読み込み
const loadLayout = (): Layout[] => {
  const saved = localStorage.getItem('grid-layout');
  if (!saved) return [];

  const parsed: Layout[] = JSON.parse(saved);
  return parsed;
};

// useLocalStorageフック
const [layout, setLayout] = useLocalStorage<Layout[]>('grid-layout', []);
```

---

## イベント処理

```typescript
// レイアウト変更
const handleLayoutChange = (newLayout: Layout[]) => {
  setLayout(newLayout);
  localStorage.setItem('layout', JSON.stringify(newLayout));
};

// ドラッグ
<GridLayout
  onDragStart={(layout, oldItem, newItem) => {
    console.log('開始:', newItem.i);
  }}
  onDragStop={(layout, oldItem, newItem) => {
    console.log('終了:', newItem);
  }}
/>

// リサイズ
<GridLayout
  onResizeStop={(layout, oldItem, newItem) => {
    console.log('新サイズ:', newItem.w, newItem.h);
  }}
/>
```

---

## 編集モード制御

```typescript
const [editingId, setEditingId] = useState<string | null>(null);

const layoutWithEditMode = layout.map(item => ({
  ...item,
  isDraggable: item.i !== editingId,  // 編集中は動かせない
  isResizable: item.i !== editingId,  // 編集中はリサイズできない
}));
```

---

## カスタムスタイル

```scss
// リサイズハンドル
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

// ドラッグ中のプレビュー
.react-grid-placeholder {
  background: rgba(0, 0, 0, 0.1);
  opacity: 0.2;
  border-radius: 8px;
}

// グリッドアイテム
.react-grid-item {
  transition: all 200ms ease;
  transition-property: left, top, width, height;
}
```

---

## TypeScript型定義

```typescript
// Layout型
interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

// Props型
interface GridLayoutProps {
  className?: string;
  layout?: Layout[];
  cols?: number;
  rowHeight?: number;
  width?: number;
  margin?: [number, number];
  containerPadding?: [number, number];
  onLayoutChange?: (layout: Layout[]) => void;
}
```

---

## パフォーマンス最適化

```typescript
// React.memo
const GridItem = React.memo(({ item }: { item: Item }) => (
  <div>{item.content}</div>
));

// useMemo
const processedLayout = useMemo(
  () => layout.map(item => ({ ...item, isDraggable: true })),
  [layout]
);

// useCallback
const handleChange = useCallback((newLayout: Layout[]) => {
  setLayout(newLayout);
}, []);
```

---

## デバッグTips

```typescript
// レイアウトを視覚化
console.table(layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })));

// 重なりをチェック
layout.forEach((item, i) => {
  layout.slice(i + 1).forEach(other => {
    if (hasOverlap(item.x, item.y, item.w, item.h, [other])) {
      console.warn('重なり検出:', item.i, 'と', other.i);
    }
  });
});

// グリッド線を表示（開発用）
.grid-container {
  background-image:
    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| アイテムが重なる | `preventCollision={false}` |
| ドラッグできない | `isDraggable={true}` を確認 |
| リサイズできない | `isResizable={true}` を確認 |
| CSSが効かない | `import 'react-grid-layout/css/styles.css'` |
| 型エラー | カスタム型定義を作成 |
| 幅が合わない | `width={containerRef.current?.clientWidth}` |

---

**詳細なガイド**: [GRID_LAYOUT_GUIDE.md](./GRID_LAYOUT_GUIDE.md)
