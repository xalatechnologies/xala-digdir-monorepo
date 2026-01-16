/**
 * Availability Controller
 * Time slot availability at /api/availability
 *
 * Returns availability slots with detailed status information:
 * - AVAILABLE: Slot is available for booking
 * - BOOKED: Slot has a confirmed booking
 * - RESERVED: Slot is temporarily reserved (pending booking)
 * - BLOCKED: Slot is blocked by admin/maintenance
 * - BLACKOUT: Slot falls on holiday/blackout period
 * - CLOSED: Listing is closed during this time
 * Includes matrix projection endpoint for calendar integration
 */
import { Controller, Get, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import { validate } from '../../core/validation/zod-pipe';
import { BadRequestError } from '../../core/errors/problem-details';
import {
  AvailabilityMatrixQuerySchema,
  type ListingAvailabilityMatrixProjection, // Deprecated alias, use RentalObjectAvailabilityMatrixProjection
} from '../../schemas/calendar.schema';
import { CalendarService } from '../calendar/calendar.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { allocations, bookings, listings } from '../../database/schema/index';

/**
 * Slot status types matching SDK OccurrenceStatus
 */
type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'BLOCKED' | 'BLACKOUT' | 'CLOSED';

/**
 * Extended slot information with status details
 */
interface SlotInfo {
  /** Start time of the slot in ISO 8601 format */
  startTime: string;
  /** End time of the slot in ISO 8601 format */
  endTime: string;
  /** Whether the slot is available (backwards compatible) */
  available: boolean;
  /** Detailed status of the slot */
  status: SlotStatus;
  /** Localization key for the reason (e.g., "availability.status.booked") */
  reasonKey?: string;
  /** Time until which this slot is locked (for reserved slots with TTL) */
  lockedUntil?: string;
  /** ID of the conflicting booking/allocation if applicable */
  conflictId?: string;
}

/**
 * Allocation record with status information
 */
interface AllocationRecord {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  metadata?: Record<string, unknown>;
}

/**
 * Booking record with status information
 */
interface BookingRecord {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  metadata?: Record<string, unknown>;
}

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

/**
 * Maps allocation status to slot status
 */
function mapAllocationStatus(status: string): SlotStatus {
  switch (status.toLowerCase()) {
    case 'blocked':
    case 'maintenance':
      return 'BLOCKED';
    case 'blackout':
    case 'holiday':
      return 'BLACKOUT';
    case 'closed':
      return 'CLOSED';
    default:
      return 'BLOCKED';
  }
}

/**
 * Maps booking status to slot status
 */
function mapBookingStatus(status: string): SlotStatus {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'BOOKED';
    case 'pending':
    case 'reserved':
      return 'RESERVED';
    default:
      return 'BOOKED';
  }
}

/**
 * Gets the localization key for a slot status
 */
function getReasonKey(status: SlotStatus): string {
  switch (status) {
    case 'BOOKED':
      return 'availability.status.booked';
    case 'RESERVED':
      return 'availability.status.reserved';
    case 'BLOCKED':
      return 'availability.status.blocked';
    case 'BLACKOUT':
      return 'availability.status.blackout';
    case 'CLOSED':
      return 'availability.status.closed';
    default:
      return 'availability.status.available';
  }
}

@Controller('/api/availability')
export class AvailabilityController {
  constructor(
    @Inject('CalendarService') private readonly calendarService: CalendarService
  ) {}

  /**
   * GET /api/availability/:listingId - Get availability matrix
   * Returns ListingAvailabilityMatrixProjectionDTO with cell-by-cell availability
   *
   * Query params:
   * - from: string (YYYY-MM-DD format, required) - Start date for availability range
   * - to: string (YYYY-MM-DD format, required) - End date for availability range
   * - bookingType: string (optional) - Filter by booking type
   *
   * Response: { data: ListingAvailabilityMatrixProjection }
   */
  @Get('/:listingId')
  async getAvailabilityMatrix(
    request: FastifyRequest<{ Params: { rentalObjectId: string } }>,
    reply: FastifyReply
  ): Promise<{ data: ListingAvailabilityMatrixProjection }> {
    const params = validate(AvailabilityMatrixQuerySchema, request.query);
    const matrix = await this.calendarService.getAvailabilityMatrix(
      request.params.rentalObjectId,
      params
    );
    return { data: matrix };
  }

