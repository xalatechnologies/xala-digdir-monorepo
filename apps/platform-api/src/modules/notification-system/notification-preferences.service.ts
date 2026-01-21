/**
 * Notification Preferences Service
 * Manages user notification preferences and settings
 */
import { eq, and } from 'drizzle-orm';
import {
  notificationPreferences,
  type NotificationPreference,
  type NewNotificationPreference,
} from '../../database/schema/notification-preferences';

export interface UpdatePreferencesDTO {
  // Channel preferences
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;

  // Notification type preferences
  bookingCreated?: boolean;
  bookingApproved?: boolean;
  bookingRejected?: boolean;
  bookingCancelled?: boolean;
  bookingChanged?: boolean;

  reminder24h?: boolean;
  reminder2h?: boolean;

  systemNotifications?: boolean;
  adminMessages?: boolean;

  invoiceAvailable?: boolean;
  paymentStatus?: boolean;

  // Advanced settings
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  quietHoursTimezone?: string;
}

export class NotificationPreferencesService {
  constructor(private readonly db: unknown) {}

  /**
   * Get user notification preferences (creates defaults if not exists)
   */
  async getPreferences(
    userId: string,
    tenantId: string
  ): Promise<NotificationPreference> {
    // Try to get existing preferences
    const existing = await (this.db as any)
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.tenantId, tenantId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create default preferences
    return this.createDefaultPreferences(userId, tenantId);
  }

  /**
   * Create default notification preferences for a user
   */
  async createDefaultPreferences(
    userId: string,
    tenantId: string
  ): Promise<NotificationPreference> {
    const newPreferences: NewNotificationPreference = {
      userId,
      tenantId,
      // Channels - all enabled by default except SMS
      inAppEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      // Notification types - all enabled by default
      bookingCreated: true,
      bookingApproved: true,
      bookingRejected: true,
      bookingCancelled: true,
      bookingChanged: true,
      reminder24h: true,
      reminder2h: true,
      systemNotifications: true,
      adminMessages: true,
      invoiceAvailable: true,
      paymentStatus: true,
      // Advanced settings
      quietHoursStart: null,
      quietHoursEnd: null,
      quietHoursTimezone: 'Europe/Oslo',
      metadata: {},
    };

    const results = await (this.db as any)
      .insert(notificationPreferences)
      .values(newPreferences)
      .returning();

    return results[0];
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    tenantId: string,
    updates: UpdatePreferencesDTO
  ): Promise<NotificationPreference> {
    // Ensure preferences exist first
    await this.getPreferences(userId, tenantId);

    // Validate quiet hours if provided
    if (updates.quietHoursStart || updates.quietHoursEnd) {
      this.validateQuietHours(updates.quietHoursStart, updates.quietHoursEnd);
    }

    // Update preferences
    const results = await (this.db as any)
      .update(notificationPreferences)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.tenantId, tenantId)
        )
      )
      .returning();

    if (results.length === 0) {
      throw new Error('Failed to update notification preferences');
    }

    return results[0];
  }

  /**
   * Check if a specific notification type is enabled for a user
   */
  async isNotificationTypeEnabled(
    userId: string,
    tenantId: string,
    notificationType: string
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId, tenantId);

    // Map notification type to preference field
    const typeMapping: Record<string, keyof NotificationPreference> = {
      request_received: 'bookingCreated',
      booking_created: 'bookingCreated',
      approved: 'bookingApproved',
      booking_approved: 'bookingApproved',
      rejected: 'bookingRejected',
      booking_rejected: 'bookingRejected',
      cancelled: 'bookingCancelled',
      booking_cancelled: 'bookingCancelled',
      booking_changed: 'bookingChanged',
      reminder_24h: 'reminder24h',
      reminder_2h: 'reminder2h',
      system_alert: 'systemNotifications',
      admin_message: 'adminMessages',
      invoice_available: 'invoiceAvailable',
      payment_status: 'paymentStatus',
    };

    const field = typeMapping[notificationType];
    if (!field) {
      // Unknown notification type, default to enabled
      return true;
    }

    return Boolean(preferences[field]);
  }

  /**
   * Check if a specific channel is enabled for a user
   */
  async isChannelEnabled(
    userId: string,
    tenantId: string,
    channel: 'in_app' | 'email' | 'sms' | 'push'
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId, tenantId);

    const channelMapping = {
      in_app: preferences.inAppEnabled,
      email: preferences.emailEnabled,
      sms: preferences.smsEnabled,
      push: preferences.pushEnabled,
    };

    return Boolean(channelMapping[channel]);
  }

  /**
   * Filter channels based on user preferences
   */
  async getEnabledChannels(
    userId: string,
    tenantId: string,
    requestedChannels: Array<'in_app' | 'email' | 'sms' | 'push'>
  ): Promise<Array<'in_app' | 'email' | 'sms' | 'push'>> {
    const preferences = await this.getPreferences(userId, tenantId);

    const channelMapping: Record<'in_app' | 'email' | 'sms' | 'push', boolean> = {
      in_app: preferences.inAppEnabled,
      email: preferences.emailEnabled,
      sms: preferences.smsEnabled,
      push: preferences.pushEnabled,
    };

    return requestedChannels.filter((channel) => channelMapping[channel]);
  }

  /**
   * Check if user is in quiet hours
   */
  async isInQuietHours(userId: string, tenantId: string): Promise<boolean> {
    const preferences = await this.getPreferences(userId, tenantId);

    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const timezone = preferences.quietHoursTimezone || 'Europe/Oslo';

    // Parse time strings (HH:MM format)
    const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);

    // Get current time in user's timezone
    const currentTime = now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Handle cases where quiet hours span midnight
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(
    userId: string,
    tenantId: string
  ): Promise<NotificationPreference> {
    // Delete existing preferences
    await (this.db as any)
      .delete(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.tenantId, tenantId)
        )
      );

    // Create new defaults
    return this.createDefaultPreferences(userId, tenantId);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate quiet hours format (HH:MM)
   */
  private validateQuietHours(
    start: string | null | undefined,
    end: string | null | undefined
  ): void {
    if (!start && !end) {
      return; // Both null is valid (disabled)
    }

    if ((start && !end) || (!start && end)) {
      throw new Error('Both quiet hours start and end must be provided or both must be null');
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (start && !timeRegex.test(start)) {
      throw new Error('Invalid quiet hours start time format. Use HH:MM (24-hour)');
    }

    if (end && !timeRegex.test(end)) {
      throw new Error('Invalid quiet hours end time format. Use HH:MM (24-hour)');
    }
  }
}
