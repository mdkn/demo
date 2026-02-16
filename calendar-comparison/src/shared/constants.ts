// 1時間あたりのピクセル数
export const HOUR_HEIGHT = 60;

// 24時間分の合計高さ
export const TOTAL_HEIGHT = HOUR_HEIGHT * 24; // 1440px

// 週の日数
export const DAYS_IN_WEEK = 7;

// デフォルトのスクロール位置（8:00 = 480px）
export const DEFAULT_SCROLL_TOP = HOUR_HEIGHT * 8;

// localStorage のキー
export const STORAGE_KEY = 'calendar-events';
