import type { ReactNode } from 'react';

// =============================================================================
// Navigation Types
// =============================================================================

/**
 * Represents a single navigation item in the sidebar
 */
export interface NavItem {
  /** Display name in the sidebar */
  name: string;
  /** Brief description shown below the name */
  description: string;
  /** Route path (relative to root) */
  href: string;
  /** Icon key or React node - resolved by the consumer */
  icon: string;
  /** Optional nested children for sub-navigation */
  children?: NavItem[];
  /** Whether this item is hidden from navigation (still routable) */
  hidden?: boolean;
}

/**
 * Represents a navigation section with optional title
 */
export interface NavSection {
  /** Section ID (used for keys and anchors) */
  id: string;
  /** Section title displayed above items (optional) */
  title?: string;
  /** Navigation items in this section */
  items: NavItem[];
}

/**
 * Icon keys used in navigation - mapped to actual icons by consumer
 */
export type NavIconKey =
  | 'home'
  | 'users'
  | 'book'
  | 'settings'
  | 'arrow-right'
  | 'clock'
  | 'building'
  | 'chart'
  | 'database'
  | 'link'
  | 'shield'
  | 'play'
  | 'folder';

// =============================================================================
// Navigation Registry - Single Source of Truth
// =============================================================================

/**
 * Documentation navigation registry
 *
 * This is the single source of truth for all navigation in the docs app.
 * Both the sidebar and router should consume this registry.
 *
 * Sections:
 * 1. Home (no section title)
 * 2. Roles & Permissions
 * 3. User Journeys
 * 4. Seeding
 * 5. Integrations
 * 6. Platform
 */
