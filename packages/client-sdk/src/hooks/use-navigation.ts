/**
 * Navigation Utilities
 * Filter navigation items based on module/capability availability
 */

import { useCapabilities } from './use-modules';

// =============================================================================
// Types
// =============================================================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  /** Module key required for this item (e.g., 'RATINGS', 'MESSAGING') */
  requiredModule?: string;
  /** Capability required for this item (e.g., 'ratings', 'messaging') */
  requiredCapability?: string;
  /** Permission required (e.g., 'bookings:read') */
  requiredPermission?: string;
  /** Children items */
  children?: NavItem[];
  /** Badge count */
  badge?: number;
}

export interface FilteredNavItem extends NavItem {
  isEnabled: boolean;
  disabledReason?: 'module_disabled' | 'capability_missing' | 'permission_denied';
}

// =============================================================================
// Filter Functions (Pure, no React)
// =============================================================================

/**
 * Filter nav items based on capabilities
 * Pure function - can be used outside React
 */
export function filterNavItemsByCapabilities(
  items: NavItem[],
  capabilities: Record<string, boolean>
): NavItem[] {
  return items.filter((item) => {
    // Check capability requirement
    if (item.requiredCapability) {
      if (capabilities[item.requiredCapability] !== true) {
        return false;
      }
    }
    return true;
  }).map((item) => ({
    ...item,
    // Recursively filter children
    children: item.children 
      ? filterNavItemsByCapabilities(item.children, capabilities)
      : undefined,
  }));
}

/**
 * Mark nav items with enabled/disabled state
 * Returns all items but marks disabled ones
 */
export function annotateNavItems(
  items: NavItem[],
  capabilities: Record<string, boolean>,
  enabledModules: string[]
): FilteredNavItem[] {
  return items.map((item) => {
    let isEnabled = true;
    let disabledReason: FilteredNavItem['disabledReason'];

    // Check module requirement
    if (item.requiredModule) {
      if (!enabledModules.includes(item.requiredModule)) {
        isEnabled = false;
        disabledReason = 'module_disabled';
      }
    }

    // Check capability requirement
    if (item.requiredCapability && isEnabled) {
      if (capabilities[item.requiredCapability] !== true) {
        isEnabled = false;
        disabledReason = 'capability_missing';
      }
    }

    return {
      ...item,
      isEnabled,
      disabledReason,
      children: item.children
        ? annotateNavItems(item.children, capabilities, enabledModules)
        : undefined,
    };
  });
}

// =============================================================================
// React Hook
// =============================================================================

/**
 * Hook to filter navigation items based on current capabilities
 *
 * @example
 * ```tsx
 * const allItems: NavItem[] = [
 *   { id: 'dashboard', label: 'Dashboard', href: '/' },
 *   { id: 'ratings', label: 'Ratings', href: '/ratings', requiredCapability: 'ratings' },
 *   { id: 'messaging', label: 'Messages', href: '/messages', requiredCapability: 'messaging' },
 * ];
 *
 * function Sidebar() {
 *   const visibleItems = useFilteredNavItems(allItems);
 *   return (
 *     <nav>
 *       {visibleItems.map(item => <NavLink key={item.id} item={item} />)}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useFilteredNavItems(items: NavItem[]): NavItem[] {
  const capabilities = useCapabilities();
  return filterNavItemsByCapabilities(items, capabilities);
}

/**
 * Hook to get nav items with enabled/disabled annotations
 * Use when you want to show disabled items (e.g., with upgrade prompt)
 */
export function useAnnotatedNavItems(
  items: NavItem[],
  enabledModules: string[] = []
): FilteredNavItem[] {
  const capabilities = useCapabilities();
  return annotateNavItems(items, capabilities, enabledModules);
}
