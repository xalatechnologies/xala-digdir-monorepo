/**
 * RBAC Types
 * Single Responsibility: Role-Based Access Control types and DTOs
 *
 * This module defines the types for:
 * - Backoffice roles (Commune Admin, Org Admin, Case Handlers, Members)
 * - Access grants (org ↔ rental_object delegation)
 * - Permission assignments (org → member → rental_object)
 * - Case handler scopes (commune/org level)
 * - User capabilities projection
 */

import type { TenantEntity, BaseQueryParams } from './enums';

// =============================================================================
// Backoffice Role Types
// =============================================================================

/**
 * Backoffice roles for kommune/organization hierarchy
 * These complement the base UserRole in enums.ts
 */
export type BackofficeRole =
  | 'COMMUNE_ADMIN'        // Tenant authority - owns rental_objects, grants org access
  | 'COMMUNE_CASE_HANDLER' // Commune-level case handler with scoped rental_objects
  | 'ORG_ADMIN'            // Manages org members, assigns permissions & case handlers
  | 'ORG_CASE_HANDLER'     // Org-level case handler (approve only, no deny)
  | 'ORG_MEMBER';          // Basic org member with per-rental_object permissions

/**
 * Organization membership role within an org
 */
export type OrgMembershipRole = 'admin' | 'case_handler' | 'member';

/**
 * Case handler scope type
 */
export type CaseHandlerScopeType = 'COMMUNE' | 'ORG';

/**
 * Status for access grants
 */
export type AccessGrantStatus = 'active' | 'revoked' | 'expired';

/**
 * Status for organization membership
 */
export type OrgMembershipStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Source of organization membership (for Brønnøysund sync)
 */
export type OrgMembershipSource = 'MANUAL' | 'BRREG' | 'SYNC';

// =============================================================================
// Rental Object Permission Enums
// =============================================================================

/**
 * Per-rental-object permissions that can be assigned to org members
 */
export enum RentalObjectPermission {
  /** View rental object details and availability */
  RO_VIEW = 'RO_VIEW',
  /** Create bookings for this rental object */
  RO_BOOK = 'RO_BOOK',
  /** Edit bookings made by org for this rental object */
  RO_BOOK_EDIT = 'RO_BOOK_EDIT',
  /** Cancel bookings made by org for this rental object */
  RO_BOOK_CANCEL = 'RO_BOOK_CANCEL',
  /** Assign case handlers for this rental object (org admin only) */
  RO_ASSIGN_CASE_HANDLERS = 'RO_ASSIGN_CASE_HANDLERS',
  /** Assign permissions for this rental object (org admin only) */
  RO_ASSIGN_PERMISSIONS = 'RO_ASSIGN_PERMISSIONS',
  /** Manage org members with access to this rental object (org admin only) */
  RO_MANAGE_MEMBERS = 'RO_MANAGE_MEMBERS',
}

/**
 * Booking action capabilities for case handlers and admins
 */
export enum BookingCapability {
  /** View booking details */
  BOOKING_VIEW = 'BOOKING_VIEW',
  /** Approve pending bookings */
  BOOKING_APPROVE = 'BOOKING_APPROVE',
  /** Deny/reject pending bookings */
  BOOKING_DENY = 'BOOKING_DENY',
  /** Cancel confirmed bookings */
  BOOKING_CANCEL = 'BOOKING_CANCEL',
  /** Create time blocks on rental objects */
  BOOKING_BLOCK_TIME = 'BOOKING_BLOCK_TIME',
  /** Edit existing bookings */
  BOOKING_EDIT = 'BOOKING_EDIT',
}

// =============================================================================
// Organization Membership Entity & DTOs
// =============================================================================

/**
 * Organization membership - links users to organizations with roles
 */
export interface OrgMembership extends TenantEntity {
  organizationId: string;
  userId: string;
  orgRole: OrgMembershipRole;
  status: OrgMembershipStatus;
  source: OrgMembershipSource;
  syncedAt?: string;
  invitedBy?: string;
  joinedAt?: string;
}

