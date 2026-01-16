/**
 * CalendarSection Component
 *
 * Integrates the ListingAvailabilityCalendar from @xala/ds with SDK hooks.
 * Displays dynamic availability calendar based on rental object configuration.
 * Supports TIME_SLOTS, ALL_DAY, and MULTI_DAY modes.
 *
 * This is the minside app version, intended for user's rental object views
 * where users can view availability for rental objects they're interested in.
 *
 * Following the SDK-first rule: all data comes from API projection DTOs.
 * No local rule evaluation or transformation.
 */

import * as React from 'react';
import { Paragraph, RentalObjectAvailabilityCalendar } from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  useListingCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from '@digilist/client-sdk/hooks';

// =============================================================================
// Types
// =============================================================================

/** Calendar mode as returned by config */
type CalendarMode = 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';

/** Availability status for calendar slots */
type CalendarSlotStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'BOOKED'
  | 'BLOCKED'
  | 'BLACKOUT'
  | 'CLOSED';

/** Single cell in the availability calendar */
interface CalendarCell {
  id: string;
  start: string;
  end: string;
  status: CalendarSlotStatus;
  reasonKey?: string;
  bookingId?: string;
  blockId?: string;
  lockedUntil?: string;
}

/** Current calendar selection state */
interface CalendarSelection {
  cells: CalendarCell[];
  range?: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  };
  isValid: boolean;
  errorKey?: string;
}

