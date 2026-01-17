/**
 * Tenant Admin User Management Service
 * Single Responsibility: Handle tenant-admin-specific user management operations
 *
 * This service provides admin-level user management capabilities including:
 * - User invitations
 * - Role assignments
 * - Organization assignments
 * - Scope delegation
 * - Effective permissions calculation
 */

import { BaseService } from './base.service';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

// =============================================================================
// Types
// =============================================================================

export interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  invitedAt?: string;
  invitedBy?: string;
}

export type UserRole =
  | 'BO-TENANT-ADMIN'
  | 'BO-ORG-ADMIN'
  | 'BO-ORG-MEMBER'
  | 'BO-CASE-HANDLER';

export type UserStatus =
  | 'active'
  | 'suspended'
  | 'pending_invite'
  | 'inactive';

export interface InviteUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  sendEmail?: boolean;
}

export interface AssignRoleDTO {
  userId: string;
  role: UserRole;
}

export interface AssignOrganizationDTO {
  userId: string;
  organizationId: string;
  role?: UserRole;
}

export interface DelegateScope {
  scopeType: 'organization' | 'rental_object' | 'category';
  scopeId: string;
  permissions: string[];
}

export interface AssignScopeDTO {
  userId: string;
  scopes: DelegateScope[];
}

export interface EffectivePermissions {
  userId: string;
  role: UserRole;
  permissions: string[];
  scopes: DelegateScope[];
  inheritedFrom?: {
    organizationId?: string;
    parentUserId?: string;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  organizationId?: string;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
}

export interface ResendInvitationDTO {
  invitationId: string;
}

export interface CancelInvitationDTO {
  invitationId: string;
  reason?: string;
}

// =============================================================================
// Service
// =============================================================================

export class TenantAdminUserService extends BaseService {
  constructor() {
    super('/api/admin/users');
  }

  /**
   * Get paginated users with advanced filters
   * Tenant admin can see all users in their tenant
   */
  async getAll(params?: UserQueryParams): Promise<PaginatedResponse<TenantUser>> {
    return this.client.get(this.buildPath(), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Get single user by ID with full details
   */
  async getById(id: string): Promise<SingleResponse<TenantUser>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Invite new user to tenant
   * Sends invitation email with activation link
   */
  async inviteUser(data: InviteUserDTO): Promise<SingleResponse<UserInvitation>> {
    return this.client.post(this.buildPath('/invite'), data);
  }

  /**
   * Get all pending invitations
   */
  async getInvitations(params?: {
    status?: 'pending' | 'expired';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserInvitation>> {
    return this.client.get(this.buildPath('/invitations'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(data: ResendInvitationDTO): Promise<SuccessResponse> {
    return this.client.post(
      this.buildPath(`/invitations/${data.invitationId}/resend`)
    );
  }

  /**
   * Cancel pending invitation
   */
  async cancelInvitation(data: CancelInvitationDTO): Promise<SuccessResponse> {
    return this.client.post(
      this.buildPath(`/invitations/${data.invitationId}/cancel`),
      { reason: data.reason }
    );
  }

  /**
   * Assign role to user
   * Tenant admin can assign any backoffice role
   */
  async assignRole(data: AssignRoleDTO): Promise<SingleResponse<TenantUser>> {
    return this.client.post(
      this.buildPath(`/${data.userId}/role`),
      { role: data.role }
    );
  }

  /**
   * Assign user to organization
   */
  async assignToOrganization(data: AssignOrganizationDTO): Promise<SuccessResponse> {
    return this.client.post(
      this.buildPath(`/${data.userId}/organization`),
      {
        organizationId: data.organizationId,
        role: data.role
      }
    );
  }

  /**
   * Remove user from organization
   */
  async removeFromOrganization(userId: string, organizationId: string): Promise<SuccessResponse> {
    return this.client.delete(
      this.buildPath(`/${userId}/organization/${organizationId}`)
    );
  }

  /**
   * Delegate scopes to user
   * Scopes define what organizations/rental objects the user can manage
   */
  async assignScopes(data: AssignScopeDTO): Promise<SuccessResponse> {
    return this.client.post(
      this.buildPath(`/${data.userId}/scopes`),
      { scopes: data.scopes }
    );
  }

  /**
   * Get effective permissions for user
   * Calculates all permissions based on role + scopes + inheritance
   */
  async getEffectivePermissions(userId: string): Promise<SingleResponse<EffectivePermissions>> {
    return this.client.get(this.buildPath(`/${userId}/effective-permissions`));
  }

  /**
   * Deactivate user
   * User cannot login but data is preserved
   */
  async deactivate(userId: string, reason?: string): Promise<SuccessResponse> {
    return this.client.post(
      this.buildPath(`/${userId}/deactivate`),
      { reason }
    );
  }

  /**
   * Reactivate user
   * Restore access for previously deactivated user
   */
  async reactivate(userId: string): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/${userId}/reactivate`));
  }

  /**
   * Suspend user temporarily
   * Similar to deactivate but explicitly temporary
   */
  async suspend(userId: string, reason: string, expiresAt?: string): Promise<SuccessResponse> {
    return this.client.post(
      this.buildPath(`/${userId}/suspend`),
      { reason, expiresAt }
    );
  }

  /**
   * Unsuspend user
   */
  async unsuspend(userId: string): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/${userId}/unsuspend`));
  }

  /**
   * Get user activity log
   * Audit trail of user actions
   */
  async getActivityLog(userId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<any>> {
    return this.client.get(
      this.buildPath(`/${userId}/activity`),
      { params: params as Record<string, string | number | boolean> }
    );
  }

  /**
   * Bulk operations
   */
  async bulkInvite(users: InviteUserDTO[]): Promise<SingleResponse<{
    invited: TenantUser[];
    failed: Array<{ email: string; error: string }>;
  }>> {
    return this.client.post(this.buildPath('/bulk-invite'), { users });
  }

  async bulkDeactivate(userIds: string[], reason?: string): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/bulk-deactivate'), {
      userIds,
      reason
    });
  }

  async bulkAssignRole(userIds: string[], role: UserRole): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/bulk-assign-role'), {
      userIds,
      role
    });
  }
}

// Singleton instance
export const tenantAdminUserService = new TenantAdminUserService();
