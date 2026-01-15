/**
 * ListingAvailabilityCalendar
 *
 * Dynamic availability calendar with mode switching (TIME_SLOTS, ALL_DAY, MULTI_DAY).
 * Consumes ListingCalendarConfigProjectionDTO and ListingAvailabilityMatrixProjectionDTO
 * from the API without any frontend transformation.
 *
 * This component implements:
 * - TIME_SLOTS mode: Week/day timeline view with hourly slots
 * - ALL_DAY mode: Month view with day selection
 * - MULTI_DAY mode: Date range picker (future subtask)
 */
import * as React from 'react';
import { Button, Heading, Paragraph, Alert } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, ClockIcon, CalendarIcon } from '../primitives/icons';
import type {
  CalendarMode,
  CalendarSlotStatus,
  CalendarCell,
  CalendarSelection,
  CalendarLegendItem,
  CalendarViewMode,
} from '../types/listing-detail';
import {
  CALENDAR_SLOT_STATUS_LABELS,
  DEFAULT_CALENDAR_LEGEND,
  isCalendarSlotSelectable,
  getCalendarSlotLabel,
} from '../types/listing-detail';

// =============================================================================
// Types
// =============================================================================

export interface ListingAvailabilityCalendarProps {
  /** Calendar mode from config projection (TIME_SLOTS, ALL_DAY, MULTI_DAY) */
  mode: CalendarMode;
  /** Cells from availability matrix projection */
  cells: CalendarCell[];
  /** Currently selected cells */
  selection?: CalendarSelection;
  /** Legend items for status display */
  legend?: CalendarLegendItem[];
  /** Current date for navigation */
  currentDate: Date;
  /** Callback when date navigation changes */
  onDateChange?: (date: Date) => void;
  /** Callback when a cell is clicked */
  onCellClick?: (cell: CalendarCell) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selection: CalendarSelection) => void;
  /** Start hour for TIME_SLOTS mode (default: 8) */
  startHour?: number;
  /** End hour for TIME_SLOTS mode (default: 17) */
  endHour?: number;
  /** Slot size in minutes (default: 60) */
  slotSizeMinutes?: number;
  /** Show tips panel */
  showTips?: boolean;
  /** Title for the calendar section */
  title?: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Current view mode for display */
  viewMode?: CalendarViewMode;
  /** Whether to allow view mode switching */
  allowViewSwitch?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error message from API */
  errorMessage?: string;
  /** Warning message for selection invalidation */
  warningMessage?: string;
  /** Whether calendar is read-only (view mode) */
  readOnly?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

// Norwegian day abbreviations
const DAY_NAMES = ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'];
const DAY_NAMES_FULL = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// Norwegian month names
const MONTH_NAMES = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];
const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des',
];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format date range for week view header
 */
function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = MONTH_NAMES_SHORT[startDate.getMonth()];
  const endMonth = MONTH_NAMES_SHORT[endDate.getMonth()];
  const year = startDate.getFullYear();

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDay}. - ${endDay}. ${startMonth} ${year}`;
  }
  return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`;
}

/**
 * Get week start date (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get first day of month
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Format month and year for header (Norwegian)
 */
function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get all days in a month grid (includes padding days from prev/next months)
 * Returns 6 weeks (42 days) to ensure consistent grid size
 */
function getMonthGridDays(date: Date): Date[] {
  const monthStart = getMonthStart(date);
  const days: Date[] = [];

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  let startDayOfWeek = monthStart.getDay();
  // Adjust for Monday start (Monday = 0, Sunday = 6)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Add padding days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - i - 1);
    days.push(d);
  }

  // Add all days of current month
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), i, 0, 0, 0, 0));
  }

  // Add padding days from next month to complete 6 weeks (42 days)
  const remainingDays = 42 - days.length;
  if (remainingDays > 0 && days.length > 0) {
    const lastDay = days[days.length - 1]!;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(lastDay);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
  }

  return days;
}

/**
 * Check if a date is in a given month
 */
