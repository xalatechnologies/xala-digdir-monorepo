/**
 * API Module Registry
 *
 * Classifies all API modules into platform (domain-agnostic) and domain (Digilist-specific) categories.
 * This registry guides the eventual split of the API into two separate services.
 *
 * Centralized categorization of all API modules for:
 * - Clear ownership (platform vs domain)
 * - Discovery (find modules by category/tier)
 * - Documentation
 * - Future extraction into separate packages
 *
 * @since 2026-01-21
 * @version 2.0.0
 */

// =============================================================================
// SIMPLIFIED MODULE CLASSIFICATION (for quick reference)
// =============================================================================

/**
 * Simplified module classification for quick reference.
 * This is the primary reference for determining module ownership.
 */
export const MODULE_CLASSIFICATION = {
  /**
   * Platform modules - Domain-agnostic, will be extracted to platform monorepo
   * These modules have NO Digilist-specific business logic.
   */
  platform: {
    /** Core user/tenant/org management */
    core: ['auth', 'authz', 'tenant', 'user', 'organizations'],
    /** Infrastructure services */
    infrastructure: ['health', 'websocket', 'storage', 'configuration', 'settings'],
    /** Audit, GDPR, security */
    compliance: ['audit', 'gdpr', 'security'],
    /** SaaS billing and feature management */
    saas: ['billing', 'entitlements', 'license', 'seat-limits', 'feature-flags', 'saas', 'policy', 'menu'],
    /** Multi-channel notifications */
    notifications: ['notifications', 'push-notifications', 'notification-system'],
    /** Role-based access control */
    rbac: ['capabilities', 'permission-assignment', 'case-handler-scope', 'access-grant'],
    /** Third-party integrations */
    integrations: ['integrations', 'webhooks'],
    /** Internationalization */
    i18n: ['translations'],
    /** System monitoring */
    monitoring: ['monitoring'],
  },

  /**
   * Domain modules - Digilist-specific, stay in this repo
   * These modules contain Digilist business logic and terminology.
   */
  domain: {
    /** Rental object management */
    rentalObjects: ['rental-objects', 'rental-object-details', 'amenities', 'addons'],
    /** Booking and calendar */
    booking: ['bookings', 'booking', 'calendar', 'availability', 'blocks'],
    /** Seasonal allocation */
    seasons: ['seasons', 'season-applications', 'seasonal-lease', 'allocations'],
    /** Search and discovery */
    discovery: ['search', 'favorites', 'reviews'],
    /** Custody (domain-specific) */
    custody: ['custody'],
    /** Pricing rules */
    pricing: ['pricing', 'discount-codes'],
    /** Embeddable widgets */
    widgets: ['widgets'],
    /** Domain utilities */
    domain: ['domain'],
  },

  /**
   * Shared modules - Used by both platform and domain, need careful handling
   * These modules may need to be split or have clear interfaces defined.
   */
  shared: [
    'dashboard',
    'reports',
    'conversations',
    'messages',
    'public',
    'help',
    'share',
    'backoffice',
    'minside',
    'user-groups',
    'user-management',
    'tenant-admin',
    'profile',
    'metadata',
    'bulk',
  ],
} as const;

// =============================================================================
// QUICK LOOKUP HELPERS
// =============================================================================

/**
 * Check if a module is a platform module
 */
export function isPlatformModule(moduleName: string): boolean {
  const platformModules = Object.values(MODULE_CLASSIFICATION.platform).flat();
  return platformModules.includes(moduleName);
}

/**
 * Check if a module is a domain module
 */
export function isDomainModule(moduleName: string): boolean {
  const domainModules = Object.values(MODULE_CLASSIFICATION.domain).flat();
  return domainModules.includes(moduleName);
}

/**
 * Check if a module is a shared module
 */
export function isSharedModule(moduleName: string): boolean {
  return MODULE_CLASSIFICATION.shared.includes(moduleName as (typeof MODULE_CLASSIFICATION.shared)[number]);
}

/**
 * Get the category of a module
 */
export function getModuleCategory(moduleName: string): 'platform' | 'domain' | 'shared' | 'unknown' {
  if (isPlatformModule(moduleName)) return 'platform';
  if (isDomainModule(moduleName)) return 'domain';
  if (isSharedModule(moduleName)) return 'shared';
  return 'unknown';
}

