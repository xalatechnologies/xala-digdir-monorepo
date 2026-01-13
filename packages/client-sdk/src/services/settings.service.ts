/**
 * Settings Service
 * Tenant and user settings management
 */
import { getClient } from '../core/client-factory';

export interface TenantSettings {
  general: {
    name: string;
    locale: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  booking: {
    autoConfirm: boolean;
    requireApproval: boolean;
    allowCancellation: boolean;
    cancellationDeadlineHours: number;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    bufferTimeMinutes: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    reminderHoursBefore: number;
  };
  integrations: {
    calendarSync: boolean;
    paymentGateway: string | null;
    accessControlProvider: string | null;
  };
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
  };
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    locale: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
  };
  privacy: {
    shareBookingHistory: boolean;
    showProfilePublicly: boolean;
  };
}

export interface UpdateSettingsDTO {
  [key: string]: unknown;
}

class SettingsService {
  private basePath = '/api/settings';

  /**
   * Get tenant settings
   */
  async getTenantSettings(): Promise<{ data: TenantSettings }> {
    return getClient().get<{ data: TenantSettings }>(`${this.basePath}/tenant`);
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(data: Partial<TenantSettings>): Promise<{ data: TenantSettings }> {
    return getClient().put<{ data: TenantSettings }>(`${this.basePath}/tenant`, data);
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<{ data: UserSettings }> {
    return getClient().get<{ data: UserSettings }>(`${this.basePath}/user`);
  }

  /**
   * Update user settings
   */
  async updateUserSettings(data: Partial<UserSettings>): Promise<{ data: UserSettings }> {
    return getClient().put<{ data: UserSettings }>(`${this.basePath}/user`, data);
  }

  /**
   * Get booking policy settings
   */
  async getBookingPolicy(): Promise<{ data: TenantSettings['booking'] }> {
    return getClient().get<{ data: TenantSettings['booking'] }>(`${this.basePath}/booking-policy`);
  }

  /**
   * Update booking policy
   */
  async updateBookingPolicy(data: Partial<TenantSettings['booking']>): Promise<{ data: TenantSettings['booking'] }> {
    return getClient().put<{ data: TenantSettings['booking'] }>(`${this.basePath}/booking-policy`, data);
  }

  /**
   * Get branding settings
   */
  async getBranding(): Promise<{ data: TenantSettings['branding'] }> {
    return getClient().get<{ data: TenantSettings['branding'] }>(`${this.basePath}/branding`);
  }

  /**
   * Update branding settings
   */
  async updateBranding(data: Partial<TenantSettings['branding']>): Promise<{ data: TenantSettings['branding'] }> {
    return getClient().put<{ data: TenantSettings['branding'] }>(`${this.basePath}/branding`, data);
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(scope: 'tenant' | 'user'): Promise<{ success: boolean }> {
    return getClient().post<{ success: boolean }>(`${this.basePath}/reset`, { scope });
  }
}

export const settingsService = new SettingsService();
