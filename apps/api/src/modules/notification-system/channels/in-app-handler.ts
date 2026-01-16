/**
 * In-App Channel Handler
 * Handles in-app notifications stored in database and broadcast via WebSocket
 */
import { BaseChannelHandler } from './base-handler';
import type { NotificationChannel, ChannelSendResult, InAppPayload } from '../notification.types';
import type { NotificationRepository } from '../notification.repository';

// WebSocket broadcast function type - will be injected
type WebSocketBroadcast = (userId: string, event: string, data: unknown) => void;

export class InAppHandler extends BaseChannelHandler {
  readonly channel: NotificationChannel = 'in_app';
  private broadcast?: WebSocketBroadcast;

  constructor(private readonly repository: NotificationRepository) {
    super();
  }

  /**
   * Set the WebSocket broadcast function for real-time delivery
   */
  setBroadcast(broadcast: WebSocketBroadcast): void {
    this.broadcast = broadcast;
  }

  async send(payload: InAppPayload, tenantId: string): Promise<ChannelSendResult> {
    if (!this.validatePayload(payload)) {
      return {
        success: false,
        error: 'Invalid in-app notification payload',
        errorCode: 'INVALID_PAYLOAD',
      };
    }

    try {
      // Create the notification in the database
      const notification = await this.repository.createNotification({
        tenantId,
        userId: payload.userId,
        type: 'in_app',
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        actionUrl: payload.actionUrl,
        metadata: payload.metadata || {},
      });

      // Broadcast via WebSocket if available
      if (this.broadcast) {
        this.broadcast(payload.userId, 'notification:new', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata,
          createdAt: notification.createdAt.toISOString(),
        });
      }

      return {
        success: true,
        messageId: notification.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create in-app notification',
        errorCode: 'CREATE_FAILED',
      };
    }
  }

  async isAvailable(_tenantId: string): Promise<boolean> {
    // In-app notifications are always available
    return true;
  }

  async getRateLimitStatus(_tenantId: string): Promise<{
    withinLimit: boolean;
    remaining: number;
    resetsAt: Date;
  }> {
    // No rate limiting for in-app notifications
    return {
      withinLimit: true,
      remaining: Infinity,
      resetsAt: new Date(Date.now() + 86400000), // 24 hours from now
    };
  }

  validatePayload(payload: unknown): payload is InAppPayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
      typeof p.userId === 'string' &&
      typeof p.title === 'string' &&
      typeof p.message === 'string' &&
      typeof p.priority === 'string'
    );
  }
}
