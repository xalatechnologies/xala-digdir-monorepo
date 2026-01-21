/**
 * Rental Object Custody Controller
 * Handles API endpoints for resource-scoped delegation.
 */
import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Inject
} from '../../core/decorators';
import { RequireCapability } from '../../core/decorators/require-capability';
import { CustodyService } from './custody.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { 
  CreateCustodyGrantDTOSchema, 
  BulkAssignCustodyGrantDTOSchema,
  CreateCustodySubgrantDTOSchema
} from '@xalatechnologies/platform/contracts';

@Controller('/custody')
export class CustodyController {
  constructor(
    @Inject('CustodyService') private readonly service: CustodyService
  ) {}

  /**
   * List grants for a rental object
   */
  @Get('/rental-objects/:id')
  @RequireCapability('backoffice_orgs.read') // Adjust capability as needed
  async listGrants(request: FastifyRequest) {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId;
    
    const grants = await this.service.listGrants(id, tenantId);
    return { data: grants };
  }

  /**
   * List objects an organization has custody for
   */
  @Get('/orgs/:orgId/rental-objects')
  @RequireCapability('listings.read')
  async listOrgCustody(request: FastifyRequest) {
    const { orgId } = request.params as { orgId: string };
    const tenantId = (request as any).tenantId;
    
    const grants = await this.service.listOrgCustody(orgId, tenantId);
    return { data: grants };
  }

  /**
   * Create a new grant
   */
  @Post('/rental-objects/:id/grants')
  @RequireCapability('backoffice_orgs.write')
  async createGrant(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    // Validate request body
    const validation = CreateCustodyGrantDTOSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid grant data',
        errors: validation.error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    const body = validation.data;
    
    const tenantId = (request as any).tenantId;
    const userId = (request as any).userId;

    const grant = await this.service.createGrant({
      tenantId,
      rentalObjectId: id,
      granteeType: body.granteeType,
      granteeId: body.granteeId,
      scopes: body.scopes as any, // Cast to internal CustodyScope
      canSubdelegate: body.canSubdelegate,
      effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
      effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
      reason: body.reason,
      createdByUserId: userId
    });

    return reply.status(201).send({ data: grant });
  }

  /**
   * Bulk assign grants
   */
  @Post('/grants/bulk')
  @RequireCapability('backoffice_orgs.write')
  async bulkAssign(request: FastifyRequest, reply: FastifyReply) {
    // Validate request body
    const validation = BulkAssignCustodyGrantDTOSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid bulk assign data',
        errors: validation.error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    const body = validation.data;
    
    const tenantId = (request as any).tenantId;
    const userId = (request as any).userId;

    const results = await this.service.bulkAssign({
      tenantId,
      rentalObjectIds: body.rentalObjectIds,
      granteeType: body.granteeType,
      granteeId: body.granteeId,
      scopes: body.scopes as any,
      createdByUserId: userId
    });

    return { data: results };
  }

  /**
   * Revoke a grant
   */
  @Delete('/grants/:grantId')
  @RequireCapability('backoffice_orgs.write')
  async revokeGrant(request: FastifyRequest) {
    const { grantId } = request.params as { grantId: string };
    const tenantId = (request as any).tenantId;
    const userId = (request as any).userId;

    const revoked = await this.service.revokeGrant(grantId, tenantId, userId);
    return { data: revoked };
  }

  /**
   * Create a subgrant
   */
  @Post('/grants/:parentGrantId/subgrants')
  @RequireCapability('org_admin.manage') // Or similar
  async createSubgrant(request: FastifyRequest, reply: FastifyReply) {
    const { parentGrantId } = request.params as { parentGrantId: string };
    
    // Validate request body
    const validation = CreateCustodySubgrantDTOSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid subgrant data',
        errors: validation.error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    const body = validation.data;

    const tenantId = (request as any).tenantId;
    const userId = (request as any).userId;

    const subgrant = await this.service.createSubgrant({
      tenantId,
      parentGrantId,
      memberUserId: body.memberUserId,
      scopes: body.scopes as any,
      effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
      effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
      createdByUserId: userId
    });

    return reply.status(201).send({ data: subgrant });
  }
}
