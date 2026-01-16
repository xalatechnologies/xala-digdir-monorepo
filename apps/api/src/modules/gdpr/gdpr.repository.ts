/**
 * GDPR Repository
 * Data access layer for GDPR data subject rights requests
 */
import { gdprRequests } from '../../database/schema/gdpr-requests';
import { eq, and, desc } from 'drizzle-orm';
import { NotFoundError } from '../../core/errors/problem-details';

export class GdprRepository {
  constructor(private readonly db: any) {}

  private get table() {
    return gdprRequests;
  }

  /**
   * Find GDPR request by ID
   */
  async findById(id: string) {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(gdprRequests.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find GDPR requests by user ID
   */
  async findByUserId(userId: string, tenantId: string) {
    return await this.db
      .select()
      .from(this.table)
      .where(and(
        eq(gdprRequests.userId, userId),
        eq(gdprRequests.tenantId, tenantId)
      ))
      .orderBy(desc(gdprRequests.requestedAt));
  }

  /**
   * Find pending GDPR requests by tenant with filters
   */
  async findPendingRequests(
    tenantId: string,
    filters: {
      page: number;
      limit: number;
    }
  ) {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: any[] = [
      eq(gdprRequests.tenantId, tenantId),
      eq(gdprRequests.status, 'pending')
    ];

    const data = await this.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .orderBy(desc(gdprRequests.requestedAt))
      .limit(filters.limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: filters.page > 1,
      },
    };
  }

  /**
   * Find GDPR requests by tenant with filters
   */
  async findByTenant(
    tenantId: string,
    filters: {
      page: number;
      limit: number;
      status?: string;
      requestType?: string;
      userId?: string;
    }
  ) {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: any[] = [eq(gdprRequests.tenantId, tenantId)];

    if (filters.status) {
      conditions.push(eq(gdprRequests.status, filters.status));
    }
    if (filters.requestType) {
      conditions.push(eq(gdprRequests.requestType, filters.requestType));
    }
    if (filters.userId) {
      conditions.push(eq(gdprRequests.userId, filters.userId));
    }

    const data = await this.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .orderBy(desc(gdprRequests.requestedAt))
      .limit(filters.limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: filters.page > 1,
      },
    };
  }

  /**
   * Create GDPR request
   */
  async create(data: any) {
    const result = await this.db
      .insert(this.table)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Update GDPR request
   */
  async update(id: string, data: any) {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(eq(gdprRequests.id, id))
      .returning();
    return result[0];
  }

  /**
   * Update GDPR request status
   */
  async updateStatus(id: string, status: string, processedBy?: string) {
    const updateData: any = {
      status,
      processedAt: new Date(),
    };

    if (processedBy) {
      updateData.processedBy = processedBy;
    }

    return this.update(id, updateData);
  }

  /**
   * Delete GDPR request
   */
  async delete(id: string) {
    await this.db.delete(this.table).where(eq(gdprRequests.id, id));
  }
}
