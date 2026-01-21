/**
 * @xala/config
 *
 * Platform-agnostic configuration package for Xala applications.
 *
 * This package provides:
 * - Generic AppProfile registry with runtime registration
 * - Environment variable validation with Zod
 * - Config factories for SDK and RuntimeProvider
 *
 * ## Domain-Specific Setup
 *
 * Domain packages (like @digilist/runtime) should:
 * 1. Define their app profiles
 * 2. Register them using registerAppProfiles()
 * 3. Apps import the domain package to trigger registration
 *
 * @example
 * ```tsx
 * // apps/backoffice/src/main.tsx
 * import '@digilist/runtime'; // Side-effect: registers Digilist profiles
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
// Types (Generic/Platform)
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
// App Profile Registry
// ============================================================================

export {
  // Registration API (for domain packages)
  registerAppProfile,
  registerAppProfiles,
  clearAppProfiles,
  hasAppProfile,
  // Query API
  getAppProfile,
  getAllAppProfiles,
  getAppTypes,
  // Config factories
  createRuntimeConfig,
  createSDKConfig,
  createAppConfig,
} from './app-profiles';
