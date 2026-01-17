/**
 * Reports Controller
 * Provides usage, revenue, and analytics reports
 */
import { Controller, Get, Post } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { ReportsService } from './reports.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, sql, and, gte, lte, count, sum } from 'drizzle-orm';
import { rentalObjects, bookings, organizations, users, seasonalLeases } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/reports')
export class ReportsController {
  constructor(
    @Inject('ReportsService') private readonly service: ReportsService
  ) {}

  /**
   * GET /api/reports/templates - Get report templates (Contract-First)
   * Returns ReportTemplateDTO
   */
  @Get('/templates')
  async getTemplates(_request: FastifyRequest, _reply: FastifyReply) {
    const templates = await this.service.getTemplates();
    return { data: templates };
  }

  /**
   * POST /api/reports/generate - Generate report (Contract-First)
   * Returns ReportDTO
   */
  @Post('/generate')
  async generate(request: FastifyRequest, _reply: FastifyReply) {
    const body = request.body as any;
    const userId = (request as any).user?.id || 'system';
    const report = await this.service.generateReport(body, userId);
    return { data: report };
  }

  /**
   * GET /api/reports/:id - Get report status
   * Returns ReportDTO
   */
  @Get('/:id')
  async getReport(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const report = await this.service.getReport(request.params.id);
    return { data: report };
  }

  /**
   * GET /api/reports - List user's reports
   * Returns ReportDTO[]
   */
  @Get()
  async listReports(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user?.id || 'system';
    const reports = await this.service.listReports(userId);
    return { data: reports };
  }

  @Get('/usage')
  async getUsageReport(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { startDate, endDate, rentalObjectId } = request.query as any;

    // Get usage by listing
    const result = await db
      .select({
        rentalObjectId: rentalObjects.id,
        listingName: rentalObjects.name,
        totalBookings: sql<number>`COALESCE(COUNT(${bookings.id}), 0)`,
        totalHours: sql<number>`COALESCE(SUM(EXTRACT(EPOCH FROM (${bookings.endTime} - ${bookings.startTime})) / 3600), 0)`,
        revenue: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
      })
      .from(rentalObjects)
      .leftJoin(bookings, eq(rentalObjects.id, bookings.rentalObjectId))
      .where(eq(rentalObjects.status, 'published'))
      .groupBy(rentalObjects.id, rentalObjects.name)
      .orderBy(sql`COUNT(${bookings.id}) DESC`);

    return {
      data: result.map((row: any) => ({
        rentalObjectId: row.rentalObjectId,
        listingName: row.listingName,
        totalBookings: Number(row.totalBookings),
        totalHours: Math.round(Number(row.totalHours) * 10) / 10,
        revenue: Number(row.revenue),
        utilizationRate: 0,
      })),
    };
  }

  @Get('/revenue')
  async getRevenueReport(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    // Revenue by listing
    const byListing = await db
      .select({
        rentalObjectId: rentalObjects.id,
        listingName: rentalObjects.name,
        revenue: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
        bookingCount: count(bookings.id),
      })
      .from(rentalObjects)
      .leftJoin(bookings, eq(rentalObjects.id, bookings.rentalObjectId))
      .groupBy(rentalObjects.id, rentalObjects.name)
      .orderBy(sql`SUM(${bookings.totalPrice}) DESC`)
      .limit(10);

    // Total revenue
    const totalResult = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(total_price), 0)`,
        bookingCount: count(),
      })
      .from(bookings);

    const totalRevenue = Number(totalResult[0]?.totalRevenue || 0);
    const bookingCount = Number(totalResult[0]?.bookingCount || 0);

    return {
      totalRevenue,
      bookingCount,
      averageBookingValue: bookingCount > 0 ? Math.round(totalRevenue / bookingCount) : 0,
      byListing: byListing.map((row: any) => ({
        rentalObjectId: row.rentalObjectId,
        listingName: row.listingName,
        revenue: Number(row.revenue),
        percentage: totalRevenue > 0 ? Math.round((Number(row.revenue) / totalRevenue) * 100) : 0,
      })),
    };
  }

  @Get('/bookings')
  async getBookingStats(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    const result = await db
      .select({
        status: bookings.status,
        count: count(),
        revenue: sql<number>`COALESCE(SUM(total_price), 0)`,
      })
      .from(bookings)
      .groupBy(bookings.status);

    const stats: Record<string, number> = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const row of result) {
      stats[row.status as string] = Number(row.count);
      stats.total += Number(row.count);
    }

    return {
      ...stats,
      confirmationRate: stats.total > 0 ? Math.round(((stats.confirmed + stats.completed) / stats.total) * 100) : 0,
      cancellationRate: stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0,
    };
  }

  @Get('/organizations')
  async getOrganizationReport(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    const result = await db
      .select({
        organizationId: organizations.id,
        organizationName: organizations.name,
        totalBookings: sql<number>`0`,
        totalSpent: sql<number>`0`,
        activeSeasonalLeases: sql<number>`0`,
      })
      .from(organizations)
      .where(eq(organizations.status, 'active'))
      .orderBy(organizations.name);

    return {
      data: result.map((row: any) => ({
        organizationId: row.organizationId,
        organizationName: row.organizationName,
        totalBookings: Number(row.totalBookings),
        totalSpent: Number(row.totalSpent),
        activeSeasonalLeases: Number(row.activeSeasonalLeases),
        lastBookingDate: null,
      })),
    };
  }
}
