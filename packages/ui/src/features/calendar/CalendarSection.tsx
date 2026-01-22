/**
 * CalendarSection Component
 *
 * Unified presentational calendar component for displaying rental object availability.
 * Supports TIME_SLOTS, ALL_DAY, and MULTI_DAY modes.
 *
 * This is a PRESENTATIONAL component - it does not contain SDK hooks.
 * Apps should provide their own thin wrappers that connect SDK data.
 *
 * ## Architecture
 *
 * ```
 * APP LAYER (Thin Wrapper)
 * ├── Uses SDK hooks (useCalendarConfig, useAvailabilityMatrix)
 * ├── Manages realtime subscriptions
 * └── Passes data to CalendarSection
 *
 * UI LAYER (This Component)
 * ├── Receives all data as props
 * ├── Handles selection state
 * ├── Renders RentalObjectAvailabilityCalendar
 * └── Emits callbacks (onDateChange, onSelectionChange)
 * ```
 *
 * @example
 * ```tsx
 * // In app wrapper:
 * import { CalendarSection } from '@digilist/ui/features/calendar';
 * import { useCalendarConfig, useAvailabilityMatrix } from '@digilist/client-sdk/hooks';
 *
 * export function CalendarWrapper({ rentalObjectId }) {
 *   const { data: config } = useCalendarConfig(rentalObjectId);
 *   const { data: matrix, isLoading } = useAvailabilityMatrix(rentalObjectId, dateRange);
 *
 *   return (
 *     <CalendarSection
 *       mode={config?.granularity}
 *       cells={matrix?.cells}
 *       isLoading={isLoading}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 */

import * as React from 'react';
import { Paragraph } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  RentalObjectAvailabilityCalendar,
  buildCalendarLegend,
  getCalendarSubtitle,
  getDateRangeForMode,
  mapToCalendarCell,
  type CalendarMode,
  type CalendarCell,
  type CalendarSelection,
  type CalendarLegendItem,
} from '../../blocks/calendar';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration data for the calendar (from SDK config hook)
 */
export interface CalendarConfig {
  granularity: CalendarMode;
  slotSizeMinutes?: number;
  openingHours?: {
    weekly?: Record<string, { open: string; close: string }>;
  };
  permissions?: {
    canBook?: boolean;
    canSelectSlot?: boolean;
  };
}

/**
 * Raw cell data from availability matrix (from SDK matrix hook)
 */
export interface RawCalendarCell {
  start: string;
  end: string;
  status: string;
  reasonKey?: string | null;
  bookingId?: string | null;
  blockId?: string | null;
  lockedUntil?: string | null;
}

/**
 * Legend data from API
 */
export interface RawLegendItem {
  status: string;
  labelKey: string;
}

export interface CalendarSectionProps {
  /**
   * Calendar configuration.
   * If undefined, component shows loading or empty state.
   */
  config?: CalendarConfig | null;

  /**
   * Availability matrix cells.
   * Can be raw cells (will be mapped) or already-mapped CalendarCell[].
   */
  cells?: RawCalendarCell[] | CalendarCell[];

  /**
   * Legend items from API (optional, defaults to standard legend).
   */
  legend?: RawLegendItem[];

  /**
   * Force a specific calendar mode (overrides config.granularity).
   */
  forceMode?: CalendarMode;

  /**
   * Current selection state (controlled).
   */
  selection?: CalendarSelection;

  /**
   * Callback when selection changes.
   */
  onSelectionChange?: (selection: CalendarSelection) => void;

  /**
   * Current date for calendar navigation (controlled).
   * If not provided, component manages its own date state.
   */
  currentDate?: Date;

  /**
   * Callback when navigation date changes.
   */
  onDateChange?: (date: Date) => void;

  /**
   * Whether the calendar is in read-only mode.
   * Default: false (interactive)
   */
  readOnly?: boolean;

  /**
   * Loading state.
   */
  isLoading?: boolean;

  /**
   * Error message to display.
   */
  errorMessage?: string;

  /**
   * Warning message to display (e.g., "selection may have changed").
   */
  warningMessage?: string;

  /**
   * Custom title for the calendar section.
   */
  title?: string;

  /**
   * Custom subtitle for the calendar section.
   */
  subtitle?: string;

  /**
   * Whether to show tips/hints.
   */
  showTips?: boolean;

  /**
   * Start hour for TIME_SLOTS mode (default: 8).
   */
  startHour?: number;

  /**
   * End hour for TIME_SLOTS mode (default: 17).
   */
  endHour?: number;

