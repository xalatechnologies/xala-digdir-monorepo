/**
 * Admin Navigation Menu Generator
 * 
 * Generates the exact 18-item admin menu structure for Backoffice.
 * This is the single source of truth for admin navigation.
 */

import { PERMISSIONS } from './permissions';

export interface AdminMenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
  permission: string;
  group?: string; // Optional group for menu organization
}

/**
 * Generate admin navigation menu
 * Returns exactly 18 menu items in the specified order
 * 
 * @param role - User's role
 * @returns Array of menu items (empty if not admin)
 */
export function generateAdminMenu(role: string): AdminMenuItem[] {
  // Admin-level roles that get the full admin menu:
  // - admin (system-level admin)
  // - TENANT_ADMIN (tenant admin)
  // - COMMUNE_ADMIN (commune admin - same as TENANT_ADMIN in this context)
  const adminRoles = ['admin', 'TENANT_ADMIN', 'COMMUNE_ADMIN'];
  
  if (!adminRoles.includes(role)) {
    return [];
  }

  return [
    // Dashboard (no group - standalone)
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/',
      icon: 'home',
      order: 1,
      permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    },
    
    // Utleie (Rental Management)
    {
      id: 'utleieobjekter',
      label: 'Utleieobjekter',
      href: '/rental-objects',
      icon: 'building',
      order: 2,
      permission: PERMISSIONS.ADMIN_UTLEIEOBJEKTER_VIEW,
      group: 'Utleie',
    },
    {
      id: 'prisgrupper',
      label: 'Prisgrupper',
      href: '/pricing-rules',
      icon: 'currency',
      order: 3,
      permission: PERMISSIONS.ADMIN_PRISGRUPPER_VIEW,
      group: 'Utleie',
    },
    {
      id: 'sesongleie',
      label: 'Sesongleie',
      href: '/seasons',
      icon: 'repeat',
      order: 4,
      permission: PERMISSIONS.ADMIN_SESONGLEIE_VIEW,
      group: 'Utleie',
    },
    
    // Bookinger (Bookings)
    {
      id: 'bookinger',
      label: 'Bookinger',
      href: '/bookings',
      icon: 'calendar-check',
      order: 5,
      permission: PERMISSIONS.ADMIN_BOOKINGER_VIEW,
      group: 'Bookinger',
    },
    {
      id: 'kalender',
      label: 'Kalender',
      href: '/calendar',
      icon: 'calendar',
      order: 6,
      permission: PERMISSIONS.ADMIN_KALENDER_VIEW,
      group: 'Bookinger',
    },
    
    // Kommunikasjon (Communication)
    {
      id: 'meldinger',
      label: 'Meldinger',
      href: '/messages',
      icon: 'message',
      order: 7,
      permission: PERMISSIONS.ADMIN_MELDINGER_VIEW,
      group: 'Kommunikasjon',
    },
    {
      id: 'meldingsmaler',
      label: 'Meldingsmaler',
      href: '/templates',
      icon: 'document-text',
      order: 8,
      permission: PERMISSIONS.ADMIN_MELDINGSMALER_VIEW,
      group: 'Kommunikasjon',
    },
    
    // Brukere og organisasjon (Users & Organization)
    {
      id: 'brukere',
      label: 'Brukere',
      href: '/users',
      icon: 'users',
      order: 9,
      permission: PERMISSIONS.ADMIN_BRUKERE_VIEW,
      group: 'Brukere',
    },
    
    // Økonomi og rapporter (Finance & Reports)
    {
      id: 'okonomi',
      label: 'Økonomi',
      href: '/economy',
      icon: 'chart',
      order: 10,
      permission: PERMISSIONS.ADMIN_OKONOMI_VIEW,
      group: 'Økonomi',
    },
    {
      id: 'rapporter',
      label: 'Rapporter',
      href: '/reports',
      icon: 'document-chart',
      order: 11,
      permission: PERMISSIONS.ADMIN_RAPPORTER_VIEW,
      group: 'Økonomi',
    },
    
    // System og innstillinger (System & Settings)
    {
      id: 'audit-log',
      label: 'Audit log',
      href: '/audit',
      icon: 'clock',
      order: 12,
      permission: PERMISSIONS.ADMIN_AUDITLOG_VIEW,
      group: 'System',
    },
    {
      id: 'anmeldelser',
      label: 'Anmeldelser',
      href: '/reviews/moderation',
      icon: 'star',
      order: 13,
      permission: PERMISSIONS.ADMIN_ANMELDELSER_VIEW,
      group: 'System',
    },
    {
      id: 'system',
      label: 'System',
      href: '/system',
      icon: 'cog',
      order: 14,
      permission: PERMISSIONS.ADMIN_SYSTEM_VIEW,
      group: 'System',
    },
    {
      id: 'innstillinger',
      label: 'Innstillinger',
      href: '/settings',
      icon: 'settings',
      order: 15,
      permission: PERMISSIONS.ADMIN_INNSTILLINGER_VIEW,
      group: 'System',
    },
    
    // Hjelp (Help - standalone at bottom)
    {
      id: 'hjelp-og-stotte',
      label: 'Hjelp og støtte',
      href: '/help',
      icon: 'question-circle',
      order: 16,
      permission: PERMISSIONS.ADMIN_HJELP_VIEW,
    },
  ];
}

/**
 * Get all admin navigation permissions
 * Returns the 17 permissions required for admin navigation
 */
export function getAdminNavigationPermissions(): string[] {
  return [
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_ADMINISTRASJON_VIEW,
    PERMISSIONS.ADMIN_UTLEIEOBJEKTER_VIEW,
    PERMISSIONS.ADMIN_PRISGRUPPER_VIEW,
    PERMISSIONS.ADMIN_BOOKINGER_VIEW,
    PERMISSIONS.ADMIN_KALENDER_VIEW,
    PERMISSIONS.ADMIN_SESONGLEIE_VIEW,
    PERMISSIONS.ADMIN_BRUKERE_VIEW,
    PERMISSIONS.ADMIN_MELDINGER_VIEW,
    PERMISSIONS.ADMIN_MELDINGSMALER_VIEW,
    PERMISSIONS.ADMIN_SYSTEM_VIEW,
    PERMISSIONS.ADMIN_OKONOMI_VIEW,
    PERMISSIONS.ADMIN_RAPPORTER_VIEW,
    PERMISSIONS.ADMIN_AUDITLOG_VIEW,
    PERMISSIONS.ADMIN_ANMELDELSER_VIEW,
    PERMISSIONS.ADMIN_INNSTILLINGER_VIEW,
    PERMISSIONS.ADMIN_HJELP_VIEW,
  ];
}
