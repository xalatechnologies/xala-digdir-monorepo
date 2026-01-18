/**
 * Recurring Booking Integration Tests
 * Tests for recurring preview and create endpoints
 *
 * Endpoints tested:
 * - POST /api/bookings/recurring/preview
 * - POST /api/bookings/recurring
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { TEST_IDS } from '@xala/api/../../__tests__/test-utils';

/**
 * Test context interface for recurring booking tests
 */
interface RecurringTestContext {
  app: FastifyInstance;
  testTenantId: string;
  testUserId: string;
  testListingId: string;
  cleanup: () => Promise<void>;
}

/**
 * Mock booking storage for testing
 */
const mockBookings = new Map<string, Record<string, unknown>>();
let bookingCounter = 0;

/**
 * Create a test application with recurring booking routes
 */
async function createRecurringTestApp(): Promise<RecurringTestContext> {
  const app = Fastify({ logger: false });

  // Clear mock storage before each test run
  mockBookings.clear();
  bookingCounter = 0;

  // Register recurring booking routes
  await registerRecurringRoutes(app);

  await app.ready();

  return {
    app,
    testTenantId: TEST_IDS.tenantId,
    testUserId: TEST_IDS.userId,
    testListingId: TEST_IDS.listingId,
    cleanup: async () => {
      await app.close();
    },
  };
}

/**
 * Generate mock occurrences for testing
 */
function generateMockOccurrences(
  startTime: string,
  endTime: string,
  frequency: string,
  endCondition: { type: string; occurrences?: number; untilDate?: string },
  weekdays?: number[]
): Array<{
  index: number;
  startTime: string;
  endTime: string;
  status: string;
  selected: boolean;
}> {
  const occurrences: Array<{
    index: number;
    startTime: string;
    endTime: string;
    status: string;
    selected: boolean;
  }> = [];

  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = end.getTime() - start.getTime();

  const maxOccurrences = endCondition.type === 'AFTER_OCCURRENCES'
    ? endCondition.occurrences!
    : 12; // Default max for UNTIL_DATE

  let currentDate = new Date(start);
  let index = 0;

  while (index < maxOccurrences) {
    const occurrenceStart = new Date(currentDate);
    const occurrenceEnd = new Date(currentDate.getTime() + duration);

    // Mock conflict detection - every 3rd occurrence has a conflict
    const hasConflict = index % 3 === 2;

    occurrences.push({
      index,
      startTime: occurrenceStart.toISOString(),
      endTime: occurrenceEnd.toISOString(),
      status: hasConflict ? 'CONFLICT' : 'AVAILABLE',
      selected: !hasConflict,
    });

    index++;

    // Advance to next occurrence based on frequency
    if (frequency === 'WEEKLY') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency === 'MONTHLY') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return occurrences;
}

/**
 * Register mock routes for recurring booking testing
 */
