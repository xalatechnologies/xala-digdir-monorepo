/**
 * Seasonal Leases Controller
 * Manages seasonal/recurring lease agreements
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, sql, count } from 'drizzle-orm';
import { seasonalLeases, listings, organizations } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/seasonal-leases')
export class SeasonalLeaseController {
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { listingId, organizationId, status, page = 1, limit = 20 } = request.query as any;

    // Build conditions
    const conditions = [];
    if (listingId) conditions.push(eq(seasonalLeases.listingId, listingId));
    if (organizationId) conditions.push(eq(seasonalLeases.organizationId, organizationId));
    if (status) conditions.push(eq(seasonalLeases.status, status));

    const result = await db
      .select({
        id: seasonalLeases.id,
        tenantId: seasonalLeases.tenantId,
        listingId: seasonalLeases.listingId,
        listingName: listings.name,
        organizationId: seasonalLeases.organizationId,
        organizationName: organizations.name,
        startDate: seasonalLeases.startDate,
        endDate: seasonalLeases.endDate,
        weekdays: seasonalLeases.weekdays,
        startTime: seasonalLeases.startTime,
        endTime: seasonalLeases.endTime,
        status: seasonalLeases.status,
        totalPrice: seasonalLeases.totalPrice,
        currency: seasonalLeases.currency,
        notes: seasonalLeases.notes,
        createdAt: seasonalLeases.createdAt,
        updatedAt: seasonalLeases.updatedAt,
      })
      .from(seasonalLeases)
      .leftJoin(listings, eq(seasonalLeases.listingId, listings.id))
      .leftJoin(organizations, eq(seasonalLeases.organizationId, organizations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(seasonalLeases.startDate)
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(seasonalLeases)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = Number(countResult[0]?.count || 0);

    return {
      data: result.map((row: any) => ({
        ...row,
        totalPrice: Number(row.totalPrice || 0),
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select({
        id: seasonalLeases.id,
        tenantId: seasonalLeases.tenantId,
        listingId: seasonalLeases.listingId,
        listingName: listings.name,
        organizationId: seasonalLeases.organizationId,
        organizationName: organizations.name,
        startDate: seasonalLeases.startDate,
        endDate: seasonalLeases.endDate,
        weekdays: seasonalLeases.weekdays,
        startTime: seasonalLeases.startTime,
        endTime: seasonalLeases.endTime,
        status: seasonalLeases.status,
        totalPrice: seasonalLeases.totalPrice,
        currency: seasonalLeases.currency,
        notes: seasonalLeases.notes,
        createdAt: seasonalLeases.createdAt,
        updatedAt: seasonalLeases.updatedAt,
      })
      .from(seasonalLeases)
      .leftJoin(listings, eq(seasonalLeases.listingId, listings.id))
      .leftJoin(organizations, eq(seasonalLeases.organizationId, organizations.id))
      .where(eq(seasonalLeases.id, id));

    if (!result.length) {
      reply.code(404);
      return { error: 'Seasonal lease not found' };
    }

    return { data: result[0] };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(seasonalLeases)
      .values({
        tenantId,
        listingId: body.listingId,
        organizationId: body.organizationId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        weekdays: body.weekdays || [],
        startTime: body.startTime,
        endTime: body.endTime,
        totalPrice: body.totalPrice || 0,
        notes: body.notes || null,
      })
      .returning();

    reply.code(201);
    return { data: result[0] };
  }

  /**
   * GET /api/seasonal-leases/suggestions - Get allocation suggestions
   * KRAV-ADM-05: Regelstyrt forslag til sesongfordeling
   */
  @Get('/suggestions')
  async getSuggestions(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { listingId, season = 'spring2026' } = request.query as any;

    // Get existing leases to understand patterns
    const existingLeases = await db
      .select()
      .from(seasonalLeases)
      .where(listingId ? eq(seasonalLeases.listingId, listingId) : undefined)
      .limit(10);

    // Get organizations that have previously leased
    const orgHistory = await db
      .select({
        organizationId: seasonalLeases.organizationId,
        organizationName: organizations.name,
        leaseCount: count(),
      })
      .from(seasonalLeases)
      .leftJoin(organizations, eq(seasonalLeases.organizationId, organizations.id))
      .groupBy(seasonalLeases.organizationId, organizations.name)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(5);

    // Generate suggestions based on historical patterns
    const suggestions = orgHistory.map((org: any, index: number) => ({
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
        totalLeases: Number(org.leaseCount),
        lastSeason: existingLeases[0]?.endDate || null,
      },
    }));

    return {
      data: {
        season,
        listingId: listingId || 'all',
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

