/**
 * SlotCalendar
 *
 * A domain-neutral calendar component for displaying and selecting time slots.
 * Supports week, month, and day views with various selection modes.
 *
 * NO domain-specific terms (no "booking", "rental", "listing")
 * Props-driven - accepts generic cell data, not domain DTOs
 *
 * @example
 * ```tsx
 * <SlotCalendar
 *   cells={calendarCells}
 *   visibleStart={new Date()}
 *   viewMode="week"
 *   selectionMode="multiple"
 *   onCellClick={(cell) => handleCellClick(cell)}
 *   onSelectionChange={(ids) => setSelectedIds(ids)}
 * />
 * ```
 */
import * as React from 'react';
import { Button, Paragraph } from '@digdir/designsystemet-react';
import type { CalendarCell, LegendItem } from './types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ViewMode = 'week' | 'month' | 'day';
export type SelectionMode = 'single' | 'multiple' | 'range';
export type CellStatus = CalendarCell['status'];

export interface SlotCalendarLabels {
  today?: string;
  prev?: string;
  next?: string;
  week?: string;
  month?: string;
  day?: string;
  time?: string;
  legendTitle?: string;
}

export interface SlotCalendarProps {
  /** Array of calendar cells with status and optional labels/prices */
  cells: CalendarCell[];
  /** Currently selected cell IDs */
  selectedCellIds?: string[];
  /** Start date for the visible range */
  visibleStart: Date;
  /** View mode: week, month, or day */
  viewMode?: ViewMode;
  /** Selection mode: single, multiple, or range */
  selectionMode?: SelectionMode;
  /** Legend items to display below the calendar */
  legend?: LegendItem[];
  /** Customizable labels for internationalization */
  labels?: SlotCalendarLabels;
  /** Start hour for day/week grid (default: 8) */
  startHour?: number;
  /** End hour for day/week grid (default: 17) */
  endHour?: number;
  /** Show the legend below the calendar */
  showLegend?: boolean;
  /** Additional class name */
  className?: string;
  /** Callback when a cell is clicked */
  onCellClick?: (cell: CalendarCell) => void;
  /** Callback for navigation */
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get dates for the week starting from a given date
 */
function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Get dates for the month containing a given date
 */
function getMonthDates(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from the beginning of the week containing the first day
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // End at the end of the week containing the last day
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format a date range for display
 */
function formatDateRange(startDate: Date, viewMode: ViewMode): string {
  const formatter = new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (viewMode === 'day') {
    return formatter.format(startDate);
  }

  if (viewMode === 'month') {
    const monthFormatter = new Intl.DateTimeFormat('default', {
      month: 'long',
      year: 'numeric',
    });
    return monthFormatter.format(startDate);
  }

  // Week view
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

/**
 * Get abbreviated day name
 */
function getDayName(date: Date, short = true): string {
  const formatter = new Intl.DateTimeFormat('default', {
    weekday: short ? 'short' : 'long',
  });
  return formatter.format(date).toUpperCase();
}

// -----------------------------------------------------------------------------
// Style Utilities
// -----------------------------------------------------------------------------

function getCellBackgroundColor(status: CellStatus): string {
  switch (status) {
    case 'available':
      return 'var(--ds-color-success-surface-default)';
    case 'unavailable':
      return 'var(--ds-color-neutral-surface-hover)';
    case 'selected':
      return 'var(--ds-color-accent-surface-default)';
    case 'partial':
      return 'var(--ds-color-warning-surface-default)';
    case 'blocked':
      return 'var(--ds-color-danger-surface-default)';
    default:
      return 'var(--ds-color-neutral-surface-hover)';
  }
}

function getCellTextColor(status: CellStatus): string {
  switch (status) {
    case 'available':
      return 'var(--ds-color-success-text-default)';
    case 'unavailable':
      return 'var(--ds-color-neutral-text-subtle)';
    case 'selected':
      return 'var(--ds-color-accent-text-default)';
    case 'partial':
      return 'var(--ds-color-warning-text-default)';
    case 'blocked':
      return 'var(--ds-color-danger-text-default)';
    default:
      return 'var(--ds-color-neutral-text-subtle)';
  }
}

function getLegendColor(status: string): string {
  switch (status) {
    case 'available':
      return 'var(--ds-color-success-base-default)';
    case 'unavailable':
      return 'var(--ds-color-neutral-border-default)';
    case 'selected':
      return 'var(--ds-color-accent-base-default)';
    case 'partial':
      return 'var(--ds-color-warning-base-default)';
    case 'blocked':
      return 'var(--ds-color-danger-base-default)';
    default:
      return 'var(--ds-color-neutral-border-default)';
  }
}

// -----------------------------------------------------------------------------
// Default Values
// -----------------------------------------------------------------------------

const defaultLabels: Required<SlotCalendarLabels> = {
  today: 'Today',
  prev: 'Previous',
  next: 'Next',
  week: 'Week',
  month: 'Month',
  day: 'Day',
  time: 'Time',
  legendTitle: 'Legend',
};

const defaultLegend: LegendItem[] = [
  { status: 'available', label: 'Available', color: getLegendColor('available') },
  { status: 'unavailable', label: 'Unavailable', color: getLegendColor('unavailable') },
  { status: 'selected', label: 'Selected', color: getLegendColor('selected') },
  { status: 'partial', label: 'Partial', color: getLegendColor('partial') },
  { status: 'blocked', label: 'Blocked', color: getLegendColor('blocked') },
];

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

interface NavigationControlsProps {
  visibleStart: Date;
  viewMode: ViewMode;
  labels: Required<SlotCalendarLabels>;
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void;
}

function NavigationControls({
  visibleStart,
  viewMode,
  labels,
  onNavigate,
}: NavigationControlsProps) {
  return (
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
        onClick={() => onNavigate?.('prev')}
        aria-label={labels.prev}
      >
        <ChevronLeftIcon />
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        <Button
          type="button"
          variant="tertiary"
          data-size="sm"
          onClick={() => onNavigate?.('today')}
        >
          {labels.today}
        </Button>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
            minWidth: '180px',
            textAlign: 'center',
          }}
        >
          {formatDateRange(visibleStart, viewMode)}
        </Paragraph>
      </div>

      <Button
        type="button"
        variant="tertiary"
        data-size="sm"
        onClick={() => onNavigate?.('next')}
        aria-label={labels.next}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

interface ViewModeToggleProps {
  viewMode: ViewMode;
  labels: Required<SlotCalendarLabels>;
  onViewModeChange?: (mode: ViewMode) => void;
}

function ViewModeToggle({ viewMode, labels, onViewModeChange }: ViewModeToggleProps) {
  const modes: ViewMode[] = ['day', 'week', 'month'];

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-1)',
        padding: 'var(--ds-spacing-1)',
        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        borderRadius: 'var(--ds-border-radius-md)',
        marginBottom: 'var(--ds-spacing-3)',
      }}
    >
      {modes.map((mode) => (
        <Button
          key={mode}
          type="button"
          variant={viewMode === mode ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => onViewModeChange?.(mode)}
          style={{ flex: 1 }}
        >
          {labels[mode]}
        </Button>
      ))}
    </div>
  );
}

