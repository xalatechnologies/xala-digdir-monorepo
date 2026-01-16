/**
 * Notification System Controller
 * REST API endpoints for the notification system
 */
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { NotificationService } from './notification.service';
import type {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  CreateTemplateDTO,
  UpdateTemplateDTO,
} from './notification.types';

// Request types
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    tenantId: string;
    email?: string;
    phone?: string;
    name?: string;
    locale?: 'nb' | 'en';
    role?: string;
  };
}

interface NotificationQueryParams {
  type?: NotificationType;
  priority?: NotificationPriority;
  unreadOnly?: string;
  limit?: string;
  offset?: string;
}

interface SendNotificationBody {
  userId: string;
  type: NotificationType | string;
  variables: Record<string, string | number | boolean>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  scheduledFor?: string;
}

interface BroadcastNotificationBody {
  userIds: string[];
  type: NotificationType | string;
  variables: Record<string, string | number | boolean>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
}

export class NotificationSystemController {
  constructor(private readonly service: NotificationService) {}

  /**
   * Register all routes
   */
  registerRoutes(fastify: FastifyInstance): void {
    // User notifications
    fastify.get('/api/notifications', this.getUserNotifications.bind(this));
    fastify.get('/api/notifications/count', this.getUnreadCount.bind(this));
    fastify.get('/api/notifications/stats', this.getStats.bind(this));
    fastify.get('/api/notifications/:id', this.getNotification.bind(this));
    fastify.put('/api/notifications/:id/read', this.markAsRead.bind(this));
    fastify.put('/api/notifications/read-all', this.markAllAsRead.bind(this));
    fastify.put('/api/notifications/:id/dismiss', this.dismiss.bind(this));
    fastify.delete('/api/notifications/:id', this.deleteNotification.bind(this));

    // Send notifications (admin/system)
    fastify.post('/api/notifications/send', this.sendNotification.bind(this));
    fastify.post('/api/notifications/broadcast', this.broadcastNotification.bind(this));

    // Templates (admin)
    fastify.get('/api/notification-templates', this.getTemplates.bind(this));
    fastify.get('/api/notification-templates/:code', this.getTemplate.bind(this));
    fastify.post('/api/notification-templates', this.createTemplate.bind(this));
    fastify.put('/api/notification-templates/:id', this.updateTemplate.bind(this));
    fastify.delete('/api/notification-templates/:id', this.deleteTemplate.bind(this));
    fastify.post('/api/notification-templates/:code/preview', this.previewTemplate.bind(this));

    // Channel configuration
    fastify.get('/api/notifications/channels', this.getAvailableChannels.bind(this));
    fastify.get('/api/notifications/rate-limits', this.getRateLimits.bind(this));
  }

  // ==========================================================================
  // User Notifications
  // ==========================================================================

  async getUserNotifications(
    request: AuthenticatedRequest & { Querystring: NotificationQueryParams },
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { type, priority, unreadOnly, limit, offset } = request.query as NotificationQueryParams;

    const result = await this.service.getUserNotifications(
      request.user.tenantId,
      request.user.id,
      {
        type: type as NotificationType | undefined,
        priority: priority as NotificationPriority | undefined,
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      }
    );

    return reply.send(result);
  }

  async getUnreadCount(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const count = await this.service.getUnreadCount(request.user.tenantId, request.user.id);
    return reply.send({ count });
  }

  async getStats(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const stats = await this.service.getStats(request.user.tenantId, request.user.id);
    return reply.send(stats);
  }

  async getNotification(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = request.params;
    const result = await this.service.getUserNotifications(
      request.user.tenantId,
      request.user.id,
      { limit: 1 }
    );

    const notification = result.notifications.find((n) => n.id === id);
    if (!notification) {
      return reply.status(404).send({ error: 'Notification not found' });
    }

    return reply.send(notification);
  }

  async markAsRead(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const success = await this.service.markAsRead(request.params.id);
    if (!success) {
      return reply.status(404).send({ error: 'Notification not found' });
    }

    return reply.send({ success: true });
  }

  async markAllAsRead(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const count = await this.service.markAllAsRead(request.user.tenantId, request.user.id);
    return reply.send({ success: true, count });
  }