/**
 * Organization membership with expanded user details
 */
export interface OrgMembershipWithUser extends OrgMembership {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Create organization membership request
 */
export interface CreateOrgMembershipDTO {
  organizationId: string;
  userId: string;
  orgRole: OrgMembershipRole;
}

/**
 * Update organization membership request
 */
export interface UpdateOrgMembershipDTO {
  orgRole?: OrgMembershipRole;
  status?: OrgMembershipStatus;
}

/**
 * Query parameters for listing org memberships
 */
export interface OrgMembershipQueryParams extends BaseQueryParams {
  organizationId?: string;
  userId?: string;
  orgRole?: OrgMembershipRole;
  status?: OrgMembershipStatus;
}

// =============================================================================
// Access Grant Entity & DTOs
// =============================================================================

/**
 * Access grant - delegates rental object access from commune to org
 * Commune Admin grants org access to specific rental objects
 */
export interface AccessGrant extends TenantEntity {
  /** The commune/tenant granting access */
  communeId: string;
  /** The organization receiving access */
  organizationId: string;
  /** The rental object being delegated */
  rentalObjectId: string;
  /** Current status of the grant */
  status: AccessGrantStatus;
  /** User who granted the access */
  grantedBy: string;
  /** When the grant was created */
  grantedAt: string;
  /** User who revoked the access (if revoked) */
  revokedBy?: string;
  /** When the grant was revoked */
  revokedAt?: string;
  /** Optional expiration date */
  expiresAt?: string;
  /** Additional notes about the grant */
  notes?: string;
}

/**
 * Access grant with expanded relations
 */
export interface AccessGrantWithDetails extends AccessGrant {
  organization: {
    id: string;
    name: string;
  };
  rentalObject: {
    id: string;
    name: string;
    type?: string;
  };
  grantedByUser?: {
    id: string;
    name: string;
  };
}

/**
 * Create access grant request (Commune Admin only)
 */
export interface CreateAccessGrantDTO {
  organizationId: string;
  rentalObjectId: string;
  expiresAt?: string;
  notes?: string;
}

/**
 * Update access grant request
 */
export interface UpdateAccessGrantDTO {
  status?: AccessGrantStatus;
  expiresAt?: string;
  notes?: string;
}

/**
 * Bulk grant access request
 */
export interface BulkAccessGrantDTO {
  organizationId: string;
  rentalObjectIds: string[];
  expiresAt?: string;
  notes?: string;
}

/**
 * Query parameters for listing access grants
 */
export interface AccessGrantQueryParams extends BaseQueryParams {
  organizationId?: string;
  rentalObjectId?: string;
  status?: AccessGrantStatus;
  communeId?: string;
}

// =============================================================================
// Permission Assignment Entity & DTOs
// =============================================================================

/**
 * Permission assignment - per-rental-object permissions for org members
 * Org Admin assigns specific permissions to members for each rental object
 */
export interface PermissionAssignment extends TenantEntity {
  organizationId: string;
  userId: string;
  rentalObjectId: string;
  /** Array of granted permissions */
  permissions: RentalObjectPermission[];
  /** User who assigned the permissions */
  assignedBy: string;
  /** When permissions were assigned */
  assignedAt: string;
}

/**
 * Permission assignment with expanded details
 */
export interface PermissionAssignmentWithDetails extends PermissionAssignment {
  user: {
    id: string;
    name: string;
    email: string;
  };
  rentalObject: {
    id: string;
    name: string;
  };
  assignedByUser?: {
    id: string;
    name: string;
  };
}

/**
 * Create or update permission assignment (Org Admin only)
 */
export interface AssignPermissionsDTO {
  organizationId: string;
  userId: string;
  rentalObjectId: string;
  permissions: RentalObjectPermission[];
}

/**
 * Query parameters for listing permission assignments
 */
export interface PermissionAssignmentQueryParams extends BaseQueryParams {
  organizationId?: string;
  userId?: string;
  rentalObjectId?: string;
}

/**
 * Create permission assignment request (Org Admin only)
 */
export interface CreatePermissionAssignmentDTO {
  organizationId: string;
  userId: string;
  rentalObjectId: string;
  permissions: RentalObjectPermission[];
}

/**
 * Update permission assignment request
 */
export interface UpdatePermissionAssignmentDTO {
  permissions?: RentalObjectPermission[];
}

// =============================================================================
// Case Handler Scope Entity & DTOs
// =============================================================================

/**
 * Case handler scope - defines which rental objects a handler can manage
 */
export interface CaseHandlerScope extends TenantEntity {
  /** COMMUNE = commune-level handler, ORG = org-level handler */
  scopeType: CaseHandlerScopeType;
  /** Organization ID (required for ORG scope, null for COMMUNE) */
  organizationId?: string;
  /** The case handler user */
  userId: string;
  /** Scoped rental object */
  rentalObjectId: string;
  /** Booking capabilities for this scope */
  capabilities: BookingCapability[];
  /** User who assigned the scope */
  assignedBy: string;
  /** When the scope was assigned */
  assignedAt: string;
}

/**
 * Case handler scope with expanded details
 */
export interface CaseHandlerScopeWithDetails extends CaseHandlerScope {
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  rentalObject: {
    id: string;
    name: string;
  };
}

/**
 * Create case handler scope (Admin only)
 */
export interface CreateCaseHandlerScopeDTO {
  scopeType: CaseHandlerScopeType;
  organizationId?: string;
  userId: string;
  rentalObjectId: string;
  capabilities: BookingCapability[];
}

/**
 * Update case handler scope
 */
export interface UpdateCaseHandlerScopeDTO {
  capabilities?: BookingCapability[];
}

/**
 * Query parameters for listing case handler scopes
 */
export interface CaseHandlerScopeQueryParams extends BaseQueryParams {
  scopeType?: CaseHandlerScopeType;
  organizationId?: string;
  userId?: string;
  rentalObjectId?: string;
}

// =============================================================================
// User Capabilities Projection
// =============================================================================

/**
 * Organization membership in capabilities projection
 */
export interface CapabilityOrgMembership {
  organizationId: string;
  organizationName: string;
  orgRole: OrgMembershipRole;
  status: OrgMembershipStatus;
}

/**
 * Accessible rental object in capabilities projection
 */
export interface AccessibleRentalObject {
  rentalObjectId: string;
  rentalObjectName: string;
  /** Source: direct (commune admin) or via access grant */
  accessSource: 'direct' | 'grant';
  /** Organization ID if access is via grant */
  organizationId?: string;
  /** Per-rental-object permissions for this user */
  permissions: RentalObjectPermission[];
  /** Booking capabilities if user is case handler */
  bookingCapabilities?: BookingCapability[];
}

/**
 * User capabilities projection - returned by GET /backoffice/me/capabilities
 * This is the single source of truth for UI capability-driven rendering
 */
export interface UserCapabilities {
  /** User's system-wide role */
  systemRole: string;
  /** Effective backoffice role (derived from highest privileges) */
  backofficeRole: BackofficeRole;
  /** Tenant ID for isolation */
  tenantId: string;
  /** Organization memberships */
  orgMemberships: CapabilityOrgMembership[];
  /** Rental objects user can access */
  accessibleRentalObjects: AccessibleRentalObject[];
  /** Case handler scopes (if applicable) */
  caseHandlerScopes: {
    scopeType: CaseHandlerScopeType;
    organizationId?: string;
    rentalObjectIds: string[];
    capabilities: BookingCapability[];
  }[];
  /** Global capabilities/features enabled */
  globalCapabilities: {
    canManageAccessGrants: boolean;
    canManageOrgMembers: boolean;
    canAssignPermissions: boolean;
    canAssignCaseHandlers: boolean;
    canViewAllBookings: boolean;
    canBlockTime: boolean;
  };
}

// =============================================================================
// RBAC API Request/Response Types
// =============================================================================

/**
 * Grant access request payload
 */
export interface GrantAccessRequest {
  organizationId: string;
  rentalObjectId: string;
  expiresAt?: string;
  notes?: string;
}

/**
 * Revoke access request payload
 */
export interface RevokeAccessRequest {
  reason?: string;
}

/**
 * Assign permissions request payload
 */
export interface AssignPermissionsRequest {
  orgId: string;
  rentalObjectId: string;
  userId: string;
  permissions: RentalObjectPermission[];
}

/**
 * Assign case handler request payload
 */
export interface AssignCaseHandlerRequest {
  scopeType: CaseHandlerScopeType;
  organizationId?: string;
  userId: string;
  rentalObjectId: string;
  capabilities: BookingCapability[];
}

/**
 * Check permission request
 */
export interface CheckPermissionRequest {
  action: string;
  resource: string;
  resourceId: string;
  context?: Record<string, unknown>;
}

/**
 * Check permission response
 */
export interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
  reasonKey?: string;
  constraints?: Record<string, unknown>;
}

