/**
 * Vipps Webhook Controller
 * 
 * Handles incoming webhooks from Vipps for:
 * - Payment status updates
 * - Checkout session events
 * - Refund notifications
 * 
 * Security:
 * - Signature validation
 * - Idempotency (prevent duplicate processing)
 * - Audit logging
 */

import { Controller, Post } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createHmac } from 'crypto';
import { eq } from 'drizzle-orm';
import { bookings } from '../../database/schema/index';
import { getVippsConfig, isVippsConfigured, VIPPS_PAYMENT_STATUS } from '../../config/vipps.config';
import { getAuditService } from '../../core/audit/audit.service';

// =============================================================================
// Types
// =============================================================================

interface VippsWebhookEvent {
  /** Unique event ID for idempotency */
  eventId: string;
  /** Event type */
  eventType: string;
  /** Event timestamp */
  timestamp: string;
  /** Event data */
  data: {
    reference: string;
    pspReference?: string;
    name?: string;
    amount?: {
      value: number;
      currency: string;
    };
    success?: boolean;
    [key: string]: unknown;
  };
}

interface WebhookRequest extends FastifyRequest {
  tenantId?: string | null;
}

// =============================================================================
// Idempotency Store (in-memory for demo, use Redis in production)
// =============================================================================

const processedEvents = new Map<string, Date>();
const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isEventProcessed(eventId: string): boolean {
  const processed = processedEvents.get(eventId);
  if (!processed) return false;
  
  // Check if TTL expired
  if (Date.now() - processed.getTime() > EVENT_TTL_MS) {
    processedEvents.delete(eventId);
    return false;
  }
  
  return true;
}

function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, new Date());
  
  // Cleanup old events periodically
  if (processedEvents.size > 10000) {
    const now = Date.now();
    for (const [id, date] of processedEvents.entries()) {
      if (now - date.getTime() > EVENT_TTL_MS) {
        processedEvents.delete(id);
      }
    }
  }
}

// =============================================================================
// Controller
// =============================================================================

