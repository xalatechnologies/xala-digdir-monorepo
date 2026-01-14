/**
 * Organization & User Types
 * Single Responsibility: Organization and user entities
 */

import type { TenantEntity, OrganizationStatus, ActorType, UserStatus, UserRole, BaseQueryParams } from './enums';

// =============================================================================
// Organization Entity
// =============================================================================

export interface Organization extends TenantEntity {
  name: string;
  organizationNumber?: string;
  actorType: ActorType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  status: OrganizationStatus;
  verified: boolean;
  metadata?: Record<string, unknown>;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'member';
  user?: User;
  joinedAt: string;
}

// =============================================================================
// Organization DTOs
// =============================================================================

export interface CreateOrganizationDTO {
  name: string;
  organizationNumber?: string;
  actorType?: ActorType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  status?: OrganizationStatus;
}

export interface OrganizationQueryParams extends BaseQueryParams {
  status?: OrganizationStatus;
  search?: string;
}

// =============================================================================
// User Entity
// =============================================================================

export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface User extends TenantEntity {
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  invoiceAddress?: Address;
  residenceAddress?: Address;
  dateOfBirth?: string;
  nationalId?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// User DTOs
// =============================================================================

export interface CreateUserDTO {
  email: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  avatar?: string;
  invoiceAddress?: Address;
  residenceAddress?: Address;
  dateOfBirth?: string;
  nationalId?: string;
}

export interface UserQueryParams extends BaseQueryParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

// =============================================================================
// GDPR Types
// =============================================================================

export interface GdprDataExport {
  user: User;
  bookings: unknown[];
  conversations: unknown[];
  organizations: Organization[];
  auditEvents: unknown[];
  exportedAt: string;
}

export interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  updatedAt: string;
}
