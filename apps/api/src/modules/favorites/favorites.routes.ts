import { FastifyInstance } from 'fastify';
import { favoritesController } from './favorites.controller';
import { requireAuth } from '../../middleware/auth';

/**
 * Favorites Routes
 * 
 * Endpoints for managing user favorites/wishlist
 */
export async function favoritesRoutes(fastify: FastifyInstance) {
  // ====================================================================
  // USER FAVORITES
  // ====================================================================

  /**
   * GET /api/me/favorites
   * List current user's favorites with pagination and filters
   */
  fastify.get(
    '/me/favorites',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'List my favorites',
        description: 'Get paginated list of current user\'s favorite rental objects',
        tags: ['Favorites'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            tag: { type: 'string' },
            categoryKey: { type: 'string' },
            sortBy: { type: 'string', enum: ['createdAt', 'name', 'category'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
        response: {
          200: {
            description: 'List of favorites',
            type: 'object',
            properties: {
              data: { type: 'array' },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    favoritesController.listFavorites.bind(favoritesController)
  );

  /**
   * GET /api/me/favorites/count
   * Get total favorite count
   */
  fastify.get(
    '/me/favorites/count',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Get favorite count',
        description: 'Get total number of favorites for current user',
        tags: ['Favorites'],
        response: {
          200: {
            description: 'Favorite count',
            type: 'object',
            properties: {
              count: { type: 'number' },
            },
          },
        },
      },
    },
    favoritesController.getFavoriteCount.bind(favoritesController)
  );

  /**
   * GET /api/me/favorites/:id
   * Get single favorite
   */
  fastify.get(
    '/me/favorites/:id',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Get favorite',
        description: 'Get single favorite by ID',
        tags: ['Favorites'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            description: 'Favorite details',
            type: 'object',
          },
          404: {
            description: 'Favorite not found',
            type: 'object',
          },
        },
      },
    },
    favoritesController.getFavorite.bind(favoritesController)
  );

  /**
   * POST /api/me/favorites
   * Add rental object to favorites
   */
  fastify.post(
    '/me/favorites',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Add favorite',
        description: 'Add rental object to favorites',
        tags: ['Favorites'],
        body: {
          type: 'object',
          required: ['rentalObjectId'],
          properties: {
            rentalObjectId: { type: 'string', format: 'uuid' },
            notes: { type: 'string', maxLength: 500 },
            tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 10 },
          },
        },
        response: {
          201: {
            description: 'Favorite created',
            type: 'object',
          },
          409: {
            description: 'Already favorited',
            type: 'object',
          },
          404: {
            description: 'Rental object not found',
            type: 'object',
          },
        },
      },
    },
    favoritesController.addFavorite.bind(favoritesController)
  );

  /**
   * PATCH /api/me/favorites/:id
   * Update favorite (notes, tags)
   */
  fastify.patch(
    '/me/favorites/:id',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Update favorite',
        description: 'Update favorite notes or tags',
        tags: ['Favorites'],
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
            notes: { type: 'string', maxLength: 500 },
            tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 10 },
          },
        },
        response: {
          200: {
            description: 'Favorite updated',
            type: 'object',
          },
          404: {
            description: 'Favorite not found',
            type: 'object',
          },
        },
      },
    },
    favoritesController.updateFavorite.bind(favoritesController)
  );

  /**
   * DELETE /api/me/favorites/:id
   * Remove favorite by ID
   */
 fastify.delete(
    '/me/favorites/:id',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Remove favorite',
        description: 'Remove favorite by ID',
        tags: ['Favorites'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            description: 'Favorite removed',
            type: 'null',
          },
          404: {
            description: 'Favorite not found',
            type: 'object',
          },
        },
      },
    },
    favoritesController.removeFavorite.bind(favoritesController)
  );

  /**
   * DELETE /api/me/favorites/by-object/:rentalObjectId
   * Remove favorite by rental object ID
   */
  fastify.delete(
    '/me/favorites/by-object/:rentalObjectId',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Remove favorite by object',
        description: 'Remove favorite using rental object ID',
        tags: ['Favorites'],
        params: {
          type: 'object',
          required: ['rentalObjectId'],
          properties: {
            rentalObjectId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            description: 'Favorite removed',
            type: 'null',
          },
          404: {
            description: 'Favorite not found',
            type: 'object',
          },
        },
      },
    },
    favoritesController.removeFavoriteByObjectId.bind(favoritesController)
  );

  /**
   * POST /api/me/favorites/bulk
   * Bulk add favorites
   */
  fastify.post(
    '/me/favorites/bulk',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Bulk add favorites',
        description: 'Add multiple rental objects to favorites at once',
        tags: ['Favorites'],
        body: {
          type: 'object',
          required: ['rentalObjectIds'],
          properties: {
            rentalObjectIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
              maxItems: 50,
            },
          },
        },
        response: {
          200: {
            description: 'Bulk operation result',
            type: 'object',
            properties: {
              success: { type: 'number' },
              failed: { type: 'number' },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    favoritesController.bulkAddFavorites.bind(favoritesController)
  );

  /**
   * DELETE /api/me/favorites/bulk
   * Bulk remove favorites
   */
  fastify.delete(
    '/me/favorites/bulk',
    {
      preHandler: [requireAuth],
      schema: {
        summary: 'Bulk remove favorites',
        description: 'Remove multiple favorites at once',
        tags: ['Favorites'],
        body: {
          type: 'object',
          required: ['favoriteIds'],
          properties: {
            favoriteIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
              maxItems: 50,
            },
          },
        },
        response: {
          200: {
            description: 'Bulk operation result',
            type: 'object',
            properties: {
              success: { type: 'number' },
              failed: { type: 'number' },
            },
          },
        },
      },
    },
    favoritesController.bulkRemoveFavorites.bind(favoritesController)
  );

  // ====================================================================
  // PUBLIC / RENTAL OBJECT ENDPOINTS
  // ====================================================================

  /**
   * GET /api/rental-objects/:id/is-favorited
   * Check if rental object is favorited (public endpoint, optional auth)
   */
  fastify.get(
    '/rental-objects/:id/is-favorited',
    {
      // No auth required - returns false if not authenticated
      schema: {
        summary: 'Check if favorited',
        description: 'Check if rental object is in current user\'s favorites',
        tags: ['Favorites', 'Rental Objects'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            description: 'Favorite status',
            type: 'object',
            properties: {
              isFavorited: { type: 'boolean' },
              favoriteId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
    },
    favoritesController.checkIsFavorited.bind(favoritesController)
  );
}