function isInMonth(date: Date, monthDate: Date): boolean {
  return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get cell color based on status
 */
function getCellBackgroundColor(status: CalendarSlotStatus, isSelected: boolean): string {
  if (isSelected) {
    return 'var(--ds-color-accent-surface-active)';
  }

  switch (status) {
    case 'AVAILABLE':
      return 'var(--ds-color-success-surface-default)';
    case 'RESERVED':
      return 'var(--ds-color-warning-surface-default)';
    case 'BOOKED':
      return 'var(--ds-color-danger-surface-default)';
    case 'BLOCKED':
      return 'var(--ds-color-neutral-surface-default)';
    case 'BLACKOUT':
      return 'var(--ds-color-neutral-surface-active)';
    case 'CLOSED':
      return 'var(--ds-color-neutral-surface-hover)';
    default:
      return 'var(--ds-color-neutral-surface-default)';
  }
}

/**
 * Get cell text color based on status
 */
function getCellTextColor(status: CalendarSlotStatus, isSelected: boolean): string {
  if (isSelected) {
    return 'var(--ds-color-accent-text-default)';
  }

  switch (status) {
    case 'AVAILABLE':
      return 'var(--ds-color-success-text-default)';
    case 'RESERVED':
      return 'var(--ds-color-warning-text-default)';
    case 'BOOKED':
      return 'var(--ds-color-danger-text-default)';
    case 'BLOCKED':
    case 'BLACKOUT':
    case 'CLOSED':
      return 'var(--ds-color-neutral-text-subtle)';
    default:
      return 'var(--ds-color-neutral-text-default)';
  }
}

/**
 * Get legend color for status
 */
function getLegendColor(status: CalendarSlotStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'var(--ds-color-success-base-default)';
    case 'RESERVED':
      return 'var(--ds-color-warning-base-default)';
    case 'BOOKED':
      return 'var(--ds-color-danger-base-default)';
    case 'BLOCKED':
      return 'var(--ds-color-neutral-border-default)';
    case 'BLACKOUT':
      return 'var(--ds-color-neutral-text-subtle)';
    case 'CLOSED':
      return 'var(--ds-color-neutral-border-subtle)';
    default:
      return 'var(--ds-color-neutral-border-default)';
  }
}

// =============================================================================
// Sub-Components
// =============================================================================

interface TimeSlotsCellProps {
  cell: CalendarCell;
  isSelected: boolean;
  isClickable: boolean;
  readOnly: boolean;
  onCellClick?: (cell: CalendarCell) => void;
  hour: number;
  dayName: string;
  dayNumber: number;
}

function TimeSlotsCell({
  cell,
  isSelected,
  isClickable,
  readOnly,
  onCellClick,
  hour,
  dayName,
  dayNumber,
}: TimeSlotsCellProps): React.ReactElement {
  const status = cell.status;
  const canClick = isClickable && !readOnly;
  const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

  const handleClick = () => {
    if (canClick && onCellClick) {
      onCellClick(cell);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && canClick && onCellClick) {
      e.preventDefault();
      onCellClick(cell);
    }
  };

  return (
    <div
      className={cn('listing-calendar-cell', isSelected && 'selected')}
      data-status={status}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={canClick ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      aria-label={`${dayName} ${dayNumber} kl ${timeLabel} - ${getCalendarSlotLabel(status)}${isSelected ? ' (valgt)' : ''}`}
      title={cell.reasonKey ? cell.reasonKey : undefined}
      style={{
        padding: 'var(--ds-spacing-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40px',
        backgroundColor: getCellBackgroundColor(status, isSelected),
        color: getCellTextColor(status, isSelected),
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-medium)',
        cursor: canClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        borderRadius: 'var(--ds-border-radius-sm)',
        border: isSelected ? '2px solid var(--ds-color-accent-base-default)' : '1px solid transparent',
      }}
    >
      {timeLabel}
    </div>
  );
}

interface AllDayCellProps {
  date: Date;
  cell: CalendarCell | undefined;
  isSelected: boolean;
  isClickable: boolean;
  isCurrentMonth: boolean;
  readOnly: boolean;
  onCellClick?: (cell: CalendarCell) => void;
}