/**
 * Get the subcategory of a platform or domain module
 */
export function getModuleSubcategory(moduleName: string): string | null {
  // Check platform subcategories
  for (const [subcategory, modules] of Object.entries(MODULE_CLASSIFICATION.platform)) {
    if ((modules as readonly string[]).includes(moduleName)) {
      return subcategory;
    }
  }
  // Check domain subcategories
  for (const [subcategory, modules] of Object.entries(MODULE_CLASSIFICATION.domain)) {
    if ((modules as readonly string[]).includes(moduleName)) {
      return subcategory;
    }
  }
  return null;
}

// =============================================================================
// ROUTE PREFIX MAPPING
// =============================================================================

/**
 * Route prefix mapping for future API split.
 * Platform and domain modules will eventually be served from different prefixes.
 */
export const ROUTE_PREFIXES = {
  /** Platform modules will be at /api/platform/* */
  platform: '/api/platform',
  /** Domain modules will be at /api/domain/* */
  domain: '/api/domain',
  /** Shared modules keep current paths at /api/* */
  shared: '/api',
} as const;

// =============================================================================
// MODULE TIERS
// =============================================================================

/**
 * Module Tier Classification:
 * - infrastructure: Cross-cutting concerns, no business logic
 * - core: Core data entities (users, tenants, organizations)
 * - domain: Business domain logic (bookings, rental objects)
 * - feature: Features built on domain (amenities, addons, reviews)
 * - admin: Administrative/backoffice features
 * - portal: App-specific endpoints
 * - utility: System utilities (health, search)
 */
export type ModuleTier =
  | 'infrastructure'
  | 'core'
  | 'domain'
  | 'feature'
  | 'admin'
  | 'portal'
  | 'utility';

// =============================================================================
// MODULE CATEGORIES
// =============================================================================

/**
 * Module Category Classification:
 * Used for grouping related modules for documentation and discovery
 */
export type ModuleCategory =
  | 'auth' // Authentication & authorization
  | 'tenant' // Multi-tenant management
  | 'user' // User management
  | 'organization' // Organization/kommune management
  | 'audit' // Audit logging & compliance
  | 'gdpr' // GDPR & data privacy
  | 'booking' // Booking domain
  | 'rental-object' // Rental object domain
  | 'calendar' // Calendar & scheduling
  | 'season' // Seasonal management
  | 'messaging' // Conversations & notifications
  | 'billing' // Payment & invoicing
  | 'pricing' // Pricing rules
  | 'integration' // Third-party integrations
  | 'configuration' // System configuration
  | 'monitoring' // System monitoring
  | 'admin' // Administrative features
  | 'portal' // App-specific features
  | 'utility'; // Utilities

// =============================================================================
// DATABASE SCHEMAS
// =============================================================================

/**
 * PostgreSQL schemas used by modules
 */
export type DatabaseSchema =
  | 'platform' // Users, tenants, orgs, sessions, permissions
  | 'domain' // Rental objects, bookings, seasons, allocations
  | 'saas' // Plans, route policies, nav policies
  | 'compliance' // Audit logs, GDPR requests
  | 'monitoring'; // Health checks, metrics

// =============================================================================
// REGISTRATION PATTERNS
// =============================================================================

/**
 * How modules are registered in main.ts
 */
export type RegistrationType =
  | 'module' // Full NestJS-style @Module decorator
  | 'controller' // Direct controller registration
  | 'plugin' // Fastify plugin routes
  | 'route'; // Shared routes in /src/routes/

// =============================================================================
// MODULE METADATA
// =============================================================================

export interface ModuleMetadata {
  /** Module name (folder name) */
  name: string;

  /** Human-readable description */
  description: string;

  /** Module tier (infrastructure, core, domain, etc.) */
  tier: ModuleTier;

  /** Module category for grouping */
  category: ModuleCategory;

  /** Database schemas this module accesses */
  schemas: DatabaseSchema[];

  /** Other modules this module depends on */
  dependencies: string[];

  /** How the module is registered */
  registrationType: RegistrationType;

