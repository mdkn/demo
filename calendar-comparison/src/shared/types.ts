export type DayInfo = {
  date: Date;
  dayOfWeek: string;
  dateLabel: string;
  columnIndex: number;
  isToday: boolean;
};

export type ViewMode = 'absolute' | 'grid';

export type TimeSlot = {
  hour: number;
  label: string;
  topPosition: number;
};

export type CalendarEvent = {
  id: string;              // UUID (crypto.randomUUID())
  title: string;           // イベント名
  startAt: string;         // ISO 8601 形式 (例: "2026-02-14T09:00:00")
  endAt: string;           // ISO 8601 形式
  color: string;           // CSS color (例: "#3b82f6")
};

// Absolute 方式のレイアウト結果
export type AbsoluteEventLayout = {
  event: CalendarEvent;
  top: number;         // px
  left: string;        // percentage (例: "0%", "25%")
  width: string;       // percentage (例: "25%")
  height: number;      // px
  zIndex: number;      // 重なり時の前後関係
};

// Grid 方式のレイアウト結果
export type GridEventLayout = {
  event: CalendarEvent;
  gridRow: string;     // "540 / span 180"
  gridColumn: number;  // 1-based column index
  colSpan: number;     // span 数（通常 1）
};

// 現在時刻の情報
export type CurrentTime = {
  now: Date;                    // 現在時刻
  minutesFromMidnight: number;  // 0:00からの経過分 (0-1439)
};