  /**
   * Custom class name for the wrapper.
   */
  className?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if cells are already mapped CalendarCells or raw cells
 */
function isCalendarCell(cell: RawCalendarCell | CalendarCell): cell is CalendarCell {
  return 'id' in cell;
}

/**
 * Normalize cells to CalendarCell[]
 */
function normalizeCells(cells: (RawCalendarCell | CalendarCell)[]): CalendarCell[] {
  return cells.map((cell) => {
    if (isCalendarCell(cell)) {
      return cell;
    }
    return mapToCalendarCell(cell) as CalendarCell;
  });
}

/**
 * Extract opening hours from config
 */
function getHoursFromConfig(
  config: CalendarConfig | null | undefined,
  type: 'start' | 'end',
  defaultValue: number
): number {
  const weekdayHours = config?.openingHours?.weekly?.['1'];
  if (!weekdayHours) return defaultValue;

  const timeStr = type === 'start' ? weekdayHours.open : weekdayHours.close;
  if (!timeStr) return defaultValue;

  const hour = parseInt(timeStr.split(':')[0]!, 10);
  return isNaN(hour) ? defaultValue : hour;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Unified CalendarSection component for displaying rental object availability.
 *
 * This is a presentational component that receives all data as props.
 * Apps should create thin wrappers that connect SDK hooks.
 */
export function CalendarSection({
  config,
  cells = [],
  legend,
  forceMode,
  selection: controlledSelection,
  onSelectionChange,
  currentDate: controlledDate,
  onDateChange,
  readOnly = false,
  isLoading = false,
  errorMessage,
  warningMessage,
  title,
  subtitle,
  showTips = true,
  startHour,
  endHour,
  className,
}: CalendarSectionProps): React.ReactElement {
  const t = useT();

  // Internal state for uncontrolled date
  const [internalDate, setInternalDate] = React.useState<Date>(new Date());
  const currentDate = controlledDate ?? internalDate;

  // Internal state for uncontrolled selection
  const [internalSelection, setInternalSelection] = React.useState<CalendarSelection | undefined>(
    undefined
  );
  const selection = controlledSelection ?? internalSelection;

  // Determine calendar mode: forceMode > config.granularity > default
  const calendarMode: CalendarMode = React.useMemo(() => {
    if (forceMode) return forceMode;
    if (config?.granularity) return config.granularity;
    return 'TIME_SLOTS';
  }, [forceMode, config]);

  // Normalize cells to CalendarCell[]
  const normalizedCells = React.useMemo(() => {
    if (!cells || cells.length === 0) return [];
    return normalizeCells(cells);
  }, [cells]);

  // Build legend from API response or use defaults
  const calendarLegend = React.useMemo(() => {
    return buildCalendarLegend(legend, t);
  }, [legend, t]);

  // Compute effective hours
  const effectiveStartHour = startHour ?? getHoursFromConfig(config, 'start', 8);
  const effectiveEndHour = endHour ?? getHoursFromConfig(config, 'end', 17);

  // Check permissions
  const canSelect = config?.permissions?.canBook ?? config?.permissions?.canSelectSlot ?? true;

  // Handle date change
  const handleDateChange = React.useCallback(
    (date: Date) => {
      if (onDateChange) {
        onDateChange(date);
      } else {
        setInternalDate(date);
      }
    },
    [onDateChange]
  );

  // Handle cell click
  const handleCellClick = React.useCallback(
    (cell: CalendarCell) => {
      if (readOnly || !canSelect) return;

      const updateSelection = (prev: CalendarSelection | undefined) => {
        const alreadySelected = prev?.cells.some((c) => c.id === cell.id);

        let newCells: CalendarCell[];
        if (alreadySelected) {
          newCells = prev?.cells.filter((c) => c.id !== cell.id) ?? [];
        } else {
          newCells = [...(prev?.cells ?? []), cell];
        }

        const newSelection: CalendarSelection = {
          cells: newCells,
          isValid: newCells.length > 0,
        };

        return newSelection;
      };

      if (onSelectionChange) {
        const newSelection = updateSelection(selection);
        onSelectionChange(newSelection);
      } else {
        setInternalSelection(updateSelection);
      }
    },
    [readOnly, canSelect, selection, onSelectionChange]
  );

  // Handle selection change (direct)
  const handleSelectionChange = React.useCallback(
    (newSelection: CalendarSelection | undefined) => {
      if (onSelectionChange && newSelection) {
        onSelectionChange(newSelection);
      } else {
        setInternalSelection(newSelection);
      }
    },
    [onSelectionChange]
  );

  // Compute title and subtitle
  const effectiveTitle = title ?? t('components.calendar.selectTime');
  const effectiveSubtitle = subtitle ?? getCalendarSubtitle(calendarMode, t);

  // Empty state if no config and not loading
  if (!isLoading && !config && !errorMessage) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-8)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, fontStyle: 'italic' }}>
          {t('components.calendar.notAvailable')}
        </Paragraph>
      </div>
    );
  }

  return (
    <div className={className}>
      <RentalObjectAvailabilityCalendar
        mode={calendarMode}
        cells={normalizedCells}
        selection={selection}
        legend={calendarLegend as CalendarLegendItem[]}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onCellClick={readOnly || !canSelect ? undefined : handleCellClick}
        onSelectionChange={readOnly || !canSelect ? undefined : handleSelectionChange}
        startHour={effectiveStartHour}
        endHour={effectiveEndHour}
        slotSizeMinutes={config?.slotSizeMinutes ?? 60}
        showTips={showTips}
        title={effectiveTitle}
        subtitle={effectiveSubtitle}
        isLoading={isLoading}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        readOnly={readOnly || !canSelect}
      />
    </div>
  );
}

export default CalendarSection;
