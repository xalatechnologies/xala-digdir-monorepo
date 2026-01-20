import { BaseService } from './base.service';
import type {
  User,
  UserListResponse,
  CreateUserDTO,
  UpdateUserDTO,
  ListUsersQuery,
  AssignRoleDTO,
  SuspendUserDTO,
} from '@/types/user.types';

/**
 * User Service
 * 
 * Client SDK for user management operations (admin)
 * Note: For current user operations, use ProfileService
 */
export class UserService extends BaseService {
  constructor() {
    super(''); // No base path prefix since paths are already absolute
  }

  /**
   * List all users with filters (admin only)
   */
  async list(query?: Partial<ListUsersQuery>): Promise<UserListResponse> {
    return this.get('/admin/users', { params: query });
  }

  /**
   * Get single user by ID (admin only)
   */
  async getById(id: string): Promise<User> {
    return this.get(`/admin/users/${id}`);
  }

  /**
   * Get users by organization (admin only)
   */
  async getByOrganization(organizationId: string): Promise<User[]> {
    return this.get(`/admin/organizations/${organizationId}/users`);
  }

  /**
   * Get users by tenant (super admin only)
   */
  async getByTenant(tenantId: string): Promise<User[]> {
    return this.get(`/admin/tenants/${tenantId}/users`);
  }

  /**
   * Create new user (admin only)
   */
  async create(data: CreateUserDTO): Promise<User> {
    return this.post('/admin/users', data);
  }

  /**
   * Update user (admin only)
   */
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return this.patch(`/admin/users/${id}`, data);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await this.delete(`/admin/users/${id}`);
  }

  /**
   * Suspend user (admin only)
   */
  async suspend(id: string, data?: SuspendUserDTO): Promise<User> {
    return this.patch(`/admin/users/${id}/suspend`, data);
  }

  /**
   * Reinstate suspended user (admin only)
   */
  async reinstate(id: string): Promise<User> {
    return this.patch(`/admin/users/${id}/reinstate`);
  }

  /**
   * Assign role to user (admin only)
   */
  async assignRole(userId: string, data: AssignRoleDTO): Promise<User> {
    return this.post(`/admin/users/${userId}/roles`, data);
  }

  /**
   * Remove role from user (admin only)
   */
  async removeRole(userId: string, roleId: string): Promise<User> {
    return this.delete(`/admin/users/${userId}/roles/${roleId}`);
  }

  /**
   * Bulk invite users (admin only)
   */
  async bulkInvite(data: {
    emails: string[];
    roleId?: string;
    organizationId?: string;
  }): Promise<{
    success: number;
    failed: number;
    errors?: Array<{ email: string; error: string }>;
  }> {
    return this.post('/admin/users/invite-bulk', data);
  }

  /**
   * Get user statistics (admin only)
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    pendingInvite: number;
  }> {
    return this.get('/admin/users/stats');
  }

  /**
   * Search users (admin only)
   */
  async search(searchTerm: string): Promise<User[]> {
    return this.get(`/admin/users/search`, {
      params: { q: searchTerm },
    });
  }

  /**
   * Export users to CSV (admin only)
   */
  async exportToCsv(query?: Partial<ListUsersQuery>): Promise<Blob> {  
    const response = await this.client.get('/admin/users/export', {
      params: query,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }
}

// Export singleton instance
export const userService = new UserService();
