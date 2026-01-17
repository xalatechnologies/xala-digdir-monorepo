/**
 * Domain Navigation Hooks
 * React Query hooks for domain module navigation
 *
 * Provides navigation items derived from domain module manifests,
 * filtered by module enablement and capabilities.
 */

import { useMemo } from 'react';
import { useCapabilities, useEnabledModules } from './use-modules';
import type { NavItem, FilteredNavItem } from './use-navigation';
import { filterNavItemsByCapabilities, annotateNavItems } from './use-navigation';

// =============================================================================
// Types
// =============================================================================

/**
 * Domain navigation contribution from module manifest
 */
export interface DomainNavItem {
  id: string;
  label: { en: string; nb: string };
  href: string;
  icon?: string;
  order?: number;
  requiredCapability?: string;
  children?: DomainNavItem[];
}

/**
 * Navigation source type
 */
export type NavSource = 'web' | 'backoffice' | 'minside';

/**
 * Combined navigation with source tracking
 */
export interface CombinedNavItem extends NavItem {
  source: 'static' | 'domain';
  moduleId?: string;
  order: number;
}

// =============================================================================
// Static Navigation (Platform Core)
// =============================================================================

/**
 * Platform core navigation items (always available)
 */
export const PLATFORM_NAV: Record<NavSource, NavItem[]> = {
  web: [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'help', label: 'Help', href: '/help' },
  ],
  backoffice: [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'users', label: 'Users', href: '/users' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ],
  minside: [
    { id: 'profile', label: 'My Profile', href: '/profile' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ],
};

// =============================================================================
// Domain Navigation Contributions
// =============================================================================

/**
 * BOOKING_RENTALS domain navigation items
 * In a full implementation, these would come from the API
 */
