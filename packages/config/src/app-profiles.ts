/**
 * @xala/config - App Profiles
 *
 * Generic app profile registry with runtime registration support.
 * Domain-specific apps should register their profiles at runtime.
 *
 * This package provides a generic App Registry pattern - domain-specific
 * apps (like Digilist) should import from their respective domain packages
 * which register profiles on module load.
 *
 * @example
 * ```typescript
 * // Domain package (e.g., @digilist/runtime) registers profiles:
 * import { registerAppProfiles } from '@xala/config';
 * import { digilistProfiles } from './digilist-profiles';
 *
 * registerAppProfiles(digilistProfiles);
 *
 * // Then apps can use them:
 * import '@digilist/runtime'; // Side-effect: registers profiles
 * import { getAppProfile, createAppConfig } from '@xala/config';
 *
 * const profile = getAppProfile('backoffice');
 * ```
 */

import type { AppType, AppProfile, RuntimeConfig, EnvConfig, SDKConfig } from './types';

// ============================================================================
// Generic App Registry (Platform Layer)
// ============================================================================

/**
 * App profile registry - mutable for runtime registration
 * @internal
 */
const appProfileRegistry = new Map<AppType, AppProfile>();

/**
 * Register an app profile at runtime
 *
 * @param profile - The app profile to register
 *
 * @example
 * ```typescript
 * // In domain-specific runtime setup
 * registerAppProfile({
 *   appType: 'my-domain-app',
 *   displayName: 'My Domain App',
 *   // ... other config
 * });
 * ```
 */
export function registerAppProfile(profile: AppProfile): void {
  appProfileRegistry.set(profile.appType, profile);
}

/**
 * Register multiple app profiles at once
 *
 * @param profiles - Array of app profiles to register
 *
 * @example
 * ```typescript
 * // In domain package initialization
 * registerAppProfiles([webProfile, backofficeProfile, minsideProfile]);
 * ```
 */
export function registerAppProfiles(profiles: AppProfile[]): void {
  profiles.forEach((profile) => registerAppProfile(profile));
}

/**
 * Clear all registered profiles (useful for testing)
 */
export function clearAppProfiles(): void {
  appProfileRegistry.clear();
}

/**
 * Check if an app profile is registered
 *
 * @param appType - The app type identifier
 * @returns True if profile is registered
 */
export function hasAppProfile(appType: AppType): boolean {
  return appProfileRegistry.has(appType);
}

// ============================================================================
// Public Query API
// ============================================================================

/**
 * Get the profile for a specific app type
 *
 * @param appType - The app type identifier
 * @returns The app profile configuration
 * @throws Error if app type is not found
 *
 * @example
 * ```typescript
 * // After domain package has registered profiles
 * import '@digilist/runtime'; // Side-effect: registers Digilist profiles
 * import { getAppProfile } from '@xala/config';
 *
 * const profile = getAppProfile('backoffice');
 * console.log(profile.defaultPort); // 5175
 * ```
 */
export function getAppProfile(appType: AppType): AppProfile {
  const profile = appProfileRegistry.get(appType);
  if (!profile) {
    const registered = Array.from(appProfileRegistry.keys());
    const availableTypes = registered.length > 0
      ? registered.join(', ')
      : 'none - did you import your domain runtime package?';

    throw new Error(
      `Unknown app type: "${appType}". ` +
      `Available types: ${availableTypes}. ` +
      `Make sure to import your domain runtime package (e.g., import '@digilist/runtime') ` +
      `before using getAppProfile().`
    );
  }
  return profile;
}

/**
 * Get all registered app profiles
 *
 * @returns Record of all registered profiles keyed by appType
 */
export function getAllAppProfiles(): Record<AppType, AppProfile> {
  const result: Record<AppType, AppProfile> = {};
  appProfileRegistry.forEach((profile, key) => {
    result[key] = profile;
  });
  return result;
}

/**
 * Get list of all registered app types
 *
 * @returns Array of registered app type identifiers
 */
export function getAppTypes(): AppType[] {
  return Array.from(appProfileRegistry.keys());
}

// ============================================================================
// Config Factory Functions
// ============================================================================

/**
 * Create runtime config by combining app profile with environment config
 *
 * @param appType - The app type identifier
 * @param env - Environment configuration
 * @returns Complete RuntimeConfig for RuntimeProvider
 *
 * @example
 * ```typescript
 * import '@digilist/runtime'; // Registers profiles
 * import { validateEnv, createRuntimeConfig } from '@xala/config';
 *
 * const env = validateEnv(import.meta.env);
 * const config = createRuntimeConfig('backoffice', env);
 *
 * <RuntimeProvider config={config}>
 *   <App />
 * </RuntimeProvider>
 * ```
 */
export function createRuntimeConfig(
  appType: AppType,
  env: EnvConfig
): RuntimeConfig {
  const profile = getAppProfile(appType);

  return {
    appType: profile.appType,
    apiUrl: env.apiUrl,
    wsUrl: env.wsUrl,
    tenantId: env.tenantId,
    licenseKey: env.licenseKey,
    locale: profile.locale,
    theme: profile.theme,
    colorScheme: profile.colorScheme,
    authConfig: {
      ...profile.authConfig,
      debug: env.debug,
    },
    featureFlags: profile.featureFlags,
  };
}

/**
 * Create SDK initialization config from environment
 *
 * @param env - Environment configuration
 * @param headers - Optional custom headers
 * @returns SDKConfig for SDK initialization
 *
 * @example
 * ```typescript
 * import { validateEnv, createSDKConfig } from '@xala/config';
 *
 * const env = validateEnv(import.meta.env);
 * const sdkConfig = createSDKConfig(env);
 *
 * // Pass to your domain SDK's initialize function
 * initializeClient(sdkConfig);
 * ```
 */
export function createSDKConfig(
  env: EnvConfig,
  headers?: Record<string, string>
): SDKConfig {
  return {
    baseUrl: env.apiUrl,
    tenantId: env.tenantId,
    licenseKey: env.licenseKey,
    headers,
  };
}

/**
 * Create complete app configuration (SDK + Runtime)
 *
 * @param appType - The app type identifier
 * @param env - Environment configuration
 * @param options - Optional configuration
 * @returns Object with sdkConfig, runtimeConfig, and profile
 *
 * @example
 * ```typescript
 * import '@digilist/runtime'; // Registers profiles
 * import { validateEnv, createAppConfig } from '@xala/config';
 * import { initializeClient } from '@digilist/client-sdk';
 *
 * const env = validateEnv(import.meta.env);
 * const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
 *
 * initializeClient(sdkConfig);
 *
 * <RuntimeProvider config={runtimeConfig}>
 *   <App />
 * </RuntimeProvider>
 * ```
 */
export function createAppConfig(
  appType: AppType,
  env: EnvConfig,
  options?: {
    headers?: Record<string, string>;
  }
): {
  sdkConfig: SDKConfig;
  runtimeConfig: RuntimeConfig;
  profile: AppProfile;
} {
  const profile = getAppProfile(appType);
  const sdkConfig = createSDKConfig(env, options?.headers);
  const runtimeConfig = createRuntimeConfig(appType, env);

  return {
    sdkConfig,
    runtimeConfig,
    profile,
  };
}
