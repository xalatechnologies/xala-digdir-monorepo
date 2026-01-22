/**
 * @digilist/ui - Calendar Feature Kit
 *
 * Provides a unified CalendarSection component for displaying rental object availability
 * across all apps (web, dashboard, backoffice, monitoring).
 *
 * ## Architecture
 *
 * The CalendarSection is a PRESENTATIONAL component - it does not contain SDK hooks.
 * Apps should provide thin wrappers that connect SDK data.
 *
 * ```
 * APP LAYER (Thin Wrapper - ~20 lines)
 * ├── Uses SDK hooks (useCalendarConfig, useAvailabilityMatrix)
 * ├── Subscribes to realtime events (useCalendarRealtime)
 * └── Passes data to CalendarSection
 *
 * UI LAYER (CalendarSection - this package)
 * ├── Receives all data as props
 * ├── Handles selection logic
 * ├── Renders RentalObjectAvailabilityCalendar
 * └── Emits callbacks (onDateChange, onSelectionChange)
 * ```
 *
 * ## Usage
 *
 * ### Pattern 1: Simple Wrapper (Recommended)
 *
 * ```tsx
 * // apps/dashboard/src/components/CalendarSection.tsx
 * import { CalendarSection, getDateRangeForMode } from '@digilist/ui/features/calendar';
 * import { useCalendarConfig, useAvailabilityMatrix, useCalendarRealtime } from '@digilist/client-sdk/hooks';
 *
 * export function DashboardCalendar({ rentalObjectId, onSelectionChange, readOnly }) {
 *   const [currentDate, setCurrentDate] = React.useState(new Date());
 *   const [warningMessage, setWarningMessage] = React.useState();
 *
 *   const { data: config, isLoading: configLoading, error: configError } = useCalendarConfig(rentalObjectId);
 *   const dateRange = getDateRangeForMode(config?.granularity ?? 'TIME_SLOTS', currentDate);
 *   const { data: matrix, isLoading: matrixLoading, error: matrixError } = useAvailabilityMatrix(
 *     rentalObjectId,
 *     dateRange,
 *     { enabled: !!config }
 *   );
 *
 *   useCalendarRealtime((event) => {
 *     if (event.rentalObjectId === rentalObjectId) {
 *       setWarningMessage('Availability has been updated');
 *       setTimeout(() => setWarningMessage(undefined), 5000);
 *     }
 *   });
 *
 *   return (
 *     <CalendarSection
 *       config={config}
 *       cells={matrix?.cells}
 *       legend={matrix?.legend}
 *       currentDate={currentDate}
 *       onDateChange={setCurrentDate}
 *       onSelectionChange={onSelectionChange}
 *       readOnly={readOnly}
 *       isLoading={configLoading || matrixLoading}
 *       errorMessage={configError ? 'Could not load config' : matrixError ? 'Could not load availability' : undefined}
 *       warningMessage={warningMessage}
 *     />
 *   );
 * }
 * ```
 *
 * ### Pattern 2: View-Only (Backoffice Admin)
 *
 * ```tsx
 * // apps/backoffice/src/components/CalendarSection.tsx
 * import { CalendarSection } from '@digilist/ui/features/calendar';
 *
 * export function AdminCalendar({ rentalObjectId }) {
 *   // ... SDK hooks ...
 *   return (
 *     <CalendarSection
 *       config={config}
 *       cells={matrix?.cells}
 *       readOnly={true}
 *       title="Availability Overview"
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 *
 * @module @digilist/ui/features/calendar
 */

// =============================================================================
// Main Component Export
// =============================================================================

export {
  CalendarSection,
  type CalendarSectionProps,
  type CalendarConfig,
  type RawCalendarCell,
  type RawLegendItem,
} from './CalendarSection';

// =============================================================================
// Re-export Utilities from blocks/calendar
// =============================================================================

export {
  // Utility functions
  formatDateToISO,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getDateRangeForMode,
  mapToCalendarCell,
  buildCalendarLegend,
  getCalendarSubtitle,

  // Constants
  CALENDAR_SLOT_STATUS_LABELS,
  CALENDAR_SLOT_STATUS_KEYS,
  CALENDAR_MODE_LABELS,
  DEFAULT_CALENDAR_LEGEND,

  // Helpers
  isCalendarSlotSelectable,
  getCalendarSlotLabel,
  getCalendarSlotKey,

  // Types
  type CalendarMode,
  type CalendarSlotStatus,
  type CalendarSelectionType,
  type CalendarViewMode,
  type CalendarCell,
  type CalendarSelectionRange,
  type CalendarSelection,
  type CalendarLegendItem,
  type CalendarSectionControllerProps,

  // Components (re-exported for direct use)
  RentalObjectAvailabilityCalendar,
  type RentalObjectAvailabilityCalendarProps,
  AvailabilityCalendar,
  type AvailabilityCalendarProps,
} from '../../blocks/calendar';
