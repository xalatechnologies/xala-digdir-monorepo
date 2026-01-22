/**
 * Allocations Controller
 * Standalone allocations at /api/allocations
 */
import { Controller, Get, Post, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte } from 'drizzle-orm';
import { allocations, rentalObjects, users } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/allocations')
export class AllocationsController {
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { rentalObjectId, startDate, endDate, status } = request.query as any;

    const conditions = [];
    if (rentalObjectId) conditions.push(eq(allocations.rentalObjectId, rentalObjectId));
    if (startDate) conditions.push(gte(allocations.startTime, new Date(startDate)));
    if (endDate) conditions.push(lte(allocations.endTime, new Date(endDate)));
    if (status) conditions.push(eq(allocations.status, status));

    const result = await db
      .select({
        id: allocations.id,
        tenantId: allocations.tenantId,
        rentalObjectId: allocations.rentalObjectId,
        listingName: rentalObjects.name,
        title: allocations.title,
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
        bookingId: allocations.bookingId,
        userId: allocations.userId,
        userName: users.displayName,
        notes: allocations.notes,
        metadata: allocations.metadata,
        createdAt: allocations.createdAt,
      })
      .from(allocations)
      .leftJoin(rentalObjects, eq(allocations.rentalObjectId, rentalObjects.id))
      .leftJoin(users, eq(allocations.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(allocations.startTime);

    return { data: result };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(allocations)
      .values({
        tenantId,
        rentalObjectId: body.rentalObjectId,
        title: body.title,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status || 'blocked',
        bookingId: body.bookingId || null,
        userId: body.userId || null,
        notes: body.notes || null,
        metadata: body.metadata || {},
      })
      .returning();

    getAuditService().log({
      tenantId,
      userId: body.userId,
      action: 'create',
      resource: 'allocation',
      resourceId: result[0].id,
      metadata: { rentalObjectId: body.rentalObjectId, startTime: body.startTime, endTime: body.endTime },
    });

    reply.code(201);
    return { data: result[0] };
  }

  @Delete('/:id')
  async delete(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .delete(allocations)
      .where(eq(allocations.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Allocation not found' };
    }

    getAuditService().log({
      tenantId: request.tenantId || undefined,
      action: 'delete',
      resource: 'allocation',
      resourceId: id,
      severity: 'warning',
      metadata: { deletedAllocation: result[0] },
    });

    return { success: true };
  }
}
