/**
 * Share Controller
 * REST API endpoints for shareable links management
 */
import { Controller, Get, Post, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { ShareService } from './share.service';
import { getTenantId, getOptionalUserId, TenantRequest } from '../../core/validation/tenant';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/share')
export class ShareController {
  constructor(
    @Inject('ShareService') private readonly service: ShareService
  ) {}

  /**
   * GET /api/share - List all share links
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = request.query as any;
    const result = await this.service.findAll(tenantId, {
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
    return { data: result.data, meta: result.pagination };
  }

  /**
   * GET /api/share/:token - Get shareable link data and track view
   */
  @Get('/:token')
  async getShareData(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = request.params;
    const shareLink = await this.service.trackView(token);
    return { data: shareLink };
  }

  /**
   * GET /api/share/:token/validate - Validate share link without tracking view
   */
  @Get('/:token/validate')
  async validateShare(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = request.params;
    const shareLink = await this.service.validate(token);
    return { data: shareLink };
  }

  /**
   * POST /api/share - Create shareable link
   */
  @Post()
  async createShareLink(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getOptionalUserId(request);
    const data = request.body as any;
    const shareLink = await this.service.create(tenantId, userId, data);
    reply.code(201);
    return { data: shareLink };
  }

  /**
   * DELETE /api/share/:token - Revoke share link
   */
  @Delete('/:token')
  async revokeShare(request: TenantRequest & { params: { token: string } }, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getOptionalUserId(request);

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User authentication required to revoke share links' } };
    }

    const { token } = request.params;
    const data = request.body as any;

    await this.service.revoke(tenantId, userId, token, data);

    reply.code(204);
    return;
  }

  /**
   * GET /api/share/resource/:type/:resourceId - Get share links for a resource
   */
  @Get('/resource/:type/:resourceId')
  async getResourceShares(
    request: TenantRequest & { params: { type: string; resourceId: string } },
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request);
    const { type, resourceId } = request.params;
    const shares = await this.service.findActiveByResource(tenantId, type, resourceId);
    return { data: shares };
  }

  /**
   * GET /api/share/my - Get share links created by current user
   */
  @Get('/my')
  async getMyShares(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getOptionalUserId(request);

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User authentication required' } };
    }

    const params = request.query as { page?: string; limit?: string };
    const result = await this.service.findByCreator(tenantId, userId, {
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 20,
    });
    return { data: result.data, meta: result.pagination };
  }
}
