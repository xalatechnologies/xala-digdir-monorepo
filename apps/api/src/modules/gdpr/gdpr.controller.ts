/**
 * GDPR Controller
 * REST API endpoints for GDPR data subject rights management
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { GdprService } from './gdpr.service';
import { validate } from '../../core/validation/zod-pipe';
import { getTenantId, getUserId, TenantRequest } from '../../core/validation/tenant';
import {
  CreateGdprRequestSchema,
  UpdateGdprRequestStatusSchema,
  GdprRequestQuerySchema,
} from '../../schemas/gdpr.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';

@Controller('/api/gdpr')
export class GdprController {
  constructor(
    @Inject('GdprService') private readonly service: GdprService
  ) {}

  /**
   * POST /api/gdpr/requests - Create new GDPR request
   */
  @Post('/requests')
  async createRequest(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getUserId(request);
    const data = validate(CreateGdprRequestSchema, request.body);

    // Route to appropriate service method based on request type
    let gdprRequest;
    if (data.requestType === 'export') {
      gdprRequest = await this.service.createExportRequest(tenantId, userId, data);
    } else if (data.requestType === 'deletion') {
      gdprRequest = await this.service.createDeletionRequest(tenantId, userId, data);
    } else {
      reply.code(400);
      return {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Bad Request',
        status: 400,
        detail: 'Invalid request type. Must be "export" or "deletion".',
      };
    }

    return reply.status(201).send({ data: gdprRequest });
  }

  /**
   * GET /api/gdpr/requests - List user's GDPR requests
   */
  @Get('/requests')
  async listRequests(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getUserId(request);
    const params = validate(GdprRequestQuerySchema, request.query);

    // Filter to only show current user's requests
    const result = await this.service.findAll(tenantId, {
      ...params,
      userId, // Force filter by current user
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });

    return {
      data: result.data,
      meta: {
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    };
  }

  /**
   * GET /api/gdpr/requests/pending - List pending GDPR requests (admin)
   */
  @Get('/requests/pending')
  async listPendingRequests(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = validate(GdprRequestQuerySchema, request.query);

    const result = await this.service.findPendingRequests(tenantId, {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });

    return {
      data: result.data,
      meta: {
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    };
  }

  /**
   * GET /api/gdpr/requests/:id - Get single GDPR request
   */
  @Get('/requests/:id')
  async getRequest(
    request: FastifyRequest<{ Params: { id: string } }> & TenantRequest,
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request);
    const userId = getUserId(request);

    const gdprRequest = await this.service.findByIdOrFail(request.params.id);

    // Verify tenant isolation
    if (gdprRequest.tenantId !== tenantId) {
      // Audit failed access attempt
      getAuditService().log({
        tenantId,
        userId,
        action: 'access_denied',
        resource: 'gdpr_request',
        resourceId: request.params.id,
        severity: 'warning',
        metadata: {
          reason: 'cross_tenant_access_attempt',
          requestedTenantId: gdprRequest.tenantId,
        },
      });

      throw new ForbiddenError('You do not have permission to access this request');
    }

    // Verify ownership or admin role
    // Note: request.user should be set by auth middleware
    const user = (request as any).user;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isOwner = gdprRequest.userId === userId;

    if (!isAdmin && !isOwner) {
      // Audit failed access attempt
      getAuditService().log({
        tenantId,
        userId,
        action: 'access_denied',
        resource: 'gdpr_request',
        resourceId: request.params.id,
        severity: 'warning',
        metadata: {
          reason: 'insufficient_permissions',
          isAdmin,
          isOwner,
          requestUserId: gdprRequest.userId,
        },
      });

      throw new ForbiddenError('You do not have permission to access this request');
    }

    return { data: gdprRequest };
  }

  /**
   * PUT /api/gdpr/requests/:id/status - Update request status (admin)
   */
  @Put('/requests/:id/status')
  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }> & TenantRequest,
    reply: FastifyReply
  ) {
    const userId = getUserId(request);
    const data = validate(UpdateGdprRequestStatusSchema, request.body);

    const gdprRequest = await this.service.updateRequestStatus(
      request.params.id,
      data,
      userId
    );

    return { data: gdprRequest };
  }

  /**
   * PUT /api/gdpr/requests/:id/cancel - Cancel request (user)
   */
  @Put('/requests/:id/cancel')
  async cancelRequest(
    request: FastifyRequest<{ Params: { id: string } }> & TenantRequest,
    reply: FastifyReply
  ) {
    const userId = getUserId(request);
    const gdprRequest = await this.service.cancelRequest(request.params.id, userId);
    return { data: gdprRequest };
  }
}
