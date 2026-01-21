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

import { Controller, Get, Post, Put, Delete, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { seasons, seasonApplications, listings, priorityRules } from '../../database/schema/index';
import { sendBatchAllocationNotifications } from '../season-applications/season-applications.controller';
import { SeasonsService } from './seasons.service';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/seasons')
export class SeasonsController {
  constructor(
    @Inject('SeasonsService') private readonly service: SeasonsService
  ) {}

  /**
   * GET /api/seasons/:id - Get season details (Contract-First)
   * Returns SeasonDTO
   */
  @Get('/:id')
  async getSeason(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    try {
      const season = await this.service.getSeason(request.params.id);
      return { data: season };
    } catch (error) {
      console.error('Error fetching season:', error);
      return { data: null, error: 'Failed to fetch season' };
    }
  }

  /**
   * POST /api/seasons/:seasonId/apply - Apply for season (Contract-First)
   * Returns SeasonApplicationDTO
   */
  @Post('/:seasonId/apply')
  async apply(request: FastifyRequest<{ Params: { seasonId: string } }>, _reply: FastifyReply) {
    try {
      const body = request.body as any;
      const userId = (request as any).user?.id || 'user-id';
      const application = await this.service.apply(request.params.seasonId, userId, body);
      return { data: application };
    } catch (error) {
      console.error('Error applying to season:', error);
      return { data: null, error: 'Failed to apply to season' };
    }
  }

  /**
   * GET /api/seasons/:seasonId/allocations - Get allocations (Contract-First)
   * Returns SeasonAllocationDTO
   */
  @Get('/:seasonId/allocations')
  async getAllocations(request: FastifyRequest<{ Params: { seasonId: string } }>, _reply: FastifyReply) {
    try {
      const allocations = await this.service.getAllocations(request.params.seasonId);
      return { data: allocations };
    } catch (error) {
      console.error('Error fetching allocations:', error);
      return { data: [], error: 'Failed to fetch allocations' };
    }
  }

  /**
   * GET /api/seasons - List seasons for rental object
   */
  @Get()
  async listSeasons(request: FastifyRequest, _reply: FastifyReply) {
    try {
      const { rentalObjectId } = request.query as any;
      const seasonsList = await this.service.listSeasons(rentalObjectId);
      return { data: seasonsList, meta: { total: seasonsList?.length || 0 } };
    } catch (error) {
      console.error('Error listing seasons:', error);
      return { data: [], meta: { total: 0 }, error: 'Failed to load seasons' };
    }
  }

  // ==========================================================================
  // Season Venue Management
  // ==========================================================================

  /**
   * GET /api/seasons/:id/venues - List venues linked to season
   */
  @Get('/:id/venues')
  async listVenues(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    try {
      const venues = await this.service.listVenues(request.params.id);
      return { data: venues };
    } catch (error) {
      console.error('Error listing season venues:', error);
      return { data: [], error: 'Failed to list venues' };
    }
  }

  /**
   * POST /api/seasons/:id/venues - Add venue to season
   */
  @Post('/:id/venues')
  async addVenue(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    try {
      const { rentalObjectId } = request.body as { rentalObjectId: string };
      const venue = await this.service.addVenue(request.params.id, rentalObjectId);
      return { data: venue };
    } catch (error) {
      console.error('Error adding venue to season:', error);
      return { data: null, error: 'Failed to add venue' };
    }
  }

  /**
   * DELETE /api/seasons/:id/venues/:rentalObjectId - Remove venue from season
   */
  @Delete('/:id/venues/:rentalObjectId')
  async removeVenue(
    request: FastifyRequest<{ Params: { id: string; rentalObjectId: string } }>,
    _reply: FastifyReply
  ) {
    try {
      await this.service.removeVenue(request.params.id, request.params.rentalObjectId);
      return { data: { success: true } };
    } catch (error) {
      console.error('Error removing venue from season:', error);
      return { data: null, error: 'Failed to remove venue' };
    }
  }
}

/**
 * Priority Rules Controller
 * Manages priority rules for season applications
 */
@Controller('/api/priority-rules')
class PriorityRulesController {
  /**
   * GET /api/priority-rules - List all priority rules
   */
  @Get('/')
  async list(request: TenantRequest, reply: FastifyReply) {
    try {
      const db = container.resolve<any>('Database');
      const { seasonId } = request.query as any;

      if (!request.tenantId) {
        return reply.status(401).send({ error: 'Tenant ID required' });
      }

      const conditions = [eq(priorityRules.tenantId, request.tenantId)];
      if (seasonId) {
        conditions.push(eq((priorityRules as any).seasonId, seasonId));
      }

      const rules = await db
        .select()
        .from(priorityRules)
        .where(and(...conditions))
        .orderBy(priorityRules.priority);

      return reply.send({
        data: rules,
      });
    } catch (error) {
      console.error('Error listing priority rules:', error);
      return reply.send({ data: [] });
    }
  }

  /**
   * GET /api/priority-rules/:id - Get single priority rule
   */
  @Get('/:id')
  async get(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    if (!request.tenantId) {
      return reply.status(401).send({ error: 'Tenant ID required' });
    }

    const rule = await db
      .select()
      .from(priorityRules)
      .where(
        and(
          eq(priorityRules.id, id),
          eq(priorityRules.tenantId, request.tenantId)
        )
      );

    if (!rule.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Priority rule ${id} not found`,
      });
    }

    return reply.send({
      data: rule[0],
    });
  }

  /**
   * POST /api/priority-rules - Create new priority rule
   */
  @Post('/')
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { seasonId, name, ruleType, priority, conditions, enabled, metadata } = request.body as any;

    if (!request.tenantId) {
      return reply.status(401).send({ error: 'Tenant ID required' });
    }

    if (!name || !ruleType || priority === undefined) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'name, ruleType, and priority are required',
      });
    }

    const newRule = await db
      .insert(priorityRules)
      .values({
        tenantId: request.tenantId,
        seasonId: seasonId || null,
        name,
        ruleType,
        priority,
        conditions: conditions || {},
        enabled: enabled !== undefined ? enabled : true,
        metadata: metadata || {},
      })
      .returning();

    return reply.status(201).send({
      data: newRule[0],
      message: 'Priority rule created successfully',
    });
  }

  /**
   * PUT /api/priority-rules/:id - Update priority rule
   */
  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const { name, ruleType, priority, conditions, enabled, metadata } = request.body as any;

    if (!request.tenantId) {
      return reply.status(401).send({ error: 'Tenant ID required' });
    }

    // Check if rule exists
    const existing = await db
      .select({ id: priorityRules.id })
      .from(priorityRules)
      .where(
        and(
          eq(priorityRules.id, id),
          eq(priorityRules.tenantId, request.tenantId)
        )
      );

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Priority rule ${id} not found`,
      });
    }

    const updates: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (ruleType !== undefined) updates.ruleType = ruleType;
    if (priority !== undefined) updates.priority = priority;
    if (conditions !== undefined) updates.conditions = conditions;
    if (enabled !== undefined) updates.enabled = enabled;
    if (metadata !== undefined) updates.metadata = metadata;

    const updated = await db
      .update(priorityRules)
      .set(updates)
      .where(eq(priorityRules.id, id))
      .returning();

    return reply.send({
      data: updated[0],
      message: 'Priority rule updated successfully',
    });
  }

  /**
   * DELETE /api/priority-rules/:id - Delete priority rule
   */
  @Delete('/:id')
  async delete(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    if (!request.tenantId) {
      return reply.status(401).send({ error: 'Tenant ID required' });
    }

    // Check if rule exists
    const existing = await db
      .select({ id: priorityRules.id })
      .from(priorityRules)
      .where(
        and(
          eq(priorityRules.id, id),
          eq(priorityRules.tenantId, request.tenantId)
        )
      );

    if (!existing.length) {
      return reply.status(404).send({
        error: 'not_found',
        message: `Priority rule ${id} not found`,
      });
    }

    await db
      .delete(priorityRules)
      .where(eq(priorityRules.id, id));

    return reply.send({
      message: 'Priority rule deleted successfully',
    });
  }
}

export default SeasonsController;
export { PriorityRulesController };
