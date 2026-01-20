/**
 * Permission Assignment Service
 * Handles RBAC permission assignment and management
 */

import { BaseService } from './base.service';
import type {
  PermissionAssignment,
  CreatePermissionAssignmentDTO,
  UpdatePermissionAssignmentDTO,
  PermissionAssignmentQueryParams,
  PaginatedResponse,
  SingleResponse,
} from '@/types';

export class PermissionAssignmentService extends BaseService {
  constructor() {
    super('/api/permission-assignment');
  }

  /**
   * Get all permission assignments
   */
  async getAll(params?: PermissionAssignmentQueryParams): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get permission assignments for a user
   */
  async getForUser(userId: string): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(`/user/${userId}`));
  }

  /**
   * Get permission assignments for an organization
   */
  async getForOrganization(organizationId: string): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(`/organization/${organizationId}`));
  }

  /**
   * Get permission assignments for an organization (alias)
   */
  async getByOrganization(organizationId: string, _params?: PermissionAssignmentQueryParams): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.getForOrganization(organizationId);
  }

  /**
   * Get single permission assignment by ID
   */
  async getById(id: string): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create permission assignment
   */
  async create(data: CreatePermissionAssignmentDTO): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update permission assignment
   */
  async update(id: string, data: UpdatePermissionAssignmentDTO): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete permission assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    await this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Bulk assign permissions to user
   */
  async bulkAssign(userId: string, permissions: string[]): Promise<SingleResponse<{
    assigned: number;
    failed: string[];
  }>> {
    return this.client.post(this.buildPath('/bulk'), { userId, permissions });
  }

  /**
   * Revoke all permissions for user
   */
  async revokeAll(userId: string): Promise<SingleResponse<void>> {
    return this.client.post(this.buildPath(`/user/${userId}/revoke-all`), {});
  }

  /**
   * Get effective permissions for user (including inherited)
   */
  async getEffectivePermissions(userId: string): Promise<SingleResponse<{
    direct: string[];
    inherited: string[];
    effective: string[];
  }>> {
    return this.client.get(this.buildPath(`/user/${userId}/effective`));
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(userId: string, permission: string): Promise<SingleResponse<{
    hasPermission: boolean;
    source: 'direct' | 'inherited' | 'none';
  }>> {
    return this.client.post(this.buildPath('/check'), { userId, permission });
  }

  /**
   * Get permission audit log
   */
  async getAuditLog(userId: string): Promise<PaginatedResponse<{
    action: 'granted' | 'revoked';
    permission: string;
    grantedBy: string;
    timestamp: string;
  }>> {
    return this.client.get(this.buildPath(`/user/${userId}/audit`));
  }

  /**
   * Get permissions for a user
   */
  async getByUser(userId: string): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(`/user/${userId}`));
  }

  /**
   * Get permissions for a rental object
   */
  async getByRentalObject(orgId: string, rentalObjectId: string): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(`/org/${orgId}/rental-object/${rentalObjectId}`));
  }

  /**
   * Get permissions for an org member
   */
  async getByMember(orgId: string, userId: string): Promise<PaginatedResponse<PermissionAssignment>> {
    return this.client.get(this.buildPath(`/org/${orgId}/member/${userId}`));
  }

  /**
   * Get user permissions summary
   */
  async getUserPermissionsSummary(userId: string): Promise<SingleResponse<{
    direct: string[];
    inherited: string[];
    effective: string[];
  }>> {
    return this.client.get(this.buildPath(`/user/${userId}/summary`));
  }

  /**
   * Get available permissions
   */
  async getAvailablePermissions(): Promise<SingleResponse<string[]>> {
    return this.client.get(this.buildPath('/available'));
  }

  /**
   * Assign permissions to a user for a rental object
   */
  async assign(data: CreatePermissionAssignmentDTO): Promise<SingleResponse<PermissionAssignment>> {
    return this.client.post(this.buildPath('/assign'), data);
  }

  /**
   * Revoke a permission assignment
   */
  async revoke(id: string): Promise<void> {
    await this.client.post(this.buildPath(`/${id}/revoke`), {});
  }

  /**
   * Delete a permission assignment
   */
  async deleteById(id: string): Promise<void> {
    await this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Copy permissions from one user to another
   */
  async copyPermissions(data: {
    sourceUserId: string;
    targetUserId: string;
    orgId: string;
  }): Promise<SingleResponse<{ copied: number }>> {
    return this.client.post(this.buildPath('/copy'), data);
  }
}

export const permissionAssignmentService = new PermissionAssignmentService();

