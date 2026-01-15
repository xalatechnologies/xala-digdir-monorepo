/**
 * Organization & User Transformers
 *
 * Reusable transformation utilities for organization and user data.
 * Used by web, backoffice, and minside apps.
 * 
 * Note: All labels are returned as i18n translation keys.
 * Use your app's t() function to resolve them.
 */

import type {
  Organization,
  OrganizationStatus,
  User,
  UserRole,
  UserStatus,
  ActorType,
  Address,
  OrganizationMember,
} from '../types';
import {
  ACTOR_TYPE_KEYS,
  ORGANIZATION_STATUS_KEYS,
  USER_ROLE_KEYS,
  USER_STATUS_KEYS,
  MEMBER_ROLE_KEYS,
  VERIFICATION_KEYS,
  PLACEHOLDER_KEYS,
} from '../localization/keys';

// =============================================================================
// UI Types for Transformed Organizations
// =============================================================================

export interface TransformedOrganization {
  // Core
  id: string;
  tenantId: string;
  name: string;
  organizationNumber?: string;
  actorType: ActorType;
  actorTypeLabel: string;

  // Contact
  email?: string;
  phone?: string;

  // Address
  address?: string;
  city?: string;
  postalCode?: string;
  formattedAddress?: string;

  // Status
  status: OrganizationStatus;
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'danger' | 'neutral';
  verified: boolean;
  verifiedLabel: string;

  // Metadata
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface TransformedOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'member';
  roleLabel: string;
  user?: TransformedUser;
  joinedAt: string;
  joinedAtFormatted: string;
}

// =============================================================================
// UI Types for Transformed Users
// =============================================================================

export interface TransformedAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  formatted: string;
}

export interface TransformedUser {
  // Core
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;

  // Role & Status
  role: UserRole;
  roleLabel: string;
  roleColor: 'success' | 'warning' | 'danger' | 'neutral';
  status: UserStatus;
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'danger' | 'neutral';

  // Addresses
  invoiceAddress?: TransformedAddress;
  residenceAddress?: TransformedAddress;

  // Personal
  dateOfBirth?: string;
  dateOfBirthFormatted?: string;
  age?: number;
  nationalId?: string;

  // Activity
  lastLoginAt?: string;
  lastLoginFormatted?: string;

  // Metadata
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Status Colors (semantic)
// =============================================================================

const ORGANIZATION_STATUS_COLORS: Record<OrganizationStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
};

const USER_ROLE_COLORS: Record<UserRole, 'success' | 'warning' | 'danger' | 'neutral'> = {
  super_admin: 'danger',
  admin: 'warning',
  saksbehandler: 'neutral',
  user: 'success',
};

const USER_STATUS_COLORS: Record<UserStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
};

// =============================================================================
// Label Functions (return i18n keys)
// =============================================================================

/**
 * Get i18n key for actor type label
 * Use t(key) to resolve the actual label
 */
export function getActorTypeLabel(type: ActorType): string {
  return ACTOR_TYPE_KEYS[type] ?? `sdk.actorType.${type}`;
}

/**
 * Get i18n key for organization status label
 * Use t(key) to resolve the actual label
 */
export function getOrganizationStatusLabel(status: OrganizationStatus): string {
  return ORGANIZATION_STATUS_KEYS[status] ?? `sdk.organization.status.${status}`;
}

/**
 * Get semantic color for organization status
 */
export function getOrganizationStatusColor(status: OrganizationStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return ORGANIZATION_STATUS_COLORS[status] ?? 'neutral';
}

/**
 * Get i18n key for user role label
 * Use t(key) to resolve the actual label
 */
export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_KEYS[role] ?? `sdk.user.role.${role}`;
}

/**
 * Get semantic color for user role
 */
export function getUserRoleColor(role: UserRole): 'success' | 'warning' | 'danger' | 'neutral' {
  return USER_ROLE_COLORS[role] ?? 'neutral';
}

/**
 * Get i18n key for user status label
 * Use t(key) to resolve the actual label
 */
export function getUserStatusLabel(status: UserStatus): string {
  return USER_STATUS_KEYS[status] ?? `sdk.user.status.${status}`;
}

/**
 * Get semantic color for user status
 */
export function getUserStatusColor(status: UserStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return USER_STATUS_COLORS[status] ?? 'neutral';
}

