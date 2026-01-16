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
   * @returns Complete tenant settings including general, booking, notifications, integrations, and branding
   */
  async getTenantSettings(): Promise<{ data: TenantSettings }> {
    return getClient().get<{ data: TenantSettings }>(`${this.basePath}/tenant`);
  }

  /**
   * Update tenant settings
   * @param data - Partial tenant settings to update
   * @returns Updated complete tenant settings
   * @example
   * ```typescript
   * // Update general tenant settings
   * const settings = await settingsService.updateTenantSettings({
   *   general: {
   *     name: 'My Rental Company',
   *     locale: 'nb-NO',
   *     timezone: 'Europe/Oslo',
   *     currency: 'NOK'
   *   }
   * });
   * console.log(`Updated tenant: ${settings.data.general.name}`);
   * ```
   */
  async updateTenantSettings(data: Partial<TenantSettings>): Promise<{ data: TenantSettings }> {
    return getClient().put<{ data: TenantSettings }>(`${this.basePath}/tenant`, data);
  }

  /**
   * Get user settings
   * @returns User settings including notifications, preferences, and privacy
   */
  async getUserSettings(): Promise<{ data: UserSettings }> {
    return getClient().get<{ data: UserSettings }>(`${this.basePath}/user`);
  }

  /**
   * Update user settings
   * @param data - Partial user settings to update
   * @returns Updated complete user settings
   */
  async updateUserSettings(data: Partial<UserSettings>): Promise<{ data: UserSettings }> {
    return getClient().put<{ data: UserSettings }>(`${this.basePath}/user`, data);
  }

  /**
   * Get booking policy settings
   * @returns Booking policy configuration (auto-confirm, approval, cancellation, timing rules)
   */
  async getBookingPolicy(): Promise<{ data: TenantSettings['booking'] }> {
    return getClient().get<{ data: TenantSettings['booking'] }>(`${this.basePath}/booking-policy`);
  }

  /**
   * Update booking policy
   * @param data - Partial booking policy settings to update
   * @returns Updated complete booking policy configuration
   * @example
   * ```typescript
   * // Enable auto-confirmation and set cancellation policy
   * const policy = await settingsService.updateBookingPolicy({
   *   autoConfirm: true,
   *   allowCancellation: true,
   *   cancellationDeadlineHours: 24,
   *   minAdvanceBookingHours: 2
   * });
   * console.log(`Cancellation deadline: ${policy.data.cancellationDeadlineHours}h`);
   * ```
   */
  async updateBookingPolicy(data: Partial<TenantSettings['booking']>): Promise<{ data: TenantSettings['booking'] }> {
    return getClient().put<{ data: TenantSettings['booking'] }>(`${this.basePath}/booking-policy`, data);
  }

  /**
   * Get branding settings
   * @returns Branding configuration (logo, colors, favicon)
   */
  async getBranding(): Promise<{ data: TenantSettings['branding'] }> {
    return getClient().get<{ data: TenantSettings['branding'] }>(`${this.basePath}/branding`);
  }

  /**
   * Update branding settings
   * @param data - Partial branding settings to update
   * @returns Updated complete branding configuration
   * @example
   * ```typescript
   * // Update company branding colors and logo
   * const branding = await settingsService.updateBranding({
   *   logo: 'https://cdn.example.com/logo.png',
   *   primaryColor: '#0066CC',
   *   secondaryColor: '#FF6600'
   * });
   * console.log(`Branding updated with primary color: ${branding.data.primaryColor}`);
   * ```
   */
  async updateBranding(data: Partial<TenantSettings['branding']>): Promise<{ data: TenantSettings['branding'] }> {
    return getClient().put<{ data: TenantSettings['branding'] }>(`${this.basePath}/branding`, data);
  }

  /**
   * Reset settings to defaults
   * @param scope - Scope of settings to reset (tenant or user)
   * @returns Success status of reset operation
   */
  async resetToDefaults(scope: 'tenant' | 'user'): Promise<{ success: boolean }> {
    return getClient().post<{ success: boolean }>(`${this.basePath}/reset`, { scope });
  }
}

export const settingsService = new SettingsService();
