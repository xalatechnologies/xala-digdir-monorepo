/**
 * Backoffice Role-Based Capability Definitions
 *
 * This module defines the capability matrix for the backoffice RBAC system.
 * Capabilities provide fine-grained permission checks that are mapped to
 * the effective backoffice role (admin or case_handler).
 */

/**
 * Effective role type for backoffice users.
 * - super_admin: Full platform access including integrations and system config
 * - admin: Full access to tenant features
 * - case_handler: Limited access to booking/approval workflows (saksbehandler)
 * - org_admin: Organization admin with management access to assigned rental objects
 * - org_member: Operational role scoped to assigned rental objects only (read + basic ops)
 */
export type EffectiveBackofficeRole = 'super_admin' | 'admin' | 'case_handler' | 'org_admin' | 'org_member';

/**
 * Capability definitions for feature-level access control.
 * Use capability checks instead of direct role comparisons for cleaner,
 * more maintainable code.
 */
export type Capability =
  // Existing admin/case_handler capabilities
  | 'CAP_BOOKING_READ'
  | 'CAP_BOOKING_APPROVE'
  | 'CAP_BOOKING_MANAGE'
  | 'CAP_LISTING_READ'
  | 'CAP_LISTING_CREATE'
  | 'CAP_LISTING_EDIT'
  | 'CAP_USER_VIEW'
  | 'CAP_USER_ADMIN'
  | 'CAP_ORG_VIEW'
  | 'CAP_ORG_ADMIN'
  | 'CAP_SETTINGS_VIEW'
  | 'CAP_SETTINGS_ADMIN'
  | 'CAP_AUDIT_VIEW'
  | 'CAP_REPORTS_VIEW'
  | 'CAP_REPORTS_EXPORT'
  | 'CAP_INTEGRATIONS_VIEW'
  | 'CAP_INTEGRATIONS_ADMIN'
  | 'CAP_SYSTEM_CONFIG'
  // Org Admin Capabilities (delegated staff with management access)
  | 'CAP_ORG_ADMIN_ENABLED'
  | 'CAP_RENTAL_OBJECTS_UPDATE_ASSIGNED'
  // Org Member Base Capabilities
  | 'CAP_ORG_MEMBER_ENABLED'
  | 'CAP_RENTAL_OBJECTS_READ_ASSIGNED'
  | 'CAP_BOOKINGS_READ_ASSIGNED'
  | 'CAP_CALENDAR_VIEW_ASSIGNED'
  | 'CAP_HELP_ENABLED'
  // Org Member Operational Capabilities
  | 'CAP_BOOKINGS_APPROVE_ASSIGNED'
  | 'CAP_BOOKINGS_REJECT_ASSIGNED'
  | 'CAP_BOOKINGS_RESCHEDULE_ASSIGNED'
  | 'CAP_BOOKINGS_CANCEL_ASSIGNED'
  // Org Member Communication Capabilities
  | 'CAP_MESSAGING_ENABLED'
  | 'CAP_MESSAGING_REPLY_ENABLED'
  // Org Member Finance Capabilities
  | 'CAP_ECONOMY_INVOICES_READ_ASSIGNED'
  | 'CAP_ECONOMY_INVOICES_EXPORT_ASSIGNED'
  // Org Member Reporting Capabilities
  | 'CAP_REPORTS_READ_ASSIGNED'
  | 'CAP_EXPORTS_ENABLED'
  // Org Member Availability Capabilities
  | 'CAP_BLOCKS_READ_ASSIGNED'
  | 'CAP_BLOCKS_MANAGE_ASSIGNED'
  // Org Member UI Surface Capabilities
  | 'CAP_NAV_DASHBOARD'
  | 'CAP_NAV_BOOKINGS'
  | 'CAP_NAV_CALENDAR'
  | 'CAP_NAV_MESSAGES'
  | 'CAP_NAV_ECONOMY'
  | 'CAP_NAV_REPORTS'
  | 'CAP_NAV_HELP'
  | 'CAP_NAV_BLOCKS';

/**
 * Role-to-capability mapping.
 * Defines which capabilities each effective role has access to.
 */
