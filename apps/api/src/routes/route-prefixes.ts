/**
 * Route Prefix Configuration
 *
 * Defines the new API route structure with clear ownership:
 * - /api/platform/* - Platform modules (extractable, domain-agnostic)
 * - /api/domain/* - Domain modules (Digilist-specific)
 * - /api/shared/* - Shared modules (used by both)
 *
 * @since 2026-01-21
 * @version 1.0.0
 */

// =============================================================================
// ROUTE PREFIXES
// =============================================================================

export const ROUTE_PREFIXES = {
  PLATFORM: '/api/platform',
  DOMAIN: '/api/domain',
  SHARED: '/api/shared',
  LEGACY: '/api', // Deprecated, use specific prefixes
} as const;

// =============================================================================
// PLATFORM ROUTES
// =============================================================================

/**
 * Platform routes - Domain-agnostic, extractable to @xalatechnologies/platform
 */
export const PLATFORM_ROUTES = {
  // Authentication & Authorization
  AUTH: `${ROUTE_PREFIXES.PLATFORM}/auth`,
  AUTHZ: `${ROUTE_PREFIXES.PLATFORM}/authz`,
  ME: `${ROUTE_PREFIXES.PLATFORM}/me`,
  PERMISSIONS: `${ROUTE_PREFIXES.PLATFORM}/permissions`,
  CAPABILITIES: `${ROUTE_PREFIXES.PLATFORM}/capabilities`,
  ACCESS_GRANTS: `${ROUTE_PREFIXES.PLATFORM}/access-grants`,
  CASE_HANDLER_SCOPES: `${ROUTE_PREFIXES.PLATFORM}/case-handler-scopes`,
  CUSTODY: `${ROUTE_PREFIXES.PLATFORM}/custody`,

  // Tenant & User Management
  TENANTS: `${ROUTE_PREFIXES.PLATFORM}/tenants`,
  USERS: `${ROUTE_PREFIXES.PLATFORM}/users`,
  USER_GROUPS: `${ROUTE_PREFIXES.PLATFORM}/user-groups`,
  PROFILE: `${ROUTE_PREFIXES.PLATFORM}/profile`,
  ORGANIZATIONS: `${ROUTE_PREFIXES.PLATFORM}/organizations`,

  // Audit & Compliance
  AUDIT: `${ROUTE_PREFIXES.PLATFORM}/audit`,
  GDPR: `${ROUTE_PREFIXES.PLATFORM}/gdpr`,
  MONITORING: `${ROUTE_PREFIXES.PLATFORM}/monitoring`,

  // Configuration
  SETTINGS: `${ROUTE_PREFIXES.PLATFORM}/settings`,
  CONFIGURATION: `${ROUTE_PREFIXES.PLATFORM}/configuration`,
  TRANSLATIONS: `${ROUTE_PREFIXES.PLATFORM}/translations`,
  I18N: `${ROUTE_PREFIXES.PLATFORM}/i18n`,

  // Navigation & Policies
  NAV: `${ROUTE_PREFIXES.PLATFORM}/nav`,
  POLICY: `${ROUTE_PREFIXES.PLATFORM}/policy`,
  FEATURES: `${ROUTE_PREFIXES.PLATFORM}/features`,

  // SaaS Admin
  SAAS: `${ROUTE_PREFIXES.PLATFORM}/saas`,
  TENANT_ADMIN: `${ROUTE_PREFIXES.PLATFORM}/tenant-admin`,
  ENTITLEMENTS: `${ROUTE_PREFIXES.PLATFORM}/entitlements`,

  // Notifications
  NOTIFICATIONS: `${ROUTE_PREFIXES.PLATFORM}/notifications`,
  NOTIFICATION_SYSTEM: `${ROUTE_PREFIXES.PLATFORM}/notification-system`,

  // Integrations
  INTEGRATIONS: `${ROUTE_PREFIXES.PLATFORM}/integrations`,
  WEBHOOKS: `${ROUTE_PREFIXES.PLATFORM}/webhooks`,

  // Health & Public
  HEALTH: `${ROUTE_PREFIXES.PLATFORM}/health`,
  PUBLIC: `${ROUTE_PREFIXES.PLATFORM}/public`,
} as const;

// =============================================================================
// DOMAIN ROUTES
// =============================================================================

/**
 * Domain routes - Digilist-specific business logic
 */
