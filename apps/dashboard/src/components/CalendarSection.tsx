/**
 * CalendarSection Component (Dashboard App)
 *
 * Thin wrapper that connects SDK hooks to the unified CalendarSection
 * from @digilist/ui/features/calendar.
 *
 * This is the dashboard app version - for user's rental object views
 * where users can view and select availability slots.
 */

import * as React from 'react';
import {
  CalendarSection as CalendarSectionUI,
  getDateRangeForMode,
  type CalendarSelection,
  type CalendarMode,
} from '@digilist/ui/features/calendar';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  useCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from '@digilist/client-sdk/hooks';

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

export function CalendarSection({
  rentalObjectId,
  listingId: deprecatedListingId,
  bookingType,
  onSelectionChange,
  readOnly = false,
  className,
}: CalendarSectionProps): React.ReactElement {
  const t = useT();

  // Support both rentalObjectId (new) and listingId (backward compatibility)
  const effectiveRentalObjectId = rentalObjectId || deprecatedListingId || '';

  // Navigation state
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  // Warning message for realtime updates
  const [warningMessage, setWarningMessage] = React.useState<string | undefined>(undefined);

  // Fetch calendar configuration from API
  const {
    data: config,
    isLoading: isConfigLoading,
    error: configError,
  } = useCalendarConfig(effectiveRentalObjectId);

  // Determine calendar mode from config
  const calendarMode: CalendarMode = config?.granularity ?? 'TIME_SLOTS';

  // Calculate date range based on mode
  const dateRange = React.useMemo(
    () => getDateRangeForMode(calendarMode, currentDate),
    [calendarMode, currentDate]
  );

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

  // Subscribe to realtime events for availability updates
  useCalendarRealtime((event) => {
    if (
      ('rentalObjectId' in event && event.rentalObjectId === effectiveRentalObjectId) ||
      ('listingId' in event && event.listingId === effectiveRentalObjectId)
    ) {
      setWarningMessage(t('components.calendar.selectionChanged'));
      setTimeout(() => setWarningMessage(undefined), 5000);
    }
  });

  // Build error message
  const errorMessage = React.useMemo(() => {
    if (configError) return t('components.calendar.couldNotLoadSettings');
    if (matrixError) return t('components.calendar.couldNotLoadAvailability');
    return undefined;
  }, [configError, matrixError, t]);

  return (
    <CalendarSectionUI
      config={config}
      cells={matrixResponse?.data?.cells}
      legend={matrixResponse?.data?.legend}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      onSelectionChange={onSelectionChange}
      readOnly={readOnly}
      isLoading={isConfigLoading || isMatrixLoading}
      errorMessage={errorMessage}
      warningMessage={warningMessage}
      className={className}
    />
  );
}

export default CalendarSection;
