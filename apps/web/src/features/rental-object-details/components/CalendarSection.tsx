/**
 * CalendarSection Component (Web App)
 *
 * Thin wrapper that connects SDK hooks to the unified CalendarSection
 * from @digilist/ui/features/calendar.
 *
 * This is the web app version - for public rental object detail pages
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
  useRentalObjectCalendarConfig,
  useAvailabilityMatrix,
  useCalendarRealtime,
} from '@digilist/client-sdk/hooks';

export interface CalendarSectionProps {
  /** Rental object ID to fetch calendar data for */
  rentalObjectId: string;
  /** Optional booking type filter */
  bookingType?: string;
  /** Force a specific calendar mode (overrides API config) */
  forceMode?: 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';
  /** Callback when selection changes */
  onSelectionChange?: (selection: CalendarSelection) => void;
  /** Whether the calendar is read-only (view mode) */
  readOnly?: boolean;
  /** Custom class name */
  className?: string;
}

export function CalendarSection({
  rentalObjectId,
  bookingType,
  forceMode,
  onSelectionChange,
  readOnly = false,
  className,
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
  } = useRentalObjectCalendarConfig(rentalObjectId, bookingType ? { bookingType } : undefined);

  // Extract config from response
  const config = configResponse?.data;

  // Determine calendar mode: forceMode > config.granularity > default
  const calendarMode: CalendarMode = forceMode ?? config?.granularity ?? 'TIME_SLOTS';

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
    rentalObjectId,
    {
      from: dateRange.from,
      to: dateRange.to,
      bookingType,
    },
    { enabled: !!config }
  );

  // Subscribe to realtime events for availability updates
  useCalendarRealtime((event) => {
    if ('rentalObjectId' in event && event.rentalObjectId === rentalObjectId) {
      setWarningMessage(t('calendar.selection.changed'));
      setTimeout(() => setWarningMessage(undefined), 5000);
    }
  });

  // Build error message
  const errorMessage = React.useMemo(() => {
    if (configError) return t('calendar.error.config');
    if (matrixError) return t('calendar.error.availability');
    return undefined;
  }, [configError, matrixError, t]);

  return (
    <CalendarSectionUI
      config={config}
      cells={matrixResponse?.data?.cells}
      legend={matrixResponse?.data?.legend}
      forceMode={forceMode}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      onSelectionChange={onSelectionChange}
      readOnly={readOnly}
      isLoading={isConfigLoading || isMatrixLoading}
      errorMessage={errorMessage}
      warningMessage={warningMessage}
      showTips={false}
      title=""
      subtitle=""
      className={className}
    />
  );
}

export default CalendarSection;
