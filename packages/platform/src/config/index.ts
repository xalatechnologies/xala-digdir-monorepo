/**
 * @xalatechnologies/platform/config
 *
 * Configuration management for the platform
 *
 * Provides:
 * - Domain Registry - Multi-domain SaaS registration and management
 * - App profiles - Application-specific configurations
 * - Feature flags - Runtime feature toggles
 * - Environment configuration - Environment-specific settings
 * - Tenant configuration - Multi-tenant settings
 *
 * @example
 * ```tsx
 * import {
 *   getAppProfile,
 *   domainRegistry,
 *   createDomainBuilder,
 * } from '@xalatechnologies/platform/config';
 *
 * // Register a domain with the platform
 * domainRegistry.register({
 *   id: 'digilist',
 *   name: 'Digilist Booking Platform',
 *   version: '1.0.0',
 *   apps: [...],
 *   features: ['bookings', 'seasons'],
 *   routes: [...],
 *   navPolicies: [...],
 * });
 *
 * // Or use the fluent builder
 * createDomainBuilder('my-domain')
 *   .name('My Domain')
 *   .version('1.0.0')
 *   .addApp({ id: 'web', name: 'Web', port: 3000, routes: ['/'] })
 *   .register();
 *
 * // Query registered domains
 * const domains = domainRegistry.list();
 * const routes = domainRegistry.getRoutes('digilist');
 * ```
 */

// App profile types
export type AppId = 'web' | 'minside' | 'backoffice' | 'saas-admin' | 'monitoring' | 'docs-learning';

/**
 * Auth configuration for app profiles
 */
export interface AppAuthConfig {
  loginPath: string;
  debug?: boolean;
  sessionCheckInterval?: number;
  requireAuth?: boolean;
}

/**
 * App profile interface - extensible for domain-specific properties
 *
 * Core properties are required, while domain-specific extensions
 * can be added through optional properties or the index signature.
 */
export interface AppProfile {
  // Core identification - supports both platform and domain naming
  id?: AppId;
  appType?: string;  // Domain-specific app type
  name?: string;
  displayName?: string;  // Alternative to name
  description: string;

  // Features and routes
  features?: string[];
  featureFlags?: Record<string, boolean>;
  defaultRoute?: string;

  // Port configuration
  port?: number;
  defaultPort?: number;  // Alternative to port

  // Theme and localization
  locale?: string;
  theme?: string;
  colorScheme?: 'auto' | 'light' | 'dark';

  // Auth configuration
  authConfig?: AppAuthConfig;

  // Allow additional domain-specific properties
  [key: string]: unknown;
}

// App profiles registry
export const appProfiles: Record<AppId, AppProfile> = {
  web: {
    id: 'web',
    name: 'Public Web',
    description: 'Public-facing web application',
    features: ['search', 'rental-objects', 'public-booking'],
    defaultRoute: '/',
    port: 5173,
  },
  minside: {
    id: 'minside',
    name: 'Min Side',
    description: 'User portal for booking management',
    features: ['bookings', 'profile', 'notifications'],
    defaultRoute: '/dashboard',
    port: 5174,
  },
  backoffice: {
    id: 'backoffice',
    name: 'Backoffice',
    description: 'Admin portal with RBAC',
    features: ['rental-objects', 'bookings', 'reports', 'users', 'settings'],
    defaultRoute: '/dashboard',
    port: 5175,
  },
  'saas-admin': {
    id: 'saas-admin',
    name: 'SaaS Admin',
    description: 'SaaS administration portal',
    features: ['billing', 'subscriptions', 'tenants', 'plans'],
    defaultRoute: '/dashboard',
    port: 5177,
  },
  monitoring: {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'System monitoring dashboard',
    features: ['health', 'metrics', 'alerts', 'logs'],
    defaultRoute: '/dashboard',
    port: 5178,
  },
  'docs-learning': {
    id: 'docs-learning',
    name: 'Docs & Learning',
    description: 'Documentation and learning portal',
    features: ['docs', 'tutorials', 'guides'],
    defaultRoute: '/',
    port: 5179,
  },
};

// Get app profile by ID
export function getAppProfile(id: AppId): AppProfile {
  return appProfiles[id];
}

/**
 * Register additional app profiles from domain packages
 * This allows domains to extend the base platform profiles
 */
