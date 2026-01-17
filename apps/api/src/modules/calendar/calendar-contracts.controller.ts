/**
 * Calendar Contracts Controller
 * Contract-First endpoints for calendar views and blocks
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { Controller, Get, Post, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { CalendarContractsService } from './calendar-contracts.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/calendar')
export class CalendarContractsController {
  constructor(
    @Inject('CalendarContractsService') private readonly service: CalendarContractsService
  ) {}

  /**
   * GET /api/calendar/rental-objects/:id - Get calendar data (Contract-First)
   * Returns CalendarDataDTO with availability status annotations
   * 
   * Query params: view, startDate, endDate
   * Response: { data: CalendarDataDTO }
   */
  @Get('/rental-objects/:id')
  async getCalendar(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const { view, startDate, endDate } = request.query as any;
    const calendar = await this.service.getCalendar(
      request.params.id,
      view || 'WEEK',
      startDate,
      endDate
    );
    return { data: calendar };
  }
}

@Controller('/api/blocks')
export class BlocksController {
  constructor(
    @Inject('CalendarContractsService') private readonly service: CalendarContractsService
  ) {}

  /**
   * POST /api/blocks - Create maintenance/closure block (Contract-First)
   * Returns BlockDTO
   */
  @Post()
  async createBlock(request: FastifyRequest, _reply: FastifyReply) {
    const body = request.body as any;
    const block = await this.service.createBlock(body);
    return { data: block };
  }

  /**
   * GET /api/blocks - List blocks for rental object
   * Query params: rentalObjectId, startDate, endDate
   */
  @Get()
  async listBlocks(request: FastifyRequest, _reply: FastifyReply) {
    const { rentalObjectId, startDate, endDate } = request.query as any;
    const blocks = await this.service.listBlocks(rentalObjectId, startDate, endDate);
    return { data: blocks };
  }

  /**
   * DELETE /api/blocks/:id - Delete block
   */
  @Delete('/:id')
  async deleteBlock(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    await this.service.deleteBlock(request.params.id);
    return { success: true };
  }
}