export interface CalendarSectionProps {
  /** Rental object ID to fetch calendar data for */
  rentalObjectId: string;
  /** @deprecated Use rentalObjectId instead */
  listingId?: string;
  /** Optional booking type filter */
  bookingType?: string;
  /** Callback when selection changes */
  onSelectionChange?: (selection: CalendarSelection) => void;
  /** Whether the calendar is read-only (view mode) */
  readOnly?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Get week start date (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get week end date (Sunday)
 */
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
}

/**
 * Get month start date
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get month end date
 */
function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Map SDK AvailabilityCellDTO to ds CalendarCell
 */
function mapToCalendarCell(cell: {
  start: string;
  end: string;
  status: string;
  reasonKey?: string | null;
  bookingId?: string | null;
  blockId?: string | null;
  lockedUntil?: string | null;
}): CalendarCell {
  return {
    id: `${cell.start}-${cell.end}`,
    start: cell.start,
    end: cell.end,
    status: cell.status as CalendarSlotStatus,
    reasonKey: cell.reasonKey ?? undefined,
    bookingId: cell.bookingId ?? undefined,
    blockId: cell.blockId ?? undefined,
    lockedUntil: cell.lockedUntil ?? undefined,
  };
}

// =============================================================================
// Component
// =============================================================================

export function CalendarSection({
  rentalObjectId,
  listingId: deprecatedListingId,
  bookingType,
  onSelectionChange,
  readOnly = false,
  className,
}: CalendarSectionProps): React.ReactElement {
  // Support both rentalObjectId (new) and listingId (backward compatibility)
  const effectiveRentalObjectId = rentalObjectId || deprecatedListingId || '';
  const t = useT();
  // Current date for calendar navigation
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  // Current selection state
  const [selection, setSelection] = React.useState<CalendarSelection | undefined>(undefined);

  // Warning message for selection invalidation
  const [warningMessage, setWarningMessage] = React.useState<string | undefined>(undefined);

  // Fetch calendar configuration from API
  const {
    data: configResponse,
    isLoading: isConfigLoading,
    error: configError,
  } = useListingCalendarConfig(effectiveRentalObjectId, bookingType ? { bookingType } : undefined);

  // Extract config from response
  const config = configResponse?.data;

  // Determine calendar mode from config
  const calendarMode: CalendarMode = React.useMemo(() => {
    if (!config) return 'TIME_SLOTS';
    return config.granularity as CalendarMode;
  }, [config]);

  // Calculate date range based on mode and current date
  const dateRange = React.useMemo(() => {
    if (calendarMode === 'TIME_SLOTS') {
      // Week view - Monday to Sunday
      const from = getWeekStart(currentDate);
      const to = getWeekEnd(currentDate);
      return { from: formatDateToISO(from), to: formatDateToISO(to) };
    } else {
      // Month view for ALL_DAY and MULTI_DAY
      const from = getMonthStart(currentDate);
      const to = getMonthEnd(currentDate);
      return { from: formatDateToISO(from), to: formatDateToISO(to) };
    }
  }, [calendarMode, currentDate]);

  // Fetch availability matrix from API
  const {
    data: matrixResponse,
    isLoading: isMatrixLoading,
    error: matrixError,
  } = useAvailabilityMatrix(
    effectiveRentalObjectId,
    {
      from: dateRange.from,
      to: dateRange.to,
      bookingType,
    },
    { enabled: !!config }
  );

  // Extract cells from matrix response
  const cells: CalendarCell[] = React.useMemo(() => {
    if (!matrixResponse?.data?.cells) return [];
    return matrixResponse.data.cells.map(mapToCalendarCell);
  }, [matrixResponse]);

  // Subscribe to realtime events for availability updates
  useCalendarRealtime((event) => {
    // Check if any selected cells have been affected
    if (selection && selection.cells.length > 0) {
      // Check if event affects any selected cells
      const affectedSelection = selection.cells.some(() => {
        // Simple check: if event is for this rental object, we might need to revalidate
        if (('rentalObjectId' in event && event.rentalObjectId === effectiveRentalObjectId) ||
            ('listingId' in event && event.listingId === effectiveRentalObjectId)) {
          return true;
        }
        return false;
      });

      if (affectedSelection) {
        setWarningMessage(
          t('components.calendar.selectionChanged')
        );
      }
    }
  });

  // Handle cell click
  const handleCellClick = React.useCallback(
    (cell: CalendarCell) => {
      if (readOnly) return;

      setSelection((prev) => {
        // Toggle selection
        const alreadySelected = prev?.cells.some((c) => c.id === cell.id);

        let newCells: CalendarCell[];
        if (alreadySelected) {
          // Remove from selection
          newCells = prev?.cells.filter((c) => c.id !== cell.id) ?? [];
        } else {
          // Add to selection
          newCells = [...(prev?.cells ?? []), cell];
        }

        const newSelection: CalendarSelection = {
          cells: newCells,
          isValid: newCells.length > 0,
        };

        return newSelection;
      });

      // Clear warning when user interacts
      setWarningMessage(undefined);
    },
    [readOnly]
  );

  // Handle selection change and propagate to parent
  React.useEffect(() => {
    if (onSelectionChange && selection) {
      onSelectionChange(selection);
    }
  }, [selection, onSelectionChange]);

  // Handle date navigation
  const handleDateChange = React.useCallback((date: Date) => {
    setCurrentDate(date);
    // Clear warning on navigation
    setWarningMessage(undefined);
  }, []);

  // Loading state
  const isLoading = isConfigLoading || isMatrixLoading;

  // Error message
  const errorMessage = React.useMemo(() => {
    if (configError) {
      return t('components.calendar.couldNotLoadSettings');
    }
    if (matrixError) {
      return t('components.calendar.couldNotLoadAvailability');
    }
    return undefined;
  }, [configError, matrixError, t]);

  // Get legend from matrix or use default
  const legend = React.useMemo(() => {
    if (!matrixResponse?.data?.legend) {
      return [
        { status: 'AVAILABLE' as const, label: t('components.calendar.statusAvailable') },
        { status: 'RESERVED' as const, label: t('components.calendar.statusReserved') },
        { status: 'BOOKED' as const, label: t('components.calendar.statusBooked') },
        { status: 'BLOCKED' as const, label: t('components.calendar.statusBlocked') },
        { status: 'BLACKOUT' as const, label: t('components.calendar.statusBlackout') },
        { status: 'CLOSED' as const, label: t('components.calendar.statusClosed') },
      ];
    }
    return matrixResponse.data.legend.map((item: { status: string; labelKey: string }) => ({
      status: item.status as CalendarCell['status'],
      label: item.labelKey.includes('.') ? item.labelKey.split('.').pop()! : item.labelKey,
    }));
  }, [matrixResponse, t]);

  // Check permissions
  const canSelect = config?.permissions?.canSelectSlot ?? true;

  // Empty state if no config
  if (!isLoading && !config && !configError) {
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
        cells={cells}
        selection={selection}
        legend={legend}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onCellClick={handleCellClick}
        onSelectionChange={setSelection}
        startHour={config?.openingHours?.weekly?.['1']?.open ? parseInt(config.openingHours.weekly['1'].open.split(':')[0]!, 10) : 8}
        endHour={config?.openingHours?.weekly?.['1']?.close ? parseInt(config.openingHours.weekly['1'].close.split(':')[0]!, 10) : 17}
        slotSizeMinutes={config?.slotSizeMinutes ?? 60}
        showTips={true}
        title={t('components.calendar.selectTime')}
        subtitle={calendarMode === 'TIME_SLOTS' ? t('components.calendar.selectTimeSlots') : calendarMode === 'ALL_DAY' ? t('components.calendar.selectDays') : t('components.calendar.selectPeriod')}
        isLoading={isLoading}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        readOnly={readOnly || !canSelect}
      />
    </div>
  );
}

export default CalendarSection;
