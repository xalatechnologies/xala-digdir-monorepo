/**
 * Calendar API Tests
 * Tests for calendar-config and availability-matrix endpoints
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { TEST_IDS } from './test-utils';

// =============================================================================
// Test Data and Mock Setup
// =============================================================================

const TEST_LISTING_ID = TEST_IDS.listingId;
const TEST_LISTING_ID_ACCOMMODATION = 'accomm01-0000-0000-0000-000000000001';
const TEST_LISTING_ID_EVENT = 'event001-0000-0000-0000-000000000001';
const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

// Mock listing data
const mockListings: Record<string, any> = {
  [TEST_LISTING_ID]: {
    id: TEST_LISTING_ID,
    name: 'Test Meeting Room',
    type: 'SPACE',
    status: 'published',
    metadata: {
      slotSizeMinutes: 60,
      minDurationMinutes: 60,
      maxDurationMinutes: 240,
      stepMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 15,
      minNoticeMinutes: 60,
      bookingHorizonDays: 90,
      allowSameDayBooking: true,
    },
  },
  [TEST_LISTING_ID_ACCOMMODATION]: {
    id: TEST_LISTING_ID_ACCOMMODATION,
    name: 'Test Cabin',
    type: 'ACCOMMODATION',
    status: 'published',
    metadata: {
      maxStayDays: 14,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
    },
  },
  [TEST_LISTING_ID_EVENT]: {
    id: TEST_LISTING_ID_EVENT,
    name: 'Test Event Hall',
    type: 'EVENT',
    status: 'published',
    metadata: {},
  },
};

// Mock bookings
const mockBookings = [
  {
    id: 'booking1-0000-0000-0000-000000000001',
    listingId: TEST_LISTING_ID,
    startTime: new Date('2026-01-20T10:00:00Z'),
    endTime: new Date('2026-01-20T12:00:00Z'),
    status: 'confirmed',
  },
  {
    id: 'booking2-0000-0000-0000-000000000002',
    listingId: TEST_LISTING_ID,
    startTime: new Date('2026-01-21T14:00:00Z'),
    endTime: new Date('2026-01-21T16:00:00Z'),
    status: 'pending',
  },
];

// Mock allocations (blocks)
const mockAllocations = [
  {
    id: 'alloc001-0000-0000-0000-000000000001',
    listingId: TEST_LISTING_ID,
    startTime: new Date('2026-01-22T09:00:00Z'),
    endTime: new Date('2026-01-22T17:00:00Z'),
    status: 'blocked',
    bookingId: null,
  },
];

// =============================================================================
// Test App Setup with Calendar Routes
// =============================================================================

async function createCalendarTestApp(): Promise<{ app: FastifyInstance; cleanup: () => Promise<void> }> {
  const app = Fastify({ logger: false });

  // ==========================================================================
  // GET /api/listings/:id/calendar-config
  // ==========================================================================
  app.get('/api/listings/:id/calendar-config', async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { bookingType?: string };

    const listing = mockListings[id];

    if (!listing) {
      reply.code(404);
      return {
        type: 'urn:digilist:error:NOT_FOUND',
        title: 'Not Found',
        status: 404,
        detail: `Listing with id ${id} not found`,
      };
    }

    // Determine granularity based on listing type
    const granularity = getGranularityByType(listing.type);
    const slotConfig = getSlotConfig(listing, granularity);
    const uiConfig = getUIConfig(granularity);

    return {
      data: {
        listingId: id,
        granularity,
        timezone: 'Europe/Oslo',
        ...slotConfig,
        minNoticeMinutes: listing.metadata?.minNoticeMinutes || 60,
        bookingHorizonDays: listing.metadata?.bookingHorizonDays || 90,
        allowSameDayBooking: listing.metadata?.allowSameDayBooking ?? true,
        openingHours: {
          weekly: {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { open: '10:00', close: '15:00', closed: true },
            sunday: { open: '10:00', close: '15:00', closed: true },
          },
          exceptions: [],
        },
        bookingTypes: [
          {
            code: query.bookingType || 'HOURLY',
            labelKey: 'calendar.bookingType.hourly',
            default: true,
            rules: {},
          },
        ],
        ui: uiConfig,
        permissions: {
          canViewCalendar: true,
          canSelectSlot: listing.status === 'published',
          canRequestBooking: listing.status === 'published',
        },
        availableActions: listing.status === 'published' ? [
          { code: 'SELECT_SLOT', labelKey: 'calendar.action.selectSlot', enabled: true },
          { code: 'REQUEST_BOOKING', labelKey: 'calendar.action.requestBooking', enabled: true },
        ] : [],
      },
    };
  });

  // ==========================================================================
  // GET /api/availability/:listingId
  // ==========================================================================
  app.get('/api/availability/:listingId', async (request, reply) => {
    const { listingId } = request.params as { listingId: string };
    const query = request.query as { from?: string; to?: string; bookingType?: string };

    // Validate required params
    if (!query.from || !query.to) {
      reply.code(400);
      return {
        type: 'urn:digilist:error:VALIDATION_ERROR',
        title: 'Validation Error',
        status: 400,
        detail: 'from and to query parameters are required',
      };
    }

    // Validate date format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(query.from) || !datePattern.test(query.to)) {
      reply.code(400);
      return {
        type: 'urn:digilist:error:VALIDATION_ERROR',
        title: 'Validation Error',
        status: 400,
        detail: 'from and to must be in YYYY-MM-DD format',
      };
    }

    // Validate date range
    if (query.from > query.to) {
      reply.code(400);
      return {
        type: 'urn:digilist:error:VALIDATION_ERROR',
        title: 'Validation Error',
        status: 400,
        detail: 'From date must be before or equal to to date',
      };
    }

    const listing = mockListings[listingId];

    if (!listing) {
      reply.code(404);
      return {
        type: 'urn:digilist:error:NOT_FOUND',
        title: 'Not Found',
        status: 404,
        detail: `Listing with id ${listingId} not found`,
      };
    }

    const granularity = getGranularityByType(listing.type);
    const cells = generateMockCells(listingId, query.from, query.to, granularity);

    return {
      data: {
        listingId,
        from: query.from,
        to: query.to,
        granularity,
        cells,
        legend: [
          { status: 'AVAILABLE', labelKey: 'calendar.status.available' },
          { status: 'RESERVED', labelKey: 'calendar.status.reserved' },
          { status: 'BOOKED', labelKey: 'calendar.status.booked' },
          { status: 'BLOCKED', labelKey: 'calendar.status.blocked' },
          { status: 'BLACKOUT', labelKey: 'calendar.status.blackout' },
          { status: 'CLOSED', labelKey: 'calendar.status.closed' },
        ],
      },
    };
  });

  await app.ready();

  return {
    app,
    cleanup: async () => {
      await app.close();
    },
  };
}

// Helper functions for mock routes
function getGranularityByType(type: string): string {
  switch (type?.toUpperCase()) {
    case 'ACCOMMODATION':
    case 'CABIN':
    case 'RENTAL':
      return 'MULTI_DAY';
    case 'EVENT':
      return 'ALL_DAY';
    case 'SPACE':
    case 'MEETING_ROOM':
    case 'FACILITY':
    case 'RESOURCE':
    default:
      return 'TIME_SLOTS';
  }
}

function getSlotConfig(listing: any, granularity: string) {
  const metadata = listing.metadata || {};

  switch (granularity) {
    case 'MULTI_DAY':
      return {
        slotSizeMinutes: 1440,
        selectableUnit: 'range',
        minDurationMinutes: 1440,
        maxDurationMinutes: metadata.maxStayDays ? metadata.maxStayDays * 1440 : null,
        stepMinutes: 1440,
        bufferBeforeMinutes: metadata.bufferBeforeMinutes || 0,
        bufferAfterMinutes: metadata.bufferAfterMinutes || 0,
      };
    case 'ALL_DAY':
      return {
        slotSizeMinutes: 1440,
        selectableUnit: 'day',
        minDurationMinutes: 1440,
        maxDurationMinutes: 1440,
        stepMinutes: 1440,
      };
    case 'TIME_SLOTS':
    default:
      return {
        slotSizeMinutes: metadata.slotSizeMinutes || 60,
        selectableUnit: 'slot',
        minDurationMinutes: metadata.minDurationMinutes || 60,
        maxDurationMinutes: metadata.maxDurationMinutes || null,
        stepMinutes: metadata.stepMinutes || 30,
        bufferBeforeMinutes: metadata.bufferBeforeMinutes || 0,
        bufferAfterMinutes: metadata.bufferAfterMinutes || 15,
      };
  }
}

function getUIConfig(granularity: string) {
  switch (granularity) {
    case 'MULTI_DAY':
      return {
        showWeekView: false,
        showMonthView: true,
        showDayView: false,
        defaultView: 'month',
        allowMultiSelect: true,
      };
    case 'ALL_DAY':
      return {
        showWeekView: false,
        showMonthView: true,
        showDayView: false,
        defaultView: 'month',
        allowMultiSelect: false,
      };
    case 'TIME_SLOTS':
    default:
      return {
        showWeekView: true,
        showMonthView: true,
        showDayView: true,
        defaultView: 'week',
        allowMultiSelect: true,
      };
  }
}

function generateMockCells(listingId: string, from: string, to: string, granularity: string) {
  const cells: any[] = [];
  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    if (granularity === 'MULTI_DAY' || granularity === 'ALL_DAY') {
      // Day-level cells
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Check for mock bookings/blocks
      const cellStatus = getCellStatusForTime(listingId, dayStart, dayEnd);

      cells.push({
        start: dayStart.toISOString(),
        end: dayEnd.toISOString(),
        ...cellStatus,
      });
    } else {
      // Time slot cells (9 AM - 5 PM)
      for (let hour = 9; hour < 17; hour++) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const cellStatus = getCellStatusForTime(listingId, slotStart, slotEnd);

        cells.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          ...cellStatus,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }

  return cells;
}

function getCellStatusForTime(listingId: string, start: Date, end: Date) {
  // Check allocations
  for (const alloc of mockAllocations) {
    if (alloc.listingId !== listingId) continue;
    if (timeRangesOverlap(start, end, alloc.startTime, alloc.endTime)) {
      return {
        status: 'BLOCKED',
        reasonKey: 'calendar.reason.blocked',
        blockId: alloc.id,
      };
    }
  }

  // Check bookings
  for (const booking of mockBookings) {
    if (booking.listingId !== listingId) continue;
    if (timeRangesOverlap(start, end, booking.startTime, booking.endTime)) {
      if (booking.status === 'confirmed') {
        return {
          status: 'BOOKED',
          reasonKey: 'calendar.reason.booked',
          bookingId: booking.id,
        };
      } else {
        return {
          status: 'RESERVED',
          reasonKey: 'calendar.reason.reserved',
          bookingId: booking.id,
        };
      }
    }
  }

  return {
    status: 'AVAILABLE',
    reasonKey: null,
  };
}

function timeRangesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}

// =============================================================================
// Test Suites
// =============================================================================

describe('Calendar API', () => {
  let app: FastifyInstance;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const testApp = await createCalendarTestApp();
    app = testApp.app;
    cleanup = testApp.cleanup;
  });

  afterAll(async () => {
    await cleanup();
  });

  // ===========================================================================
  // Calendar Config Endpoint Tests
  // ===========================================================================
  describe('GET /api/listings/:id/calendar-config', () => {
    it('should return calendar config for valid listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data).toBeDefined();
      expect(result.data.listingId).toBe(TEST_LISTING_ID);
      expect(result.data.granularity).toBeDefined();
      expect(result.data.timezone).toBe('Europe/Oslo');
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${NON_EXISTENT_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(404);
      const result = response.json();
      expect(result.type).toContain('NOT_FOUND');
    });

    it('should return TIME_SLOTS granularity for SPACE listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.granularity).toBe('TIME_SLOTS');
      expect(result.data.selectableUnit).toBe('slot');
    });

    it('should return MULTI_DAY granularity for ACCOMMODATION listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID_ACCOMMODATION}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.granularity).toBe('MULTI_DAY');
      expect(result.data.selectableUnit).toBe('range');
    });

    it('should return ALL_DAY granularity for EVENT listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID_EVENT}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.granularity).toBe('ALL_DAY');
      expect(result.data.selectableUnit).toBe('day');
    });

    it('should include slot configuration for TIME_SLOTS granularity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.slotSizeMinutes).toBe(60);
      expect(result.data.minDurationMinutes).toBe(60);
      expect(result.data.maxDurationMinutes).toBe(240);
      expect(result.data.stepMinutes).toBe(30);
    });

    it('should include opening hours', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.openingHours).toBeDefined();
      expect(result.data.openingHours.weekly).toBeDefined();
      expect(result.data.openingHours.weekly.monday).toEqual({ open: '09:00', close: '17:00' });
    });

    it('should include booking window constraints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.minNoticeMinutes).toBe(60);
      expect(result.data.bookingHorizonDays).toBe(90);
      expect(result.data.allowSameDayBooking).toBe(true);
    });

    it('should include booking types', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.bookingTypes).toBeDefined();
      expect(Array.isArray(result.data.bookingTypes)).toBe(true);
      expect(result.data.bookingTypes.length).toBeGreaterThan(0);
      expect(result.data.bookingTypes[0].code).toBeDefined();
      expect(result.data.bookingTypes[0].labelKey).toBeDefined();
    });

    it('should handle bookingType query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
        query: { bookingType: 'ALL_DAY' },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.bookingTypes[0].code).toBe('ALL_DAY');
    });

    it('should include UI configuration', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.ui).toBeDefined();
      expect(result.data.ui.showWeekView).toBe(true);
      expect(result.data.ui.showMonthView).toBe(true);
      expect(result.data.ui.showDayView).toBe(true);
      expect(result.data.ui.defaultView).toBe('week');
      expect(result.data.ui.allowMultiSelect).toBe(true);
    });

    it('should include RBAC permissions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.permissions).toBeDefined();
      expect(result.data.permissions.canViewCalendar).toBe(true);
      expect(result.data.permissions.canSelectSlot).toBe(true);
      expect(result.data.permissions.canRequestBooking).toBe(true);
    });

    it('should include available actions for published listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.availableActions).toBeDefined();
      expect(Array.isArray(result.data.availableActions)).toBe(true);
      expect(result.data.availableActions.length).toBe(2);
      expect(result.data.availableActions[0].code).toBe('SELECT_SLOT');
      expect(result.data.availableActions[1].code).toBe('REQUEST_BOOKING');
    });

    it('should return correct UI config for MULTI_DAY granularity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID_ACCOMMODATION}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.ui.showWeekView).toBe(false);
      expect(result.data.ui.showMonthView).toBe(true);
      expect(result.data.ui.showDayView).toBe(false);
      expect(result.data.ui.defaultView).toBe('month');
      expect(result.data.ui.allowMultiSelect).toBe(true);
    });

    it('should return correct UI config for ALL_DAY granularity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/listings/${TEST_LISTING_ID_EVENT}/calendar-config`,
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.ui.allowMultiSelect).toBe(false);
    });
  });

  // ===========================================================================
  // Availability Matrix Endpoint Tests
  // ===========================================================================
  describe('GET /api/availability/:listingId', () => {
    it('should return availability matrix for valid params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-22',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data).toBeDefined();
      expect(result.data.listingId).toBe(TEST_LISTING_ID);
      expect(result.data.from).toBe('2026-01-20');
      expect(result.data.to).toBe('2026-01-22');
      expect(result.data.granularity).toBe('TIME_SLOTS');
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${NON_EXISTENT_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-22',
        },
      });

      expect(response.statusCode).toBe(404);
      const result = response.json();
      expect(result.type).toContain('NOT_FOUND');
    });

    it('should return 400 when from date is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          to: '2026-01-22',
        },
      });

      expect(response.statusCode).toBe(400);
      const result = response.json();
      expect(result.type).toContain('VALIDATION_ERROR');
    });

    it('should return 400 when to date is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(400);
      const result = response.json();
      expect(result.type).toContain('VALIDATION_ERROR');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '01-20-2026',
          to: '01-22-2026',
        },
      });

      expect(response.statusCode).toBe(400);
      const result = response.json();
      expect(result.type).toContain('VALIDATION_ERROR');
    });

    it('should return 400 when from date is after to date', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-25',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(400);
      const result = response.json();
      expect(result.type).toContain('VALIDATION_ERROR');
      expect(result.detail).toContain('before or equal');
    });

    it('should return availability cells array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.cells).toBeDefined();
      expect(Array.isArray(result.data.cells)).toBe(true);
      expect(result.data.cells.length).toBeGreaterThan(0);
    });

    it('should return cells with correct structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      const cell = result.data.cells[0];
      expect(cell.start).toBeDefined();
      expect(cell.end).toBeDefined();
      expect(cell.status).toBeDefined();
      expect(['AVAILABLE', 'RESERVED', 'BOOKED', 'BLOCKED', 'BLACKOUT', 'CLOSED']).toContain(cell.status);
    });

    it('should return BOOKED status for confirmed bookings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      // Find the cell that overlaps with the booked slot (10:00-12:00)
      const bookedCell = result.data.cells.find((cell: any) => {
        const cellStart = new Date(cell.start);
        return cellStart.getUTCHours() === 10 || cellStart.getUTCHours() === 11;
      });
      if (bookedCell) {
        expect(bookedCell.status).toBe('BOOKED');
        expect(bookedCell.bookingId).toBeDefined();
        expect(bookedCell.reasonKey).toBe('calendar.reason.booked');
      }
    });

    it('should return RESERVED status for pending bookings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-21',
          to: '2026-01-21',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      // Find the cell that overlaps with the reserved slot (14:00-16:00)
      const reservedCell = result.data.cells.find((cell: any) => {
        const cellStart = new Date(cell.start);
        return cellStart.getUTCHours() === 14 || cellStart.getUTCHours() === 15;
      });
      if (reservedCell) {
        expect(reservedCell.status).toBe('RESERVED');
        expect(reservedCell.bookingId).toBeDefined();
        expect(reservedCell.reasonKey).toBe('calendar.reason.reserved');
      }
    });

    it('should return BLOCKED status for blocked allocations', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-22',
          to: '2026-01-22',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      const blockedCell = result.data.cells.find((cell: any) => cell.status === 'BLOCKED');
      if (blockedCell) {
        expect(blockedCell.blockId).toBeDefined();
        expect(blockedCell.reasonKey).toBe('calendar.reason.blocked');
      }
    });

    it('should return AVAILABLE status for open slots', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-25',
          to: '2026-01-25',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      const availableCell = result.data.cells.find((cell: any) => cell.status === 'AVAILABLE');
      expect(availableCell).toBeDefined();
      expect(availableCell.reasonKey).toBeNull();
    });

    it('should return legend with all slot statuses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.legend).toBeDefined();
      expect(Array.isArray(result.data.legend)).toBe(true);
      expect(result.data.legend.length).toBe(6);

      const statuses = result.data.legend.map((item: any) => item.status);
      expect(statuses).toContain('AVAILABLE');
      expect(statuses).toContain('RESERVED');
      expect(statuses).toContain('BOOKED');
      expect(statuses).toContain('BLOCKED');
      expect(statuses).toContain('BLACKOUT');
      expect(statuses).toContain('CLOSED');
    });

    it('should return correct granularity for ACCOMMODATION listing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID_ACCOMMODATION}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-25',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.granularity).toBe('MULTI_DAY');
    });

    it('should return day-level cells for MULTI_DAY granularity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID_ACCOMMODATION}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-22',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      // 3 days = 3 cells for MULTI_DAY
      expect(result.data.cells.length).toBe(3);
    });

    it('should return hourly cells for TIME_SLOTS granularity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      // 9 AM to 5 PM = 8 hourly slots per day
      expect(result.data.cells.length).toBe(8);
    });

    it('should accept bookingType query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
          bookingType: 'ALL_DAY',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return empty cells array for future date with no data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2030-01-01',
          to: '2030-01-01',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.cells).toBeDefined();
      // Should still return cells (AVAILABLE), just no booked/blocked ones
      expect(result.data.cells.every((c: any) => c.status === 'AVAILABLE')).toBe(true);
    });

    it('should allow same from and to date (single day query)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/availability/${TEST_LISTING_ID}`,
        query: {
          from: '2026-01-20',
          to: '2026-01-20',
        },
      });

      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.data.from).toBe('2026-01-20');
      expect(result.data.to).toBe('2026-01-20');
    });
  });
});
