/**
 * Org Dashboard Controller
 * Provides org-scoped KPIs, work queue, and calendar preview for org_admin/org_member roles
 *
 * Endpoints:
 * - GET /api/org-dashboard/stats - Get stats for assigned rental objects
 * - GET /api/org-dashboard/pending-items - Get pending work items (bookings needing approval)
 * - GET /api/org-dashboard/calendar-preview - Get calendar events for assigned objects
 * - GET /api/org-dashboard/alerts - Get operational alerts for assigned objects
 */

import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, count, sql, inArray, desc, or } from 'drizzle-orm';
import {
  rentalObjects,
  bookings,
  blocks,
  users,
  caseHandlerScopes,
  accessGrants,
  allocations,
} from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  user?: {
    id: string;
    role?: string;
    organizationId?: string;
  };
}

/**
 * Get assigned rental object IDs for a user
 * Used for scope enforcement in org_admin/org_member roles
 */
async function getAssignedRentalObjectIds(
  db: any,
  userId: string,
  tenantId: string
): Promise<string[]> {
  // Check case_handler_scopes for direct assignments
  const scopes = await db
    .select({ rentalObjectId: caseHandlerScopes.rentalObjectId })
    .from(caseHandlerScopes)
    .where(
      and(
        eq(caseHandlerScopes.userId, userId),
        eq(caseHandlerScopes.tenantId, tenantId),
        eq(caseHandlerScopes.status, 'active')
      )
    );

  // Check access_grants via organization membership
  const grants = await db
    .select({ rentalObjectId: accessGrants.rentalObjectId })
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.tenantId, tenantId),
        eq(accessGrants.status, 'active')
      )
    );

  const scopeIds = scopes.map((s: any) => s.rentalObjectId).filter(Boolean);
  const grantIds = grants.map((g: any) => g.rentalObjectId).filter(Boolean);

  return [...new Set([...scopeIds, ...grantIds])];
}

@Controller('/api/org-dashboard')
export class OrgDashboardController {
  /**
   * GET /api/org-dashboard/stats
   * Get stats for assigned rental objects only
   */
  @Get('/stats')
  async getStats(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId;

    if (!userId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }

    // Get assigned rental objects
    const assignedIds = await getAssignedRentalObjectIds(db, userId, tenantId);

    if (assignedIds.length === 0) {
      return reply.send({
        data: {
          assignedRentalObjects: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          todayBookings: 0,
          weekBookings: 0,
          activeBlocks: 0,
          monthRevenue: 0,
        },
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count assigned rental objects
    const assignedCount = assignedIds.length;

    // Pending bookings for assigned objects
    const pendingResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          eq(bookings.status, 'pending')
        )
      );
    const pendingBookings = Number(pendingResult[0]?.count || 0);

    // Confirmed bookings for assigned objects
    const confirmedResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          eq(bookings.status, 'confirmed')
        )
      );
    const confirmedBookings = Number(confirmedResult[0]?.count || 0);

