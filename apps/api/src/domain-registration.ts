/**
 * Digilist Domain Registration
 *
 * This file registers the Digilist domain with the Xala platform.
 * It defines all apps, features, routes, and navigation policies
 * that make up the Digilist booking platform.
 *
 * This registration should be called during application startup,
 * before any route or navigation policy checks are made.
 *
 * @example
 * ```typescript
 * // In main.ts or bootstrap file
 * import { registerDigilistDomain } from './domain-registration';
 *
 * // Register before starting the server
 * registerDigilistDomain();
 * ```
 */

import {
  domainRegistry,
  type DomainConfig,
  type DomainApp,
  type RouteConfig,
  type NavPolicy,
} from '@xalatechnologies/platform/config';

// ============================================================================
// Digilist Apps
// ============================================================================

const digilistApps: DomainApp[] = [
  {
    id: 'web',
    name: 'Public Web',
    port: 5173,
    routes: ['/'],
    description: 'Public-facing booking and discovery portal',
    requiresAuth: false,
  },
  {
    id: 'minside',
    name: 'Min Side',
    port: 5174,
    routes: ['/minside'],
    description: 'Citizen self-service portal for booking management',
    requiresAuth: true,
  },
  {
    id: 'backoffice',
    name: 'Backoffice',
    port: 5175,
    routes: ['/admin'],
    description: 'Tenant administration and management portal',
    requiresAuth: true,
  },
  {
    id: 'saas-admin',
    name: 'SaaS Admin',
    port: 5177,
    routes: ['/saas'],
    description: 'Platform-level administration and billing',
    requiresAuth: true,
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    port: 5178,
    routes: ['/monitoring'],
    description: 'System health and observability dashboard',
    requiresAuth: true,
  },
  {
    id: 'docs-learning',
    name: 'Documentation',
    port: 5179,
    routes: ['/docs'],
    description: 'Documentation and learning portal',
    requiresAuth: false,
  },
];

// ============================================================================
// Digilist Features
// ============================================================================

const digilistFeatures = [
  // Core booking features
  'bookings',
  'bookings:create',
  'bookings:cancel',
  'bookings:modify',

  // Seasonal leasing
  'seasons',
  'seasonal-leases',
  'season-applications',
  'priority-rules',

  // Resource management
  'allocations',
  'rental-objects',
  'rental-categories',

  // User management
  'users',
  'organizations',
  'org-memberships',

  // Compliance
  'gdpr',
  'gdpr:export',
  'gdpr:delete',
  'audit-logs',

  // Communication
  'notifications',
  'messaging',
  'conversations',

  // Payments
  'payments',
  'invoicing',
  'discount-codes',

  // Analytics
  'reports',
  'analytics',
  'dashboard',

  // Integrations
  'integrations',
  'calendar-sync',
  'payment-gateway',

  // Administration
  'settings',
  'branding',
  'access-control',
];

// ============================================================================
// Digilist Routes
// ============================================================================