export const DOMAIN_ROUTES = {
  // Rental Objects
  RENTAL_OBJECTS: `${ROUTE_PREFIXES.DOMAIN}/rental-objects`,
  AMENITIES: `${ROUTE_PREFIXES.DOMAIN}/amenities`,
  ADDONS: `${ROUTE_PREFIXES.DOMAIN}/addons`,
  FAVORITES: `${ROUTE_PREFIXES.DOMAIN}/favorites`,
  REVIEWS: `${ROUTE_PREFIXES.DOMAIN}/reviews`,

  // Bookings
  BOOKINGS: `${ROUTE_PREFIXES.DOMAIN}/bookings`,
  AVAILABILITY: `${ROUTE_PREFIXES.DOMAIN}/availability`,
  CALENDAR: `${ROUTE_PREFIXES.DOMAIN}/calendar`,
  BLOCKS: `${ROUTE_PREFIXES.DOMAIN}/blocks`,
  ALLOCATIONS: `${ROUTE_PREFIXES.DOMAIN}/allocations`,

  // Seasons
  SEASONS: `${ROUTE_PREFIXES.DOMAIN}/seasons`,
  SEASONAL_LEASES: `${ROUTE_PREFIXES.DOMAIN}/seasonal-leases`,
  SEASON_APPLICATIONS: `${ROUTE_PREFIXES.DOMAIN}/season-applications`,

  // Pricing & Billing
  PRICING: `${ROUTE_PREFIXES.DOMAIN}/pricing`,
  DISCOUNT_CODES: `${ROUTE_PREFIXES.DOMAIN}/discount-codes`,
  BILLING: `${ROUTE_PREFIXES.DOMAIN}/billing`,
  INVOICES: `${ROUTE_PREFIXES.DOMAIN}/invoices`,

  // Portals
  DASHBOARD: `${ROUTE_PREFIXES.DOMAIN}/dashboard`,
  BACKOFFICE: `${ROUTE_PREFIXES.DOMAIN}/backoffice`,
  MINSIDE: `${ROUTE_PREFIXES.DOMAIN}/minside`,
  REPORTS: `${ROUTE_PREFIXES.DOMAIN}/reports`,
  WIDGETS: `${ROUTE_PREFIXES.DOMAIN}/widgets`,
} as const;

// =============================================================================
// SHARED ROUTES
// =============================================================================

/**
 * Shared routes - Used by both platform and domain
 */
export const SHARED_ROUTES = {
  STORAGE: `${ROUTE_PREFIXES.SHARED}/storage`,
  SEARCH: `${ROUTE_PREFIXES.SHARED}/search`,
  METADATA: `${ROUTE_PREFIXES.SHARED}/metadata`,
  HELP: `${ROUTE_PREFIXES.SHARED}/help`,
  CONVERSATIONS: `${ROUTE_PREFIXES.SHARED}/conversations`,
  MESSAGES: `${ROUTE_PREFIXES.SHARED}/messages`,
  SHARE: `${ROUTE_PREFIXES.SHARED}/share`,
} as const;

// =============================================================================
// ALL ROUTES
// =============================================================================

export const API_ROUTES = {
  ...PLATFORM_ROUTES,
  ...DOMAIN_ROUTES,
  ...SHARED_ROUTES,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PlatformRoute = (typeof PLATFORM_ROUTES)[keyof typeof PLATFORM_ROUTES];
export type DomainRoute = (typeof DOMAIN_ROUTES)[keyof typeof DOMAIN_ROUTES];
export type SharedRoute = (typeof SHARED_ROUTES)[keyof typeof SHARED_ROUTES];
export type ApiRoute = PlatformRoute | DomainRoute | SharedRoute;

// =============================================================================
// ROUTE HELPERS
// =============================================================================

/**
 * Check if a route is a platform route
 */
export function isPlatformRoute(route: string): boolean {
  return route.startsWith(ROUTE_PREFIXES.PLATFORM);
}

/**
 * Check if a route is a domain route
 */
export function isDomainRoute(route: string): boolean {
  return route.startsWith(ROUTE_PREFIXES.DOMAIN);
}

/**
 * Check if a route is a shared route
 */
export function isSharedRoute(route: string): boolean {
  return route.startsWith(ROUTE_PREFIXES.SHARED);
}

/**
 * Get the route category
 */
export function getRouteCategory(route: string): 'platform' | 'domain' | 'shared' | 'legacy' {
  if (isPlatformRoute(route)) return 'platform';
  if (isDomainRoute(route)) return 'domain';
  if (isSharedRoute(route)) return 'shared';
  return 'legacy';
}

/**
 * Build a route with parameters
 */
export function buildRoute(base: string, params: Record<string, string | number>): string {
  let route = base;
  for (const [key, value] of Object.entries(params)) {
    route = route.replace(`:${key}`, String(value));
  }
  return route;
}

/**
 * Get all routes for a category
 */
export function getRoutesForCategory(category: 'platform' | 'domain' | 'shared'): string[] {
  switch (category) {
    case 'platform':
      return Object.values(PLATFORM_ROUTES);
    case 'domain':
      return Object.values(DOMAIN_ROUTES);
    case 'shared':
      return Object.values(SHARED_ROUTES);
  }
}
