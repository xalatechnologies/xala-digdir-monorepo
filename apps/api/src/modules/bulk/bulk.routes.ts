import { FastifyInstance } from 'fastify';
import { bulkOperationsController } from './bulk.controller';
import { requireAuth } from '../../middleware/rbac';

/**
 * Bulk Operations Routes
 * 
 * High-efficiency admin endpoints
 */
export async function bulkRoutes(fastify: FastifyInstance) {
  // All bulk operations require admin auth
  fastify.addHook('onRequest', requireAuth);

  // =====================================================================
  // RENTAL OBJECTS
  // =====================================================================

  // Bulk update rental objects
  fastify.post('/admin/rental-objects/bulk', {
    schema: {
      description: 'Bulk update rental objects (publish, archive, etc.)',
      tags: ['admin', 'bulk', 'rental-objects'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['rentalObjectIds', 'action'],
        properties: {
          rentalObjectIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            minItems: 1,
            maxItems: 100,
          },
          action: {
            type: 'string',
            enum: ['publish', 'archive', 'activate', 'deactivate'],
          },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                success: { type: 'number' },
                failed: { type: 'number' },
                action: { type: 'string' },
                processedIds: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    handler: bulkOperationsController.bulkUpdateRentalObjects.bind(bulkOperationsController),
  });

  // Publish rental object
  fastify.patch('/admin/rental-objects/:id/publish', {
    schema: {
      description: 'Publish rental object',
      tags: ['admin', 'rental-objects'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                publishedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: bulkOperationsController.publishRentalObject.bind(bulkOperationsController),
  });

  // Archive rental object
  fastify.patch('/admin/rental-objects/:id/archive', {
    schema: {
      description: 'Archive rental object',
      tags: ['admin', 'rental-objects'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                archivedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: bulkOperationsController.archiveRentalObject.bind(bulkOperationsController),
  });

  // Duplicate rental object
  fastify.post('/admin/rental-objects/:id/duplicate', {
    schema: {
      description: 'Duplicate rental object',
      tags: ['admin', 'rental-objects'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 200 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                originalId: { type: 'string' },
                name: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: bulkOperationsController.duplicateRentalObject.bind(bulkOperationsController),
  });

  // =====================================================================
  // USERS
  // =====================================================================

  // Bulk invite users
  fastify.post('/admin/users/invite-bulk', {
    schema: {
      description: 'Bulk invite users',
      tags: ['admin', 'bulk', 'users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['emails'],
        properties: {
          emails: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            minItems: 1,
            maxItems: 100,
          },
          roleId: { type: 'string', format: 'uuid' },
          organizationId: { type: 'string', format: 'uuid' },
          message: { type: 'string', maxLength: 500 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                success: { type: 'number' },
                failed: { type: 'number' },
                invitedEmails: { type: 'array', items: { type: 'string' } },
                roleId: { type: 'string' },
                organizationId: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: bulkOperationsController.bulkInviteUsers.bind(bulkOperationsController),
  });

  // =====================================================================
  // BOOKINGS
  // =====================================================================

  // Bulk booking actions
  fastify.patch('/admin/bookings/bulk-action', {
    schema: {
      description: 'Bulk approve/reject/cancel bookings',
      tags: ['admin', 'bulk', 'bookings'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['bookingIds', 'action'],
        properties: {
          bookingIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            minItems: 1,
            maxItems: 100,
          },
          action: {
            type: 'string',
            enum: ['approve', 'reject', 'cancel'],
          },
          reason: { type: 'string', maxLength: 500 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                success: { type: 'number' },
                failed: { type: 'number' },
                action: { type: 'string' },
                processedIds: { type: 'array', items: { type: 'string' } },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: bulkOperationsController.bulkBookingsAction.bind(bulkOperationsController),
  });
}
