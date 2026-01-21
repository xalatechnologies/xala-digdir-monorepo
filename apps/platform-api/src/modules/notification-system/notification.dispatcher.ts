/**
 * Notification Dispatcher
 * Routes notifications to appropriate channels based on user preferences
 */
import { EmailHandler, SMSHandler, InAppHandler, PushHandler } from './channels';
import type { NotificationRepository } from './notification.repository';
import type { PushNotificationsRepository } from '../push-notifications/push-notifications.repository';
import type {
  NotificationChannel,
  ChannelSendResult,
  EmailPayload,
  SMSPayload,
  InAppPayload,
  PushPayload,
  NotificationPriority,
} from './notification.types';

export interface DispatchResult {
  notificationId: string;
  channelResults: Map<NotificationChannel, ChannelSendResult>;
  overallSuccess: boolean;
}

export interface DispatchPayload {
  tenantId: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  channels: NotificationChannel[];
  title: string;
  message: string;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  // For email
  emailSubject?: string;
  emailHtml?: string;
}

export class NotificationDispatcher {
  private emailHandler: EmailHandler;
  private smsHandler: SMSHandler;
  private inAppHandler: InAppHandler;
  private pushHandler: PushHandler;

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly pushRepository: PushNotificationsRepository
  ) {
    this.emailHandler = new EmailHandler(notificationRepository);
    this.smsHandler = new SMSHandler(notificationRepository);
    this.inAppHandler = new InAppHandler(notificationRepository);
    this.pushHandler = new PushHandler(pushRepository);
  }

  /**
   * Set WebSocket broadcast function for real-time in-app notifications
   */
  setWebSocketBroadcast(broadcast: (userId: string, event: string, data: unknown) => void): void {
    this.inAppHandler.setBroadcast(broadcast);
  }

  /**
   * Dispatch a notification to specified channels
   */
  async dispatch(payload: DispatchPayload): Promise<DispatchResult> {
    const channelResults = new Map<NotificationChannel, ChannelSendResult>();
    let notificationId = '';

    // Process each channel
    for (const channel of payload.channels) {
      const result = await this.sendToChannel(channel, payload);
      channelResults.set(channel, result);

      // Store the notification ID from in-app handler
      if (channel === 'in_app' && result.success && result.messageId) {
        notificationId = result.messageId;
      }
    }

    // If no in-app notification was created, create a record for tracking
    if (!notificationId && channelResults.size > 0) {
      const notification = await this.notificationRepository.createNotification({
        tenantId: payload.tenantId,
        userId: payload.userId,
        type: 'system',
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        actionUrl: payload.actionUrl,
        metadata: payload.metadata || {},
      });
      notificationId = notification.id;
    }

    // Create delivery logs for each channel
    for (const [channel, result] of channelResults) {
      await this.notificationRepository.createDeliveryLog({
        tenantId: payload.tenantId,
        notificationId,
        channel,
        status: result.success ? 'sent' : 'failed',
        recipientAddress: this.getRecipientAddress(channel, payload),
        providerMessageId: result.messageId,
        errorCode: result.errorCode,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : undefined,
        failedAt: result.success ? undefined : new Date(),
      });
    }

    const overallSuccess = Array.from(channelResults.values()).some((r) => r.success);

    return {
      notificationId,
      channelResults,
      overallSuccess,
    };
  }

  private async sendToChannel(
    channel: NotificationChannel,
    payload: DispatchPayload
  ): Promise<ChannelSendResult> {
    switch (channel) {
      case 'email':
        return this.sendEmail(payload);
      case 'sms':
        return this.sendSms(payload);
      case 'in_app':
        return this.sendInApp(payload);
      case 'push':
        return this.sendPush(payload);
      default:
        return {
          success: false,
          error: `Unknown channel: ${channel}`,
          errorCode: 'UNKNOWN_CHANNEL',
        };
    }
  }

  private async sendEmail(payload: DispatchPayload): Promise<ChannelSendResult> {
    if (!payload.userEmail) {
      return {
        success: false,
        error: 'Email address not provided',
        errorCode: 'MISSING_EMAIL',
      };
    }

    const emailPayload: EmailPayload = {
      to: payload.userEmail,
      subject: payload.emailSubject || payload.title,
      body: payload.message,
      html: payload.emailHtml,
    };

    return this.emailHandler.send(emailPayload, payload.tenantId);
  }

  private async sendSms(payload: DispatchPayload): Promise<ChannelSendResult> {
    if (!payload.userPhone) {
      return {
        success: false,
        error: 'Phone number not provided',
        errorCode: 'MISSING_PHONE',
      };
    }

    // SMS messages have a 160 character limit for single segment
    let message = payload.message;
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    const smsPayload: SMSPayload = {
      to: payload.userPhone,
      message,
    };

    return this.smsHandler.send(smsPayload, payload.tenantId);
  }

  private async sendInApp(payload: DispatchPayload): Promise<ChannelSendResult> {
    const inAppPayload: InAppPayload = {
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      priority: payload.priority,
      actionUrl: payload.actionUrl,
      metadata: payload.metadata,
    };

    return this.inAppHandler.send(inAppPayload, payload.tenantId);
  }

  private async sendPush(payload: DispatchPayload): Promise<ChannelSendResult> {
    const pushPayload: PushPayload & { userId: string } = {
      userId: payload.userId,
      title: payload.title,
      body: payload.message,
      data: {
        actionUrl: payload.actionUrl,
        ...payload.metadata,
      },
    };

    return this.pushHandler.send(pushPayload, payload.tenantId);
  }

  private getRecipientAddress(channel: NotificationChannel, payload: DispatchPayload): string | undefined {
    switch (channel) {
      case 'email':
        return payload.userEmail;
      case 'sms':
        return payload.userPhone;
      case 'in_app':
      case 'push':
        return payload.userId;
      default:
        return undefined;
    }
  }

  /**
   * Check which channels are available for a tenant
   */
  async getAvailableChannels(tenantId: string): Promise<NotificationChannel[]> {
    const channels: NotificationChannel[] = [];

    if (await this.emailHandler.isAvailable(tenantId)) {
      channels.push('email');
    }
    if (await this.smsHandler.isAvailable(tenantId)) {
      channels.push('sms');
    }
    if (await this.inAppHandler.isAvailable(tenantId)) {
      channels.push('in_app');
    }
    if (await this.pushHandler.isAvailable(tenantId)) {
      channels.push('push');
    }

    return channels;
  }

  /**
   * Get rate limit status for all channels
   */
  async getRateLimits(tenantId: string): Promise<Map<NotificationChannel, { remaining: number; resetsAt: Date }>> {
    const limits = new Map<NotificationChannel, { remaining: number; resetsAt: Date }>();

    const [emailLimit, smsLimit, inAppLimit, pushLimit] = await Promise.all([
      this.emailHandler.getRateLimitStatus(tenantId),
      this.smsHandler.getRateLimitStatus(tenantId),
      this.inAppHandler.getRateLimitStatus(tenantId),
      this.pushHandler.getRateLimitStatus(tenantId),
    ]);

    limits.set('email', { remaining: emailLimit.remaining, resetsAt: emailLimit.resetsAt });
    limits.set('sms', { remaining: smsLimit.remaining, resetsAt: smsLimit.resetsAt });
    limits.set('in_app', { remaining: inAppLimit.remaining, resetsAt: inAppLimit.resetsAt });
    limits.set('push', { remaining: pushLimit.remaining, resetsAt: pushLimit.resetsAt });

    return limits;
  }
}