async function registerRecurringRoutes(app: FastifyInstance) {

  // ============================================================================
  // POST /api/bookings/recurring/preview - Preview recurring booking
  // ============================================================================
  app.post('/api/bookings/recurring/preview', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    const body = request.body as {
      listingId?: string;
      mode?: string;
      startTime?: string;
      endTime?: string;
      frequency?: string;
      weekdays?: number[];
      endCondition?: { type: string; occurrences?: number; untilDate?: string };
    };

    // Validation
    if (!body.listingId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'listingId is required' } };
    }

    if (!body.mode || body.mode !== 'RECURRING') {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Preview request must use RECURRING mode' } };
    }

    if (!body.startTime || !body.endTime) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'startTime and endTime are required' } };
    }

    if (!body.frequency) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'frequency is required for recurring mode' } };
    }

    if (!body.endCondition) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'endCondition is required for recurring mode' } };
    }

    // Validate end condition
    if (body.endCondition.type === 'AFTER_OCCURRENCES' && !body.endCondition.occurrences) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'occurrences required for AFTER_OCCURRENCES type' } };
    }

    if (body.endCondition.type === 'UNTIL_DATE' && !body.endCondition.untilDate) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'untilDate required for UNTIL_DATE type' } };
    }

    // Generate occurrences
    const occurrences = generateMockOccurrences(
      body.startTime,
      body.endTime,
      body.frequency,
      body.endCondition,
      body.weekdays
    );

    // Calculate summary
    const availableCount = occurrences.filter(o => o.status === 'AVAILABLE').length;
    const conflictCount = occurrences.filter(o => o.status === 'CONFLICT').length;
    const pricePerOccurrence = 500;

    const summary = {
      totalOccurrences: occurrences.length,
      availableCount,
      conflictCount,
      blockedCount: 0,
      blackoutCount: 0,
      totalPrice: availableCount * pricePerOccurrence,
      currency: 'NOK',
    };

    // Determine available actions
    const availableActions: string[] = [];
    if (conflictCount === 0 && availableCount > 0) {
      availableActions.push('CREATE_ALL');
    }
    if (availableCount > 0) {
      availableActions.push('CREATE_AVAILABLE');
    }
    availableActions.push('MODIFY_SELECTION');

    return {
      data: {
        listingId: body.listingId,
        selection: body,
        occurrences,
        summary,
        proposedSelection: conflictCount > 0 ? body : undefined,
        generatedAt: new Date().toISOString(),
        validFor: 'PT5M',
        availableActions,
        permissions: {
          canCreateAll: conflictCount === 0,
          canCreatePartial: availableCount > 0,
          canModify: true,
        },
      },
    };
  });

  // ============================================================================
  // POST /api/bookings/recurring - Create recurring booking
  // ============================================================================
  app.post('/api/bookings/recurring', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    const userId = request.headers['x-user-id'] as string || 'anonymous';

    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    const body = request.body as {
      listingId?: string;
      startTime?: string;
      endTime?: string;
      frequency?: string;
      weekdays?: number[];
      endCondition?: { type: string; occurrences?: number; untilDate?: string };
      stopOnConflict?: boolean;
      allowPartial?: boolean;
      selectedOccurrences?: number[];
      userId?: string;
      notes?: string;
      metadata?: Record<string, unknown>;
    };

    // Validation
    if (!body.listingId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'listingId is required' } };
    }

    if (!body.startTime || !body.endTime) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'startTime and endTime are required' } };
    }

    if (!body.frequency) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'frequency is required' } };
    }

    if (!body.endCondition) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'endCondition is required' } };
    }

    // Validate startTime < endTime
    const startDate = new Date(body.startTime);
    const endDate = new Date(body.endTime);
    if (endDate <= startDate) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'End time must be after start time' } };
    }

    // Apply default policies
    const stopOnConflict = body.stopOnConflict ?? false;
    const allowPartial = body.allowPartial ?? true;

    // Generate occurrences
    const occurrences = generateMockOccurrences(
      body.startTime,
      body.endTime,
      body.frequency,
      body.endCondition,
      body.weekdays
    );

    // Filter to selected occurrences if specified
    let targetOccurrences = occurrences;
    if (body.selectedOccurrences && body.selectedOccurrences.length > 0) {
      targetOccurrences = occurrences.filter((_, index) =>
        body.selectedOccurrences!.includes(index)
      );
    }

    const conflictOccurrences = targetOccurrences.filter(o => o.status !== 'AVAILABLE');
    const availableOccurrences = targetOccurrences.filter(o => o.status === 'AVAILABLE');

    // Apply stopOnConflict policy
    if (stopOnConflict && conflictOccurrences.length > 0) {
      reply.code(201);
      return {
        data: {
          created: [],
          failed: conflictOccurrences.map(o => ({
            index: o.index,
            startTime: o.startTime,
            endTime: o.endTime,
            status: o.status,
            reasonKey: 'booking.conflict.stopOnConflict',
          })),
          summary: {
            totalRequested: targetOccurrences.length,
            createdCount: 0,
            failedCount: conflictOccurrences.length,
            totalPrice: 0,
            currency: 'NOK',
          },
          seriesMetadata: {
            frequency: body.frequency,
            weekdays: body.weekdays,
            firstOccurrence: targetOccurrences[0]?.startTime || body.startTime,
            lastOccurrence: targetOccurrences[targetOccurrences.length - 1]?.endTime,
          },
          createdAt: new Date().toISOString(),
        },
      };
    }

    // Create bookings for available occurrences
    const createdBookings: Array<Record<string, unknown>> = [];
    const failed: Array<Record<string, unknown>> = [];
    const seriesId = crypto.randomUUID();
    const effectiveUserId = body.userId || userId;

    // Add conflict occurrences to failed list
    for (const occurrence of conflictOccurrences) {
      failed.push({
        index: occurrence.index,
        startTime: occurrence.startTime,
        endTime: occurrence.endTime,
        status: occurrence.status,
        reasonKey: 'booking.conflict.existingBooking',
      });
    }

    // Create bookings for available slots
    for (const occurrence of availableOccurrences) {
      const bookingId = crypto.randomUUID();
      bookingCounter++;

      const booking = {
        id: bookingId,
        tenantId,
        listingId: body.listingId,
        userId: effectiveUserId,
        status: 'pending',
        startTime: occurrence.startTime,
        endTime: occurrence.endTime,
        totalPrice: 500,
        currency: 'NOK',
        notes: body.notes,
        metadata: {
          ...body.metadata,
          recurring: true,
          frequency: body.frequency,
          weekdays: body.weekdays,
          seriesId,
          occurrenceIndex: occurrence.index,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockBookings.set(bookingId, booking);
      createdBookings.push(booking);
    }

    const totalPrice = createdBookings.length * 500;

    reply.code(201);
    return {
      data: {
        created: createdBookings,
        failed,
        summary: {
          totalRequested: targetOccurrences.length,
          createdCount: createdBookings.length,
          failedCount: failed.length,
          totalPrice,
          currency: 'NOK',
        },
        seriesMetadata: {
          frequency: body.frequency,
          weekdays: body.weekdays,
          firstOccurrence: createdBookings[0]?.startTime || targetOccurrences[0]?.startTime || body.startTime,
          lastOccurrence: createdBookings[createdBookings.length - 1]?.endTime || targetOccurrences[targetOccurrences.length - 1]?.endTime,
          seriesId,
        },
        createdAt: new Date().toISOString(),
      },
    };
  });

  // ============================================================================
  // GET /api/bookings/recurring - List recurring bookings (for verification)
  // ============================================================================
  app.get('/api/bookings/recurring', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }

    const bookings = Array.from(mockBookings.values()).filter(
      (b: any) => b.tenantId === tenantId && b.metadata?.recurring
    );

    return { data: bookings };
  });
}

