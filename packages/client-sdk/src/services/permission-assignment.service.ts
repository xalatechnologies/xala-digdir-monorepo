/**
 * Permission Assignment Service
 * Single Responsibility: Handle permission assignment operations for RBAC
 *
 * Permission assignments grant specific per-rental-object permissions to org members.
 * Only Org Admins can create/update/revoke permission assignments.
 * Permission assignments require an active access grant to the rental object.
 */

import { BaseService } from './base.service';
import type {
  PermissionAssignment,
  PermissionAssignmentWithDetails,
  AssignPermissionsDTO,
  PermissionAssignmentQueryParams,
  RentalObjectPermission,
} from '../types/rbac';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class PermissionAssignmentService extends BaseService {
  constructor() {
    super('/api/permission-assignments');
  }

  /**
   * Get paginated permission assignments
   * Org Admin: sees all assignments for their organization
   */
  async getAll(params?: PermissionAssignmentQueryParams): Promise<PaginatedResponse<PermissionAssignmentWithDetails>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single permission assignment by ID
   */
  async getById(id: string): Promise<SingleResponse<PermissionAssignmentWithDetails>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get permission assignments for a specific organization
   */
  async getByOrganization(organizationId: string, params?: PermissionAssignmentQueryParams): Promise<PaginatedResponse<PermissionAssignmentWithDetails>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, organizationId } as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get permission assignments for a specific user
   */
  async getByUser(userId: string, params?: PermissionAssignmentQueryParams): Promise<PaginatedResponse<PermissionAssignmentWithDetails>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, userId } as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get permission assignments for a specific rental object
   */
  async getByRentalObject(rentalObjectId: string, params?: PermissionAssignmentQueryParams): Promise<PaginatedResponse<PermissionAssignmentWithDetails>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, rentalObjectId } as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get permission assignment for a specific user on a rental object
   * Uses the nested API path: /api/organizations/:orgId/rental-objects/:roId/permissions/:userId
   */
  async getByMember(
    organizationId: string,
    rentalObjectId: string,
    userId: string
  ): Promise<SingleResponse<PermissionAssignmentWithDetails>> {
    return this.client.get(`/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${userId}`);
  }

  /**
   * Assign or update permissions for a user on a rental object (Org Admin only)
   * Creates a new assignment or updates existing permissions
   * Requires an active access grant for the organization to the rental object
   */
  async assign(data: AssignPermissionsDTO): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.put(
      `/api/organizations/${data.organizationId}/rental-objects/${data.rentalObjectId}/permissions/${data.userId}`,
      { permissions: data.permissions }
    );
  }

  /**
   * Create permission assignment (Org Admin only)
   * Alternative method using the base path
   */
  async create(data: AssignPermissionsDTO): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update permission assignment (Org Admin only)
   */
  async update(id: string, permissions: RentalObjectPermission[]): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.patch(this.buildPath(`/${id}`), { permissions });
  }

  /**
   * Revoke all permissions for a user on a rental object (Org Admin only)
   * Soft-deletes the assignment, preserving audit trail
   */
  async revoke(
    organizationId: string,
    rentalObjectId: string,
    userId: string,
    reason?: string
  ): Promise<SuccessResponse> {
    return this.client.delete(
      `/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${userId}`,
      { body: { reason } }
    );
  }

  /**
   * Delete permission assignment by ID (Org Admin only)
   */
  async deleteById(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Get available permissions that can be assigned
   * Returns the list of RentalObjectPermission values with descriptions
   */
  async getAvailablePermissions(): Promise<SingleResponse<{
    permission: RentalObjectPermission;
    name: string;
    description: string;
    requiresAdmin: boolean;
  }[]>> {
    return this.client.get(this.buildPath('/available'));
  }

  /**
   * Check if a user has specific permission on a rental object
   */
  async checkPermission(
    organizationId: string,
    userId: string,
    rentalObjectId: string,
    permission: RentalObjectPermission
  ): Promise<SingleResponse<{ hasPermission: boolean; assignment?: PermissionAssignment }>> {
    return this.client.get(this.buildPath('/check'), {
      params: { organizationId, userId, rentalObjectId, permission },
    });
  }

  /**
   * Get all permissions for a user across all rental objects in an organization
   */
  async getUserPermissionsSummary(
    organizationId: string,
    userId: string
  ): Promise<SingleResponse<{
    rentalObjectId: string;
    rentalObjectName: string;
    permissions: RentalObjectPermission[];
  }[]>> {
    return this.client.get(`/api/organizations/${organizationId}/members/${userId}/permissions`);
  }

  /**
   * Bulk assign permissions to multiple users on a rental object (Org Admin only)
   */
  async bulkAssign(
    organizationId: string,
    rentalObjectId: string,
    assignments: { userId: string; permissions: RentalObjectPermission[] }[]
  ): Promise<SingleResponse<PermissionAssignment[]>> {
    return this.client.post(
      `/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/bulk`,
      { assignments }
    );
  }

  /**
   * Copy permissions from one user to another on a rental object (Org Admin only)
   */
  async copyPermissions(
    organizationId: string,
    rentalObjectId: string,
    fromUserId: string,
    toUserId: string
  ): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.post(
      `/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/copy`,
      { fromUserId, toUserId }
    );
  }
}

// Singleton instance
export const permissionAssignmentService = new PermissionAssignmentService();