const digilistRoutes: RouteConfig[] = [
  // -------------------------------------------------------------------------
  // Public Web Routes (web app)
  // -------------------------------------------------------------------------
  {
    path: '/',
    requiredPermissions: [],
    requiredFeatures: [],
    description: 'Home page - public',
    app: 'web',
    isPublic: true,
  },
  {
    path: '/listings',
    requiredPermissions: [],
    requiredFeatures: ['rental-objects'],
    description: 'Browse rental objects',
    app: 'web',
    isPublic: true,
  },
  {
    path: '/listings/:id',
    requiredPermissions: [],
    requiredFeatures: ['rental-objects'],
    description: 'Rental object details',
    app: 'web',
    isPublic: true,
  },
  {
    path: '/book/:listingId',
    requiredPermissions: ['bookings:create'],
    requiredFeatures: ['bookings', 'bookings:create'],
    description: 'Create a booking',
    app: 'web',
  },

  // -------------------------------------------------------------------------
  // Minside Routes (minside app)
  // -------------------------------------------------------------------------
  {
    path: '/minside/dashboard',
    requiredPermissions: ['user:read'],
    requiredFeatures: ['dashboard'],
    description: 'User dashboard',
    app: 'minside',
  },
  {
    path: '/minside/bookings',
    requiredPermissions: ['bookings:read'],
    requiredFeatures: ['bookings'],
    description: 'My bookings',
    app: 'minside',
  },
  {
    path: '/minside/bookings/:id',
    requiredPermissions: ['bookings:read'],
    requiredFeatures: ['bookings'],
    description: 'Booking details',
    app: 'minside',
  },
  {
    path: '/minside/profile',
    requiredPermissions: ['user:read', 'user:update'],
    requiredFeatures: [],
    description: 'User profile',
    app: 'minside',
  },
  {
    path: '/minside/notifications',
    requiredPermissions: ['notifications:read'],
    requiredFeatures: ['notifications'],
    description: 'Notification center',
    app: 'minside',
  },
  {
    path: '/minside/messages',
    requiredPermissions: ['messages:read'],
    requiredFeatures: ['messaging', 'conversations'],
    description: 'Messages',
    app: 'minside',
  },
  {
    path: '/minside/gdpr',
    requiredPermissions: ['gdpr:read'],
    requiredFeatures: ['gdpr'],
    description: 'GDPR data requests',
    app: 'minside',
  },

  // -------------------------------------------------------------------------
  // Backoffice Routes (backoffice app)
  // -------------------------------------------------------------------------
  {
    path: '/admin/dashboard',
    requiredPermissions: ['admin:read'],
    requiredFeatures: ['dashboard'],
    description: 'Admin dashboard',
    app: 'backoffice',
  },
  {
    path: '/admin/bookings',
    requiredPermissions: ['admin:bookings:read'],
    requiredFeatures: ['bookings'],
    description: 'Booking management',
    app: 'backoffice',
  },
  {
    path: '/admin/bookings/:id',
    requiredPermissions: ['admin:bookings:read'],
    requiredFeatures: ['bookings'],
    description: 'Booking details',
    app: 'backoffice',
  },
  {
    path: '/admin/listings',
    requiredPermissions: ['admin:listings:read'],
    requiredFeatures: ['rental-objects'],
    description: 'Listing management',
    app: 'backoffice',
  },
  {
    path: '/admin/listings/:id',
    requiredPermissions: ['admin:listings:read'],
    requiredFeatures: ['rental-objects'],
    description: 'Listing details',
    app: 'backoffice',
  },
  {
    path: '/admin/seasons',
    requiredPermissions: ['admin:seasons:read'],
    requiredFeatures: ['seasons', 'seasonal-leases'],
    description: 'Season management',
    app: 'backoffice',
  },
  {
    path: '/admin/allocations',
    requiredPermissions: ['admin:allocations:read'],
    requiredFeatures: ['allocations'],
    description: 'Allocation management',
    app: 'backoffice',
  },
  {
    path: '/admin/users',
    requiredPermissions: ['admin:users:read'],
    requiredFeatures: ['users'],
    description: 'User management',
    app: 'backoffice',
  },
  {
    path: '/admin/organizations',
    requiredPermissions: ['admin:organizations:read'],
    requiredFeatures: ['organizations'],
    description: 'Organization management',
    app: 'backoffice',
  },
  {
    path: '/admin/reports',
    requiredPermissions: ['admin:reports:read'],
    requiredFeatures: ['reports', 'analytics'],
    description: 'Reports and analytics',
    app: 'backoffice',
  },
  {
    path: '/admin/audit-logs',
    requiredPermissions: ['admin:audit:read'],
    requiredFeatures: ['audit-logs'],
    description: 'Audit log viewer',
    app: 'backoffice',
  },
  {
    path: '/admin/settings',
    requiredPermissions: ['admin:settings:read'],
    requiredFeatures: ['settings'],
    description: 'System settings',
    app: 'backoffice',
  },
  {
    path: '/admin/settings/branding',
    requiredPermissions: ['admin:settings:branding'],
    requiredFeatures: ['settings', 'branding'],
    description: 'Branding configuration',
    app: 'backoffice',
  },
  {
    path: '/admin/settings/integrations',
    requiredPermissions: ['admin:settings:integrations'],
    requiredFeatures: ['settings', 'integrations'],
    description: 'Integration settings',
    app: 'backoffice',
  },
  {
    path: '/admin/settings/access-control',
    requiredPermissions: ['admin:settings:access-control'],
    requiredFeatures: ['settings', 'access-control'],
    description: 'Access control settings',
    app: 'backoffice',
  },

  // -------------------------------------------------------------------------
  // SaaS Admin Routes (saas-admin app)
  // -------------------------------------------------------------------------
  {
    path: '/saas/dashboard',
    requiredPermissions: ['saas:read'],
    requiredFeatures: [],
    description: 'SaaS admin dashboard',
    app: 'saas-admin',
  },
  {
    path: '/saas/tenants',
    requiredPermissions: ['saas:tenants:read'],
    requiredFeatures: [],
    description: 'Tenant management',
    app: 'saas-admin',
  },
  {
    path: '/saas/tenants/:id',
    requiredPermissions: ['saas:tenants:read'],
    requiredFeatures: [],
    description: 'Tenant details',
    app: 'saas-admin',
  },
  {
    path: '/saas/plans',
    requiredPermissions: ['saas:plans:read'],
    requiredFeatures: [],
    description: 'Plan management',
    app: 'saas-admin',
  },
  {
    path: '/saas/entitlements',
    requiredPermissions: ['saas:entitlements:read'],
    requiredFeatures: [],
    description: 'Entitlement management',
    app: 'saas-admin',
  },
  {
    path: '/saas/billing',
    requiredPermissions: ['saas:billing:read'],
    requiredFeatures: [],
    description: 'Billing overview',
    app: 'saas-admin',
  },
  {
    path: '/saas/domains',
    requiredPermissions: ['saas:domains:read'],
    requiredFeatures: [],
    description: 'Domain registry',
    app: 'saas-admin',
  },
  {
    path: '/saas/kill-switches',
    requiredPermissions: ['saas:kill-switches:read'],
    requiredFeatures: [],
    description: 'Global kill switches',
    app: 'saas-admin',
  },

  // -------------------------------------------------------------------------
  // Monitoring Routes (monitoring app)
  // -------------------------------------------------------------------------
  {
    path: '/monitoring/dashboard',
    requiredPermissions: ['monitoring:read'],
    requiredFeatures: [],
    description: 'Monitoring dashboard',
    app: 'monitoring',
  },
  {
    path: '/monitoring/health',
    requiredPermissions: ['monitoring:health:read'],
    requiredFeatures: [],
    description: 'Health checks',
    app: 'monitoring',
  },
  {
    path: '/monitoring/metrics',
    requiredPermissions: ['monitoring:metrics:read'],
    requiredFeatures: [],
    description: 'System metrics',
    app: 'monitoring',
  },
  {
    path: '/monitoring/alerts',
    requiredPermissions: ['monitoring:alerts:read'],
    requiredFeatures: [],
    description: 'Alert management',
    app: 'monitoring',
  },
  {
    path: '/monitoring/logs',
    requiredPermissions: ['monitoring:logs:read'],
    requiredFeatures: [],
    description: 'Log viewer',
    app: 'monitoring',
  },
];

