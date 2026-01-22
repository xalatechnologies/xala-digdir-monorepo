/**
 * AMENITIES CONTROLLER
 * 
 * HTTP layer for amenities API.
 * Handles request/response, validation, authorization.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { AmenitiesService } from './amenities.service';
import { z } from 'zod';

// ========================================================================
// VALIDATION SCHEMAS
// ========================================================================

const CreateAmenitySchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  groupCode: z.string().max(50).optional(),
  iconKey: z.string().max(50).optional(),
});

const UpdateAmenitySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  groupCode: z.string().max(50).optional(),
  iconKey: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

const AssignAmenitiesSchema = z.object({
  amenityIds: z.array(z.string().uuid()),
});

// ========================================================================
// CONTROLLER
// ========================================================================

export class AmenitiesController {
  constructor(private readonly service: AmenitiesService) {}

  /**
   * GET /api/amenities
   * List all amenities for tenant
   */
  async listAmenities(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = request.user!.tenantId;
    const userId = request.user!.userId;

    const amenities = await this.service.listAmenities(tenantId, userId);

    reply.code(200).send({
      data: amenities,
      meta: {
        total: amenities.length,
      },
    });
  }

  /**
   * GET /api/amenities/grouped
   * List amenities grouped by category
   */
  async listAmenitiesByGroup(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = request.user!.tenantId;

    const groups = await this.service.listAmenitiesByGroup(tenantId);

    reply.code(200).send({
      data: groups,
    });
  }

  /**
   * GET /api/amenities/:id
   * Get single amenity
   */
  async getAmenity(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const tenantId = request.user!.tenantId;

    const amenity = await this.service.getAmenity(id, tenantId);

    if (!amenity) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Amenity Not Found',
        status: 404,
        detail: `Amenity with ID ${id} not found`,
        instance: request.url,
      });
    }

    reply.code(200).send({
      data: amenity,
    });
  }

  /**
   * POST /api/amenities
   * Create amenity (admin only)
   */
  async createAmenity(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    // Validate request body
    const data = CreateAmenitySchema.parse(request.body);

    const tenantId = request.user!.tenantId;
    const userId = request.user!.userId;

    const amenity = await this.service.createAmenity(data, tenantId, userId);

    reply.code(201).send({
      data: amenity,
    });
  }

  /**
   * PUT /api/amenities/:id
   * Update amenity (admin only)
   */
  async updateAmenity(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const data = UpdateAmenitySchema.parse(request.body);

    const tenantId = request.user!.tenantId;
    const userId = request.user!.userId;

    try {
      const amenity = await this.service.updateAmenity(
        id,
        data,
        tenantId,
        userId
      );

      reply.code(200).send({
        data: amenity,
      });
    } catch (error: any) {
      if (error.message === 'Amenity not found') {
        return reply.code(404).send({
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Amenity Not Found',
          status: 404,
          detail: error.message,
          instance: request.url,
        });
      }
      throw error;
    }
  }

  /**
   * DELETE /api/amenities/:id
   * Delete amenity (soft delete, admin only)
   */
  async deleteAmenity(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const tenantId = request.user!.tenantId;
    const userId = request.user!.userId;

    try {
      await this.service.deleteAmenity(id, tenantId, userId);

      reply.code(204).send();
    } catch (error: any) {
      if (error.message === 'Amenity not found') {
        return reply.code(404).send({
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Amenity Not Found',
          status: 404,
          detail: error.message,
          instance: request.url,
        });
      }
      throw error;
    }
  }

  /**
   * GET /api/rental-objects/:id/amenities
   * Get amenities for rental object
   */
  async getAmenitiesForRentalObject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const tenantId = request.user!.tenantId;

    const amenities = await this.service.getAmenitiesForRentalObject(
      id,
      tenantId
    );

    reply.code(200).send({
      data: amenities,
    });
  }

  /**
   * PUT /api/rental-objects/:id/amenities
   * Assign amenities to rental object (bulk, admin only)
   */
  async assignAmenitiesToRentalObject(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { amenityIds } = AssignAmenitiesSchema.parse(request.body);

    const tenantId = request.user!.tenantId;
    const userId = request.user!.userId;

    await this.service.assignAmenitiesToRentalObject(
      id,
      amenityIds,
      tenantId,
      userId
    );

    reply.code(204).send();
  }
}