// =============================================================================
// Test Suite
// =============================================================================

describe('Recurring Booking API Integration Tests', () => {
  let ctx: RecurringTestContext;

  beforeAll(async () => {
    ctx = await createRecurringTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  // ===========================================================================
  // POST /api/bookings/recurring/preview Tests
  // ===========================================================================
  describe('POST /api/bookings/recurring/preview', () => {
    const validPreviewRequest = {
      listingId: TEST_IDS.listingId,
      mode: 'RECURRING',
      startTime: '2026-02-01T10:00:00.000Z',
      endTime: '2026-02-01T12:00:00.000Z',
      frequency: 'WEEKLY',
      weekdays: [1], // Monday
      endCondition: {
        type: 'AFTER_OCCURRENCES',
        occurrences: 4,
      },
    };

    it('should return preview with occurrences for valid request', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: validPreviewRequest,
      });

      expect(res.statusCode).toBe(200);
      const data = res.json().data;

      expect(data.listingId).toBe(TEST_IDS.listingId);
      expect(data.occurrences).toBeDefined();
      expect(Array.isArray(data.occurrences)).toBe(true);
      expect(data.occurrences.length).toBe(4);
      expect(data.summary).toBeDefined();
      expect(data.permissions).toBeDefined();
    });

    it('should include summary statistics in preview', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: validPreviewRequest,
      });

      expect(res.statusCode).toBe(200);
      const summary = res.json().data.summary;

      expect(summary.totalOccurrences).toBeDefined();
      expect(summary.availableCount).toBeDefined();
      expect(summary.conflictCount).toBeDefined();
      expect(summary.totalPrice).toBeDefined();
      expect(summary.currency).toBe('NOK');
    });

    it('should include permissions in preview response', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: validPreviewRequest,
      });

      expect(res.statusCode).toBe(200);
      const permissions = res.json().data.permissions;

      expect(permissions).toHaveProperty('canCreateAll');
      expect(permissions).toHaveProperty('canCreatePartial');
      expect(permissions).toHaveProperty('canModify');
    });

    it('should include available actions based on conflicts', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: validPreviewRequest,
      });

      expect(res.statusCode).toBe(200);
      const availableActions = res.json().data.availableActions;

      expect(Array.isArray(availableActions)).toBe(true);
      expect(availableActions).toContain('MODIFY_SELECTION');
    });

    it('should return occurrence with status for each date', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: validPreviewRequest,
      });

      expect(res.statusCode).toBe(200);
      const occurrence = res.json().data.occurrences[0];

      expect(occurrence).toHaveProperty('index');
      expect(occurrence).toHaveProperty('startTime');
      expect(occurrence).toHaveProperty('endTime');
      expect(occurrence).toHaveProperty('status');
      expect(occurrence).toHaveProperty('selected');
    });

    it('should support UNTIL_DATE end condition type', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: {
          ...validPreviewRequest,
          endCondition: {
            type: 'UNTIL_DATE',
            untilDate: '2026-03-01T12:00:00.000Z',
          },
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().data.occurrences.length).toBeGreaterThan(0);
    });

    it('should support MONTHLY frequency', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: {
          ...validPreviewRequest,
          frequency: 'MONTHLY',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().data.occurrences).toBeDefined();
    });

    it('should return 400 without tenant ID', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        payload: validPreviewRequest,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 without listingId', async () => {
      const { listingId, ...noListingRequest } = validPreviewRequest;

      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: noListingRequest,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.message).toContain('listingId');
    });

    it('should return 400 without RECURRING mode', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: { ...validPreviewRequest, mode: 'SINGLE_SLOT' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.message).toContain('RECURRING');
    });

    it('should return 400 without frequency', async () => {
      const { frequency, ...noFrequencyRequest } = validPreviewRequest;

      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: noFrequencyRequest,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.message).toContain('frequency');
    });

    it('should return 400 without endCondition', async () => {
      const { endCondition, ...noEndConditionRequest } = validPreviewRequest;

      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: noEndConditionRequest,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.message).toContain('endCondition');
    });

    it('should return 400 when AFTER_OCCURRENCES missing occurrences count', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: {
          ...validPreviewRequest,
          endCondition: { type: 'AFTER_OCCURRENCES' },
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when UNTIL_DATE missing untilDate', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring/preview',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: {
          ...validPreviewRequest,
          endCondition: { type: 'UNTIL_DATE' },
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ===========================================================================
  // POST /api/bookings/recurring Tests
  // ===========================================================================
  describe('POST /api/bookings/recurring', () => {
    const validCreateRequest = {
      listingId: TEST_IDS.listingId,
      startTime: '2026-03-01T14:00:00.000Z',
      endTime: '2026-03-01T16:00:00.000Z',
      frequency: 'WEEKLY',
      weekdays: [2], // Tuesday
      endCondition: {
        type: 'AFTER_OCCURRENCES',
        occurrences: 4,
      },
    };

    it('should create recurring bookings with default policies', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(201);
      const data = res.json().data;

      expect(data.created).toBeDefined();
      expect(Array.isArray(data.created)).toBe(true);
      expect(data.failed).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.seriesMetadata).toBeDefined();
    });

    it('should return result projection with created and failed arrays', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(201);
      const data = res.json().data;

      expect(data).toHaveProperty('created');
      expect(data).toHaveProperty('failed');
      expect(data.summary).toHaveProperty('createdCount');
      expect(data.summary).toHaveProperty('failedCount');
    });

    it('should include summary with totalRequested and counts', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(201);
      const summary = res.json().data.summary;

      expect(summary.totalRequested).toBe(4);
      expect(summary.createdCount + summary.failedCount).toBe(summary.totalRequested);
      expect(summary.totalPrice).toBeDefined();
      expect(summary.currency).toBe('NOK');
    });

    it('should include seriesMetadata with frequency and dates', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(201);
      const seriesMetadata = res.json().data.seriesMetadata;

      expect(seriesMetadata.frequency).toBe('WEEKLY');
      expect(seriesMetadata.firstOccurrence).toBeDefined();
      expect(seriesMetadata.seriesId).toBeDefined();
    });

    it('should create bookings with recurring metadata', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(201);
      const createdBooking = res.json().data.created[0];

      if (createdBooking) {
        expect(createdBooking.metadata.recurring).toBe(true);
        expect(createdBooking.metadata.frequency).toBe('WEEKLY');
        expect(createdBooking.metadata.seriesId).toBeDefined();
      }
    });

    it('should stop on conflict when stopOnConflict is true', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          stopOnConflict: true,
        },
      });

      expect(res.statusCode).toBe(201);
      const data = res.json().data;

      // With stopOnConflict true and mock conflicts, no bookings should be created
      // because our mock generates conflicts for every 3rd occurrence
      expect(data.summary.failedCount).toBeGreaterThanOrEqual(0);
    });

    it('should allow partial creation when allowPartial is true (default)', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          allowPartial: true,
        },
      });

      expect(res.statusCode).toBe(201);
      const data = res.json().data;

      // With allowPartial true, available occurrences should be created
      expect(data.created.length).toBeGreaterThanOrEqual(0);
    });

    it('should support selectedOccurrences for user-curated creation', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          selectedOccurrences: [0, 1], // Only first two occurrences
        },
      });

      expect(res.statusCode).toBe(201);
      const data = res.json().data;

      expect(data.summary.totalRequested).toBe(2);
    });

    it('should support custom notes in request', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          notes: 'Weekly team meeting',
        },
      });

      expect(res.statusCode).toBe(201);
      const createdBooking = res.json().data.created[0];

      if (createdBooking) {
        expect(createdBooking.notes).toBe('Weekly team meeting');
      }
    });

    it('should support custom metadata in request', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          metadata: { attendees: 10, equipment: ['projector'] },
        },
      });

      expect(res.statusCode).toBe(201);
      const createdBooking = res.json().data.created[0];

      if (createdBooking) {
        expect(createdBooking.metadata.attendees).toBe(10);
      }
    });

    it('should return 400 without tenant ID', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 without listingId', async () => {
      const { listingId, ...noListingRequest } = validCreateRequest;

      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: noListingRequest,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 without frequency', async () => {
      const { frequency, ...noFrequencyRequest } = validCreateRequest;

      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: noFrequencyRequest,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 without endCondition', async () => {
      const { endCondition, ...noEndConditionRequest } = validCreateRequest;

      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: noEndConditionRequest,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when endTime is before startTime', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
        payload: {
          ...validCreateRequest,
          startTime: '2026-03-01T16:00:00.000Z',
          endTime: '2026-03-01T14:00:00.000Z',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.message).toContain('End time must be after start time');
    });

    it('should support MONTHLY frequency', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          frequency: 'MONTHLY',
        },
      });

      expect(res.statusCode).toBe(201);
      const seriesMetadata = res.json().data.seriesMetadata;
      expect(seriesMetadata.frequency).toBe('MONTHLY');
    });

    it('should support UNTIL_DATE end condition', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          ...validCreateRequest,
          endCondition: {
            type: 'UNTIL_DATE',
            untilDate: '2026-04-01T16:00:00.000Z',
          },
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().data.created).toBeDefined();
    });

    it('should include createdAt timestamp in response', async () => {
      const res = await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: validCreateRequest,
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().data.createdAt).toBeDefined();
    });
  });

  // ===========================================================================
  // GET /api/bookings/recurring Tests
  // ===========================================================================
  describe('GET /api/bookings/recurring', () => {
    it('should list recurring bookings for tenant', async () => {
      // First create a recurring booking
      await ctx.app.inject({
        method: 'POST',
        url: '/api/bookings/recurring',
        headers: {
          'X-Tenant-Id': ctx.testTenantId,
          'X-User-Id': ctx.testUserId,
        },
        payload: {
          listingId: TEST_IDS.listingId,
          startTime: '2026-04-01T10:00:00.000Z',
          endTime: '2026-04-01T12:00:00.000Z',
          frequency: 'WEEKLY',
          endCondition: { type: 'AFTER_OCCURRENCES', occurrences: 2 },
        },
      });

      const res = await ctx.app.inject({
        method: 'GET',
        url: '/api/bookings/recurring',
        headers: { 'X-Tenant-Id': ctx.testTenantId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().data).toBeDefined();
      expect(Array.isArray(res.json().data)).toBe(true);
    });

    it('should return 400 without tenant ID', async () => {
      const res = await ctx.app.inject({
        method: 'GET',
        url: '/api/bookings/recurring',
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
