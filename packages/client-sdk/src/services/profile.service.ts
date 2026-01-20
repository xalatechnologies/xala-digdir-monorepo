/**
 * Profile Service
 * Single Responsibility: Handle user profile and preferences operations
 */

import { BaseService } from './base.service';
import type { SingleResponse } from '@/types/enums';
import type {
  UserProfile,
  UserPreferences,
  UpdateProfileDTO,
  UpdatePreferencesDTO,
} from '@/types/profile';

export class ProfileService extends BaseService {
  constructor() {
    super('/api/profile');
  }

  /**
   * Get current user's profile
   */
  async getProfile(): Promise<SingleResponse<UserProfile>> {
    return this.client.get(this.buildPath(''));
  }

  /**
   * Update current user's profile
   */
  async updateProfile(data: UpdateProfileDTO): Promise<SingleResponse<UserProfile>> {
    return this.client.put(this.buildPath(''), data);
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<SingleResponse<UserPreferences>> {
    return this.client.get(this.buildPath('/preferences'));
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesDTO): Promise<SingleResponse<UserPreferences>> {
    return this.client.put(this.buildPath('/preferences'), data);
  }

  /**
   * Update active account context
   * Convenience method for switching between personal and organization context
   */
  async setActiveContext(
    context: 'personal' | 'organization',
    organizationId?: string,
    rememberChoice?: boolean
  ): Promise<SingleResponse<UserPreferences>> {
    return this.updatePreferences({
      activeContext: context,
      activeOrganizationId: context === 'organization' ? organizationId : undefined,
      rememberAccountChoice: rememberChoice,
    });
  }
}

// Singleton instance
export const profileService = new ProfileService();