// ============================================================================
// Digilist Navigation Policies
// ============================================================================

const digilistNavPolicies: NavPolicy[] = [
  // -------------------------------------------------------------------------
  // Minside Navigation
  // -------------------------------------------------------------------------
  {
    id: 'minside-dashboard',
    label: 'nav.dashboard',
    icon: 'dashboard',
    route: '/minside/dashboard',
    requiredPermissions: ['user:read'],
    section: 'main',
    app: 'minside',
    order: 1,
  },
  {
    id: 'minside-bookings',
    label: 'nav.bookings',
    icon: 'calendar',
    route: '/minside/bookings',
    requiredPermissions: ['bookings:read'],
    requiredFeatures: ['bookings'],
    section: 'main',
    app: 'minside',
    order: 2,
  },
  {
    id: 'minside-messages',
    label: 'nav.messages',
    icon: 'message',
    route: '/minside/messages',
    requiredPermissions: ['messages:read'],
    requiredFeatures: ['messaging'],
    section: 'main',
    app: 'minside',
    order: 3,
  },
  {
    id: 'minside-notifications',
    label: 'nav.notifications',
    icon: 'bell',
    route: '/minside/notifications',
    requiredPermissions: ['notifications:read'],
    requiredFeatures: ['notifications'],
    section: 'main',
    app: 'minside',
    order: 4,
  },
  {
    id: 'minside-profile',
    label: 'nav.profile',
    icon: 'user',
    route: '/minside/profile',
    requiredPermissions: ['user:read'],
    section: 'settings',
    app: 'minside',
    order: 1,
  },
  {
    id: 'minside-gdpr',
    label: 'nav.gdpr',
    icon: 'shield',
    route: '/minside/gdpr',
    requiredPermissions: ['gdpr:read'],
    requiredFeatures: ['gdpr'],
    section: 'settings',
    app: 'minside',
    order: 2,
  },

  // -------------------------------------------------------------------------
  // Backoffice Navigation
  // -------------------------------------------------------------------------
  {
    id: 'backoffice-dashboard',
    label: 'nav.dashboard',
    icon: 'dashboard',
    route: '/admin/dashboard',
    requiredPermissions: ['admin:read'],
    section: 'main',
    app: 'backoffice',
    order: 1,
  },
  {
    id: 'backoffice-bookings',
    label: 'nav.bookings',
    icon: 'calendar',
    route: '/admin/bookings',
    requiredPermissions: ['admin:bookings:read'],
    requiredFeatures: ['bookings'],
    section: 'main',
    app: 'backoffice',
    order: 2,
  },
  {
    id: 'backoffice-listings',
    label: 'nav.listings',
    icon: 'building',
    route: '/admin/listings',
    requiredPermissions: ['admin:listings:read'],
    requiredFeatures: ['rental-objects'],
    section: 'main',
    app: 'backoffice',
    order: 3,
  },
  {
    id: 'backoffice-seasons',
    label: 'nav.seasons',
    icon: 'sun',
    route: '/admin/seasons',
    requiredPermissions: ['admin:seasons:read'],
    requiredFeatures: ['seasons'],
    section: 'main',
    app: 'backoffice',
    order: 4,
  },
  {
    id: 'backoffice-allocations',
    label: 'nav.allocations',
    icon: 'grid',
    route: '/admin/allocations',
    requiredPermissions: ['admin:allocations:read'],
    requiredFeatures: ['allocations'],
    section: 'main',
    app: 'backoffice',
    order: 5,
  },
  {
    id: 'backoffice-users',
    label: 'nav.users',
    icon: 'users',
    route: '/admin/users',
    requiredPermissions: ['admin:users:read'],
    requiredFeatures: ['users'],
    section: 'admin',
    app: 'backoffice',
    order: 1,
  },
  {
    id: 'backoffice-organizations',
    label: 'nav.organizations',
    icon: 'building-office',
    route: '/admin/organizations',
    requiredPermissions: ['admin:organizations:read'],
    requiredFeatures: ['organizations'],
    section: 'admin',
    app: 'backoffice',
    order: 2,
  },
  {
    id: 'backoffice-reports',
    label: 'nav.reports',
    icon: 'chart',
    route: '/admin/reports',
    requiredPermissions: ['admin:reports:read'],
    requiredFeatures: ['reports'],
    section: 'admin',
    app: 'backoffice',
    order: 3,
  },
  {
    id: 'backoffice-audit-logs',
    label: 'nav.auditLogs',
    icon: 'file-text',
    route: '/admin/audit-logs',
    requiredPermissions: ['admin:audit:read'],
    requiredFeatures: ['audit-logs'],
    section: 'admin',
    app: 'backoffice',
    order: 4,
  },
  {
    id: 'backoffice-settings',
    label: 'nav.settings',
    icon: 'settings',
    route: '/admin/settings',
    requiredPermissions: ['admin:settings:read'],
    requiredFeatures: ['settings'],
    section: 'settings',
    app: 'backoffice',
    order: 1,
  },
  {
    id: 'backoffice-settings-branding',
    label: 'nav.branding',
    icon: 'palette',
    route: '/admin/settings/branding',
    requiredPermissions: ['admin:settings:branding'],
    requiredFeatures: ['branding'],
    parentId: 'backoffice-settings',
    section: 'settings',
    app: 'backoffice',
    order: 1,
  },
  {
    id: 'backoffice-settings-integrations',
    label: 'nav.integrations',
    icon: 'plug',
    route: '/admin/settings/integrations',
    requiredPermissions: ['admin:settings:integrations'],
    requiredFeatures: ['integrations'],
    parentId: 'backoffice-settings',
    section: 'settings',
    app: 'backoffice',
    order: 2,
  },
  {
    id: 'backoffice-settings-access-control',
    label: 'nav.accessControl',
    icon: 'lock',
    route: '/admin/settings/access-control',
    requiredPermissions: ['admin:settings:access-control'],
    requiredFeatures: ['access-control'],
    parentId: 'backoffice-settings',
    section: 'settings',
    app: 'backoffice',
    order: 3,
  },

  // -------------------------------------------------------------------------
  // SaaS Admin Navigation
  // -------------------------------------------------------------------------
  {
    id: 'saas-dashboard',
    label: 'nav.dashboard',
    icon: 'dashboard',
    route: '/saas/dashboard',
    requiredPermissions: ['saas:read'],
    section: 'main',
    app: 'saas-admin',
    order: 1,
  },
  {
    id: 'saas-tenants',
    label: 'nav.tenants',
    icon: 'building',
    route: '/saas/tenants',
    requiredPermissions: ['saas:tenants:read'],
    section: 'main',
    app: 'saas-admin',
    order: 2,
  },
  {
    id: 'saas-plans',
    label: 'nav.plans',
    icon: 'credit-card',
    route: '/saas/plans',
    requiredPermissions: ['saas:plans:read'],
    section: 'main',
    app: 'saas-admin',
    order: 3,
  },
  {
    id: 'saas-entitlements',
    label: 'nav.entitlements',
    icon: 'key',
    route: '/saas/entitlements',
    requiredPermissions: ['saas:entitlements:read'],
    section: 'main',
    app: 'saas-admin',
    order: 4,
  },
  {
    id: 'saas-billing',
    label: 'nav.billing',
    icon: 'receipt',
    route: '/saas/billing',
    requiredPermissions: ['saas:billing:read'],
    section: 'main',
    app: 'saas-admin',
    order: 5,
  },
  {
    id: 'saas-domains',
    label: 'nav.domains',
    icon: 'globe',
    route: '/saas/domains',
    requiredPermissions: ['saas:domains:read'],
    section: 'platform',
    app: 'saas-admin',
    order: 1,
  },
  {
    id: 'saas-kill-switches',
    label: 'nav.killSwitches',
    icon: 'alert-triangle',
    route: '/saas/kill-switches',
    requiredPermissions: ['saas:kill-switches:read'],
    section: 'platform',
    app: 'saas-admin',
    order: 2,
  },

  // -------------------------------------------------------------------------
  // Monitoring Navigation
  // -------------------------------------------------------------------------
  {
    id: 'monitoring-dashboard',
    label: 'nav.dashboard',
    icon: 'dashboard',
    route: '/monitoring/dashboard',
    requiredPermissions: ['monitoring:read'],
    section: 'main',
    app: 'monitoring',
    order: 1,
  },
  {
    id: 'monitoring-health',
    label: 'nav.health',
    icon: 'heart',
    route: '/monitoring/health',
    requiredPermissions: ['monitoring:health:read'],
    section: 'main',
    app: 'monitoring',
    order: 2,
  },
  {
    id: 'monitoring-metrics',
    label: 'nav.metrics',
    icon: 'bar-chart',
    route: '/monitoring/metrics',
    requiredPermissions: ['monitoring:metrics:read'],
    section: 'main',
    app: 'monitoring',
    order: 3,
  },
  {
    id: 'monitoring-alerts',
    label: 'nav.alerts',
    icon: 'bell',
    route: '/monitoring/alerts',
    requiredPermissions: ['monitoring:alerts:read'],
    section: 'main',
    app: 'monitoring',
    order: 4,
  },
  {
    id: 'monitoring-logs',
    label: 'nav.logs',
    icon: 'file-text',
    route: '/monitoring/logs',
    requiredPermissions: ['monitoring:logs:read'],
    section: 'main',
    app: 'monitoring',
    order: 5,
  },
];

