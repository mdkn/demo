import { useState, useEffect, useRef, useMemo } from 'react';
import type { CalendarEvent } from '@shared/types';
import {
  snapToMinutes,
  clampMinutes,
  calculateNewTime,
  pxToMinutes,
  dateToMinutes,
  pxToDayIndex,
  calculateNewDate,
} from '@shared/utils/dragUtils';
import { useDragPreviewActions } from '@shared/contexts/DragPreviewContext';
import { createRafThrottle } from '@shared/utils/rafThrottle';

type DragState = {
  isDragging: boolean;
  startX: number;           // F5: ドラッグ開始時のマウスX座標
  startY: number;           // F4: ドラッグ開始時のマウスY座標
  startMinutes: number;     // F4: ドラッグ開始時のイベント開始分
  startDayIndex: number;    // F5: ドラッグ開始時の日付列インデックス
  originalStartAt: string;  // F4: Escape用
  originalEndAt: string;    // F4: Escape用
};

type UseDragEventProps = {
  event: CalendarEvent;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dayColumnRefs: React.RefObject<HTMLDivElement | null>[];  // F5: 7つの日付列のDOM参照
  onDayHover?: (dayIndex: number | null) => void;           // F5: 列ハイライト用
};

/**
 * useDragEvent hook for absolute positioned layout
 * Handles drag start, move, drop, and cancellation for 2D event dragging (time + date)
 * F4: Vertical drag (time change)
 * F5: Horizontal drag (date change) + 2D diagonal drag
 */
