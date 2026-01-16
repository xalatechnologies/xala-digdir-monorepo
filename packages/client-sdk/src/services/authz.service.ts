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

/**
 * User role type for authz (distinct from general UserRole in types/enums)
 */
export type AuthzUserRole = 'admin' | 'saksbehandler' | 'user';

/**
 * Resource types for permission checking
 */
export type AuthzResource =
  | 'dashboard'
  | 'rental-objects'
  | 'bookings'
  | 'users'
  | 'organizations'
  | 'reports'
  | 'settings'
  | 'calendar'
  | 'messages'
  | 'seasonal-leases'
  | 'audit';

/**
 * Action types for permission checking
 */
export type AuthzAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'archive'
  | 'confirm'
  | 'cancel'
  | 'verify'
  | 'export'
  | 'write'
  | 'block'
  | 'resolve'
  | 'terminate'
  | 'deactivate'
  | 'reactivate';

/**
 * User permissions response DTO
 */
export interface UserPermissionsDTO {
  role: AuthzUserRole;
  permissions: string[];
  resources: Record<string, string[]>;
}

/**
 * Permission check result DTO
 */
export interface PermissionCheckResultDTO {
  allowed: boolean;
  role: AuthzUserRole | 'anonymous';
  permissions: string[];
}

/**
 * Permission check parameters
 */
export interface PermissionCheckParams {
  resource: AuthzResource;
  action: AuthzAction;
}

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
   * Check permission using simple resource/action parameters
   * @param resource - Resource to check (e.g., 'bookings', 'rental-objects')
   * @param action - Action to check (e.g., 'create', 'read', 'update')
   */
  async checkPermissionSimple(
    resource: AuthzResource,
    action: AuthzAction
  ): Promise<SingleResponse<PermissionCheckResultDTO>> {
    return this.client.get(this.buildPath('/authz/check'), {
      params: { resource, action },
    });
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

  /**
   * Check multiple permissions at once
   * Returns a map of permission strings to boolean results
   */
  async checkPermissions(
    checks: PermissionCheckParams[]
  ): Promise<SingleResponse<Record<string, boolean>>> {
    const permissions = await this.getPermissions();
    const permissionSet = new Set(permissions.data);

    const results: Record<string, boolean> = {};
    for (const { resource, action } of checks) {
      const permString = `${resource}:${action}`;
      results[permString] = permissionSet.has(permString);
    }

    return { data: results };
  }

  /**
   * Check if user can perform action on resource
   * Convenience method for simple permission checks
   */
  async can(resource: AuthzResource, action: AuthzAction): Promise<boolean> {
    const result = await this.checkPermissionSimple(resource, action);
    return result.data.allowed;
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getPermissions();
    const permissionSet = new Set(userPermissions.data);
    return permissions.some(p => permissionSet.has(p));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getPermissions();
    const permissionSet = new Set(userPermissions.data);
    return permissions.every(p => permissionSet.has(p));
  }
}

// Singleton instance
export const authzService = new AuthzService();
