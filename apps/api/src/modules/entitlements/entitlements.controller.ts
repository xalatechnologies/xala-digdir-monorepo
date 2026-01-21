/**
 * Entitlements Controller
 * Handles navigation and entitlement-based access control
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

export interface NavItem {
  key: string;
  labelKey: string;
  routeKey: string;
  iconKey: string;
  parentKey?: string;
  section?: string;
  contexts?: string[];
  order: number;
}

export interface Entitlement {
  feature: string;
  enabled: boolean;
  permissions: string[];
}

export interface NavResponse {
  app: string;
  items: NavItem[];
}

export interface EntitlementsResponse {
  entitlements: Entitlement[];
  role: string;
  tenantId?: string;
}

/**
 * Default navigation items for backoffice
 */
const BACKOFFICE_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', routeKey: '/dashboard', iconKey: 'home', order: 1 },
  { key: 'calendar', labelKey: 'nav.calendar', routeKey: '/calendar', iconKey: 'calendar', order: 2 },
  { key: 'bookings', labelKey: 'nav.bookings', routeKey: '/bookings', iconKey: 'booking', order: 3 },
  { key: 'rental-objects', labelKey: 'nav.rentalObjects', routeKey: '/rental-objects', iconKey: 'building', order: 4 },
  { key: 'seasons', labelKey: 'nav.seasons', routeKey: '/seasons', iconKey: 'sun', section: 'seasons', order: 5 },
  { key: 'reports', labelKey: 'nav.reports', routeKey: '/reports', iconKey: 'chart', order: 6 },
  { key: 'settings', labelKey: 'nav.settings', routeKey: '/settings', iconKey: 'settings', order: 99 },
];

/**
 * Default navigation items for minside
 */
const MINSIDE_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', routeKey: '/dashboard', iconKey: 'home', order: 1 },
  { key: 'bookings', labelKey: 'nav.myBookings', routeKey: '/bookings', iconKey: 'booking', order: 2 },
  { key: 'favorites', labelKey: 'nav.favorites', routeKey: '/favorites', iconKey: 'star', order: 3 },
  { key: 'messages', labelKey: 'nav.messages', routeKey: '/messages', iconKey: 'message', order: 4 },
  { key: 'settings', labelKey: 'nav.settings', routeKey: '/settings', iconKey: 'settings', order: 99 },
];

/**
 * Default navigation items for web
 */
const WEB_NAV_ITEMS: NavItem[] = [
  { key: 'home', labelKey: 'nav.home', routeKey: '/', iconKey: 'home', order: 1 },
  { key: 'search', labelKey: 'nav.search', routeKey: '/search', iconKey: 'search', order: 2 },
  { key: 'help', labelKey: 'nav.help', routeKey: '/help', iconKey: 'help', order: 99 },
];

export class EntitlementsController {
  /**
   * Get navigation items for an app
   */
  async getNavItems(
    request: FastifyRequest<{ Params: { app: string } }>,
    reply: FastifyReply
  ): Promise<NavResponse> {
    const { app } = request.params;

    let items: NavItem[];
    switch (app) {
      case 'backoffice':
        items = BACKOFFICE_NAV_ITEMS;
        break;
      case 'minside':
        items = MINSIDE_NAV_ITEMS;
        break;
      case 'web':
        items = WEB_NAV_ITEMS;
        break;
      default:
        items = [];
    }

    // In production, filter items based on user entitlements
    // const user = request.user;
    // items = items.filter(item => userHasEntitlement(user, item.key));

    return {
      app,
      items,
    };
  }

  /**
   * Get entitlements for the current user
   */
  async getMyEntitlements(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<EntitlementsResponse> {
    // In production, fetch user entitlements from database
    // const user = request.user;
    // const entitlements = await fetchUserEntitlements(user.id);

    // Default entitlements for now
    const entitlements: Entitlement[] = [
      { feature: 'bookings', enabled: true, permissions: ['read', 'create'] },
      { feature: 'calendar', enabled: true, permissions: ['read'] },
      { feature: 'dashboard', enabled: true, permissions: ['read'] },
    ];

    return {
      entitlements,
      role: 'user',
      tenantId: undefined,
    };
  }
}
