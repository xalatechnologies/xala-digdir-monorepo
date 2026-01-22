/**
 * CalendarSection Component (Backoffice App)
 *
 * Thin wrapper that connects SDK hooks to the unified CalendarSection
 * from @digilist/ui/features/calendar.
 *
 * This is the backoffice app version - designed for administrators to VIEW
 * listing availability. View-only mode (no slot selection).
 */

import * as React from 'react';
import {
  CalendarSection as CalendarSectionUI,
  getDateRangeForMode,
  type CalendarMode,
} from '@digilist/ui/features/calendar';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  useListingCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from '@digilist/client-sdk/hooks';

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

export function CalendarSection({
  listingId,
  bookingType,
  className,
  title,
  subtitle,
}: CalendarSectionProps): React.ReactElement {
  const t = useT();

  // Navigation state
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

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
    listingId,
    {
      from: dateRange.from,
      to: dateRange.to,
      bookingType,
    },
    { enabled: !!config }
  );

  // Subscribe to realtime events for availability updates
  useCalendarRealtime((event) => {
    if ('listingId' in event && event.listingId === listingId) {
      setWarningMessage(t('components.calendar.dataUpdated'));
      setTimeout(() => setWarningMessage(undefined), 5000);
    }
  });

  // Build error message
  const errorMessage = React.useMemo(() => {
    if (configError) return t('components.calendar.couldNotLoadSettings');
    if (matrixError) return t('components.calendar.couldNotLoadAvailability');
    return undefined;
  }, [configError, matrixError, t]);

  // Default titles based on mode
  const defaultTitle = t('components.calendar.availability');
  const defaultSubtitle = React.useMemo(() => {
    switch (calendarMode) {
      case 'TIME_SLOTS':
        return t('components.calendar.overviewTimeSlots');
      case 'ALL_DAY':
        return t('components.calendar.overviewDays');
      case 'MULTI_DAY':
        return t('components.calendar.overviewPeriods');
      default:
        return t('components.calendar.overviewAvailability');
    }
  }, [calendarMode, t]);

  return (
    <CalendarSectionUI
      config={config}
      cells={matrixResponse?.data?.cells}
      legend={matrixResponse?.data?.legend}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      readOnly={true}
      isLoading={isConfigLoading || isMatrixLoading}
      errorMessage={errorMessage}
      warningMessage={warningMessage}
      title={title ?? defaultTitle}
      subtitle={subtitle ?? defaultSubtitle}
      className={className}
    />
  );
}

export default CalendarSection;
