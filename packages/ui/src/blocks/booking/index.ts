/**
 * @digilist/ui - Booking Components
 *
 * Domain-specific components for the booking flow.
 * These components are specific to the Digilist rental booking platform.
 */

// =============================================================================
// Local Components (migrated from @xalatechnologies/platform/ui)
// =============================================================================

export {
  BookingFormModal,
  type BookingFormModalProps,
  type TimeSlot,
  type ActivityType,
} from './BookingFormModal';

export {
  BookingConfirmation,
  type BookingConfirmationProps,
} from './BookingConfirmation';

export {
  BookingSuccess,
  type BookingSuccessProps,
} from './BookingSuccess';

export {
  PriceSummaryCard,
  type PriceSummaryCardProps,
  type PriceLineItem,
} from './PriceSummaryCard';

export {
  BookingModeSelector,
  createBookingModeOptions,
  type BookingModeSelectorProps,
  type BookingModeOption,
  type BookingModeType,
  type RecurringConstraints,
} from './BookingModeSelector';

// =============================================================================
// Re-exports from @xalatechnologies/platform/ui (Backward Compatibility)
// =============================================================================
// Note: BookingSection and AdditionalServicesList should be imported
// directly from @xalatechnologies/platform/ui when needed.
