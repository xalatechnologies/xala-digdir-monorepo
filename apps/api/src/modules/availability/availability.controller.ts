/**
 * Availability Controller
 * Time slot availability at /api/availability
 * Includes matrix projection endpoint for calendar integration
 */
import { Controller, Get, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import { validate } from '../../core/validation/zod-pipe';
import { BadRequestError } from '../../core/errors/problem-details';
import {
  AvailabilityMatrixQuerySchema,
  type ListingAvailabilityMatrixProjection,
} from '../../schemas/calendar.schema';
import { CalendarService } from '../calendar/calendar.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { allocations, bookings, listings } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
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
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply
  ): Promise<{ data: ListingAvailabilityMatrixProjection }> {
    const params = validate(AvailabilityMatrixQuerySchema, request.query);
    const matrix = await this.calendarService.getAvailabilityMatrix(
      request.params.listingId,
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
    const { listingId, date, duration = 60 } = request.query as any;

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

    // Get all blocked times for this date
    const blocked = await db
      .select({
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        type: allocations.status,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.listingId, listingId),
          gte(allocations.endTime, dateStart),
          lte(allocations.startTime, dateEnd)
        )
      );

    const bookedSlots = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.listingId, listingId),
          gte(bookings.endTime, dateStart),
          lte(bookings.startTime, dateEnd),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending'))
        )
      );

    // Generate available slots (assuming 8:00-22:00 operating hours)
    const operatingStart = 8;
    const operatingEnd = 22;
    const slotDuration = Number(duration);
    const slots: Array<{ startTime: string; endTime: string; available: boolean }> = [];

    for (let hour = operatingStart; hour < operatingEnd; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

      if (slotEnd.getHours() > operatingEnd) continue;

      // Check if slot overlaps with any blocked or booked time
      const isBlocked = [...blocked, ...bookedSlots].some((b: any) => {
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        const sStart = slotStart.getTime();
        const sEnd = slotEnd.getTime();
        return sStart < bEnd && sEnd > bStart;
      });

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !isBlocked,
      });
    }

    return {
      listingId,
      date,
      duration: slotDuration,
      slots: slots.filter((s) => s.available),
      allSlots: slots,
    };
  }
}
