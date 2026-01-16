/**
 * Seasonal Leases Controller
 * Manages seasonal/recurring lease agreements
 * 
 * Uses repository pattern for clean separation:
 * - Repository handles data access (no direct schema imports)
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSeasonalLeaseRepository } from './seasonal-lease.repository';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/seasonal-leases')
export class SeasonalLeaseController {
  private readonly repository = getSeasonalLeaseRepository();

  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId, organizationId, status, page = 1, limit = 20 } = request.query as any;

    const result = await this.repository.findAll({
      rentalObjectId,
      organizationId,
      status,
      page: Number(page),
      limit: Number(limit),
    });

    return result;
  }

  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;

    const lease = await this.repository.findById(id);

    if (!lease) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Seasonal lease not found',
      };
    }

    return { data: lease };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const lease = await this.repository.create({
      tenantId,
      rentalObjectId: body.rentalObjectId,
      organizationId: body.organizationId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      weekdays: body.weekdays,
      startTime: body.startTime,
      endTime: body.endTime,
      totalPrice: body.totalPrice,
      notes: body.notes,
    });

    reply.code(201);
    return { data: lease };
  }

  /**
   * GET /api/seasonal-leases/suggestions - Get allocation suggestions
   * KRAV-ADM-05: Regelstyrt forslag til sesongfordeling
   */
  @Get('/suggestions')
  async getSuggestions(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId, season = 'spring2026' } = request.query as any;

    // Get organization lease history for suggestions
    const orgHistory = await this.repository.getOrganizationLeaseHistory(rentalObjectId, 5);
    
    // Get recent leases for context
    const existingLeases = await this.repository.getRecentLeases(rentalObjectId, 10);

    // Generate suggestions based on historical patterns
    const suggestions = orgHistory.map((org, index) => ({
      priority: index + 1,
      organizationId: org.organizationId,
      organizationName: org.organizationName,
      suggestedWeekdays: index === 0 ? [1, 3] : index === 1 ? [2, 4] : [5],
      suggestedTimeSlot: {
        startTime: '17:00',
        endTime: '20:00',
      },
      reasoning: `Basert på ${org.leaseCount} tidligere avtaler og prioritet i køen.`,
      historicalUsage: {
        totalLeases: org.leaseCount,
        lastSeason: existingLeases[0]?.endDate || null,
      },
    }));

    return {
      data: {
        season,
        rentalObjectId: rentalObjectId || 'all',
        generatedAt: new Date().toISOString(),
        suggestions: suggestions.length > 0 ? suggestions : [
          {
            priority: 1,
            organizationId: null,
            organizationName: 'Ingen forslag',
            suggestedWeekdays: [],
            suggestedTimeSlot: { startTime: '17:00', endTime: '20:00' },
            reasoning: 'Ingen historiske data tilgjengelig for forslag.',
            historicalUsage: { totalLeases: 0, lastSeason: null },
          },
        ],
        algorithm: 'priority_queue_v1',
        canOverride: true,
      },
    };
  }
}
