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

// =============================================================================
// Re-exports from @xalatechnologies/platform/ui (Backward Compatibility)
// =============================================================================
// These components are re-exported from platform for backward compatibility.
// They are domain-agnostic and should be imported directly from platform.
//
// @deprecated Import from @xalatechnologies/platform/ui instead.

export { BookingSection } from './BookingSection';
export type { BookingSectionProps } from './BookingSection';

export { AdditionalServicesList } from './AdditionalServicesList';
export type { AdditionalServicesListProps } from './AdditionalServicesList';
