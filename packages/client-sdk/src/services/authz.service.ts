/**
 * Authorization Service
 * Provides RBAC (Role-Based Access Control) operations
 * 
 * Endpoints:
 * - GET /api/authz/permissions - Get current user's permissions
 * - GET /api/authz/check - Check specific permission
 */

import { BaseService } from './base.service';
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

/**
 * Authorization Service
 * Handles RBAC permission queries
 */
export class AuthzService extends BaseService {
  constructor() {
    super('/api/authz');
  }

  /**
   * Get current user's permissions
   * Returns role, flat permission strings, and resource-action mapping
   */
  async getPermissions(): Promise<SingleResponse<UserPermissionsDTO>> {
    return this.client.get(this.buildPath('/permissions'));
  }

  /**
   * Check if user has specific permission
   * @param resource - Resource to check (e.g., 'bookings', 'rental-objects')
   * @param action - Action to check (e.g., 'create', 'read', 'update')
   */
  async checkPermission(
    resource: AuthzResource,
    action: AuthzAction
  ): Promise<SingleResponse<PermissionCheckResultDTO>> {
    return this.client.get(this.buildPath('/check'), {
      params: { resource, action },
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
    const permissionSet = new Set(permissions.data.permissions);
    
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
    const result = await this.checkPermission(resource, action);
    return result.data.allowed;
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getPermissions();
    const permissionSet = new Set(userPermissions.data.permissions);
    return permissions.some(p => permissionSet.has(p));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getPermissions();
    const permissionSet = new Set(userPermissions.data.permissions);
    return permissions.every(p => permissionSet.has(p));
  }
}

export const authzService = new AuthzService();
