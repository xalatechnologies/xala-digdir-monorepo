/**
 * Integrations Controller
 * External service integrations (RCO, Visma, BRREG, Vipps)
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';

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
        lockdownActive: false,
      },
    };
  }

  /**
   * POST /api/integrations/rco/access-code - Generate access code
   */
  @Post('/rco/access-code')
  async generateAccessCode(request: IntegrationRequest, reply: FastifyReply) {
    const { bookingId, listingId, validFrom, validUntil } = request.body as any;

    // Mock access code generation
    const accessCode = Math.random().toString().slice(2, 8);

    return {
      data: {
        code: accessCode,
        bookingId,
        listingId,
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
  // RCO Enhanced Security Features
  // ============================================================

  /**
   * GET /api/integrations/rco/locks/extended - List locks with extended details
   */
  @Get('/rco/locks/extended')
  async getRcoLocksExtended(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          id: 'lock-1',
          name: 'Hovedinngang',
          location: 'Kulturhuset',
          status: 'online',
          lockType: 'entry',
          listingIds: ['listing-001', 'listing-002'],
          batteryLevel: 85,
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          firmwareVersion: '2.4.1',
        },
        {
          id: 'lock-2',
          name: 'Møterom A',
          location: 'Kulturhuset',
          status: 'online',
          lockType: 'interior',
          listingIds: ['listing-001'],
          batteryLevel: 92,
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          firmwareVersion: '2.4.1',
        },
        {
          id: 'lock-3',
          name: 'Gymsal',
          location: 'Idrettshall',
          status: 'online',
          lockType: 'entry',
          listingIds: ['listing-003'],
          batteryLevel: 78,
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          firmwareVersion: '2.3.8',
        },
      ],
    };
  }

  /**
   * GET /api/integrations/rco/locks/:lockId - Get single lock details
   */
  @Get('/rco/locks/:lockId')
  async getRcoLock(request: FastifyRequest<{ Params: { lockId: string } }>, reply: FastifyReply) {
    const { lockId } = request.params;

    return {
      data: {
        id: lockId,
        name: 'Hovedinngang',
        location: 'Kulturhuset',
        status: 'online',
        lockType: 'entry',
        listingIds: ['listing-001', 'listing-002'],
        batteryLevel: 85,
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        firmwareVersion: '2.4.1',
      },
    };
  }

  /**
   * GET /api/integrations/rco/access-codes - List all access codes
   */
  @Get('/rco/access-codes')
  async getRcoAccessCodes(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          code: '123456',
          bookingId: 'booking-001',
          listingId: 'listing-001',
          validFrom: new Date(Date.now() - 86400000).toISOString(),
          validUntil: new Date(Date.now() + 86400000).toISOString(),
          type: 'PIN',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          accessLevel: 'visitor',
          userId: 'user-001',
          usageCount: 2,
          maxUses: 10,
          revoked: false,
        },
        {
          code: '789012',
          bookingId: 'booking-002',
          listingId: 'listing-002',
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 172800000).toISOString(),
          type: 'QR',
          createdAt: new Date().toISOString(),
          accessLevel: 'member',
          organizationId: 'org-001',
          usageCount: 0,
          maxUses: null,
          revoked: false,
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/rco/access-codes/:code - Get access code details
   */
  @Get('/rco/access-codes/:code')
  async getRcoAccessCode(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const { code } = request.params;

    return {
      data: {
        code,
        bookingId: 'booking-001',
        listingId: 'listing-001',
        validFrom: new Date(Date.now() - 86400000).toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        type: 'PIN',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        accessLevel: 'visitor',
        userId: 'user-001',
        usageCount: 2,
        maxUses: 10,
        revoked: false,
      },
    };
  }

  /**
   * POST /api/integrations/rco/access-codes/:code/revoke - Revoke access code
   */
  @Post('/rco/access-codes/:code/revoke')
  async revokeRcoAccessCode(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const { code } = request.params;
    const { reason } = request.body as any;

    return {
      data: {
        code,
        bookingId: 'booking-001',
        listingId: 'listing-001',
        validFrom: new Date(Date.now() - 86400000).toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        type: 'PIN',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        accessLevel: 'visitor',
        userId: 'user-001',
        usageCount: 2,
        maxUses: 10,
        revoked: true,
        revokedReason: reason || 'Manual revocation',
        revokedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * PUT /api/integrations/rco/access-codes/:code/extend - Extend access code validity
   */
  @Put('/rco/access-codes/:code/extend')
  async extendRcoAccessCode(request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) {
    const { code } = request.params;
    const { validUntil } = request.body as any;

    return {
      data: {
        code,
        bookingId: 'booking-001',
        listingId: 'listing-001',
        validFrom: new Date(Date.now() - 86400000).toISOString(),
        validUntil: validUntil || new Date(Date.now() + 259200000).toISOString(),
        type: 'PIN',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        accessLevel: 'visitor',
        userId: 'user-001',
        usageCount: 2,
        maxUses: 10,
        revoked: false,
      },
    };
  }

  /**
   * GET /api/integrations/rco/access-logs - Get access logs
   */
  @Get('/rco/access-logs')
  async getRcoAccessLogs(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          id: 'log-001',
          lockId: 'lock-1',
          accessCode: '123456',
          codeType: 'PIN',
          accessGranted: true,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user-001',
          bookingId: 'booking-001',
        },
        {
          id: 'log-002',
          lockId: 'lock-2',
          accessCode: '999999',
          codeType: 'PIN',
          accessGranted: false,
          denialReason: 'invalid_code',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'log-003',
          lockId: 'lock-1',
          accessCode: '123456',
          codeType: 'PIN',
          accessGranted: true,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userId: 'user-001',
          bookingId: 'booking-001',
        },
      ],
      meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/rco/locks/:lockId/access-logs - Get lock-specific access logs
   */
  @Get('/rco/locks/:lockId/access-logs')
  async getRcoLockAccessLogs(request: FastifyRequest<{ Params: { lockId: string } }>, reply: FastifyReply) {
    const { lockId } = request.params;

    return {
      data: [
        {
          id: 'log-001',
          lockId,
          accessCode: '123456',
          codeType: 'PIN',
          accessGranted: true,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user-001',
          bookingId: 'booking-001',
        },
        {
          id: 'log-003',
          lockId,
          accessCode: '123456',
          codeType: 'PIN',
          accessGranted: true,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userId: 'user-001',
          bookingId: 'booking-001',
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/rco/access-logs/booking/:bookingId - Get booking-specific access logs
   */
  @Get('/rco/access-logs/booking/:bookingId')
  async getRcoBookingAccessLogs(request: FastifyRequest<{ Params: { bookingId: string } }>, reply: FastifyReply) {
    const { bookingId } = request.params;

    return {
      data: [
        {
          id: 'log-001',
          lockId: 'lock-1',
          accessCode: '123456',
          codeType: 'PIN',
          accessGranted: true,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user-001',
          bookingId,
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/rco/locks/:lockId/schedules - Get lock schedules
   */
  @Get('/rco/locks/:lockId/schedules')
  async getRcoLockSchedules(request: FastifyRequest<{ Params: { lockId: string } }>, reply: FastifyReply) {
    const { lockId } = request.params;

    return {
      data: [
        {
          id: 'schedule-001',
          lockId,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '22:00',
          isAccessible: true,
          description: 'Mandag åpningstider',
        },
        {
          id: 'schedule-002',
          lockId,
          dayOfWeek: 0,
          startTime: '00:00',
          endTime: '23:59',
          isAccessible: false,
          description: 'Søndager stengt',
        },
      ],
    };
  }

  /**
   * POST /api/integrations/rco/schedules - Create lock schedule
   */
  @Post('/rco/schedules')
  async createRcoSchedule(request: IntegrationRequest, reply: FastifyReply) {
    const { lockId, dayOfWeek, startTime, endTime, isAccessible, description } = request.body as any;

    return {
      data: {
        id: `schedule-${Date.now()}`,
        lockId,
        dayOfWeek,
        startTime,
        endTime,
        isAccessible,
        description,
      },
    };
  }

  /**
   * PUT /api/integrations/rco/schedules/:scheduleId - Update lock schedule
   */
  @Put('/rco/schedules/:scheduleId')
  async updateRcoSchedule(request: FastifyRequest<{ Params: { scheduleId: string } }>, reply: FastifyReply) {
    const { scheduleId } = request.params;
    const data = request.body as any;

    return {
      data: {
        id: scheduleId,
        lockId: data.lockId || 'lock-1',
        dayOfWeek: data.dayOfWeek ?? 1,
        startTime: data.startTime || '08:00',
        endTime: data.endTime || '22:00',
        isAccessible: data.isAccessible ?? true,
        description: data.description,
      },
    };
  }

  /**
   * DELETE /api/integrations/rco/schedules/:scheduleId - Delete lock schedule
   */
  @Delete('/rco/schedules/:scheduleId')
  async deleteRcoSchedule(request: FastifyRequest<{ Params: { scheduleId: string } }>, reply: FastifyReply) {
    return { success: true };
  }

  /**
   * GET /api/integrations/rco/lockdown/status - Get emergency lockdown status
   */
  @Get('/rco/lockdown/status')
  async getRcoLockdownStatus(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        active: false,
        activatedAt: null,
        activatedBy: null,
        reason: null,
        affectedLocks: [],
      },
    };
  }

  /**
   * POST /api/integrations/rco/lockdown/activate - Activate emergency lockdown
   */
  @Post('/rco/lockdown/activate')
  async activateRcoLockdown(request: IntegrationRequest, reply: FastifyReply) {
    const { reason, lockIds } = request.body as any;

    return {
      data: {
        active: true,
        activatedAt: new Date().toISOString(),
        activatedBy: request.userId,
        reason: reason || 'Emergency lockdown',
        affectedLocks: lockIds || ['lock-1', 'lock-2', 'lock-3'],
      },
    };
  }

  /**
   * POST /api/integrations/rco/lockdown/deactivate - Deactivate emergency lockdown
   */
  @Post('/rco/lockdown/deactivate')
  async deactivateRcoLockdown(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        active: false,
        activatedAt: null,
        activatedBy: null,
        reason: null,
        affectedLocks: [],
      },
    };
  }

  /**
   * POST /api/integrations/rco/sync - Trigger RCO sync
   */
  @Post('/rco/sync')
  async syncRco(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        success: true,
        syncedLocks: 3,
        syncedCodes: 12,
        syncedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/rco/locks/:lockId/test - Test lock connectivity
   */
  @Post('/rco/locks/:lockId/test')
  async testRcoLock(request: FastifyRequest<{ Params: { lockId: string } }>, reply: FastifyReply) {
    const { lockId } = request.params;

    return {
      data: {
        lockId,
        responsive: true,
        latencyMs: Math.floor(Math.random() * 100) + 20,
      },
    };
  }

  // ============================================================
  // Visma ERP Integration (Enterprise)
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
        overdueInvoices: 2,
      },
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
        customersSynced: 12,
      },
    };
  }

  /**
   * POST /api/integrations/visma/invoices - Create invoice
   */
  @Post('/visma/invoices')
  async createVismaInvoice(request: IntegrationRequest, reply: FastifyReply) {
    const { bookingId, organizationId, amount, currency, description } = request.body as any;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

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
  async getVismaInvoices(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          invoiceNumber: 'INV-001',
          bookingId: 'booking-001',
          organizationId: 'org-001',
          amount: 5000,
          currency: 'NOK',
          description: 'Leie av møterom - Kulturhuset',
          status: 'paid',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          invoiceNumber: 'INV-002',
          bookingId: 'booking-002',
          organizationId: 'org-002',
          amount: 7500,
          currency: 'NOK',
          description: 'Leie av gymsal - Idrettshall',
          status: 'sent',
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          invoiceNumber: 'INV-003',
          bookingId: 'booking-003',
          organizationId: 'org-001',
          amount: 3500,
          currency: 'NOK',
          description: 'Leie av møterom A',
          status: 'overdue',
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/visma/invoices/:invoiceNumber - Get invoice details
   */
  @Get('/visma/invoices/:invoiceNumber')
  async getVismaInvoice(request: FastifyRequest<{ Params: { invoiceNumber: string } }>, reply: FastifyReply) {
    const { invoiceNumber } = request.params;

    return {
      data: {
        invoiceNumber,
        bookingId: 'booking-001',
        organizationId: 'org-001',
        amount: 5000,
        currency: 'NOK',
        description: 'Leie av møterom - Kulturhuset',
        status: 'sent',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        customerReference: 'REF-123',
        ourReference: 'Saksbehandler A',
        lines: [
          {
            id: 'line-1',
            lineNumber: 1,
            productCode: 'ROOM-MTG',
            description: 'Møterom A - 4 timer',
            quantity: 4,
            unit: 'timer',
            unitPrice: 1000,
            discountPercent: 0,
            vatRate: 25,
            lineTotal: 4000,
          },
          {
            id: 'line-2',
            lineNumber: 2,
            productCode: 'SVC-CATERING',
            description: 'Kaffe og te pakke',
            quantity: 1,
            unit: 'stk',
            unitPrice: 1000,
            discountPercent: 0,
            vatRate: 25,
            lineTotal: 1000,
          },
        ],
        vatAmount: 1250,
        totalWithVat: 6250,
        paymentReference: '12345678901',
        remindersSent: 0,
      },
    };
  }

  /**
   * POST /api/integrations/visma/invoices/:invoiceNumber/send - Send invoice
   */
  @Post('/visma/invoices/:invoiceNumber/send')
  async sendVismaInvoice(request: FastifyRequest<{ Params: { invoiceNumber: string } }>, reply: FastifyReply) {
    const { invoiceNumber } = request.params;

    return {
      data: {
        invoiceNumber,
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/visma/invoices/:invoiceNumber/reminder - Send reminder
   */
  @Post('/visma/invoices/:invoiceNumber/reminder')
  async sendVismaInvoiceReminder(request: FastifyRequest<{ Params: { invoiceNumber: string } }>, reply: FastifyReply) {
    const { invoiceNumber } = request.params;
    const { reminderType } = request.body as any;

    return {
      data: {
        invoiceNumber,
        status: 'sent',
        remindersSent: 1,
        lastReminderAt: new Date().toISOString(),
        reminderType: reminderType || 'first',
      },
    };
  }

  /**
   * POST /api/integrations/visma/invoices/:invoiceNumber/mark-paid - Mark as paid
   */
  @Post('/visma/invoices/:invoiceNumber/mark-paid')
  async markVismaInvoicePaid(request: FastifyRequest<{ Params: { invoiceNumber: string } }>, reply: FastifyReply) {
    const { invoiceNumber } = request.params;
    const { paymentDate } = request.body as any;

    return {
      data: {
        invoiceNumber,
        status: 'paid',
        paidAt: paymentDate || new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/visma/invoices/:invoiceNumber/cancel - Cancel invoice
   */
  @Post('/visma/invoices/:invoiceNumber/cancel')
  async cancelVismaInvoice(request: FastifyRequest<{ Params: { invoiceNumber: string } }>, reply: FastifyReply) {
    const { invoiceNumber } = request.params;

    return {
      data: {
        invoiceNumber,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/visma/customers - List customers
   */
  @Get('/visma/customers')
  async getVismaCustomers(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          id: 'cust-001',
          customerNumber: 'K1001',
          organizationNumber: '912345678',
          name: 'Oslo Idrettslag',
          customerType: 'organization',
          email: 'post@osloil.no',
          phone: '+47 22 12 34 56',
          invoiceAddress: {
            street: 'Idrettsveien 1',
            postalCode: '0150',
            city: 'Oslo',
            country: 'NO',
          },
          creditLimit: 50000,
          paymentTermsDays: 30,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'cust-002',
          customerNumber: 'K1002',
          organizationNumber: '987654321',
          name: 'Bergen Fotballklubb',
          customerType: 'organization',
          email: 'post@bergenfk.no',
          invoiceAddress: {
            street: 'Fotballveien 5',
            postalCode: '5020',
            city: 'Bergen',
            country: 'NO',
          },
          paymentTermsDays: 14,
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/visma/customers/:customerId - Get customer
   */
  @Get('/visma/customers/:customerId')
  async getVismaCustomer(request: FastifyRequest<{ Params: { customerId: string } }>, reply: FastifyReply) {
    const { customerId } = request.params;

    return {
      data: {
        id: customerId,
        customerNumber: 'K1001',
        organizationNumber: '912345678',
        name: 'Oslo Idrettslag',
        customerType: 'organization',
        email: 'post@osloil.no',
        phone: '+47 22 12 34 56',
        invoiceAddress: {
          street: 'Idrettsveien 1',
          postalCode: '0150',
          city: 'Oslo',
          country: 'NO',
        },
        creditLimit: 50000,
        paymentTermsDays: 30,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/visma/customers/org/:organizationNumber - Get customer by org number
   */
  @Get('/visma/customers/org/:organizationNumber')
  async getVismaCustomerByOrg(request: FastifyRequest<{ Params: { organizationNumber: string } }>, reply: FastifyReply) {
    const { organizationNumber } = request.params;

    return {
      data: {
        id: 'cust-001',
        customerNumber: 'K1001',
        organizationNumber,
        name: 'Oslo Idrettslag',
        customerType: 'organization',
        email: 'post@osloil.no',
        paymentTermsDays: 30,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/visma/customers - Create customer
   */
  @Post('/visma/customers')
  async createVismaCustomer(request: IntegrationRequest, reply: FastifyReply) {
    const data = request.body as any;

    return {
      data: {
        id: `cust-${Date.now()}`,
        customerNumber: `K${1000 + Math.floor(Math.random() * 9000)}`,
        ...data,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * PUT /api/integrations/visma/customers/:customerId - Update customer
   */
  @Put('/visma/customers/:customerId')
  async updateVismaCustomer(request: FastifyRequest<{ Params: { customerId: string } }>, reply: FastifyReply) {
    const { customerId } = request.params;
    const data = request.body as any;

    return {
      data: {
        id: customerId,
        customerNumber: 'K1001',
        ...data,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/visma/customers/:customerId/invoices - Customer invoices
   */
  @Get('/visma/customers/:customerId/invoices')
  async getVismaCustomerInvoices(request: FastifyRequest<{ Params: { customerId: string } }>, reply: FastifyReply) {
    const { customerId } = request.params;

    return {
      data: [
        {
          invoiceNumber: 'INV-001',
          bookingId: 'booking-001',
          organizationId: customerId,
          amount: 5000,
          status: 'paid',
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * GET /api/integrations/visma/credit-notes - List credit notes
   */
  @Get('/visma/credit-notes')
  async getVismaCreditNotes(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          id: 'cn-001',
          creditNoteNumber: 'CN-001',
          originalInvoiceNumber: 'INV-001',
          customerId: 'cust-001',
          amount: 1000,
          currency: 'NOK',
          reason: 'Kansellert booking',
          status: 'sent',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * POST /api/integrations/visma/credit-notes - Create credit note
   */
  @Post('/visma/credit-notes')
  async createVismaCreditNote(request: IntegrationRequest, reply: FastifyReply) {
    const { invoiceNumber, reason, amount } = request.body as any;

    return {
      data: {
        id: `cn-${Date.now()}`,
        creditNoteNumber: `CN-${Date.now().toString().slice(-6)}`,
        originalInvoiceNumber: invoiceNumber,
        customerId: 'cust-001',
        amount: amount || 5000,
        currency: 'NOK',
        reason,
        status: 'draft',
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/visma/credit-notes/:creditNoteNumber/send - Send credit note
   */
  @Post('/visma/credit-notes/:creditNoteNumber/send')
  async sendVismaCreditNote(request: FastifyRequest<{ Params: { creditNoteNumber: string } }>, reply: FastifyReply) {
    const { creditNoteNumber } = request.params;

    return {
      data: {
        creditNoteNumber,
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/visma/payments - List payments
   */
  @Get('/visma/payments')
  async getVismaPayments(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          id: 'pay-001',
          invoiceNumber: 'INV-001',
          paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 5000,
          currency: 'NOK',
          paymentMethod: 'bank_transfer',
          bankReference: 'REF123456',
        },
        {
          id: 'pay-002',
          invoiceNumber: 'INV-004',
          paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 2500,
          currency: 'NOK',
          paymentMethod: 'vipps',
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * POST /api/integrations/visma/payments - Register payment
   */
  @Post('/visma/payments')
  async registerVismaPayment(request: IntegrationRequest, reply: FastifyReply) {
    const data = request.body as any;

    return {
      data: {
        id: `pay-${Date.now()}`,
        ...data,
        paymentDate: data.paymentDate || new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/visma/reports/summary - Financial summary
   */
  @Get('/visma/reports/summary')
  async getVismaFinancialSummary(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        totalInvoiced: 125000,
        totalPaid: 98500,
        outstandingBalance: 26500,
        overdueAmount: 8500,
        invoiceCount: 15,
        paidInvoiceCount: 12,
        overdueInvoiceCount: 2,
      },
    };
  }

  /**
   * GET /api/integrations/visma/reports/aged-receivables - Aged receivables
   */
  @Get('/visma/reports/aged-receivables')
  async getVismaAgedReceivables(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        current: 15000,
        days30: 8000,
        days60: 2500,
        days90: 1000,
        days90Plus: 0,
        total: 26500,
      },
    };
  }

  /**
   * POST /api/integrations/visma/export - Export to accounting
   */
  @Post('/visma/export')
  async exportVismaToAccounting(request: IntegrationRequest, reply: FastifyReply) {
    const { format } = request.body as any;

    return {
      data: {
        downloadUrl: `https://api.visma.no/export/${Date.now()}.${format || 'csv'}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
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
    return {
      data: {
        connected: true,
        provider: 'Vipps',
        merchantId: 'merchant-xxx',
        environment: 'production',
      },
    };
  }

  /**
   * POST /api/integrations/vipps/initiate - Initiate payment
   */
  @Post('/vipps/initiate')
  async initiatePayment(request: IntegrationRequest, reply: FastifyReply) {
    const { bookingId, amount, description, returnUrl } = request.body as any;

    // Mock payment initiation
    const orderId = `order-${Date.now()}`;

    return {
      data: {
        orderId,
        bookingId,
        amount,
        currency: 'NOK',
        status: 'initiated',
        redirectUrl: `https://api.vipps.no/checkout/${orderId}`,
        returnUrl,
      },
    };
  }

  /**
   * GET /api/integrations/vipps/payment/:orderId - Get payment status
   */
  @Get('/vipps/payment/:orderId')
  async getPaymentStatus(request: FastifyRequest<{ Params: { orderId: string } }>, reply: FastifyReply) {
    const { orderId } = request.params;

    return {
      data: {
        orderId,
        status: 'completed',
        amount: 1500,
        currency: 'NOK',
        paidAt: new Date().toISOString(),
      },
    };
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

  // ============================================================
  // ACOS WebSak Integration (Norwegian Municipal Case Management)
  // ============================================================

  /**
   * GET /api/integrations/acos-websak/status - ACOS WebSak connection status
   */
  @Get('/acos-websak/status')
  async getAcosWebSakStatus(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        connected: true,
        provider: 'ACOS WebSak',
        version: '5.2.1',
        lastSync: new Date().toISOString(),
        pendingCases: 3,
        pendingDocuments: 12,
      },
    };
  }

  /**
   * POST /api/integrations/acos-websak/cases - Create case
   */
  @Post('/acos-websak/cases')
  async createAcosCase(request: IntegrationRequest, reply: FastifyReply) {
    const { title, caseType, bookingId, listingId, description } = request.body as any;

    // Mock NOARK-compliant case number generation (year/sequence)
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    const caseNumber = `${year}/${sequence.toString().padStart(4, '0')}`;

    return {
      data: {
        id: `acos-case-${Date.now()}`,
        caseNumber,
        title,
        status: 'open',
        caseType: caseType || 'booking',
        bookingId,
        listingId,
        responsibleUserId: request.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/acos-websak/cases/:caseId - Get case by ID
   */
  @Get('/acos-websak/cases/:caseId')
  async getAcosCase(request: FastifyRequest<{ Params: { caseId: string } }>, reply: FastifyReply) {
    const { caseId } = request.params;

    return {
      data: {
        id: caseId,
        caseNumber: '2025/0042',
        title: 'Booking - Kulturhuset Møterom A',
        status: 'open',
        caseType: 'booking',
        bookingId: 'booking-123',
        listingId: 'listing-456',
        responsibleUserId: 'user-001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/acos-websak/cases/booking/:bookingId - Get case by booking ID
   */
  @Get('/acos-websak/cases/booking/:bookingId')
  async getAcosCaseByBooking(request: FastifyRequest<{ Params: { bookingId: string } }>, reply: FastifyReply) {
    const { bookingId } = request.params;

    return {
      data: {
        id: `acos-case-${bookingId}`,
        caseNumber: '2025/0042',
        title: `Booking sak - ${bookingId}`,
        status: 'open',
        caseType: 'booking',
        bookingId,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/acos-websak/cases - List all cases
   */
  @Get('/acos-websak/cases')
  async listAcosCases(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: [
        {
          id: 'acos-case-001',
          caseNumber: '2025/0042',
          title: 'Booking - Kulturhuset Møterom A',
          status: 'open',
          caseType: 'booking',
          bookingId: 'booking-123',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'acos-case-002',
          caseNumber: '2025/0041',
          title: 'Søknad - Idrettshall helgeutleie',
          status: 'open',
          caseType: 'application',
          bookingId: 'booking-456',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'acos-case-003',
          caseNumber: '2024/1842',
          title: 'Klage - Avvist booking',
          status: 'closed',
          caseType: 'complaint',
          archivedAt: new Date(Date.now() - 604800000).toISOString(),
          createdAt: new Date(Date.now() - 1209600000).toISOString(),
          updatedAt: new Date(Date.now() - 604800000).toISOString(),
        },
      ],
      meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * PUT /api/integrations/acos-websak/cases/:caseId/status - Update case status
   */
  @Put('/acos-websak/cases/:caseId/status')
  async updateAcosCaseStatus(request: FastifyRequest<{ Params: { caseId: string } }>, reply: FastifyReply) {
    const { caseId } = request.params;
    const { status } = request.body as any;

    return {
      data: {
        id: caseId,
        caseNumber: '2025/0042',
        title: 'Booking - Kulturhuset Møterom A',
        status,
        caseType: 'booking',
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/acos-websak/cases/:caseId/archive - Archive case (NOARK)
   */
  @Post('/acos-websak/cases/:caseId/archive')
  async archiveAcosCase(request: FastifyRequest<{ Params: { caseId: string } }>, reply: FastifyReply) {
    const { caseId } = request.params;
    const metadata = request.body as any;

    return {
      data: {
        id: caseId,
        caseNumber: '2025/0042',
        title: 'Booking - Kulturhuset Møterom A',
        status: 'archived',
        caseType: 'booking',
        archivedAt: new Date().toISOString(),
        archiveMetadata: {
          archiveSeries: metadata?.archiveSeries || 'Utleieavtaler',
          classificationCode: metadata?.classificationCode || 'L42',
          retentionPeriod: metadata?.retentionPeriod || 10,
          archiveUnit: metadata?.archiveUnit || 'Kultur og fritid',
        },
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/acos-websak/documents - Upload document
   */
  @Post('/acos-websak/documents')
  async uploadAcosDocument(request: IntegrationRequest, reply: FastifyReply) {
    const { caseId, title, documentType, fileName, mimeType } = request.body as any;

    // Mock NOARK-compliant document number
    const docNumber = `DOK-${Date.now().toString().slice(-8)}`;

    return {
      data: {
        id: `acos-doc-${Date.now()}`,
        documentNumber: docNumber,
        title,
        documentType: documentType || 'internal',
        mimeType: mimeType || 'application/pdf',
        fileSize: Math.floor(Math.random() * 1000000) + 10000,
        caseId,
        status: 'draft',
        authorId: request.userId,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/acos-websak/documents/:documentId - Get document by ID
   */
  @Get('/acos-websak/documents/:documentId')
  async getAcosDocument(request: FastifyRequest<{ Params: { documentId: string } }>, reply: FastifyReply) {
    const { documentId } = request.params;

    return {
      data: {
        id: documentId,
        documentNumber: 'DOK-12345678',
        title: 'Leieavtale - Kulturhuset',
        documentType: 'outgoing',
        mimeType: 'application/pdf',
        fileSize: 245000,
        caseId: 'acos-case-001',
        status: 'finalized',
        authorId: 'user-001',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    };
  }

  /**
   * GET /api/integrations/acos-websak/cases/:caseId/documents - List documents for a case
   */
  @Get('/acos-websak/cases/:caseId/documents')
  async listAcosCaseDocuments(request: FastifyRequest<{ Params: { caseId: string } }>, reply: FastifyReply) {
    const { caseId } = request.params;

    return {
      data: [
        {
          id: 'acos-doc-001',
          documentNumber: 'DOK-12345678',
          title: 'Leieavtale - Kulturhuset',
          documentType: 'outgoing',
          mimeType: 'application/pdf',
          fileSize: 245000,
          caseId,
          status: 'finalized',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'acos-doc-002',
          documentNumber: 'DOK-12345679',
          title: 'Bekreftelse på betaling',
          documentType: 'incoming',
          mimeType: 'application/pdf',
          fileSize: 128000,
          caseId,
          status: 'finalized',
          uploadedAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * POST /api/integrations/acos-websak/documents/:documentId/archive - Archive document
   */
  @Post('/acos-websak/documents/:documentId/archive')
  async archiveAcosDocument(request: FastifyRequest<{ Params: { documentId: string } }>, reply: FastifyReply) {
    const { documentId } = request.params;

    return {
      data: {
        id: documentId,
        documentNumber: 'DOK-12345678',
        title: 'Leieavtale - Kulturhuset',
        documentType: 'outgoing',
        mimeType: 'application/pdf',
        fileSize: 245000,
        caseId: 'acos-case-001',
        status: 'archived',
        archivedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /api/integrations/acos-websak/sync - Trigger full sync
   */
  @Post('/acos-websak/sync')
  async syncAcosWebSak(request: IntegrationRequest, reply: FastifyReply) {
    return {
      data: {
        success: true,
        syncedCases: 15,
        syncedDocuments: 42,
        syncedAt: new Date().toISOString(),
      },
    };
  }
}
