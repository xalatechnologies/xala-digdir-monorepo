/**
 * Authorization Service
 * Single Responsibility: Handle all authorization and RBAC operations
 *
 * This service provides:
 * - User capabilities projection (roles, permissions, scopes)
 * - Permission checking for resources/actions
 * - Role-based access control queries
 */

import { BaseService } from './base.service';
import type {
  UserCapabilities,
  CheckPermissionRequest,
  CheckPermissionResponse,
} from '../types/rbac';
import type { SingleResponse } from '../types/enums';

export class AuthzService extends BaseService {
  constructor() {
    super('/api');
  }

  /**
   * Get current user's capabilities projection
   * Returns all roles, permissions, org memberships, accessible rental objects,
   * case handler scopes, and global capability flags.
   *
   * This is the single source of truth for UI capability-driven rendering.
   * Use this to determine:
   * - Which navigation items to show
   * - Which actions are available on resources
   * - Which routes the user can access
   */
  async getCapabilities(): Promise<SingleResponse<UserCapabilities>> {
    return this.client.get(this.buildPath('/me/capabilities'));
  }

  /**
   * Check if user has permission to perform an action on a resource
   * @param request - The permission check request
   * @returns Whether the action is allowed and any constraints
   */
  async checkPermission(request: CheckPermissionRequest): Promise<SingleResponse<CheckPermissionResponse>> {
    return this.client.post(this.buildPath('/authz/check'), request);
  }

  /**
   * Get user's permissions list
   * Returns an array of permission strings in format "{resource}:{action}"
   */
  async getPermissions(): Promise<SingleResponse<string[]>> {
    return this.client.get(this.buildPath('/authz/permissions'));
  }

  /**
   * Check if user has a specific permission
   * @param permission - Permission string in format "{resource}:{action}"
   * @returns Whether the user has the permission
   */
  async hasPermission(permission: string): Promise<SingleResponse<{ allowed: boolean }>> {
    return this.client.get(this.buildPath('/authz/permissions/check'), {
      params: { permission },
    });
  }

  /**
   * Get user's effective role for a specific context
   * @param context - Optional context (e.g., organizationId)
   * @returns The user's effective role in that context
   */
  async getEffectiveRole(context?: { organizationId?: string }): Promise<SingleResponse<{ role: string; permissions: string[] }>> {
    return this.client.get(this.buildPath('/authz/role'), {
      params: context as Record<string, string>,
    });
  }
}

// Singleton instance
export const authzService = new AuthzService();
