/**
 * Booking Contracts Controller
 * Contract-First endpoints for booking engine
 * 
 * These endpoints return DTOs that drive the booking UI.
 * NO business logic in UI - all computation happens here.
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { Controller, Post } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { BookingContractsService } from './booking-contracts.service';
import { validate } from '../../core/validation/zod-pipe';
import {
  PricePreviewRequestSchema,
  RecurringPreviewRequestSchema,
} from '../../schemas/booking-contracts.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/bookings')
export class BookingContractsController {
  constructor(
    @Inject('BookingContractsService') private readonly service: BookingContractsService
  ) {}

  /**
   * POST /api/bookings/preview-price - Get price preview (Contract-First)
   * Returns PricePreviewDTO with complete breakdown
   * 
   * Request body: PricePreviewRequest
   * Response: { data: PricePreviewDTO }
   */
  @Post('/preview-price')
  async previewPrice(request: FastifyRequest, _reply: FastifyReply) {
    const body = validate(PricePreviewRequestSchema, request.body);
    const preview = await this.service.previewPrice(body);
    return { data: preview };
  }

  /**
   * POST /api/bookings/recurring/preview - Get recurring booking preview (Contract-First)
   * Returns RecurringPreviewDTO with conflicts and alternatives
   * 
   * Request body: RecurringPreviewRequest
   * Response: { data: RecurringPreviewDTO }
   */
  @Post('/recurring/preview')
  async previewRecurring(request: FastifyRequest, _reply: FastifyReply) {
    const body = validate(RecurringPreviewRequestSchema, request.body);
    const preview = await this.service.previewRecurring(body);
    return { data: preview };
  }
}
