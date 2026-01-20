/**
 * User Group Service
 * User group management and current user's group
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '@/types/enums';

// =============================================================================
// Types
// =============================================================================

/**
 * User group classification codes
 * - U19: Users under 19 years old
 * - ADULT_ORG: Adult organization members
 * - OTHER: Other user groups
 */
export type UserGroupCode = 'U19' | 'ADULT_ORG' | 'OTHER';

/**
 * User group entity
 */
export interface UserGroup {
  id: string;
  code: UserGroupCode;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parameters for creating a new user group
 */
export interface CreateUserGroupDTO {
  code: UserGroupCode;
  name: string;
  description?: string;
}

/**
 * Current user's user group assignment
 */
export interface CurrentUserGroup {
  userGroupId: string | null;
  userGroup: UserGroup | null;
}

// =============================================================================
// User Group Service (for current user)
// =============================================================================

export class UserGroupService extends BaseService {
  constructor() {
    super('/me');
  }

  /**
   * Get current user's user group assignment
   * Returns the user group that the current authenticated user belongs to.
   * In development mode, can override via query params or headers for testing.
   *
   * @param options - Optional override parameters for development/testing
   * @param options.userGroupId - Override user group by ID (dev mode only)
   * @param options.userGroupCode - Override user group by code (dev mode only)
   * @returns The current user's user group assignment
   *
   * @example
   * ```typescript
   * // Get current user's group
   * const { data } = await userGroupService.getUserGroup();
   * console.log(data.userGroup?.code); // 'U19' | 'ADULT_ORG' | 'OTHER'
   *
   * // Override in dev mode for testing
   * const { data } = await userGroupService.getUserGroup({
   *   userGroupCode: 'U19'
   * });
   * ```
   */
  async getUserGroup(options?: {
    userGroupId?: string;
    userGroupCode?: UserGroupCode
  }): Promise<SingleResponse<CurrentUserGroup>> {
    const params: Record<string, string> = {};
    if (options?.userGroupId) params.userGroupId = options.userGroupId;
    if (options?.userGroupCode) params.userGroupCode = options.userGroupCode;

    return this.client.get(this.buildPath('/user-group'), {
      params: Object.keys(params).length > 0 ? params : undefined
    });
  }
}

// =============================================================================
// Backoffice User Groups Service (admin only)
// =============================================================================

export class BackofficeUserGroupsService extends BaseService {
  constructor() {
    super('/backoffice/user-groups');
  }

  /**
   * List all available user groups
   * Returns a paginated list of all user groups configured in the system.
   * Admin access required.
   *
   * @returns Paginated list of all user groups
   *
   * @example
   * ```typescript
   * // Get all user groups
   * const { data } = await backofficeUserGroupsService.list();
   * data.forEach(group => {
   *   console.log(`${group.code}: ${group.name}`);
   * });
   * ```
   */
  async list(): Promise<PaginatedResponse<UserGroup>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Create a new user group
   * Creates a new user group with the specified code, name, and optional description.
   * Admin access required.
   *
   * @param data - User group creation parameters
   * @param data.code - Unique user group code (U19, ADULT_ORG, or OTHER)
   * @param data.name - Display name for the user group
   * @param data.description - Optional description of the user group
   * @returns The newly created user group
   *
   * @example
   * ```typescript
   * // Create a new user group
   * const { data } = await backofficeUserGroupsService.create({
   *   code: 'U19',
   *   name: 'Under 19',
   *   description: 'Users under 19 years of age'
   * });
   * console.log(`Created group: ${data.id}`);
   * ```
   */
  async create(data: CreateUserGroupDTO): Promise<SingleResponse<UserGroup>> {
    return this.client.post(this.buildPath(), data);
  }
}

// Singleton instances
export const userGroupService = new UserGroupService();
export const backofficeUserGroupsService = new BackofficeUserGroupsService();
