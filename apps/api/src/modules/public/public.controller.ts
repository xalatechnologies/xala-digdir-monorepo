/**
 * Public Controller
 * No-auth public endpoints for website/widgets
 */
import { Controller, Get, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, count, desc } from 'drizzle-orm';
import { listings, bookings, allocations } from '../../database/schema/index';
import { toCardProjections, toDetailsProjection } from '../listing/listing.projections';
import { ConfigurationService } from '../configuration/configuration.service';

@Controller('/api/public')
export class PublicController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/public/listings - Public listing search
   * Returns: ListingCardProjectionDTO[] (screen-ready, flat structure)
   */
  @Get('/listings')
  async getListings(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { category, city, search, page = 1, limit = 20 } = request.query as any;

    const conditions = [eq(listings.status, 'published')];
    
    // Note: In production, add city/search filters with proper metadata JSONB queries

    const result = await db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    const countResult = await db
      .select({ count: count() })
      .from(listings)
      .where(and(...conditions));

    // Transform to screen-ready projection DTOs
    const projections = toCardProjections(result);

    return {
      data: projections,
      meta: {
        total: Number(countResult[0]?.count || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / Number(limit)),
      },
    };
  }

  /**
   * GET /api/public/listings/:id - Public listing details
   */
  @Get('/listings/:id')
  async getListing(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, id), eq(listings.status, 'published')));

    if (!result.length) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Listing not found' } };
    }

    // Transform to screen-ready projection DTO
    return { data: toDetailsProjection(result[0]) };
  }

  /**
   * GET /api/public/listings/:id/availability - Public availability
   */
  @Get('/listings/:id/availability')
  async getAvailability(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const { startDate, endDate } = request.query as any;

    if (!startDate || !endDate) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'startDate and endDate required' } };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get blocked times
    const blocked = await db
      .select({
        startTime: allocations.startTime,
        endTime: allocations.endTime,
        status: allocations.status,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.listingId, id),
          gte(allocations.endTime, start),
          lte(allocations.startTime, end)
        )
      );

    const booked = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.listingId, id),
          gte(bookings.endTime, start),
          lte(bookings.startTime, end),
          eq(bookings.status, 'confirmed')
        )
      );

    return {
      data: {
        listingId: id,
        startDate,
        endDate,
        blockedSlots: [...blocked, ...booked],
      },
    };
  }

  /**
   * GET /api/public/categories - List categories
   * Now fetches from database via ConfigurationService
   */
  @Get('/categories')
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.configService.getCategories(false);
    return {
      data: categories.map(cat => ({
        id: cat.code,
        name: cat.name,
        nameEn: cat.nameEn,
        icon: cat.icon,
        description: cat.description,
      })),
    };
  }

  /**
   * GET /api/public/cities - Cities with listings
   */
  @Get('/cities')
  async getCities(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    // Get distinct cities from listings metadata
    const result = await db
      .select({
        metadata: listings.metadata,
      })
      .from(listings)
      .where(eq(listings.status, 'published'));

    const cities = new Set<string>();
    for (const row of result) {
      const city = row.metadata?.city || row.metadata?.location?.city;
      if (city) cities.add(city);
    }

    return {
      data: Array.from(cities).map((city) => ({
        name: city,
        slug: city.toLowerCase().replace(/\s+/g, '-'),
      })),
    };
  }

  /**
   * GET /api/public/featured - Featured listings
   */
  @Get('/featured')
  async getFeatured(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    const result = await db
      .select({
        id: listings.id,
        name: listings.name,
        slug: listings.slug,
        category: listings.category,
        subcategory: listings.subcategory,
        description: listings.description,
        pricing: listings.pricing,
        images: listings.images,
        timeMode: listings.timeMode,
      })
      .from(listings)
      .where(eq(listings.status, 'published'))
      .limit(6);

    return { data: result };
  }
}
