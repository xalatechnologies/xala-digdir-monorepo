/**
 * Notification Repository
 * Data access layer for notification management and deduplication
 */
import { notifications, deliveryAttempts } from '../../database/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '../../core/errors/problem-details';

export class NotificationRepository {
  constructor(private readonly db: any) {}

  private get table() {
    return notifications;
  }

  /**
   * Find notification by ID
   */
  async findById(id: string) {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(notifications.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find notification by ID or throw NotFoundError
   */
  async findByIdOrFail(id: string) {
    const notification = await this.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification', id);
    }
    return notification;
  }

  /**
   * Find notification by content hash
   */
  async findByHash(contentHash: string) {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(notifications.contentHash, contentHash))
      .orderBy(desc(notifications.createdAt))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find duplicate notifications within time window
   * @param contentHash - Content hash to check for duplicates
   * @param windowMinutes - Time window in minutes (default: 5)
   */
  async findDuplicatesInWindow(contentHash: string, windowMinutes: number = 5) {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(notifications.contentHash, contentHash),
          gte(notifications.createdAt, windowStart)
        )
      )
      .orderBy(desc(notifications.createdAt));

    return results;
  }

  /**
   * Find notifications by tenant with filters and pagination
   */
  async findByTenant(
    tenantId: string,
    filters: {
      page: number;
      limit: number;
      status?: string;
      type?: string;
      userId?: string;
    }
  ) {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: any[] = [eq(notifications.tenantId, tenantId)];

    if (filters.status) {
      conditions.push(eq(notifications.status, filters.status));
    }
    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type));
    }
    if (filters.userId) {
      conditions.push(eq(notifications.userId, filters.userId));
    }

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(and(...conditions));
    const total = Number(countResult[0]?.count || 0);

    // Get data with pagination
    const data = await this.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(filters.limit)
      .offset(offset);

    const totalPages = Math.ceil(total / filters.limit);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    };
  }

  /**
   * Create notification
   */
  async create(data: any) {
    const result = await this.db
      .insert(this.table)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Update notification
   */
  async update(id: string, data: any) {
    const result = await this.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  /**
   * Update notification status
   */
  async updateStatus(id: string, status: string, timestamps?: { sentAt?: Date; deliveredAt?: Date; failedAt?: Date }) {
    const updateData: any = { status };

    if (timestamps?.sentAt) {
      updateData.sentAt = timestamps.sentAt;
    }
    if (timestamps?.deliveredAt) {
      updateData.deliveredAt = timestamps.deliveredAt;
    }
    if (timestamps?.failedAt) {
      updateData.failedAt = timestamps.failedAt;
    }

    return this.update(id, updateData);
  }

  /**
   * Delete notification
   */
  async delete(id: string) {
    await this.db.delete(this.table).where(eq(notifications.id, id));
  }

  /**
   * Get delivery attempts for a notification
   */
  async getDeliveryAttempts(notificationId: string) {
    const results = await this.db
      .select()
      .from(deliveryAttempts)
      .where(eq(deliveryAttempts.notificationId, notificationId))
      .orderBy(desc(deliveryAttempts.attemptNumber));

    return results;
  }

  /**
   * Create delivery attempt
   */
  async createDeliveryAttempt(data: any) {
    const result = await this.db
      .insert(deliveryAttempts)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Get failed notifications ready for retry
   */
  async getFailedNotificationsForRetry() {
    const now = new Date();

    const results = await this.db
      .select({
        notification: notifications,
        lastAttempt: deliveryAttempts,
      })
      .from(notifications)
      .leftJoin(
        deliveryAttempts,
        eq(notifications.id, deliveryAttempts.notificationId)
      )
      .where(
        and(
          eq(notifications.status, 'failed'),
          gte(deliveryAttempts.nextRetryAt, now)
        )
      )
      .orderBy(deliveryAttempts.nextRetryAt);

    return results;
  }
}