export const useDragEvent = ({
  event,
  onUpdate,
  hourHeight,
  containerRef,
  dayColumnRefs,
  onDayHover,
}: UseDragEventProps) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dayColumnRectsRef = useRef<DOMRect[]>([]);

  // F8: Get drag preview actions (actionsのみ取得で再レンダーを回避)
  const { updateDragPreview, clearDragPreview } = useDragPreviewActions();

  // Calculate event duration in minutes
  const durationMinutes =
    dateToMinutes(event.endAt) - dateToMinutes(event.startAt);

  // F8: Create RAF-throttled preview update function
  const { throttled: throttledUpdate, cancel: cancelUpdate } = useMemo(
    () => createRafThrottle(updateDragPreview),
    [updateDragPreview]
  );

  /**
   * Handle pointer down - start drag
   * Excludes resize handle regions (top 8px, bottom 8px)
   * F5: Cache day column rects and determine starting day index
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Exclude resize handle regions (reserved for F6)
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    if (offsetY < 8 || offsetY > rect.height - 8) {
      return; // In resize handle zone, don't start drag
    }

    // F5: Cache day column bounding rects (getBoundingClientRect once for performance)
    dayColumnRectsRef.current = dayColumnRefs
      .map((ref) => ref.current?.getBoundingClientRect())
      .filter((rect): rect is DOMRect => rect !== undefined);

    // F5: Determine starting day index
    const startDayIndex = pxToDayIndex(e.clientX, dayColumnRectsRef.current) ?? 0;

    // Capture pointer to track movement outside element
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    // Store element reference
    elementRef.current = e.currentTarget;

    // Initialize drag state (F4 + F5)
    setDragState({
      isDragging: true,
      startX: e.clientX,                          // F5
      startY: e.clientY,                          // F4
      startMinutes: dateToMinutes(event.startAt), // F4
      startDayIndex,                              // F5
      originalStartAt: event.startAt,             // F4
      originalEndAt: event.endAt,                 // F4
    });
  };

  /**
   * Handle pointer move - update position during drag
   * F4: Vertical drag (time change)
   * F5: Horizontal drag (date change) + column highlight
   */
  useEffect(() => {
    if (!dragState?.isDragging || !elementRef.current || !containerRef.current) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();

      // F4: Calculate vertical delta (time change)
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);

      // Calculate new start time
      let newStartMinutes = dragState.startMinutes + deltaMinutes;

      // Apply 15-minute snap
      newStartMinutes = snapToMinutes(newStartMinutes, 15);

      // Apply range clamping (0:00 - 24:00)
      newStartMinutes = clampMinutes(newStartMinutes, durationMinutes);

      // F5: Calculate horizontal delta (date change)
      const currentDayIndex = pxToDayIndex(e.clientX, dayColumnRectsRef.current);

      // F5: Update column highlight
      if (onDayHover) {
        onDayHover(currentDayIndex);
      }

      // F8: Calculate new times for preview
      let newStartAt = calculateNewTime(event.startAt, newStartMinutes);
      let newEndAt = calculateNewTime(event.endAt, newStartMinutes + durationMinutes);

      // F8: Apply date change if day changed
      if (currentDayIndex !== null && currentDayIndex !== dragState.startDayIndex) {
        newStartAt = calculateNewDate(newStartAt, currentDayIndex, dragState.startDayIndex);
        newEndAt = calculateNewDate(newEndAt, currentDayIndex, dragState.startDayIndex);
      }

      // F8: Update drag preview (RAF-throttled for performance)
      throttledUpdate(event.id, {
        tempStartAt: newStartAt,
        tempEndAt: newEndAt,
      });

      // Update element position immediately (no React re-render for smooth dragging)
      if (elementRef.current) {
        const topPx = (newStartMinutes / 60) * hourHeight;
        elementRef.current.style.top = `${topPx}px`;

        // F5: Update horizontal position (left) based on day index
        if (currentDayIndex !== null) {
          const dayWidth = 100 / dayColumnRectsRef.current.length; // percentage
          elementRef.current.style.left = `${currentDayIndex * dayWidth}%`;
        }
      }
    };

    // Attach to document to track movement outside element
    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [dragState, hourHeight, durationMinutes, containerRef, onDayHover, throttledUpdate, event]);

  /**
   * Handle pointer up - finalize drag and update event
   * F4: Calculate new time
   * F5: Calculate new date + clear column highlight
   */
  useEffect(() => {
    if (!dragState?.isDragging) {
      return;
    }

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();

      // F4: Calculate final time position
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);

      let newStartMinutes = dragState.startMinutes + deltaMinutes;
      newStartMinutes = snapToMinutes(newStartMinutes, 15);
      newStartMinutes = clampMinutes(newStartMinutes, durationMinutes);

      // F5: Calculate final day position
      let finalDayIndex = pxToDayIndex(e.clientX, dayColumnRectsRef.current);
      if (finalDayIndex === null) {
        finalDayIndex = dragState.startDayIndex; // Fallback to original if outside
      }

      // Clamp to week range (0-6)
      finalDayIndex = Math.max(0, Math.min(6, finalDayIndex));

      // F5: Calculate new date (preserving time from F4 calculation)
      let newStartAt = calculateNewTime(event.startAt, newStartMinutes);
      let newEndAt = calculateNewTime(event.endAt, newStartMinutes + durationMinutes);

      // F5: Apply date change if day index changed
      if (finalDayIndex !== dragState.startDayIndex) {
        newStartAt = calculateNewDate(newStartAt, finalDayIndex, dragState.startDayIndex);
        newEndAt = calculateNewDate(newEndAt, finalDayIndex, dragState.startDayIndex);
      }

      // F8: Cancel pending RAF and clear drag preview before updating actual event
      cancelUpdate();
      clearDragPreview();

      // Update event through callback
      onUpdate(event.id, { startAt: newStartAt, endAt: newEndAt });

      // F5: Clear column highlight
      if (onDayHover) {
        onDayHover(null);
      }

      // Release pointer capture
      if (elementRef.current && pointerIdRef.current !== null) {
        elementRef.current.releasePointerCapture(pointerIdRef.current);
      }

      // Clear drag state
      setDragState(null);
      pointerIdRef.current = null;
    };

    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, event, onUpdate, hourHeight, durationMinutes, onDayHover, cancelUpdate, clearDragPreview]);

  /**
   * Handle Escape key - cancel drag
   * F5: Clear column highlight
   */
  useEffect(() => {
    if (!dragState?.isDragging) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();

        // F8: Cancel pending RAF and clear drag preview
        cancelUpdate();
        clearDragPreview();

        // Restore original position
        if (elementRef.current) {
          const originalMinutes = dateToMinutes(dragState.originalStartAt);
          const topPx = (originalMinutes / 60) * hourHeight;
          elementRef.current.style.top = `${topPx}px`;
          // F5: Restore original left position (remove inline style)
          elementRef.current.style.left = '';
        }

        // F5: Clear column highlight
        if (onDayHover) {
          onDayHover(null);
        }

        // Release pointer capture
        if (elementRef.current && pointerIdRef.current !== null) {
          elementRef.current.releasePointerCapture(pointerIdRef.current);
        }

        // Clear drag state without updating event
        setDragState(null);
        pointerIdRef.current = null;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState, hourHeight, onDayHover, cancelUpdate, clearDragPreview]);

  /**
   * Handle pointer cancel - cleanup on unexpected cancellation
   * F5: Clear column highlight
   */
  useEffect(() => {
    if (!dragState?.isDragging) {
      return;
    }

    const handlePointerCancel = (e: PointerEvent) => {
      e.preventDefault();

      // F8: Cancel pending RAF and clear drag preview
      cancelUpdate();
      clearDragPreview();

      // Restore original position
      if (elementRef.current) {
        const originalMinutes = dateToMinutes(dragState.originalStartAt);
        const topPx = (originalMinutes / 60) * hourHeight;
        elementRef.current.style.top = `${topPx}px`;
        // F5: Restore original left position
        elementRef.current.style.left = '';
      }

      // F5: Clear column highlight
      if (onDayHover) {
        onDayHover(null);
      }

      // Clear drag state
      setDragState(null);
      pointerIdRef.current = null;
    };

    document.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [dragState, hourHeight, onDayHover, cancelUpdate, clearDragPreview]);

  return {
    isDragging: dragState?.isDragging ?? false,
    eventHandlers: {
      onPointerDown: handlePointerDown,
    },
  };
};