/**
 * Get i18n key for member role label
 * Use t(key) to resolve the actual label
 */
export function getMemberRoleLabel(role: 'admin' | 'member'): string {
  return MEMBER_ROLE_KEYS[role] ?? `sdk.member.role.${role}`;
}

/**
 * Get i18n key for verification status
 * Use t(key) to resolve the actual label
 */
export function getVerificationLabel(verified: boolean): string {
  return verified ? VERIFICATION_KEYS.verified : VERIFICATION_KEYS.notVerified;
}

/**
 * Format date to Norwegian format
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Transform address to formatted string
 * Returns i18n key for placeholder when no address
 */
export function transformAddress(address?: Address): TransformedAddress | undefined {
  if (!address) return undefined;

  const parts: string[] = [];
  if (address.street) parts.push(address.street);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);

  // Return i18n key for placeholder when no address parts
  const formatted = parts.length > 0 ? parts.join(', ') : PLACEHOLDER_KEYS.noAddress;

  return {
    ...address,
    formatted,
  };
}

// =============================================================================
// Main Transform Functions
// =============================================================================

/**
 * Transform a raw API organization to a UI-friendly format
 */
export function transformOrganization(organization: Organization): TransformedOrganization {
  const addressParts: string[] = [];
  if (organization.address) addressParts.push(organization.address);
  if (organization.postalCode) addressParts.push(organization.postalCode);
  if (organization.city) addressParts.push(organization.city);

  return {
    // Core
    id: organization.id,
    tenantId: organization.tenantId,
    name: organization.name,
    organizationNumber: organization.organizationNumber,
    actorType: organization.actorType,
    actorTypeLabel: getActorTypeLabel(organization.actorType),

    // Contact
    email: organization.email,
    phone: organization.phone,

    // Address
    address: organization.address,
    city: organization.city,
    postalCode: organization.postalCode,
    formattedAddress: addressParts.length > 0 ? addressParts.join(', ') : undefined,

    // Status
    status: organization.status,
    statusLabel: getOrganizationStatusLabel(organization.status),
    statusColor: getOrganizationStatusColor(organization.status),
    verified: organization.verified,
    verifiedLabel: getVerificationLabel(organization.verified),

    // Metadata
    metadata: organization.metadata,

    // Timestamps
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
}

/**
 * Transform multiple organizations
 */
export function transformOrganizations(organizations: Organization[]): TransformedOrganization[] {
  return organizations.map(transformOrganization);
}

/**
 * Transform organization member
 */
export function transformOrganizationMember(member: OrganizationMember): TransformedOrganizationMember {
  return {
    id: member.id,
    organizationId: member.organizationId,
    userId: member.userId,
    role: member.role,
    roleLabel: getMemberRoleLabel(member.role),
    user: member.user ? transformUser(member.user) : undefined,
    joinedAt: member.joinedAt,
    joinedAtFormatted: formatDate(member.joinedAt),
  };
}

/**
 * Transform multiple organization members
 */
export function transformOrganizationMembers(members: OrganizationMember[]): TransformedOrganizationMember[] {
  return members.map(transformOrganizationMember);
}

/**
 * Transform a raw API user to a UI-friendly format
 */
export function transformUser(user: User): TransformedUser {
  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : undefined;

  return {
    // Core
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,

    // Role & Status
    role: user.role,
    roleLabel: getUserRoleLabel(user.role),
    roleColor: getUserRoleColor(user.role),
    status: user.status,
    statusLabel: getUserStatusLabel(user.status),
    statusColor: getUserStatusColor(user.status),

    // Addresses
    invoiceAddress: transformAddress(user.invoiceAddress),
    residenceAddress: transformAddress(user.residenceAddress),

    // Personal
    dateOfBirth: user.dateOfBirth,
    dateOfBirthFormatted: user.dateOfBirth ? formatDate(user.dateOfBirth) : undefined,
    age,
    nationalId: user.nationalId,

    // Activity
    lastLoginAt: user.lastLoginAt,
    lastLoginFormatted: user.lastLoginAt ? formatDate(user.lastLoginAt) : undefined,

    // Metadata
    metadata: user.metadata,

    // Timestamps
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Transform multiple users
 */
export function transformUsers(users: User[]): TransformedUser[] {
  return users.map(transformUser);
}
