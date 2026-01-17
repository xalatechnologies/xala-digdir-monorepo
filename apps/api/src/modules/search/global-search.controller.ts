/**
 * Global Search Controller (GAP-009)
 * Contract-First endpoints for global search with RBAC
 *
 * Endpoints:
 * - GET /api/search - Global search across all entities
 * - POST /api/search - Global search (for complex queries)
 * - GET /api/search/typeahead - Typeahead suggestions
 *
 * Reference: packages/client-sdk/src/types/search.ts
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  GlobalSearchService,
  createGlobalSearchService,
  type SearchRequest,
  type SearchEntityType,
} from './global-search.service';

// =============================================================================
// Types
// =============================================================================

interface SearchQueryParams {
  query?: string;
  q?: string; // Alias for query
  types?: string; // Comma-separated list of entity types
  status?: string;
  categoryKey?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
}

interface TypeaheadQueryParams {
  query?: string;
  q?: string;
  entityType?: SearchEntityType;
  limit?: string;
}

interface AuthenticatedUser {
  id: string;
  tenantId: string;
  role: string;
}

// =============================================================================
// Controller
// =============================================================================

export class GlobalSearchController {
  private service: GlobalSearchService | null = null;

  /**
   * Register routes with Fastify
   */
  static register(fastify: any, db: any): void {
    const controller = new GlobalSearchController();
    const service = createGlobalSearchService(db);
    controller.service = service;

    // GET /api/search - Global search
    fastify.get('/api/search', {
      preHandler: [fastify.authenticate],
      handler: controller.search.bind(controller),
    });

    // POST /api/search - Global search (complex queries)
    fastify.post('/api/search', {
      preHandler: [fastify.authenticate],
      handler: controller.searchPost.bind(controller),
    });

    // GET /api/search/typeahead - Typeahead suggestions
    fastify.get('/api/search/typeahead', {
      preHandler: [fastify.authenticate],
      handler: controller.typeahead.bind(controller),
    });
  }

  /**
   * GET /api/search
   * Global search with query parameters
   */
  async search(
    request: FastifyRequest<{ Querystring: SearchQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user as AuthenticatedUser;

    if (!user?.tenantId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required for search',
      });
    }

    const { query, q, types, status, categoryKey, dateFrom, dateTo, page, limit } =
      request.query;

    const searchQuery = query || q || '';

    // Parse types
    let entityTypes: SearchEntityType[] | undefined;
    if (types) {
      entityTypes = types.split(',').filter((t) =>
        ['rental_object', 'booking', 'organization', 'user'].includes(t)
      ) as SearchEntityType[];
    }

    const searchRequest: SearchRequest = {
      query: searchQuery,
      types: entityTypes,
      filters: {
        status,
        categoryKey,
        dateFrom,
        dateTo,
      },
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
    };

    const results = await this.service!.search(searchRequest, {
      tenantId: user.tenantId,
      userId: user.id,
    });

    return reply.send({ data: results });
  }

  /**
   * POST /api/search
   * Global search with request body (for complex queries)
   */
  async searchPost(
    request: FastifyRequest<{ Body: SearchRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user as AuthenticatedUser;

    if (!user?.tenantId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required for search',
      });
    }

    const body = request.body;

    // Validate and sanitize
    const searchRequest: SearchRequest = {
      query: body.query || '',
      types: body.types,
      filters: body.filters,
      page: body.page || 1,
      limit: Math.min(body.limit || 20, 100),
    };

    const results = await this.service!.search(searchRequest, {
      tenantId: user.tenantId,
      userId: user.id,
    });

    return reply.send({ data: results });
  }

  /**
   * GET /api/search/typeahead
   * Typeahead suggestions for autocomplete
   */
  async typeahead(
    request: FastifyRequest<{ Querystring: TypeaheadQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user as AuthenticatedUser;

    if (!user?.tenantId) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required for typeahead',
      });
    }

    const { query, q, entityType, limit } = request.query;
    const searchQuery = query || q || '';

    const results = await this.service!.typeahead(
      searchQuery,
      { tenantId: user.tenantId },
      {
        entityType,
        limit: limit ? Math.min(parseInt(limit, 10), 20) : 8,
      }
    );

    return reply.send({ data: results });
  }
}

// Export for registration
export default GlobalSearchController;
