/**
 * AMENITIES ROUTES
 * 
 * Fastify route definitions with authorization guards.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AmenitiesController } from './amenities.controller';
import { AmenitiesService } from './amenities.service';
import { getAuditService } from '../../core/audit/audit.service';
import { requireAuth, requireRole, UserRole } from '../../middleware/rbac';
import { container } from '../../core/container';

export async function amenitiesRoutes(fastify: FastifyInstance) {
  // Get db from container (decorated on fastify instance)
  const db = container.resolve<any>('Database');
  
  // Create audit service adapter that matches service interface
  const auditServiceAdapter = {
    async log(params: { tenantId: string; userId: string; action: string; entityType: string; entityId: string; oldValue?: any; newValue?: any; }) {
      const auditService = getAuditService();
      return auditService.log({
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action as any,
        resource: params.entityType as any,
        resourceId: params.entityId,
        metadata: { oldValue: params.oldValue, newValue: params.newValue },
      });
    }
  };

  const service = new AmenitiesService(db, auditServiceAdapter);
  const controller = new AmenitiesController(service);

  // ========================================================================
  // AMENITIES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/amenities
   * List all amenities
   */
  fastify.get(
    '/amenities',
    { preHandler: [requireAuth] },
    controller.listAmenities.bind(controller)
  );

  /**
   * GET /api/amenities/grouped
   * List amenities grouped by category
   */
  fastify.get(
    '/amenities/grouped',
    { preHandler: [requireAuth] },
    controller.listAmenitiesByGroup.bind(controller)
  );

  /**
   * GET /api/amenities/:id
   * Get single amenity
   */
  fastify.get(
    '/amenities/:id',
    { preHandler: [requireAuth] },
    controller.getAmenity.bind(controller)
  );

  /**
   * POST /api/amenities
   * Create amenity (admin only)
   */
  fastify.post(
    '/amenities',
    { preHandler: [requireAuth, requireRole(UserRole.ADMIN)] },
    controller.createAmenity.bind(controller)
  );

  /**
   * PUT /api/amenities/:id
   * Update amenity (admin only)
   */
  fastify.put(
    '/amenities/:id',
    { preHandler: [requireAuth, requireRole(UserRole.ADMIN)] },
    controller.updateAmenity.bind(controller)
  );

  /**
   * DELETE /api/amenities/:id
   * Delete amenity (admin only)
   */
  fastify.delete(
    '/amenities/:id',
    { preHandler: [requireAuth, requireRole(UserRole.ADMIN)] },
    controller.deleteAmenity.bind(controller)
  );

  // ========================================================================
  // RENTAL OBJECT AMENITIES ENDPOINTS
  // ========================================================================

  /**
   * GET /api/rental-objects/:id/amenities
   * Get amenities for rental object
   */
  fastify.get(
    '/rental-objects/:id/amenities',
    { preHandler: [requireAuth] },
    controller.getAmenitiesForRentalObject.bind(controller)
  );

  /**
   * PUT /api/rental-objects/:id/amenities
   * Assign amenities to rental object (admin only)
   */
  fastify.put(
    '/rental-objects/:id/amenities',
    { preHandler: [requireAuth, requireRole(UserRole.ADMIN)] },
    controller.assignAmenitiesToRentalObject.bind(controller)
  );
}
