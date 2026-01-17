/**
 * Global Search Controller (GAP-009)
 * Contract-First endpoints for global search with RBAC
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Controller, Post } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { GlobalSearchService } from './global-search.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/search')
export class GlobalSearchController {
  constructor(
    @Inject('GlobalSearchService') private readonly service: GlobalSearchService
  ) {}

  /**
   * POST /api/search/global - Global search (Contract-First)
   * Returns SearchResultsDTO with categorized results
   */
  @Post('/global')
  async search(request: FastifyRequest, _reply: FastifyReply) {
    const body = request.body as any;
    const results = await this.service.search(body);
    return { data: results };
  }
}
