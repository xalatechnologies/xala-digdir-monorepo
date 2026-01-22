/**
 * Calendar Types
 */

export type CalendarSlotStatus = 'available' | 'selected' | 'unavailable' | 'blocked' | 'pending';

export type CalendarMode = 'day' | 'week' | 'month' | 'year';

export interface CalendarSlot {
  date: Date;
  startTime?: string;
  endTime?: string;
  status: CalendarSlotStatus;
  price?: number;
  label?: string;
}

export interface CalendarCell {
  date: Date;
  slots?: CalendarSlot[];
  isToday?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isOutsideMonth?: boolean;
}

export interface CalendarSelection {
  type: 'single' | 'range' | 'multiple';
  dates: Date[];
  slots?: CalendarSlot[];
  startDate?: Date;
  endDate?: Date;
}

export interface CalendarConfig {
  mode?: CalendarMode;
  selectionType?: 'single' | 'range' | 'multiple';
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  locale?: string;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
