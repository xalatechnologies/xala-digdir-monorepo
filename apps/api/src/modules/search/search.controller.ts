/**
 * Search Controller
 * Search-related endpoints
 *
 * Endpoints:
 * - GET /api/search - Full-text search across listings
 * - GET /api/search/typeahead - Typeahead suggestions for search
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

interface SearchSuggestion {
  text: string;
  entityType: 'booking' | 'listing' | 'organization' | 'all';
  entityId?: string;
  category: string;
  score?: number;
}

interface TypeaheadResponse {
  suggestions: SearchSuggestion[];
}

// Mock data for typeahead suggestions
const mockListings = [
  { id: 'list-1', name: 'Gymsal Skien Nord', category: 'Gymsal' },
  { id: 'list-2', name: 'Gymsal Porsgrunn Sentrum', category: 'Gymsal' },
  { id: 'list-3', name: 'Grendehus Bamble', category: 'Grendehus' },
  { id: 'list-4', name: 'Grendehus Siljan', category: 'Grendehus' },
  { id: 'list-5', name: 'Møterom Rådhuset', category: 'Møterom' },
  { id: 'list-6', name: 'Møterom Biblioteket', category: 'Møterom' },
  { id: 'list-7', name: 'Idrettshall Skien', category: 'Idrettshall' },
  { id: 'list-8', name: 'Svømmehall Porsgrunn', category: 'Svømmehall' },
  { id: 'list-9', name: 'Kulturhus Kragerø', category: 'Kulturhus' },
  { id: 'list-10', name: 'Fotballbane Bamble', category: 'Idrettsanlegg' },
];

const mockOrganizations = [
  { id: 'org-1', name: 'Skien Kommune', category: 'Kommune' },
  { id: 'org-2', name: 'Porsgrunn Kommune', category: 'Kommune' },
  { id: 'org-3', name: 'Bamble Kommune', category: 'Kommune' },
  { id: 'org-4', name: 'Gym & Trening AS', category: 'Privat' },
  { id: 'org-5', name: 'Kultursenteret', category: 'Organisasjon' },
];

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
   * GET /api/search/typeahead
   * Typeahead suggestions for search queries
   */
  @Get('/typeahead')
  async typeahead(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as {
      query?: string;
      entityTypes?: string | string[];
      limit?: string;
    };

    const searchQuery = (query.query || '').toLowerCase().trim();
    const limit = parseInt(query.limit || '10', 10);

    // Parse entityTypes - can be comma-separated string or array
    let entityTypes: string[] = ['all'];
    if (query.entityTypes) {
      if (Array.isArray(query.entityTypes)) {
        entityTypes = query.entityTypes;
      } else if (typeof query.entityTypes === 'string') {
        entityTypes = query.entityTypes.split(',').map(t => t.trim());
      }
    }

    if (!searchQuery) {
      return reply.send({ suggestions: [] });
    }

    const suggestions: SearchSuggestion[] = [];

    // Helper function for fuzzy matching with Norwegian character support
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a');
    };

    const calculateScore = (text: string, query: string): number => {
      const normalizedText = normalizeText(text);
      const normalizedQuery = normalizeText(query);

      // Exact match
      if (normalizedText === normalizedQuery) return 1.0;

      // Starts with query
      if (normalizedText.startsWith(normalizedQuery)) return 0.9;

      // Contains query
      if (normalizedText.includes(normalizedQuery)) return 0.7;

      // Fuzzy match - check if all query characters appear in order
      let textIndex = 0;
      for (const char of normalizedQuery) {
        const foundIndex = normalizedText.indexOf(char, textIndex);
        if (foundIndex === -1) return 0;
        textIndex = foundIndex + 1;
      }
      return 0.5;
    };

    const matchesQuery = (text: string, query: string): boolean => {
      return calculateScore(text, query) > 0;
    };

    // Search listings
    if (entityTypes.includes('all') || entityTypes.includes('listing')) {
      for (const listing of mockListings) {
        if (matchesQuery(listing.name, searchQuery) || matchesQuery(listing.category, searchQuery)) {
          const score = Math.max(
            calculateScore(listing.name, searchQuery),
            calculateScore(listing.category, searchQuery)
          );
          suggestions.push({
            text: listing.name,
            entityType: 'listing',
            entityId: listing.id,
            category: listing.category,
            score,
          });
        }
      }
    }

    // Search organizations
    if (entityTypes.includes('all') || entityTypes.includes('organization')) {
      for (const org of mockOrganizations) {
        if (matchesQuery(org.name, searchQuery)) {
          suggestions.push({
            text: org.name,
            entityType: 'organization',
            entityId: org.id,
            category: org.category,
            score: calculateScore(org.name, searchQuery),
          });
        }
      }
    }

    // Sort by score (highest first) and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    const response: TypeaheadResponse = {
      suggestions: sortedSuggestions,
    };

    return reply.send(response);
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
