/**
 * Calendar Repository
 * 
 * Data access layer for calendar allocations and events.
 * Encapsulates all database operations for calendar functionality.
 * Controllers should use this instead of direct schema imports.
 */

import { container } from '../../core/container';
import { eq, and, gte, lte, type SQL } from 'drizzle-orm';
import { allocations, rentalObjects, users, bookings } from '../../database/schema/index';

// =============================================================================
// Types
// =============================================================================

export interface AllocationRecord {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  listingName?: string | null;
  title: string;
  startTime: Date;
  endTime: Date;
  status: string;
  bookingId: string | null;
  userId: string | null;
  userName?: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface CreateAllocationInput {
  tenantId: string;
  rentalObjectId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  bookingId?: string;
  userId?: string;
}

export interface CalendarQueryParams {
  rentalObjectId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

// =============================================================================
// Repository Class
// =============================================================================

export class CalendarRepository {
  private getDb() {
    return container.resolve<any>('Database');
  }

  /**
   * Find calendar events/allocations with optional filtering
   */
  async findEvents(params: CalendarQueryParams = {}): Promise<AllocationRecord[]> {
    const db = this.getDb();
    const { rentalObjectId, startDate, endDate, status } = params;

    const conditions: SQL[] = [];
    if (rentalObjectId) conditions.push(eq(allocations.rentalObjectId, rentalObjectId));
    if (startDate) conditions.push(gte(allocations.startTime, startDate));
    if (endDate) conditions.push(lte(allocations.endTime, endDate));
    if (status) conditions.push(eq(allocations.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        id: allocations.id,
        tenantId: allocations.tenantId,
        rentalObjectId: allocations.rentalObjectId,
        listingName: rentalObjects.name,
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
      .leftJoin(rentalObjects, eq(allocations.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(allocations.userId, users.id))
      .where(whereClause)
      .orderBy(allocations.startTime);

    return result;
  }

  /**
   * Find allocation by ID
   */
  async findById(id: string): Promise<AllocationRecord | null> {
    const db = this.getDb();

    const result = await db
      .select({
        id: allocations.id,
        tenantId: allocations.tenantId,
        rentalObjectId: allocations.rentalObjectId,
        listingName: rentalObjects.name,
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
      .leftJoin(rentalObjects, eq(allocations.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(allocations.userId, users.id))
      .where(eq(allocations.id, id));

    return result[0] || null;
  }

  /**
   * Create a new allocation
   */
  async create(input: CreateAllocationInput): Promise<AllocationRecord> {
    const db = this.getDb();

    const result = await db
      .insert(allocations)
      .values({
        tenantId: input.tenantId,
        rentalObjectId: input.rentalObjectId,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        status: input.status || 'blocked',
        notes: input.notes || null,
        metadata: input.metadata || {},
        bookingId: input.bookingId || null,
        userId: input.userId || null,
      })
      .returning();

    return {
      ...result[0],
      listingName: null,
      userName: null,
    };
  }

  /**
   * Update an allocation
   */
  async update(id: string, input: Partial<CreateAllocationInput>): Promise<AllocationRecord | null> {
    const db = this.getDb();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.startTime !== undefined) updateData.startTime = input.startTime;
    if (input.endTime !== undefined) updateData.endTime = input.endTime;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    const result = await db
      .update(allocations)
      .set(updateData)
      .where(eq(allocations.id, id))
      .returning();

    if (!result.length) return null;

    return {
      ...result[0],
      listingName: null,
      userName: null,
    };
  }

  /**
   * Delete an allocation
   */
  async delete(id: string): Promise<boolean> {
    const db = this.getDb();

    const result = await db
      .delete(allocations)
      .where(eq(allocations.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get availability for a rental object in a date range
   * Returns all blocked time slots (from both allocations and bookings)
   */
  async getAvailability(
    rentalObjectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlot[]> {
    const db = this.getDb();

    // Get all allocations for the rental object in the date range
    const allocationResults = await db
      .select({
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.rentalObjectId, rentalObjectId),
          gte(allocations.startTime, startDate),
          lte(allocations.endTime, endDate)
        )
      );

    // Get all bookings for the rental object in the date range
    const bookingResults = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.rentalObjectId, rentalObjectId),
          gte(bookings.startTime, startDate),
          lte(bookings.endTime, endDate)
        )
      );

    // Combine blocked times
    return [...allocationResults, ...bookingResults].map((slot: any) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
    }));
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let repositoryInstance: CalendarRepository | null = null;

export function getCalendarRepository(): CalendarRepository {
  if (!repositoryInstance) {
    repositoryInstance = new CalendarRepository();
  }
  return repositoryInstance;
}
