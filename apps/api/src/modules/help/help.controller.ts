/**
 * Help System Controller (GAP-008)
 * Contract-First endpoints for help system with TOC
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Controller, Get } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { HelpService } from './help.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/help')
export class HelpController {
  constructor(
    @Inject('HelpService') private readonly service: HelpService
  ) {}

  /**
   * GET /api/help/toc - Get table of contents (Contract-First)
   * Returns HelpTOCDTO with sections and quick links
   */
  @Get('/toc')
  async getTOC(_request: FastifyRequest, _reply: FastifyReply) {
    const toc = await this.service.getTOC();
    return { data: toc };
  }

  /**
   * GET /api/help/articles/:slug - Get help article (Contract-First)
   * Returns HelpArticleDTO with content and related articles
   */
  @Get('/articles/:slug')
  async getArticle(request: FastifyRequest<{ Params: { slug: string } }>, _reply: FastifyReply) {
    const article = await this.service.getArticle(request.params.slug);
    return { data: article };
  }

  /**
   * POST /api/help/search - Search help articles
   * Returns filtered HelpArticleDTO[]
   */
  @Get('/search')
  async search(request: FastifyRequest, _reply: FastifyReply) {
    const { q } = request.query as any;
    const results = await this.service.search(q);
    return { data: results };
  }
}