    // Today's bookings for assigned objects
    const todayResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          gte(bookings.startTime, startOfDay),
          lte(bookings.startTime, endOfDay)
        )
      );
    const todayBookings = Number(todayResult[0]?.count || 0);

    // This week's bookings for assigned objects
    const weekResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          gte(bookings.startTime, startOfWeek),
          lte(bookings.startTime, endOfWeek)
        )
      );
    const weekBookings = Number(weekResult[0]?.count || 0);

    // Active blocks for assigned objects
    const blocksResult = await db
      .select({ count: count() })
      .from(blocks)
      .where(
        and(
          inArray(blocks.rentalObjectId, assignedIds),
          eq(blocks.status, 'active'),
          gte(blocks.endDate, now)
        )
      );
    const activeBlocks = Number(blocksResult[0]?.count || 0);

    // Month revenue for assigned objects
    const monthRevenueResult = await db
      .select({ revenue: sql<number>`COALESCE(SUM(total_price), 0)` })
      .from(bookings)
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          gte(bookings.createdAt, startOfMonth)
        )
      );
    const monthRevenue = Number(monthRevenueResult[0]?.revenue || 0);

    return reply.send({
      data: {
        assignedRentalObjects: assignedCount,
        pendingBookings,
        confirmedBookings,
        todayBookings,
        weekBookings,
        activeBlocks,
        monthRevenue,
      },
    });
  }

  /**
   * GET /api/org-dashboard/pending-items
   * Get pending work items (bookings needing approval) for assigned objects
   */
  @Get('/pending-items')
  async getPendingItems(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId;
    const { limit = '10', offset = '0' } = request.query as { limit?: string; offset?: string };

    if (!userId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }

    // Get assigned rental objects
    const assignedIds = await getAssignedRentalObjectIds(db, userId, tenantId);

    if (assignedIds.length === 0) {
      return reply.send({
        data: [],
        meta: { total: 0, limit: parseInt(limit), offset: parseInt(offset) },
      });
    }

    // Get pending bookings for assigned objects
    const result = await db
      .select({
        id: bookings.id,
        rentalObjectId: bookings.rentalObjectId,
        rentalObjectName: rentalObjects.name,
        userId: bookings.userId,
        userName: users.name,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(rentalObjects, eq(bookings.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          eq(bookings.status, 'pending')
        )
      )
      .orderBy(bookings.createdAt)
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          eq(bookings.status, 'pending')
        )
      );
    const total = Number(countResult[0]?.count || 0);

    return reply.send({
      data: result,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  }

  /**
   * GET /api/org-dashboard/calendar-preview
   * Get calendar events (bookings + blocks) for assigned objects
   * Query params: range (week|month|day), startDate, endDate
   */
  @Get('/calendar-preview')
  async getCalendarPreview(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId;
    const {
      range = 'week',
      startDate: startDateParam,
      endDate: endDateParam,
    } = request.query as { range?: string; startDate?: string; endDate?: string };

    if (!userId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }

    // Get assigned rental objects
    const assignedIds = await getAssignedRentalObjectIds(db, userId, tenantId);

    if (assignedIds.length === 0) {
      return reply.send({
        data: {
          bookings: [],
          blocks: [],
          rentalObjects: [],
        },
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (range) {
        case 'day':
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'month':
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
          break;
        case 'week':
        default:
          endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get bookings for assigned objects in date range
    const bookingsResult = await db
      .select({
        id: bookings.id,
        rentalObjectId: bookings.rentalObjectId,
        rentalObjectName: rentalObjects.name,
        userId: bookings.userId,
        userName: users.name,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
      })
      .from(bookings)
      .leftJoin(rentalObjects, eq(bookings.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          or(
            and(gte(bookings.startTime, startDate), lte(bookings.startTime, endDate)),
            and(gte(bookings.endTime, startDate), lte(bookings.endTime, endDate))
          )
        )
      )
      .orderBy(bookings.startTime);

    // Get blocks for assigned objects in date range
    const blocksResult = await db
      .select({
        id: blocks.id,
        rentalObjectId: blocks.rentalObjectId,
        rentalObjectName: rentalObjects.name,
        title: blocks.title,
        reason: blocks.reason,
        startDate: blocks.startDate,
        endDate: blocks.endDate,
        allDay: blocks.allDay,
        status: blocks.status,
      })
      .from(blocks)
      .leftJoin(rentalObjects, eq(blocks.rentalObjectId, rentalObjects.id))
      .where(
        and(
          inArray(blocks.rentalObjectId, assignedIds),
          eq(blocks.status, 'active'),
          or(
            and(gte(blocks.startDate, startDate), lte(blocks.startDate, endDate)),
            and(gte(blocks.endDate, startDate), lte(blocks.endDate, endDate))
          )
        )
      )
      .orderBy(blocks.startDate);

    // Get assigned rental objects summary
    const rentalObjectsResult = await db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        categoryKey: rentalObjects.categoryKey,
        status: rentalObjects.status,
      })
      .from(rentalObjects)
      .where(inArray(rentalObjects.id, assignedIds));

    return reply.send({
      data: {
        bookings: bookingsResult,
        blocks: blocksResult,
        rentalObjects: rentalObjectsResult,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    });
  }

  /**
   * GET /api/org-dashboard/alerts
   * Get operational alerts for assigned objects
   * (e.g., upcoming blocks, high-volume days, unconfirmed bookings nearing start date)
   */
  @Get('/alerts')
  async getAlerts(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId;

    if (!userId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }

    // Get assigned rental objects
    const assignedIds = await getAssignedRentalObjectIds(db, userId, tenantId);

    if (assignedIds.length === 0) {
      return reply.send({ data: [] });
    }

    const alerts: Array<{
      id: string;
      type: 'warning' | 'info' | 'danger';
      title: string;
      description: string;
      resourceType: string;
      resourceId?: string;
      createdAt: string;
    }> = [];

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Alert 1: Pending bookings for today/tomorrow
    const urgentPending = await db
      .select({
        id: bookings.id,
        rentalObjectName: rentalObjects.name,
        startTime: bookings.startTime,
      })
      .from(bookings)
      .leftJoin(rentalObjects, eq(bookings.rentalObjectId, rentalObjects.id))
      .where(
        and(
          inArray(bookings.rentalObjectId, assignedIds),
          eq(bookings.status, 'pending'),
          lte(bookings.startTime, tomorrow)
        )
      )
      .limit(5);

    for (const booking of urgentPending) {
      alerts.push({
        id: `pending-${booking.id}`,
        type: 'danger',
        title: 'Booking venter på godkjenning',
        description: `${booking.rentalObjectName} har en ventende booking som starter snart`,
        resourceType: 'booking',
        resourceId: booking.id,
        createdAt: now.toISOString(),
      });
    }

    // Alert 2: Upcoming blocks starting soon
    const upcomingBlocks = await db
      .select({
        id: blocks.id,
        title: blocks.title,
        rentalObjectName: rentalObjects.name,
        startDate: blocks.startDate,
      })
      .from(blocks)
      .leftJoin(rentalObjects, eq(blocks.rentalObjectId, rentalObjects.id))
      .where(
        and(
          inArray(blocks.rentalObjectId, assignedIds),
          eq(blocks.status, 'active'),
          gte(blocks.startDate, now),
          lte(blocks.startDate, nextWeek)
        )
      )
      .limit(5);

    for (const block of upcomingBlocks) {
      alerts.push({
        id: `block-${block.id}`,
        type: 'info',
        title: 'Kommende blokk',
        description: `${block.rentalObjectName}: "${block.title}" starter ${new Date(block.startDate).toLocaleDateString('nb-NO')}`,
        resourceType: 'block',
        resourceId: block.id,
        createdAt: now.toISOString(),
      });
    }

    // Sort alerts by severity (danger > warning > info)
    const severityOrder = { danger: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.type] - severityOrder[b.type]);

    return reply.send({ data: alerts.slice(0, 10) });
  }

  /**
   * GET /api/org-dashboard/assigned-rental-objects
   * Get list of assigned rental objects for the current user
   */
  @Get('/assigned-rental-objects')
  async getAssignedRentalObjects(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId;

    if (!userId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not authenticated',
      });
    }

    // Get assigned rental objects
    const assignedIds = await getAssignedRentalObjectIds(db, userId, tenantId);

    if (assignedIds.length === 0) {
      return reply.send({ data: [] });
    }

    const result = await db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        slug: rentalObjects.slug,
        categoryKey: rentalObjects.categoryKey,
        timeMode: rentalObjects.timeMode,
        status: rentalObjects.status,
        capacity: rentalObjects.capacity,
      })
      .from(rentalObjects)
      .where(inArray(rentalObjects.id, assignedIds))
      .orderBy(rentalObjects.name);

    return reply.send({ data: result });
  }
}

export default OrgDashboardController;
