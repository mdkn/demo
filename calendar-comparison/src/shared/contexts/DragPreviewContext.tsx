import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * ドラッグ中のイベントのプレビュー状態
 */
type DragPreview = {
  eventId: string;      // ドラッグ中のイベント ID
  tempStartAt: string;  // 仮の開始時刻 (ISO 8601)
  tempEndAt: string;    // 仮の終了時刻 (ISO 8601)
} | null;

/**
 * DragPreview の状態のみを提供する Context
 * 頻繁に変更される状態を分離し、actions のみ使うコンポーネントの再レンダーを防ぐ
 */
interface DragPreviewStateContextValue {
  dragPreview: DragPreview;
}

/**
 * DragPreview のアクションのみを提供する Context
 * 参照が安定しているため、これのみを使うコンポーネントは再レンダーされない
 */
interface DragPreviewActionsContextValue {
  updateDragPreview: (eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => void;
  clearDragPreview: () => void;
}

const DragPreviewStateContext = createContext<DragPreviewStateContextValue | undefined>(undefined);
const DragPreviewActionsContext = createContext<DragPreviewActionsContextValue | undefined>(undefined);

/**
 * ドラッグプレビュー状態を提供する Provider コンポーネント
 * ドラッグ中のイベントの一時的な位置を管理し、リアルタイムレイアウト更新を可能にする
 *
 * パフォーマンス最適化:
 * - useCallback でアクション関数をメモ化し、参照の安定性を保証
 * - state と actions を別 Context に分離
 *   - dragPreview の変更時、actions のみ使うコンポーネント（useDragEvent）は再レンダーされない
 *   - これにより useDragEvent の useMemo(createRafThrottle) が正しく機能する
 *   - ドラッグ中の大量レンダーを回避
 */
export const DragPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [dragPreview, setDragPreview] = useState<DragPreview>(null);

  // useCallback でメモ化し、関数の参照を安定化
  const updateDragPreview = useCallback((eventId: string, times: {
    tempStartAt: string;
    tempEndAt: string;
  }) => {
    setDragPreview({ eventId, ...times });
  }, []);

  const clearDragPreview = useCallback(() => {
    setDragPreview(null);
  }, []);

  // state と actions の value を分離してメモ化
  const stateValue = useMemo(
    () => ({ dragPreview }),
    [dragPreview]
  );

  const actionsValue = useMemo(
    () => ({ updateDragPreview, clearDragPreview }),
    [updateDragPreview, clearDragPreview]
  );

  return (
    <DragPreviewActionsContext.Provider value={actionsValue}>
      <DragPreviewStateContext.Provider value={stateValue}>
        {children}
      </DragPreviewStateContext.Provider>
    </DragPreviewActionsContext.Provider>
  );
};

/**
 * DragPreview の状態のみを取得するカスタムフック
 * レイアウト計算など、状態が必要なコンポーネントで使用
 * @throws {Error} Provider の外で使用された場合
 */
export const useDragPreviewState = () => {
  const context = useContext(DragPreviewStateContext);
  if (!context) {
    throw new Error('useDragPreviewState must be used within DragPreviewProvider');
  }
  return context;
};

/**
 * DragPreview のアクションのみを取得するカスタムフック
 * useDragEvent など、アクションのみ必要なコンポーネントで使用
 * dragPreview の変更時に再レンダーされないため、パフォーマンスが向上
 * @throws {Error} Provider の外で使用された場合
 */
export const useDragPreviewActions = () => {
  const context = useContext(DragPreviewActionsContext);
  if (!context) {
    throw new Error('useDragPreviewActions must be used within DragPreviewProvider');
  }
  return context;
};

/**
 * DragPreview の状態とアクションの両方を取得するカスタムフック
 * 後方互換性のために残しているが、パフォーマンスのため
 * useDragPreviewState または useDragPreviewActions の使用を推奨
 * @throws {Error} Provider の外で使用された場合
 */
export const useDragPreview = () => {
  const state = useDragPreviewState();
  const actions = useDragPreviewActions();
  return { ...state, ...actions };
};
