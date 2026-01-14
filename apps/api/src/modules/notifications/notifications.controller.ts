/**
 * Notifications Controller
 * User notification management endpoints
 * 
 * Endpoints:
 * - GET /api/notifications/my - Get current user's notifications
 * - GET /api/notifications/unread-count - Get unread notification count
 * - POST /api/notifications/:id/read - Mark notification as read
 * - POST /api/notifications/read-all - Mark all notifications as read
 * - DELETE /api/notifications/:id - Delete a notification
 */

import { Controller, Get, Post, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface Notification {
  id: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'message_received' | 'system_alert' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// Mock notifications for demo
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
  /**
   * GET /api/notifications/my
   * Get current user's notifications
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
   * Get count of unread notifications
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
   * Get a single notification by ID
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
   * Mark a notification as read
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
   * Mark all notifications as read
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
   * Delete a notification
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
