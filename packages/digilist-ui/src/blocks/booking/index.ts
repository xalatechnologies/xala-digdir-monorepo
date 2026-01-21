/**
 * @digilist/ui - Booking Components
 *
 * Domain-specific components for the booking flow.
 * These components are specific to the Digilist rental booking platform.
 */

// =============================================================================
// Local Components (migrated from @xala/ds)
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
// NOTE: BookingSection and AdditionalServicesList remain in @xala/ds
// =============================================================================
// These components are NOT re-exported here to avoid circular dependencies.
// Import them directly from @xala/ds:
//
//   import { BookingSection, AdditionalServicesList } from '@xala/ds';
//
// Migration to @digilist/ui will happen in a future phase.
