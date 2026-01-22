/**
 * ADD-ONS ROUTES
 */

import type { FastifyInstance } from 'fastify';
import { AddOnsController } from './addons.controller';
import { AddOnsService } from './addons.service';
import { getAuditService } from '../../core/audit/audit.service';
import { requireAuth, requireRole, UserRole } from '../../middleware/rbac';
import { container } from '../../core/container';

export async function addonsRoutes(fastify: FastifyInstance) {
  // Get db from container
  const db = container.resolve<any>('Database');
  
  // Create audit service adapter
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

  const service = new AddOnsService(db, auditServiceAdapter);
  const controller = new AddOnsController(service);

  fastify.get('/addons', {
    preHandler: [requireAuth],
    handler: controller.listAddOns.bind(controller),
  });

  fastify.get('/addons/:id', {
    preHandler: [requireAuth],
    handler: controller.getAddOn.bind(controller),
  });

  fastify.post('/addons', {
    preHandler: [requireAuth, requireRole(UserRole.ADMIN)],
    handler: controller.createAddOn.bind(controller),
  });

  fastify.put('/addons/:id', {
    preHandler: [requireAuth, requireRole(UserRole.ADMIN)],
    handler: controller.updateAddOn.bind(controller),
  });

  fastify.delete('/addons/:id', {
    preHandler: [requireAuth, requireRole(UserRole.ADMIN)],
    handler: controller.deleteAddOn.bind(controller),
  });

  fastify.get('/rental-objects/:id/addons', {
    preHandler: [requireAuth],
    handler: controller.getAddOnsForRentalObject.bind(controller),
  });

  fastify.put('/rental-objects/:id/addons', {
    preHandler: [requireAuth, requireRole(UserRole.ADMIN)],
    handler: controller.assignAddOnsToRentalObject.bind(controller),
  });
}
