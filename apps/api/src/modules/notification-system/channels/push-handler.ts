/**
 * Push Channel Handler
 * Handles browser push notifications via Web Push API
 */
import { BaseChannelHandler } from './base-handler';
import type { NotificationChannel, ChannelSendResult, PushPayload } from '../notification.types';
import type { PushNotificationsRepository } from '../../push-notifications/push-notifications.repository';

export class PushHandler extends BaseChannelHandler {
  readonly channel: NotificationChannel = 'push';
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor(private readonly pushRepository: PushNotificationsRepository) {
    super();
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
  }

  async send(payload: PushPayload & { userId: string }, tenantId: string): Promise<ChannelSendResult> {
    if (!this.validatePayload(payload)) {
      return {
        success: false,
        error: 'Invalid push notification payload',
        errorCode: 'INVALID_PAYLOAD',
      };
    }

    // Check if VAPID keys are configured
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      return {
        success: false,
        error: 'VAPID keys not configured',
        errorCode: 'VAPID_NOT_CONFIGURED',
      };
    }

    try {
      // Get all active subscriptions for the user
      const subscriptions = await this.pushRepository.findPushSubscriptionsByUser(
        tenantId,
        payload.userId
      );

      if (subscriptions.length === 0) {
        return {
          success: false,
          error: 'No push subscriptions found for user',
          errorCode: 'NO_SUBSCRIPTIONS',
        };
      }

      const results: ChannelSendResult[] = [];

      // Send to all user's devices
      for (const subscription of subscriptions) {
        if (!subscription.isActive) continue;

        const result = await this.sendToSubscription(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        );

        results.push(result);

        // Update subscription last used
        if (result.success) {
          await this.pushRepository.markSubscriptionUsed(subscription.id);
        }
      }

      // Return success if at least one succeeded
      const anySuccess = results.some((r) => r.success);
      if (anySuccess) {
        return {
          success: true,
          messageId: `push-${Date.now()}-${results.filter((r) => r.success).length}`,
        };
      }

      return {
        success: false,
        error: 'All push attempts failed',
        errorCode: 'ALL_FAILED',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push send failed',
        errorCode: 'SEND_FAILED',
      };
    }
  }

  private async sendToSubscription(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: PushPayload
  ): Promise<ChannelSendResult> {
    try {
      // In production, use web-push library
      // For now, log and simulate success
      console.log('[PUSH] Sending to subscription:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        title: payload.title,
        body: payload.body.substring(0, 50),
      });

      // Simulate web-push send
      // In production:
      // const webpush = require('web-push');
      // webpush.setVapidDetails('mailto:support@digilist.no', this.vapidPublicKey, this.vapidPrivateKey);
      // await webpush.sendNotification(subscription, JSON.stringify({
      //   title: payload.title,
      //   body: payload.body,
      //   icon: payload.icon,
      //   badge: payload.badge,
      //   data: payload.data,
      // }));

      return { success: true, messageId: `push-${Date.now()}` };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push send failed',
        errorCode: 'PUSH_FAILED',
      };
    }
  }

  async isAvailable(tenantId: string): Promise<boolean> {
    return Boolean(this.vapidPublicKey && this.vapidPrivateKey);
  }

  async getRateLimitStatus(_tenantId: string): Promise<{
    withinLimit: boolean;
    remaining: number;
    resetsAt: Date;
  }> {
    // Push notifications have generous limits
    return {
      withinLimit: true,
      remaining: 10000,
      resetsAt: new Date(Date.now() + 86400000),
    };
  }

  validatePayload(payload: unknown): payload is PushPayload & { userId: string } {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
      typeof p.userId === 'string' &&
      typeof p.title === 'string' &&
      typeof p.body === 'string'
    );
  }
}
