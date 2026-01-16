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

    // Count active rentalObjects using Drizzle
    const activeListingsResult = await db
      .select({ count: count() })
      .from(rentalObjects)
      .where(eq(rentalObjects.status, 'published'));
    const activeListings = Number(activeListingsResult[0]?.count || 0);

    // Count pending requests
    const pendingResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, 'pending'));
    const pendingRequests = Number(pendingResult[0]?.count || 0);

    // Today's confirmed bookings
    const todayResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, startOfDay),
          lte(bookings.startTime, endOfDay)
        )
      );
    const todayBookings = Number(todayResult[0]?.count || 0);

    // This week's bookings
    const weekResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, startOfWeek),
          lte(bookings.startTime, endOfDay)
        )
      );
    const weekBookings = Number(weekResult[0]?.count || 0);

    // Month revenue
    const monthRevenueResult = await db
      .select({ revenue: sql<number>`COALESCE(SUM(total_price), 0)` })
      .from(bookings)
      .where(gte(bookings.createdAt, startOfMonth));
    const monthRevenue = Number(monthRevenueResult[0]?.revenue || 0);

    // Cancelled bookings count
    const cancelledResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, 'cancelled'));
    const cancelledBookings = Number(cancelledResult[0]?.count || 0);

    // Top rentalObjects by bookings
    const topListingsResult = await db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        bookingCount: sql<number>`COALESCE(COUNT(${bookings.id}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
      })
      .from(rentalObjects)
      .leftJoin(bookings, eq(rentalObjects.id, bookings.rentalObjectId))
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

    // Get all bookings grouped by status
    const result = await db
      .select({
        status: bookings.status,
        count: count(),
        revenue: sql<number>`COALESCE(SUM(total_price), 0)`,
      })
      .from(bookings)
      .groupBy(bookings.status);

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
        userName: users.name,
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

