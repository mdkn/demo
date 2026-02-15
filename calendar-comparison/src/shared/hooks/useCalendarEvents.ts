import { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { STORAGE_KEY } from '../constants';
import { sampleEvents } from '../sampleEvents';

/**
 * localStorage でイベントを永続化する Hook
 *
 * 初回起動時: サンプルデータで初期化
 * 以降: localStorage から読み込み
 */
export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    // 初期化時に localStorage から読み込み
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CalendarEvent[];
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
    }
    // localStorage がない場合はサンプルデータで初期化
    return sampleEvents;
  });

  // events が変更されたら localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save events to localStorage:', error);
    }
  }, [events]);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      ...event,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const resetEvents = () => {
    setEvents(sampleEvents);
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    resetEvents,
  };
};
