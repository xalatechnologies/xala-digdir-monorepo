/**
 * Calendar/Allocations Controller
 * Manages calendar events, time blocking, and availability
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { allocations, listings, users, bookings } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/calendar')
export class CalendarController {
  @Get()
  async getEvents(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { listingId, startDate, endDate, status } = request.query as any;

    // Build query conditions
    const conditions = [];
    if (listingId) conditions.push(eq(allocations.listingId, listingId));
    if (startDate) conditions.push(gte(allocations.startTime, new Date(startDate)));
    if (endDate) conditions.push(lte(allocations.endTime, new Date(endDate)));
    if (status) conditions.push(eq(allocations.status, status));

    const result = await db
      .select({
        id: allocations.id,
        listingId: allocations.listingId,
        listingName: listings.name,
        title: allocations.title,
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
        bookingId: allocations.bookingId,
        userId: allocations.userId,
        userName: users.name,
        notes: allocations.notes,
        metadata: allocations.metadata,
      })
      .from(allocations)
      .leftJoin(listings, eq(allocations.listingId, listings.id))
      .leftJoin(users, eq(allocations.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(allocations.startTime);

    return {
      data: result,
    };
  }

  @Get('/events')
  async getCalendarEvents(request: TenantRequest, reply: FastifyReply) {
    // Alias for getEvents - same logic
    return this.getEvents(request, reply);
  }

  @Post()
  async createAllocation(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(allocations)
      .values({
        tenantId,
        listingId: body.listingId,
        title: body.title,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status || 'blocked',
        notes: body.notes || null,
        metadata: body.metadata || {},
      })
      .returning();

    reply.code(201);
    return { data: result[0] };
  }

  @Get('/availability')
  async getAvailability(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { listingId, startDate, endDate } = request.query as any;

    if (!listingId || !startDate || !endDate) {
      reply.code(400);
      return { error: 'listingId, startDate, and endDate are required' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all allocations for the listing in the date range
    const allocationResults = await db
      .select({
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.listingId, listingId),
          gte(allocations.startTime, start),
          lte(allocations.endTime, end)
        )
      );

    // Get all bookings for the listing in the date range
    const bookingResults = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.listingId, listingId),
          gte(bookings.startTime, start),
          lte(bookings.endTime, end)
        )
      );

    // Combine blocked times
    const blockedSlots = [...allocationResults, ...bookingResults].map((slot: any) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
    }));

    return {
      listingId,
      startDate,
      endDate,
      blockedSlots,
    };
  }
}
