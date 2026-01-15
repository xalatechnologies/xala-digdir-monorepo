/**
 * Share Repository
 * Data access layer for share link entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { shareLinks, type ShareLink, type NewShareLink } from '../../database/schema';
import type { ShareQueryParams } from '../../schemas/share.schema';
import { eq, sql, and, or, isNull, gt } from 'drizzle-orm';

@Injectable()
export class ShareRepository extends BaseRepository<
  typeof shareLinks,
  ShareLink,
  NewShareLink,
  Partial<NewShareLink>,
  string
> {
  constructor(db: any) {
    super(db, shareLinks, shareLinks.id);
  }

  /**
   * Find share link by token
   */
  async findByToken(token: string): Promise<ShareLink | null> {
    const results = await this.db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.token, token))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find valid (non-expired, non-revoked, active) share link by token
   * This handles expiration logic - only returns active, non-expired links
   */
  async findValidByToken(token: string): Promise<ShareLink | null> {
    const now = new Date();

    const results = await this.db
      .select()
      .from(shareLinks)
      .where(
        and(
          eq(shareLinks.token, token),
          eq(shareLinks.status, 'active'),
          isNull(shareLinks.revokedAt),
          or(
            isNull(shareLinks.expiresAt),
            gt(shareLinks.expiresAt, now)
          )
        )
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Increment view count atomically
   */
  async incrementViewCount(token: string): Promise<ShareLink | null> {
    const results = await this.db
      .update(shareLinks)
      .set({
        viewCount: sql`${shareLinks.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(shareLinks.token, token))
      .returning();

    return results[0] || null;
  }

  /**
   * Find and increment view count for a valid share link
   * Combines validation and increment in one transaction-safe operation
   */
  async findValidAndIncrementViewCount(token: string): Promise<ShareLink | null> {
    const now = new Date();

    const results = await this.db
      .update(shareLinks)
      .set({
        viewCount: sql`${shareLinks.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(shareLinks.token, token),
          eq(shareLinks.status, 'active'),
          isNull(shareLinks.revokedAt),
          or(
            isNull(shareLinks.expiresAt),
            gt(shareLinks.expiresAt, now)
          )
        )
      )
      .returning();

    return results[0] || null;
  }

  /**
   * Check if a share link is expired
   */
  isExpired(shareLink: ShareLink): boolean {
    if (!shareLink.expiresAt) {
      return false;
    }
    return new Date(shareLink.expiresAt) < new Date();
  }

  /**
   * Check if a share link is valid (active, not expired, not revoked)
   */
  isValid(shareLink: ShareLink): boolean {
    if (shareLink.status !== 'active') {
      return false;
    }
    if (shareLink.revokedAt) {
      return false;
    }
    return !this.isExpired(shareLink);
  }

  /**
   * Mark share link as expired
   */
  async markExpired(id: string): Promise<ShareLink | null> {
    const results = await this.db
      .update(shareLinks)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(eq(shareLinks.id, id))
      .returning();

    return results[0] || null;
  }

  /**
   * Revoke share link
   */
  async revoke(id: string): Promise<ShareLink | null> {
    const results = await this.db
      .update(shareLinks)
      .set({
        status: 'revoked',
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shareLinks.id, id))
      .returning();

    return results[0] || null;
  }

  /**
   * Find share links with query params
   */
  async findWithFilters(tenantId: string, params: ShareQueryParams): Promise<PaginatedResult<ShareLink>> {
    const conditions: FilterCondition[] = [
      { field: 'tenantId', operator: 'eq', value: tenantId },
    ];

    if (params.type) {
      conditions.push({ field: 'type', operator: 'eq', value: params.type });
    }

    if (params.resourceId) {
      conditions.push({ field: 'resourceId', operator: 'eq', value: params.resourceId });
    }

    if (params.status) {
      conditions.push({ field: 'status', operator: 'eq', value: params.status });
    }

    return this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Find share links by resource
   */
  async findByResource(
    tenantId: string,
    type: string,
    resourceId: string
  ): Promise<ShareLink[]> {
    const result = await this.findMany([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'type', operator: 'eq', value: type },
      { field: 'resourceId', operator: 'eq', value: resourceId },
    ], { limit: 100 });

    return result.data;
  }

  /**
   * Find active share links by resource (excludes expired and revoked)
   */
  async findActiveByResource(
    tenantId: string,
    type: string,
    resourceId: string
  ): Promise<ShareLink[]> {
    const result = await this.findMany([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'type', operator: 'eq', value: type },
      { field: 'resourceId', operator: 'eq', value: resourceId },
      { field: 'status', operator: 'eq', value: 'active' },
    ], { limit: 100 });

    // Filter out expired links (expiration date check)
    const now = new Date();
    return result.data.filter(
      (link) => !link.expiresAt || new Date(link.expiresAt) > now
    );
  }

  /**
   * Find share links created by a user
   */
  async findByCreator(
    tenantId: string,
    createdById: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<ShareLink>> {
    return this.findMany([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'createdById', operator: 'eq', value: createdById },
    ], {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Batch expire all links past their expiration date
   * Useful for scheduled cleanup jobs
   */
  async expireStaleLinks(): Promise<number> {
    const now = new Date();

    const results = await this.db
      .update(shareLinks)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(shareLinks.status, 'active'),
          sql`${shareLinks.expiresAt} IS NOT NULL`,
          sql`${shareLinks.expiresAt} < ${now.toISOString()}`
        )
      )
      .returning();

    return results.length;
  }

  /**
   * Count active share links for a resource
   */
  async countActiveByResource(
    tenantId: string,
    type: string,
    resourceId: string
  ): Promise<number> {
    return this.count([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'type', operator: 'eq', value: type },
      { field: 'resourceId', operator: 'eq', value: resourceId },
      { field: 'status', operator: 'eq', value: 'active' },
    ]);
  }

  protected getEntityName(): string {
    return 'ShareLink';
  }
}