  async dismiss(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const success = await this.service.dismiss(request.params.id);
    if (!success) {
      return reply.status(404).send({ error: 'Notification not found' });
    }

    return reply.send({ success: true });
  }

  async deleteNotification(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const success = await this.service.delete(request.params.id);
    if (!success) {
      return reply.status(404).send({ error: 'Notification not found' });
    }

    return reply.status(204).send();
  }

  // ==========================================================================
  // Send Notifications
  // ==========================================================================

  async sendNotification(
    request: AuthenticatedRequest & FastifyRequest<{ Body: SendNotificationBody }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Only admins can send notifications
    if (request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const body = request.body;

    // TODO: Get user info from user service
    const userInfo = {
      id: body.userId,
      // email, phone, name would come from user lookup
    };

    const result = await this.service.notify(
      request.user.tenantId,
      userInfo,
      body.type,
      body.variables,
      {
        channels: body.channels,
        priority: body.priority,
        relatedEntityType: body.relatedEntityType,
        relatedEntityId: body.relatedEntityId,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      }
    );

    if (!result.success) {
      return reply.status(500).send({ error: result.error });
    }

    return reply.status(201).send({
      success: true,
      notificationId: result.notificationId,
    });
  }

  async broadcastNotification(
    request: AuthenticatedRequest & FastifyRequest<{ Body: BroadcastNotificationBody }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Only admins can broadcast
    if (request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const body = request.body;
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];

    for (const userId of body.userIds) {
      const result = await this.service.notify(
        request.user.tenantId,
        { id: userId },
        body.type,
        body.variables,
        {
          channels: body.channels,
          priority: body.priority,
        }
      );

      results.push({
        userId,
        success: result.success,
        error: result.error,
      });
    }

    const successCount = results.filter((r) => r.success).length;

    return reply.status(200).send({
      success: successCount > 0,
      total: body.userIds.length,
      sent: successCount,
      failed: body.userIds.length - successCount,
      results,
    });
  }

  // ==========================================================================
  // Templates
  // ==========================================================================

  async getTemplates(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const templates = await this.service.getTemplateService().getAllTemplates(request.user.tenantId);
    return reply.send({ templates });
  }

  async getTemplate(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { code: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const template = await this.service
      .getTemplateService()
      .getTemplate(request.params.code, request.user.tenantId);

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    return reply.send(template);
  }

  async createTemplate(
    request: AuthenticatedRequest & FastifyRequest<{ Body: CreateTemplateDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const template = await this.service.getTemplateService().createTemplate({
      ...request.body,
      tenantId: request.user.tenantId,
    });

    return reply.status(201).send(template);
  }

  async updateTemplate(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string }; Body: UpdateTemplateDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const template = await this.service
      .getTemplateService()
      .updateTemplate(request.params.id, request.body);

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    return reply.send(template);
  }

  async deleteTemplate(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const success = await this.service.getTemplateService().deleteTemplate(request.params.id);

    if (!success) {
      return reply.status(400).send({ error: 'Cannot delete system template or template not found' });
    }

    return reply.status(204).send();
  }

  async previewTemplate(
    request: AuthenticatedRequest &
      FastifyRequest<{
        Params: { code: string };
        Body: { variables: Record<string, string | number | boolean>; locale?: 'nb' | 'en' };
      }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { variables, locale = 'nb' } = request.body;

    const rendered = await this.service
      .getTemplateService()
      .renderAllChannels(request.params.code, variables, locale, request.user.tenantId);

    return reply.send(rendered);
  }

  // ==========================================================================
  // Channel Configuration
  // ==========================================================================

  async getAvailableChannels(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const channels = await this.service.getDispatcher().getAvailableChannels(request.user.tenantId);
    return reply.send({ channels });
  }

  async getRateLimits(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const limits = await this.service.getDispatcher().getRateLimits(request.user.tenantId);
    
    const result: Record<string, { remaining: number; resetsAt: string }> = {};
    for (const [channel, limit] of limits) {
      result[channel] = {
        remaining: limit.remaining === Infinity ? -1 : limit.remaining,
        resetsAt: limit.resetsAt.toISOString(),
      };
    }

    return reply.send(result);
  }
}
