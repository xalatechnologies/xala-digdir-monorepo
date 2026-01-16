/**
 * Delivery Service
 * Handles notification delivery with retry logic and exponential backoff
 */
import { Injectable, Inject } from '../../core/decorators';
import { NotificationRepository } from './notification.repository';

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  body: string;
  status: string;
  metadata?: any;
}

export interface DeliveryResult {
  success: boolean;
  notificationId: string;
  error?: string;
}

@Injectable()
export class DeliveryService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly BASE_DELAY_MINUTES = 1;

  constructor(
    @Inject('NotificationRepository') private readonly repository: NotificationRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Send notification via appropriate channel
   * @param notification - Notification to send
   * @returns Delivery result with success status
   */
  async sendNotification(notification: Notification): Promise<DeliveryResult> {
    try {
      if (notification.type === 'email') {
        await this.sendEmail(notification);
      } else if (notification.type === 'sms') {
        await this.sendSms(notification);
      } else {
        throw new Error(`Unsupported notification type: ${notification.type}`);
      }

      // Update notification status to sent
      await this.repository.updateStatus(notification.id, 'sent', {
        sentAt: new Date(),
      });

      this.adapters?.log?.info('Notification sent successfully', {
        notificationId: notification.id,
        type: notification.type,
        recipient: notification.recipient,
      });

      // Record successful delivery attempt
      await this.recordAttempt(notification.id, 'success', null);

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error: any) {
      this.adapters?.log?.error('Notification delivery failed', {
        notificationId: notification.id,
        type: notification.type,
        recipient: notification.recipient,
        error: error.message,
      });

      // Update notification status to failed
      await this.repository.updateStatus(notification.id, 'failed', {
        failedAt: new Date(),
      });

      // Record failed delivery attempt
      await this.recordAttempt(notification.id, 'failed', error.message);

      return {
        success: false,
        notificationId: notification.id,
        error: error.message,
      };
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    if (!this.adapters?.email) {
      throw new Error('Email adapter not configured');
    }

    await this.adapters.email.send({
      to: notification.recipient,
      subject: notification.subject || 'Notification',
      html: notification.body,
    });
  }

  /**
   * Send SMS notification
   */
  private async sendSms(notification: Notification): Promise<void> {
    if (!this.adapters?.sms) {
      throw new Error('SMS adapter not configured');
    }

    await this.adapters.sms.send({
      to: notification.recipient,
      message: notification.body,
    });
  }

  /**
   * Record delivery attempt in database
   * @param notificationId - ID of notification
   * @param status - Attempt status (success, failed)
   * @param error - Error message if failed
   */
  async recordAttempt(
    notificationId: string,
    status: 'success' | 'failed',
    error: string | null
  ): Promise<void> {
    // Get current attempt count
    const attempts = await this.repository.getDeliveryAttempts(notificationId);
    const attemptNumber = attempts.length + 1;

    // Calculate next retry time if failed and under max attempts
    let nextRetryAt: Date | null = null;
    if (status === 'failed' && attemptNumber < this.MAX_ATTEMPTS) {
      const delayMinutes = this.calculateNextRetryDelay(attemptNumber);
      nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    }

    await this.repository.createDeliveryAttempt({
      notificationId,
      attemptNumber,
      status,
      error,
      retriedAt: new Date(),
      nextRetryAt,
    });

    this.adapters?.log?.debug('Delivery attempt recorded', {
      notificationId,
      attemptNumber,
      status,
      nextRetryAt,
    });
  }

  /**
   * Calculate next retry delay using exponential backoff
   * Delays: 1min, 2min, 4min, 8min, 16min
   * @param attemptNumber - Current attempt number (1-based)
   * @returns Delay in minutes
   */
  calculateNextRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 2^(attemptNumber - 1) * BASE_DELAY_MINUTES
    // attemptNumber 1: 2^0 * 1 = 1 minute
    // attemptNumber 2: 2^1 * 1 = 2 minutes
    // attemptNumber 3: 2^2 * 1 = 4 minutes
    // attemptNumber 4: 2^3 * 1 = 8 minutes
    // attemptNumber 5: 2^4 * 1 = 16 minutes
    const delay = Math.pow(2, attemptNumber - 1) * this.BASE_DELAY_MINUTES;

    this.adapters?.log?.debug('Calculated retry delay', {
      attemptNumber,
      delayMinutes: delay,
    });

    return delay;
  }

  /**
   * Retry failed notifications that are ready for retry
   * @returns Array of retry results
   */
  async retryFailed(): Promise<DeliveryResult[]> {
    const failedNotifications = await this.repository.getFailedNotificationsForRetry();

    this.adapters?.log?.info('Retrying failed notifications', {
      count: failedNotifications.length,
    });

    const results: DeliveryResult[] = [];

    for (const item of failedNotifications) {
      const notification = item.notification;
      const lastAttempt = item.lastAttempt;

      // Check if we've exceeded max attempts
      if (lastAttempt && lastAttempt.attemptNumber >= this.MAX_ATTEMPTS) {
        this.adapters?.log?.warn('Max retry attempts reached', {
          notificationId: notification.id,
          attemptNumber: lastAttempt.attemptNumber,
        });
        continue;
      }

      // Retry sending
      const result = await this.sendNotification(notification as Notification);
      results.push(result);
    }

    this.adapters?.log?.info('Retry batch completed', {
      total: failedNotifications.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });

    return results;
  }

  /**
   * Get max retry attempts (for testing/configuration)
   */
  getMaxAttempts(): number {
    return this.MAX_ATTEMPTS;
  }

  /**
   * Get base delay in minutes (for testing/configuration)
   */
  getBaseDelay(): number {
    return this.BASE_DELAY_MINUTES;
  }
}