  /** Whether module logs audit events */
  isAuditAware: boolean;

  /** Whether module handles multi-tenant isolation */
  isMultiTenantAware: boolean;

  /** Ownership: platform (extractable) or domain (Digilist-specific) */
  ownership: 'platform' | 'domain' | 'shared';

  /** API route prefix (if applicable) */
  routePrefix?: string;

  /** Files in this module */
  files?: string[];

  /** Notes for developers */
  notes?: string;
}

// =============================================================================
// MODULE REGISTRY
// =============================================================================

export const MODULE_REGISTRY: Record<string, ModuleMetadata> = {
  // ===========================================================================
  // PLATFORM - INFRASTRUCTURE TIER
  // ===========================================================================

  auth: {
    name: 'auth',
    description: 'Authentication (JWT, BankID/ID-porten, sessions)',
    tier: 'infrastructure',
    category: 'auth',
    schemas: ['platform'],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: false,
    ownership: 'platform',
    routePrefix: '/api/auth',
    files: [
      'auth.controller.ts',
      'idporten.controller.ts',
      'session.service.ts',
      'rbac-setup.service.ts',
    ],
  },

  authz: {
    name: 'authz',
    description: 'Authorization checks, /me endpoint',
    tier: 'infrastructure',
    category: 'auth',
    schemas: ['platform'],
    dependencies: ['auth'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/authz',
  },

  health: {
    name: 'health',
    description: 'System health check endpoint',
    tier: 'infrastructure',
    category: 'monitoring',
    schemas: [],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: false,
    ownership: 'platform',
    routePrefix: '/health',
  },

  websocket: {
    name: 'websocket',
    description: 'Real-time event broadcasting via WebSocket',
    tier: 'infrastructure',
    category: 'messaging',
    schemas: [],
    dependencies: ['auth'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/ws',
  },

  security: {
    name: 'security',
    description: 'Security endpoints and checks',
    tier: 'infrastructure',
    category: 'auth',
    schemas: ['platform'],
    dependencies: ['auth'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: false,
    ownership: 'platform',
    routePrefix: '/api/security',
  },

  public: {
    name: 'public',
    description: 'Public endpoints (no auth required)',
    tier: 'infrastructure',
    category: 'utility',
    schemas: [],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: false,
    ownership: 'platform',
    routePrefix: '/api/public',
  },

  // ===========================================================================
  // PLATFORM - CORE TIER
  // ===========================================================================

  tenant: {
    name: 'tenant',
    description: 'Multi-tenant management',
    tier: 'core',
    category: 'tenant',
    schemas: ['platform'],
    dependencies: [],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/tenants',
    files: ['tenant.controller.ts', 'tenant.service.ts', 'tenant.repository.ts', 'tenant.module.ts'],
  },

  user: {
    name: 'user',
    description: 'User account management',
    tier: 'core',
    category: 'user',
    schemas: ['platform'],
    dependencies: ['tenant'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/users',
  },

  organizations: {
    name: 'organizations',
    description: 'Organization/kommune management',
    tier: 'core',
    category: 'organization',
    schemas: ['platform'],
    dependencies: ['tenant', 'user'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/organizations',
  },

  monitoring: {
    name: 'monitoring',
    description: 'System monitoring (audit queries, alerts, incidents)',
    tier: 'core',
    category: 'monitoring',
    schemas: ['platform', 'compliance', 'monitoring'],
    dependencies: ['tenant'],
    registrationType: 'module',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/monitoring',
  },

  audit: {
    name: 'audit',
    description: 'Audit log queries and reports',
    tier: 'core',
    category: 'audit',
    schemas: ['compliance'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: false, // It IS the audit system
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/audit',
  },

  gdpr: {
    name: 'gdpr',
    description: 'GDPR data subject requests, consent management',
    tier: 'core',
    category: 'gdpr',
    schemas: ['compliance', 'platform'],
    dependencies: ['tenant', 'user'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/gdpr',
  },

  // ===========================================================================
  // PLATFORM - ADMIN TIER (SaaS Management)
  // ===========================================================================

  'tenant-admin': {
    name: 'tenant-admin',
    description: 'SaaS tenant administration',
    tier: 'admin',
    category: 'admin',
    schemas: ['platform', 'saas'],
    dependencies: ['tenant'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: false, // Cross-tenant admin
    ownership: 'platform',
    routePrefix: '/api/tenant-admin',
  },

  saas: {
    name: 'saas',
    description: 'SaaS admin panel (plans, billing, feature flags)',
    tier: 'admin',
    category: 'admin',
    schemas: ['saas', 'platform'],
    dependencies: ['tenant'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: false, // Cross-tenant admin
    ownership: 'platform',
    routePrefix: '/api/saas',
  },

  entitlements: {
    name: 'entitlements',
    description: 'Plan entitlements management',
    tier: 'admin',
    category: 'billing',
    schemas: ['saas'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/entitlements',
  },

  policy: {
    name: 'policy',
    description: 'Route/nav policy management',
    tier: 'admin',
    category: 'configuration',
    schemas: ['saas'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/policy',
  },

  'feature-flags': {
    name: 'feature-flags',
    description: 'Feature flag evaluation',
    tier: 'admin',
    category: 'configuration',
    schemas: ['saas'],
    dependencies: ['tenant'],
    registrationType: 'plugin',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/features',
  },

  license: {
    name: 'license',
    description: 'License/entitlement checks',
    tier: 'admin',
    category: 'billing',
    schemas: ['saas'],
    dependencies: ['tenant', 'entitlements'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
  },

  'seat-limits': {
    name: 'seat-limits',
    description: 'Seat limit evaluation',
    tier: 'admin',
    category: 'billing',
    schemas: ['saas'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
  },

  // ===========================================================================
  // PLATFORM - CONFIGURATION TIER
  // ===========================================================================

  configuration: {
    name: 'configuration',
    description: 'System configuration',
    tier: 'admin',
    category: 'configuration',
    schemas: ['platform'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/configuration',
  },

  settings: {
    name: 'settings',
    description: 'Tenant settings',
    tier: 'admin',
    category: 'configuration',
    schemas: ['platform'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/settings',
  },

  menu: {
    name: 'menu',
    description: 'Menu/navigation structure',
    tier: 'admin',
    category: 'configuration',
    schemas: ['saas'],
    dependencies: ['tenant', 'policy'],
    registrationType: 'plugin',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/nav',
  },

  translations: {
    name: 'translations',
    description: 'Database-driven translations',
    tier: 'admin',
    category: 'configuration',
    schemas: ['platform'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/i18n',
  },

  // ===========================================================================
  // PLATFORM - MESSAGING & NOTIFICATIONS
  // ===========================================================================

  notifications: {
    name: 'notifications',
    description: 'Push/in-app notifications',
    tier: 'infrastructure',
    category: 'messaging',
    schemas: ['platform'],
    dependencies: ['tenant', 'user'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/notifications',
  },

  'notification-system': {
    name: 'notification-system',
    description: 'Multi-channel notification system',
    tier: 'infrastructure',
    category: 'messaging',
    schemas: ['platform'],
    dependencies: ['tenant', 'user', 'notifications'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/notification-system',
  },

  'push-notifications': {
    name: 'push-notifications',
    description: 'Push notification delivery',
    tier: 'infrastructure',
    category: 'messaging',
    schemas: ['platform'],
    dependencies: ['notifications'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
  },

  conversations: {
    name: 'conversations',
    description: 'Messaging conversations',
    tier: 'feature',
    category: 'messaging',
    schemas: ['domain'],
    dependencies: ['tenant', 'user'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/conversations',
  },

  messages: {
    name: 'messages',
    description: 'Message CRUD',
    tier: 'feature',
    category: 'messaging',
    schemas: ['domain'],
    dependencies: ['conversations'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/messages',
  },

  // ===========================================================================
  // PLATFORM - INTEGRATIONS & STORAGE
  // ===========================================================================

  integrations: {
    name: 'integrations',
    description: 'External service integrations (RCO, Visma, Vipps, etc.)',
    tier: 'infrastructure',
    category: 'integration',
    schemas: ['platform'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/integrations',
  },

  storage: {
    name: 'storage',
    description: 'File/image storage',
    tier: 'infrastructure',
    category: 'integration',
    schemas: [],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/storage',
  },

  webhooks: {
    name: 'webhooks',
    description: 'Outbound webhooks',
    tier: 'infrastructure',
    category: 'integration',
    schemas: ['platform'],
    dependencies: ['tenant'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/webhooks',
  },

  metadata: {
    name: 'metadata',
    description: 'Metadata management (categories, time modes)',
    tier: 'infrastructure',
    category: 'configuration',
    schemas: ['platform'],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: false,
    ownership: 'platform',
    routePrefix: '/api/metadata',
  },

  // ===========================================================================
  // PLATFORM - RBAC & PERMISSIONS
  // ===========================================================================

  'permission-assignment': {
    name: 'permission-assignment',
    description: 'Role/permission assignment',
    tier: 'core',
    category: 'auth',
    schemas: ['platform'],
    dependencies: ['tenant', 'user', 'organizations'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/permissions',
  },

  capability: {
    name: 'capability',
    description: 'Capability/permission queries',
    tier: 'core',
    category: 'auth',
    schemas: ['platform'],
    dependencies: ['auth', 'permission-assignment'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/capabilities',
  },

  'case-handler-scope': {
    name: 'case-handler-scope',
    description: 'Case handler scope management',
    tier: 'core',
    category: 'auth',
    schemas: ['platform'],
    dependencies: ['auth', 'organizations'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/case-handler-scopes',
  },

  'access-grant': {
    name: 'access-grant',
    description: 'Access/delegation management',
    tier: 'core',
    category: 'auth',
    schemas: ['platform'],
    dependencies: ['user', 'organizations'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/access-grants',
  },

  custody: {
    name: 'custody',
    description: 'Custody/parental consent verification',
    tier: 'core',
    category: 'gdpr',
    schemas: ['compliance', 'platform'],
    dependencies: ['user'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'platform',
    routePrefix: '/api/custody',
  },

  // ===========================================================================
  // DOMAIN - BOOKING DOMAIN
  // ===========================================================================

  booking: {
    name: 'booking',
    description: 'Booking CRUD and state management',
    tier: 'domain',
    category: 'booking',
    schemas: ['domain'],
    dependencies: ['tenant', 'user', 'rental-objects'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/bookings',
  },

  bookings: {
    name: 'bookings',
    description: 'Booking contracts (payment/refund)',
    tier: 'domain',
    category: 'booking',
    schemas: ['domain'],
    dependencies: ['booking'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/bookings',
    notes: 'Handles booking contracts, separate from booking CRUD',
  },

  availability: {
    name: 'availability',
    description: 'Availability queries',
    tier: 'domain',
    category: 'booking',
    schemas: ['domain'],
    dependencies: ['rental-objects', 'booking'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/availability',
  },

  calendar: {
    name: 'calendar',
    description: 'Calendar and scheduling',
    tier: 'domain',
    category: 'calendar',
    schemas: ['domain'],
    dependencies: ['booking', 'rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/calendar',
  },

  blocks: {
    name: 'blocks',
    description: 'Calendar blocks',
    tier: 'domain',
    category: 'calendar',
    schemas: ['domain'],
    dependencies: ['calendar', 'rental-objects'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/blocks',
  },

  allocations: {
    name: 'allocations',
    description: 'Resource allocations',
    tier: 'domain',
    category: 'calendar',
    schemas: ['domain'],
    dependencies: ['rental-objects', 'seasons'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/allocations',
  },

  // ===========================================================================
  // DOMAIN - RENTAL OBJECTS
  // ===========================================================================

  'rental-objects': {
    name: 'rental-objects',
    description: 'Rental object management',
    tier: 'domain',
    category: 'rental-object',
    schemas: ['domain'],
    dependencies: ['tenant', 'organizations'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/rental-objects',
  },

  'rental-object-details': {
    name: 'rental-object-details',
    description: 'Rental object detail projections',
    tier: 'domain',
    category: 'rental-object',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
  },

  amenities: {
    name: 'amenities',
    description: 'Amenity management',
    tier: 'feature',
    category: 'rental-object',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'plugin',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/amenities',
  },

  addons: {
    name: 'addons',
    description: 'Add-ons/extras management',
    tier: 'feature',
    category: 'rental-object',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'plugin',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/addons',
  },

  reviews: {
    name: 'reviews',
    description: 'Review system',
    tier: 'feature',
    category: 'rental-object',
    schemas: ['domain'],
    dependencies: ['rental-objects', 'booking', 'user'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/reviews',
  },

  favorites: {
    name: 'favorites',
    description: 'Favorites/wishlist',
    tier: 'feature',
    category: 'rental-object',
    schemas: ['domain'],
    dependencies: ['rental-objects', 'user'],
    registrationType: 'plugin',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/favorites',
  },

  // ===========================================================================
  // DOMAIN - SEASONAL
  // ===========================================================================

  seasons: {
    name: 'seasons',
    description: 'Season management, allocation proposals, conflict detection',
    tier: 'domain',
    category: 'season',
    schemas: ['domain'],
    dependencies: ['tenant', 'rental-objects'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/seasons',
  },

  'seasonal-lease': {
    name: 'seasonal-lease',
    description: 'Seasonal leases',
    tier: 'domain',
    category: 'season',
    schemas: ['domain'],
    dependencies: ['seasons', 'rental-objects'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/seasonal-leases',
  },

  'season-applications': {
    name: 'season-applications',
    description: 'Season application submissions',
    tier: 'domain',
    category: 'season',
    schemas: ['domain'],
    dependencies: ['seasons', 'user'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/season-applications',
  },

  // ===========================================================================
  // DOMAIN - PRICING & BILLING
  // ===========================================================================

  pricing: {
    name: 'pricing',
    description: 'Pricing rules and plans',
    tier: 'domain',
    category: 'pricing',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/pricing',
  },

  billing: {
    name: 'billing',
    description: 'User/org billing endpoints',
    tier: 'domain',
    category: 'billing',
    schemas: ['domain'],
    dependencies: ['user', 'organizations', 'booking'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/billing',
  },

  'discount-codes': {
    name: 'discount-codes',
    description: 'Discount code validation',
    tier: 'domain',
    category: 'pricing',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/discount-codes',
  },

  // ===========================================================================
  // DOMAIN - SEARCH & DISCOVERY
  // ===========================================================================

  search: {
    name: 'search',
    description: 'Search and filtering',
    tier: 'feature',
    category: 'utility',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/search',
  },

  // ===========================================================================
  // DOMAIN - PORTAL SPECIFIC
  // ===========================================================================

  backoffice: {
    name: 'backoffice',
    description: 'Backoffice admin features',
    tier: 'portal',
    category: 'admin',
    schemas: ['domain', 'platform'],
    dependencies: ['tenant', 'organizations'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/backoffice',
  },

  minside: {
    name: 'minside',
    description: 'User portal (minside) specific',
    tier: 'portal',
    category: 'portal',
    schemas: ['domain', 'platform'],
    dependencies: ['user', 'booking'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/minside',
  },

  dashboard: {
    name: 'dashboard',
    description: 'Dashboard aggregation',
    tier: 'portal',
    category: 'portal',
    schemas: ['domain'],
    dependencies: ['booking', 'rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/dashboard',
  },

  profile: {
    name: 'profile',
    description: 'User profile endpoints',
    tier: 'portal',
    category: 'user',
    schemas: ['platform'],
    dependencies: ['user'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/profile',
  },

  reports: {
    name: 'reports',
    description: 'Analytics and reporting',
    tier: 'portal',
    category: 'admin',
    schemas: ['domain', 'compliance'],
    dependencies: ['booking', 'rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/reports',
  },

  widgets: {
    name: 'widgets',
    description: 'Widget/component endpoints',
    tier: 'portal',
    category: 'portal',
    schemas: [],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/widgets',
  },

  // ===========================================================================
  // DOMAIN - USER MANAGEMENT
  // ===========================================================================

  'user-management': {
    name: 'user-management',
    description: 'Tenant admin user management',
    tier: 'admin',
    category: 'user',
    schemas: ['platform'],
    dependencies: ['tenant', 'user', 'organizations'],
    registrationType: 'module',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/user-management',
  },

  'user-groups': {
    name: 'user-groups',
    description: 'User group management',
    tier: 'admin',
    category: 'user',
    schemas: ['platform'],
    dependencies: ['user', 'organizations'],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/user-groups',
  },

  // ===========================================================================
  // SHARED - BULK & MISC
  // ===========================================================================

  bulk: {
    name: 'bulk',
    description: 'Bulk operations',
    tier: 'utility',
    category: 'utility',
    schemas: ['domain'],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: true,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/bulk',
  },

  share: {
    name: 'share',
    description: 'Sharing features',
    tier: 'feature',
    category: 'utility',
    schemas: ['domain'],
    dependencies: ['rental-objects'],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'domain',
    routePrefix: '/api/share',
  },

  help: {
    name: 'help',
    description: 'Help/support',
    tier: 'portal',
    category: 'portal',
    schemas: [],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: true,
    ownership: 'shared',
    routePrefix: '/api/help',
  },

  domain: {
    name: 'domain',
    description: 'Type definitions and utilities',
    tier: 'utility',
    category: 'utility',
    schemas: [],
    dependencies: [],
    registrationType: 'controller',
    isAuditAware: false,
    isMultiTenantAware: false,
    ownership: 'shared',
    notes: 'Contains only type definitions, no runtime code',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all modules by ownership
 */
export function getModulesByOwnership(ownership: 'platform' | 'domain' | 'shared'): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.ownership === ownership);
}

/**
 * Get all modules by tier
 */
export function getModulesByTier(tier: ModuleTier): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.tier === tier);
}

/**
 * Get all modules by category
 */
export function getModulesByCategory(category: ModuleCategory): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.category === category);
}

/**
 * Get all modules that use a specific schema
 */
export function getModulesBySchema(schema: DatabaseSchema): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.schemas.includes(schema));
}

/**
 * Get all platform modules (for extraction)
 */
export function getPlatformModules(): ModuleMetadata[] {
  return getModulesByOwnership('platform');
}

/**
 * Get all domain modules (Digilist-specific)
 */
export function getDomainModules(): ModuleMetadata[] {
  return getModulesByOwnership('domain');
}

/**
 * Get module dependencies (recursive)
 */
export function getModuleDependencies(
  moduleName: string,
  visited: Set<string> = new Set()
): string[] {
  if (visited.has(moduleName)) return [];
  visited.add(moduleName);

  const module = MODULE_REGISTRY[moduleName];
  if (!module) return [];

  const deps: string[] = [...module.dependencies];
  for (const dep of module.dependencies) {
    deps.push(...getModuleDependencies(dep, visited));
  }

  return [...new Set(deps)];
}

/**
 * Verify all modules are classified
 */
export function getUnclassifiedModules(knownModules: string[]): string[] {
  const registeredModules = Object.keys(MODULE_REGISTRY);
  return knownModules.filter((m) => !registeredModules.includes(m));
}

// =============================================================================
// STATISTICS
// =============================================================================

export function getRegistryStatistics() {
  const modules = Object.values(MODULE_REGISTRY);

  return {
    total: modules.length,
    byOwnership: {
      platform: modules.filter((m) => m.ownership === 'platform').length,
      domain: modules.filter((m) => m.ownership === 'domain').length,
      shared: modules.filter((m) => m.ownership === 'shared').length,
    },
    byTier: {
      infrastructure: modules.filter((m) => m.tier === 'infrastructure').length,
      core: modules.filter((m) => m.tier === 'core').length,
      domain: modules.filter((m) => m.tier === 'domain').length,
      feature: modules.filter((m) => m.tier === 'feature').length,
      admin: modules.filter((m) => m.tier === 'admin').length,
      portal: modules.filter((m) => m.tier === 'portal').length,
      utility: modules.filter((m) => m.tier === 'utility').length,
    },
    byRegistrationType: {
      module: modules.filter((m) => m.registrationType === 'module').length,
      controller: modules.filter((m) => m.registrationType === 'controller').length,
      plugin: modules.filter((m) => m.registrationType === 'plugin').length,
      route: modules.filter((m) => m.registrationType === 'route').length,
    },
    auditAware: modules.filter((m) => m.isAuditAware).length,
    multiTenantAware: modules.filter((m) => m.isMultiTenantAware).length,
  };
}