// ============================================================================
// Digilist Domain Configuration
// ============================================================================

/**
 * Complete Digilist domain configuration
 */
export const digilistDomainConfig: DomainConfig = {
  id: 'digilist',
  name: 'Digilist Booking Platform',
  description: 'Municipal rental and booking system for Norwegian municipalities (kommuner). Provides booking management, seasonal leases, resource allocation, and citizen self-service.',
  version: '1.0.0',
  apps: digilistApps,
  features: digilistFeatures,
  routes: digilistRoutes,
  navPolicies: digilistNavPolicies,
  integrations: [
    {
      id: 'bankid',
      name: 'BankID/ID-porten',
      type: 'authentication',
      required: true,
    },
    {
      id: 'vipps',
      name: 'Vipps',
      type: 'payment',
      required: false,
    },
    {
      id: 'nets',
      name: 'Nets Easy',
      type: 'payment',
      required: false,
    },
    {
      id: 'sms-gateway',
      name: 'SMS Gateway',
      type: 'notification',
      required: false,
    },
    {
      id: 'email-service',
      name: 'Email Service',
      type: 'notification',
      required: true,
    },
  ],
  metadata: {
    region: 'NO',
    compliance: ['GDPR', 'Arkivloven'],
    supportedLanguages: ['nb', 'nn', 'en'],
    primaryLanguage: 'nb',
    timezone: 'Europe/Oslo',
  },
};

