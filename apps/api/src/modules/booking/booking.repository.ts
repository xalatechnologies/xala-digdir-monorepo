/**
 * Booking Repository
 * Data access layer for booking entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { bookings, listings, type Booking, type NewBooking } from '../../database/schema';
import type { BookingQueryParams } from '../../schemas/booking.schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class BookingRepository extends BaseRepository<
  typeof bookings,
  Booking,
  NewBooking,
  Partial<NewBooking>,
  string
> {
  constructor(db: any) {
    super(db, bookings, bookings.id);
  }

  /**
   * Find bookings with query params
   * Supports org-scoped access via orgId filter (joins to listings.organizationId)
   */
  async findWithFilters(tenantId: string, params: BookingQueryParams): Promise<PaginatedResult<Booking>> {
    const conditions: FilterCondition[] = [
      { field: 'tenantId', operator: 'eq', value: tenantId },
    ];

    if (params.status) {
      conditions.push({ field: 'status', operator: 'eq', value: params.status });
    }

    if (params.listingId) {
      conditions.push({ field: 'listingId', operator: 'eq', value: params.listingId });
    }

    if (params.userId) {
      conditions.push({ field: 'userId', operator: 'eq', value: params.userId });
    }

    if (params.from) {
      conditions.push({ field: 'startTime', operator: 'gte', value: params.from });
    }

    if (params.to) {
      conditions.push({ field: 'endTime', operator: 'lte', value: params.to });
    }

    // Handle org-scoped access by filtering via listings.organizationId
    if (params.orgId) {
      return this.findWithOrgFilter(tenantId, params);
    }

    return this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: 'startTime',
      sortOrder: 'asc',
    });
  }

  /**
   * Find bookings filtered by organization (via listings join)
   * Used for org-scoped RBAC access control
   */
  private async findWithOrgFilter(tenantId: string, params: BookingQueryParams): Promise<PaginatedResult<Booking>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: any[] = [
      eq(bookings.tenantId, tenantId),
      eq(listings.organizationId, params.orgId!),
    ];

    if (params.status) {
      conditions.push(eq(bookings.status, params.status));
    }
    if (params.listingId) {
      conditions.push(eq(bookings.listingId, params.listingId));
    }
    if (params.userId) {
      conditions.push(eq(bookings.userId, params.userId));
    }

    // Import and for combining conditions
    const { and, gte, lte, sql } = await import('drizzle-orm');

    if (params.from) {
      conditions.push(gte(bookings.startTime, params.from));
    }
    if (params.to) {
      conditions.push(lte(bookings.endTime, params.to));
    }

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .innerJoin(listings, eq(bookings.listingId, listings.id))
      .where(and(...conditions));
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    const data = await this.db
      .select({
        id: bookings.id,
        tenantId: bookings.tenantId,
        listingId: bookings.listingId,
        userId: bookings.userId,
        status: bookings.status,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalPrice: bookings.totalPrice,
        currency: bookings.currency,
        notes: bookings.notes,
        metadata: bookings.metadata,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
      })
      .from(bookings)
      .innerJoin(listings, eq(bookings.listingId, listings.id))
      .where(and(...conditions))
      .orderBy(bookings.startTime)
      .limit(limit)
      .offset(offset);

    return {
      data: data as Booking[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find bookings for a listing within a date range
   */
  async findByListingAndDateRange(
    listingId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Booking[]> {
    const result = await this.findMany([
      { field: 'listingId', operator: 'eq', value: listingId },
      { field: 'startTime', operator: 'lt', value: endDate },
      { field: 'endTime', operator: 'gt', value: startDate },
      { field: 'status', operator: 'ne', value: 'cancelled' },
    ], { limit: 100 });

    return result.data;
  }

  /**
   * Find bookings by user with listing details and pagination
   */
  async findByUser(
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<Booking & { listingName?: string }>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await this.db
      .select({ count: bookings.id })
      .from(bookings)
      .where(eq(bookings.userId, userId));
    const total = countResult.length;

    // Get paginated data with listing JOIN
    const data = await this.db
      .select({
        id: bookings.id,
        tenantId: bookings.tenantId,
        listingId: bookings.listingId,
        userId: bookings.userId,
        status: bookings.status,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalPrice: bookings.totalPrice,
        currency: bookings.currency,
        notes: bookings.notes,
        metadata: bookings.metadata,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        listingName: listings.name,
      })
      .from(bookings)
      .leftJoin(listings, eq(bookings.listingId, listings.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.startTime))
      .limit(limit)
      .offset(offset);

    return {
      data: data as (Booking & { listingName?: string })[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  protected getEntityName(): string {
    return 'Booking';
  }
}
