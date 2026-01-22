/**
 * @digilist/ui - Booking Engine
 *
 * Multi-step booking flow components for the Digilist rental booking platform.
 * This module provides the complete booking wizard experience.
 *
 * @example
 * ```tsx
 * import { BookingEngine } from '@digilist/ui/booking-engine';
 * import type { BookingConfig } from '@digilist/contracts';
 *
 * function BookingPage({ config }: { config: BookingConfig }) {
 *   return (
 *     <BookingEngine
 *       config={config}
 *       rentalObjectName="Meeting Room A"
 *       onSubmit={handleSubmit}
 *     />
 *   );
 * }
 * ```
 */

// =============================================================================
// Main Booking Engine Component
// =============================================================================

export { BookingEngine } from './BookingEngine';
export type { BookingEngineProps } from './BookingEngine';

// =============================================================================
// Mode View Components
// =============================================================================

export { DailyModeView } from './modes/DailyModeView';
export type { DailyModeViewProps } from './modes/DailyModeView';

export { DateRangeModeView } from './modes/DateRangeModeView';
export type { DateRangeModeViewProps } from './modes/DateRangeModeView';

export { EventModeView } from './modes/EventModeView';
export type { EventModeViewProps } from './modes/EventModeView';

export { InstantModeView } from './modes/InstantModeView';
export type { InstantModeViewProps } from './modes/InstantModeView';

export { RecurringModeView } from './modes/RecurringModeView';
export type { RecurringModeViewProps } from './modes/RecurringModeView';

// =============================================================================
// Step Components
// =============================================================================

export { BookingFormStep } from './steps/BookingFormStep';
export type { BookingFormStepProps } from './steps/BookingFormStep';

export { BookingConfirmStep } from './steps/BookingConfirmStep';
export type { BookingConfirmStepProps } from './steps/BookingConfirmStep';

// =============================================================================
// Support Components
// =============================================================================

export { PriceSummary } from './components/PriceSummary';
export type { PriceSummaryProps } from './components/PriceSummary';

// =============================================================================
// Icons
// =============================================================================

export {
  CalendarStepIcon,
  FormStepIcon,
  ConfirmStepIcon,
  SuccessStepIcon,
  PaymentStepIcon,
} from './icons';

// =============================================================================
// Utilities
// =============================================================================

export {
  getModeLabel,
  getModeDescription,
  formatPrice,
  formatPriceUnit,
  // Note: cn is exported from compat, not here to avoid duplicate exports
} from './utils';

// =============================================================================
// Styles
// =============================================================================

export { bookingEngineStyles } from './styles';
