/**
 * @xala/config
 *
 * Centralized configuration package for Xala/Digilist applications.
 *
 * This package provides:
 * - AppProfile definitions for each app type
 * - Environment variable validation with Zod
 * - SDK and RuntimeProvider configuration factories
 *
 * @example
 * ```tsx
 * // apps/backoffice/src/main.tsx
 * import { validateEnv, createAppConfig } from '@xala/config';
 * import { RuntimeProvider } from '@xala/runtime';
 * import { initializeClient } from '@digilist/client-sdk';
 *
 * // Validate environment at startup
 * const env = validateEnv(import.meta.env);
 *
 * // Get all configuration
 * const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
 *
 * // Initialize SDK
 * initializeClient(sdkConfig);
 *
 * // Mount app
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <RuntimeProvider config={runtimeConfig}>
 *     <App />
 *   </RuntimeProvider>
 * );
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Core types
  AppType,
  SupportedLocale,
  ColorScheme,
  ThemeId,
  // Config types
  EnvConfig,
  AppProfile,
  RuntimeConfig,
  AuthConfig,
  SDKConfig,
} from './types';

// ============================================================================
// Environment Validation
// ============================================================================

export {
  // Schema
  envSchema,
  type EnvSchemaType,
  // Validation functions
  validateEnv,
  safeValidateEnv,
  assertEnv,
  // Helpers
  getDevEnvConfig,
  mergeWithDefaults,
} from './env-schema';

// ============================================================================
// App Profiles
// ============================================================================

export {
  // Main API
  getAppProfile,
  getAllAppProfiles,
  getAppTypes,
  // Config factories
  createRuntimeConfig,
  createSDKConfig,
  createAppConfig,
  // Individual profiles (for advanced use)
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
} from './app-profiles';
