/**
 * Notifications Controller
 * Notification delivery management endpoints with deduplication
 *
 * Endpoints:
 * - POST /api/notifications/send - Send a new notification
 * - GET /api/notifications/delivery-status/:id - Get delivery status for a notification
 * - GET /api/notifications/delivery-reports - Get delivery reports with filters
 * - POST /api/notifications/retry-failed - Retry all failed deliveries
 * - GET /api/notifications/my - Get current user's notifications (legacy)
 * - GET /api/notifications/unread-count - Get unread notification count (legacy)
 * - POST /api/notifications/:id/read - Mark notification as read (legacy)
 * - POST /api/notifications/read-all - Mark all notifications as read (legacy)
 * - DELETE /api/notifications/:id - Delete a notification (legacy)
 */

import { Controller, Get, Post, Delete, Inject } from '../../core/decorators';
import { NotificationService } from './notification.service';
import { validate } from '../../core/validation/zod-pipe';
import { getTenantId, getOptionalUserId, type TenantRequest } from '../../core/validation/tenant';
import {
  SendNotificationSchema,
  DeliveryReportQuerySchema,
} from '../../schemas/notification.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Mock notifications for legacy endpoints (kept for backward compatibility)
interface Notification {
  id: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'message_received' | 'system_alert' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your booking for Hall A has been confirmed for January 15, 2026.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    data: { bookingId: 'booking-123', listingName: 'Hall A' },
  },
  {
    id: 'notif-2',
    type: 'message_received',
    title: 'New Message',
    message: 'You have a new message from Skien Kommune.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data: { senderId: 'org-456', senderName: 'Skien Kommune' },
  },
  {
    id: 'notif-3',
    type: 'reminder',
    title: 'Upcoming Booking',
    message: 'Reminder: You have a booking tomorrow at 10:00.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    data: { bookingId: 'booking-789' },
  },
  {
    id: 'notif-4',
    type: 'system_alert',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on January 20, 2026 from 02:00-04:00.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

@Controller('/api/notifications')
export class NotificationsController {
  constructor(
    @Inject('NotificationService') private readonly service: NotificationService
  ) {}

  /**
   * POST /api/notifications/send
   * Send a new notification with deduplication
   */
  @Post('/send')
  async send(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getOptionalUserId(request);
    const data = validate(SendNotificationSchema, request.body);

    const result = await this.service.sendNotification(tenantId, {
      ...data,
      userId,
    });

    if (result.success) {
      return reply.status(201).send({
        data: {
          notificationId: result.notificationId,
          message: result.message,
        },
      });
    } else {
      // Duplicate or failure
      const statusCode = result.isDuplicate ? 409 : 500;
      return reply.status(statusCode).send({
        error: result.isDuplicate ? 'duplicate_notification' : 'delivery_failed',
        message: result.message,
        ...(result.existingNotificationId && {
          existingNotificationId: result.existingNotificationId,
        }),
      });
    }
  }

  /**
   * GET /api/notifications/delivery-status/:id
   * Get delivery status for a specific notification
   */
  @Get('/delivery-status/:id')
  async getDeliveryStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const status = await this.service.getDeliveryStatus(request.params.id);
    return reply.send({ data: status });
  }

  /**
   * GET /api/notifications/delivery-reports
   * Get delivery reports with filters
   */
  @Get('/delivery-reports')
  async getDeliveryReports(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = validate(DeliveryReportQuerySchema, request.query);

    const result = await this.service.getDeliveryReports(tenantId, params);

    return reply.send({
      data: result.data,
      meta: {
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    });
  }

  /**
   * POST /api/notifications/retry-failed
   * Retry all failed deliveries that are ready for retry
   */
  @Post('/retry-failed')
  async retryFailed(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.retryFailedDeliveries();

    return reply.send({
      data: {
        retriedCount: result.retriedCount,
        successCount: result.successCount,
        failureCount: result.failureCount,
        message: `Retried ${result.retriedCount} notifications: ${result.successCount} successful, ${result.failureCount} failed`,
      },
    });
  }

  /**
   * GET /api/notifications/my
   * Get current user's notifications (legacy endpoint)
   */
  @Get('/my')
  async getMyNotifications(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string; offset?: string; unread_only?: string };
    const limit = parseInt(query.limit || '20', 10);
    const offset = parseInt(query.offset || '0', 10);
    const unreadOnly = query.unread_only === 'true';

    let notifications = [...mockNotifications];

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    // Sort by createdAt descending
    notifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginated = notifications.slice(offset, offset + limit);

    return reply.send({
      data: paginated,
      meta: {
        total: notifications.length,
        limit,
        offset,
        hasMore: offset + limit < notifications.length,
      },
    });
  }

  /**
   * GET /api/notifications/unread-count
   * Get count of unread notifications (legacy endpoint)
   */
  @Get('/unread-count')
  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    const unreadCount = mockNotifications.filter(n => !n.read).length;

    return reply.send({
      data: {
        count: unreadCount,
        lastCheckedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * GET /api/notifications/:id
   * Get a single notification by ID (legacy endpoint)
   */
  @Get('/:id')
  async getNotification(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const notification = mockNotifications.find(n => n.id === id);

    if (!notification) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Notification ${id} not found`,
      });
    }

    return reply.send({ data: notification });
  }

  /**
   * POST /api/notifications/:id/read
   * Mark a notification as read (legacy endpoint)
   */
  @Post('/:id/read')
  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const notification = mockNotifications.find(n => n.id === id);

    if (!notification) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Notification ${id} not found`,
      });
    }

    notification.read = true;

    return reply.send({
      data: notification,
      message: 'Notification marked as read',
    });
  }

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read (legacy endpoint)
   */
  @Post('/read-all')
  async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    const updatedCount = mockNotifications.filter(n => !n.read).length;

    for (const notification of mockNotifications) {
      notification.read = true;
    }

    return reply.send({
      data: {
        updatedCount,
        message: `Marked ${updatedCount} notifications as read`,
      },
    });
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification (legacy endpoint)
   */
  @Delete('/:id')
  async deleteNotification(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const index = mockNotifications.findIndex(n => n.id === id);

    if (index === -1) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Notification ${id} not found`,
      });
    }

    mockNotifications.splice(index, 1);

    return reply.send({
      message: 'Notification deleted',
    });
  }
}

export default NotificationsController;
