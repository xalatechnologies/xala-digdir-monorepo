/**
 * Organization Service
 * Single Responsibility: Handle organization and user operations
 */

import { BaseService } from './base.service';
import type { 
  Organization, 
  OrganizationMember,
  CreateOrganizationDTO, 
  UpdateOrganizationDTO,
  OrganizationQueryParams,
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserQueryParams,
  GdprDataExport,
  ConsentSettings,
  NotificationPreferences
} from '../types/organization';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';
import type { UploadOptions, MediaUploadResponse } from '../types/upload';

export class OrganizationService extends BaseService {
  constructor() {
    super('/api/organizations');
  }

  /**
   * Get paginated organizations
   */
  async getAll(params?: OrganizationQueryParams): Promise<PaginatedResponse<Organization>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single organization by ID
   */
  async getById(id: string): Promise<SingleResponse<Organization>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new organization
   */
  async create(data: CreateOrganizationDTO): Promise<SingleResponse<Organization>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing organization
   */
  async update(id: string, data: UpdateOrganizationDTO): Promise<SingleResponse<Organization>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete organization
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Request verification
   */
  async requestVerification(id: string): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/${id}/verify`));
  }

  /**
   * Get organization members
   */
  async getMembers(id: string): Promise<SingleResponse<OrganizationMember[]>> {
    return this.client.get(this.buildPath(`/${id}/members`));
  }

  /**
   * Add member to organization
   */
  async addMember(orgId: string, data: { userId: string; role?: string }): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/${orgId}/members`), data);
  }

  /**
   * Update member role
   */
  async updateMember(orgId: string, memberId: string, data: { role: string }): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${orgId}/members/${memberId}`), data);
  }

  /**
   * Remove member from organization
   */
  async removeMember(orgId: string, memberId: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${orgId}/members/${memberId}`));
  }

  /**
   * Upload logo to organization
   * Uses multipart/form-data for proper file upload with progress tracking
   * @param id - Organization ID
   * @param files - Files to upload
   * @param options - Upload options including progress callback
   * @returns MediaUploadResponse with uploaded file details
   */
  async uploadLogo(id: string, files: File[], options?: UploadOptions): Promise<MediaUploadResponse> {
    return super.uploadMedia(`/${id}/logo`, files, options);
  }
}

/**
 * User Service
 * Single Responsibility: Handle user management operations
 */
export class UserService extends BaseService {
  constructor() {
    super('/api/users');
  }

  /**
   * Get paginated users
   */
  async getAll(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single user by ID
   */
  async getById(id: string): Promise<SingleResponse<User>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<SingleResponse<User>> {
    return this.client.get(this.buildPath('/me'));
  }

  /**
   * Create new user
   */
  async create(data: CreateUserDTO): Promise<SingleResponse<User>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing user
   */
  async update(id: string, data: UpdateUserDTO): Promise<SingleResponse<User>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Update current user
   */
  async updateCurrentUser(data: UpdateUserDTO): Promise<SingleResponse<User>> {
    return this.client.put(this.buildPath('/me'), data);
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/deactivate`));
  }

  /**
   * Reactivate user
   */
  async reactivate(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/reactivate`));
  }

  /**
   * Export user data (GDPR)
   */
  async exportData(): Promise<GdprDataExport> {
    return this.client.get(this.buildPath('/me/data'));
  }

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath('/me'));
  }

  /**
   * Get consent settings
   */
  async getConsents(): Promise<SingleResponse<ConsentSettings>> {
    return this.client.get(this.buildPath('/me/consents'));
  }

  /**
   * Update consent settings
   */
  async updateConsents(consents: Partial<ConsentSettings>): Promise<SingleResponse<ConsentSettings>> {
    return this.client.put(this.buildPath('/me/consents'), consents);
  }

  /**
   * Get notification preferences
   */
  async getNotificationPrefs(): Promise<SingleResponse<NotificationPreferences>> {
    return this.client.get(this.buildPath('/me/notification-preferences'));
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPrefs(prefs: Partial<NotificationPreferences>): Promise<SingleResponse<NotificationPreferences>> {
    return this.client.patch(this.buildPath('/me/notification-preferences'), prefs);
  }

  /**
   * Upload avatar to user
   * Uses multipart/form-data for proper file upload with progress tracking
   * @param id - User ID
   * @param files - Files to upload
   * @param options - Upload options including progress callback
   * @returns MediaUploadResponse with uploaded file details
   */
  async uploadAvatar(id: string, files: File[], options?: UploadOptions): Promise<MediaUploadResponse> {
    return super.uploadMedia(`/${id}/avatar`, files, options);
  }
}

// Singleton instances
export const organizationService = new OrganizationService();
export const userService = new UserService();
