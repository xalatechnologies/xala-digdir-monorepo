/**
 * GDPR Tools Controller (GAP-013)
 * Contract-First endpoints for DSAR and consent management
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { GDPRService } from './gdpr.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/gdpr')
export class GDPRController {
  constructor(
    @Inject('GDPRService') private readonly service: GDPRService
  ) {}

  /**
   * POST /api/gdpr/dsar - Create DSAR request (Contract-First)
   * Returns DSARRequestDTO
   */
  @Post('/dsar')
  async createDSAR(request: FastifyRequest, _reply: FastifyReply) {
    const body = request.body as any;
    const dsar = await this.service.createDSAR(body);
    return { data: dsar };
  }

  /**
   * GET /api/gdpr/dsar/:id - Get DSAR request status
   * Returns DSARRequestDTO
   */
  @Get('/dsar/:id')
  async getDSAR(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const dsar = await this.service.getDSAR(request.params.id);
    return { data: dsar };
  }

  /**
   * GET /api/gdpr/requests/pending - Get pending DSAR requests
   * Returns list
   */
  @Get('/requests/pending')
  async getPendingRequests(request: FastifyRequest, _reply: FastifyReply) {
    try {
      const limit = Number((request.query as any)?.limit) || 5;
      const requests = await this.service.getPendingRequests(limit);
      return { data: requests };
    } catch (error) {
      console.error('Error fetching pending GDPR requests:', error);
      return { data: [] };
    }
  }

  /**
   * GET /api/gdpr/consents - Get user consents (Contract-First)
   * Returns ConsentDTO
   */
  @Get('/consents')
  async getConsents(request: FastifyRequest, _reply: FastifyReply) {
    const userId = (request as any).user?.id || 'current-user';
    const consents = await this.service.getConsents(userId);
    return { data: consents };
  }

  /**
   * PUT /api/gdpr/consents/:type - Update consent
   * Returns ConsentDTO
   */
  @Put('/consents/:type')
  async updateConsent(request: FastifyRequest<{ Params: { type: string } }>, _reply: FastifyReply) {
    const userId = (request as any).user?.id || 'current-user';
    const body = request.body as any;
    const consents = await this.service.updateConsent(userId, request.params.type, body.granted);
    return { data: consents };
  }
}
