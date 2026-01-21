/**
 * @digilist/runtime - Domain Providers
 *
 * Domain-specific providers for the Digilist rental booking platform.
 */

// =============================================================================
// DigilistProvider (Main Provider)
// =============================================================================

export {
  DigilistProvider,
  type DigilistProviderProps,
} from './DigilistProvider';

// =============================================================================
// AccountContextProvider
// =============================================================================

export {
  AccountContextProvider,
  useAccountContext,
  type AccountType,
  type DashboardContext,
  type AccountContextState,
  type AccountContextValue,
  type ActiveAccount,
  type AccountContextProviderProps,
} from './AccountContextProvider';

// =============================================================================
// BookingContextProvider
// =============================================================================

export {
  BookingContextProvider,
  useBookingContext,
  useBookingContextOptional,
  type BookingWizardStep,
  type BookingFlowState,
  type BookingContextState,
  type BookingContextActions,
  type BookingContextValue,
  type BookingContextProviderProps,
} from './BookingContextProvider';

// =============================================================================
// RentalObjectContextProvider
// =============================================================================

export {
  RentalObjectContextProvider,
  useRentalObjectContext,
  useRentalObjectContextOptional,
  type RentalObjectFilters,
  type PaginationState,
  type SortConfig,
  type RentalObjectContextState,
  type RentalObjectContextActions,
  type RentalObjectContextValue,
  type RentalObjectContextProviderProps,
} from './RentalObjectContextProvider';
