/**
 * Dashboard Controller
 * Provides KPIs and statistics for backoffice
 */
import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, sql, and, gte, lte, count, sum, desc } from 'drizzle-orm';
import { rentalObjects, bookings, auditLogs, users } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/dashboard')
export class DashboardController {
  @Get()
  @Get('/kpis')
  async getKPIs(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build tenant filter condition for bookings
    const bookingTenantFilter = tenantId ? eq(bookings.tenantId, tenantId) : undefined;
    const rentalObjectTenantFilter = tenantId ? eq(rentalObjects.tenantId, tenantId) : undefined;

    // Count active rentalObjects using Drizzle - filtered by tenant
    const activeListingsResult = await db
      .select({ count: count() })
      .from(rentalObjects)
      .where(tenantId 
        ? and(eq(rentalObjects.status, 'published'), rentalObjectTenantFilter)
        : eq(rentalObjects.status, 'published')
      );
    const activeListings = Number(activeListingsResult[0]?.count || 0);

    // Count pending requests - filtered by tenant
    const pendingResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(tenantId 
        ? and(eq(bookings.status, 'pending'), bookingTenantFilter)
        : eq(bookings.status, 'pending')
      );
    const pendingRequests = Number(pendingResult[0]?.count || 0);

    // Today's confirmed bookings - filtered by tenant
    const todayResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        tenantId
          ? and(
              gte(bookings.startTime, startOfDay),
              lte(bookings.startTime, endOfDay),
              bookingTenantFilter
            )
          : and(
              gte(bookings.startTime, startOfDay),
              lte(bookings.startTime, endOfDay)
            )
      );
    const todayBookings = Number(todayResult[0]?.count || 0);

    // This week's bookings - filtered by tenant
    const weekResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        tenantId
          ? and(
              gte(bookings.startTime, startOfWeek),
              lte(bookings.startTime, endOfDay),
              bookingTenantFilter
            )
          : and(
              gte(bookings.startTime, startOfWeek),
              lte(bookings.startTime, endOfDay)
            )
      );
    const weekBookings = Number(weekResult[0]?.count || 0);

    // Month revenue - filtered by tenant
    const monthRevenueResult = await db
      .select({ revenue: sql<number>`COALESCE(SUM(total_price), 0)` })
      .from(bookings)
      .where(tenantId 
        ? and(gte(bookings.createdAt, startOfMonth), bookingTenantFilter)
        : gte(bookings.createdAt, startOfMonth)
      );
    const monthRevenue = Number(monthRevenueResult[0]?.revenue || 0);

    // Cancelled bookings count - filtered by tenant
    const cancelledResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(tenantId 
        ? and(eq(bookings.status, 'cancelled'), bookingTenantFilter)
        : eq(bookings.status, 'cancelled')
      );
    const cancelledBookings = Number(cancelledResult[0]?.count || 0);

    // Top rentalObjects by bookings - filtered by tenant
    const topListingsResult = await db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        bookingCount: sql<number>`COALESCE(COUNT(${bookings.id}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
      })
      .from(rentalObjects)
      .leftJoin(bookings, eq(rentalObjects.id, bookings.rentalObjectId))
      .where(rentalObjectTenantFilter)
      .groupBy(rentalObjects.id, rentalObjects.name)
      .orderBy(sql`COUNT(${bookings.id}) DESC`)
      .limit(5);

    return {
      activeListings,
      pendingRequests,
      todayBookings,
      weekBookings,
      monthRevenue,
      previousMonthRevenue: 0,
      revenueGrowth: 0,
      cancelledBookings,
      topListings: topListingsResult.map((row: any) => ({
        id: row.id,
        name: row.name,
        bookings: Number(row.bookingCount),
        revenue: Number(row.revenue),
      })),
    };
  }

  @Get('/stats')
  async getBookingStats(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;

    // Get bookings grouped by status - filtered by tenant if available
    let query = db
      .select({
        status: bookings.status,
        count: count(),
        revenue: sql<number>`COALESCE(SUM(total_price), 0)`,
      })
      .from(bookings);
    
    if (tenantId) {
      query = query.where(eq(bookings.tenantId, tenantId));
    }
    
    const result = await query.groupBy(bookings.status);

    const stats: Record<string, { count: number; revenue: number }> = {};
    for (const row of result) {
      stats[row.status] = {
        count: Number(row.count),
        revenue: Number(row.revenue),
      };
    }

    return {
      total: Object.values(stats).reduce((sum, s) => sum + s.count, 0),
      byStatus: stats,
    };
  }

  /**
   * GET /api/dashboard/activity - Get recent activity from audit logs
   */
  @Get('/pending')
  async getPendingBookings(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const limitNum = Number((request.query as any)?.limit) || 5;

    try {
      // Simple query - just get pending bookings
      const result = await db
        .select({
          id: bookings.id,
          status: bookings.status,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          rentalObjectId: bookings.rentalObjectId,
        })
        .from(bookings)
        .where(eq(bookings.status, 'pending'))
        .orderBy(desc(bookings.createdAt))
        .limit(limitNum);

      return { data: result ?? [], bookings: result?.length ?? 0 };
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      return { data: [], bookings: 0, error: String(error) };
    }
  }

  @Get('/activity')
  async getRecentActivity(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const limit = Number((request.query as any)?.limit) || 10;

    // Get recent audit logs with user info
    const result = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        userId: auditLogs.userId,
        metadata: auditLogs.metadata,
        timestamp: auditLogs.timestamp,
        userName: users.displayName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);

    // Transform to RecentActivity format
    const activities = result.map((row: any) => {
      const type = this.mapResourceToType(row.resource);
      const description = this.generateDescription(row.action, row.resource, row.metadata);
      
      return {
        id: row.id,
        type,
        action: row.action,
        description,
        userId: row.userId,
        userName: row.userName || 'System',
        resourceId: row.resourceId,
        timestamp: row.timestamp?.toISOString() || new Date().toISOString(),
      };
    });

    return activities;
  }

  /**
   * Map audit resource to RecentActivity type
   */
  private mapResourceToType(resource: string): 'booking' | 'listing' | 'user' | 'message' | 'payment' {
    switch (resource) {
      case 'booking':
        return 'booking';
      case 'listing':
        return 'listing';
      case 'user':
      case 'auth':
        return 'user';
      case 'message':
      case 'conversation':
        return 'message';
      case 'subscription':
        return 'payment';
      default:
        return 'booking';
    }
  }

  /**
   * Generate human-readable description for activity
   */
  private generateDescription(action: string, resource: string, metadata: any): string {
    const resourceNorwegian: Record<string, string> = {
      booking: 'booking',
      listing: 'lokale',
      user: 'bruker',
      auth: 'innlogging',
      message: 'melding',
      conversation: 'samtale',
      allocation: 'tildeling',
    };

    const actionNorwegian: Record<string, string> = {
      create: 'opprettet',
      update: 'oppdatert',
      delete: 'slettet',
      publish: 'publisert',
      archive: 'arkivert',
      confirm: 'bekreftet',
      cancel: 'kansellert',
      complete: 'fullført',
      login: 'logget inn',
      logout: 'logget ut',
    };

    const res = resourceNorwegian[resource] || resource;
    const act = actionNorwegian[action] || action;

    // Add listing name if available in metadata
    if (metadata?.listingName) {
      return `${act} ${res}: ${metadata.listingName}`;
    }

    return `${act} ${res}`;
  }
}

