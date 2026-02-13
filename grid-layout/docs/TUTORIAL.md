# React Grid Layout チュートリアル

このチュートリアルでは、react-grid-layoutを使って簡単なグリッドレイアウトを作成する手順を説明します。

---

## ステップ1: プロジェクトのセットアップ

### 1-1. 必要なパッケージをインストール

```bash
npm install react-grid-layout
npm install --save-dev @types/react-grid-layout
```

### 1-2. TypeScriptの型定義を作成

`src/types/react-grid-layout.d.ts` を作成：

```typescript
declare module 'react-grid-layout' {
  import * as React from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    isDraggable?: boolean;
    isResizable?: boolean;
  }

  export interface GridLayoutProps {
    className?: string;
    layout?: Layout[];
    cols?: number;
    rowHeight?: number;
    width?: number;
    margin?: [number, number];
    onLayoutChange?: (layout: Layout[]) => void;
    children?: React.ReactNode;
  }

  export default class GridLayout extends React.Component<GridLayoutProps> {}
}
```

---

## ステップ2: 基本的なグリッドを作成

### 2-1. シンプルなグリッドコンポーネント

`src/components/SimpleGrid.tsx` を作成：

```typescript
import { useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import './SimpleGrid.css';

export function SimpleGrid() {
  // 初期レイアウト
  const [layout, setLayout] = useState<Layout[]>([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 4, y: 0, w: 2, h: 2 },
  ]);

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={(newLayout) => {
        console.log('レイアウトが変更されました', newLayout);
        setLayout(newLayout);
      }}
    >
      <div key="a" style={{ background: '#ffcdd2' }}>A</div>
      <div key="b" style={{ background: '#c8e6c9' }}>B</div>
      <div key="c" style={{ background: '#bbdefb' }}>C</div>
    </GridLayout>
  );
}
```

### 2-2. スタイルを追加

`src/components/SimpleGrid.css` を作成：

