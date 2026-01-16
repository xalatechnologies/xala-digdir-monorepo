/**
 * Notification Service
 * Main service for creating, sending, and managing notifications
 */
import { NotificationRepository } from './notification.repository';
import { NotificationDispatcher, type DispatchPayload } from './notification.dispatcher';
import { NotificationTemplateService } from './notification-template.service';
import type { PushNotificationsRepository } from '../push-notifications/push-notifications.repository';
import type {
  NotificationDTO,
  NotificationQueryParams,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStats,
} from './notification.types';

export interface UserInfo {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  locale?: 'nb' | 'en';
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  channelResults?: Map<NotificationChannel, { success: boolean; error?: string }>;
  error?: string;
}

export class NotificationService {
  private dispatcher: NotificationDispatcher;
  private templateService: NotificationTemplateService;

  constructor(
    private readonly repository: NotificationRepository,
    private readonly pushRepository: PushNotificationsRepository
  ) {
    this.dispatcher = new NotificationDispatcher(repository, pushRepository);
    this.templateService = new NotificationTemplateService(repository);
  }

  /**
   * Set WebSocket broadcast for real-time notifications
   */
  setWebSocketBroadcast(broadcast: (userId: string, event: string, data: unknown) => void): void {
    this.dispatcher.setWebSocketBroadcast(broadcast);
  }

  // ==========================================================================
  // Core Notification Methods
  // ==========================================================================

