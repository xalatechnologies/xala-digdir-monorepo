/**
 * Discount Codes Controller
 * Manage discount/promo codes
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface DiscountRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// In-memory discount codes storage (in production, use database table)
const discountCodes: Map<string, any> = new Map();

// Initialize with some sample codes
discountCodes.set('WELCOME10', {
  id: crypto.randomUUID(),
  code: 'WELCOME10',
  description: 'Velkommen 10% rabatt',
  type: 'percentage',
  value: 10,
  maxUses: 100,
  usedCount: 5,
  isActive: true,
  createdAt: new Date().toISOString(),
});

discountCodes.set('IDRETT30', {
  id: crypto.randomUUID(),
  code: 'IDRETT30',
  description: 'Idrettslag 30% rabatt',
  type: 'percentage',
  value: 30,
  actorTypes: ['sports_club'],
  isActive: true,
  createdAt: new Date().toISOString(),
});

@Controller('/api/discount-codes')
export class DiscountCodesController {
  /**
   * GET /api/discount-codes - List all discount codes
   */
  @Get()
  async getAll(request: DiscountRequest, reply: FastifyReply) {
    const codes = Array.from(discountCodes.values());
    
    return {
      data: codes,
      meta: {
        total: codes.length,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    };
  }

  /**
   * GET /api/discount-codes/:id - Get single code
   */
  @Get('/:id')
  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    
    // Find by ID or code
    let code = null;
    for (const c of discountCodes.values()) {
      if (c.id === id || c.code === id) {
        code = c;
        break;
      }
    }

    if (!code) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Discount code not found' } };
    }

    return { data: code };
  }

  /**
   * POST /api/discount-codes - Create new code
   */
  @Post()
  async create(request: DiscountRequest, reply: FastifyReply) {
    const body = request.body as any;

    if (!body.code || !body.type || body.value === undefined) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'code, type, and value are required' } };
    }

    if (discountCodes.has(body.code.toUpperCase())) {
      reply.code(409);
      return { error: { code: 'CONFLICT', message: 'Discount code already exists' } };
    }

    const newCode = {
      id: crypto.randomUUID(),
      code: body.code.toUpperCase(),
      description: body.description || null,
      type: body.type,
      value: body.value,
      minBookingValue: body.minBookingValue || null,
      maxUses: body.maxUses || null,
      usedCount: 0,
      validFrom: body.validFrom || null,
      validUntil: body.validUntil || null,
      listingIds: body.listingIds || null,
      actorTypes: body.actorTypes || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    discountCodes.set(newCode.code, newCode);

    reply.code(201);
    return { data: newCode };
  }

  /**
   * PUT /api/discount-codes/:id - Update code
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const body = request.body as any;

    // Find by ID or code
    let code = null;
    let key = null;
    for (const [k, c] of discountCodes.entries()) {
      if (c.id === id || c.code === id) {
        code = c;
        key = k;
        break;
      }
    }

    if (!code) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Discount code not found' } };
    }

    const updatedCode = {
      ...code,
      ...body,
      code: code.code, // Don't allow changing the code
      updatedAt: new Date().toISOString(),
    };

    discountCodes.set(key!, updatedCode);

    return { data: updatedCode };
  }

  /**
   * DELETE /api/discount-codes/:id - Delete code
   */
  @Delete('/:id')
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    // Find by ID or code
    let key = null;
    for (const [k, c] of discountCodes.entries()) {
      if (c.id === id || c.code === id) {
        key = k;
        break;
      }
    }

    if (!key) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Discount code not found' } };
    }

    discountCodes.delete(key);

    return { success: true };
  }

  /**
   * POST /api/discount-codes/validate - Validate a code
   */
  @Post('/validate')
  async validate(request: DiscountRequest, reply: FastifyReply) {
    const { code, rentalObjectId, bookingValue } = request.body as any;

    if (!code) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'code is required' } };
    }

    const discountCode = discountCodes.get(code.toUpperCase());

    if (!discountCode) {
      return { data: { valid: false, reason: 'Koden finnes ikke' } };
    }

    if (!discountCode.isActive) {
      return { data: { valid: false, reason: 'Koden er ikke aktiv' } };
    }

    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return { data: { valid: false, reason: 'Koden har nådd maks antall bruk' } };
    }

    if (discountCode.validFrom && new Date(discountCode.validFrom) > new Date()) {
      return { data: { valid: false, reason: 'Koden er ikke gyldig ennå' } };
    }

    if (discountCode.validUntil && new Date(discountCode.validUntil) < new Date()) {
      return { data: { valid: false, reason: 'Koden har utløpt' } };
    }

    if (discountCode.minBookingValue && bookingValue && bookingValue < discountCode.minBookingValue) {
      return { data: { valid: false, reason: `Minimum bestillingsverdi er ${discountCode.minBookingValue} NOK` } };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (bookingValue) {
      if (discountCode.type === 'percentage') {
        discountAmount = Math.round(bookingValue * (discountCode.value / 100));
      } else {
        discountAmount = discountCode.value;
      }
    }

    return {
      data: {
        valid: true,
        code: discountCode,
        discountAmount,
      },
    };
  }
}