const BOOKING_RENTALS_NAV: Record<NavSource, DomainNavItem[]> = {
  web: [
    { id: 'browse', label: { en: 'Browse', nb: 'Utforsk' }, href: '/search', icon: 'search', order: 1 },
    { id: 'categories', label: { en: 'Categories', nb: 'Kategorier' }, href: '/categories', icon: 'grid', order: 2 },
  ],
  backoffice: [
    { id: 'rental-objects', label: { en: 'Rental Objects', nb: 'Utleieobjekter' }, href: '/rental-objects', icon: 'building', requiredCapability: 'rentals', order: 1 },
    { id: 'calendar', label: { en: 'Calendar', nb: 'Kalender' }, href: '/calendar', icon: 'calendar', requiredCapability: 'calendar', order: 2 },
    { 
      id: 'bookings', 
      label: { en: 'Bookings', nb: 'Bookinger' }, 
      href: '/bookings', 
      icon: 'clipboard', 
      requiredCapability: 'booking', 
      order: 3,
      children: [
        { id: 'bookings-pending', label: { en: 'Pending', nb: 'Venter' }, href: '/bookings/pending', order: 1 },
        { id: 'bookings-all', label: { en: 'All', nb: 'Alle' }, href: '/bookings', order: 2 },
      ],
    },
    { id: 'seasons', label: { en: 'Seasons', nb: 'Sesonger' }, href: '/seasons', icon: 'sun', requiredCapability: 'seasons', order: 4 },
    { id: 'pricing', label: { en: 'Pricing', nb: 'Priser' }, href: '/pricing', icon: 'credit-card', requiredCapability: 'pricing', order: 5 },
  ],
  minside: [
    { id: 'my-bookings', label: { en: 'My Bookings', nb: 'Mine bookinger' }, href: '/bookings', icon: 'calendar', requiredCapability: 'booking', order: 1 },
    { id: 'favorites', label: { en: 'Favorites', nb: 'Favoritter' }, href: '/favorites', icon: 'heart', requiredCapability: 'favorites', order: 2 },
  ],
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert domain nav item to standard nav item
 */
function domainToNavItem(item: DomainNavItem, lang: 'en' | 'nb', moduleId: string): CombinedNavItem {
  return {
    id: item.id,
    label: item.label[lang],
    href: item.href,
    requiredCapability: item.requiredCapability,
    source: 'domain',
    moduleId,
    order: item.order ?? 100,
    children: item.children?.map(child => domainToNavItem(child, lang, moduleId)),
  };
}

/**
 * Convert static nav item to combined format
 */
function staticToCombined(item: NavItem, order: number): CombinedNavItem {
  return {
    ...item,
    source: 'static',
    order,
    children: item.children?.map((child, idx) => staticToCombined(child, idx)),
  };
}

/**
 * Sort navigation items by order
 */
function sortByOrder(items: CombinedNavItem[]): CombinedNavItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get combined navigation for an app
 * Merges platform core + domain module navigation
 * 
 * @param source - App source (web, backoffice, minside)
 * @param lang - Language for labels
 * @param includeDisabled - Whether to include disabled items
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const navItems = useDomainNavigation('backoffice', 'nb');
 *   
 *   return (
 *     <nav>
 *       {navItems.map(item => (
 *         <NavLink key={item.id} item={item} />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useDomainNavigation(
  source: NavSource,
  lang: 'en' | 'nb' = 'nb'
): CombinedNavItem[] {
  const capabilities = useCapabilities();
  const enabledModules = useEnabledModules();

  return useMemo(() => {
    // Platform core items
    const platformItems = (PLATFORM_NAV[source] || []).map((item, idx) => 
      staticToCombined(item, -100 + idx) // Negative order = before domain items
    );

    // Domain items (currently only BOOKING_RENTALS)
    const bookingItems = (BOOKING_RENTALS_NAV[source] || []).map(item => 
      domainToNavItem(item, lang, 'BOOKING_RENTALS')
    );

    // Combine and filter by capabilities
    const allItems: CombinedNavItem[] = [...platformItems, ...bookingItems];
    const filtered = filterNavItemsByCapabilities(allItems, capabilities) as CombinedNavItem[];
    
    return sortByOrder(filtered);
  }, [source, lang, capabilities, enabledModules]);
}

/**
 * Get domain navigation with disabled items annotated
 * 
 * @param source - App source
 * @param lang - Language for labels
 */
export function useAnnotatedDomainNavigation(
  source: NavSource,
  lang: 'en' | 'nb' = 'nb'
): FilteredNavItem[] {
  const capabilities = useCapabilities();
  const enabledModules = useEnabledModules();

  return useMemo(() => {
    // Platform core items
    const platformItems = (PLATFORM_NAV[source] || []).map((item, idx) => 
      staticToCombined(item, -100 + idx)
    );

    // Domain items
    const bookingItems = (BOOKING_RENTALS_NAV[source] || []).map(item => 
      domainToNavItem(item, lang, 'BOOKING_RENTALS')
    );

    // Combine and annotate
    const allItems: CombinedNavItem[] = [...platformItems, ...bookingItems];
    return annotateNavItems(allItems, capabilities, enabledModules);
  }, [source, lang, capabilities, enabledModules]);
}

/**
 * Get domain group status
 * 
 * @returns Object with domain group enabled status
 */
export function useDomainGroupStatus(): Record<string, boolean> {
  const enabledModules = useEnabledModules();

  return useMemo(() => {
    // Check if core booking modules are enabled
    const bookingModules = ['RENTAL_OBJECTS', 'BOOKINGS'];
    const isBookingEnabled = bookingModules.every(m => enabledModules.includes(m));

    return {
      CORE: true, // Always enabled
      BOOKING_RENTALS: isBookingEnabled,
      COMMUNICATION: enabledModules.includes('NOTIFICATIONS'),
      ECONOMY: enabledModules.includes('PAYMENTS'),
      EXPERIENCE: enabledModules.includes('SEARCH'),
      INTEGRATIONS: enabledModules.includes('INTEGRATIONS_IDPORTEN'),
      COMPLIANCE: enabledModules.includes('AUDIT_LOGGING'),
    };
  }, [enabledModules]);
}

/**
 * Check if a domain group is enabled
 * 
 * @param domainGroup - Domain group to check
 */
export function useIsDomainGroupEnabled(domainGroup: string): boolean {
  const status = useDomainGroupStatus();
  return status[domainGroup] ?? false;
}
