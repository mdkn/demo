import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '@shared/types';
import {
  snapToMinutes,
  calculateNewTime,
  pxToMinutes,
  dateToMinutes,
} from '@shared/utils/dragUtils';

type ResizeState = {
  isResizing: boolean;
  resizeType: 'top' | 'bottom';
  startY: number;           // Resize start mouse Y coordinate
  startMinutes: number;     // Event start minutes at resize start (for top)
  endMinutes: number;       // Event end minutes at resize start (for bottom)
  originalStartAt: string;  // For Escape cancel
  originalEndAt: string;    // For Escape cancel
};

type UseResizeEventProps = {
  event: CalendarEvent;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * useResizeEvent hook for absolute positioned layout
 * Handles top/bottom edge resize to change start/end time independently
 * F6: Resize (time modification only, no date change)
 */
export const useResizeEvent = ({
  event,
  onUpdate,
  hourHeight,
  containerRef,
}: UseResizeEventProps) => {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  /**
   * Handle top handle pointer down - start top resize
   */
  const handleTopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent F4 drag from triggering

    // Capture pointer to track movement outside element
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    // Find parent EventBlock element
    const eventBlock = e.currentTarget.closest('[class*="eventBlock"]') as HTMLDivElement;
    elementRef.current = eventBlock;

    // Initialize resize state
    setResizeState({
      isResizing: true,
      resizeType: 'top',
      startY: e.clientY,
      startMinutes: dateToMinutes(event.startAt),
      endMinutes: dateToMinutes(event.endAt),
      originalStartAt: event.startAt,
      originalEndAt: event.endAt,
    });
  };

  /**
   * Handle bottom handle pointer down - start bottom resize
   */
  const handleBottomPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent F4 drag from triggering

    // Capture pointer to track movement outside element
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    // Find parent EventBlock element
    const eventBlock = e.currentTarget.closest('[class*="eventBlock"]') as HTMLDivElement;
    elementRef.current = eventBlock;

    // Initialize resize state
    setResizeState({
      isResizing: true,
      resizeType: 'bottom',
      startY: e.clientY,
      startMinutes: dateToMinutes(event.startAt),
      endMinutes: dateToMinutes(event.endAt),
      originalStartAt: event.startAt,
      originalEndAt: event.endAt,
    });
  };

  /**
   * Handle pointer move - update size during resize
   */
  useEffect(() => {
    if (!resizeState?.isResizing || !elementRef.current || !containerRef.current) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();

      // Calculate vertical delta
      const deltaY = e.clientY - resizeState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);

      if (resizeState.resizeType === 'top') {
        // Top resize: change startAt only, endAt stays fixed
        let newStartMinutes = resizeState.startMinutes + deltaMinutes;

        // Apply 15-minute snap
        newStartMinutes = snapToMinutes(newStartMinutes, 15);

        // Apply minimum duration constraint (15 minutes)
        const maxStartMinutes = resizeState.endMinutes - 15;
        newStartMinutes = Math.min(newStartMinutes, maxStartMinutes);

        // Apply range clamping (0:00 minimum)
        newStartMinutes = Math.max(0, newStartMinutes);

        // Update element style immediately (no React re-render for smooth resizing)
        if (elementRef.current) {
          const topPx = (newStartMinutes / 60) * hourHeight;
          const heightPx = ((resizeState.endMinutes - newStartMinutes) / 60) * hourHeight;
          elementRef.current.style.top = `${topPx}px`;
          elementRef.current.style.height = `${heightPx}px`;
        }
      } else {
        // Bottom resize: change endAt only, startAt stays fixed
        let newEndMinutes = resizeState.endMinutes + deltaMinutes;

        // Apply 15-minute snap
        newEndMinutes = snapToMinutes(newEndMinutes, 15);

        // Apply minimum duration constraint (15 minutes)
        const minEndMinutes = resizeState.startMinutes + 15;
        newEndMinutes = Math.max(newEndMinutes, minEndMinutes);

        // Apply range clamping (24:00 maximum)
        newEndMinutes = Math.min(1440, newEndMinutes);

        // Update element style immediately
        if (elementRef.current) {
          const heightPx = ((newEndMinutes - resizeState.startMinutes) / 60) * hourHeight;
          elementRef.current.style.height = `${heightPx}px`;
        }
      }
    };

    // Attach to document to track movement outside element
    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [resizeState, hourHeight, containerRef]);

  /**
   * Handle pointer up - finalize resize and update event
   */
  useEffect(() => {
    if (!resizeState?.isResizing) {
      return;
    }

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();

      // Calculate final position
      const deltaY = e.clientY - resizeState.startY;
      const deltaMinutes = pxToMinutes(deltaY, hourHeight);

      if (resizeState.resizeType === 'top') {
        // Top resize: update startAt only
        let newStartMinutes = resizeState.startMinutes + deltaMinutes;
        newStartMinutes = snapToMinutes(newStartMinutes, 15);
        const maxStartMinutes = resizeState.endMinutes - 15;
        newStartMinutes = Math.min(newStartMinutes, maxStartMinutes);
        newStartMinutes = Math.max(0, newStartMinutes);

        const newStartAt = calculateNewTime(event.startAt, newStartMinutes);
        onUpdate(event.id, { startAt: newStartAt });
      } else {
        // Bottom resize: update endAt only
        let newEndMinutes = resizeState.endMinutes + deltaMinutes;
        newEndMinutes = snapToMinutes(newEndMinutes, 15);
        const minEndMinutes = resizeState.startMinutes + 15;
        newEndMinutes = Math.max(newEndMinutes, minEndMinutes);
        newEndMinutes = Math.min(1440, newEndMinutes);

        const newEndAt = calculateNewTime(event.endAt, newEndMinutes);
        onUpdate(event.id, { endAt: newEndAt });
      }

      // Release pointer capture
      if (elementRef.current && pointerIdRef.current !== null) {
        try {
          elementRef.current.releasePointerCapture(pointerIdRef.current);
        } catch {
          // Ignore errors if capture was already released
        }
      }

      // Clear resize state
      setResizeState(null);
      pointerIdRef.current = null;
    };

    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [resizeState, event, onUpdate, hourHeight]);

  /**
   * Handle Escape key - cancel resize
   */
  useEffect(() => {
    if (!resizeState?.isResizing) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();

        // Restore original size
        if (elementRef.current) {
          const originalStartMinutes = dateToMinutes(resizeState.originalStartAt);
          const originalEndMinutes = dateToMinutes(resizeState.originalEndAt);
          const topPx = (originalStartMinutes / 60) * hourHeight;
          const heightPx = ((originalEndMinutes - originalStartMinutes) / 60) * hourHeight;
          elementRef.current.style.top = `${topPx}px`;
          elementRef.current.style.height = `${heightPx}px`;
        }

        // Release pointer capture
        if (elementRef.current && pointerIdRef.current !== null) {
          try {
            elementRef.current.releasePointerCapture(pointerIdRef.current);
          } catch {
            // Ignore errors
          }
        }

        // Clear resize state without updating event
        setResizeState(null);
        pointerIdRef.current = null;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [resizeState, hourHeight]);

  /**
   * Handle pointer cancel - cleanup on unexpected cancellation
   */
  useEffect(() => {
    if (!resizeState?.isResizing) {
      return;
    }

    const handlePointerCancel = (e: PointerEvent) => {
      e.preventDefault();

      // Restore original size
      if (elementRef.current) {
        const originalStartMinutes = dateToMinutes(resizeState.originalStartAt);
        const originalEndMinutes = dateToMinutes(resizeState.originalEndAt);
        const topPx = (originalStartMinutes / 60) * hourHeight;
        const heightPx = ((originalEndMinutes - originalStartMinutes) / 60) * hourHeight;
        elementRef.current.style.top = `${topPx}px`;
        elementRef.current.style.height = `${heightPx}px`;
      }

      // Clear resize state
      setResizeState(null);
      pointerIdRef.current = null;
    };

    document.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [resizeState, hourHeight]);

  return {
    isResizing: resizeState?.isResizing ?? false,
    resizeType: resizeState?.resizeType ?? null,
    topHandleProps: {
      onPointerDown: handleTopPointerDown,
    },
    bottomHandleProps: {
      onPointerDown: handleBottomPointerDown,
    },
  };
};