// =============================================================================
// RBAC Query Keys (for React Query cache management)
// =============================================================================

/**
 * Query key factories for RBAC data
 */
export const rbacKeys = {
  all: ['rbac'] as const,
  capabilities: () => [...rbacKeys.all, 'capabilities'] as const,
  accessGrants: (params?: AccessGrantQueryParams) =>
    [...rbacKeys.all, 'access-grants', params] as const,
  accessGrant: (id: string) =>
    [...rbacKeys.all, 'access-grants', id] as const,
  permissionAssignments: (params?: PermissionAssignmentQueryParams) =>
    [...rbacKeys.all, 'permissions', params] as const,
  permissionAssignment: (orgId: string, roId: string, userId: string) =>
    [...rbacKeys.all, 'permissions', orgId, roId, userId] as const,
  caseHandlerScopes: (params?: CaseHandlerScopeQueryParams) =>
    [...rbacKeys.all, 'case-handler-scopes', params] as const,
  orgMemberships: (params?: OrgMembershipQueryParams) =>
    [...rbacKeys.all, 'org-memberships', params] as const,
  orgMembership: (orgId: string, userId: string) =>
    [...rbacKeys.all, 'org-memberships', orgId, userId] as const,
} as const;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a value is a valid BackofficeRole
 */
export function isBackofficeRole(value: string): value is BackofficeRole {
  const validRoles: BackofficeRole[] = [
    'COMMUNE_ADMIN',
    'COMMUNE_CASE_HANDLER',
    'ORG_ADMIN',
    'ORG_CASE_HANDLER',
    'ORG_MEMBER',
  ];
  return validRoles.includes(value as BackofficeRole);
}

/**
 * Check if a value is a valid RentalObjectPermission
 */
export function isRentalObjectPermission(value: string): value is RentalObjectPermission {
  return Object.values(RentalObjectPermission).includes(value as RentalObjectPermission);
}

/**
 * Check if a value is a valid BookingCapability
 */
export function isBookingCapability(value: string): value is BookingCapability {
  return Object.values(BookingCapability).includes(value as BookingCapability);
}

/**
 * Check if user has a specific rental object permission
 */
export function hasRentalObjectPermission(
  permissions: RentalObjectPermission[],
  permission: RentalObjectPermission
): boolean {
  return permissions.includes(permission);
}

/**
 * Check if user has a specific booking capability
 */
export function hasBookingCapability(
  capabilities: BookingCapability[],
  capability: BookingCapability
): boolean {
  return capabilities.includes(capability);
}
