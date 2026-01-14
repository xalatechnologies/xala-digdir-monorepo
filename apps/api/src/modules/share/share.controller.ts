/**
 * Share Controller
 * Shareable links for bookings and listings
 */
import { Controller, Get, Post } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

// In-memory share tokens (use database in production)
const shareTokens: Map<string, any> = new Map();

@Controller('/api/share')
export class ShareController {
  /**
   * GET /api/share/:token - Get shareable link data
   */
  @Get('/:token')
  async getShareData(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = request.params;

    const shareData = shareTokens.get(token);

    if (!shareData) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Share link not found or expired' } };
    }

    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      shareTokens.delete(token);
      reply.code(410);
      return { error: { code: 'EXPIRED', message: 'Share link has expired' } };
    }

    return { data: shareData };
  }

  /**
   * POST /api/share - Create shareable link
   */
  @Post()
  async createShareLink(request: FastifyRequest, reply: FastifyReply) {
    const { type, resourceId, expiresIn } = request.body as any;

    if (!type || !resourceId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'type and resourceId are required' } };
    }

    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days default

    const shareData = {
      token,
      type,
      resourceId,
      expiresAt,
      createdAt: new Date().toISOString(),
      url: `https://digilist.no/share/${token}`,
    };

    shareTokens.set(token, shareData);

    reply.code(201);
    return { data: shareData };
  }
}
