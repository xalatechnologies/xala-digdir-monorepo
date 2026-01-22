/**
 * Blocks Controller
 * Calendar blocking/availability management for rental objects
 *
 * Endpoints:
 * - GET /api/blocks - List all blocks (with optional scope filtering)
 * - GET /api/blocks/:id - Get block by ID
 * - POST /api/blocks - Create a new block
 * - PUT /api/blocks/:id - Update block
 * - DELETE /api/blocks/:id - Delete block
 * - GET /api/blocks/conflicts - Check for conflicts
 */

import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, or, not, inArray } from 'drizzle-orm';
import { blocks, rentalObjects, users, caseHandlerScopes, accessGrants } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  user?: {
    userId: string;
    tenantId: string;
    email?: string;
    role?: string;
    isSaasAdmin?: boolean;
    organizationId?: string;
  };
}

interface BlockQueryParams {
  rentalObjectId?: string;
  from?: string;
  to?: string;
  status?: string;
  scope?: 'all' | 'assigned';
  limit?: string;
  offset?: string;
}

interface CreateBlockBody {
  rentalObjectId: string;
  title: string;
  reason?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  recurring?: boolean;
  recurrenceRule?: string;
  visibility?: 'public' | 'internal' | 'private';
}

interface UpdateBlockBody {
  title?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  recurring?: boolean;
  recurrenceRule?: string;
  visibility?: 'public' | 'internal' | 'private';
  status?: 'active' | 'cancelled';
}

interface ConflictCheckParams {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  excludeBlockId?: string;
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

@Controller('/api/blocks')
export class BlocksController {
  /**
   * GET /api/blocks
   * List all blocks with optional filtering
   * Supports scope=assigned for org_admin/org_member roles
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const query = request.query as BlockQueryParams;

    const conditions = [eq(blocks.tenantId, tenantId)];

    // Apply scope filtering for assigned rental objects
    if (query.scope === 'assigned' && request.userId) {
      const assignedIds = await getAssignedRentalObjectIds(db, request.userId, tenantId);
      if (assignedIds.length === 0) {
        return reply.send({
          data: [],
          meta: { total: 0, limit: parseInt(query.limit || '50'), offset: parseInt(query.offset || '0') },
        });
      }
      conditions.push(inArray(blocks.rentalObjectId, assignedIds));
    }

    // Optional filters
    if (query.rentalObjectId) {
      conditions.push(eq(blocks.rentalObjectId, query.rentalObjectId));
    }
    if (query.from) {
      conditions.push(gte(blocks.startDate, new Date(query.from)));
    }
    if (query.to) {
      conditions.push(lte(blocks.endDate, new Date(query.to)));
    }
    if (query.status) {
      conditions.push(eq(blocks.status, query.status));
    }

    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');

    const result = await db
      .select({
        id: blocks.id,
        tenantId: blocks.tenantId,
        rentalObjectId: blocks.rentalObjectId,
        rentalObjectName: rentalObjects.name,
        title: blocks.title,
        reason: blocks.reason,
        startDate: blocks.startDate,
        endDate: blocks.endDate,
        allDay: blocks.allDay,
        recurring: blocks.recurring,
        recurrenceRule: blocks.recurrenceRule,
        visibility: blocks.visibility,
        status: blocks.status,
        createdBy: blocks.createdBy,
        createdByName: users.displayName,
        createdAt: blocks.createdAt,
        updatedAt: blocks.updatedAt,
      })
      .from(blocks)
      .leftJoin(rentalObjects, eq(blocks.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(blocks.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(blocks.startDate)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: blocks.id })
      .from(blocks)
      .where(and(...conditions));

    return reply.send({
      data: result,
      meta: {
        total: countResult.length,
        limit,
        offset,
      },
    });
  }

  /**
   * GET /api/blocks/:id
   * Get block by ID
   */
  @Get('/:id')
  async findById(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const { id } = request.params as { id: string };

    const result = await db
      .select({
        id: blocks.id,
        tenantId: blocks.tenantId,
        rentalObjectId: blocks.rentalObjectId,
        rentalObjectName: rentalObjects.name,
        title: blocks.title,
        reason: blocks.reason,
        startDate: blocks.startDate,
        endDate: blocks.endDate,
        allDay: blocks.allDay,
        recurring: blocks.recurring,
        recurrenceRule: blocks.recurrenceRule,
        visibility: blocks.visibility,
        status: blocks.status,
        createdBy: blocks.createdBy,
        createdByName: users.displayName,
        createdAt: blocks.createdAt,
        updatedAt: blocks.updatedAt,
      })
      .from(blocks)
      .leftJoin(rentalObjects, eq(blocks.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(blocks.createdBy, users.id))
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)))
      .limit(1);

    if (!result.length) {
      return reply.status(404).send({
        type: '/errors/not-found',
        title: 'Block Not Found',
        status: 404,
        detail: `Block with ID ${id} not found`,
        instance: `/api/blocks/${id}`,
      });
    }

