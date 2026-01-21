/**
 * @digilist/runtime - Digilist App Profiles
 *
 * Domain-specific app profile definitions for the Digilist rental booking platform.
 * These profiles are automatically registered on module load.
 *
 * @example
 * ```typescript
 * // Just import @digilist/runtime to register profiles
 * import '@digilist/runtime';
 *
 * // Then use the generic API
 * import { getAppProfile } from '@xala/config';
 * const profile = getAppProfile('backoffice');
 * ```
 */

import type { AppProfile } from '@xala/config';
import type { DigilistAppType } from './types';

// ============================================================================
// Digilist App Profile Definitions
// ============================================================================

/**
 * Web - Public-facing booking site
 * Port: 5173
 */
export const webProfile: AppProfile = {
  appType: 'web' satisfies DigilistAppType,
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
export const minsideProfile: AppProfile = {
  appType: 'minside' satisfies DigilistAppType,
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
    notifications: true,
    'payment-history': true,
    'gdpr-export': true,
  },
};

/**
 * Backoffice - Tenant admin panel
 * Port: 5175
 */
export const backofficeProfile: AppProfile = {
  appType: 'backoffice' satisfies DigilistAppType,
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
    reports: true,
    integrations: true,
    'audit-log': true,
  },
};

/**
 * SaaS Admin - Platform administration
 * Port: 5177
 */
export const saasAdminProfile: AppProfile = {
  appType: 'saas-admin' satisfies DigilistAppType,
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
    billing: true,
    'tenant-management': true,
    'feature-flags': true,
    'system-settings': true,
  },
};

/**
 * Monitoring - Observability dashboard
 * Port: 5178
 */
export const monitoringProfile: AppProfile = {
  appType: 'monitoring' satisfies DigilistAppType,
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
    alerts: true,
    'incident-management': true,
  },
};

/**
 * Docs Learning - Documentation portal
 * Port: 5179
 */
export const docsLearningProfile: AppProfile = {
  appType: 'docs-learning' satisfies DigilistAppType,
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
    search: true,
    tutorials: true,
    'api-docs': true,
  },
};

// ============================================================================
// Profile Collections
// ============================================================================

/**
 * All Digilist app profiles
 */
export const digilistProfiles: AppProfile[] = [
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
];

/**
 * Digilist profiles as a record keyed by app type
 */
export const digilistProfilesRecord: Record<DigilistAppType, AppProfile> = {
  web: webProfile,
  minside: minsideProfile,
  backoffice: backofficeProfile,
  'saas-admin': saasAdminProfile,
  monitoring: monitoringProfile,
  'docs-learning': docsLearningProfile,
};
