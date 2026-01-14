/**
 * Seasons Controller
 * Seasonal booking management endpoints
 *
 * Endpoints:
 * - GET /api/seasons - List all seasons
 * - GET /api/seasons/:id - Get season by ID
 * - GET /api/seasons/:id/stats - Get season statistics with application counts
 * - POST /api/seasons - Create a new season
 * - PUT /api/seasons/:id - Update season
 * - PUT /api/seasons/:id/open - Open season for applications
 * - PUT /api/seasons/:id/close - Close season for applications
 * - PUT /api/seasons/:id/activate - Activate season
 * - PUT /api/seasons/:id/complete - Complete season
 * - DELETE /api/seasons/:id - Delete season
 */

import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { seasons, seasonApplications, listings } from '../../database/schema/index';
import { sendBatchAllocationNotifications } from '../season-applications/season-applications.controller';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/seasons')
export class SeasonsController {
  /**
   * GET /api/seasons
   * List all seasons
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { status, limit = '20', offset = '0' } = request.query as any;

    // Build conditions
    const conditions = [];
    if (status) conditions.push(eq(seasons.status, status));

    const result = await db
      .select({
        id: seasons.id,
        tenantId: seasons.tenantId,
        name: seasons.name,
        startDate: seasons.startDate,
        endDate: seasons.endDate,
        applicationStartDate: seasons.applicationStartDate,
        applicationEndDate: seasons.applicationEndDate,
        status: seasons.status,
        description: seasons.description,
        metadata: seasons.metadata,
        createdAt: seasons.createdAt,
        updatedAt: seasons.updatedAt,
      })
      .from(seasons)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(seasons.startDate))
      .limit(Number(limit))
      .offset(Number(offset));

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(seasons)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    return reply.send({
      data: result,
      meta: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  }

  /**
   * GET /api/seasons/:id
   * Get season by ID
   */
  @Get('/:id')
  async findById(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select({
        id: seasons.id,
        tenantId: seasons.tenantId,
        name: seasons.name,
        startDate: seasons.startDate,
        endDate: seasons.endDate,
        applicationStartDate: seasons.applicationStartDate,
        applicationEndDate: seasons.applicationEndDate,
        status: seasons.status,
        description: seasons.description,
        metadata: seasons.metadata,
        createdAt: seasons.createdAt,
        updatedAt: seasons.updatedAt,
      })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!result.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    return reply.send({ data: result[0] });
  }

  /**
   * POST /api/seasons
   * Create a new season
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(seasons)
      .values({
        tenantId,
        name: body.name || 'New Season',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        applicationStartDate: body.applicationStartDate ? new Date(body.applicationStartDate) : new Date(),
        applicationEndDate: body.applicationEndDate || body.applicationDeadline
          ? new Date(body.applicationEndDate || body.applicationDeadline)
          : new Date(),
        status: body.status || 'draft',
        description: body.description || null,
        metadata: body.settings || body.metadata || {},
      })
      .returning();

    return reply.status(201).send({
      data: result[0],
      message: 'Season created successfully',
    });
  }

  /**
   * PUT /api/seasons/:id
   * Update season
   */
  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const body = request.body as any;

