/**
 * Notification Preferences Controller
 * REST API endpoints for user notification preferences
 */
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotificationPreferencesService } from './notification-preferences.service';

// ============================================================================
// Request Types
// ============================================================================

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

// ============================================================================
// Validation Schemas
// ============================================================================

const UpdatePreferencesSchema = z.object({
  // Channel preferences
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),

  // Notification type preferences
  bookingCreated: z.boolean().optional(),
  bookingApproved: z.boolean().optional(),
  bookingRejected: z.boolean().optional(),
  bookingCancelled: z.boolean().optional(),
  bookingChanged: z.boolean().optional(),

  reminder24h: z.boolean().optional(),
  reminder2h: z.boolean().optional(),

  systemNotifications: z.boolean().optional(),
  adminMessages: z.boolean().optional(),

  invoiceAvailable: z.boolean().optional(),
  paymentStatus: z.boolean().optional(),

  // Advanced settings
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
  quietHoursTimezone: z.string().max(50).optional(),
});

// ============================================================================
// Controller
// ============================================================================

export class NotificationPreferencesController {
  constructor(private readonly service: NotificationPreferencesService) {}

  /**
   * Register all routes
   */
  registerRoutes(fastify: FastifyInstance): void {
    fastify.get('/api/notifications/preferences', this.getPreferences.bind(this));
    fastify.put('/api/notifications/preferences', this.updatePreferences.bind(this));
    fastify.post('/api/notifications/preferences/reset', this.resetPreferences.bind(this));
  }

  /**
   * GET /api/notifications/preferences
   * Get current user's notification preferences
   */
  async getPreferences(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      });
    }

    try {
      const preferences = await this.service.getPreferences(
        request.user.id,
        request.user.tenantId
      );

      return reply.send({
        success: true,
        data: preferences,
      });
    } catch (error) {
      request.log.error(error, 'Failed to get notification preferences');
      return reply.status(500).send({
        type: '/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to retrieve notification preferences',
      });
    }
  }

  /**
   * PUT /api/notifications/preferences
   * Update current user's notification preferences
   */
  async updatePreferences(
    request: AuthenticatedRequest & { Body: unknown },
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      });
    }

    try {
      // Validate request body
      const validatedData = UpdatePreferencesSchema.parse(request.body);

      // Update preferences
      const preferences = await this.service.updatePreferences(
        request.user.id,
        request.user.tenantId,
        validatedData
      );

      return reply.send({
        success: true,
        data: preferences,
        message: 'Notification preferences updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          type: '/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid notification preferences data',
          errors: error.errors,
        });
      }

      if (error instanceof Error) {
        // Check for business logic errors
        if (error.message.includes('quiet hours')) {
          return reply.status(400).send({
            type: '/errors/validation',
            title: 'Validation Error',
            status: 400,
            detail: error.message,
          });
        }
      }

      request.log.error(error, 'Failed to update notification preferences');
      return reply.status(500).send({
        type: '/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to update notification preferences',
      });
    }
  }

  /**
   * POST /api/notifications/preferences/reset
   * Reset notification preferences to defaults
   */
  async resetPreferences(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      });
    }

    try {
      const preferences = await this.service.resetToDefaults(
        request.user.id,
        request.user.tenantId
      );

      return reply.send({
        success: true,
        data: preferences,
        message: 'Notification preferences reset to defaults',
      });
    } catch (error) {
      request.log.error(error, 'Failed to reset notification preferences');
      return reply.status(500).send({
        type: '/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to reset notification preferences',
      });
    }
  }
}
