/**
 * Backoffice Organization Contracts (DTOs)
 * Contract-first types for municipal/partner organization management
 * 
 * Reference: docs/roles/prd.md - Section 3.1 (Backoffice Organizations)
 */

// =============================================================================
// Organization Types
// =============================================================================

export type BackofficeOrganizationType = 'MUNICIPAL_UNIT' | 'PARTNER_ORG' | 'UMBRELLA_ORG';
export type BackofficeOrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type BackofficeMemberRole = 'ADMIN' | 'MEMBER' | 'VIEWER';
export type BackofficeMemberStatus = 'ACTIVE' | 'SUSPENDED';
export type BackofficeAssignmentType = 'OWNED' | 'MANAGED' | 'DELEGATED';
export type BackofficeAssignmentStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

// =============================================================================
// Organization DTOs
// =============================================================================

export interface BackofficeOrganizationDTO {
  id: string;
  tenantId: string;
  name: string;
  type: BackofficeOrganizationType;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: BackofficeOrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  type: BackofficeOrganizationType;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: BackofficeOrganizationStatus;
}

// =============================================================================
// Organization Member DTOs
// =============================================================================

export interface OrganizationMemberDTO {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: BackofficeMemberRole;
  capabilities: string[];
  status: BackofficeMemberStatus;
  joinedAt: string;
  leftAt?: string;
}

export interface AddMemberRequest {
  userId: string;
  role: BackofficeMemberRole;
  capabilities?: string[];
}

export interface UpdateMemberRequest {
  role?: BackofficeMemberRole;
  capabilities?: string[];
  status?: BackofficeMemberStatus;
}

// =============================================================================
// Rental Object Assignment DTOs
// =============================================================================

export interface RentalObjectAssignmentDTO {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  organizationId: string;
  assignmentType: BackofficeAssignmentType;
  canEdit: boolean;
  canApproveBookings: boolean;
  canManageAvailability: boolean;
  canManagePricing: boolean;
  status: BackofficeAssignmentStatus;
  assignedAt: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface AssignRentalObjectRequest {
  rentalObjectId: string;
  assignmentType?: BackofficeAssignmentType;
  canEdit?: boolean;
  canApproveBookings?: boolean;
  canManageAvailability?: boolean;
  canManagePricing?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface UpdateAssignmentRequest {
  assignmentType?: BackofficeAssignmentType;
  canEdit?: boolean;
  canApproveBookings?: boolean;
  canManageAvailability?: boolean;
  canManagePricing?: boolean;
  status?: BackofficeAssignmentStatus;
}

// =============================================================================
// List/Filter DTOs
// =============================================================================

export interface OrganizationListParams {
  status?: BackofficeOrganizationStatus;
  type?: BackofficeOrganizationType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrganizationStatsDTO {
  totalOrganizations: number;
  activeOrganizations: number;
  totalMembers: number;
  totalAssignedRentalObjects: number;
  byType: {
    MUNICIPAL_UNIT: number;
    PARTNER_ORG: number;
    UMBRELLA_ORG: number;
  };
}