    // Check if season exists
    const existing = await db
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.applicationStartDate !== undefined) updateData.applicationStartDate = new Date(body.applicationStartDate);
    if (body.applicationEndDate !== undefined) updateData.applicationEndDate = new Date(body.applicationEndDate);
    if (body.applicationDeadline !== undefined) updateData.applicationEndDate = new Date(body.applicationDeadline);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    if (body.settings !== undefined) updateData.metadata = body.settings;

    const result = await db
      .update(seasons)
      .set(updateData)
      .where(eq(seasons.id, id))
      .returning();

    return reply.send({
      data: result[0],
      message: 'Season updated successfully',
    });
  }

  /**
   * PUT /api/seasons/:id/open
   * Open season for applications
   */
  @Put('/:id/open')
  async open(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const existing = await db
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    // Update status to open
    const result = await db
      .update(seasons)
      .set({
        status: 'open',
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, id))
      .returning();

    return reply.send({
      data: result[0],
      message: 'Season opened successfully',
    });
  }

  /**
   * PUT /api/seasons/:id/close
   * Close season for applications
   */
  @Put('/:id/close')
  async close(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const existing = await db
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    // Update status to closed
    const result = await db
      .update(seasons)
      .set({
        status: 'closed',
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, id))
      .returning();

    return reply.send({
      data: result[0],
      message: 'Season closed successfully',
    });
  }

  /**
   * PUT /api/seasons/:id/activate
   * Activate season
   */
  @Put('/:id/activate')
  async activate(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const existing = await db
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    // Update status to active
    const result = await db
      .update(seasons)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, id))
      .returning();

    return reply.send({
      data: result[0],
      message: 'Season activated successfully',
    });
  }

  /**
   * PUT /api/seasons/:id/complete
   * Complete season
   */
  @Put('/:id/complete')
  async complete(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const existing = await db
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    // Update status to completed
    const result = await db
      .update(seasons)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, id))
      .returning();

    return reply.send({
      data: result[0],
      message: 'Season completed successfully',
    });
  }

  /**
   * GET /api/seasons/:id/stats
   * Get season statistics with application counts
   */
  @Get('/:id/stats')
  async getStats(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const seasonResult = await db
      .select({
        id: seasons.id,
        name: seasons.name,
        status: seasons.status,
      })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!seasonResult.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    // Get total application count
    const totalCountResult = await db
      .select({ count: count() })
      .from(seasonApplications)
      .where(eq(seasonApplications.seasonId, id));

    const totalApplications = Number(totalCountResult[0]?.count || 0);

    // Get application counts by status
    const statusCountsResult = await db
      .select({
        status: seasonApplications.status,
        count: count(),
      })
      .from(seasonApplications)
      .where(eq(seasonApplications.seasonId, id))
      .groupBy(seasonApplications.status);

    // Build status counts object
    const applicationsByStatus: Record<string, number> = {};
    statusCountsResult.forEach((row: any) => {
      applicationsByStatus[row.status] = Number(row.count);
    });

    return reply.send({
      data: {
        seasonId: id,
        seasonName: seasonResult[0].name,
        seasonStatus: seasonResult[0].status,
        totalApplications,
        applicationsByStatus,
        generatedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * DELETE /api/seasons/:id
   * Delete season
   */
  @Delete('/:id')
  async delete(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const existing = await db
      .select({ id: seasons.id })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    await db
      .delete(seasons)
      .where(eq(seasons.id, id));

    return reply.send({
      message: 'Season deleted successfully',
    });
  }

  /**
   * POST /api/seasons/:id/finalize-allocations
   * Finalize all allocations for a season - batch confirmation
   * Marks the season as allocation_finalized and updates all approved applications
   */
  @Post('/:id/finalize-allocations')
  async finalizeAllocations(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Check if season exists
    const seasonResult = await db
      .select({
        id: seasons.id,
        name: seasons.name,
        status: seasons.status,
      })
      .from(seasons)
      .where(eq(seasons.id, id));

    if (!seasonResult.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Season ${id} not found`,
      });
    }

    const season = seasonResult[0];

    // Get all approved applications for this season with full details for notifications
    const approvedApplications = await db
      .select({
        id: seasonApplications.id,
        status: seasonApplications.status,
        applicantEmail: seasonApplications.applicantEmail,
        applicantName: seasonApplications.applicantName,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        listingName: listings.name,
      })
      .from(seasonApplications)
      .leftJoin(listings, eq(seasonApplications.listingId, listings.id))
      .where(
        and(
          eq(seasonApplications.seasonId, id),
          eq(seasonApplications.status, 'approved')
        )
      );

    // Update season metadata to mark allocations as finalized
    const updatedSeason = await db
      .update(seasons)
      .set({
        metadata: sql`COALESCE(metadata, '{}'::jsonb) || '{"allocationsFinalized": true, "finalizedAt": "${new Date().toISOString()}"}'::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, id))
      .returning();

    // Send batch notifications to all approved applicants
    const notifications = sendBatchAllocationNotifications(
      approvedApplications.map((app) => ({
        id: app.id,
        applicantEmail: app.applicantEmail,
        applicantName: app.applicantName,
        seasonName: season.name,
        listingName: app.listingName || 'Ukjent lokale',
        weekday: app.weekday,
        startTime: app.startTime,
        endTime: app.endTime,
      }))
    );

    return reply.send({
      data: {
        seasonId: id,
        seasonName: season.name,
        approvedApplicationsCount: approvedApplications.length,
        notificationsSent: notifications.length,
        finalized: true,
        finalizedAt: new Date().toISOString(),
      },
      message: 'Season allocations finalized successfully',
    });
  }
}

export default SeasonsController;