export const docsNav: NavSection[] = [
  // -------------------------------------------------------------------------
  // Home Section (no title)
  // -------------------------------------------------------------------------
  {
    id: 'home',
    items: [
      {
        name: 'Home',
        description: 'Documentation overview',
        href: '/',
        icon: 'home',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Roles & Permissions Section
  // -------------------------------------------------------------------------
  {
    id: 'roles',
    title: 'Roles & Permissions',
    items: [
      {
        name: 'Roles Overview',
        description: 'User roles in the system',
        href: '/roles',
        icon: 'users',
      },
      {
        name: 'Citizen',
        description: 'Public user permissions',
        href: '/roles/citizen',
        icon: 'users',
      },
      {
        name: 'Organization Member',
        description: 'Org member permissions',
        href: '/roles/org-member',
        icon: 'building',
      },
      {
        name: 'Caseworker',
        description: 'Case handler permissions',
        href: '/roles/caseworker',
        icon: 'clock',
      },
      {
        name: 'Admin',
        description: 'Administrator permissions',
        href: '/roles/admin',
        icon: 'shield',
      },
      {
        name: 'Tenant Admin',
        description: 'Tenant-level admin permissions',
        href: '/roles/tenant-admin',
        icon: 'settings',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // User Journeys Section
  // -------------------------------------------------------------------------
  {
    id: 'journeys',
    title: 'User Journeys',
    items: [
      {
        name: 'Journeys Overview',
        description: 'End-to-end user flows',
        href: '/journeys',
        icon: 'play',
      },
      {
        name: 'Booking Flow',
        description: 'How users book resources',
        href: '/journeys/booking',
        icon: 'book',
      },
      {
        name: 'Seasonal Leases',
        description: 'Seasonal booking process',
        href: '/journeys/seasonal',
        icon: 'clock',
      },
      {
        name: 'Organization Onboarding',
        description: 'Setting up organizations',
        href: '/journeys/org-onboarding',
        icon: 'building',
      },
      {
        name: 'Case Processing',
        description: 'Case handler workflows',
        href: '/journeys/case-processing',
        icon: 'folder',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Seeding Section
  // -------------------------------------------------------------------------
  {
    id: 'seeding',
    title: 'Seeding',
    items: [
      {
        name: 'Seeding Overview',
        description: 'Data seeding guide',
        href: '/seeding',
        icon: 'database',
      },
      {
        name: 'Demo Seeds',
        description: 'Demo environment data',
        href: '/seeding/demo-seeds',
        icon: 'database',
      },
      {
        name: 'Test Fixtures',
        description: 'Test data configuration',
        href: '/seeding/test-fixtures',
        icon: 'database',
      },
      {
        name: 'Production Seeds',
        description: 'Production baseline data',
        href: '/seeding/production-seeds',
        icon: 'database',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Integrations Section
  // -------------------------------------------------------------------------
  {
    id: 'integrations',
    title: 'Integrations',
    items: [
      {
        name: 'Integrations Overview',
        description: 'Third-party integrations',
        href: '/integrations',
        icon: 'link',
      },
      {
        name: 'Vipps',
        description: 'Payment integration',
        href: '/integrations/vipps',
        icon: 'link',
      },
      {
        name: 'ID-porten',
        description: 'Authentication integration',
        href: '/integrations/id-porten',
        icon: 'shield',
      },
      {
        name: 'Altinn',
        description: 'Government services',
        href: '/integrations/altinn',
        icon: 'building',
      },
      {
        name: 'SMS Gateway',
        description: 'SMS notifications',
        href: '/integrations/sms-gateway',
        icon: 'link',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Platform Section
  // -------------------------------------------------------------------------
  {
    id: 'platform',
    title: 'Platform',
    items: [
      {
        name: 'Platform Overview',
        description: 'System architecture',
        href: '/platform',
        icon: 'building',
      },
      {
        name: 'Feature Flags',
        description: 'Feature flag configuration',
        href: '/platform/feature-flags',
        icon: 'settings',
      },
      {
        name: 'Audit Logging',
        description: 'Audit trail system',
        href: '/platform/audit-logging',
        icon: 'chart',
      },
      {
        name: 'Multi-tenancy',
        description: 'Tenant isolation',
        href: '/platform/multi-tenancy',
        icon: 'building',
      },
      {
        name: 'Realtime Events',
        description: 'WebSocket events',
        href: '/platform/realtime-events',
        icon: 'play',
      },
      {
        name: 'SDK Reference',
        description: 'Client SDK documentation',
        href: '/platform/sdk-reference',
        icon: 'book',
      },
    ],
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all navigation items flattened (including children)
 */
export function getAllNavItems(): NavItem[] {
  const items: NavItem[] = [];

  function collectItems(navItems: NavItem[]) {
    for (const item of navItems) {
      items.push(item);
      if (item.children) {
        collectItems(item.children);
      }
    }
  }

  for (const section of docsNav) {
    collectItems(section.items);
  }

  return items;
}

/**
 * Get all unique routes from the navigation registry
 */
export function getAllRoutes(): string[] {
  return getAllNavItems().map((item) => item.href);
}

/**
 * Find a navigation item by its href
 */
export function findNavItemByHref(href: string): NavItem | undefined {
  return getAllNavItems().find((item) => item.href === href);
}

/**
 * Find a navigation section by its ID
 */
export function findNavSectionById(id: string): NavSection | undefined {
  return docsNav.find((section) => section.id === id);
}

/**
 * Get breadcrumb trail for a given href
 */
export function getBreadcrumbs(href: string): NavItem[] {
  const breadcrumbs: NavItem[] = [];
  const segments = href.split('/').filter(Boolean);

  // Always add home
  const homeItem = findNavItemByHref('/');
  if (homeItem) {
    breadcrumbs.push(homeItem);
  }

  // Build up path segments
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const item = findNavItemByHref(currentPath);
    if (item) {
      breadcrumbs.push(item);
    }
  }

  return breadcrumbs;
}

/**
 * Get the parent section for a given href
 */
export function getParentSection(href: string): NavSection | undefined {
  for (const section of docsNav) {
    const hasItem = section.items.some(
      (item) => item.href === href || (item.children?.some((child) => child.href === href) ?? false)
    );
    if (hasItem) {
      return section;
    }
  }
  return undefined;
}
