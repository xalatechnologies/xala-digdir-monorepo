/**
 * Push Notifications Repository
 * Database operations for notification preferences and push subscriptions
 */
import { eq, and } from 'drizzle-orm';
import {
  userNotificationPreferences,
  organizationNotificationPreferences,
  pushSubscriptions,
  type UserNotificationPreference,
  type NewUserNotificationPreference,
  type OrganizationNotificationPreference,
  type NewOrganizationNotificationPreference,
  type PushSubscription,
  type NewPushSubscription,
} from '../../database/schema';

// Default notification matrix based on Skien demo specification
export const DEFAULT_NOTIFICATION_MATRIX = {
  request_received: { in_app: true, email: true, sms: false },
  approved: { in_app: true, email: true, sms: false },
  rejected: { in_app: true, email: true, sms: false },
  request_more_info: { in_app: true, email: true, sms: false },
  booking_changed: { in_app: true, email: true, sms: true },
  cancelled: { in_app: true, email: true, sms: true },
  reminder_24h: { in_app: true, email: false, sms: true },
  reminder_2h: { in_app: true, email: false, sms: true },
  invoice_available: { in_app: true, email: true, sms: false },
  payment_status: { in_app: true, email: true, sms: false },
};

export class PushNotificationsRepository {
  constructor(private readonly db: any) {}

  // ==========================================================================
  // User Notification Preferences
  // ==========================================================================

  async findUserPreferences(tenantId: string, userId: string): Promise<UserNotificationPreference | null> {
    const results = await this.db
      .select()
      .from(userNotificationPreferences)
      .where(and(
        eq(userNotificationPreferences.tenantId, tenantId),
        eq(userNotificationPreferences.userId, userId)
      ))
      .limit(1);

    return results[0] ?? null;
  }

  async createUserPreferences(data: NewUserNotificationPreference): Promise<UserNotificationPreference> {
    const results = await this.db
      .insert(userNotificationPreferences)
      .values({
        ...data,
        notificationMatrix: data.notificationMatrix ?? DEFAULT_NOTIFICATION_MATRIX,
      })
      .returning();

    return results[0] as UserNotificationPreference;
  }

  async updateUserPreferences(
    tenantId: string,
    userId: string,
    data: Partial<NewUserNotificationPreference>
  ): Promise<UserNotificationPreference | null> {
    const results = await this.db
      .update(userNotificationPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(userNotificationPreferences.tenantId, tenantId),
        eq(userNotificationPreferences.userId, userId)
      ))
      .returning();

    return results[0] ?? null;
  }

  async upsertUserPreferences(
    tenantId: string,
    userId: string,
    data: Partial<NewUserNotificationPreference>
  ): Promise<UserNotificationPreference> {
    const existing = await this.findUserPreferences(tenantId, userId);

    if (existing) {
      const updated = await this.updateUserPreferences(tenantId, userId, data);
      return updated!;
    }

    return this.createUserPreferences({
      tenantId,
      userId,
      ...data,
    } as NewUserNotificationPreference);
  }

  // ==========================================================================
  // Organization Notification Preferences
  // ==========================================================================

  async findOrganizationPreferences(
    tenantId: string,
    organizationId: string
  ): Promise<OrganizationNotificationPreference | null> {
    const results = await this.db
      .select()
      .from(organizationNotificationPreferences)
      .where(and(
        eq(organizationNotificationPreferences.tenantId, tenantId),
        eq(organizationNotificationPreferences.organizationId, organizationId)
      ))
      .limit(1);

    return results[0] ?? null;
  }

  async createOrganizationPreferences(
    data: NewOrganizationNotificationPreference
  ): Promise<OrganizationNotificationPreference> {
    const results = await this.db
      .insert(organizationNotificationPreferences)
      .values({
        ...data,
        notificationMatrix: data.notificationMatrix ?? DEFAULT_NOTIFICATION_MATRIX,
      })
      .returning();

    return results[0] as OrganizationNotificationPreference;
  }

  async updateOrganizationPreferences(
    tenantId: string,
    organizationId: string,
    data: Partial<NewOrganizationNotificationPreference>
  ): Promise<OrganizationNotificationPreference | null> {
    const results = await this.db
      .update(organizationNotificationPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(organizationNotificationPreferences.tenantId, tenantId),
        eq(organizationNotificationPreferences.organizationId, organizationId)
      ))
      .returning();

    return results[0] ?? null;
  }

  async upsertOrganizationPreferences(
    tenantId: string,
    organizationId: string,
    data: Partial<NewOrganizationNotificationPreference>
  ): Promise<OrganizationNotificationPreference> {
    const existing = await this.findOrganizationPreferences(tenantId, organizationId);

    if (existing) {
      const updated = await this.updateOrganizationPreferences(tenantId, organizationId, data);
      return updated!;
    }

    return this.createOrganizationPreferences({
      tenantId,
      organizationId,
      ...data,
    } as NewOrganizationNotificationPreference);
  }

  // ==========================================================================
  // Push Subscriptions
  // ==========================================================================

  async findPushSubscriptionsByUser(tenantId: string, userId: string): Promise<PushSubscription[]> {
    return this.db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.tenantId, tenantId),
        eq(pushSubscriptions.userId, userId)
      ));
  }

  async findPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    const results = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    return results[0] ?? null;
  }

  async createPushSubscription(data: NewPushSubscription): Promise<PushSubscription> {
    const results = await this.db
      .insert(pushSubscriptions)
      .values(data)
      .returning();

    return results[0] as PushSubscription;
  }

  async updatePushSubscription(
    id: string,
    data: Partial<NewPushSubscription>
  ): Promise<PushSubscription | null> {
    const results = await this.db
      .update(pushSubscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pushSubscriptions.id, id))
      .returning();

    return results[0] ?? null;
  }

  async deletePushSubscription(id: string): Promise<boolean> {
    const results = await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.id, id))
      .returning();

    return results.length > 0;
  }

  async deletePushSubscriptionByEndpoint(endpoint: string): Promise<boolean> {
    const results = await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .returning();

    return results.length > 0;
  }

  async markSubscriptionUsed(id: string): Promise<void> {
    await this.db
      .update(pushSubscriptions)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(eq(pushSubscriptions.id, id));
  }
}
