/**
 * AMENITIES ROUTES
 * 
 * Fastify route definitions with authorization guards.
 */

import type { FastifyInstance } from 'fastify';
import { AmenitiesController } from './amenities.controller';
import { AmenitiesService } from './amenities.service';
import { AuditService } from '../../core/audit.service';
import { requirePermission } from '../../core/guards/permission.guard';
import { requireAuth } from '../../core/guards/auth.guard';
import { PERMISSIONS } from '../../core/permissions';

export async function amenitiesRoutes(fastify: FastifyInstance) {
  // Initialize service & controller
  const auditService = new AuditService(fastify.db);
  const service = new AmenitiesService(auditService);
  const controller = new AmenitiesController(service);

  // ========================================================================
  // AMENITIES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/amenities
   * List all amenities
   * 
   * Authorization: All authenticated users
   */
  fastify.get(
    '/amenities',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Amenities'],
        summary: 'List amenities',
        response: {
          200: {
            description: 'Amenities list',
            type: 'object',
            properties: {
              data: { type: 'array' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    controller.listAmenities.bind(controller)
  );

  /**
   * GET /api/amenities/grouped
   * List amenities grouped by category
   * 
   * Authorization: All authenticated users
   */
  fastify.get(
    '/amenities/grouped',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Amenities'],
        summary: 'List amenities grouped',
      },
    },
    controller.listAmenitiesByGroup.bind(controller)
  );

  /**
   * GET /api/amenities/:id
   * Get single amenity
   * 
   * Authorization: All authenticated users
   */
  fastify.get(
    '/amenities/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Amenities'],
        summary: 'Get amenity',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.getAmenity.bind(controller)
  );

  /**
   * POST /api/amenities
   * Create amenity
   * 
   * Authorization: TENANT_ADMIN, SUPER_ADMIN
   */
  fastify.post(
    '/amenities',
    {
      preHandler: [requireAuth, requirePermission(PERMISSIONS.AMENITIES_MANAGE)],
      schema: {
        tags: ['Amenities'],
        summary: 'Create amenity',
        body: {
          type: 'object',
          required: ['code', 'name'],
          properties: {
            code: { type: 'string', maxLength: 50 },
            name: { type: 'string', maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            groupCode: { type: 'string', maxLength: 50 },
            iconKey: { type: 'string', maxLength: 50 },
          },
        },
        response: {
          201: {
            description: 'Amenity created',
          },
        },
      },
    },
    controller.createAmenity.bind(controller)
  );

  /**
   * PUT /api/amenities/:id
   * Update amenity
   * 
   * Authorization: TENANT_ADMIN, SUPER_ADMIN
   */
  fastify.put(
    '/amenities/:id',
    {
      preHandler: [requireAuth, requirePermission(PERMISSIONS.AMENITIES_MANAGE)],
      schema: {
        tags: ['Amenities'],
        summary: 'Update amenity',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.updateAmenity.bind(controller)
  );

  /**
   * DELETE /api/amenities/:id
   * Delete amenity (soft delete)
   * 
   * Authorization: TENANT_ADMIN, SUPER_ADMIN
   */
  fastify.delete(
    '/amenities/:id',
    {
      preHandler: [requireAuth, requirePermission(PERMISSIONS.AMENITIES_MANAGE)],
      schema: {
        tags: ['Amenities'],
        summary: 'Delete amenity',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            description: ' Amenity deleted',
          },
        },
      },
    },
    controller.deleteAmenity.bind(controller)
  );

  // ========================================================================
  // RENTAL OBJECT AMENITIES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/rental-objects/:id/amenities
   * Get amenities for rental object
   * 
   * Authorization: All authenticated users
   */
  fastify.get(
    '/rental-objects/:id/amenities',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Rental Objects', 'Amenities'],
        summary: 'Get rental object amenities',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    controller.getAmenitiesForRentalObject.bind(controller)
  );

  /**
   * PUT /api/rental-objects/:id/amenities
   * Assign amenities to rental object (bulk)
   * 
   * Authorization: TENANT_ADMIN, SUPER_ADMIN
   */
  fastify.put(
    '/rental-objects/:id/amenities',
    {
      preHandler: [requireAuth, requirePermission(PERMISSIONS.AMENITIES_MANAGE)],
      schema: {
        tags: ['Rental Objects', 'Amenities'],
        summary: 'Assign amenities to rental object',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['amenityIds'],
          properties: {
            amenityIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
          },
        },
        response: {
          204: {
            description: 'Amenities assigned',
          },
        },
      },
    },
    controller.assignAmenitiesToRentalObject.bind(controller)
  );
}
