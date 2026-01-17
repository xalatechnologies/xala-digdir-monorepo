/**
 * Backoffice Organizations Controller
 * CRUD operations for municipal/partner organizations
 * 
 * Reference: docs/roles/prd.md - Section 3.1 (Backoffice Organizations)
 * Reference: docs/roles/requirements-matrix.md - Section B (Organizations)
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { RequireCapability } from '../../core/decorators/require-capability';
import { OrganizationsService } from './organizations.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/organizations')
export class OrganizationsController {
  constructor(
    @Inject('OrganizationsService') private readonly service: OrganizationsService
  ) {}

  /**
   * List backoffice organizations
   * GET /organizations
   * 
   * RBAC: backoffice_orgs.read
   * Roles: KOMMUNE_ADMIN (all), ORG_ADMIN (own org only)
   */
  @Get('/')
  @RequireCapability('backoffice_orgs.read')
  async list(request: FastifyRequest, _reply: FastifyReply) {
    const params = request.query as any;
    
    // Extract user context for scope filtering
    const userId = (request as any).userId;
    const user = (request as any).user;
    const requestContext = {
      userId,
      role: user?.role,
      organizationId: user?.organizationId,
    };
    
    const organizations = await this.service.list(params, requestContext);
    return { data: organizations };
  }

  /**
   * Get organization by ID
   * GET /organizations/:id
   * 
   * RBAC: backoffice_orgs.read
   */
  @Get('/:id')
  @RequireCapability('backoffice_orgs.read')
  async getById(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const organization = await this.service.getById(id);
    return { data: organization };
  }

  /**
   * Create organization
   * POST /organizations
   * 
   * RBAC: backoffice_orgs.write
   * Roles: KOMMUNE_ADMIN only
   */
  @Post('/')
  @RequireCapability('backoffice_orgs.write')
  async create(request: FastifyRequest, _reply: FastifyReply) {
    const body = request.body as any;
    
    // Extract user context
    const tenantId = (request as any).tenantId;
    const userId = (request as any).userId;
    
    const organization = await this.service.create(body, { tenantId, userId });
    return { data: organization };
  }

  /**
   * Update organization
   * PUT /organizations/:id
   * 
   * RBAC: backoffice_orgs.write (KOMMUNE_ADMIN) or backoffice_orgs.write_own (ORG_ADMIN)
   */
  @Put('/:id')
  @RequireCapability('backoffice_orgs.write')
  async update(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;
    
    // Extract user context
    const userId = (request as any).userId;
    
    const organization = await this.service.update(id, body, { userId });
    return { data: organization };
  }

  /**
   * Delete/archive organization
   * DELETE /organizations/:id
   * 
   * RBAC: backoffice_orgs.delete
   * Roles: KOMMUNE_ADMIN only
   */
  @Delete('/:id')
  @RequireCapability('backoffice_orgs.delete')
  async delete(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    await this.service.delete(id);
    return { data: { success: true } };
  }

  /**
   * List organization members
   * GET /organizations/:id/members
   * 
   * RBAC: backoffice_orgs.read
   */
  @Get('/:id/members')
  @RequireCapability('backoffice_orgs.read')
  async listMembers(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const members = await this.service.listMembers(id);
    return { data: members };
  }

  /**
   * Add member to organization
   * POST /organizations/:id/members
   * 
   * RBAC: backoffice_orgs.manage_members
   */
  @Post('/:id/members')
  @RequireCapability('backoffice_orgs.manage_members')
  async addMember(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;
    
    // Extract user context
    const userId = (request as any).userId;
    
    const member = await this.service.addMember(id, body, { userId });
    return { data: member };
  }

  /**
   * Remove member from organization
   * DELETE /organizations/:id/members/:userId
   * 
   * RBAC: backoffice_orgs.manage_members
   */
  @Delete('/:id/members/:userId')
  @RequireCapability('backoffice_orgs.manage_members')
  async removeMember(request: FastifyRequest, _reply: FastifyReply) {
    const { id, userId } = request.params as any;
    await this.service.removeMember(id, userId);
    return { data: { success: true } };
  }

  /**
   * List assigned rental objects
   * GET /organizations/:id/rental-objects
   * 
   * RBAC: backoffice_orgs.read
   */
  @Get('/:id/rental-objects')
  @RequireCapability('backoffice_orgs.read')
  async listAssignedRentalObjects(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const rentalObjects = await this.service.listAssignedRentalObjects(id);
    return { data: rentalObjects };
  }

  /**
   * Assign rental object to organization
   * POST /organizations/:id/rental-objects
   * 
   * RBAC: rental_objects.assign
   * Roles: KOMMUNE_ADMIN only
   */
  @Post('/:id/rental-objects')
  @RequireCapability('rental_objects.assign')
  async assignRentalObject(request: FastifyRequest, _reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;
    
    // Extract user context
    const userId = (request as any).userId;
    
    const assignment = await this.service.assignRentalObject(id, body, { userId });
    return { data: assignment };
  }

  /**
   * Unassign rental object from organization
   * DELETE /organizations/:id/rental-objects/:rentalObjectId
   * 
   * RBAC: rental_objects.assign
   */
  @Delete('/:id/rental-objects/:rentalObjectId')
  @RequireCapability('rental_objects.assign')
  async unassignRentalObject(request: FastifyRequest, _reply: FastifyReply) {
    const { id, rentalObjectId } = request.params as any;
    await this.service.unassignRentalObject(id, rentalObjectId);
    return { data: { success: true } };
  }
}
