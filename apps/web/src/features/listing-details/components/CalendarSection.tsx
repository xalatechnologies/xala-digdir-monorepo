/**
 * CalendarSection Component
 *
 * Integrates the ListingAvailabilityCalendar from @xala/ds with SDK hooks.
 * Displays dynamic availability calendar based on listing configuration.
 * Supports TIME_SLOTS, ALL_DAY, and MULTI_DAY modes.
 *
 * Following the SDK-first rule: all data comes from API projection DTOs.
 * No local rule evaluation or transformation.
 */

import * as React from 'react';
import { Paragraph, Heading, ListingAvailabilityCalendar } from '@xala/ds';
import {
  useListingCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from '@digilist/client-sdk/hooks';
import type { CalendarSelection, CalendarCell, CalendarMode } from '@xala/ds';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export interface CalendarSectionProps {
  /** Listing ID to fetch calendar data for */
  listingId: string;
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
    status: cell.status as CalendarCell['status'],
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
  listingId,
  bookingType,
  onSelectionChange,
  readOnly = false,
  className,
}: CalendarSectionProps):
  const t = useT(); React.ReactElement {
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
  } = useListingCalendarConfig(listingId, bookingType ? { bookingType } : undefined);

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
    listingId,
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
      const affectedSelection = selection.cells.some((cell) => {
        // Simple check: if event is for this listing, we might need to revalidate
        if ('listingId' in event && event.listingId === listingId) {
          return true;
        }
        return false;
      });

      if (affectedSelection) {
        setWarningMessage(
          'Din valgte tid kan ha blitt endret. Vennligst kontroller at valget ditt fortsatt er tilgjengelig.'
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
      return 'Kunne ikke laste kalenderinnstillinger. Vennligst prøv igjen.';
    }
    if (matrixError) {
      return 'Kunne ikke laste tilgjengelighet. Vennligst prøv igjen.';
    }
    return undefined;
  }, [configError, matrixError]);

  // Get legend from matrix or use default
  const legend = React.useMemo(() => {
    if (!matrixResponse?.data?.legend) {
      return [
        { status: 'AVAILABLE' as const, label: t('status.available') },
        { status: 'RESERVED' as const, label: t('status.reserved') },
        { status: 'BOOKED' as const, label: t('status.booked') },
        { status: 'BLOCKED' as const, label: t('status.blocked') },
        { status: 'BLACKOUT' as const, label: t('status.unavailable') },
        { status: 'CLOSED' as const, label: t('status.closed') },
      ];
    }
    return matrixResponse.data.legend.map((item) => ({
      status: item.status as CalendarCell['status'],
      label: item.labelKey.includes('.') ? item.labelKey.split('.').pop()! : item.labelKey,
    }));
  }, [matrixResponse]);

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
          Kalender er ikke tilgjengelig for dette lokalet.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className={className}>
      <ListingAvailabilityCalendar
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
        title={t('velg.tidspunkt')}
        subtitle={calendarMode === 'TIME_SLOTS' ? 'Velg ledige tidspunkter' : calendarMode === 'ALL_DAY' ? 'Velg ledige dager' : 'Velg periode'}
        isLoading={isLoading}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        readOnly={readOnly || !canSelect}
      />
    </div>
  );
}

export default CalendarSection;
