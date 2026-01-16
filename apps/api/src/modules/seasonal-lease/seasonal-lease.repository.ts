/**
 * Seasonal Lease Repository
 * 
 * Data access layer for seasonal leases.
 * Encapsulates all database operations for seasonal lease management.
 * Controllers should use this instead of direct schema imports.
 */

import { container } from '../../core/container';
import { eq, and, count, sql, type SQL } from 'drizzle-orm';
import { seasonalLeases, rentalObjects, organizations } from '../../database/schema/index';

// =============================================================================
// Types
// =============================================================================

export interface SeasonalLeaseRecord {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  listingName?: string | null;
  organizationId: string | null;
  organizationName?: string | null;
  startDate: Date;
  endDate: Date;
  weekdays: number[] | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
  totalPrice: number;
  currency: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationLeaseHistory {
  organizationId: string;
  organizationName: string | null;
  leaseCount: number;
}

export interface CreateSeasonalLeaseInput {
  tenantId: string;
  rentalObjectId: string;
  organizationId?: string;
  startDate: Date;
  endDate: Date;
  weekdays?: number[];
  startTime?: string;
  endTime?: string;
  totalPrice?: number;
  notes?: string;
}

export interface SeasonalLeaseQueryParams {
  rentalObjectId?: string;
  organizationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// Repository Class
// =============================================================================

export class SeasonalLeaseRepository {
  private getDb() {
    return container.resolve<any>('Database');
  }

