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
 */

// Main provider
export {
  RuntimeProvider,
  useRuntimeConfig,
  useFeatureFlags,
  useTenantContext,
  useNotificationCenter,
} from './RuntimeProvider';
export type { RuntimeProviderProps } from './RuntimeProvider';

// Factory for testing/Storybook
export {
  createRuntime,
  defaultTestRuntime,
  adminTestRuntime,
  createTestWrapper,
} from './createRuntime';

// Hooks
export { useLocalization } from './hooks/useLocalization';
export { useSDK } from './hooks/useSDK';
export { useRBAC } from './hooks/useRBAC';

// App-specific providers
export {
  AccountContextProvider,
  useAccountContext,
} from './providers';
export type {
  AccountType,
  DashboardContext,
  AccountContextState,
  AccountContextValue,
  AccountContextProviderProps,
  ActiveAccount,
} from './providers';

// Types
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
