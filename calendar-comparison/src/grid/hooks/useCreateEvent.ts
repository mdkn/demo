import { useState, useEffect } from 'react';
import type { CalendarEvent, DayInfo } from '@shared/types';
import {
  pxToMinutes,
  snapToMinutes,
  calculateDateTime,
} from '@shared/utils/dragUtils';

const MINIMUM_DURATION_MINUTES = 15;

type CreationState = {
  isCreating: boolean;
  startMinutes: number;
  endMinutes: number;
  title: string;
};

type UseCreateEventProps = {
  onAdd: (event: Omit<CalendarEvent, 'id'>) => void;
  hourHeight: number;
  dayInfo: DayInfo;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * useCreateEvent hook for grid layout
 * Handles click/drag to create new events with inline title input
 * F7: Click-create feature
 */
export const useCreateEvent = ({
  onAdd,
  hourHeight,
  dayInfo,
  containerRef,
}: UseCreateEventProps) => {
  const [creationState, setCreationState] = useState<CreationState | null>(null);

  /**
   * Handle click on empty area - creates 1-hour event
   */
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore clicks on existing events
    const target = e.target as HTMLElement;
    if (target.closest('[class*="eventBlock"]')) return;
    if (target.closest('[class*="creationPlaceholder"]')) return;

    if (!containerRef.current) return;

    // Calculate click position to minutes
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    let startMinutes = pxToMinutes(offsetY, hourHeight);
    startMinutes = snapToMinutes(startMinutes, 15);

    // Default 1-hour duration, with minimum 15-minute enforcement
    let endMinutes = Math.min(startMinutes + 60, 1440);

    // T014: Enforce minimum duration
    if (endMinutes - startMinutes < MINIMUM_DURATION_MINUTES) {
      endMinutes = Math.min(startMinutes + MINIMUM_DURATION_MINUTES, 1440);
    }

    setCreationState({
      isCreating: true,
      startMinutes,
      endMinutes,
      title: '',
    });
  };

  /**
   * Confirm creation with title
   */
  const handleConfirm = (title: string) => {
    if (!creationState) return;

    const finalTitle = title.trim() || '新しいイベント';

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: finalTitle,
      startAt: calculateDateTime(dayInfo.date, creationState.startMinutes),
      endAt: calculateDateTime(dayInfo.date, creationState.endMinutes),
      color: '#3b82f6',
    };

    onAdd(newEvent);
    setCreationState(null);
  };

  /**
   * Cancel creation
   */
  const handleCancel = () => {
    setCreationState(null);
  };

  /**
   * T016: Handle outside click to cancel creation
   */
  useEffect(() => {
    if (!creationState) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ignore clicks inside the placeholder or its input
      if (target.closest('[class*="creationPlaceholder"]')) return;

      // Cancel creation on outside click
      handleCancel();
    };

    // Add listener after a small delay to avoid immediate cancellation
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [creationState]);

  return {
    creationState,
    backgroundHandlers: {
      onClick: handleBackgroundClick,
    },
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
};
