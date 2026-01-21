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
// NOTE: BookingSection and AdditionalServicesList remain in @xalatechnologies/platform/ui
// =============================================================================
// These components are NOT re-exported here to avoid circular dependencies.
// Import them directly from @xalatechnologies/platform/ui:
//
//   import { BookingSection, AdditionalServicesList } from '@xalatechnologies/platform/ui';
//
// Migration to @digilist/ui will happen in a future phase.
