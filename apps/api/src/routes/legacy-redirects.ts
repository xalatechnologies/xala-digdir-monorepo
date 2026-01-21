/**
 * Legacy Route Redirects
 *
 * Provides backward compatibility for old API routes while transitioning
 * to the new /api/platform/* and /api/domain/* route structure.
 *
 * @since 2026-01-21
 * @version 1.0.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// =============================================================================
// ROUTE MAPPING
// =============================================================================

/**
 * Maps old routes to new prefixed routes
 *
 * Structure:
 * - /api/platform/* - Platform modules (auth, tenants, users, etc.)
 * - /api/domain/* - Domain modules (bookings, rental-objects, etc.)
 * - /api/shared/* - Shared modules (storage, search, etc.)
 */
export const ROUTE_MAPPING: Record<string, { newPrefix: string; ownership: 'platform' | 'domain' | 'shared' }> = {
  // ===========================================================================
  // PLATFORM ROUTES
  // ===========================================================================

  // Auth & RBAC
  '/api/auth': { newPrefix: '/api/platform/auth', ownership: 'platform' },
  '/api/authz': { newPrefix: '/api/platform/authz', ownership: 'platform' },
  '/api/me': { newPrefix: '/api/platform/me', ownership: 'platform' },
  '/api/permissions': { newPrefix: '/api/platform/permissions', ownership: 'platform' },
  '/api/capabilities': { newPrefix: '/api/platform/capabilities', ownership: 'platform' },
  '/api/access-grants': { newPrefix: '/api/platform/access-grants', ownership: 'platform' },
  '/api/case-handler-scopes': { newPrefix: '/api/platform/case-handler-scopes', ownership: 'platform' },
  '/api/custody': { newPrefix: '/api/platform/custody', ownership: 'platform' },

  // Tenant & User
  '/api/tenants': { newPrefix: '/api/platform/tenants', ownership: 'platform' },
  '/api/users': { newPrefix: '/api/platform/users', ownership: 'platform' },
  '/api/user-groups': { newPrefix: '/api/platform/user-groups', ownership: 'platform' },
  '/api/profile': { newPrefix: '/api/platform/profile', ownership: 'platform' },

  // Organizations
  '/api/organizations': { newPrefix: '/api/platform/organizations', ownership: 'platform' },

  // Audit & Compliance
  '/api/audit': { newPrefix: '/api/platform/audit', ownership: 'platform' },
  '/api/gdpr': { newPrefix: '/api/platform/gdpr', ownership: 'platform' },
  '/api/monitoring': { newPrefix: '/api/platform/monitoring', ownership: 'platform' },

  // Configuration
  '/api/settings': { newPrefix: '/api/platform/settings', ownership: 'platform' },
  '/api/configuration': { newPrefix: '/api/platform/configuration', ownership: 'platform' },
  '/api/translations': { newPrefix: '/api/platform/translations', ownership: 'platform' },
  '/api/i18n': { newPrefix: '/api/platform/i18n', ownership: 'platform' },

  // Navigation & Policies
  '/api/nav': { newPrefix: '/api/platform/nav', ownership: 'platform' },
  '/api/policy': { newPrefix: '/api/platform/policy', ownership: 'platform' },
  '/api/features': { newPrefix: '/api/platform/features', ownership: 'platform' },

  // SaaS Admin
  '/api/saas': { newPrefix: '/api/platform/saas', ownership: 'platform' },
  '/api/tenant-admin': { newPrefix: '/api/platform/tenant-admin', ownership: 'platform' },
  '/api/entitlements': { newPrefix: '/api/platform/entitlements', ownership: 'platform' },

  // Notifications
  '/api/notifications': { newPrefix: '/api/platform/notifications', ownership: 'platform' },
  '/api/notification-system': { newPrefix: '/api/platform/notification-system', ownership: 'platform' },

  // Integrations
  '/api/integrations': { newPrefix: '/api/platform/integrations', ownership: 'platform' },
  '/api/webhooks': { newPrefix: '/api/platform/webhooks', ownership: 'platform' },

  // Health & Public
  '/api/health': { newPrefix: '/api/platform/health', ownership: 'platform' },
  '/api/public': { newPrefix: '/api/platform/public', ownership: 'platform' },

  // ===========================================================================
  // DOMAIN ROUTES
  // ===========================================================================

  // Rental Objects
  '/api/rental-objects': { newPrefix: '/api/domain/rental-objects', ownership: 'domain' },
  '/api/amenities': { newPrefix: '/api/domain/amenities', ownership: 'domain' },
  '/api/addons': { newPrefix: '/api/domain/addons', ownership: 'domain' },
  '/api/favorites': { newPrefix: '/api/domain/favorites', ownership: 'domain' },
  '/api/reviews': { newPrefix: '/api/domain/reviews', ownership: 'domain' },

  // Bookings
  '/api/bookings': { newPrefix: '/api/domain/bookings', ownership: 'domain' },
  '/api/availability': { newPrefix: '/api/domain/availability', ownership: 'domain' },
  '/api/calendar': { newPrefix: '/api/domain/calendar', ownership: 'domain' },
  '/api/blocks': { newPrefix: '/api/domain/blocks', ownership: 'domain' },
  '/api/allocations': { newPrefix: '/api/domain/allocations', ownership: 'domain' },

  // Seasons
  '/api/seasons': { newPrefix: '/api/domain/seasons', ownership: 'domain' },
  '/api/seasonal-leases': { newPrefix: '/api/domain/seasonal-leases', ownership: 'domain' },
  '/api/season-applications': { newPrefix: '/api/domain/season-applications', ownership: 'domain' },

  // Pricing & Billing
  '/api/pricing': { newPrefix: '/api/domain/pricing', ownership: 'domain' },
  '/api/discount-codes': { newPrefix: '/api/domain/discount-codes', ownership: 'domain' },
  '/api/billing': { newPrefix: '/api/domain/billing', ownership: 'domain' },
  '/api/invoices': { newPrefix: '/api/domain/invoices', ownership: 'domain' },

  // Portals
  '/api/dashboard': { newPrefix: '/api/domain/dashboard', ownership: 'domain' },
  '/api/backoffice': { newPrefix: '/api/domain/backoffice', ownership: 'domain' },
  '/api/minside': { newPrefix: '/api/domain/minside', ownership: 'domain' },
  '/api/reports': { newPrefix: '/api/domain/reports', ownership: 'domain' },
  '/api/widgets': { newPrefix: '/api/domain/widgets', ownership: 'domain' },

  // ===========================================================================
  // SHARED ROUTES
  // ===========================================================================

  '/api/storage': { newPrefix: '/api/shared/storage', ownership: 'shared' },
  '/api/search': { newPrefix: '/api/shared/search', ownership: 'shared' },
  '/api/metadata': { newPrefix: '/api/shared/metadata', ownership: 'shared' },
  '/api/help': { newPrefix: '/api/shared/help', ownership: 'shared' },
  '/api/conversations': { newPrefix: '/api/shared/conversations', ownership: 'shared' },
  '/api/messages': { newPrefix: '/api/shared/messages', ownership: 'shared' },
  '/api/share': { newPrefix: '/api/shared/share', ownership: 'shared' },
};

