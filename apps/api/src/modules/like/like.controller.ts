/**
 * Like Controller
 * REST API endpoints for like (favorite) management
 */
import { Controller, Get, Post, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { LikeService } from './like.service';
import { validate } from '../../core/validation/zod-pipe';
import { getTenantId, TenantRequest } from '../../core/validation/tenant';
import { CreateLikeSchema, LikeQuerySchema } from '../../schemas/like.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/likes')
export class LikeController {
  constructor(
    @Inject('LikeService') private readonly service: LikeService
  ) {}

  /**
   * POST /api/likes - Like a listing
   * Creates a favorite for the authenticated user
   */
  @Post()
  async like(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.userId || (request.headers['x-user-id'] as string);

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const data = validate(CreateLikeSchema, request.body);
    const result = await this.service.like(tenantId, userId, data);
    return reply.status(201).send({ data: result });
  }

  /**
   * DELETE /api/likes/:listingId - Unlike a listing
   * Removes the favorite for the authenticated user
   */
  @Delete('/:listingId')
  async unlike(
    request: FastifyRequest<{ Params: { listingId: string } }> & TenantRequest,
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request as TenantRequest);
    const userId = (request as TenantRequest).userId || (request.headers['x-user-id'] as string);

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    await this.service.unlike(tenantId, userId, request.params.listingId);
    return reply.status(204).send();
  }

  /**
   * GET /api/likes/me - Get user's liked listings
   * Returns paginated list of listings the user has liked
   */
  @Get('/me')
  async getMyLikes(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.userId || (request.headers['x-user-id'] as string);

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const params = validate(LikeQuerySchema, request.query);
    const result = await this.service.findByUser(tenantId, userId, params);
    return { data: result.data, meta: result.pagination };
  }

  /**
   * GET /api/likes/check/:listingId - Check if listing is liked
   * Returns whether the authenticated user has liked this listing
   */
  @Get('/check/:listingId')
  async checkLike(
    request: FastifyRequest<{ Params: { listingId: string } }> & TenantRequest,
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request as TenantRequest);
    const userId = (request as TenantRequest).userId || (request.headers['x-user-id'] as string);

    // Anonymous users get isLiked: false
    if (!userId) {
      return { data: { isLiked: false } };
    }

    const result = await this.service.isLiked(tenantId, userId, request.params.listingId);
    return { data: result };
  }

  /**
   * GET /api/likes/count/:listingId - Get like count for a listing
   * Returns the number of likes for a specific listing (public endpoint)
   */
  @Get('/count/:listingId')
  async getLikeCount(
    request: FastifyRequest<{ Params: { listingId: string } }> & TenantRequest,
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request as TenantRequest);
    const count = await this.service.getLikeCount(tenantId, request.params.listingId);
    return { data: { count } };
  }

  /**
   * POST /api/likes/toggle - Toggle like state
   * Likes if not liked, unlikes if liked
   */
  @Post('/toggle')
  async toggle(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.userId || (request.headers['x-user-id'] as string);

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }

    const data = validate(CreateLikeSchema, request.body);
    const result = await this.service.toggle(tenantId, userId, data.listingId);
    return { data: result };
  }

  /**
   * POST /api/likes/bulk-check - Bulk check liked listings
   * Returns which listingIds from the provided array are liked by the user
   */
  @Post('/bulk-check')
  async bulkCheck(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = request.userId || (request.headers['x-user-id'] as string);

    // Anonymous users get empty array
    if (!userId) {
      return { data: { likedListingIds: [] } };
    }

    const { listingIds } = request.body as { listingIds?: string[] };
    if (!Array.isArray(listingIds)) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'listingIds array required' } };
    }

    const likedListingIds = await this.service.getLikedListingIds(tenantId, userId, listingIds);
    return { data: { likedListingIds } };
  }
}
