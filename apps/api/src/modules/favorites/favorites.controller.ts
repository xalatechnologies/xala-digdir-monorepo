import { FastifyRequest, FastifyReply } from 'fastify';
import { FavoritesService } from './favorites.service';
import {
  CreateFavoriteSchema,
  UpdateFavoriteSchema,
  ListFavoritesQuerySchema,
  BulkAddFavoritesSchema,
  BulkRemoveFavoritesSchema,
} from '@digilist/contracts/schemas';

/**
 * Favorites Controller
 * 
 * HTTP handlers for favorites/wishlist endpoints
 */
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  /**
   * GET /api/me/favorites
   * List current user's favorites
   */
  async listFavorites(request: FastifyRequest<{ Querystring: unknown }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const tenantId = request.user!.tenantId;
      const query = ListFavoritesQuerySchema.parse(request.query);
      const result = await this.service.listFavorites(userId, tenantId, query);
      return reply.code(200).send(result);
    } catch (error) {
      request.log.error({ error }, 'List favorites error');
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
   */
  async getFavorite(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { id } = request.params;
      const favorite = await this.service.getFavoriteById(id, userId);
      return reply.code(200).send(favorite);
    } catch (error) {
      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({ type: 'not-found', title: 'Favorite Not Found', status: 404 });
      }
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * POST /api/me/favorites
   */
  async addFavorite(request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const tenantId = request.user!.tenantId;
      const data = CreateFavoriteSchema.parse(request.body);
      const favorite = await this.service.addFavorite(userId, tenantId, data);
      return reply.code(201).send(favorite);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'ALREADY_FAVORITED') {
          return reply.code(409).send({ type: 'conflict', title: 'Already Favorited', status: 409 });
        }
        if (error.message === 'RENTAL_OBJECT_NOT_FOUND') {
          return reply.code(404).send({ type: 'not-found', title: 'Rental Object Not Found', status: 404 });
        }
      }
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * PATCH /api/me/favorites/:id
   */
  async updateFavorite(request: FastifyRequest<{ Params: { id: string }; Body: unknown }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { id } = request.params;
      const data = UpdateFavoriteSchema.parse(request.body);
      const favorite = await this.service.updateFavorite(id, userId, data);
      return reply.code(200).send(favorite);
    } catch (error) {
      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({ type: 'not-found', title: 'Favorite Not Found', status: 404 });
      }
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * DELETE /api/me/favorites/:id
   */
  async removeFavorite(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { id } = request.params;
      await this.service.removeFavorite(id, userId);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({ type: 'not-found', title: 'Favorite Not Found', status: 404 });
      }
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * DELETE /api/me/favorites/by-object/:rentalObjectId
   */
  async removeFavoriteByObjectId(request: FastifyRequest<{ Params: { rentalObjectId: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { rentalObjectId } = request.params;
      await this.service.removeFavoriteByObjectId(rentalObjectId, userId);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'FAVORITE_NOT_FOUND') {
        return reply.code(404).send({ type: 'not-found', title: 'Not in favorites', status: 404 });
      }
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * GET /api/rental-objects/:id/is-favorited
   */
  async checkIsFavorited(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.userId;
    if (!userId) {
      return reply.code(200).send({ isFavorited: false });
    }
    const { id: rentalObjectId } = request.params;
    const result = await this.service.isFavorited(rentalObjectId, userId);
    return reply.code(200).send(result);
  }

  /**
   * POST /api/me/favorites/bulk
   */
  async bulkAddFavorites(request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const tenantId = request.user!.tenantId;
      const data = BulkAddFavoritesSchema.parse(request.body);
      const result = await this.service.bulkAddFavorites(userId, tenantId, data);
      return reply.code(200).send(result);
    } catch (error) {
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * DELETE /api/me/favorites/bulk
   */
  async bulkRemoveFavorites(request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const data = BulkRemoveFavoritesSchema.parse(request.body);
      const result = await this.service.bulkRemoveFavorites(userId, data);
      return reply.code(200).send(result);
    } catch (error) {
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }

  /**
   * GET /api/me/favorites/count
   */
  async getFavoriteCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const count = await this.service.getFavoriteCount(userId);
      return reply.code(200).send({ count });
    } catch (error) {
      return reply.code(500).send({ type: 'internal', title: 'Error', status: 500 });
    }
  }
}
