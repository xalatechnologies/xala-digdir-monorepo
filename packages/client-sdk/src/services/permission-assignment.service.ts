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
} from '../types';

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
  async delete(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
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
}

export const permissionAssignmentService = new PermissionAssignmentService();