export function registerAppProfiles(profiles: AppProfile[]): void {
  for (const profile of profiles) {
    appProfiles[profile.id as AppId] = profile;
  }
}

// Feature flag types
export interface FeatureFlags {
  [key: string]: boolean;
}

// ============================================================================
// Environment Validation
// ============================================================================

export interface ValidatedEnv {
  VITE_API_URL: string;
  VITE_WS_URL?: string;
  VITE_TENANT_ID?: string;
  VITE_ENV: 'development' | 'staging' | 'production';
  DEV: boolean;
  PROD: boolean;
  [key: string]: string | boolean | undefined;
}

/**
 * Validates and parses environment variables
 * @param env - Vite's import.meta.env object
 * @returns Validated environment configuration
 */
export function validateEnv(env: Record<string, string | boolean | undefined>): ValidatedEnv {
  // Determine environment
  const envMode = (env.MODE as string) || 'development';
  let viteEnv: 'development' | 'staging' | 'production' = 'development';
  if (envMode === 'production' || env.PROD) {
    viteEnv = 'production';
  } else if (envMode === 'staging') {
    viteEnv = 'staging';
  }

  return {
    VITE_API_URL: (env.VITE_API_URL as string) || 'https://api.digilist.no',
    VITE_WS_URL: env.VITE_WS_URL as string | undefined,
    VITE_TENANT_ID: env.VITE_TENANT_ID as string | undefined,
    VITE_ENV: viteEnv,
    DEV: Boolean(env.DEV),
    PROD: Boolean(env.PROD),
    ...env,
  };
}

// ============================================================================
// App Configuration
// ============================================================================

export interface SdkConfig {
  baseUrl: string;
  wsUrl?: string;
  tenantId?: string;
  defaultHeaders?: Record<string, string>;
}

export interface RuntimeProviderConfig {
  appType: AppId;
  apiUrl: string;
  wsUrl?: string;
  tenantId?: string;
  locale: 'nb' | 'en';
  theme: string;
  colorScheme: 'light' | 'dark' | 'auto';
  authConfig: {
    loginPath: string;
    debug: boolean;
    sessionCheckInterval: number;
  };
  featureFlags: Record<string, boolean>;
}

export interface AppConfig {
  sdkConfig: SdkConfig;
  runtimeConfig: RuntimeProviderConfig;
}

/**
 * Creates SDK and RuntimeProvider configuration from app profile and validated env
 * @param appId - Application identifier
 * @param env - Validated environment configuration
 * @returns Configuration for SDK and RuntimeProvider
 */
export function createAppConfig(appId: AppId, env: ValidatedEnv): AppConfig {
  const profile = getAppProfile(appId);

  const sdkConfig: SdkConfig = {
    baseUrl: env.VITE_API_URL,
    wsUrl: env.VITE_WS_URL,
    tenantId: env.VITE_TENANT_ID,
    defaultHeaders: {
      'Accept-Language': 'nb',
    },
  };

  const runtimeConfig: RuntimeProviderConfig = {
    appType: appId,
    apiUrl: env.VITE_API_URL,
    wsUrl: env.VITE_WS_URL,
    tenantId: env.VITE_TENANT_ID,
    locale: 'nb',
    theme: 'digilist',
    colorScheme: 'auto',
    authConfig: {
      loginPath: '/login',
      debug: env.DEV,
      sessionCheckInterval: 60000,
    },
    featureFlags: (profile.features ?? []).reduce((acc, feature) => {
      acc[feature] = true;
      return acc;
    }, {} as Record<string, boolean>),
  };

  return { sdkConfig, runtimeConfig };
}

// ============================================================================
// Domain Registry - Multi-domain SaaS support
// ============================================================================

export {
  // Core registry instance
  domainRegistry,

  // Builder utility for fluent configuration
  createDomainBuilder,

  // Access control utilities
  canAccessRoute,
  filterAccessibleNavPolicies,
  buildNavHierarchy,

  // Types
  type DomainApp,
  type DomainConfig,
  type DomainIntegration,
  type DomainRegistry,
  type DomainRegistryEvent,
  type DomainRegistryEventType,
  type DomainRegistryListener,
  type NavPolicy,
  type RouteConfig,
} from './domain-registry';
