/**
 * Routes Index
 *
 * Central export point for all route configuration.
 *
 * @since 2026-01-21
 */

// Route prefix configuration
export {
  ROUTE_PREFIXES,
  PLATFORM_ROUTES,
  DOMAIN_ROUTES,
  SHARED_ROUTES,
  API_ROUTES,
  isPlatformRoute,
  isDomainRoute,
  isSharedRoute,
  getRouteCategory,
  buildRoute,
  getRoutesForCategory,
} from './route-prefixes';

export type { PlatformRoute, DomainRoute, SharedRoute, ApiRoute } from './route-prefixes';

// Legacy redirect support
export {
  ROUTE_MAPPING,
  registerLegacyRedirects,
  createRouteAliases,
  getNewRoutePrefix,
  getRouteOwnership,
  getRoutesByOwnership,
} from './legacy-redirects';

export type { LegacyRedirectOptions } from './legacy-redirects';
