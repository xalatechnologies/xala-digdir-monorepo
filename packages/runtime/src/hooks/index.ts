/**
 * @digilist/runtime - Domain Hooks
 *
 * Domain-specific hooks for the Digilist rental booking platform.
 */

// =============================================================================
// Unified Runtime Hook
// =============================================================================

export {
  useDigilistRuntime,
  useDigilistAccount,
  useIsOrganizationMode,
  useCurrentOrganization,
  type DigilistRuntimeValue,
} from './useDigilistRuntime';

// =============================================================================
// Re-exported Provider Hooks
// =============================================================================

// Account context hooks
export { useAccountContext } from '../providers/AccountContextProvider';
export type {
  AccountType,
  DashboardContext,
  AccountContextValue,
  ActiveAccount,
} from '../providers/AccountContextProvider';

// Booking context hooks
export {
  useBookingContext,
  useBookingContextOptional,
} from '../providers/BookingContextProvider';
export type {
  BookingWizardStep,
  BookingFlowState,
  BookingContextState,
  BookingContextActions,
  BookingContextValue,
} from '../providers/BookingContextProvider';

// Rental object context hooks
export {
  useRentalObjectContext,
  useRentalObjectContextOptional,
} from '../providers/RentalObjectContextProvider';
export type {
  RentalObjectFilters,
  PaginationState,
  SortConfig,
  RentalObjectContextState,
  RentalObjectContextActions,
  RentalObjectContextValue,
} from '../providers/RentalObjectContextProvider';
