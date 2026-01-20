/**
 * Settings Service
 * Handles application settings and configuration management
 */

import { BaseService } from './base.service';
import type {
  AppSettings,
  UpdateSettingsDTO,
  SettingCategory,
  SingleResponse,
} from '@/types';

export class SettingsService extends BaseService {
  constructor() {
    super('/api/settings');
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<SingleResponse<AppSettings>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Get settings by category
   */
  async getByCategory(category: SettingCategory): Promise<SingleResponse<Partial<AppSettings>>> {
    return this.client.get(this.buildPath(`/category/${category}`));
  }

  /**
   * Update settings (full or partial)
   */
  async update(data: UpdateSettingsDTO): Promise<SingleResponse<AppSettings>> {
    return this.client.put(this.buildPath(), data);
  }

  /**
   * Update single setting value
   */
  async updateSetting(key: string, value: unknown): Promise<SingleResponse<{ key: string; value: unknown }>> {
    return this.client.put(this.buildPath(`/${key}`), { value });
  }

  /**
   * Reset settings to defaults
   */
  async reset(category?: SettingCategory): Promise<SingleResponse<AppSettings>> {
    return this.client.post(this.buildPath('/reset'), { category });
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<SingleResponse<{
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  }>> {
    return this.client.get(this.buildPath('/notifications'));
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    inApp?: boolean;
  }): Promise<SingleResponse<void>> {
    return this.client.put(this.buildPath('/notifications'), settings);
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<SingleResponse<{
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
  }>> {
    return this.client.get(this.buildPath('/privacy'));
  }

  /**
   * Export settings as JSON
   */
  async export(): Promise<Blob> {
    const response = await this.client.get(this.buildPath('/export'), {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  /**
   * Import settings from JSON
   */
  async import(file: File): Promise<SingleResponse<AppSettings>> {
    const formData = new FormData();
    formData.append('settings', file);
    return this.client.post(this.buildPath('/import'), formData);
  }
}

export const settingsService = new SettingsService();
