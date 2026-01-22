/**
 * Booking Feature Kit
 *
 * Domain-specific components and mappers for booking display and management.
 * This feature kit provides thin wrappers around platform patterns with
 * domain-specific DTO mapping.
 *
 * ## Usage Patterns
 *
 * ### Pattern 1: Using Mappers with Components
 * ```tsx
 * import {
 *   BookingSuccess,
 *   mapBookingToCardDisplay,
 * } from '@digilist/ui/features/booking';
 * import type { BookingCardProjection } from '@digilist/contracts/projections';
 *
 * function MyBookingCard({ booking }: { booking: BookingCardProjection }) {
 *   const t = useT();
 *   const displayProps = mapBookingToCardDisplay(booking, t);
 *
 *   return (
 *     <Card>
 *       <Heading>{displayProps.title}</Heading>
 *       <Paragraph>{displayProps.dateDisplay}</Paragraph>
 *       <Badge color={displayProps.status.color}>
 *         {displayProps.status.label}
 *       </Badge>
 *     </Card>
 *   );
 * }
 * ```
 *
 * ### Pattern 2: Using Domain Components Directly
 * ```tsx
 * import { BookingConfirmation } from '@digilist/ui/features/booking';
 *
 * function ConfirmPage() {
 *   return (
 *     <BookingConfirmation
 *       bookingId={bookingId}
 *       onConfirm={handleConfirm}
 *       onCancel={handleCancel}
 *     />
 *   );
 * }
 * ```
 */

// =============================================================================
// Domain-to-Display Mappers
// =============================================================================

export {
  // Card mappers
  mapBookingToCardDisplay,
  mapBookingsToCardDisplays,
  type BookingCardDisplayProps,

  // Details mappers
  mapBookingToDetailsDisplay,
  type BookingDetailsDisplayProps,

  // Price summary mapper
  mapBookingToPriceSummary,
  type PriceSummaryLine,

  // Calendar event mapper
  mapCalendarEventToDisplay,
  type CalendarEventDisplayProps,

  // Status types
  type BookingStatusColor,
  type StatusBadgeData,
} from './mappers';

// =============================================================================
// Re-export Domain Components from blocks
// =============================================================================

export {
  // Modal/Form components
  BookingFormModal,
  type BookingFormModalProps,
  type TimeSlot,
  type ActivityType,

  // Confirmation components
  BookingConfirmation,
  type BookingConfirmationProps,

  BookingSuccess,
  type BookingSuccessProps,

  // Price display
  PriceSummaryCard,
  type PriceSummaryCardProps,
  type PriceLineItem,

  // Mode selector (unified component)
  BookingModeSelector,
  createBookingModeOptions,
  type BookingModeSelectorProps,
  type BookingModeOption,
  type BookingModeType,
  type RecurringConstraints,
} from '../../blocks/booking';

// =============================================================================
// NOTE: BookingSection and AdditionalServicesList should be imported
// directly from @xalatechnologies/platform/ui to avoid circular dependencies
// =============================================================================

// =============================================================================
// Re-export Booking Engine
// =============================================================================

export {
  // Main component
  BookingEngine,
  type BookingEngineProps,

  // Mode views
  DailyModeView,
  type DailyModeViewProps,
  DateRangeModeView,
  type DateRangeModeViewProps,
  EventModeView,
  type EventModeViewProps,
  InstantModeView,
  type InstantModeViewProps,
  RecurringModeView,
  type RecurringModeViewProps,

  // Step components
  BookingFormStep,
  type BookingFormStepProps,
  BookingConfirmStep,
  type BookingConfirmStepProps,

  // Support components
  PriceSummary,
  type PriceSummaryProps,

  // Utilities
  getModeLabel,
  getModeDescription,
  formatPrice,
  formatPriceUnit,
} from '../../booking-engine';
