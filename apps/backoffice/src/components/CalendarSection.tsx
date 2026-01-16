/**
 * CalendarSection Component (Backoffice)
 *
 * Integrates the ListingAvailabilityCalendar from @xala/ds with SDK hooks.
 * Displays dynamic availability calendar based on listing configuration.
 * Supports TIME_SLOTS, ALL_DAY, and MULTI_DAY modes.
 *
 * This is the backoffice app version - designed for administrators to VIEW
 * listing availability. View-only mode by default (no slot selection).
 *
 * Following the SDK-first rule: all data comes from API projection DTOs.
 * No local rule evaluation or transformation.
 */

import * as React from 'react';
import { Paragraph, RentalObjectAvailabilityCalendar } from '@xala/ds';
import {
  useListingCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

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

/** Realtime event types from WebSocket */
interface RealtimeEvent {
  type: string;
  listingId?: string;
  bookingId?: string;
  blockId?: string;
  start?: string;
  end?: string;
}

export interface CalendarSectionProps {
  /** Listing ID to fetch calendar data for */
  listingId: string;
  /** Optional booking type filter */
  bookingType?: string;
  /** Custom class name */
  className?: string;
  /** Custom title for the calendar section */
  title?: string;
  /** Custom subtitle for the calendar section */
  subtitle?: string;
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

/**
 * CalendarSection for backoffice app.
 *
 * This is a view-only calendar component that displays listing availability
 * for administrators. Selection is disabled by default.
 */
export function CalendarSection({
  listingId,
  bookingType,
  className,
  title,
  subtitle,
}: CalendarSectionProps):
  const t = useT(); React.ReactElement {
  // Current date for calendar navigation
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  // Selection state (view-only but needed for component props)
  const [selection] = React.useState<CalendarSelection | undefined>(undefined);

  // Warning message for realtime updates
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
  useCalendarRealtime((event: RealtimeEvent) => {
    // For backoffice view-only mode, show a notification when data might be stale
    if (event.listingId && event.listingId === listingId) {
      setWarningMessage(
        'Tilgjengeligheten har blitt oppdatert. Kalenderen viser nå siste data.'
      );
      // Clear warning after a short delay
      setTimeout(() => setWarningMessage(undefined), 5000);
    }
  });

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
        { status: 'AVAILABLE' as const, label: 'Ledig' },
        { status: 'RESERVED' as const, label: 'Reservert' },
        { status: 'BOOKED' as const, label: 'Booket' },
        { status: 'BLOCKED' as const, label: 'Blokkert' },
        { status: 'BLACKOUT' as const, label: 'Utilgjengelig' },
        { status: 'CLOSED' as const, label: 'Stengt' },
      ];
    }
    return matrixResponse.data.legend.map((item: { status: string; labelKey: string }) => ({
      status: item.status as CalendarCell['status'],
      label: item.labelKey.includes('.') ? item.labelKey.split('.').pop()! : item.labelKey,
    }));
  }, [matrixResponse]);

  // Compute default titles based on mode
  const defaultTitle = 'Tilgjengelighet';
  const defaultSubtitle = React.useMemo(() => {
    switch (calendarMode) {
      case 'TIME_SLOTS':
        return 'Oversikt over tilgjengelige tidspunkter';
      case 'ALL_DAY':
        return 'Oversikt over tilgjengelige dager';
      case 'MULTI_DAY':
        return 'Oversikt over tilgjengelige perioder';
      default:
        return 'Tilgjengelighetsoversikt';
    }
  }, [calendarMode]);

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
      <RentalObjectAvailabilityCalendar
        mode={calendarMode}
        cells={cells}
        selection={selection}
        legend={legend}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onCellClick={undefined}
        onSelectionChange={undefined}
        startHour={config?.openingHours?.weekly?.['1']?.open ? parseInt(config.openingHours.weekly['1'].open.split(':')[0]!, 10) : 8}
        endHour={config?.openingHours?.weekly?.['1']?.close ? parseInt(config.openingHours.weekly['1'].close.split(':')[0]!, 10) : 17}
        slotSizeMinutes={config?.slotSizeMinutes ?? 60}
        showTips={true}
        title={title ?? defaultTitle}
        subtitle={subtitle ?? defaultSubtitle}
        isLoading={isLoading}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        readOnly={true}
      />
    </div>
  );
}

export default CalendarSection;
