/**
 * Organizations Controller
 * Full CRUD + member management
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, sql, count, like, desc } from 'drizzle-orm';
import { organizations, users } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/organizations')
export class OrganizationsController {
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;
    const { search, status, page = 1, limit = 20 } = request.query as any;

    const conditions = [];
    if (tenantId) conditions.push(eq(organizations.tenantId, tenantId));
    if (status) conditions.push(eq(organizations.status, status));
    if (search) conditions.push(like(organizations.name, `%${search}%`));

    const result = await db
      .select({
        id: organizations.id,
        tenantId: organizations.tenantId,
        name: organizations.name,
        slug: organizations.slug,
        type: organizations.type,
        status: organizations.status,
        settings: organizations.settings,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(organizations.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    // Get member counts per org
    const orgsWithMembers = await Promise.all(
      result.map(async (org: any) => {
        const memberCount = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.organizationId, org.id));
        return {
          ...org,
          memberCount: Number(memberCount[0]?.count || 0),
        };
      })
    );

    const countResult = await db
      .select({ count: count() })
      .from(organizations)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data: orgsWithMembers,
      meta: {
        total: Number(countResult[0]?.count || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / Number(limit)),
      },
    };
  }

  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));

    if (!result.length) {
      reply.code(404);
      return { error: 'Organization not found' };
    }

    // Get member count
    const memberCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, id));

    return {
      data: {
        ...result[0],
        memberCount: Number(memberCount[0]?.count || 0),
      },
    };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(organizations)
      .values({
        tenantId,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        type: body.type || 'organization',
        status: 'active',
        settings: body.settings || {},
      })
      .returning();

    reply.code(201);
    return { data: result[0] };
  }

  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const body = request.body as any;

    const result = await db
      .update(organizations)
      .set({
        name: body.name,
        slug: body.slug,
        type: body.type,
        status: body.status,
        settings: body.settings,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Organization not found' };
    }

    return { data: result[0] };
  }

  @Get('/:id/members')
  async getMembers(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.organizationId, id));

    return { data: result };
  }

  @Post('/:id/members')
  async addMember(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const body = request.body as any;

    // Get org's tenant
    const org = await db
      .select({ tenantId: organizations.tenantId })
      .from(organizations)
      .where(eq(organizations.id, id));

    if (!org.length) {
      reply.code(404);
      return { error: 'Organization not found' };
    }

    const result = await db
      .insert(users)
      .values({
        tenantId: org[0].tenantId,
        organizationId: id,
        name: body.name,
        email: body.email,
        role: body.role || 'member',
        status: 'active',
      })
      .returning();

    reply.code(201);
    return { data: result[0] };
  }

  @Delete('/:id/members/:memberId')
  async removeMember(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id, memberId } = request.params as any;

    // Remove org association (don't delete user)
    const result = await db
      .update(users)
      .set({ organizationId: null, updatedAt: new Date() })
      .where(and(eq(users.id, memberId), eq(users.organizationId, id)))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Member not found' };
    }

    return { success: true };
  }
}
