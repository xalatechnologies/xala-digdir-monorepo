/**
 * Booking Repository
 * Data access layer for booking entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { bookings, listings, type Booking, type NewBooking } from '../../database/schema';
import type { BookingQueryParams } from '../../schemas/booking.schema';
import { eq, desc, and } from 'drizzle-orm';
import { ConflictError, NotFoundError } from '../../core/errors/problem-details';

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

    return this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: 'startTime',
      sortOrder: 'asc',
    });
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

  /**
   * Update booking with optimistic locking
   * Prevents concurrent modification conflicts
   */
  async updateWithVersion(
    id: string,
    expectedVersion: number,
    data: Partial<NewBooking>
  ): Promise<Booking> {
    // Fetch current booking to check version
    const current = await this.findById(id);

    if (!current) {
      throw new NotFoundError(this.getEntityName(), id);
    }

    // Check version match (optimistic locking)
    if (current.version !== expectedVersion) {
      throw new ConflictError(
        `Booking has been modified by another user. Expected version ${expectedVersion}, but current version is ${current.version}. Please refresh and try again.`
      );
    }

    // Update with incremented version
    const result = await this.db
      .update(bookings)
      .set({
        ...data as any,
        version: expectedVersion + 1,
        updatedAt: new Date(),
      })
      .where(and(
        eq(bookings.id, id),
        eq(bookings.version, expectedVersion)
      ))
      .returning();

    // Double-check that update succeeded (race condition protection)
    if (!result[0]) {
      throw new ConflictError(
        'Booking was modified by another user while processing your request. Please refresh and try again.'
      );
    }

    return result[0];
  }

  /**
   * Override update to automatically handle version increment
   */
  async update(id: string, data: Partial<NewBooking>): Promise<Booking> {
    // Fetch current booking to get version
    const current = await this.findById(id);

    if (!current) {
      throw new NotFoundError(this.getEntityName(), id);
    }

    // Use optimistic locking with current version
    return this.updateWithVersion(id, current.version, data);
  }

  protected getEntityName(): string {
    return 'Booking';
  }
}
