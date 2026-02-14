import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '@shared/types';
import {
  snapToMinutes,
  clampMinutes,
  calculateNewTime,
  pxToMinutes,
  dateToMinutes,
} from '@shared/utils/dragUtils';

type DragState = {
  isDragging: boolean;
  startY: number;
  startMinutes: number;
  originalStartAt: string;
  originalEndAt: string;
};

type UseDragEventProps = {
  event: CalendarEvent;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * useDragEvent hook for absolute positioned layout
 * Handles drag start, move, drop, and cancellation for time-based event dragging
 */
export const useDragEvent = ({
  event,
  onUpdate,
  hourHeight,
  containerRef,
}: UseDragEventProps) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Calculate event duration in minutes
  const durationMinutes =
    dateToMinutes(event.endAt) - dateToMinutes(event.startAt);

  /**
   * Handle pointer down - start drag
   * Excludes resize handle regions (top 8px, bottom 8px)
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Exclude resize handle regions (reserved for F6)
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    if (offsetY < 8 || offsetY > rect.height - 8) {
      return; // In resize handle zone, don't start drag
    }

    // Capture pointer to track movement outside element
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    // Store element reference
    elementRef.current = e.currentTarget;

    // Initialize drag state
    setDragState({
      isDragging: true,
      startY: e.clientY,
      startMinutes: dateToMinutes(event.startAt),
      originalStartAt: event.startAt,
      originalEndAt: event.endAt,
    });
  };

  /**
   * Handle pointer move - update position during drag
   */
  useEffect(() => {
    if (!dragState?.isDragging || !elementRef.current || !containerRef.current) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();

      // Calculate delta from drag start
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);

      // Calculate new start time
      let newStartMinutes = dragState.startMinutes + deltaMinutes;

      // Apply 15-minute snap
      newStartMinutes = snapToMinutes(newStartMinutes, 15);

      // Apply range clamping (0:00 - 24:00)
      newStartMinutes = clampMinutes(newStartMinutes, durationMinutes);

      // Update element position immediately (no React re-render for smooth dragging)
      if (elementRef.current) {
        const topPx = (newStartMinutes / 60) * hourHeight;
        elementRef.current.style.top = `${topPx}px`;
      }
    };

    // Attach to document to track movement outside element
    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [dragState, hourHeight, durationMinutes, containerRef]);

  /**
   * Handle pointer up - finalize drag and update event
   */
  useEffect(() => {
    if (!dragState?.isDragging) {
      return;
    }

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();

      // Calculate final position
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);

      let newStartMinutes = dragState.startMinutes + deltaMinutes;
      newStartMinutes = snapToMinutes(newStartMinutes, 15);
      newStartMinutes = clampMinutes(newStartMinutes, durationMinutes);

      // Calculate new timestamps
      const newStartAt = calculateNewTime(event.startAt, newStartMinutes);
      const newEndAt = calculateNewTime(event.endAt, newStartMinutes + durationMinutes);

      // Update event through callback
      onUpdate(event.id, { startAt: newStartAt, endAt: newEndAt });

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
  }, [dragState, event, onUpdate, hourHeight, durationMinutes]);

  /**
   * Handle Escape key - cancel drag
   */
  useEffect(() => {
    if (!dragState?.isDragging) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();

        // Restore original position
        if (elementRef.current) {
          const originalMinutes = dateToMinutes(dragState.originalStartAt);
          const topPx = (originalMinutes / 60) * hourHeight;
          elementRef.current.style.top = `${topPx}px`;
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
  }, [dragState, hourHeight]);

  /**
   * Handle pointer cancel - cleanup on unexpected cancellation
   */
  useEffect(() => {
    if (!dragState?.isDragging) {
      return;
    }

    const handlePointerCancel = (e: PointerEvent) => {
      e.preventDefault();

      // Restore original position
      if (elementRef.current) {
        const originalMinutes = dateToMinutes(dragState.originalStartAt);
        const topPx = (originalMinutes / 60) * hourHeight;
        elementRef.current.style.top = `${topPx}px`;
      }

      // Clear drag state
      setDragState(null);
      pointerIdRef.current = null;
    };

    document.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [dragState, hourHeight]);

  return {
    isDragging: dragState?.isDragging ?? false,
    eventHandlers: {
      onPointerDown: handlePointerDown,
    },
  };
};