```css
.layout {
  background: #f5f5f5;
}

.react-grid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**結果**: ドラッグ&リサイズ可能な3つのアイテムが表示されます！

---

## ステップ3: アイテムを動的に追加・削除

### 3-1. 追加機能を実装

```typescript
import { useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';

interface Item {
  id: string;
  content: string;
}

export function DynamicGrid() {
  const [items, setItems] = useState<Item[]>([
    { id: 'a', content: 'アイテムA' },
    { id: 'b', content: 'アイテムB' },
  ]);

  const [layout, setLayout] = useState<Layout[]>([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
  ]);

  // アイテムを追加
  const addItem = () => {
    const newId = `item-${Date.now()}`;

    setItems([
      ...items,
      { id: newId, content: `アイテム ${items.length + 1}` },
    ]);

    setLayout([
      ...layout,
      { i: newId, x: 0, y: Infinity, w: 2, h: 2 }, // y: Infinity で一番下に配置
    ]);
  };

  // アイテムを削除
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setLayout(layout.filter(item => item.i !== id));
  };

  return (
    <div>
      <button onClick={addItem}>アイテムを追加</button>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={setLayout}
      >
        {items.map((item) => (
          <div key={item.id} style={{ background: '#fff', padding: '10px' }}>
            <button onClick={() => removeItem(item.id)}>×</button>
            <div>{item.content}</div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
```

**結果**: ボタンでアイテムを追加・削除できるようになりました！

---

## ステップ4: localStorageで永続化

### 4-1. useLocalStorageフックを作成

```typescript
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }
      const parsed: T = JSON.parse(item);
      return parsed;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

### 4-2. フックを使って永続化

```typescript
export function PersistentGrid() {
  const [items, setItems] = useLocalStorage<Item[]>('grid-items', []);
  const [layout, setLayout] = useLocalStorage<Layout[]>('grid-layout', []);

  // 残りのコードは同じ
  // ...
}
```

**結果**: ページをリロードしてもレイアウトが保持されます！

---

## ステップ5: クリック位置にアイテムを作成

### 5-1. グリッド座標計算関数を追加

```typescript
const calculateGridPosition = (
  clientX: number,
  clientY: number,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  if (!containerRef.current) {
    return { x: 0, y: 0 };
  }

  const rect = containerRef.current.getBoundingClientRect();
  const cols = 12;
  const rowHeight = 30;
  const margin = [10, 10];
  const padding = [10, 10];

  const relativeX = clientX - rect.left - padding[0];
  const relativeY = clientY - rect.top - padding[1];

  const columnWidth = (rect.width - padding[0] * 2 - margin[0] * (cols - 1)) / cols;

  return {
    x: Math.floor(relativeX / (columnWidth + margin[0])),
    y: Math.floor(relativeY / (rowHeight + margin[1])),
  };
};
```

### 5-2. ダブルクリックハンドラーを追加

```typescript
export function ClickableGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = calculateGridPosition(e.clientX, e.clientY, gridRef);
    const newId = `item-${Date.now()}`;

    setItems([...items, { id: newId, content: '' }]);
    setLayout([...layout, { i: newId, x, y, w: 2, h: 2 }]);
  };

  return (
    <div ref={gridRef} onDoubleClick={handleDoubleClick}>
      <GridLayout {...props}>
        {/* ... */}
      </GridLayout>
    </div>
  );
}
```

**結果**: ダブルクリックした位置にアイテムが作成されます！

---

## ステップ6: 編集モードの実装

### 6-1. アイテムコンポーネントを作成

```typescript
interface ItemCardProps {
  item: Item;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

function ItemCard({ item, onUpdate, onDelete }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.content);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親のダブルクリックを防ぐ
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(content);
  };

  return (
    <div onDoubleClick={handleDoubleClick} style={{ padding: '10px' }}>
      <button onClick={onDelete}>×</button>

      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <div>{item.content || 'ダブルクリックして編集'}</div>
      )}
    </div>
  );
}
```

### 6-2. 編集中はドラッグ無効化

```typescript
export function EditableGrid() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const getLayoutWithEditMode = () => {
    return layout.map(item => ({
      ...item,
      isDraggable: item.i !== editingId,
      isResizable: item.i !== editingId,
    }));
  };

  return (
    <GridLayout layout={getLayoutWithEditMode()} {...props}>
      {items.map(item => (
        <div key={item.id}>
          <ItemCard
            item={item}
            onUpdate={(content) => {
              // アイテムを更新
            }}
            onDelete={() => {
              // アイテムを削除
            }}
          />
        </div>
      ))}
    </GridLayout>
  );
}
```

**結果**: 編集中はアイテムが動かなくなります！

---

## ステップ7: Grid Memoアプリの完成形

すべての機能を組み合わせた完全な実装は以下のファイルを参照してください：

- **MemoGrid.tsx**: [src/components/MemoGrid/MemoGrid.tsx](../src/components/MemoGrid/MemoGrid.tsx)
- **MemoCard.tsx**: [src/components/MemoCard/MemoCard.tsx](../src/components/MemoCard/MemoCard.tsx)
- **useMemos.ts**: [src/hooks/useMemos.ts](../src/hooks/useMemos.ts)

---

## 次のステップ

1. **カラーピッカーの追加**: アイテムに色を設定できるようにする
2. **リセット機能**: すべてのアイテムを削除する
3. **空きスペース検索**: 重なりを避けて自動配置
4. **境界スナッピング**: グリッドの端に収まるように調整

詳細は[React Grid Layout 使い方ガイド](./GRID_LAYOUT_GUIDE.md)を参照してください。

---

## まとめ

このチュートリアルで学んだこと：

- ✅ react-grid-layoutの基本的な使い方
- ✅ アイテムの動的な追加・削除
- ✅ localStorageでの永続化
- ✅ クリック位置へのアイテム配置
- ✅ 編集モードの実装
- ✅ ドラッグ制御

これらの知識を組み合わせることで、Grid Memoのような本格的なアプリケーションを作成できます！

**おめでとうございます！🎉**