  /**
   * GET /api/availability/slots - Get available time slots (legacy endpoint)
   * Returns simple slot availability for a single date
   */
  @Get('/slots')
  async getSlots(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { rentalObjectId, date, duration = 60 } = request.query as any;

    if (!listingId || !date) {
      reply.code(400);
      return { error: 'listingId and date are required' };
    }

    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    // Get listing info
    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId));

    if (!listing.length) {
      reply.code(404);
      return { error: 'Listing not found' };
    }

    // Extract buffer time from listing metadata (default to 0 if not set)
    const bufferTimeMinutes = listing[0].metadata?.bufferTimeMinutes || 0;
    const bufferTimeMs = bufferTimeMinutes * 60 * 1000;

    // Get all blocked times for this date
    const blocked = await db
      .select({
        id: allocations.id,
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
        metadata: allocations.metadata,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.rentalObjectId, listingId),
          gte(allocations.endTime, dateStart),
          lte(allocations.startTime, dateEnd)
        )
      );

    // Get all booked/reserved times for this date (from bookings)
    const bookingRecords: BookingRecord[] = await db
      .select({
        id: bookings.id,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        metadata: bookings.metadata,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, listingId),
          gte(bookings.endTime, dateStart),
          lte(bookings.startTime, dateEnd),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending'))
        )
      );

    // Generate slots with detailed status (assuming 8:00-22:00 operating hours)
    const operatingStart = 8;
    const operatingEnd = 22;
    const slotDuration = Number(duration);
    const slots: SlotInfo[] = [];

    for (let hour = operatingStart; hour < operatingEnd; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

      if (slotEnd.getHours() > operatingEnd) continue;

      const sStart = slotStart.getTime();
      const sEnd = slotEnd.getTime();

      // Check if slot overlaps with any blocked time (allocations - no buffer)
      let blockingAllocation: AllocationRecord | undefined;
      const isBlockedByAllocation = blocked.some((b: AllocationRecord) => {
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        if (sStart < bEnd && sEnd > bStart) {
          blockingAllocation = b;
          return true;
        }
        return false;
      });

      // Check if slot overlaps with any booked time (including buffer time)
      let blockingBooking: BookingRecord | undefined;
      const isBlockedByBooking = bookingRecords.some((b: BookingRecord) => {
        const bStart = new Date(b.startTime).getTime() - bufferTimeMs; // Add buffer before
        const bEnd = new Date(b.endTime).getTime() + bufferTimeMs; // Add buffer after
        if (sStart < bEnd && sEnd > bStart) {
          blockingBooking = b;
          return true;
        }
        return false;
      });

      // Determine status and conflict details
      let status: SlotStatus = 'AVAILABLE';
      let conflictId: string | undefined;
      let lockedUntil: string | undefined;

      if (isBlockedByAllocation && blockingAllocation) {
        status = mapAllocationStatus(blockingAllocation.status);
        conflictId = blockingAllocation.id;
      } else if (isBlockedByBooking && blockingBooking) {
        status = mapBookingStatus(blockingBooking.status);
        conflictId = blockingBooking.id;
        // For reserved/pending bookings, include TTL if available
        if (status === 'RESERVED' && blockingBooking.metadata?.lockedUntil) {
          lockedUntil = String(blockingBooking.metadata.lockedUntil);
        }
      }

      const slotInfo: SlotInfo = {
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: status === 'AVAILABLE',
        status,
      };

      // Only add optional fields if they have values
      if (status !== 'AVAILABLE') {
        slotInfo.reasonKey = getReasonKey(status);
      }
      if (conflictId) {
        slotInfo.conflictId = conflictId;
      }
      if (lockedUntil) {
        slotInfo.lockedUntil = lockedUntil;
      }

      slots.push(slotInfo);
    }

    return {
      rentalObjectId,
      date,
      duration: slotDuration,
      slots: slots.filter((s) => s.available),
      allSlots: slots,
    };
  }
}