  /**
   * Find all seasonal leases with optional filtering and pagination
   */
  async findAll(params: SeasonalLeaseQueryParams = {}): Promise<PaginatedResult<SeasonalLeaseRecord>> {
    const db = this.getDb();
    const { rentalObjectId, organizationId, status, page = 1, limit = 20 } = params;

    const conditions: SQL[] = [];
    if (rentalObjectId) conditions.push(eq(seasonalLeases.rentalObjectId, rentalObjectId));
    if (organizationId) conditions.push(eq(seasonalLeases.organizationId, organizationId));
    if (status) conditions.push(eq(seasonalLeases.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        id: seasonalLeases.id,
        tenantId: seasonalLeases.tenantId,
        rentalObjectId: seasonalLeases.rentalObjectId,
        listingName: rentalObjects.name,
        organizationId: seasonalLeases.organizationId,
        organizationName: organizations.name,
        startDate: seasonalLeases.startDate,
        endDate: seasonalLeases.endDate,
        weekdays: seasonalLeases.weekdays,
        startTime: seasonalLeases.startTime,
        endTime: seasonalLeases.endTime,
        status: seasonalLeases.status,
        totalPrice: seasonalLeases.totalPrice,
        currency: seasonalLeases.currency,
        notes: seasonalLeases.notes,
        createdAt: seasonalLeases.createdAt,
        updatedAt: seasonalLeases.updatedAt,
      })
      .from(seasonalLeases)
      .leftJoin(rentalObjects, eq(seasonalLeases.rentalObjectId, rentalObjects.id))
      .leftJoin(organizations, eq(seasonalLeases.organizationId, organizations.id))
      .where(whereClause)
      .orderBy(seasonalLeases.startDate)
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    const countResult = await db
      .select({ count: count() })
      .from(seasonalLeases)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    return {
      data: result.map((row: any) => ({
        ...row,
        totalPrice: Number(row.totalPrice || 0),
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Find seasonal lease by ID
   */
  async findById(id: string): Promise<SeasonalLeaseRecord | null> {
    const db = this.getDb();

    const result = await db
      .select({
        id: seasonalLeases.id,
        tenantId: seasonalLeases.tenantId,
        rentalObjectId: seasonalLeases.rentalObjectId,
        listingName: rentalObjects.name,
        organizationId: seasonalLeases.organizationId,
        organizationName: organizations.name,
        startDate: seasonalLeases.startDate,
        endDate: seasonalLeases.endDate,
        weekdays: seasonalLeases.weekdays,
        startTime: seasonalLeases.startTime,
        endTime: seasonalLeases.endTime,
        status: seasonalLeases.status,
        totalPrice: seasonalLeases.totalPrice,
        currency: seasonalLeases.currency,
        notes: seasonalLeases.notes,
        createdAt: seasonalLeases.createdAt,
        updatedAt: seasonalLeases.updatedAt,
      })
      .from(seasonalLeases)
      .leftJoin(rentalObjects, eq(seasonalLeases.rentalObjectId, rentalObjects.id))
      .leftJoin(organizations, eq(seasonalLeases.organizationId, organizations.id))
      .where(eq(seasonalLeases.id, id));

    if (!result.length) return null;

    return {
      ...result[0],
      totalPrice: Number(result[0].totalPrice || 0),
    };
  }

  /**
   * Create a new seasonal lease
   */
  async create(input: CreateSeasonalLeaseInput): Promise<SeasonalLeaseRecord> {
    const db = this.getDb();

    const result = await db
      .insert(seasonalLeases)
      .values({
        tenantId: input.tenantId,
        rentalObjectId: input.rentalObjectId,
        organizationId: input.organizationId || null,
        startDate: input.startDate,
        endDate: input.endDate,
        weekdays: input.weekdays || [],
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        totalPrice: input.totalPrice || 0,
        notes: input.notes || null,
      })
      .returning();

    return {
      ...result[0],
      listingName: null,
      organizationName: null,
      totalPrice: Number(result[0].totalPrice || 0),
    };
  }

  /**
   * Update a seasonal lease
   */
  async update(id: string, input: Partial<CreateSeasonalLeaseInput>): Promise<SeasonalLeaseRecord | null> {
    const db = this.getDb();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.rentalObjectId !== undefined) updateData.rentalObjectId = input.rentalObjectId;
    if (input.organizationId !== undefined) updateData.organizationId = input.organizationId;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.weekdays !== undefined) updateData.weekdays = input.weekdays;
    if (input.startTime !== undefined) updateData.startTime = input.startTime;
    if (input.endTime !== undefined) updateData.endTime = input.endTime;
    if (input.totalPrice !== undefined) updateData.totalPrice = input.totalPrice;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const result = await db
      .update(seasonalLeases)
      .set(updateData)
      .where(eq(seasonalLeases.id, id))
      .returning();

    if (!result.length) return null;

    return {
      ...result[0],
      listingName: null,
      organizationName: null,
      totalPrice: Number(result[0].totalPrice || 0),
    };
  }

  /**
   * Delete a seasonal lease
   */
  async delete(id: string): Promise<boolean> {
    const db = this.getDb();

    const result = await db
      .delete(seasonalLeases)
      .where(eq(seasonalLeases.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get organization lease history for suggestions
   * KRAV-ADM-05: Regelstyrt forslag til sesongfordeling
   */
  async getOrganizationLeaseHistory(rentalObjectId?: string, limit: number = 5): Promise<OrganizationLeaseHistory[]> {
    const db = this.getDb();

    const query = db
      .select({
        organizationId: seasonalLeases.organizationId,
        organizationName: organizations.name,
        leaseCount: count(),
      })
      .from(seasonalLeases)
      .leftJoin(organizations, eq(seasonalLeases.organizationId, organizations.id));

    if (rentalObjectId) {
      query.where(eq(seasonalLeases.rentalObjectId, rentalObjectId));
    }

    const result = await query
      .groupBy(seasonalLeases.organizationId, organizations.name)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(limit);

    return result.map((row: any) => ({
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      leaseCount: Number(row.leaseCount),
    }));
  }

  /**
   * Get recent leases for a rental object
   */
  async getRecentLeases(rentalObjectId?: string, limit: number = 10): Promise<SeasonalLeaseRecord[]> {
    const db = this.getDb();

    const query = db
      .select()
      .from(seasonalLeases);

    if (rentalObjectId) {
      query.where(eq(seasonalLeases.rentalObjectId, rentalObjectId));
    }

    const result = await query.limit(limit);

    return result.map((row: any) => ({
      ...row,
      listingName: null,
      organizationName: null,
      totalPrice: Number(row.totalPrice || 0),
    }));
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let repositoryInstance: SeasonalLeaseRepository | null = null;

export function getSeasonalLeaseRepository(): SeasonalLeaseRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SeasonalLeaseRepository();
  }
  return repositoryInstance;
}
