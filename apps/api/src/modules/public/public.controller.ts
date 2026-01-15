/**
 * Public Controller
 * No-auth public endpoints for website/widgets
 */
import { Controller, Get, Inject } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, count, desc } from 'drizzle-orm';
import { rentalObjects, bookings, allocations } from '../../database/schema/index';
import { toCardProjections, toDetailsProjection } from '../rental-objects/rental-object.projections';
import { ConfigurationService } from '../configuration/configuration.service';

@Controller('/api/public')
export class PublicController {
  constructor(
    @Inject('ConfigurationService') private readonly configService: ConfigurationService
  ) {}

  /**
   * GET /api/public/rental-objects - Public rental objects (alias for rentalObjects)
   * Returns: ListingCardProjectionDTO[] (screen-ready, flat structure)
   */
  @Get('/rental-objects')
  async getRentalObjects(request: FastifyRequest, reply: FastifyReply) {
    return this.getListings(request, reply);
  }

  /**
   * GET /api/public/rentalObjects - Public listing search
   * Returns: ListingCardProjectionDTO[] (screen-ready, flat structure)
   */
  @Get('/listings')
  async getListings(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { category, city, search, page = 1, limit = 20 } = request.query as any;

    const conditions = [eq(rentalObjects.status, 'published')];
    
    // Note: In production, add city/search filters with proper metadata JSONB queries

    const result = await db
      .select()
      .from(rentalObjects)
      .where(and(...conditions))
      .orderBy(desc(rentalObjects.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    const countResult = await db
      .select({ count: count() })
      .from(rentalObjects)
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
   * GET /api/public/rental-objects/:id - Public rental object details
   */
  @Get('/rental-objects/:id')
  async getRentalObject(request: FastifyRequest, reply: FastifyReply) {
    return this.getListing(request, reply);
  }

  /**
   * GET /api/public/rentalObjects/:id - Public listing details
   */
  @Get('/listings/:id')
  async getListing(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select()
      .from(rentalObjects)
      .where(and(eq(rentalObjects.id, id), eq(rentalObjects.status, 'published')));

    if (!result.length) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Listing not found' } };
    }

    // Transform to screen-ready projection DTO
    return { data: toDetailsProjection(result[0]) };
  }

  /**
   * GET /api/public/rentalObjects/:id/availability - Public availability
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
   * GET /api/public/cities - Cities with rentalObjects
   */
  @Get('/cities')
  async getCities(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    // Get distinct cities from rentalObjects metadata
    const result = await db
      .select({
        metadata: rentalObjects.metadata,
      })
      .from(rentalObjects)
      .where(eq(rentalObjects.status, 'published'));

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
   * GET /api/public/featured - Featured rentalObjects
   */
  @Get('/featured')
  async getFeatured(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');

    const result = await db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        slug: rentalObjects.slug,
        category: rentalObjects.category,
        subcategory: rentalObjects.subcategory,
        description: rentalObjects.description,
        pricing: rentalObjects.pricing,
        images: rentalObjects.images,
        timeMode: rentalObjects.timeMode,
      })
      .from(rentalObjects)
      .where(eq(rentalObjects.status, 'published'))
      .limit(6);

    return { data: result };
  }
}