interface CalendarCellComponentProps {
  cell: CalendarCell;
  isSelected: boolean;
  isClickable: boolean;
  onClick?: () => void;
  ariaLabel: string;
}

function CalendarCellComponent({
  cell,
  isSelected,
  isClickable,
  onClick,
  ariaLabel,
}: CalendarCellComponentProps) {
  const status = isSelected ? 'selected' : cell.status;

  return (
    <div
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
        className="slot-calendar-cell"
        data-status={status}
        data-selected={isSelected}
        onClick={isClickable ? onClick : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        style={{
          width: '100%',
          padding: 'var(--ds-spacing-2)',
          backgroundColor: getCellBackgroundColor(status),
          color: getCellTextColor(status),
          fontSize: 'var(--ds-font-size-xs)',
          textAlign: 'center',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          borderRadius: 'var(--ds-border-radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'var(--ds-font-weight-medium)',
          gap: 'var(--ds-spacing-1)',
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            e.currentTarget.style.opacity = '0.85';
          }
        }}
        onMouseLeave={(e) => {
          if (isClickable) {
            e.currentTarget.style.opacity = '1';
          }
        }}
      >
        {cell.label && <span>{cell.label}</span>}
        {cell.price && (
          <span style={{ fontSize: 'var(--ds-font-size-xs)', opacity: 0.8 }}>{cell.price}</span>
        )}
      </div>
    </div>
  );
}

interface LegendComponentProps {
  items: LegendItem[];
  title: string;
}

