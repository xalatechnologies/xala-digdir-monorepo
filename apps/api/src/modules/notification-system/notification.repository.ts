/**
 * Notification Repository
 * Database operations for the notification system
 */
import { eq, and, isNull, desc, gte, lte, sql, count } from 'drizzle-orm';
import {
  notifications,
  notificationTemplates,
  notificationDeliveryLogs,
  notificationQueue,
  emailProviderConfigs,
  smsProviderConfigs,
  type Notification,
  type NewNotification,
  type NotificationTemplate,
  type NewNotificationTemplate,
  type NotificationDeliveryLog,
  type NewNotificationDeliveryLog,
  type NotificationQueueItem,
  type NewNotificationQueueItem,
  type EmailProviderConfig,
  type SmsProviderConfig,
} from '../../database/schema';
import type { NotificationQueryParams, QueueStatus } from './notification.types';

export class NotificationRepository {
  constructor(private readonly db: unknown) {}

  // ==========================================================================
  // Notifications
  // ==========================================================================

  async createNotification(data: NewNotification): Promise<Notification> {
    const results = await (this.db as any)
      .insert(notifications)
      .values(data)
      .returning();
    return results[0] as Notification;
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    const results = await (this.db as any)
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    return results[0] ?? null;
  }

  async findNotificationsByUser(
    tenantId: string,
    userId: string,
    params: NotificationQueryParams = {}
  ): Promise<Notification[]> {
    let query = (this.db as any)
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.userId, userId)
      ));

    if (params.type) {
      query = query.where(eq(notifications.type, params.type));
    }

    if (params.priority) {
      query = query.where(eq(notifications.priority, params.priority));
    }

    if (params.unreadOnly) {
      query = query.where(isNull(notifications.readAt));
    }

    query = query.orderBy(desc(notifications.createdAt));

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.offset(params.offset);
    }

    return query;
  }

  async countUnreadNotifications(tenantId: string, userId: string): Promise<number> {
    const results = await (this.db as any)
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt)
      ));
    return results[0]?.count ?? 0;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const results = await (this.db as any)
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return results[0] ?? null;
  }

  async markAllAsRead(tenantId: string, userId: string): Promise<number> {
    const results = await (this.db as any)
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.tenantId, tenantId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt)
      ))
      .returning();
    return results.length;
  }

  async dismissNotification(id: string): Promise<Notification | null> {
    const results = await (this.db as any)
      .update(notifications)
      .set({ dismissedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return results[0] ?? null;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const results = await (this.db as any)
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return results.length > 0;
  }

  async deleteExpiredNotifications(): Promise<number> {
    const results = await (this.db as any)
      .delete(notifications)
      .where(lte(notifications.expiresAt, new Date()))
      .returning();
    return results.length;
  }

  // ==========================================================================
  // Templates
  // ==========================================================================

  async findTemplateByCode(code: string, tenantId?: string): Promise<NotificationTemplate | null> {
    // First try tenant-specific template
    if (tenantId) {
      const tenantResults = await (this.db as any)
        .select()
        .from(notificationTemplates)
        .where(and(
          eq(notificationTemplates.code, code),
          eq(notificationTemplates.tenantId, tenantId),
          eq(notificationTemplates.isActive, true)
        ))
        .limit(1);
      
      if (tenantResults[0]) {
        return tenantResults[0];
      }
    }

    // Fall back to global template
    const globalResults = await (this.db as any)
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.code, code),
        isNull(notificationTemplates.tenantId),
        eq(notificationTemplates.isActive, true)
      ))
      .limit(1);

    return globalResults[0] ?? null;
  }

  async findAllTemplates(tenantId?: string): Promise<NotificationTemplate[]> {
    if (tenantId) {
      // Get both tenant-specific and global templates
      return (this.db as any)
        .select()
        .from(notificationTemplates)
        .where(sql`(${notificationTemplates.tenantId} = ${tenantId} OR ${notificationTemplates.tenantId} IS NULL)`)
        .orderBy(notificationTemplates.code);
    }

    // Global templates only
    return (this.db as any)
      .select()
      .from(notificationTemplates)
      .where(isNull(notificationTemplates.tenantId))
      .orderBy(notificationTemplates.code);
  }

  async createTemplate(data: NewNotificationTemplate): Promise<NotificationTemplate> {
    const results = await (this.db as any)
      .insert(notificationTemplates)
      .values(data)
      .returning();
    return results[0] as NotificationTemplate;
  }

  async updateTemplate(
    id: string,
    data: Partial<NewNotificationTemplate>
  ): Promise<NotificationTemplate | null> {
    const results = await (this.db as any)
      .update(notificationTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return results[0] ?? null;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    // Don't delete system templates
    const template = await (this.db as any)
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
      .limit(1);

    if (template[0]?.isSystem) {
      return false;
    }

    const results = await (this.db as any)
      .delete(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
      .returning();
    return results.length > 0;
  }

  // ==========================================================================
  // Delivery Logs
  // ==========================================================================

  async createDeliveryLog(data: NewNotificationDeliveryLog): Promise<NotificationDeliveryLog> {
    const results = await (this.db as any)
      .insert(notificationDeliveryLogs)
      .values(data)
      .returning();
    return results[0] as NotificationDeliveryLog;
  }

  async updateDeliveryLog(
    id: string,
    data: Partial<NewNotificationDeliveryLog>
  ): Promise<NotificationDeliveryLog | null> {
    const results = await (this.db as any)
      .update(notificationDeliveryLogs)
      .set(data)
      .where(eq(notificationDeliveryLogs.id, id))
      .returning();
    return results[0] ?? null;
  }

  async findDeliveryLogsByNotification(notificationId: string): Promise<NotificationDeliveryLog[]> {
    return (this.db as any)
      .select()
      .from(notificationDeliveryLogs)
      .where(eq(notificationDeliveryLogs.notificationId, notificationId))
      .orderBy(desc(notificationDeliveryLogs.createdAt));
  }

  async markDeliveryAsSent(
    id: string,
    messageId?: string
  ): Promise<NotificationDeliveryLog | null> {
    return this.updateDeliveryLog(id, {
      status: 'sent',
      sentAt: new Date(),
      providerMessageId: messageId,
    } as Partial<NewNotificationDeliveryLog>);
  }

  async markDeliveryAsDelivered(id: string): Promise<NotificationDeliveryLog | null> {
    return this.updateDeliveryLog(id, {
      status: 'delivered',
      deliveredAt: new Date(),
    } as Partial<NewNotificationDeliveryLog>);
  }

  async markDeliveryAsFailed(
    id: string,
    errorCode: string,
    errorMessage: string
  ): Promise<NotificationDeliveryLog | null> {
    const log = await (this.db as any)
      .select()
      .from(notificationDeliveryLogs)
      .where(eq(notificationDeliveryLogs.id, id))
      .limit(1);

    const currentRetryCount = log[0]?.retryCount ?? 0;

    return this.updateDeliveryLog(id, {
      status: 'failed',
      failedAt: new Date(),
      errorCode,
      errorMessage,
      retryCount: currentRetryCount + 1,
    } as Partial<NewNotificationDeliveryLog>);
  }

  // ==========================================================================
  // Queue
  // ==========================================================================

  async enqueue(data: NewNotificationQueueItem): Promise<NotificationQueueItem> {
    const results = await (this.db as any)
      .insert(notificationQueue)
      .values(data)
      .returning();
    return results[0] as NotificationQueueItem;
  }

  async findPendingQueueItems(limit: number = 100): Promise<NotificationQueueItem[]> {
    const now = new Date();
    return (this.db as any)
      .select()
      .from(notificationQueue)
      .where(and(
        eq(notificationQueue.status, 'pending'),
        sql`(${notificationQueue.scheduledFor} IS NULL OR ${notificationQueue.scheduledFor} <= ${now})`
      ))
      .orderBy(
        sql`CASE ${notificationQueue.priority} WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END`,
        notificationQueue.createdAt
      )
      .limit(limit);
  }

  async updateQueueItem(
    id: string,
    data: Partial<NewNotificationQueueItem>
  ): Promise<NotificationQueueItem | null> {
    const results = await (this.db as any)
      .update(notificationQueue)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationQueue.id, id))
      .returning();
    return results[0] ?? null;
  }

  async markQueueItemAsProcessing(id: string): Promise<NotificationQueueItem | null> {
    return this.updateQueueItem(id, { status: 'processing' as QueueStatus });
  }

  async markQueueItemAsCompleted(
    id: string,
    notificationId: string
  ): Promise<NotificationQueueItem | null> {
    return this.updateQueueItem(id, {
      status: 'completed' as QueueStatus,
      processedAt: new Date(),
      notificationId,
    });
  }

  async markQueueItemAsFailed(id: string, error: string): Promise<NotificationQueueItem | null> {
    const item = await (this.db as any)
      .select()
      .from(notificationQueue)
      .where(eq(notificationQueue.id, id))
      .limit(1);

    const currentRetryCount = item[0]?.retryCount ?? 0;
    const maxRetries = item[0]?.maxRetries ?? 3;

    const newStatus = currentRetryCount + 1 >= maxRetries ? 'failed' : 'pending';

    return this.updateQueueItem(id, {
      status: newStatus as QueueStatus,
      errorMessage: error,
      retryCount: currentRetryCount + 1,
    });
  }

  async deleteCompletedQueueItems(olderThanDays: number = 7): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const results = await (this.db as any)
      .delete(notificationQueue)
      .where(and(
        eq(notificationQueue.status, 'completed'),
        lte(notificationQueue.processedAt, cutoff)
      ))
      .returning();

    return results.length;
  }

  // ==========================================================================
  // Provider Configs
  // ==========================================================================

  async findEmailProviderConfig(tenantId: string): Promise<EmailProviderConfig | null> {
    const results = await (this.db as any)
      .select()
      .from(emailProviderConfigs)
      .where(and(
        eq(emailProviderConfigs.tenantId, tenantId),
        eq(emailProviderConfigs.isActive, true)
      ))
      .limit(1);
    return results[0] ?? null;
  }

  async findSmsProviderConfig(tenantId: string): Promise<SmsProviderConfig | null> {
    const results = await (this.db as any)
      .select()
      .from(smsProviderConfigs)
      .where(and(
        eq(smsProviderConfigs.tenantId, tenantId),
        eq(smsProviderConfigs.isActive, true)
      ))
      .limit(1);
    return results[0] ?? null;
  }

  async incrementEmailCount(tenantId: string): Promise<void> {
    await (this.db as any)
      .update(emailProviderConfigs)
      .set({
        dailyCount: sql`${emailProviderConfigs.dailyCount} + 1`,
        monthlyCount: sql`${emailProviderConfigs.monthlyCount} + 1`,
      })
      .where(eq(emailProviderConfigs.tenantId, tenantId));
  }

  async incrementSmsCount(tenantId: string): Promise<void> {
    await (this.db as any)
      .update(smsProviderConfigs)
      .set({
        dailyCount: sql`${smsProviderConfigs.dailyCount} + 1`,
        monthlyCount: sql`${smsProviderConfigs.monthlyCount} + 1`,
      })
      .where(eq(smsProviderConfigs.tenantId, tenantId));
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  async getNotificationStats(tenantId: string, userId?: string): Promise<{
    total: number;
    unread: number;
    last24Hours: number;
    last7Days: number;
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let baseCondition = eq(notifications.tenantId, tenantId);
    if (userId) {
      baseCondition = and(baseCondition, eq(notifications.userId, userId)) as any;
    }

    const [totalResult, unreadResult, last24hResult, last7dResult] = await Promise.all([
      (this.db as any).select({ count: count() }).from(notifications).where(baseCondition),
      (this.db as any).select({ count: count() }).from(notifications).where(and(baseCondition, isNull(notifications.readAt))),
      (this.db as any).select({ count: count() }).from(notifications).where(and(baseCondition, gte(notifications.createdAt, oneDayAgo))),
      (this.db as any).select({ count: count() }).from(notifications).where(and(baseCondition, gte(notifications.createdAt, sevenDaysAgo))),
    ]);

    return {
      total: totalResult[0]?.count ?? 0,
      unread: unreadResult[0]?.count ?? 0,
      last24Hours: last24hResult[0]?.count ?? 0,
      last7Days: last7dResult[0]?.count ?? 0,
    };
  }
}
