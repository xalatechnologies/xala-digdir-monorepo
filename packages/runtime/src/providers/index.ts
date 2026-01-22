/**
 * @digilist/runtime - Domain Providers
 *
 * Domain-specific providers for the Digilist rental booking platform.
 */

// =============================================================================
// RuntimeProvider (Core Provider)
// =============================================================================

export {
  RuntimeProvider,
  RuntimeServiceProvider,
  useRuntimeConfig,
  useRuntimeServices,
  type RuntimeProviderProps,
  type RuntimeServiceProviderProps,
  type RuntimeConfig,
} from './RuntimeProvider';

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
