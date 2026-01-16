/**
 * Organizations Controller
 * Full CRUD + member management
 * 
 * Uses repository pattern and ACL mapper for clean separation:
 * - Repository handles data access (no direct schema imports)
 * - Mapper transforms DB entities to projection DTOs
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getOrganizationRepository } from './organization.repository';
import { getOrganizationSetupService } from './organization-setup.service';
import { getAuditService } from '../../core/audit/audit.service';
import {
  toOrganizationCardProjection,
  toOrganizationDetailsProjection,
  toMemberProjections,
  toBrandingProjection,
} from './organization.mapper';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  user?: { role?: string };
}

@Controller('/api/organizations')
export class OrganizationsController {
  private readonly repository = getOrganizationRepository();
  private readonly auditService = getAuditService();

  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || undefined;
    const { search, status, page = 1, limit = 20 } = request.query as any;
    const userRole = request.user?.role || 'member';

    const result = await this.repository.findAll({
      tenantId,
      search,
      status,
      page: Number(page),
      limit: Number(limit),
    });

    // Transform to projections
    const projections = result.data.map(org => 
      toOrganizationCardProjection(org, { userRole })
    );

    return {
      data: projections,
      meta: result.meta,
    };
  }

  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const userRole = request.user?.role || 'member';

    const org = await this.repository.findById(id);

    if (!org) {
      reply.code(404);
      return { 
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Organization not found',
      };
    }

    // Get members for detail view
    const members = await this.repository.getMembers(id);
    const orgWithMembers = { ...org, members };

    const projection = toOrganizationDetailsProjection(orgWithMembers, { userRole });

    return { data: projection };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const setupService = getOrganizationSetupService();
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId;
    const body = request.body as any;

    // Create organization via repository
    const organization = await this.repository.create({
      tenantId,
      name: body.name,
      slug: body.slug,
      type: body.type,
      settings: body.settings,
    });

    // Log organization creation
    await this.auditService.logCreate('organization', organization.id, {
      tenantId,
      userId: userId ?? undefined,
      metadata: {
        name: organization.name,
        type: organization.type,
        actorType: body.actorType || 'organization',
      },
      ipAddress: (request as any).ip,
      userAgent: (request as any).headers?.['user-agent'],
    });

    // Initialize organization with default roles and settings
    await setupService.initializeOrganization({
      organizationId: organization.id,
      tenantId,
      actorType: body.actorType || 'organization',
      branding: body.branding,
    });

    // Return projection
    const projection = toOrganizationCardProjection({
      ...organization,
      memberCount: 0,
    });

    reply.code(201);
    return { data: projection };
  }

  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;
    const tenantId = request.tenantId;
    const userId = request.userId;

    const updated = await this.repository.update(id, {
      name: body.name,
      slug: body.slug,
      type: body.type,
      status: body.status,
      settings: body.settings,
    });

    if (!updated) {
      reply.code(404);
      return { 
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Organization not found',
      };
    }

    // Log update
    await this.auditService.logUpdate('organization', id, {
      tenantId: tenantId ?? undefined,
      userId: userId ?? undefined,
      metadata: { changes: body },
      ipAddress: (request as any).ip,
      userAgent: (request as any).headers?.['user-agent'],
    });

    const projection = toOrganizationCardProjection({
      ...updated,
      memberCount: 0, // Would need to fetch if needed
    });

    return { data: projection };
  }

  @Get('/:id/branding')
  async getBranding(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;

    const org = await this.repository.findById(id);

    if (!org) {
      reply.code(404);
      return { 
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Organization not found',
      };
    }

    const projection = toBrandingProjection(org);

    return { data: projection };
  }

  @Put('/:id/branding')
  async updateBranding(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;
    const tenantId = request.tenantId;
    const userId = request.userId;

    // Get current org for audit logging
    const currentOrg = await this.repository.findById(id);

    if (!currentOrg) {
      reply.code(404);
      return { 
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Organization not found',
      };
    }

    const currentBranding = (currentOrg.settings as any)?.branding || {};

    // Update branding via repository
    const updated = await this.repository.updateBranding(id, body);

    if (!updated) {
      reply.code(500);
      return { 
        type: 'https://api.digilist.no/errors/internal-error',
        title: 'Internal Error',
        status: 500,
        detail: 'Failed to update branding',
      };
    }

    // Log branding update
    await this.auditService.logUpdate('organization', id, {
      tenantId: tenantId ?? undefined,
      userId: userId ?? undefined,
      metadata: {
        field: 'branding',
        organizationName: currentOrg.name,
        before: currentBranding,
        after: body,
      },
      ipAddress: (request as any).ip,
      userAgent: (request as any).headers?.['user-agent'],
    });

    const projection = toBrandingProjection(updated);

    return { data: projection };
  }

  @Get('/:id/members')
  async getMembers(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;

    // Verify org exists
    const org = await this.repository.findById(id);
    if (!org) {
      reply.code(404);
      return { 
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Organization not found',
      };
    }

    const members = await this.repository.getMembers(id);
    const projections = toMemberProjections(members);

    return { data: projections };
  }

  @Post('/:id/members')
  async addMember(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;
    const tenantId = request.tenantId;
    const userId = request.userId;

    try {
      const member = await this.repository.addMember(id, {
        name: body.name,
        email: body.email,
        role: body.role,
      });

      // Log member addition
      await this.auditService.logCreate('organization_member', member.id, {
        tenantId: tenantId ?? undefined,
        userId: userId ?? undefined,
        metadata: {
          organizationId: id,
          memberEmail: body.email,
          memberRole: body.role || 'member',
        },
        ipAddress: (request as any).ip,
        userAgent: (request as any).headers?.['user-agent'],
      });

      const projections = toMemberProjections([member]);

      reply.code(201);
      return { data: projections[0] };
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        reply.code(404);
        return { 
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: 'Organization not found',
        };
      }
      throw error;
    }
  }

  @Delete('/:id/members/:memberId')
  async removeMember(request: TenantRequest, reply: FastifyReply) {
    const { id, memberId } = request.params as any;
    const tenantId = request.tenantId;
    const userId = request.userId;

    const removed = await this.repository.removeMember(id, memberId);

    if (!removed) {
      reply.code(404);
      return { 
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Member not found',
      };
    }

    // Log member removal
    await this.auditService.logDelete('organization_member', memberId, {
      tenantId: tenantId ?? undefined,
      userId: userId ?? undefined,
      metadata: { organizationId: id },
      ipAddress: (request as any).ip,
      userAgent: (request as any).headers?.['user-agent'],
    });

    return { success: true };
  }
}
