/**
 * User Group Service
 * User group management and current user's group
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '../types/enums';

// =============================================================================
// Types
// =============================================================================

export type UserGroupCode = 'U19' | 'ADULT_ORG' | 'OTHER';

export interface UserGroup {
  id: string;
  code: UserGroupCode;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserGroupDTO {
  code: UserGroupCode;
  name: string;
  description?: string;
}

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
   * Get current user's user group
   * In dev mode, can override via query params or headers
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
   * List all user groups
   */
  async list(): Promise<PaginatedResponse<UserGroup>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Create a new user group
   */
  async create(data: CreateUserGroupDTO): Promise<SingleResponse<UserGroup>> {
    return this.client.post(this.buildPath(), data);
  }
}

// Singleton instances
export const userGroupService = new UserGroupService();
export const backofficeUserGroupsService = new BackofficeUserGroupsService();