@Controller('/api/webhooks')
export class VippsWebhookController {
  /**
   * POST /api/webhooks/vipps - Receive Vipps webhook events
   * 
   * Headers:
   * - Authorization: Bearer {callbackAuthorizationToken}
   * - X-Vipps-Signature: HMAC signature (if configured)
   * 
   * Handles events:
   * - checkout.session.completed
   * - checkout.session.paymentAuthorized
   * - checkout.session.paymentCaptured
   * - checkout.session.paymentRefunded
   * - checkout.session.paymentCancelled
   * - checkout.session.paymentFailed
   */
  @Post('/vipps')
  async handleVippsWebhook(request: WebhookRequest, reply: FastifyReply) {
    // Check if Vipps is configured
    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps webhook handler not configured',
        },
      };
    }

    const config = getVippsConfig();
    const body = request.body as VippsWebhookEvent;

    // Log incoming webhook
    getAuditService().log({
      tenantId: request.tenantId || 'system',
      userId: 'vipps-webhook',
      action: 'vipps_webhook_received',
      resource: 'webhook',
      resourceId: body.eventId || 'unknown',
      ipAddress: request.ip,
      metadata: {
        eventType: body.eventType,
        reference: body.data?.reference,
      },
    });

    // Validate webhook signature if secret is configured
    if (config.webhookSecret) {
      const isValid = this.validateSignature(request, config.webhookSecret);
      if (!isValid) {
        getAuditService().log({
          tenantId: request.tenantId || 'system',
          userId: 'vipps-webhook',
          action: 'vipps_webhook_signature_invalid',
          resource: 'webhook',
          resourceId: body.eventId || 'unknown',
          ipAddress: request.ip,
          metadata: { eventType: body.eventType },
        });

        reply.code(401);
        return {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid webhook signature',
          },
        };
      }
    }

    // Validate required fields
    if (!body.eventId || !body.eventType || !body.data?.reference) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required webhook fields',
        },
      };
    }

    // Check idempotency
    if (isEventProcessed(body.eventId)) {
      // Already processed, return success
      return {
        data: {
          status: 'already_processed',
          eventId: body.eventId,
        },
      };
    }

    try {
      // Process the event based on type
      await this.processEvent(body, request.tenantId || 'system');

      // Mark as processed
      markEventProcessed(body.eventId);

      return {
        data: {
          status: 'processed',
          eventId: body.eventId,
        },
      };
    } catch (error) {
      getAuditService().log({
        tenantId: request.tenantId || 'system',
        userId: 'vipps-webhook',
        action: 'vipps_webhook_processing_failed',
        resource: 'webhook',
        resourceId: body.eventId,
        metadata: {
          eventType: body.eventType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Return 500 so Vipps retries
      reply.code(500);
      return {
        error: {
          code: 'PROCESSING_FAILED',
          message: 'Failed to process webhook event',
        },
      };
    }
  }

  /**
   * Process webhook event
   */
  private async processEvent(event: VippsWebhookEvent, tenantId: string): Promise<void> {
    const { eventType, data } = event;

    switch (eventType) {
      case 'checkout.session.completed':
      case 'checkout.session.paymentAuthorized':
        await this.handlePaymentAuthorized(data, tenantId);
        break;

      case 'checkout.session.paymentCaptured':
        await this.handlePaymentCaptured(data, tenantId);
        break;

      case 'checkout.session.paymentRefunded':
        await this.handlePaymentRefunded(data, tenantId);
        break;

      case 'checkout.session.paymentCancelled':
      case 'checkout.session.paymentFailed':
        await this.handlePaymentFailed(data, tenantId);
        break;

      default:
        // Log unknown event type
        getAuditService().log({
          tenantId,
          userId: 'vipps-webhook',
          action: 'vipps_webhook_unknown_event',
          resource: 'webhook',
          resourceId: event.eventId,
          metadata: { eventType },
        });
    }
  }

  /**
   * Handle payment authorized event
   */
  private async handlePaymentAuthorized(data: VippsWebhookEvent['data'], tenantId: string): Promise<void> {
    const bookingId = this.extractBookingId(data.reference);
    if (!bookingId) return;

    const db = container.resolve<any>('Database');

    // Update booking status to confirmed (or pending_capture if auto-capture is off)
    await db.update(bookings)
      .set({
        status: 'confirmed',
        metadata: {
          paymentReference: data.reference,
          paymentStatus: 'authorized',
          paymentAuthorizedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    getAuditService().log({
      tenantId,
      userId: 'vipps-webhook',
      action: 'booking_payment_authorized',
      resource: 'booking',
      resourceId: bookingId,
      metadata: {
        reference: data.reference,
        amount: data.amount?.value,
      },
    });
  }

  /**
   * Handle payment captured event
   */
  private async handlePaymentCaptured(data: VippsWebhookEvent['data'], tenantId: string): Promise<void> {
    const bookingId = this.extractBookingId(data.reference);
    if (!bookingId) return;

    const db = container.resolve<any>('Database');

    // Ensure booking is confirmed
    await db.update(bookings)
      .set({
        status: 'confirmed',
        metadata: {
          paymentReference: data.reference,
          paymentStatus: 'captured',
          paymentCapturedAt: new Date().toISOString(),
          capturedAmount: data.amount?.value,
        },
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    getAuditService().log({
      tenantId,
      userId: 'vipps-webhook',
      action: 'booking_payment_captured',
      resource: 'booking',
      resourceId: bookingId,
      metadata: {
        reference: data.reference,
        amount: data.amount?.value,
      },
    });
  }

  /**
   * Handle payment refunded event
   */
  private async handlePaymentRefunded(data: VippsWebhookEvent['data'], tenantId: string): Promise<void> {
    const bookingId = this.extractBookingId(data.reference);
    if (!bookingId) return;

    const db = container.resolve<any>('Database');

    // Get current booking to check refund amount
    const existingBookings = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBookings.length === 0) return;

    const booking = existingBookings[0];
    const totalPrice = parseFloat(booking.totalPrice || '0');
    const refundedAmount = data.amount?.value || 0;

    // Determine new status based on refund amount
    const newStatus = refundedAmount >= totalPrice * 100 ? 'cancelled' : booking.status;

    await db.update(bookings)
      .set({
        status: newStatus,
        metadata: {
          ...booking.metadata,
          paymentStatus: 'refunded',
          refundedAmount,
          refundedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    getAuditService().log({
      tenantId,
      userId: 'vipps-webhook',
      action: 'booking_payment_refunded',
      resource: 'booking',
      resourceId: bookingId,
      metadata: {
        reference: data.reference,
        refundedAmount,
        newStatus,
      },
    });
  }

  /**
   * Handle payment failed/cancelled event
   */
  private async handlePaymentFailed(data: VippsWebhookEvent['data'], tenantId: string): Promise<void> {
    const bookingId = this.extractBookingId(data.reference);
    if (!bookingId) return;

    const db = container.resolve<any>('Database');

    // Update booking to cancelled/failed
    await db.update(bookings)
      .set({
        status: 'cancelled',
        metadata: {
          paymentReference: data.reference,
          paymentStatus: 'failed',
          paymentFailedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    getAuditService().log({
      tenantId,
      userId: 'vipps-webhook',
      action: 'booking_payment_failed',
      resource: 'booking',
      resourceId: bookingId,
      metadata: {
        reference: data.reference,
      },
    });
  }

  /**
   * Extract booking ID from payment reference
   * Reference format: digilist-{bookingId}-{timestamp}
   */
  private extractBookingId(reference: string): string | null {
    const match = reference.match(/^digilist-(.+)-\d+$/);
    return match ? match[1] : null;
  }

  /**
   * Validate webhook signature
   */
  private validateSignature(request: FastifyRequest, secret: string): boolean {
    const signature = request.headers['x-vipps-signature'] as string;
    if (!signature) return false;

    const payload = JSON.stringify(request.body);
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}
