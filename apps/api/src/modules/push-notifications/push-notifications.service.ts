/**
 * Push Notifications Service
 * Business logic for notification preferences and push subscriptions
 */
import { PushNotificationsRepository, DEFAULT_NOTIFICATION_MATRIX } from './push-notifications.repository';
import type {
  UserNotificationPreference,
  OrganizationNotificationPreference,
  PushSubscription,
} from '../../database/schema';

// =============================================================================
// Types
// =============================================================================

export interface NotificationMatrix {
  request_received: { in_app: boolean; email: boolean; sms: boolean };
  approved: { in_app: boolean; email: boolean; sms: boolean };
  rejected: { in_app: boolean; email: boolean; sms: boolean };
  request_more_info: { in_app: boolean; email: boolean; sms: boolean };
  booking_changed: { in_app: boolean; email: boolean; sms: boolean };
  cancelled: { in_app: boolean; email: boolean; sms: boolean };
  reminder_24h: { in_app: boolean; email: boolean; sms: boolean };
  reminder_2h: { in_app: boolean; email: boolean; sms: boolean };
  invoice_available: { in_app: boolean; email: boolean; sms: boolean };
  payment_status: { in_app: boolean; email: boolean; sms: boolean };
}

export interface UserPreferencesDTO {
  userId: string;
  tenantId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
  notificationMatrix: NotificationMatrix;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationPreferencesDTO {
  organizationId: string;
  tenantId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  notificationMatrix: NotificationMatrix;
  notifyAdmins: boolean;
  notifyBookingManagers: boolean;
  notifyAllMembers: boolean;
  primaryEmail: string | null;
  primaryPhone: string | null;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferencesDTO {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  smsEnabled?: boolean;
  notificationMatrix?: Partial<NotificationMatrix>;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UpdateOrganizationPreferencesDTO {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
  notificationMatrix?: Partial<NotificationMatrix>;
  notifyAdmins?: boolean;
  notifyBookingManagers?: boolean;
  notifyAllMembers?: boolean;
  primaryEmail?: string;
  primaryPhone?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface RegisterPushSubscriptionDTO {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceName?: string;
  userAgent?: string;
}

export interface PushSubscriptionDTO {
  id: string;
  userId: string;
  endpoint: string;
  deviceName: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

// =============================================================================
// Service
// =============================================================================

export class PushNotificationsService {
  constructor(private readonly repository: PushNotificationsRepository) {}

  // ==========================================================================
  // User Preferences
  // ==========================================================================

  async getUserPreferences(tenantId: string, userId: string): Promise<UserPreferencesDTO> {
    let prefs = await this.repository.findUserPreferences(tenantId, userId);

    // If no preferences exist, create default ones
    if (!prefs) {
      prefs = await this.repository.createUserPreferences({
        tenantId,
        userId,
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
        smsEnabled: false,
        notificationMatrix: DEFAULT_NOTIFICATION_MATRIX,
        quietHoursEnabled: false,
      });
    }

    return this.mapUserPreferencesToDTO(prefs);
  }

  async updateUserPreferences(
    tenantId: string,
    userId: string,
    data: UpdateUserPreferencesDTO
  ): Promise<UserPreferencesDTO> {
    // Build update object with defined values
    const updateData: Record<string, unknown> = {
      ...(data.emailEnabled !== undefined && { emailEnabled: data.emailEnabled }),
      ...(data.pushEnabled !== undefined && { pushEnabled: data.pushEnabled }),
      ...(data.inAppEnabled !== undefined && { inAppEnabled: data.inAppEnabled }),
      ...(data.smsEnabled !== undefined && { smsEnabled: data.smsEnabled }),
      ...(data.quietHoursEnabled !== undefined && { quietHoursEnabled: data.quietHoursEnabled }),
      ...(data.quietHoursStart !== undefined && { quietHoursStart: data.quietHoursStart }),
      ...(data.quietHoursEnd !== undefined && { quietHoursEnd: data.quietHoursEnd }),
    };

    // Handle notification matrix merge
    if (data.notificationMatrix) {
      const existing = await this.repository.findUserPreferences(tenantId, userId);
      const existingMatrix = (existing?.notificationMatrix as NotificationMatrix) ?? DEFAULT_NOTIFICATION_MATRIX;
      updateData.notificationMatrix = this.mergeNotificationMatrix(existingMatrix, data.notificationMatrix);
    }

    const prefs = await this.repository.upsertUserPreferences(tenantId, userId, updateData);
    return this.mapUserPreferencesToDTO(prefs);
  }

  // ==========================================================================
  // Organization Preferences
  // ==========================================================================

  async getOrganizationPreferences(
    tenantId: string,
    organizationId: string
  ): Promise<OrganizationPreferencesDTO> {
    let prefs = await this.repository.findOrganizationPreferences(tenantId, organizationId);

    // If no preferences exist, create default ones
    if (!prefs) {
      prefs = await this.repository.createOrganizationPreferences({
        tenantId,
        organizationId,
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        notificationMatrix: DEFAULT_NOTIFICATION_MATRIX,
        notifyAdmins: true,
        notifyBookingManagers: true,
        notifyAllMembers: false,
        quietHoursEnabled: false,
      });
    }

    return this.mapOrganizationPreferencesToDTO(prefs);
  }

  async updateOrganizationPreferences(
    tenantId: string,
    organizationId: string,
    data: UpdateOrganizationPreferencesDTO
  ): Promise<OrganizationPreferencesDTO> {
    // Build update object with defined values
    const updateData: Record<string, unknown> = {
      ...(data.emailEnabled !== undefined && { emailEnabled: data.emailEnabled }),
      ...(data.smsEnabled !== undefined && { smsEnabled: data.smsEnabled }),
      ...(data.inAppEnabled !== undefined && { inAppEnabled: data.inAppEnabled }),
      ...(data.notifyAdmins !== undefined && { notifyAdmins: data.notifyAdmins }),
      ...(data.notifyBookingManagers !== undefined && { notifyBookingManagers: data.notifyBookingManagers }),
      ...(data.notifyAllMembers !== undefined && { notifyAllMembers: data.notifyAllMembers }),
      ...(data.primaryEmail !== undefined && { primaryEmail: data.primaryEmail }),
      ...(data.primaryPhone !== undefined && { primaryPhone: data.primaryPhone }),
      ...(data.quietHoursEnabled !== undefined && { quietHoursEnabled: data.quietHoursEnabled }),
      ...(data.quietHoursStart !== undefined && { quietHoursStart: data.quietHoursStart }),
      ...(data.quietHoursEnd !== undefined && { quietHoursEnd: data.quietHoursEnd }),
    };

    // Handle notification matrix merge
    if (data.notificationMatrix) {
      const existing = await this.repository.findOrganizationPreferences(tenantId, organizationId);
      const existingMatrix = (existing?.notificationMatrix as NotificationMatrix) ?? DEFAULT_NOTIFICATION_MATRIX;
      updateData.notificationMatrix = this.mergeNotificationMatrix(existingMatrix, data.notificationMatrix);
    }

    const prefs = await this.repository.upsertOrganizationPreferences(tenantId, organizationId, updateData);
    return this.mapOrganizationPreferencesToDTO(prefs);
  }

  // ==========================================================================
  // Push Subscriptions
  // ==========================================================================

  async getPushSubscriptions(tenantId: string, userId: string): Promise<PushSubscriptionDTO[]> {
    const subscriptions = await this.repository.findPushSubscriptionsByUser(tenantId, userId);
    return subscriptions.map(this.mapPushSubscriptionToDTO);
  }

  async registerPushSubscription(
    tenantId: string,
    userId: string,
    data: RegisterPushSubscriptionDTO
  ): Promise<PushSubscriptionDTO> {
    // Check if subscription already exists
    const existing = await this.repository.findPushSubscriptionByEndpoint(data.endpoint);
    
    if (existing) {
      // Update existing subscription
      const updated = await this.repository.updatePushSubscription(existing.id, {
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        deviceName: data.deviceName,
        userAgent: data.userAgent,
        isActive: true,
        lastUsedAt: new Date(),
      });
      return this.mapPushSubscriptionToDTO(updated!);
    }

    // Create new subscription
    const subscription = await this.repository.createPushSubscription({
      tenantId,
      userId,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      deviceName: data.deviceName,
      userAgent: data.userAgent,
      isActive: true,
    });

    // Also enable push in user preferences
    await this.repository.upsertUserPreferences(tenantId, userId, { pushEnabled: true });

    return this.mapPushSubscriptionToDTO(subscription);
  }

  async unsubscribePush(endpoint: string): Promise<boolean> {
    return this.repository.deletePushSubscriptionByEndpoint(endpoint);
  }

  async deletePushSubscription(id: string): Promise<boolean> {
    return this.repository.deletePushSubscription(id);
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  private mergeNotificationMatrix(
    existing: NotificationMatrix,
    updates: Partial<NotificationMatrix>
  ): NotificationMatrix {
    const merged = { ...existing };

    for (const [type, channels] of Object.entries(updates)) {
      if (channels && merged[type as keyof NotificationMatrix]) {
        merged[type as keyof NotificationMatrix] = {
          ...merged[type as keyof NotificationMatrix],
          ...channels,
        };
      }
    }

    return merged;
  }

  private mapUserPreferencesToDTO(prefs: UserNotificationPreference): UserPreferencesDTO {
    return {
      userId: prefs.userId,
      tenantId: prefs.tenantId,
      emailEnabled: prefs.emailEnabled,
      pushEnabled: prefs.pushEnabled,
      inAppEnabled: prefs.inAppEnabled,
      smsEnabled: prefs.smsEnabled,
      notificationMatrix: prefs.notificationMatrix as NotificationMatrix,
      quietHoursEnabled: prefs.quietHoursEnabled,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      createdAt: prefs.createdAt.toISOString(),
      updatedAt: prefs.updatedAt.toISOString(),
    };
  }

  private mapOrganizationPreferencesToDTO(prefs: OrganizationNotificationPreference): OrganizationPreferencesDTO {
    return {
      organizationId: prefs.organizationId,
      tenantId: prefs.tenantId,
      emailEnabled: prefs.emailEnabled,
      smsEnabled: prefs.smsEnabled,
      inAppEnabled: prefs.inAppEnabled,
      notificationMatrix: prefs.notificationMatrix as NotificationMatrix,
      notifyAdmins: prefs.notifyAdmins,
      notifyBookingManagers: prefs.notifyBookingManagers,
      notifyAllMembers: prefs.notifyAllMembers,
      primaryEmail: prefs.primaryEmail,
      primaryPhone: prefs.primaryPhone,
      quietHoursEnabled: prefs.quietHoursEnabled,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      createdAt: prefs.createdAt.toISOString(),
      updatedAt: prefs.updatedAt.toISOString(),
    };
  }

  private mapPushSubscriptionToDTO(sub: PushSubscription): PushSubscriptionDTO {
    return {
      id: sub.id,
      userId: sub.userId,
      endpoint: sub.endpoint,
      deviceName: sub.deviceName,
      isActive: sub.isActive,
      lastUsedAt: sub.lastUsedAt?.toISOString() ?? null,
      createdAt: sub.createdAt.toISOString(),
    };
  }
}
