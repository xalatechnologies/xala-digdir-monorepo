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

export interface AppProfile {
  id: AppId;
  name: string;
  description: string;
  features: string[];
  defaultRoute: string;
  port: number;
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

// Feature flag types
export interface FeatureFlags {
  [key: string]: boolean;
}

// TODO: Migrate from @xala/config
// export { useFeatureFlag, FeatureFlagProvider } from './FeatureFlags';
// export { useTenantConfig, TenantConfigProvider } from './TenantConfig';
// export { useEnvironmentConfig } from './EnvironmentConfig';

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
