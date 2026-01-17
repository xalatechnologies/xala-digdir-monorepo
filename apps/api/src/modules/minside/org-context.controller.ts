/**
 * MinSide Org Context Controller (GAP-010)
 * Contract-First endpoints for organization context in MinSide
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Controller, Get, Post } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { OrgContextService } from './org-context.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/minside')
export class MinSideController {
  constructor(
    @Inject('OrgContextService') private readonly service: OrgContextService
  ) {}

  /**
   * GET /api/minside/org-context - Get user's org context (Contract-First)
   * Returns OrgContextDTO with memberships and active context
   */
  @Get('/org-context')
  async getOrgContext(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user?.id || 'user-id';
    const context = await this.service.getOrgContext(userId);
    return { data: context };
  }

  /**
   * POST /api/minside/org-context - Set active org context (Contract-First)
   * Returns OrgContextDTO
   */
  @Post('/org-context')
  async setOrgContext(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user?.id || 'user-id';
    const body = request.body as any;
    const context = await this.service.setOrgContext(userId, body);
    return { data: context };
  }
}
