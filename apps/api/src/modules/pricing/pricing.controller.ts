/**
 * Pricing Controller
 * POST /pricing/quote - Calculate price server-side
 */

import { Controller, Post } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { PricingService } from './pricing.service';
import { validate } from '../../core/validation/zod-pipe';
import { PricingQuoteRequestSchema } from '../../schemas/pricing.schema';
import { createProblemDetails } from '../../core/errors/problem-details';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/pricing')
export class PricingController {
  constructor(
    @Inject('PricingService') private readonly pricingService: PricingService
  ) {}

  /**
   * POST /pricing/quote
   * Calculate pricing for a booking request
   * 
   * All pricing logic lives server-side (SDK-first principle)
   */
  @Post('/quote')
  async calculateQuote(request: FastifyRequest, reply: FastifyReply) {
    try {
      const quoteRequest = validate(PricingQuoteRequestSchema, request.body);

      const quote = await this.pricingService.calculateQuote({
        rentalObjectId: quoteRequest.rentalObjectId,
        start: quoteRequest.start,
        end: quoteRequest.end,
        userGroupId: quoteRequest.userGroupId,
        units: quoteRequest.units,
      });
      
      return reply.send({
        data: quote,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send(createProblemDetails({
          type: 'validation-error',
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid quote request',
          instance: '/pricing/quote',
        }));
      }

      return reply.status(500).send(createProblemDetails({
        type: 'internal-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to calculate quote',
        instance: '/pricing/quote',
      }));
    }
  }
}

export default PricingController;
