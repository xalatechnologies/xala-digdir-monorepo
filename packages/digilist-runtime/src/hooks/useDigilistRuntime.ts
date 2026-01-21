import { useMemo } from 'react';
import { useAccountContext } from '../providers/AccountContextProvider';
import { useBookingContextOptional } from '../providers/BookingContextProvider';
import { useRentalObjectContextOptional } from '../providers/RentalObjectContextProvider';

/**
 * Digilist runtime aggregate providing access to domain-specific contexts
 *
 * Note: For platform-level contexts (config, featureFlags, tenant, etc.),
 * import them directly from @xala/runtime:
 *
 * ```typescript
 * import { useRuntimeConfig, useFeatureFlags } from '@xalatechnologies/platform/runtime';
 * ```
 */
export interface DigilistRuntimeValue {
  // Domain contexts from @digilist/runtime
  /** Account context (personal/organization switching) */
  account: ReturnType<typeof useAccountContext>;
  /** Booking context (optional - only available within BookingContextProvider) */
  booking: ReturnType<typeof useBookingContextOptional>;
  /** Rental object context (optional - only available within RentalObjectContextProvider) */
  rentalObjects: ReturnType<typeof useRentalObjectContextOptional>;

  // Computed convenience properties
  /** Whether user is in organization mode */
  isOrganizationMode: boolean;
  /** Current organization ID (if in org mode) */
  currentOrganizationId: string | null;
  /** Current organization name (if in org mode) */
  currentOrganizationName: string | null;
}

/**
 * useDigilistRuntime
 *
 * A unified hook that provides access to all Digilist domain-specific contexts.
 * This is a convenience hook that aggregates multiple context hooks into a single object.
 *
 * **Note:** This hook must be used within the DigilistProvider hierarchy. Some contexts
 * (booking, rentalObjects) are optional and will be undefined if their providers are not present.
 *
 * For platform-level contexts, use the hooks from @xala/runtime directly:
 * - useRuntimeConfig() for app configuration
 * - useFeatureFlags() for feature flags
 * - useTenantContext() for tenant info
 * - useLocalization() for i18n
 * - useSDK() for SDK state
 * - useRBAC() for role-based access
 *
 * @example Basic Usage
 * ```tsx
 * import { useDigilistRuntime } from '@digilist/runtime';
 * import { useRuntimeConfig, useLocalization } from '@xalatechnologies/platform/runtime';
 *
 * function MyComponent() {
 *   const { account, isOrganizationMode, currentOrganizationId } = useDigilistRuntime();
 *   const config = useRuntimeConfig();
 *   const { locale } = useLocalization();
 *
 *   return (
 *     <div>
 *       <p>App: {config.appType}</p>
 *       <p>Mode: {isOrganizationMode ? 'Organization' : 'Personal'}</p>
 *       <p>Locale: {locale}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Booking Context
 * ```tsx
 * function BookingPage() {
 *   const { booking, rentalObjects } = useDigilistRuntime();
 *
 *   // booking is available if within BookingContextProvider
 *   if (booking) {
 *     console.log('Current step:', booking.flowState.currentStep);
 *   }
 *
 *   // rentalObjects is available if within RentalObjectContextProvider
 *   if (rentalObjects) {
 *     console.log('Filtered count:', rentalObjects.rentalObjects.length);
 *   }
 * }
 * ```
 *
 * @returns DigilistRuntimeValue - Aggregated domain context
 */
export function useDigilistRuntime(): DigilistRuntimeValue {
  // Domain contexts
  const account = useAccountContext();
  const booking = useBookingContextOptional();
  const rentalObjects = useRentalObjectContextOptional();

  // Memoized aggregate value
  return useMemo<DigilistRuntimeValue>(() => {
    // Computed properties
    const isOrganizationMode = account.accountType === 'organization';
    const currentOrganizationId = isOrganizationMode ? account.selectedOrganization?.id ?? null : null;
    const currentOrganizationName = isOrganizationMode ? account.selectedOrganization?.name ?? null : null;

    return {
      // Domain contexts
      account,
      booking,
      rentalObjects,

      // Computed convenience properties
      isOrganizationMode,
      currentOrganizationId,
      currentOrganizationName,
    };
  }, [account, booking, rentalObjects]);
}

/**
 * useDigilistAccount
 *
 * A shorthand hook for just the account context.
 * Equivalent to useAccountContext but with a more consistent naming.
 */
export function useDigilistAccount() {
  return useAccountContext();
}

/**
 * useIsOrganizationMode
 *
 * A simple boolean hook to check if user is in organization mode.
 */
export function useIsOrganizationMode(): boolean {
  const account = useAccountContext();
  return account.accountType === 'organization';
}

/**
 * useCurrentOrganization
 *
 * Returns the currently selected organization or null.
 */
export function useCurrentOrganization() {
  const account = useAccountContext();
  return account.accountType === 'organization' ? account.selectedOrganization : null;
}

export default useDigilistRuntime;