function AllDayCell({
  date,
  cell,
  isSelected,
  isClickable,
  isCurrentMonth,
  readOnly,
  onCellClick,
}: AllDayCellProps): React.ReactElement {
  const status = cell?.status ?? 'CLOSED';
  const canClick = isClickable && !readOnly && cell;
  const today = isToday(date);

  const handleClick = () => {
    if (canClick && onCellClick && cell) {
      onCellClick(cell);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && canClick && onCellClick && cell) {
      e.preventDefault();
      onCellClick(cell);
    }
  };

  // Determine background color
  const getBackgroundColor = (): string => {
    if (!isCurrentMonth) {
      return 'var(--ds-color-neutral-background-default)';
    }
    if (isSelected) {
      return 'var(--ds-color-accent-surface-active)';
    }
    if (!cell) {
      return 'var(--ds-color-neutral-surface-hover)';
    }
    return getCellBackgroundColor(status, false);
  };

  // Determine text color
  const getTextColor = (): string => {
    if (!isCurrentMonth) {
      return 'var(--ds-color-neutral-text-subtle)';
    }
    if (isSelected) {
      return 'var(--ds-color-accent-text-default)';
    }
    if (!cell) {
      return 'var(--ds-color-neutral-text-subtle)';
    }
    return getCellTextColor(status, false);
  };

  return (
    <div
      className={cn('listing-calendar-day-cell', isSelected && 'selected')}
      data-status={status}
      data-current-month={isCurrentMonth}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={canClick ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      aria-label={`${DAY_NAMES_FULL[date.getDay()]} ${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} - ${cell ? getCalendarSlotLabel(status) : 'Stengt'}${isSelected ? ' (valgt)' : ''}`}
      title={cell?.reasonKey ? cell.reasonKey : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '56px',
        padding: 'var(--ds-spacing-2)',
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        cursor: canClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        borderRadius: 'var(--ds-border-radius-sm)',
        border: isSelected
          ? '2px solid var(--ds-color-accent-base-default)'
          : today && isCurrentMonth
            ? '2px solid var(--ds-color-accent-border-default)'
            : '1px solid transparent',
        opacity: isCurrentMonth ? 1 : 0.5,
      }}
    >
      <span
        style={{
          fontSize: 'var(--ds-font-size-sm)',
          fontWeight: today
            ? 'var(--ds-font-weight-bold)'
            : 'var(--ds-font-weight-medium)',
        }}
      >
        {date.getDate()}
      </span>
      {today && isCurrentMonth && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-accent-text-default)',
          }}
        >
          i dag
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * ListingAvailabilityCalendar component
 *
 * @example
 * ```tsx
 * // TIME_SLOTS mode
 * <ListingAvailabilityCalendar
 *   mode="TIME_SLOTS"
 *   cells={availabilityMatrix.cells}
 *   currentDate={new Date()}
 *   onDateChange={(date) => setCurrentDate(date)}
 *   onCellClick={(cell) => toggleSelection(cell)}
 * />
 * ```
 */
