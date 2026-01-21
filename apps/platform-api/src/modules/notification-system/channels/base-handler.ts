/**
 * Base Channel Handler
 * Abstract base class for notification channel handlers
 */
import type { ChannelSendResult, NotificationChannel } from '../notification.types';

export abstract class BaseChannelHandler {
  abstract readonly channel: NotificationChannel;

  /**
   * Send a notification through this channel
   */
  abstract send(payload: unknown, tenantId: string): Promise<ChannelSendResult>;

  /**
   * Check if this channel is configured and available for the tenant
   */
  abstract isAvailable(tenantId: string): Promise<boolean>;

  /**
   * Get rate limit status for this channel
   */
  abstract getRateLimitStatus(tenantId: string): Promise<{
    withinLimit: boolean;
    remaining: number;
    resetsAt: Date;
  }>;

  /**
   * Validate the payload for this channel
   */
  abstract validatePayload(payload: unknown): boolean;
}
