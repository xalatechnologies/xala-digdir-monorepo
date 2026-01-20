/**
 * @xala/config - App Profiles
 *
 * Static configuration profiles for each application.
 * These define the default behavior and settings for each app type.
 */

import type { AppType, AppProfile, RuntimeConfig, EnvConfig, SDKConfig } from './types';

// ============================================================================
// App Profile Definitions
// ============================================================================

/**
 * Web - Public-facing booking site
 * Port: 5173
 */
const webProfile: AppProfile = {
  appType: 'web',
  displayName: 'Digilist Web',
  description: 'Public-facing booking and discovery portal',
  defaultPort: 5173,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 60000, // 1 minute
    requireAuth: false, // Public site, auth optional
  },
  featureFlags: {
    'map-view': true,
    'search-suggestions': true,
    'guest-booking': true,
  },
};

/**
 * Minside - Citizen self-service portal
 * Port: 5174
 */
const minsideProfile: AppProfile = {
  appType: 'minside',
  displayName: 'Min Side',
  description: 'Citizen self-service portal for booking management',
  defaultPort: 5174,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 60000,
    requireAuth: true, // All routes require auth
  },
  featureFlags: {
    'notifications': true,
    'payment-history': true,
    'gdpr-export': true,
  },
};

/**
 * Backoffice - Tenant admin panel
 * Port: 5175
 */
const backofficeProfile: AppProfile = {
  appType: 'backoffice',
  displayName: 'Backoffice',
  description: 'Tenant administration and management portal',
  defaultPort: 5175,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 30000, // 30 seconds (more frequent for admin)
    requireAuth: true,
  },
  featureFlags: {
    'bulk-operations': true,
    'reports': true,
    'integrations': true,
    'audit-log': true,
  },
};

/**
 * SaaS Admin - Platform administration
 * Port: 5177
 */
const saasAdminProfile: AppProfile = {
  appType: 'saas-admin',
  displayName: 'SaaS Admin',
  description: 'Platform-level administration and billing',
  defaultPort: 5177,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 30000,
    requireAuth: true,
  },
  featureFlags: {
    'billing': true,
    'tenant-management': true,
    'feature-flags': true,
    'system-settings': true,
  },
};

/**
 * Monitoring - Observability dashboard
 * Port: 5178
 */
const monitoringProfile: AppProfile = {
  appType: 'monitoring',
  displayName: 'Monitoring',
  description: 'System health and observability dashboard',
  defaultPort: 5178,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'dark', // Dark theme for monitoring dashboards
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 30000,
    requireAuth: true,
  },
  featureFlags: {
    'realtime-metrics': true,
    'alerts': true,
    'incident-management': true,
  },
};

/**
 * Docs Learning - Documentation portal
 * Port: 5179
 */
const docsLearningProfile: AppProfile = {
  appType: 'docs-learning',
  displayName: 'Documentation',
  description: 'Documentation and learning portal',
  defaultPort: 5179,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 300000, // 5 minutes (less critical)
    requireAuth: false, // Public docs, some training requires auth
  },
  featureFlags: {
    'search': true,
    'tutorials': true,
    'api-docs': true,
  },
};

// ============================================================================
// Profile Registry
// ============================================================================

/**
 * Registry of all app profiles
 */
const appProfiles: Record<AppType, AppProfile> = {
  'web': webProfile,
  'minside': minsideProfile,
  'backoffice': backofficeProfile,
  'saas-admin': saasAdminProfile,
  'monitoring': monitoringProfile,
  'docs-learning': docsLearningProfile,
};

// ============================================================================
// Public API
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
 * const profile = getAppProfile('backoffice');
 * console.log(profile.defaultPort); // 5175
 * ```
 */
export function getAppProfile(appType: AppType): AppProfile {
  const profile = appProfiles[appType];
  if (!profile) {
    throw new Error(`Unknown app type: ${appType}`);
  }
  return profile;
}

/**
 * Get all app profiles
 */
export function getAllAppProfiles(): Record<AppType, AppProfile> {
  return { ...appProfiles };
}

/**
 * Get list of all app types
 */
export function getAppTypes(): AppType[] {
  return Object.keys(appProfiles) as AppType[];
}

/**
 * Create runtime config by combining app profile with environment config
 *
 * @param appType - The app type identifier
 * @param env - Environment configuration
 * @returns Complete RuntimeConfig for RuntimeProvider
 *
 * @example
 * ```typescript
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
 * @returns SDKConfig for initializeClient()
 *
 * @example
 * ```typescript
 * const env = validateEnv(import.meta.env);
 * const sdkConfig = createSDKConfig(env);
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
 * @returns Object with sdkConfig and runtimeConfig
 *
 * @example
 * ```typescript
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

// ============================================================================
// Export Profiles (for direct access if needed)
// ============================================================================

export {
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
};
