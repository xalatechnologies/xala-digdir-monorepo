/**
 * Integrations Controller
 * External service integrations (RCO, Visma, BRREG, Vipps)
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { isVippsConfigured, getVippsConfig } from '../../config/vipps.config';
import { getVippsCheckoutService } from '../../integrations/vipps/vipps-checkout.service';
import { getAuditService } from '../../core/audit/audit.service';

interface IntegrationRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/integrations')
export class IntegrationsController {
  // ============================================================
  // RCO Access Control Integration
  // ============================================================

  /**
   * GET /api/integrations/rco/status - RCO connection status
   */
  @Get('/rco/status')
  async getRcoStatus(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        connected: true,
        provider: 'RCO',
        lastSync: new Date().toISOString(),
        activeAccessCodes: 12,
      },
    };
  }

  /**
   * POST /api/integrations/rco/access-code - Generate access code
   */
  @Post('/rco/access-code')
  async generateAccessCode(request: IntegrationRequest, reply: FastifyReply) {
    const { bookingId, rentalObjectId, validFrom, validUntil } = request.body as any;

    // Mock access code generation
    const accessCode = Math.random().toString().slice(2, 8);

    return {
      data: {
        code: accessCode,
        bookingId,
        rentalObjectId,
        validFrom,
        validUntil,
        type: 'PIN',
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/rco/locks - List connected locks
   */
  @Get('/rco/locks')
  async getRcoLocks(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        { id: 'lock-1', name: 'Hovedinngang', location: 'Kulturhuset', status: 'online' },
        { id: 'lock-2', name: 'Møterom A', location: 'Kulturhuset', status: 'online' },
        { id: 'lock-3', name: 'Gymsal', location: 'Idrettshall', status: 'online' },
      ],
    };
  }

  /**
   * POST /api/integrations/rco/unlock - Remote unlock
   */
  @Post('/rco/unlock')
  async remoteUnlock(request: IntegrationRequest, reply: FastifyReply) {
    const { lockId, duration } = request.body as any;

    return {
      data: {
        success: true,
        lockId,
        unlockedAt: new Date().toISOString(),
        duration: duration || 30,
      },
    };
  }

  // ============================================================
  // Visma ERP Integration
  // ============================================================

  /**
   * GET /api/integrations/visma/status - Visma connection status
   */
  @Get('/visma/status')
  async getVismaStatus(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        connected: true,
        provider: 'Visma Business',
        lastSync: new Date().toISOString(),
        pendingInvoices: 5,
      },
    };
  }

  /**
   * POST /api/integrations/visma/invoice - Create invoice
   */
  @Post('/visma/invoice')
  async createInvoice(request: IntegrationRequest, reply: FastifyReply) {
    const { bookingId, organizationId, amount, currency, description } = request.body as any;

    // Mock invoice creation
    const invoiceNumber = `INV-${Date.now()}`;

    return {
      data: {
        invoiceNumber,
        bookingId,
        organizationId,
        amount,
        currency: currency || 'NOK',
        description,
        status: 'created',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/visma/invoices - List invoices
   */
  @Get('/visma/invoices')
  async getInvoices(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        { id: 'inv-1', number: 'INV-001', amount: 5000, status: 'paid', organization: 'Oslo IL' },
        { id: 'inv-2', number: 'INV-002', amount: 7500, status: 'pending', organization: 'Bergen FK' },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * POST /api/integrations/visma/sync - Trigger sync
   */
  @Post('/visma/sync')
  async syncVisma(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        success: true,
        syncedAt: new Date().toISOString(),
        invoicesSynced: 5,
        paymentsSynced: 3,
      },
    };
  }

  // ============================================================
  // BRREG Integration (Norwegian Business Registry)
  // ============================================================

  /**
   * GET /api/integrations/brreg/lookup/:orgNumber - Lookup organization
   */
  @Get('/brreg/lookup/:orgNumber')
  async lookupOrganization(request: FastifyRequest<{ Params: { orgNumber: string } }>, reply: FastifyReply) {
    const { orgNumber } = request.params;

    // Mock BRREG data
    return {
      data: {
        organisasjonsnummer: orgNumber,
        navn: 'Test Organisasjon AS',
        organisasjonsform: { kode: 'AS', beskrivelse: 'Aksjeselskap' },
        registreringsdatoEnhetsregisteret: '2020-01-01',
        forretningsadresse: {
          adresse: ['Storgata 1'],
          postnummer: '0123',
          poststed: 'OSLO',
          kommune: 'OSLO',
          land: 'Norge',
        },
        naeringskode1: { kode: '93.120', beskrivelse: 'Idrettslag og -klubber' },
      },
    };
  }

  /**
   * POST /api/integrations/brreg/verify - Verify organization
   */
  @Post('/brreg/verify')
  async verifyOrganization(request: IntegrationRequest, reply: FastifyReply) {
    const { organizationNumber } = request.body as any;

    return {
      data: {
        verified: true,
        organizationNumber,
        organizationType: 'sports_club',
        verifiedAt: new Date().toISOString(),
      },
    };
  }

  // ============================================================
  // NIF Registry (Norwegian Sports Federation)
  // ============================================================

  /**
   * GET /api/integrations/nif/lookup/:clubId - Lookup sports club
   */
  @Get('/nif/lookup/:clubId')
  async lookupSportsClub(request: FastifyRequest<{ Params: { clubId: string } }>, reply: FastifyReply) {
    const { clubId } = request.params;

    return {
      data: {
        id: clubId,
        name: 'Test Idrettslag',
        region: 'Oslo Idrettskrets',
        sports: ['Håndball', 'Fotball'],
        memberCount: 450,
        verified: true,
        eligibleForDiscount: true,
        discountPercentage: 30,
      },
    };
  }

  // ============================================================
  // Vipps Payments Integration
  // ============================================================

  /**
   * GET /api/integrations/vipps/status - Vipps connection status
   */
  @Get('/vipps/status')
  async getVippsStatus(request: IntegrationRequest, reply: FastifyReply) {
    const isConfigured = isVippsConfigured();
    
    if (!isConfigured) {
      return {
        data: {
          connected: false,
          provider: 'Vipps',
          message: 'Vipps integration not configured',
        },
      };
    }
    
    const config = getVippsConfig();
    
    return {
      data: {
        connected: true,
        provider: 'Vipps',
        merchantId: config.merchantSerialNumber,
        environment: config.environment,
      },
    };
  }

  /**
   * POST /api/integrations/vipps/initiate - Initiate payment
   */
  @Post('/vipps/initiate')
  async initiatePayment(request: IntegrationRequest, reply: FastifyReply) {
    const { bookingId, amount, description, returnUrl, customerPhone, customerEmail } = request.body as {
      bookingId: string;
      amount: number;
      description?: string;
      returnUrl: string;
      customerPhone?: string;
      customerEmail?: string;
    };

    // Validate required fields
    if (!bookingId || !amount || !returnUrl) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required fields: bookingId, amount, returnUrl',
        },
      };
    }

    // Check if Vipps is configured
    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps payment is not configured',
        },
      };
    }

    try {
      const checkoutService = getVippsCheckoutService();
      
      const session = await checkoutService.createCheckoutSession({
        bookingId,
        amount,
        description: description || `Booking ${bookingId}`,
        returnUrl,
        customer: (customerPhone || customerEmail) ? {
          phoneNumber: customerPhone,
          email: customerEmail,
        } : undefined,
        tenantId: request.tenantId || undefined,
        userId: request.userId || undefined,
      });

      return {
        data: {
          orderId: session.reference,
          bookingId,
          amount,
          currency: 'NOK',
          status: 'initiated',
          redirectUrl: session.redirectUrl,
          url: session.redirectUrl, // Alias for frontend compatibility
          returnUrl,
        },
      };
    } catch (error) {
      getAuditService().log({
        tenantId: request.tenantId || 'unknown',
        userId: request.userId || 'anonymous',
        action: 'vipps_payment_initiate_failed',
        resource: 'payment',
        resourceId: bookingId,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          amount,
        },
      });

      reply.code(500);
      return {
        error: {
          code: 'PAYMENT_INITIATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to initiate payment',
        },
      };
    }
  }

  /**
   * GET /api/integrations/vipps/payment/:orderId - Get payment status
   */
  @Get('/vipps/payment/:orderId')
  async getPaymentStatus(request: FastifyRequest<{ Params: { orderId: string } }>, reply: FastifyReply) {
    const { orderId } = request.params;

    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps payment is not configured',
        },
      };
    }

    try {
      const checkoutService = getVippsCheckoutService();
      const status = await checkoutService.getPaymentStatus(orderId);

      return {
        data: {
          orderId: status.reference,
          status: status.status.toLowerCase(),
          amount: status.amount,
          currency: status.currency,
          bookingId: status.bookingId,
          capturedAmount: status.capturedAmount,
          refundedAmount: status.refundedAmount,
          modifiedAt: status.modifiedAt,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404);
        return {
          error: {
            code: 'NOT_FOUND',
            message: `Payment ${orderId} not found`,
          },
        };
      }

      reply.code(500);
      return {
        error: {
          code: 'PAYMENT_STATUS_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get payment status',
        },
      };
    }
  }

  /**
   * POST /api/integrations/vipps/capture - Capture authorized payment
   */
  @Post('/vipps/capture')
  async capturePayment(request: IntegrationRequest, reply: FastifyReply) {
    const { orderId, amount } = request.body as { orderId: string; amount?: number };

    if (!orderId) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'orderId is required',
        },
      };
    }

    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps payment is not configured',
        },
      };
    }

    try {
      const checkoutService = getVippsCheckoutService();
      const status = await checkoutService.capturePayment({
        reference: orderId,
        amount,
      });

      return {
        data: {
          orderId: status.reference,
          status: status.status.toLowerCase(),
          capturedAmount: status.capturedAmount,
        },
      };
    } catch (error) {
      reply.code(500);
      return {
        error: {
          code: 'CAPTURE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to capture payment',
        },
      };
    }
  }

  /**
   * POST /api/integrations/vipps/refund - Refund payment
   */
  @Post('/vipps/refund')
  async refundPayment(request: IntegrationRequest, reply: FastifyReply) {
    const { orderId, amount, reason } = request.body as { 
      orderId: string; 
      amount?: number; 
      reason?: string;
    };

    if (!orderId) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'orderId is required',
        },
      };
    }

    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps payment is not configured',
        },
      };
    }

    try {
      const checkoutService = getVippsCheckoutService();
      const status = await checkoutService.refundPayment({
        reference: orderId,
        amount,
        reason,
      });

      getAuditService().log({
        tenantId: request.tenantId || 'unknown',
        userId: request.userId || 'anonymous',
        action: 'vipps_payment_refunded',
        resource: 'payment',
        resourceId: orderId,
        metadata: { amount, reason },
      });

      return {
        data: {
          orderId: status.reference,
          status: status.status.toLowerCase(),
          refundedAmount: status.refundedAmount,
        },
      };
    } catch (error) {
      reply.code(500);
      return {
        error: {
          code: 'REFUND_FAILED',
          message: error instanceof Error ? error.message : 'Failed to refund payment',
        },
      };
    }
  }

  // ============================================================
  // Calendar Sync (Google/Outlook)
  // ============================================================

  /**
   * GET /api/integrations/calendar/status - Calendar sync status
   */
  @Get('/calendar/status')
  async getCalendarSyncStatus(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        googleCalendar: { connected: false },
        outlookCalendar: { connected: true, lastSync: new Date().toISOString() },
      },
    };
  }

  /**
   * POST /api/integrations/calendar/sync - Trigger calendar sync
   */
  @Post('/calendar/sync')
  async syncCalendar(request: IntegrationRequest, reply: FastifyReply) {
    const { provider } = request.body as any;

    return {
      data: {
        success: true,
        provider,
        syncedEvents: 15,
        syncedAt: new Date().toISOString(),
      },
    };
  }
}
