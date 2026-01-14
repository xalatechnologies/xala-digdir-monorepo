/**
 * Search Controller
 * Search-related endpoints
 * 
 * Endpoints:
 * - GET /api/search - Full-text search across listings
 * - GET /api/search/recent - Get recent searches for current user
 * - POST /api/search/recent - Save a recent search
 * - DELETE /api/search/recent - Clear recent searches
 */

import { Controller, Get, Post, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface RecentSearch {
  id: string;
  query: string;
  filters?: Record<string, unknown>;
  timestamp: string;
  resultCount: number;
}

// Mock recent searches per session
const userRecentSearches: Map<string, RecentSearch[]> = new Map();

// Initialize some demo searches
userRecentSearches.set('demo-user', [
  { id: 'rs-1', query: 'gymsal', timestamp: new Date(Date.now() - 3600000).toISOString(), resultCount: 8, filters: { category: 'GYMSAL' } },
  { id: 'rs-2', query: 'grendehus', timestamp: new Date(Date.now() - 7200000).toISOString(), resultCount: 15, filters: { category: 'GRENDEHUS' } },
  { id: 'rs-3', query: 'møterom skien', timestamp: new Date(Date.now() - 86400000).toISOString(), resultCount: 5, filters: { city: 'Skien' } },
]);

@Controller('/api/search')
export class SearchController {
  /**
   * GET /api/search
   * Full-text search across listings
   */
  @Get()
  async search(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { q?: string; category?: string; city?: string; limit?: string; offset?: string };
    
    // Basic mock response - in production would use full-text search
    return reply.send({
      data: [],
      meta: {
        query: query.q || '',
        filters: { category: query.category, city: query.city },
        total: 0,
        limit: parseInt(query.limit || '20'),
        offset: parseInt(query.offset || '0'),
      },
    });
  }

  /**
   * GET /api/search/recent
   * Get recent searches for current user
   */
  @Get('/recent')
  async getRecentSearches(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string };
    const limit = parseInt(query.limit || '5', 10);
    
    // Get user ID from auth context or use demo user
    const userId = 'demo-user';
    
    const searches = userRecentSearches.get(userId) || [];
    const recentSearches = searches
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return reply.send({
      data: recentSearches,
      meta: {
        total: searches.length,
        limit,
      },
    });
  }

  /**
   * POST /api/search/recent
   * Save a recent search
   */
  @Post('/recent')
  async saveRecentSearch(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { query: string; filters?: Record<string, unknown>; resultCount?: number };
    const userId = 'demo-user';
    
    const searches = userRecentSearches.get(userId) || [];
    
    const newSearch: RecentSearch = {
      id: `rs-${Date.now()}`,
      query: body.query,
      filters: body.filters,
      timestamp: new Date().toISOString(),
      resultCount: body.resultCount || 0,
    };
    
    // Remove duplicate queries and keep last 20
    const filtered = searches.filter(s => s.query !== body.query);
    filtered.unshift(newSearch);
    userRecentSearches.set(userId, filtered.slice(0, 20));
    
    return reply.status(201).send({
      data: newSearch,
      message: 'Recent search saved',
    });
  }

  /**
   * DELETE /api/search/recent
   * Clear all recent searches
   */
  @Delete('/recent')
  async clearRecentSearches(request: FastifyRequest, reply: FastifyReply) {
    const userId = 'demo-user';
    userRecentSearches.set(userId, []);
    
    return reply.send({
      message: 'Recent searches cleared',
    });
  }
}

export default SearchController;
