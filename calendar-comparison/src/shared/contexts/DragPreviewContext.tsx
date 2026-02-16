import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * ドラッグ中のイベントのプレビュー状態
 */
type DragPreview = {
  eventId: string;      // ドラッグ中のイベント ID
  tempStartAt: string;  // 仮の開始時刻 (ISO 8601)
  tempEndAt: string;    // 仮の終了時刻 (ISO 8601)
} | null;

/**
 * DragPreviewContext が提供する値
 */
interface DragPreviewContextValue {
  dragPreview: DragPreview;
  updateDragPreview: (eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => void;
  clearDragPreview: () => void;
}

const DragPreviewContext = createContext<DragPreviewContextValue | undefined>(undefined);

/**
 * ドラッグプレビュー状態を提供する Provider コンポーネント
 * ドラッグ中のイベントの一時的な位置を管理し、リアルタイムレイアウト更新を可能にする
 */
export const DragPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [dragPreview, setDragPreview] = useState<DragPreview>(null);

  const updateDragPreview = (eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => {
    setDragPreview({ eventId, ...times });
  };

  const clearDragPreview = () => {
    setDragPreview(null);
  };

  return (
    <DragPreviewContext.Provider value={{ dragPreview, updateDragPreview, clearDragPreview }}>
      {children}
    </DragPreviewContext.Provider>
  );
};

/**
 * DragPreviewContext を使用するカスタムフック
 * @throws {Error} Provider の外で使用された場合
 */
export const useDragPreview = () => {
  const context = useContext(DragPreviewContext);
  if (!context) {
    throw new Error('useDragPreview must be used within DragPreviewProvider');
  }
  return context;
};
