import { FastifyRequest, FastifyReply } from 'fastify';
import { favoritesService } from './favorites.service';
import {
  CreateFavoriteSchema,
  UpdateFavoriteSchema,
  ListFavoritesQuerySchema,
  BulkAddFavoritesSchema,
  BulkRemoveFavoritesSchema,
} from '../../schemas/favorites.schema';

/**
 * Favorites Controller
 * 
 * HTTP handlers for favorites/wishlist endpoints
 */
export class FavoritesController {
  /**
   * GET /api/me/favorites
   * List current user's favorites
   */
  async listFavorites(
    request: FastifyRequest<{
      Querystring: unknown;
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      // Validate query parameters
      const query = ListFavoritesQuerySchema.parse(request.query);

      const result = await favoritesService.listFavorites(
        userId,
        tenantId,
        query
      );

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error({ error }, 'List favorites error');
      
      if (error instanceof Error && error.message.includes('validation')) {
        return reply.code(400).send({
          type: 'https://digilist.no/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: error.message,
        });
      }

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while fetching favorites',
      });
    }
  }

  /**
   * GET /api/me/favorites/:id
   * Get single favorite by ID
   */
  async getFavorite(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { id } = request.params;

      const favorite = await favoritesService.getFavoriteById(id, userId);

      return reply.code(200).send(favorite);
    } catch (error) {
      request.log.error({ error }, 'Get favorite error');

      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({
          type: 'https://digilist.no/errors/not-found',
          title: 'Favorite Not Found',
          status: 404,
          detail: 'The requested favorite does not exist',
        });
      }

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while fetching the favorite',
      });
    }
  }

  /**
   * POST /api/me/favorites
   * Add rental object to favorites
   */
  async addFavorite(
    request: FastifyRequest<{
      Body: unknown;
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      // Validate request body
      const data = CreateFavoriteSchema.parse(request.body);

      const favorite = await favoritesService.addFavorite(
        userId,
        tenantId,
        data
      );

      return reply.code(201).send(favorite);
    } catch (error) {
      request.log.error({ error }, 'Add favorite error');

      if (error instanceof Error) {
        if (error.message === 'ALREADY_FAVORITED') {
          return reply.code(409).send({
            type: 'https://digilist.no/errors/conflict',
            title: 'Already Favorited',
            status: 409,
            detail: 'This rental object is already in your favorites',
          });
        }

        if (error.message === 'RENTAL_OBJECT_NOT_FOUND') {
          return reply.code(404).send({
            type: 'https://digilist.no/errors/not-found',
            title: 'Rental Object Not Found',
            status: 404,
            detail: 'The rental object does not exist',
          });
        }

        if (error.message.includes('validation')) {
          return reply.code(400).send({
            type: 'https://digilist.no/errors/validation',
            title: 'Validation Error',
            status: 400,
            detail: error.message,
          });
        }
      }

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while adding the favorite',
      });
    }
  }

  /**
   * PATCH /api/me/favorites/:id
   * Update favorite (notes, tags)
   */
  async updateFavorite(
    request: FastifyRequest<{
      Params: { id: string };
      Body: unknown;
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { id } = request.params;

      // Validate request body
      const data = UpdateFavoriteSchema.parse(request.body);

      const favorite = await favoritesService.updateFavorite(id, userId, data);

      return reply.code(200).send(favorite);
    } catch (error) {
      request.log.error({ error }, 'Update favorite error');

      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({
          type: 'https://digilist.no/errors/not-found',
          title: 'Favorite Not Found',
          status: 404,
          detail: 'The favorite does not exist',
        });
      }

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while updating the favorite',
      });
    }
  }

  /**
   * DELETE /api/me/favorites/:id
   * Remove favorite by ID
   */
  async removeFavorite(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { id } = request.params;

      await favoritesService.removeFavorite(id, userId);

      return reply.code(204).send();
    } catch (error) {
      request.log.error({ error }, 'Remove favorite error');

      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({
          type: 'https://digilist.no/errors/not-found',
          title: 'Favorite Not Found',
          status: 404,
          detail: 'The favorite does not exist',
        });
      }

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while removing the favorite',
      });
    }
  }

  /**
   * DELETE /api/me/favorites/by-object/:rentalObjectId
   * Remove favorite by rental object ID
   */
  async removeFavoriteByObjectId(
    request: FastifyRequest<{
      Params: { rentalObjectId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { rentalObjectId } = request.params;

      await favoritesService.removeFavoriteByObjectId(rentalObjectId, userId);

      return reply.code(204).send();
    } catch (error) {
      request.log.error({ error }, 'Remove favorite by object error');

      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({
          type: 'https://digilist.no/errors/not-found',
          title: 'Favorite Not Found',
          status: 404,
          detail: 'This rental object is not in your favorites',
        });
      }

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while removing the favorite',
      });
    }
  }

  /**
   * GET /api/rental-objects/:id/is-favorited
   * Check if rental object is favorited by current user
   */
  async checkIsFavorited(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;

      // If not authenticated, return false
      if (!userId) {
        return reply.code(200).send({ isFavorited: false });
      }

      const { id: rentalObjectId } = request.params;

      const result = await favoritesService.isFavorited(rentalObjectId, userId);

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error({ error }, 'Check is favorited error');

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while checking favorite status',
      });
    }
  }

  /**
   * POST /api/me/favorites/bulk
   * Bulk add favorites
   */
  async bulkAddFavorites(
    request: FastifyRequest<{
      Body: unknown;
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      // Validate request body
      const data = BulkAddFavoritesSchema.parse(request.body);

      const result = await favoritesService.bulkAddFavorites(
        userId,
        tenantId,
        data
      );

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error({ error }, 'Bulk add favorites error');

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while adding favorites',
      });
    }
  }

  /**
   * DELETE /api/me/favorites/bulk
   * Bulk remove favorites
   */
  async bulkRemoveFavorites(
    request: FastifyRequest<{
      Body: unknown;
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;

      // Validate request body
      const data = BulkRemoveFavoritesSchema.parse(request.body);

      const result = await favoritesService.bulkRemoveFavorites(userId, data);

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error({ error }, 'Bulk remove favorites error');

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while removing favorites',
      });
    }
  }

  /**
   * GET /api/me/favorites/count
   * Get total favorite count for user
   */
  async getFavoriteCount(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;

      const count = await favoritesService.getFavoriteCount(userId);

      return reply.code(200).send({ count });
    } catch (error) {
      request.log.error({ error }, 'Get favorite count error');

      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An error occurred while counting favorites',
      });
    }
  }
}

// Export singleton instance
export const favoritesController = new FavoritesController();