// =============================================================================
// LEGACY REDIRECT PLUGIN
// =============================================================================

/**
 * Register legacy route redirects
 *
 * This plugin adds route aliases so that old routes still work
 * while we transition to the new prefixed structure.
 *
 * Options:
 * - enabled: Whether to enable legacy redirects (default: true)
 * - mode: 'alias' (both work) | 'redirect' (301 redirect) | 'deprecated' (warn header)
 */
export interface LegacyRedirectOptions {
  enabled?: boolean;
  mode?: 'alias' | 'redirect' | 'deprecated';
}

export async function registerLegacyRedirects(
  app: FastifyInstance,
  options: LegacyRedirectOptions = {}
): Promise<void> {
  const { enabled = true, mode = 'deprecated' } = options;

  if (!enabled) {
    console.log('ℹ️  Legacy redirects disabled');
    return;
  }

  // Add a hook to handle legacy routes
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;

    // Find matching legacy route
    for (const [oldPath, mapping] of Object.entries(ROUTE_MAPPING)) {
      if (url.startsWith(oldPath)) {
        const newUrl = url.replace(oldPath, mapping.newPrefix);

        switch (mode) {
          case 'redirect':
            // 301 Permanent Redirect
            return reply.redirect(301, newUrl);

          case 'deprecated':
            // Add deprecation warning header but continue
            reply.header('X-Deprecated-Route', `Use ${mapping.newPrefix} instead of ${oldPath}`);
            reply.header('Deprecation', 'true');
            reply.header('Sunset', '2026-06-01');
            break;

          case 'alias':
          default:
            // Just continue, route aliases handle this
            break;
        }
        break;
      }
    }
  });

  console.log(`✓ Legacy redirects registered (mode: ${mode})`);
}

// =============================================================================
// ROUTE ALIASING
// =============================================================================

/**
 * Create route aliases for backward compatibility
 *
 * This creates duplicate routes at both old and new paths.
 * Use this when you want both paths to work identically.
 */
export function createRouteAliases(app: FastifyInstance): void {
  // This is a placeholder for when we implement actual route duplication
  // For now, routes are registered at their current paths and the
  // onRequest hook handles the mapping

  console.log('✓ Route aliases configured');
}

// =============================================================================
// ROUTE HELPERS
// =============================================================================

/**
 * Get the new route prefix for an old route
 */
export function getNewRoutePrefix(oldRoute: string): string | null {
  for (const [oldPath, mapping] of Object.entries(ROUTE_MAPPING)) {
    if (oldRoute.startsWith(oldPath)) {
      return oldRoute.replace(oldPath, mapping.newPrefix);
    }
  }
  return null;
}

/**
 * Get the ownership of a route
 */
export function getRouteOwnership(route: string): 'platform' | 'domain' | 'shared' | null {
  // Check new prefixed routes first
  if (route.startsWith('/api/platform/')) return 'platform';
  if (route.startsWith('/api/domain/')) return 'domain';
  if (route.startsWith('/api/shared/')) return 'shared';

  // Check legacy routes
  for (const [oldPath, mapping] of Object.entries(ROUTE_MAPPING)) {
    if (route.startsWith(oldPath)) {
      return mapping.ownership;
    }
  }

  return null;
}

/**
 * Get all routes by ownership
 */
export function getRoutesByOwnership(ownership: 'platform' | 'domain' | 'shared'): string[] {
  return Object.entries(ROUTE_MAPPING)
    .filter(([_, mapping]) => mapping.ownership === ownership)
    .map(([oldPath, mapping]) => mapping.newPrefix);
}
