/**
 * Push Notifications Controller
 * REST API endpoints for notification preferences and push subscriptions
 * 
 * Endpoints:
 * - GET /api/push-notifications/preferences - Get user preferences
 * - PUT /api/push-notifications/preferences - Update user preferences
 * - GET /api/push-notifications/organizations/:organizationId/preferences - Get org preferences
 * - PUT /api/push-notifications/organizations/:organizationId/preferences - Update org preferences
 * - GET /api/push-notifications/subscriptions - Get push subscriptions
 * - POST /api/push-notifications/subscribe - Register push subscription
 * - POST /api/push-notifications/unsubscribe - Unsubscribe from push
 * - DELETE /api/push-notifications/subscriptions/:id - Delete subscription
 * - POST /api/push-notifications/test - Send test notification
 */

import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { PushNotificationsService } from './push-notifications.service';
import { getTenantId, TenantRequest, type UserContext } from '../../core/validation/tenant';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Extended user context with optional organization
 */
interface ExtendedUserContext extends UserContext {
  organizationId?: string;
}

/**
 * Authenticated request with user and tenant context
 */
interface AuthenticatedRequest extends TenantRequest {
  user?: ExtendedUserContext;
}

@Controller('/api/push-notifications')
export class PushNotificationsController {
  constructor(
    @Inject('PushNotificationsService') private readonly service: PushNotificationsService
  ) {}

  // ==========================================================================
  // User Preferences
  // ==========================================================================

  /**
   * GET /api/push-notifications/preferences
   * Get current user's notification preferences
   */
  @Get('/preferences')
  async getUserPreferences(request: AuthenticatedRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.user?.id;

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const preferences = await this.service.getUserPreferences(tenantId, userId);
    return { data: preferences };
  }

  /**
   * PUT /api/push-notifications/preferences
   * Update current user's notification preferences
   */
  @Put('/preferences')
  async updateUserPreferences(request: AuthenticatedRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.user?.id;

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const body = request.body as {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      inAppEnabled?: boolean;
      smsEnabled?: boolean;
      notificationMatrix?: Record<string, { in_app?: boolean; email?: boolean; sms?: boolean }>;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    };

    const preferences = await this.service.updateUserPreferences(tenantId, userId, body);
    return { data: preferences };
  }

  // ==========================================================================
  // Organization Preferences
  // ==========================================================================

  /**
   * GET /api/push-notifications/organizations/:organizationId/preferences
   * Get organization notification preferences
   */
  @Get('/organizations/:organizationId/preferences')
  async getOrganizationPreferences(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { organizationId: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request);
    const { organizationId } = request.params;

    // Verify user has access to this organization
    if (!this.canAccessOrganization(request, organizationId)) {
      reply.code(403);
      return { error: { code: 'FORBIDDEN', message: 'Access denied to this organization' } };
    }

    const preferences = await this.service.getOrganizationPreferences(tenantId, organizationId);
    return { data: preferences };
  }

  /**
   * PUT /api/push-notifications/organizations/:organizationId/preferences
   * Update organization notification preferences
   */
  @Put('/organizations/:organizationId/preferences')
  async updateOrganizationPreferences(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { organizationId: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request);
    const { organizationId } = request.params;

    // Verify user has admin access to this organization
    if (!this.canManageOrganization(request, organizationId)) {
      reply.code(403);
      return { error: { code: 'FORBIDDEN', message: 'Only organization admins can update preferences' } };
    }

    const body = request.body as {
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      inAppEnabled?: boolean;
      notificationMatrix?: Record<string, { in_app?: boolean; email?: boolean; sms?: boolean }>;
      notifyAdmins?: boolean;
      notifyBookingManagers?: boolean;
      notifyAllMembers?: boolean;
      primaryEmail?: string;
      primaryPhone?: string;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    };

    const preferences = await this.service.updateOrganizationPreferences(tenantId, organizationId, body);
    return { data: preferences };
  }

  // ==========================================================================
  // Push Subscriptions
  // ==========================================================================

  /**
   * GET /api/push-notifications/subscriptions
   * Get all push subscriptions for current user
   */
  @Get('/subscriptions')
  async getSubscriptions(request: AuthenticatedRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.user?.id;

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const subscriptions = await this.service.getPushSubscriptions(tenantId, userId);
    return { data: subscriptions };
  }

  /**
   * POST /api/push-notifications/subscribe
   * Register a new push subscription
   */
  @Post('/subscribe')
  async subscribe(request: AuthenticatedRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.user?.id;

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const body = request.body as {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
      deviceName?: string;
      userAgent?: string;
    };

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'endpoint and keys are required' } };
    }

    const subscription = await this.service.registerPushSubscription(tenantId, userId, body);
    reply.code(201);
    return { data: subscription };
  }

  /**
   * POST /api/push-notifications/unsubscribe
   * Unsubscribe from push notifications
   */
  @Post('/unsubscribe')
  async unsubscribe(request: AuthenticatedRequest, reply: FastifyReply) {
    const body = request.body as { endpoint: string };

    if (!body.endpoint) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'endpoint is required' } };
    }

    const success = await this.service.unsubscribePush(body.endpoint);
    return { success };
  }

  /**
   * DELETE /api/push-notifications/subscriptions/:id
   * Delete a specific push subscription
   */
  @Delete('/subscriptions/:id')
  async deleteSubscription(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const success = await this.service.deletePushSubscription(id);

    if (!success) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Subscription not found' } };
    }

    return { success: true };
  }

  /**
   * POST /api/push-notifications/test
   * Send a test push notification
   */
  @Post('/test')
  async testPush(request: AuthenticatedRequest, reply: FastifyReply) {
    const userId = request.user?.id;

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    // TODO: Implement actual push notification sending via web-push library
    // For now, return success to indicate the endpoint works
    return {
      success: true,
      message: 'Test notification would be sent (implementation pending)',
    };
  }

  // ==========================================================================
  // Authorization Helpers
  // ==========================================================================

  private canAccessOrganization(request: AuthenticatedRequest, organizationId: string): boolean {
    const user = request.user;
    if (!user) return false;

    // Super admins and admins can access any organization
    if (user.role === 'super_admin' || user.role === 'admin') return true;

    // Users can only access their own organization
    return user.organizationId === organizationId;
  }

  private canManageOrganization(request: AuthenticatedRequest, organizationId: string): boolean {
    const user = request.user;
    if (!user) return false;

    // Super admins and admins can manage any organization
    if (user.role === 'super_admin' || user.role === 'admin') return true;

    // For now, allow organization members to manage (should check org-level role)
    return user.organizationId === organizationId;
  }
}

export default PushNotificationsController;