export function ListingAvailabilityCalendar({
  mode,
  cells,
  selection,
  legend = DEFAULT_CALENDAR_LEGEND,
  currentDate,
  onDateChange,
  onCellClick,
  onSelectionChange: _onSelectionChange,
  startHour = 8,
  endHour = 17,
  slotSizeMinutes = 60,
  showTips = true,
  title = 'Tilgjengelighet',
  subtitle,
  viewMode: _viewMode = 'week',
  allowViewSwitch: _allowViewSwitch = false,
  isLoading = false,
  errorMessage,
  warningMessage,
  readOnly = false,
  className,
}: ListingAvailabilityCalendarProps): React.ReactElement {
  // Generate hours array for TIME_SLOTS mode
  const hours = React.useMemo(() => {
    const result: number[] = [];
    for (let h = startHour; h <= endHour; h++) {
      result.push(h);
    }
    return result;
  }, [startHour, endHour]);

  // Get week start for navigation
  const weekStart = React.useMemo(() => getWeekStart(currentDate), [currentDate]);

  // Generate week dates
  const weekDates = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [weekStart]);

  // Get cell for a specific date and hour
  const getCellForSlot = React.useCallback(
    (date: Date, hour: number): CalendarCell | undefined => {
      const targetStart = new Date(date);
      targetStart.setHours(hour, 0, 0, 0);

      return cells.find((cell) => {
        const cellStart = new Date(cell.start);
        return isSameDay(cellStart, date) && cellStart.getHours() === hour;
      });
    },
    [cells]
  );

  // Check if a cell is selected
  const isCellSelected = React.useCallback(
    (cell: CalendarCell): boolean => {
      if (!selection) return false;
      return selection.cells.some((selected) => selected.id === cell.id);
    },
    [selection]
  );

  // Navigation handlers
  const handlePrevWeek = () => {
    if (onDateChange) {
      const newDate = new Date(weekStart);
      newDate.setDate(newDate.getDate() - 7);
      onDateChange(newDate);
    }
  };

  const handleNextWeek = () => {
    if (onDateChange) {
      const newDate = new Date(weekStart);
      newDate.setDate(newDate.getDate() + 7);
      onDateChange(newDate);
    }
  };

  // Get month start for ALL_DAY navigation
  const monthStart = React.useMemo(() => getMonthStart(currentDate), [currentDate]);

  // Generate month grid days for ALL_DAY mode
  const monthGridDays = React.useMemo(() => getMonthGridDays(currentDate), [currentDate]);

  // Get cell for a specific day (for ALL_DAY mode)
  const getCellForDay = React.useCallback(
    (date: Date): CalendarCell | undefined => {
      return cells.find((cell) => {
        const cellStart = new Date(cell.start);
        return isSameDay(cellStart, date);
      });
    },
    [cells]
  );

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (onDateChange) {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      newDate.setDate(1);
      onDateChange(newDate);
    }
  };

  const handleNextMonth = () => {
    if (onDateChange) {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      newDate.setDate(1);
      onDateChange(newDate);
    }
  };

  // Render TIME_SLOTS mode
  const renderTimeSlotsMode = (): React.ReactElement => {
    return (
      <div className="listing-calendar-timeslots">
        {/* Week Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={handlePrevWeek}
            aria-label="Forrige uke"
            disabled={isLoading}
          >
            <ChevronLeftIcon size={16} />
          </Button>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {formatWeekRange(weekStart)}
          </Paragraph>
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={handleNextWeek}
            aria-label="Neste uke"
            disabled={isLoading}
          >
            <ChevronRightIcon size={16} />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div
          className="listing-calendar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(7, 1fr)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div
            style={{
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
              padding: 'var(--ds-spacing-2)',
            }}
          >
            <ClockIcon size={14} />
          </div>
          {weekDates.map((date, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--ds-spacing-2)',
                backgroundColor: isToday(date)
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-background-default)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                textAlign: 'center',
              }}
            >
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {DAY_NAMES[date.getDay()]}
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: isToday(date)
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-text-default)',
                }}
              >
                {date.getDate()}
              </Paragraph>
              {isToday(date) && (
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-accent-base-default)',
                  }}
                >
                  i dag
                </Paragraph>
              )}
            </div>
          ))}

          {/* Time rows */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div
                style={{
                  padding: 'var(--ds-spacing-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Day cells */}
              {weekDates.map((date, dayIndex) => {
                const cell = getCellForSlot(date, hour);
                const isSelected = cell ? isCellSelected(cell) : false;
                const isClickable = cell ? isCalendarSlotSelectable(cell.status) : false;

                if (!cell) {
                  // No data for this slot - render empty/closed cell
                  return (
                    <div
                      key={dayIndex}
                      style={{
                        padding: 'var(--ds-spacing-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '44px',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          padding: 'var(--ds-spacing-2)',
                          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                          fontSize: 'var(--ds-font-size-xs)',
                          textAlign: 'center',
                          borderRadius: 'var(--ds-border-radius-sm)',
                        }}
                      >
                        —
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={dayIndex}
                    style={{
                      padding: 'var(--ds-spacing-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '44px',
                      backgroundColor: 'var(--ds-color-neutral-background-default)',
                    }}
                  >
                    <TimeSlotsCell
                      cell={cell}
                      isSelected={isSelected}
                      isClickable={isClickable}
                      readOnly={readOnly}
                      onCellClick={onCellClick}
                      hour={hour}
                      dayName={DAY_NAMES_FULL[date.getDay()] ?? ''}
                      dayNumber={date.getDate()}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-4)',
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            flexWrap: 'wrap',
          }}
        >
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Forklaring
          </Paragraph>
          {legend.map((item) => (
            <div
              key={item.status}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: getLegendColor(item.status),
                }}
              />
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {item.label}
              </Paragraph>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render ALL_DAY mode (month view day picker)
  const renderAllDayMode = (): React.ReactElement => {
    // Norwegian weekday headers (Monday first)
    const weekDayHeaders = ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'];

    return (
      <div className="listing-calendar-allday">
        {/* Month Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={handlePrevMonth}
            aria-label="Forrige måned"
            disabled={isLoading}
          >
            <ChevronLeftIcon size={16} />
          </Button>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {formatMonthYear(monthStart)}
          </Paragraph>
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={handleNextMonth}
            aria-label="Neste måned"
            disabled={isLoading}
          >
            <ChevronRightIcon size={16} />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div
          className="listing-calendar-month-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            overflow: 'hidden',
            gap: '1px',
            backgroundColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          {/* Weekday headers */}
          {weekDayHeaders.map((day) => (
            <div
              key={day}
              style={{
                padding: 'var(--ds-spacing-2)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                textAlign: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {monthGridDays.map((date, index) => {
            const cell = getCellForDay(date);
            const isSelected = cell ? isCellSelected(cell) : false;
            const isClickable = cell ? isCalendarSlotSelectable(cell.status) : false;
            const isCurrentMonth = isInMonth(date, currentDate);

            return (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  padding: 'var(--ds-spacing-1)',
                }}
              >
                <AllDayCell
                  date={date}
                  cell={cell}
                  isSelected={isSelected}
                  isClickable={isClickable}
                  isCurrentMonth={isCurrentMonth}
                  readOnly={readOnly}
                  onCellClick={onCellClick}
                />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-4)',
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            flexWrap: 'wrap',
          }}
        >
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Forklaring
          </Paragraph>
          {legend.map((item) => (
            <div
              key={item.status}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: getLegendColor(item.status),
                }}
              />
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {item.label}
              </Paragraph>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render MULTI_DAY mode (placeholder for future subtask)
  const renderMultiDayMode = (): React.ReactElement => {
    return (
      <div className="listing-calendar-multiday">
        <Alert data-color="info">
          <Heading level={4} data-size="xs">
            Flerdagsmodus
          </Heading>
          <Paragraph data-size="sm">
            Velg start- og sluttdato for å booke flere dager.
          </Paragraph>
        </Alert>
        {/* Date range picker implementation will be added in subtask-6-4 */}
      </div>
    );
  };

  // Render content based on mode
  const renderContent = (): React.ReactElement => {
    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Laster tilgjengelighet...
          </Paragraph>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <Alert data-color="danger">
          <Paragraph data-size="sm">{errorMessage}</Paragraph>
        </Alert>
      );
    }

    switch (mode) {
      case 'TIME_SLOTS':
        return renderTimeSlotsMode();
      case 'ALL_DAY':
        return renderAllDayMode();
      case 'MULTI_DAY':
        return renderMultiDayMode();
      default:
        return renderTimeSlotsMode();
    }
  };

  return (
    <div className={cn('listing-availability-calendar', className)}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-1)',
            }}
          >
            <CalendarIcon size={20} />
            <Heading
              level={3}
              data-size="sm"
              style={{ margin: 0 }}
            >
              {title}
            </Heading>
          </div>
          {subtitle && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {subtitle}
            </Paragraph>
          )}
        </div>
      </div>

      {/* Warning banner for selection invalidation */}
      {warningMessage && (
        <Alert
          data-color="warning"
          style={{ marginBottom: 'var(--ds-spacing-4)' }}
        >
          <Paragraph data-size="sm">{warningMessage}</Paragraph>
        </Alert>
      )}

      {/* Main content area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showTips && (mode === 'TIME_SLOTS' || mode === 'ALL_DAY') ? '1fr 280px' : '1fr',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Calendar content */}
        <div>{renderContent()}</div>

        {/* Tips panel */}
        {showTips && (mode === 'TIME_SLOTS' || mode === 'ALL_DAY') && !isLoading && !errorMessage && (
          <div>
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-lg)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            >
              <Heading
                level={4}
                data-size="xs"
                style={{ margin: '0 0 var(--ds-spacing-2) 0' }}
              >
                {mode === 'ALL_DAY' ? 'Valgte datoer' : 'Valgte tidspunkter'}
              </Heading>
              {selection && selection.cells.length > 0 ? (
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {selection.cells.length} {mode === 'ALL_DAY' ? 'dag' : 'tidspunkt'}{selection.cells.length > 1 ? 'er' : ''} valgt
                </Paragraph>
              ) : (
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {mode === 'ALL_DAY'
                    ? 'Klikk på ledige dager for å velge dem.'
                    : 'Klikk på ledige tidspunkter for å velge dem.'}
                </Paragraph>
              )}
            </div>

            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                border: '1px solid var(--ds-color-info-border-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  marginBottom: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-info-text-default)',
                }}
              >
                <InfoIcon size={16} />
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                  }}
                >
                  Tips
                </Paragraph>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 'var(--ds-spacing-4)',
                  color: 'var(--ds-color-info-text-default)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                {mode === 'ALL_DAY' ? (
                  <>
                    <li>Klikk på ledige (grønne) dager for å velge</li>
                    <li>Hver dag representerer en heldagsbooking</li>
                    <li>Bytt mellom måneder med pilene</li>
                    {!readOnly && <li>Valgte datoer vises med blå ramme</li>}
                  </>
                ) : (
                  <>
                    <li>Klikk på ledige (grønne) tidspunkter for å velge</li>
                    <li>Du kan velge flere tidspunkter samtidig</li>
                    <li>Bytt mellom uker med pilene</li>
                    {!readOnly && <li>Valgte tidspunkter vises med blå ramme</li>}
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingAvailabilityCalendar;
