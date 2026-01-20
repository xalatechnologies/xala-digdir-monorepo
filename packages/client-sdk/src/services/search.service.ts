/**
 * Search Service
 * Single Responsibility: Handle all search-related API operations
 */

import { BaseService } from './base.service';
import type {
  SearchParams,
  SearchResponse,
  TypeaheadParams,
  TypeaheadResponse,
  SavedFilter,
  SavedFilterQueryParams,
  CreateSavedFilterDTO,
  UpdateSavedFilterDTO,
  RecentSearch,
  RecentSearchQueryParams,
  ExportSearchParams,
  ExportSearchResponse
} from '@/types/search';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '@/types/enums';

export class SearchService extends BaseService {
  constructor() {
    super('/api/search');
  }

  /**
   * Execute global search across entities
   * @param params - Search parameters including query, filters, and pagination
   * @returns Promise resolving to search results with matched entities
   * @example
   * ```ts
   * const results = await searchService.search({
   *   query: 'meeting room',
   *   entityTypes: ['listing'],
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    return this.client.get(this.buildPath(), {
      params: params as unknown as Record<string, string | number | boolean>
    });
  }

  /**
   * Get typeahead suggestions as user types
   * @param params - Typeahead parameters including partial query and entity type
   * @returns Promise resolving to typeahead suggestions
   * @example
   * ```ts
   * const suggestions = await searchService.typeahead({
   *   query: 'meet',
   *   entityType: 'listing',
   *   limit: 5
   * });
   * ```
   */
  async typeahead(params: TypeaheadParams): Promise<TypeaheadResponse> {
    return this.client.get(this.buildPath('/typeahead'), {
      params: params as unknown as Record<string, string | number | boolean>
    });
  }

  /**
   * Get user's saved filters
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated list of saved filters
   */
  async getSavedFilters(params?: SavedFilterQueryParams): Promise<PaginatedResponse<SavedFilter>> {
    return this.client.get(this.buildPath('/filters'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Get single saved filter by ID
   * @param id - Saved filter ID
   * @returns Promise resolving to saved filter details
   */
  async getSavedFilterById(id: string): Promise<SingleResponse<SavedFilter>> {
    return this.client.get(this.buildPath(`/filters/${id}`));
  }

  /**
   * Create new saved filter
   * @param data - Saved filter data including name and filter criteria
   * @returns Promise resolving to created saved filter
   */
  async createSavedFilter(data: CreateSavedFilterDTO): Promise<SingleResponse<SavedFilter>> {
    return this.client.post(this.buildPath('/filters'), data);
  }

  /**
   * Update existing saved filter
   * @param id - Saved filter ID
   * @param data - Updated filter data
   * @returns Promise resolving to updated saved filter
   */
  async updateSavedFilter(id: string, data: UpdateSavedFilterDTO): Promise<SingleResponse<SavedFilter>> {
    return this.client.put(this.buildPath(`/filters/${id}`), data);
  }

  /**
   * Delete saved filter
   * @param id - Saved filter ID
   * @returns Promise resolving to success response
   */
  async deleteSavedFilter(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/filters/${id}`));
  }

  /**
   * Get user's recent searches
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated list of recent searches
   */
  async getRecentSearches(params?: RecentSearchQueryParams): Promise<PaginatedResponse<RecentSearch>> {
    return this.client.get(this.buildPath('/recent'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Export search results to file
   * @param params - Export parameters including format and search criteria
   * @returns Promise resolving to export response with download URL
   */
  async exportResults(params: ExportSearchParams): Promise<ExportSearchResponse> {
    return this.client.post(this.buildPath('/export'), params);
  }
}

// Export singleton instance
export const searchService = new SearchService();
