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
  { id: 'list-1', name: 'Gymsal Skien Nord', category: 'Gymsal', city: 'Skien', description: 'Moderne gymsal med god lyd og lys' },
  { id: 'list-2', name: 'Gymsal Porsgrunn Sentrum', category: 'Gymsal', city: 'Porsgrunn', description: 'Sentral beliggenhet med parkeringsmuligheter' },
  { id: 'list-3', name: 'Grendehus Bamble', category: 'Grendehus', city: 'Bamble', description: 'Koselig grendehus for mindre arrangementer' },
  { id: 'list-4', name: 'Grendehus Siljan', category: 'Grendehus', city: 'Siljan', description: 'Perfekt for familiesammenkomster' },
  { id: 'list-5', name: 'Møterom Rådhuset', category: 'Møterom', city: 'Skien', description: 'Profesjonelt møterom i rådhuset' },
  { id: 'list-6', name: 'Møterom Biblioteket', category: 'Møterom', city: 'Porsgrunn', description: 'Stille møterom på biblioteket' },
  { id: 'list-7', name: 'Idrettshall Skien', category: 'Idrettshall', city: 'Skien', description: 'Stor idrettshall for ballsport' },
  { id: 'list-8', name: 'Svømmehall Porsgrunn', category: 'Svømmehall', city: 'Porsgrunn', description: 'Oppvarmet basseng og garderober' },
  { id: 'list-9', name: 'Kulturhus Kragerø', category: 'Kulturhus', city: 'Kragerø', description: 'Kulturhus med scene og kafé' },
  { id: 'list-10', name: 'Fotballbane Bamble', category: 'Idrettsanlegg', city: 'Bamble', description: 'Kunstgressbane med lys' },
];

const mockOrganizations = [
  { id: 'org-1', name: 'Skien Kommune', category: 'Kommune', description: 'Kommunal administrasjon' },
  { id: 'org-2', name: 'Porsgrunn Kommune', category: 'Kommune', description: 'Kommunal administrasjon' },
  { id: 'org-3', name: 'Bamble Kommune', category: 'Kommune', description: 'Kommunal administrasjon' },
  { id: 'org-4', name: 'Gym & Trening AS', category: 'Privat', description: 'Privat treningssenter' },
  { id: 'org-5', name: 'Kultursenteret', category: 'Organisasjon', description: 'Kulturorganisasjon' },
];

const mockBookings = [
  { id: 'book-1', listingId: 'list-1', listingName: 'Gymsal Skien Nord', userName: 'Ole Hansen', startDate: '2024-02-15', status: 'confirmed' },
  { id: 'book-2', listingId: 'list-5', listingName: 'Møterom Rådhuset', userName: 'Kari Nordmann', startDate: '2024-02-20', status: 'pending' },
  { id: 'book-3', listingId: 'list-7', listingName: 'Idrettshall Skien', userName: 'Per Olsen', startDate: '2024-02-18', status: 'confirmed' },
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
   * Full-text search across entities with entity type filtering
   */
  @Get()
  async search(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as {
      query?: string;
      q?: string; // Legacy support
      entityType?: 'booking' | 'listing' | 'organization' | 'all';
      category?: string;
      city?: string;
      limit?: string;
      offset?: string;
      includeHighlights?: string;
    };

    const startTime = Date.now();

    // Support both 'query' and 'q' parameters (legacy compatibility)
    const searchQuery = (query.query || query.q || '').toLowerCase().trim();
    const entityType = query.entityType || 'all';
    const includeHighlights = query.includeHighlights === 'true';
    const limit = parseInt(query.limit || '20', 10);
    const offset = parseInt(query.offset || '0', 10);

    // Helper function for fuzzy matching with Norwegian character support
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a');
    };

    const matchesQuery = (text: string, query: string): boolean => {
      if (!query) return true;
      const normalizedText = normalizeText(text);
      const normalizedQuery = normalizeText(query);
      return normalizedText.includes(normalizedQuery);
    };

    const results: Array<{
      type: 'booking' | 'listing' | 'organization';
      entity: any;
      highlight?: { field: string; snippet: string };
    }> = [];

    // Search bookings
    if (entityType === 'all' || entityType === 'booking') {
      for (const booking of mockBookings) {
        if (matchesQuery(booking.listingName, searchQuery) || matchesQuery(booking.userName, searchQuery)) {
          const result: any = {
            type: 'booking',
            entity: booking,
          };

          if (includeHighlights) {
            if (matchesQuery(booking.listingName, searchQuery)) {
              result.highlight = {
                field: 'listingName',
                snippet: booking.listingName,
              };
            } else if (matchesQuery(booking.userName, searchQuery)) {
              result.highlight = {
                field: 'userName',
                snippet: booking.userName,
              };
            }
          }

          results.push(result);
        }
      }
    }

    // Search listings
    if (entityType === 'all' || entityType === 'listing') {
      for (const listing of mockListings) {
        const matchesSearch = matchesQuery(listing.name, searchQuery) ||
                            matchesQuery(listing.category, searchQuery) ||
                            matchesQuery(listing.description, searchQuery);
        const matchesCategory = !query.category || listing.category.toLowerCase() === query.category.toLowerCase();
        const matchesCity = !query.city || listing.city.toLowerCase() === query.city.toLowerCase();

        if (matchesSearch && matchesCategory && matchesCity) {
          const result: any = {
            type: 'listing',
            entity: listing,
          };

          if (includeHighlights) {
            if (matchesQuery(listing.name, searchQuery)) {
              result.highlight = {
                field: 'name',
                snippet: listing.name,
              };
            } else if (matchesQuery(listing.category, searchQuery)) {
              result.highlight = {
                field: 'category',
                snippet: listing.category,
              };
            } else if (matchesQuery(listing.description, searchQuery)) {
              result.highlight = {
                field: 'description',
                snippet: listing.description,
              };
            }
          }

          results.push(result);
        }
      }
    }

    // Search organizations
    if (entityType === 'all' || entityType === 'organization') {
      for (const org of mockOrganizations) {
        if (matchesQuery(org.name, searchQuery) || matchesQuery(org.description, searchQuery)) {
          const result: any = {
            type: 'organization',
            entity: org,
          };

          if (includeHighlights) {
            if (matchesQuery(org.name, searchQuery)) {
              result.highlight = {
                field: 'name',
                snippet: org.name,
              };
            } else if (matchesQuery(org.description, searchQuery)) {
              result.highlight = {
                field: 'description',
                snippet: org.description,
              };
            }
          }

          results.push(result);
        }
      }
    }

    // Apply pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    // Calculate counts by entity type
    const counts = {
      bookings: results.filter(r => r.type === 'booking').length,
      listings: results.filter(r => r.type === 'listing').length,
      organizations: results.filter(r => r.type === 'organization').length,
    };

    const executionTime = Date.now() - startTime;

    return reply.send({
      data: paginatedResults,
      meta: {
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
        counts,
        executionTime,
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