function LegendComponent({ items, title }: LegendComponentProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-5)',
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
        {title}
      </Paragraph>
      {items.map((item) => (
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
              backgroundColor: item.color || getLegendColor(item.status),
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
  );
}

// -----------------------------------------------------------------------------
// Icons (inline to avoid external dependencies)
// -----------------------------------------------------------------------------

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function SlotCalendar({
  cells,
  selectedCellIds = [],
  visibleStart,
  viewMode = 'week',
  selectionMode = 'multiple',
  legend,
  labels: customLabels,
  startHour = 8,
  endHour = 17,
  showLegend = true,
  className,
  onCellClick,
  onNavigate,
  onViewModeChange,
  onSelectionChange,
}: SlotCalendarProps): React.ReactElement {
  const labels = { ...defaultLabels, ...customLabels };
  const legendItems = legend || defaultLegend;

  // Generate hours array for week/day view
  const hours = React.useMemo(() => {
    const result: number[] = [];
    for (let h = startHour; h <= endHour; h++) {
      result.push(h);
    }
    return result;
  }, [startHour, endHour]);

  // Generate dates based on view mode
  const dates = React.useMemo(() => {
    switch (viewMode) {
      case 'day':
        return [visibleStart];
      case 'month':
        return getMonthDates(visibleStart);
      case 'week':
      default:
        return getWeekDates(visibleStart);
    }
  }, [visibleStart, viewMode]);

  // Build a map for quick cell lookup
  const cellMap = React.useMemo(() => {
    const map = new Map<string, CalendarCell>();
    cells.forEach((cell) => {
      map.set(cell.id, cell);
    });
    return map;
  }, [cells]);

  // Find cell for a specific date and hour
  const findCell = React.useCallback(
    (date: Date, hour?: number): CalendarCell | undefined => {
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : '';

      for (const cell of cells) {
        const cellDateStr = cell.date.toISOString().split('T')[0];
        if (cellDateStr === dateStr) {
          if (hour === undefined) {
            return cell;
          }
          // Check if cell label matches the hour
          if (cell.label === timeStr || cell.label === `${hour}:00`) {
            return cell;
          }
        }
      }
      return undefined;
    },
    [cells]
  );

  // Handle cell selection
  const handleCellClick = React.useCallback(
    (cell: CalendarCell) => {
      onCellClick?.(cell);

      if (!onSelectionChange) return;

      const cellId = cell.id;
      let newSelection: string[];

      switch (selectionMode) {
        case 'single':
          newSelection = selectedCellIds.includes(cellId) ? [] : [cellId];
          break;

        case 'multiple':
          newSelection = selectedCellIds.includes(cellId)
            ? selectedCellIds.filter((id) => id !== cellId)
            : [...selectedCellIds, cellId];
          break;

        case 'range':
          if (selectedCellIds.length === 0) {
            newSelection = [cellId];
          } else if (selectedCellIds.length === 1) {
            // Select range between first selection and this cell
            const firstCellId = selectedCellIds[0];
            const firstCell = firstCellId ? cellMap.get(firstCellId) : undefined;
            if (firstCell) {
              const startTime = Math.min(firstCell.date.getTime(), cell.date.getTime());
              const endTime = Math.max(firstCell.date.getTime(), cell.date.getTime());
              newSelection = cells
                .filter((c) => {
                  const time = c.date.getTime();
                  return time >= startTime && time <= endTime;
                })
                .map((c) => c.id);
            } else {
              newSelection = [cellId];
            }
          } else {
            // Start new range
            newSelection = [cellId];
          }
          break;

        default:
          newSelection = selectedCellIds;
      }

      onSelectionChange(newSelection);
    },
    [cells, cellMap, selectedCellIds, selectionMode, onCellClick, onSelectionChange]
  );

  // Determine if a cell is clickable
  const isCellClickable = (cell: CalendarCell): boolean => {
    return cell.status === 'available' || cell.status === 'partial' || cell.status === 'selected';
  };

  // Render week/day grid
  const renderTimeGrid = () => {
    const columnCount = viewMode === 'day' ? 1 : 7;

    return (
      <div
        className="slot-calendar-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `60px repeat(${columnCount}, 1fr)`,
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
          {labels.time}
        </div>

        {dates.map((date, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--ds-spacing-2)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
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
              {getDayName(date)}
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
                {labels.today.toLowerCase()}
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
            {dates.map((date, dayIndex) => {
              const cell = findCell(date, hour);
              const isSelected = cell ? selectedCellIds.includes(cell.id) : false;
              const isClickable = cell ? isCellClickable(cell) : false;

              if (!cell) {
                // Render empty cell if no data
                return (
                  <div
                    key={dayIndex}
                    style={{
                      padding: 'var(--ds-spacing-1)',
                      minHeight: '44px',
                      backgroundColor: 'var(--ds-color-neutral-background-default)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        padding: 'var(--ds-spacing-2)',
                        backgroundColor: getCellBackgroundColor('unavailable'),
                        color: getCellTextColor('unavailable'),
                        fontSize: 'var(--ds-font-size-xs)',
                        textAlign: 'center',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                  </div>
                );
              }

              const fullDayName = getDayName(date, false);
              const ariaLabel = `${fullDayName} ${date.getDate()} at ${hour}:00 - ${cell.status}`;

              return (
                <CalendarCellComponent
                  key={dayIndex}
                  cell={{
                    ...cell,
                    label: cell.label || `${hour.toString().padStart(2, '0')}:00`,
                  }}
                  isSelected={isSelected}
                  isClickable={isClickable}
                  onClick={() => handleCellClick(cell)}
                  ariaLabel={ariaLabel}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render month grid
  const renderMonthGrid = () => {
    const weeks: Date[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }

    return (
      <div
        className="slot-calendar-month-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
          overflow: 'hidden',
        }}
      >
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            style={{
              padding: 'var(--ds-spacing-2)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              textAlign: 'center',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {day.toUpperCase()}
          </div>
        ))}

        {/* Date cells */}
        {weeks.flat().map((date, index) => {
          const cell = findCell(date);
          const isSelected = cell ? selectedCellIds.includes(cell.id) : false;
          const isClickable = cell ? isCellClickable(cell) : false;
          const isCurrentMonth = date.getMonth() === visibleStart.getMonth();

          if (!cell) {
            return (
              <div
                key={index}
                style={{
                  padding: 'var(--ds-spacing-2)',
                  minHeight: '60px',
                  backgroundColor: isCurrentMonth
                    ? 'var(--ds-color-neutral-background-default)'
                    : 'var(--ds-color-neutral-surface-hover)',
                  borderBottom:
                    index < weeks.flat().length - 7
                      ? '1px solid var(--ds-color-neutral-border-subtle)'
                      : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  opacity: isCurrentMonth ? 1 : 0.5,
                }}
              >
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: isToday(date) ? 'var(--ds-font-weight-semibold)' : 'normal',
                    color: isToday(date)
                      ? 'var(--ds-color-accent-base-default)'
                      : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {date.getDate()}
                </Paragraph>
              </div>
            );
          }

          const status = isSelected ? 'selected' : cell.status;
          const ariaLabel = `${getDayName(date, false)} ${date.getDate()} - ${cell.status}`;

          return (
            <div
              key={index}
              onClick={isClickable ? () => handleCellClick(cell) : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellClick(cell);
                      }
                    }
                  : undefined
              }
              aria-label={ariaLabel}
              aria-pressed={isSelected}
              style={{
                padding: 'var(--ds-spacing-2)',
                minHeight: '60px',
                backgroundColor: getCellBackgroundColor(status),
                borderBottom:
                  index < weeks.flat().length - 7
                    ? '1px solid var(--ds-color-neutral-border-subtle)'
                    : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                opacity: isCurrentMonth ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.opacity = isCurrentMonth ? '0.85' : '0.4';
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable) {
                  e.currentTarget.style.opacity = isCurrentMonth ? '1' : '0.5';
                }
              }}
            >
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: isToday(date) ? 'var(--ds-font-weight-semibold)' : 'normal',
                  color: getCellTextColor(status),
                }}
              >
                {date.getDate()}
              </Paragraph>
              {cell.price && (
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: getCellTextColor(status),
                    opacity: 0.8,
                  }}
                >
                  {cell.price}
                </Paragraph>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('slot-calendar', className)}>
      {/* View Mode Toggle */}
      <ViewModeToggle viewMode={viewMode} labels={labels} onViewModeChange={onViewModeChange} />

      {/* Navigation Controls */}
      <NavigationControls
        visibleStart={visibleStart}
        viewMode={viewMode}
        labels={labels}
        onNavigate={onNavigate}
      />

      {/* Calendar Grid */}
      {viewMode === 'month' ? renderMonthGrid() : renderTimeGrid()}

      {/* Legend */}
      {showLegend && <LegendComponent items={legendItems} title={labels.legendTitle} />}
    </div>
  );
}

export default SlotCalendar;
