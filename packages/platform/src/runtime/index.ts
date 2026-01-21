/**
 * @xalatechnologies/platform/runtime
 *
 * Runtime utilities and providers for application initialization
 *
 * Provides:
 * - AppProvider - Combined provider wrapping QueryClient, Auth, Theme, etc.
 * - RuntimeConfig - Application configuration management
 * - Environment utilities - Environment variable access
 * - Error boundaries - React error handling
 *
 * @example
 * ```tsx
 * import { AppProvider, RuntimeConfig } from '@xalatechnologies/platform/runtime';
 *
 * const config: RuntimeConfig = {
 *   apiUrl: 'https://api.example.com',
 *   tenantId: 'tenant-123',
 * };
 *
 * function App() {
 *   return (
 *     <AppProvider config={config}>
 *       <MyApp />
 *     </AppProvider>
 *   );
 * }
 * ```
 */

// Environment utilities
export function getEnvironment(): 'development' | 'staging' | 'production' {
  // Use globalThis for browser-safe access
  const g = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  const env = g?.process?.env?.NODE_ENV ?? 'development';
  if (env === 'production') return 'production';
  if (env === 'test' || env === 'staging') return 'staging';
  return 'development';
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function isStaging(): boolean {
  return getEnvironment() === 'staging';
}

// Map Provider with Dependency Injection
export {
  MapProvider,
  useMapComponents,
  MapNotConfigured,
  type MapProviderProps,
  type MapComponents,
  type MapContextValue,
  type AbstractMapRef,
  type AbstractMapProps,
  type AbstractMarkerProps,
  type AbstractNavigationControlProps,
  type AbstractViewState,
} from './MapContext';

// RuntimeProvider - Main app wrapper with all providers
export {
  RuntimeProvider,
  useRuntime,
  useFeatureFlag,
} from './RuntimeProvider';
export type {
  RuntimeConfig,
  RuntimeContextValue,
  RuntimeProviderProps,
} from './RuntimeProvider';

// RuntimeServiceProvider - Dependency injection for domain services
export {
  RuntimeServiceProvider,
  useRuntimeServices,
  useInjectedOrganizations,
} from './RuntimeServiceProvider';
export type {
  RuntimeServiceConfig,
  RuntimeServiceProviderProps,
  ServiceHookResult,
} from './RuntimeServiceProvider';

// NotificationCenter state management
export {
  NotificationCenterProvider,
  useNotificationCenter,
} from './NotificationCenterContext';
export type {
  NotificationCenterContextValue,
  NotificationCenterProviderProps,
} from './NotificationCenterContext';