    return reply.send({ data: result[0] });
  }

  /**
   * POST /api/blocks
   * Create a new block
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId || null;
    const body = request.body as CreateBlockBody;

    // Validate required fields
    if (!body.rentalObjectId || !body.title || !body.startDate || !body.endDate) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Missing required fields: rentalObjectId, title, startDate, endDate',
      });
    }

    // Validate date range
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate <= startDate) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'End date must be after start date',
      });
    }

    // Verify rental object exists and belongs to tenant
    const rentalObject = await db
      .select({ id: rentalObjects.id })
      .from(rentalObjects)
      .where(and(eq(rentalObjects.id, body.rentalObjectId), eq(rentalObjects.tenantId, tenantId)))
      .limit(1);

    if (!rentalObject.length) {
      return reply.status(404).send({
        type: '/errors/not-found',
        title: 'Rental Object Not Found',
        status: 404,
        detail: `Rental object with ID ${body.rentalObjectId} not found`,
      });
    }

    // Check for scope permission if user is org_admin/org_member
    if (request.user?.role === 'org_admin' || request.user?.role === 'org_member') {
      const assignedIds = await getAssignedRentalObjectIds(db, request.userId!, tenantId);
      if (!assignedIds.includes(body.rentalObjectId)) {
        return reply.status(403).send({
          type: '/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have permission to create blocks for this rental object',
        });
      }
    }

    const result = await db
      .insert(blocks)
      .values({
        tenantId,
        rentalObjectId: body.rentalObjectId,
        title: body.title,
        reason: body.reason || null,
        startDate,
        endDate,
        allDay: body.allDay ?? false,
        recurring: body.recurring ?? false,
        recurrenceRule: body.recurrenceRule || null,
        visibility: body.visibility || 'public',
        status: 'active',
        createdBy: userId,
      })
      .returning();

    // Audit log
    getAuditService().log({
      tenantId,
      userId: userId || undefined,
      action: 'create',
      resource: 'block',
      resourceId: result[0].id,
      metadata: {
        rentalObjectId: body.rentalObjectId,
        title: body.title,
        startDate: body.startDate,
        endDate: body.endDate,
      },
    });

    reply.code(201);
    return reply.send({
      data: result[0],
      message: 'Block created successfully',
    });
  }

  /**
   * PUT /api/blocks/:id
   * Update block
   */
  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId || null;
    const { id } = request.params as { id: string };
    const body = request.body as UpdateBlockBody;

    // Check if block exists
    const existing = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      return reply.status(404).send({
        type: '/errors/not-found',
        title: 'Block Not Found',
        status: 404,
        detail: `Block with ID ${id} not found`,
        instance: `/api/blocks/${id}`,
      });
    }

    // Check for scope permission if user is org_admin/org_member
    if (request.user?.role === 'org_admin' || request.user?.role === 'org_member') {
      const assignedIds = await getAssignedRentalObjectIds(db, request.userId!, tenantId);
      if (!assignedIds.includes(existing[0].rentalObjectId)) {
        return reply.status(403).send({
          type: '/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have permission to update this block',
        });
      }
    }

    // Validate date range if both provided
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      if (endDate <= startDate) {
        return reply.status(400).send({
          type: '/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'End date must be after start date',
        });
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.reason !== undefined) updateData.reason = body.reason;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.allDay !== undefined) updateData.allDay = body.allDay;
    if (body.recurring !== undefined) updateData.recurring = body.recurring;
    if (body.recurrenceRule !== undefined) updateData.recurrenceRule = body.recurrenceRule;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.status !== undefined) updateData.status = body.status;

    const result = await db
      .update(blocks)
      .set(updateData)
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)))
      .returning();

    // Audit log
    getAuditService().log({
      tenantId,
      userId: userId || undefined,
      action: 'update',
      resource: 'block',
      resourceId: id,
      metadata: {
        changes: body,
        previousState: existing[0],
      },
    });

    return reply.send({
      data: result[0],
      message: 'Block updated successfully',
    });
  }

  /**
   * DELETE /api/blocks/:id
   * Delete block
   */
  @Delete('/:id')
  async delete(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId || null;
    const { id } = request.params as { id: string };

    // Check if block exists
    const existing = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      return reply.status(404).send({
        type: '/errors/not-found',
        title: 'Block Not Found',
        status: 404,
        detail: `Block with ID ${id} not found`,
        instance: `/api/blocks/${id}`,
      });
    }

    // Check for scope permission if user is org_admin/org_member
    if (request.user?.role === 'org_admin' || request.user?.role === 'org_member') {
      const assignedIds = await getAssignedRentalObjectIds(db, request.userId!, tenantId);
      if (!assignedIds.includes(existing[0].rentalObjectId)) {
        return reply.status(403).send({
          type: '/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have permission to delete this block',
        });
      }
    }

    await db
      .delete(blocks)
      .where(and(eq(blocks.id, id), eq(blocks.tenantId, tenantId)));

    // Audit log
    getAuditService().log({
      tenantId,
      userId: userId || undefined,
      action: 'delete',
      resource: 'block',
      resourceId: id,
      severity: 'warning',
      metadata: { deletedBlock: existing[0] },
    });

    return reply.send({
      message: 'Block deleted successfully',
    });
  }

  /**
   * GET /api/blocks/conflicts
   * Check for conflicts before creating/updating a block
   */
  @Get('/conflicts')
  async checkConflicts(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const query = request.query as ConflictCheckParams;

    if (!query.rentalObjectId || !query.startTime || !query.endTime) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Missing required parameters: rentalObjectId, startTime, endTime',
      });
    }

    const startTime = new Date(query.startTime);
    const endTime = new Date(query.endTime);

    const conditions = [
      eq(blocks.tenantId, tenantId),
      eq(blocks.rentalObjectId, query.rentalObjectId),
      eq(blocks.status, 'active'),
      // Time overlap condition: existing.start < new.end AND existing.end > new.start
      and(
        lte(blocks.startDate, endTime),
        gte(blocks.endDate, startTime)
      ),
    ];

    // Exclude a specific block (for updates)
    if (query.excludeBlockId) {
      conditions.push(not(eq(blocks.id, query.excludeBlockId)));
    }

    const conflicts = await db
      .select({
        id: blocks.id,
        title: blocks.title,
        startDate: blocks.startDate,
        endDate: blocks.endDate,
        type: () => 'block',
      })
      .from(blocks)
      .where(and(...conditions));

    return reply.send({
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
      },
    });
  }
}

export default BlocksController;
