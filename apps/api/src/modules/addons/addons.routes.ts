/**
 * ADD-ONS ROUTES
 */

import type { FastifyInstance } from 'fastify';
import { AddOnsController } from './addons.controller';
import { AddOnsService } from './addons.service';
import { AuditService } from '../../core/audit.service';
import { requirePermission } from '../../core/guards/permission.guard';
import { requireAuth } from '../../core/guards/auth.guard';
import { PERMISSIONS } from '../../core/permissions';

export async function addonsRoutes(fastify: FastifyInstance) {
  const auditService = new AuditService(fastify.db);
  const service = new AddOnsService(auditService);
  const controller = new AddOnsController(service);

  fastify.get(
    '/addons',
    { preHandler: [requireAuth], schema: { tags: ['Add-ons'] } },
    controller.listAddOns.bind(controller)
  );

  fastify.get(
    '/addons/:id',
    { preHandler: [requireAuth], schema: { tags: ['Add-ons'] } },
    controller.getAddOn.bind(controller)
  );

  fastify.post(
    '/addons',
    { preHandler: [requireAuth, requirePermission(PERMISSIONS.ADDONS_MANAGE)], schema: { tags: ['Add-ons'] } },
    controller.createAddOn.bind(controller)
  );

  fastify.put(
    '/addons/:id',
    { preHandler: [requireAuth, requirePermission(PERMISSIONS.ADDONS_MANAGE)], schema: { tags: ['Add-ons'] } },
    controller.updateAddOn.bind(controller)
  );

  fastify.delete(
    '/addons/:id',
    { preHandler: [requireAuth, requirePermission(PERMISSIONS.ADDONS_MANAGE)], schema: { tags: ['Add-ons'] } },
    controller.deleteAddOn.bind(controller)
  );

  fastify.get(
    '/rental-objects/:id/addons',
    { preHandler: [requireAuth], schema: { tags: ['Rental Objects', 'Add-ons'] } },
    controller.getAddOnsForRentalObject.bind(controller)
  );

  fastify.put(
    '/rental-objects/:id/addons',
    { preHandler: [requireAuth, requirePermission(PERMISSIONS.ADDONS_MANAGE)], schema: { tags: ['Rental Objects', 'Add-ons'] } },
    controller.assignAddOnsToRentalObject.bind(controller)
  );
}
