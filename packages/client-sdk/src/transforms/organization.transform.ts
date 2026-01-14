/**
 * Organization & User Transformers
 *
 * Reusable transformation utilities for organization and user data.
 * Used by web, backoffice, and minside apps.
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
// Transform Utilities
// =============================================================================

const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  KOMMUNE: 'Kommune',
  ORGANIZATION: 'Organisasjon',
  COMPANY: 'Bedrift',
  PRIVATE: 'Privatperson',
  NONPROFIT: 'Veldedig organisasjon',
  SPORTS_CLUB: 'Idrettslag',
  SCHOOL: 'Skole',
  OTHER: 'Annet',
};

const ORGANIZATION_STATUS_LABELS: Record<OrganizationStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  pending: 'Venter',
  suspended: 'Suspendert',
};

const ORGANIZATION_STATUS_COLORS: Record<OrganizationStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  suspended: 'danger',
};

const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  backoffice: 'Backoffice',
  user: 'Bruker',
  readonly: 'Kun lesing',
};

const USER_ROLE_COLORS: Record<UserRole, 'success' | 'warning' | 'danger' | 'neutral'> = {
  admin: 'danger',
  backoffice: 'warning',
  user: 'success',
  readonly: 'neutral',
};

const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  suspended: 'Suspendert',
  pending: 'Venter',
};

const USER_STATUS_COLORS: Record<UserStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
  pending: 'warning',
};

const MEMBER_ROLE_LABELS: Record<'admin' | 'member', string> = {
  admin: 'Administrator',
  member: 'Medlem',
};

/**
 * Get display label for actor type
 */
export function getActorTypeLabel(type: ActorType): string {
  return ACTOR_TYPE_LABELS[type] || type;
}

/**
 * Get display label for organization status
 */
export function getOrganizationStatusLabel(status: OrganizationStatus): string {
  return ORGANIZATION_STATUS_LABELS[status] || status;
}

/**
 * Get color for organization status
 */
export function getOrganizationStatusColor(status: OrganizationStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return ORGANIZATION_STATUS_COLORS[status] || 'neutral';
}

/**
 * Get display label for user role
 */
export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] || role;
}

/**
 * Get color for user role
 */
export function getUserRoleColor(role: UserRole): 'success' | 'warning' | 'danger' | 'neutral' {
  return USER_ROLE_COLORS[role] || 'neutral';
}

/**
 * Get display label for user status
 */
export function getUserStatusLabel(status: UserStatus): string {
  return USER_STATUS_LABELS[status] || status;
}

/**
 * Get color for user status
 */
export function getUserStatusColor(status: UserStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return USER_STATUS_COLORS[status] || 'neutral';
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
 */
export function transformAddress(address?: Address): TransformedAddress | undefined {
  if (!address) return undefined;

  const parts: string[] = [];
  if (address.street) parts.push(address.street);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);

  const formatted = parts.length > 0 ? parts.join(', ') : 'Ingen adresse registrert';

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
    verifiedLabel: organization.verified ? 'Verifisert' : 'Ikke verifisert',

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
    roleLabel: MEMBER_ROLE_LABELS[member.role],
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
