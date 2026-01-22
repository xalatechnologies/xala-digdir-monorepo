/**
 * @digilist/runtime - App Configuration Factory
 *
 * Creates configuration objects for SDK and Runtime from app profiles.
 */

import type { ValidatedEnv } from './env-validation';
import { getAppProfile, type AppProfile } from './app-profile';

// ============================================================================
// Config Types
// ============================================================================

export interface SDKConfig {
  baseUrl: string;
  platformApiUrl?: string;
  tenantId?: string;
  defaultHeaders?: Record<string, string>;
}

export interface RuntimeConfig {
  appType: string;
  apiUrl: string;
  platformApiUrl?: string;
  wsUrl?: string;
  tenantId?: string;
  locale: string;
  theme: string;
  colorScheme: 'auto' | 'light' | 'dark';
  authConfig: AppProfile['authConfig'];
  featureFlags: Record<string, boolean>;
  debug: boolean;
}

export interface AppConfig {
  sdkConfig: SDKConfig;
  runtimeConfig: RuntimeConfig;
}

// ============================================================================
// Config Factory
// ============================================================================

export interface AppConfigOptions {
  headers?: Record<string, string>;
}

/**
 * Create app configuration from profile and environment
 */
export function createAppConfig(appType: string, env: ValidatedEnv, options?: AppConfigOptions): AppConfig {
  const profile = getAppProfile(appType);

  if (!profile) {
    throw new Error(`Unknown app type: ${appType}. Did you import @digilist/runtime first?`);
  }

  const sdkConfig: SDKConfig = {
    baseUrl: env.VITE_API_URL,
    platformApiUrl: env.VITE_PLATFORM_API_URL,
    tenantId: env.VITE_TENANT_ID,
    defaultHeaders: {
      'Accept-Language': profile.locale,
      ...options?.headers,
    },
  };

  const runtimeConfig: RuntimeConfig = {
    appType: profile.appType,
    apiUrl: env.VITE_API_URL,
    platformApiUrl: env.VITE_PLATFORM_API_URL,
    wsUrl: env.VITE_WS_URL || env.VITE_API_URL.replace(/^http/, 'ws') + '/ws',
    tenantId: env.VITE_TENANT_ID,
    locale: profile.locale,
    theme: profile.theme,
    colorScheme: profile.colorScheme,
    authConfig: profile.authConfig,
    featureFlags: profile.featureFlags,
    debug: env.DEV,
  };

  return { sdkConfig, runtimeConfig };
}