export const ROLE_CAPABILITIES: Record<EffectiveBackofficeRole, Capability[]> = {
  super_admin: [
    'CAP_BOOKING_READ',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_MANAGE',
    'CAP_LISTING_READ',
    'CAP_LISTING_CREATE',
    'CAP_LISTING_EDIT',
    'CAP_USER_VIEW',
    'CAP_USER_ADMIN',
    'CAP_ORG_VIEW',
    'CAP_ORG_ADMIN',
    'CAP_SETTINGS_VIEW',
    'CAP_SETTINGS_ADMIN',
    'CAP_AUDIT_VIEW',
    'CAP_REPORTS_VIEW',
    'CAP_REPORTS_EXPORT',
    'CAP_INTEGRATIONS_VIEW',
    'CAP_INTEGRATIONS_ADMIN',
    'CAP_SYSTEM_CONFIG',
  ],
  admin: [
    'CAP_BOOKING_READ',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_MANAGE',
    'CAP_LISTING_READ',
    'CAP_LISTING_CREATE',
    'CAP_LISTING_EDIT',
    'CAP_USER_VIEW',
    'CAP_USER_ADMIN',
    'CAP_ORG_VIEW',
    'CAP_ORG_ADMIN',
    'CAP_SETTINGS_VIEW',
    'CAP_SETTINGS_ADMIN',
    'CAP_AUDIT_VIEW',
    'CAP_REPORTS_VIEW',
    'CAP_REPORTS_EXPORT',
  ],
  case_handler: [
    'CAP_BOOKING_READ',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_MANAGE',
    'CAP_LISTING_READ',
    'CAP_REPORTS_VIEW',
  ],
  /**
   * Organization Admin (org_admin)
   * Delegated staff with management access to assigned rental objects.
   * Extends org_member with additional management capabilities.
   * Personas: Utleierleder, Fasilitetsansvarlig, Kommunal avdelingsleder
   */
  org_admin: [
    // Base enablement
    'CAP_ORG_ADMIN_ENABLED',
    'CAP_ORG_MEMBER_ENABLED',
    // UI navigation surfaces
    'CAP_NAV_DASHBOARD',
    'CAP_NAV_BOOKINGS',
    'CAP_NAV_CALENDAR',
    'CAP_NAV_BLOCKS',
    'CAP_NAV_MESSAGES',
    'CAP_NAV_REPORTS',
    'CAP_NAV_HELP',
    // Rental objects (assigned scope)
    'CAP_RENTAL_OBJECTS_READ_ASSIGNED',
    'CAP_RENTAL_OBJECTS_UPDATE_ASSIGNED',
    // Bookings (assigned scope)
    'CAP_BOOKINGS_READ_ASSIGNED',
    'CAP_BOOKINGS_APPROVE_ASSIGNED',
    'CAP_BOOKINGS_REJECT_ASSIGNED',
    'CAP_BOOKINGS_RESCHEDULE_ASSIGNED',
    'CAP_BOOKINGS_CANCEL_ASSIGNED',
    // Calendar (assigned scope)
    'CAP_CALENDAR_VIEW_ASSIGNED',
    // Blocks (assigned scope)
    'CAP_BLOCKS_READ_ASSIGNED',
    'CAP_BLOCKS_MANAGE_ASSIGNED',
    // Communication (feature-gated)
    'CAP_MESSAGING_ENABLED',
    'CAP_MESSAGING_REPLY_ENABLED',
    // Reports (assigned scope)
    'CAP_REPORTS_READ_ASSIGNED',
    'CAP_EXPORTS_ENABLED',
    // Help (always enabled)
    'CAP_HELP_ENABLED',
  ],
  /**
   * Organization Member (org_member)
   * Operational role scoped to assigned rental objects only.
   * All capabilities are scoped to assigned objects unless explicitly marked otherwise.
   * Personas: Utleier, Økonomiansvarlig, Saksbehandler (kommune)
   */
  org_member: [
    // Base capabilities (always enabled for org_member)
    'CAP_ORG_MEMBER_ENABLED',
    'CAP_RENTAL_OBJECTS_READ_ASSIGNED',
    'CAP_BOOKINGS_READ_ASSIGNED',
    'CAP_CALENDAR_VIEW_ASSIGNED',
    'CAP_HELP_ENABLED',
    // UI navigation surfaces
    'CAP_NAV_DASHBOARD',
    'CAP_NAV_BOOKINGS',
    'CAP_NAV_CALENDAR',
    'CAP_NAV_HELP',
    // Operational capabilities (toggled per member)
    // These are included by default but can be individually disabled:
    'CAP_BOOKINGS_APPROVE_ASSIGNED',
    'CAP_BOOKINGS_REJECT_ASSIGNED',
  ],
};

/**
 * Helper function to get capabilities for a given role.
 * Returns an empty array for undefined roles.
 */
export function getCapabilitiesForRole(role: EffectiveBackofficeRole | undefined): Capability[] {
  if (!role) return [];
  return ROLE_CAPABILITIES[role] ?? [];
}

/**
 * Helper function to check if a role has a specific capability.
 */
export function roleHasCapability(
  role: EffectiveBackofficeRole | undefined,
  capability: Capability
): boolean {
  return getCapabilitiesForRole(role).includes(capability);
}
