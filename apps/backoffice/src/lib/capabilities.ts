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
 */
export type EffectiveBackofficeRole = 'super_admin' | 'admin' | 'case_handler';

/**
 * Capability definitions for feature-level access control.
 * Use capability checks instead of direct role comparisons for cleaner,
 * more maintainable code.
 */
export type Capability =
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
  | 'CAP_SYSTEM_CONFIG';

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