  /**
   * Send a notification using a template
   */
  async notify(
    tenantId: string,
    user: UserInfo,
    type: NotificationType | string,
    variables: Record<string, string | number | boolean>,
    options: {
      channels?: NotificationChannel[];
      priority?: NotificationPriority;
      relatedEntityType?: string;
      relatedEntityId?: string;
      scheduledFor?: Date;
    } = {}
  ): Promise<NotificationResult> {
    try {
      // Render templates for all requested channels
      const locale = user.locale || 'nb';
      const rendered = await this.templateService.renderAllChannels(type, variables, locale, tenantId);

      if (!rendered.email && !rendered.sms && !rendered.push && !rendered.inApp) {
        return { success: false, error: 'No template content available for any channel' };
      }

      // Determine which channels to use
      const channels = options.channels || await this.getDefaultChannels(type, tenantId);

      // Build dispatch payload
      const dispatchPayload: DispatchPayload = {
        tenantId,
        userId: user.id,
        userEmail: user.email,
        userPhone: user.phone,
        channels,
        title: rendered.inApp?.title || rendered.push?.title || rendered.email?.subject || type,
        message: rendered.inApp?.body || rendered.push?.body || rendered.email?.body || '',
        emailSubject: rendered.email?.subject,
        emailHtml: rendered.email?.body, // In production, use HTML template
        priority: options.priority || 'normal',
        actionUrl: this.buildActionUrl(options.relatedEntityType, options.relatedEntityId),
        metadata: {
          type,
          variables,
          relatedEntityType: options.relatedEntityType,
          relatedEntityId: options.relatedEntityId,
        },
      };

      // Schedule for later if requested
      if (options.scheduledFor && options.scheduledFor > new Date()) {
        await this.scheduleNotification(dispatchPayload, options.scheduledFor);
        return { success: true };
      }

      // Dispatch immediately
      const result = await this.dispatcher.dispatch(dispatchPayload);

      return {
        success: result.overallSuccess,
        notificationId: result.notificationId,
        channelResults: result.channelResults,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Notification failed',
      };
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  async scheduleNotification(payload: DispatchPayload, scheduledFor: Date): Promise<string> {
    const queueItem = await this.repository.enqueue({
      tenantId: payload.tenantId,
      userId: payload.userId,
      organizationId: undefined,
      type: payload.metadata?.type as string || 'custom',
      channels: payload.channels,
      templateVariables: payload.metadata || {},
      relatedEntityType: payload.metadata?.relatedEntityType as string | undefined,
      relatedEntityId: payload.metadata?.relatedEntityId as string | undefined,
      priority: payload.priority,
      scheduledFor,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
    });
    return queueItem.id;
  }

  /**
   * Process pending queue items (called by worker)
   */
  async processQueue(limit: number = 100): Promise<{ processed: number; failed: number }> {
    const items = await this.repository.findPendingQueueItems(limit);
    let processed = 0;
    let failed = 0;

    for (const item of items) {
      try {
        await this.repository.markQueueItemAsProcessing(item.id);

        // TODO: Get user info from user service
        const userInfo: UserInfo = { id: item.userId };

        const result = await this.notify(
          item.tenantId,
          userInfo,
          item.type,
          (item.templateVariables as Record<string, string | number | boolean>) || {},
          {
            channels: item.channels as NotificationChannel[],
            priority: item.priority as NotificationPriority,
            relatedEntityType: item.relatedEntityType || undefined,
            relatedEntityId: item.relatedEntityId || undefined,
          }
        );

        if (result.success) {
          await this.repository.markQueueItemAsCompleted(item.id, result.notificationId || '');
          processed++;
        } else {
          await this.repository.markQueueItemAsFailed(item.id, result.error || 'Unknown error');
          failed++;
        }
      } catch (error) {
        await this.repository.markQueueItemAsFailed(
          item.id,
          error instanceof Error ? error.message : 'Processing failed'
        );
        failed++;
      }
    }

    return { processed, failed };
  }

  // ==========================================================================
  // User Notification Methods
  // ==========================================================================

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    tenantId: string,
    userId: string,
    params: NotificationQueryParams = {}
  ): Promise<{ notifications: NotificationDTO[]; total: number }> {
    const notifications = await this.repository.findNotificationsByUser(tenantId, userId, params);
    const stats = await this.repository.getNotificationStats(tenantId, userId);

    return {
      notifications: notifications.map(this.mapNotificationToDTO),
      total: params.unreadOnly ? stats.unread : stats.total,
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.repository.countUnreadNotifications(tenantId, userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const result = await this.repository.markAsRead(notificationId);
    return result !== null;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(tenantId: string, userId: string): Promise<number> {
    return this.repository.markAllAsRead(tenantId, userId);
  }

  /**
   * Dismiss a notification
   */
  async dismiss(notificationId: string): Promise<boolean> {
    const result = await this.repository.dismissNotification(notificationId);
    return result !== null;
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string): Promise<boolean> {
    return this.repository.deleteNotification(notificationId);
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get notification statistics
   */
  async getStats(tenantId: string, userId?: string): Promise<NotificationStats> {
    const stats = await this.repository.getNotificationStats(tenantId, userId);
    return {
      total: stats.total,
      unread: stats.unread,
      byType: {}, // TODO: Implement type breakdown
      byPriority: {}, // TODO: Implement priority breakdown
      last24Hours: stats.last24Hours,
      last7Days: stats.last7Days,
    };
  }

  // ==========================================================================
  // Template Access
  // ==========================================================================

  /**
   * Get template service for direct template management
   */
  getTemplateService(): NotificationTemplateService {
    return this.templateService;
  }

  /**
   * Get dispatcher for direct channel access
   */
  getDispatcher(): NotificationDispatcher {
    return this.dispatcher;
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private async getDefaultChannels(
    type: NotificationType | string,
    _tenantId: string
  ): Promise<NotificationChannel[]> {
    // Default channel selection based on notification type
    const defaults: Record<string, NotificationChannel[]> = {
      request_received: ['in_app', 'email'],
      approved: ['in_app', 'email'],
      rejected: ['in_app', 'email'],
      request_more_info: ['in_app', 'email'],
      booking_changed: ['in_app', 'email', 'sms'],
      cancelled: ['in_app', 'email', 'sms'],
      reminder_24h: ['in_app', 'sms'],
      reminder_2h: ['in_app', 'sms'],
      invoice_available: ['in_app', 'email'],
      payment_status: ['in_app', 'email'],
    };

    return defaults[type] || ['in_app'];
  }

  private buildActionUrl(entityType?: string, entityId?: string): string | undefined {
    if (!entityType || !entityId) return undefined;

    const routes: Record<string, string> = {
      booking: `/bookings/${entityId}`,
      listing: `/rental-objects/${entityId}`, // Backward compatibility alias
      'rental-object': `/rental-objects/${entityId}`,
      organization: `/org/${entityId}`,
      invoice: `/billing/invoices/${entityId}`,
      season: `/seasons/${entityId}`,
    };

    return routes[entityType];
  }

  private mapNotificationToDTO(notification: {
    id: string;
    tenantId: string;
    userId: string;
    organizationId: string | null;
    type: string;
    title: string;
    message: string;
    priority: string;
    relatedEntityType: string | null;
    relatedEntityId: string | null;
    actionUrl: string | null;
    metadata: unknown;
    readAt: Date | null;
    dismissedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
  }): NotificationDTO {
    return {
      id: notification.id,
      tenantId: notification.tenantId,
      userId: notification.userId,
      organizationId: notification.organizationId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority as NotificationPriority,
      relatedEntityType: notification.relatedEntityType,
      relatedEntityId: notification.relatedEntityId,
      actionUrl: notification.actionUrl,
      metadata: (notification.metadata as Record<string, unknown>) || {},
      readAt: notification.readAt?.toISOString() || null,
      dismissedAt: notification.dismissedAt?.toISOString() || null,
      expiresAt: notification.expiresAt?.toISOString() || null,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
