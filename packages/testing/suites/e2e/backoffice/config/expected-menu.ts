/**
 * Expected Backoffice Menu Model
 * 
 * Canonical sidebar structure that tests will validate against.
 * This is the source of truth for navigation and feature visibility.
 */

export interface MenuSection {
  id: string;
  title: string;  // Expected Norwegian label
  titleEn?: string; // English label
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  labelEn?: string;
  href: string;
  capability?: string;
  featureFlag?: string;  // Required feature flag to be visible
  adminOnly?: boolean;
  saksbehandlerAllowed?: boolean;
}

/**
 * Expected Menu Structure
 * 
 * Based on SSA-L requirements and backoffice design.
 * Tests will compare actual sidebar against this model.
 */
export const EXPECTED_MENU_MODEL: MenuSection[] = [
  // 1) Dashboard
  {
    id: 'overview',
    title: 'Oversikt',
    titleEn: 'Overview',
    items: [
      { 
        id: 'dashboard', 
        label: 'Kontrollpanel', 
        labelEn: 'Dashboard',
        href: '/', 
        capability: 'CAP_NAV_DASHBOARD',
        saksbehandlerAllowed: true,
      },
    ],
  },
  
  // 2) Work (Operational)
  {
    id: 'work',
    title: 'Arbeid',
    titleEn: 'Work',
    items: [
      { 
        id: 'bookings', 
        label: 'Bestillinger', 
        labelEn: 'Bookings',
        href: '/bookings', 
        capability: 'CAP_NAV_BOOKINGS',
        saksbehandlerAllowed: true,
      },
      { 
        id: 'calendar', 
        label: 'Kalender', 
        labelEn: 'Calendar',
        href: '/calendar', 
        capability: 'CAP_NAV_CALENDAR',
        saksbehandlerAllowed: true,
      },
    ],
  },
  
  // 3) Communication
  {
    id: 'communication',
    title: 'Kommunikasjon',
    titleEn: 'Communication',
    items: [
      { 
        id: 'messages', 
        label: 'Meldinger', 
        labelEn: 'Messages',
        href: '/messages', 
        capability: 'CAP_NAV_MESSAGES',
        featureFlag: 'FEATURE_MESSAGING',
        saksbehandlerAllowed: false,
      },
    ],
  },
  
  // 4) Economy
  {
    id: 'economy',
    title: 'Økonomi',
    titleEn: 'Economy',
    items: [
      { 
        id: 'invoices', 
        label: 'Fakturaer', 
        labelEn: 'Invoices',
        href: '/economy/invoices', 
        capability: 'CAP_NAV_ECONOMY',
        featureFlag: 'FEATURE_PAYMENTS',
        adminOnly: true,
      },
    ],
  },
  
  // 5) Reports
  {
    id: 'reports',
    title: 'Rapporter',
    titleEn: 'Reports',
    items: [
      { 
        id: 'reports', 
        label: 'Rapporter', 
        labelEn: 'Reports',
        href: '/reports', 
        capability: 'CAP_NAV_REPORTS',
        featureFlag: 'FEATURE_REPORTING',
        adminOnly: true,
      },
    ],
  },
  
  // 6) Approvals (Saksbehandler Critical)
  {
    id: 'approvals',
    title: 'Saksbehandling',
    titleEn: 'Case Handling',
    items: [
      { 
        id: 'work-queue', 
        label: 'Arbeidsoppgaver', 
        labelEn: 'Work Queue',
        href: '/work-queue', 
        capability: 'CAP_BOOKING_APPROVE',
        saksbehandlerAllowed: true,
      },
      { 
        id: 'season-applications', 
        label: 'Sesongsøknader', 
        labelEn: 'Season Applications',
        href: '/season-applications', 
        capability: 'CAP_BOOKING_APPROVE',
        saksbehandlerAllowed: true,
      },
      { 
        id: 'decision-forms', 
        label: 'Vedtaksskjema', 
        labelEn: 'Decision Forms',
        href: '/decision-forms', 
        capability: 'CAP_BOOKING_APPROVE',
        saksbehandlerAllowed: true,
      },
    ],
  },
  
  // 7) Administration (Listings)
  {
    id: 'administration',
    title: 'Administrasjon',
    titleEn: 'Administration',
    items: [
      { 
        id: 'rental-objects', 
        label: 'Utleieobjekter', 
        labelEn: 'Rental Objects',
        href: '/rental-objects', 
        capability: 'CAP_LISTING_EDIT',
        adminOnly: true,
      },
      { 
        id: 'seasons', 
        label: 'Sesonger', 
        labelEn: 'Seasons',
        href: '/seasons', 
        capability: 'CAP_BOOKING_MANAGE',
        adminOnly: true,
      },
    ],
  },
  
  // 8) Users & Organizations
  {
    id: 'users-orgs',
    title: 'Brukere og organisasjoner',
    titleEn: 'Users & Organizations',
    items: [
      { 
        id: 'organizations', 
        label: 'Organisasjoner', 
        labelEn: 'Organizations',
        href: '/organizations', 
        capability: 'CAP_ORG_ADMIN',
        adminOnly: true,
      },
      { 
        id: 'users', 
        label: 'Brukere', 
        labelEn: 'Users',
        href: '/users', 
        capability: 'CAP_USER_ADMIN',
        adminOnly: true,
      },
    ],
  },
  
  // 9) Tenant Settings
  {
    id: 'tenant',
    title: 'Kommuneinnstillinger',
    titleEn: 'Tenant Settings',
    items: [
      { 
        id: 'tenant-users', 
        label: 'Kommunebrukere', 
        labelEn: 'Tenant Users',
        href: '/tenant/users', 
        capability: 'CAP_USER_ADMIN',
        adminOnly: true,
      },
      { 
        id: 'tenant-features', 
        label: 'Funksjoner', 
        labelEn: 'Features',
        href: '/tenant/features', 
        capability: 'CAP_SETTINGS_ADMIN',
        featureFlag: 'FEATURE_FLAGS_UI',
        adminOnly: true,
      },
      { 
        id: 'tenant-settings', 
        label: 'Plattforminnstillinger', 
        labelEn: 'Platform Settings',
        href: '/tenant/settings', 
        capability: 'CAP_SETTINGS_ADMIN',
        adminOnly: true,
      },
      { 
        id: 'tenant-branding', 
        label: 'Merkevarebygging', 
        labelEn: 'Branding',
        href: '/tenant/branding', 
        capability: 'CAP_SETTINGS_ADMIN',
        featureFlag: 'FEATURE_BRANDING',
        adminOnly: true,
      },
    ],
  },
  
  // 10) System
  {
    id: 'system',
    title: 'System',
    titleEn: 'System',
    items: [
      { 
        id: 'gdpr-requests', 
        label: 'GDPR-forespørsler', 
        labelEn: 'GDPR Requests',
        href: '/gdpr-requests', 
        capability: 'CAP_SETTINGS_ADMIN',
        adminOnly: true,
      },
      { 
        id: 'audit', 
        label: 'Revisjonslogg', 
        labelEn: 'Audit Log',
        href: '/audit', 
        capability: 'CAP_AUDIT_VIEW',
        adminOnly: true,
      },
      { 
        id: 'settings', 
        label: 'Innstillinger', 
        labelEn: 'Settings',
        href: '/settings', 
        capability: 'CAP_SYSTEM_CONFIG',
        adminOnly: true,
      },
    ],
  },
  
  // 11) Help (Always visible)
  {
    id: 'help',
    title: 'Hjelp',
    titleEn: 'Help',
    items: [
      { 
        id: 'help', 
        label: 'Hjelp og støtte', 
        labelEn: 'Help & Support',
        href: '/help', 
        capability: 'CAP_NAV_HELP',
        saksbehandlerAllowed: true,
      },
    ],
  },
];

