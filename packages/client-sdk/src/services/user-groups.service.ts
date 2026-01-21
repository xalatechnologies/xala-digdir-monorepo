/**
 * User Groups Service
 * Handles user group management and membership operations
 */

import { BaseService } from './base.service';
import type {
  UserGroup,
  CreateUserGroupDTO,
  UpdateUserGroupDTO,
  UserGroupQueryParams,
  PaginatedResponse,
  SingleResponse,
} from '@/types';

export class UserGroupsService extends BaseService {
  constructor() {
    super('/api/user-groups');
  }

  /**
   * Get all user groups
   */
  async getAll(params?: UserGroupQueryParams): Promise<PaginatedResponse<UserGroup>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single user group by ID
   */
  async getById(id: string): Promise<SingleResponse<UserGroup>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new user group
   */
  async create(data: CreateUserGroupDTO): Promise<SingleResponse<UserGroup>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing user group
   */
  async update(id: string, data: UpdateUserGroupDTO): Promise<SingleResponse<UserGroup>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete user group
   */
  async deleteGroup(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Get group members
   */
  async getMembers(id: string): Promise<PaginatedResponse<{
    userId: string;
    userName: string;
    email: string;
    role: string;
    joinedAt: string;
  }>> {
    return this.client.get(this.buildPath(`/${id}/members`));
  }

  /**
   * Add user to group
   */
  async addMember(groupId: string, userId: string): Promise<SingleResponse<void>> {
    return this.client.post(this.buildPath(`/${groupId}/members`), { userId });
  }

  /**
   * Remove user from group
   */
  async removeMember(groupId: string, userId: string): Promise<SingleResponse<void>> {
    return this.client.delete(this.buildPath(`/${groupId}/members/${userId}`));
  }

  /**
   * Bulk add users to group
   */
  async bulkAddMembers(groupId: string, userIds: string[]): Promise<SingleResponse<{
    added: number;
    failed: string[];
  }>> {
    return this.client.post(this.buildPath(`/${groupId}/members/bulk`), { userIds });
  }

  /**
   * Get groups for a specific user
   */
  async getUserGroups(userId: string): Promise<PaginatedResponse<UserGroup>> {
    return this.client.get(this.buildPath(`/user/${userId}`));
  }

  /**
   * Get group permissions
   */
  async getGroupPermissions(id: string): Promise<SingleResponse<{
    permissions: string[];
    inherited: string[];
  }>> {
    return this.client.get(this.buildPath(`/${id}/permissions`));
  }
}

export const userGroupsService = new UserGroupsService();
