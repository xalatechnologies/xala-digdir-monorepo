import { FastifyInstance } from 'fastify';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { requireAuth } from '../../middleware/rbac';
import { container } from '../../core/container';

/**
 * Favorites Routes
 * 
 * Endpoints for managing user favorites/wishlist
 */
export async function favoritesRoutes(fastify: FastifyInstance) {
  // Get db from container
  const db = container.resolve<any>('Database');
  const service = new FavoritesService(db);
  const controller = new FavoritesController(service);

  // ====================================================================
  // USER FAVORITES
  // ====================================================================

  fastify.get(
    '/me/favorites',
    { preHandler: [requireAuth] },
    controller.listFavorites.bind(controller)
  );

  fastify.get(
    '/me/favorites/count',
    { preHandler: [requireAuth] },
    controller.getFavoriteCount.bind(controller)
  );

  fastify.get(
    '/me/favorites/:id',
    { preHandler: [requireAuth] },
    controller.getFavorite.bind(controller)
  );

  fastify.post(
    '/me/favorites',
    { preHandler: [requireAuth] },
    controller.addFavorite.bind(controller)
  );

  fastify.patch(
    '/me/favorites/:id',
    { preHandler: [requireAuth] },
    controller.updateFavorite.bind(controller)
  );

  fastify.delete(
    '/me/favorites/:id',
    { preHandler: [requireAuth] },
    controller.removeFavorite.bind(controller)
  );

  fastify.delete(
    '/me/favorites/by-object/:rentalObjectId',
    { preHandler: [requireAuth] },
    controller.removeFavoriteByObjectId.bind(controller)
  );

  // ====================================================================
  // RENTAL OBJECT FAVORITES CHECK
  // ====================================================================

  fastify.get(
    '/rental-objects/:id/is-favorited',
    {}, // No auth required - returns false if not authenticated
    controller.checkIsFavorited.bind(controller)
  );

  // ====================================================================
  // BULK OPERATIONS
  // ====================================================================

  fastify.post(
    '/me/favorites/bulk',
    { preHandler: [requireAuth] },
    controller.bulkAddFavorites.bind(controller)
  );

  fastify.delete(
    '/me/favorites/bulk',
    { preHandler: [requireAuth] },
    controller.bulkRemoveFavorites.bind(controller)
  );
}