// ============================================================================
// Registration Function
// ============================================================================

/**
 * Register the Digilist domain with the platform
 *
 * Call this function during application startup to register
 * Digilist's apps, features, routes, and navigation policies.
 *
 * @example
 * ```typescript
 * // In apps/api/src/main.ts
 * import { registerDigilistDomain } from './domain-registration';
 *
 * async function bootstrap() {
 *   // Register domain before starting server
 *   registerDigilistDomain();
 *
 *   const app = Fastify();
 *   // ... rest of bootstrap
 * }
 * ```
 */
export function registerDigilistDomain(): void {
  // Check if already registered (for hot reload scenarios)
  if (domainRegistry.has('digilist')) {
    console.log('[Digilist] Domain already registered, skipping...');
    return;
  }

  domainRegistry.register(digilistDomainConfig);

  console.log('[Digilist] Domain registered successfully');
  console.log(`  - Apps: ${digilistDomainConfig.apps.length}`);
  console.log(`  - Features: ${digilistDomainConfig.features.length}`);
  console.log(`  - Routes: ${digilistDomainConfig.routes.length}`);
  console.log(`  - Nav Policies: ${digilistDomainConfig.navPolicies.length}`);
}

/**
 * Unregister the Digilist domain from the platform
 *
 * Useful for testing or domain migration scenarios.
 */
export function unregisterDigilistDomain(): void {
  if (domainRegistry.unregister('digilist')) {
    console.log('[Digilist] Domain unregistered successfully');
  }
}

// ============================================================================
// Auto-registration (Optional)
// ============================================================================

// Uncomment the following line to auto-register on import:
// registerDigilistDomain();
