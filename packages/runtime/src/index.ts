/**
 * @xala/runtime
 *
 * Unified runtime provider for Xala/Digilist applications.
 * Consolidates 8-12 nested providers into a single composable tree.
 *
 * @example
 * ```tsx
 * import { RuntimeProvider } from '@xala/runtime';
 *
 * function App() {
 *   return (
 *     <RuntimeProvider config={{ appType: 'backoffice', apiUrl: '...' }}>
 *       <BrowserRouter>
 *         <Routes />
 *       </BrowserRouter>
 *     </RuntimeProvider>
 *   );
 * }
 * ```
 *
 * @example Testing
 * ```tsx
 * import { createRuntime } from '@xala/runtime';
 *
 * const runtime = createRuntime({ mockUser: { role: 'admin' } });
 * render(<MyComponent />, { wrapper: runtime.Provider });
 * ```
 *
 * @example Dependency Injection
 * ```tsx
 * import { RuntimeServiceProvider, AccountContextProvider } from '@xala/runtime';
 * import { useOrganizations } from '@digilist/client-sdk/hooks';
 *
 * function App() {
 *   return (
 *     <RuntimeServiceProvider
 *       config={{
 *         services: {
 *           useOrganizations: (filter) => {
 *             const result = useOrganizations({ status: filter?.status });
 *             return { data: result.data, isLoading: result.isLoading, error: result.error };
 *           },
 *         },
 *       }}
 *     >
 *       <AccountContextProvider>
 *         <YourApp />
 *       </AccountContextProvider>
 *     </RuntimeServiceProvider>
 *   );
 * }
 * ```
 */

// =============================================================================
// Main Provider
// =============================================================================

export {
  RuntimeProvider,
  useRuntimeConfig,
  useFeatureFlags,
  useTenantContext,
  useNotificationCenter,
} from './RuntimeProvider';
export type { RuntimeProviderProps } from './RuntimeProvider';

// =============================================================================
// Factory for Testing/Storybook
// =============================================================================

export {
  createRuntime,
  defaultTestRuntime,
  adminTestRuntime,
  createTestWrapper,
} from './createRuntime';

// =============================================================================
// Hooks
// =============================================================================

export { useLocalization } from './hooks/useLocalization';
export { useSDK } from './hooks/useSDK';
export { useRBAC } from './hooks/useRBAC';

// =============================================================================
// App-specific Providers
// =============================================================================

export {
  // Runtime Service Provider (Dependency Injection)
  RuntimeServiceProvider,
  useRuntimeServices,
  useRuntimeServicesOptional,
  useInjectedOrganizations,
  createOrganizationsHook,

  // Multi-Account Provider (Platform-Agnostic)
  MultiAccountProvider,
  useMultiAccount,

  // Legacy Account Context Provider (Backward Compatible)
  AccountContextProvider,
  useAccountContext,
} from './providers';

export type {
  // Runtime Service Provider types
  RuntimeServiceProviderProps,

  // Multi-Account Provider types
  BaseAccount,
  AccountMode,
  MultiAccountContextState,
  MultiAccountContextValue,
  MultiAccountProviderProps,
  ActiveAccountInfo,

  // Legacy Account Context types
  AccountType,
  DashboardContext,
  AccountContextState,
  AccountContextValue,
  AccountContextProviderProps,
  ActiveAccount,
} from './providers';

// =============================================================================
// Service Contracts (for Dependency Injection)
// =============================================================================

export type {
  // Organization/Account types
  OrganizationDTO,
  PaginatedResponse,
  OrganizationsFilter,

  // Service contracts
  OrganizationsServiceContract,
  RuntimeServiceContract,

  // Hook contracts
  QueryHookResult,
  UseOrganizationsHook,

  // Configuration
  RuntimeServiceConfig,
} from './contracts';

// =============================================================================
// Types
// =============================================================================

export type {
  // Config types
  AppType,
  SupportedLocale,
  ColorScheme,
  ThemeId,
  RuntimeConfig,
  AuthConfig,
  // Factory types
  CreateRuntimeOptions,
  RuntimeInstance,
  MockUser,
  MockSession,
  MockOrganization,
  // Context types
  LocalizationContext,
  SDKContext,
  RBACContext,
  FeatureFlagsContext,
  TenantContext,
  NotificationCenterContext,
  ToastContext,
} from './types';
