/**
 * API Router
 * Routes requests to appropriate API (Platform vs Domain)
 *
 * Platform API (port 4001): Authentication, users, tenants, organizations, RBAC, audit, GDPR, notifications, integrations, SaaS
 * Domain API (port 4000): Rental objects, bookings, calendar, seasons, reviews, pricing, etc.
 */

/**
 * API endpoint type
 */
export type ApiType = 'platform' | 'domain';

/**
 * Platform API path prefixes - these routes go to the Platform API
 */
const PLATFORM_PATHS = [
  // Authentication & Authorization
  '/api/auth',
  '/api/idporten',
  '/api/vipps/auth',
  '/api/sessions',
  '/api/authz',

  // User & Tenant Management
  '/api/users',
  '/api/me',
  '/api/tenants',
  '/api/tenant',
  '/api/tenant-admin',

  // Organization Management (platform-level)
  '/api/organizations',

  // Permissions & Access Control
  '/api/permissions',
  '/api/permission-assignments',
  '/api/access-grants',
  '/api/scope-assignments',
  '/api/capabilities',
  '/api/roles',

  // Audit & Compliance
  '/api/audit',
  '/api/gdpr',
  '/api/compliance',

  // Notifications & Communication
  '/api/notifications',
  '/api/push-notifications',
  '/api/notification-system',

  // Settings & Configuration
  '/api/settings',
  '/api/modules',
  '/api/feature-flags',
  '/api/menu',
  '/api/navigation',

  // Monitoring & Security
  '/api/monitoring',
  '/api/security',
  '/api/health',

  // Billing & SaaS
  '/api/billing',
  '/api/saas',
  '/api/plans',
  '/api/entitlements',
  '/api/subscriptions',
  '/api/license',

  // Storage & Infrastructure
  '/api/storage',
  '/api/webhooks',
  '/api/translations',

  // Integrations (platform-level)
  '/api/integrations',
  '/api/integration-credentials',
  '/api/brreg',
  '/api/nif',
  '/api/visma',
  '/api/rco',
  '/api/vipps/payment',

  // Scanners
  '/api/scanners',

  // Policy
  '/api/policy',
  '/api/route-policies',
  '/api/nav-policies',
] as const;

/**
 * Domain API path prefixes - these routes go to the Domain API
 * (Everything else, but explicitly listed for clarity)
 */
const DOMAIN_PATHS = [
  // Rental Objects & Resources
  '/api/rental-objects',
  '/api/categories',
  '/api/amenities',
  '/api/addons',
  '/api/favorites',

  // Booking & Calendar
  '/api/bookings',
  '/api/booking',
  '/api/calendar',
  '/api/availability',
  '/api/blocks',
  '/api/allocations',

  // Seasons & Leases
  '/api/seasons',
  '/api/season-applications',
  '/api/seasonal-lease',

  // Custody (domain-specific)
  '/api/custody',

  // Search & Discovery
  '/api/search',
  '/api/public',

  // Reviews & Ratings
  '/api/reviews',

  // Pricing & Economy
  '/api/pricing',
  '/api/discount-codes',
  '/api/economy',
  '/api/price-rules',

  // Conversations & Messages (domain context)
  '/api/conversations',
  '/api/messages',

  // Dashboard & Reports
  '/api/dashboard',
  '/api/reports',

  // Backoffice Domain
  '/api/backoffice',

  // Profile (user profile in domain context)
  '/api/profile',

  // Help, Share, Widgets
  '/api/help',
  '/api/share',
  '/api/widgets',

  // Metadata
  '/api/metadata',

  // Minside
  '/api/minside',

  // Bulk operations
  '/api/bulk',

  // Activities
  '/api/activities',

  // Templates
  '/api/templates',

  // AI Seed
  '/api/ai-seed',

  // Case Handler (domain-specific delegation)
  '/api/case-handler-scope',
] as const;

/**
 * Determine which API should handle a request based on path
 *
 * @param path - The API path (e.g., '/api/bookings', '/api/auth/login')
 * @returns 'platform' or 'domain'
 */
export function getApiTypeForPath(path: string): ApiType {
  // Normalize path
  const normalizedPath = path.toLowerCase();

  // Check platform paths first (more specific matching)
  for (const platformPath of PLATFORM_PATHS) {
    if (normalizedPath.startsWith(platformPath.toLowerCase())) {
      return 'platform';
    }
  }

  // Default to domain API for any path not explicitly platform
  // This ensures new domain features work without updating the router
  return 'domain';
}

/**
 * Get the base URL for a specific API type
 *
 * @param apiType - 'platform' or 'domain'
 * @param config - Configuration containing both URLs
 * @returns The base URL for the specified API type
 */
export function getBaseUrlForApiType(
  apiType: ApiType,
  config: { baseUrl: string; platformApiUrl?: string }
): string {
  if (apiType === 'platform') {
    // Use platformApiUrl if available, otherwise fall back to baseUrl
    // This allows single-API setups to still work
    return config.platformApiUrl || config.baseUrl;
  }
  return config.baseUrl;
}

/**
 * Route a request to the appropriate API
 *
 * @param path - The API path
 * @param config - Configuration containing both URLs
 * @returns The full URL with the correct base
 */
export function routeRequest(
  path: string,
  config: { baseUrl: string; platformApiUrl?: string }
): { baseUrl: string; apiType: ApiType } {
  const apiType = getApiTypeForPath(path);
  const baseUrl = getBaseUrlForApiType(apiType, config);
  return { baseUrl, apiType };
}

/**
 * Check if a path should go to the platform API
 */
export function isPlatformPath(path: string): boolean {
  return getApiTypeForPath(path) === 'platform';
}

/**
 * Check if a path should go to the domain API
 */
export function isDomainPath(path: string): boolean {
  return getApiTypeForPath(path) === 'domain';
}

/**
 * Get all platform paths (for documentation/debugging)
 */
export function getPlatformPaths(): readonly string[] {
  return PLATFORM_PATHS;
}

/**
 * Get all domain paths (for documentation/debugging)
 */
export function getDomainPaths(): readonly string[] {
  return DOMAIN_PATHS;
}