/**
 * Feature Flags that control UI visibility
 */
export const FEATURE_FLAGS = {
  FEATURE_MESSAGING: {
    id: 'FEATURE_MESSAGING',
    name: 'Messaging',
    affectedRoutes: ['/messages'],
    affectedSidebarItems: ['messages'],
  },
  FEATURE_PAYMENTS: {
    id: 'FEATURE_PAYMENTS',
    name: 'Payments & Invoicing',
    affectedRoutes: ['/economy/invoices', '/economy'],
    affectedSidebarItems: ['invoices'],
  },
  FEATURE_REPORTING: {
    id: 'FEATURE_REPORTING',
    name: 'Reporting',
    affectedRoutes: ['/reports'],
    affectedSidebarItems: ['reports'],
  },
  FEATURE_BRANDING: {
    id: 'FEATURE_BRANDING',
    name: 'Branding',
    affectedRoutes: ['/tenant/branding'],
    affectedSidebarItems: ['tenant-branding'],
  },
  FEATURE_FLAGS_UI: {
    id: 'FEATURE_FLAGS_UI',
    name: 'Feature Flags UI',
    affectedRoutes: ['/tenant/features'],
    affectedSidebarItems: ['tenant-features'],
  },
};

export type FeatureFlagId = keyof typeof FEATURE_FLAGS;

/**
 * Get items allowed for a specific role
 */
export function getItemsForRole(role: 'admin' | 'saksbehandler'): MenuItem[] {
  const items: MenuItem[] = [];
  
  for (const section of EXPECTED_MENU_MODEL) {
    for (const item of section.items) {
      if (role === 'admin') {
        items.push(item);
      } else if (role === 'saksbehandler' && item.saksbehandlerAllowed) {
        items.push(item);
      }
    }
  }
  
  return items;
}

/**
 * Get items blocked for a specific role
 */
export function getBlockedItemsForRole(role: 'admin' | 'saksbehandler'): MenuItem[] {
  const items: MenuItem[] = [];
  
  for (const section of EXPECTED_MENU_MODEL) {
    for (const item of section.items) {
      if (role === 'saksbehandler' && item.adminOnly) {
        items.push(item);
      }
    }
  }
  
  return items;
}

/**
 * Get items affected by a feature flag
 */
export function getItemsForFlag(flagId: FeatureFlagId): MenuItem[] {
  const flag = FEATURE_FLAGS[flagId];
  const items: MenuItem[] = [];
  
  for (const section of EXPECTED_MENU_MODEL) {
    for (const item of section.items) {
      if (item.featureFlag === flagId || flag.affectedSidebarItems.includes(item.id)) {
        items.push(item);
      }
    }
  }
  
  return items;
}
