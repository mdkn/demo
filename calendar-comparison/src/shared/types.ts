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
