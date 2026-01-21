/**
 * @xala/runtime providers
 *
 * App-specific providers that can be composed with RuntimeProvider
 */

// =============================================================================
// Runtime Service Provider (Dependency Injection)
// =============================================================================

export {
  RuntimeServiceProvider,
  useRuntimeServices,
  useRuntimeServicesOptional,
  useInjectedOrganizations,
  createOrganizationsHook,
  type RuntimeServiceProviderProps,
} from './RuntimeServiceProvider';

// =============================================================================
// Generic Multi-Account Provider (Platform-Agnostic)
// =============================================================================

export {
  MultiAccountProvider,
  useMultiAccount,
  type BaseAccount,
  type AccountMode,
  type MultiAccountContextState,
  type MultiAccountContextValue,
  type MultiAccountProviderProps,
  type ActiveAccountInfo,
} from './MultiAccountProvider';

// =============================================================================
// Legacy Account Context Provider (Backward Compatible)
// =============================================================================

export {
  AccountContextProvider,
  useAccountContext,
  type AccountType,
  type DashboardContext,
  type AccountContextState,
  type AccountContextValue,
  type AccountContextProviderProps,
  type ActiveAccount,
} from './AccountContextProvider';
