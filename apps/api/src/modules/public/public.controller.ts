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
    try {
      return await this.getListings(request, reply);
    } catch (error) {
      request.log.error({ error }, 'Failed to fetch rental objects');
      return reply.status(500).send({
        type: '/errors/database',
        title: 'Database Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Failed to query rental objects. Database may need seeding.',
        hint: 'Run: pnpm db:seed:v3',
      });
    }
  }

  /**
   * GET /api/public/rentalObjects - Public rental object search
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
   * GET /api/public/rentalObjects/:id - Public rental object details (deprecated, backward compatibility)
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
      return { error: { code: 'NOT_FOUND', message: 'Rental object not found' } };
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
          eq(allocations.rentalObjectId, id),
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
          eq(bookings.rentalObjectId, id),
          gte(bookings.endTime, start),
          lte(bookings.startTime, end),
          eq(bookings.status, 'confirmed')
        )
      );

    return {
      data: {
        rentalObjectId: id,
        startDate,
        endDate,
        blockedSlots: [...blocked, ...booked],
      },
    };
  }

  /**
   * GET /api/public/categories - List categories
   * Returns hardcoded category list for public consumption
   */
  @Get('/categories')
  async getCategories(_request: FastifyRequest, _reply: FastifyReply) {
    const categories = [
      { id: 'LOKALER_OG_BANER', name: 'Lokaler og baner', nameEn: 'Venues and courts', icon: 'sports', description: 'Sports venues, gyms, and courts' },
      { id: 'KULTURHUS_OG_SCENE', name: 'Kulturhus og scene', nameEn: 'Cultural centers', icon: 'theater', description: 'Cultural centers and stages' },
      { id: 'MØTEROM_OG_KONFERANSE', name: 'Møterom og konferanse', nameEn: 'Meeting rooms', icon: 'meeting', description: 'Meeting rooms and conference venues' },
      { id: 'UTSTYR', name: 'Utstyr', nameEn: 'Equipment', icon: 'equipment', description: 'Equipment and tools' },
      { id: 'TRANSPORT', name: 'Transport', nameEn: 'Transport', icon: 'car', description: 'Vehicles and transportation' },
      { id: 'UTENDØRS', name: 'Utendørs', nameEn: 'Outdoors', icon: 'park', description: 'Outdoor spaces and areas' },
      { id: 'BÅTPLASS', name: 'Båtplass', nameEn: 'Boat slips', icon: 'boat', description: 'Boat slips and marina facilities' },
      { id: 'PARKERING', name: 'Parkering', nameEn: 'Parking', icon: 'parking', description: 'Parking spaces and garages' },
    ];
    return { data: categories };
  }

  /**
   * GET /api/public/cities - Cities with rentalObjects
   */
  @Get('/cities')
  async getCities(request: FastifyRequest, reply: FastifyReply) {
    try {
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
    } catch (error) {
      request.log.error({ error }, 'Failed to fetch cities');
      return reply.status(500).send({
        type: '/errors/database',
        title: 'Database Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Failed to query cities. Database may need seeding.',
        hint: 'Run: pnpm db:seed:v3',
      });
    }
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
        categoryKey: rentalObjects.categoryKey,
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
