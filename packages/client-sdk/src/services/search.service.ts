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
} from '../types/search';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class SearchService extends BaseService {
  constructor() {
    super('/api/search');
  }

  /**
   * Execute global search across entities
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    return this.client.get(this.buildPath(), {
      params: params as unknown as Record<string, string | number | boolean>
    });
  }

  /**
   * Get typeahead suggestions as user types
   */
  async typeahead(params: TypeaheadParams): Promise<TypeaheadResponse> {
    return this.client.get(this.buildPath('/typeahead'), {
      params: params as unknown as Record<string, string | number | boolean>
    });
  }

  /**
   * Get user's saved filters
   */
  async getSavedFilters(params?: SavedFilterQueryParams): Promise<PaginatedResponse<SavedFilter>> {
    return this.client.get(this.buildPath('/filters'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Get single saved filter by ID
   */
  async getSavedFilterById(id: string): Promise<SingleResponse<SavedFilter>> {
    return this.client.get(this.buildPath(`/filters/${id}`));
  }

  /**
   * Create new saved filter
   */
  async createSavedFilter(data: CreateSavedFilterDTO): Promise<SingleResponse<SavedFilter>> {
    return this.client.post(this.buildPath('/filters'), data);
  }

  /**
   * Update existing saved filter
   */
  async updateSavedFilter(id: string, data: UpdateSavedFilterDTO): Promise<SingleResponse<SavedFilter>> {
    return this.client.put(this.buildPath(`/filters/${id}`), data);
  }

  /**
   * Delete saved filter
   */
  async deleteSavedFilter(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/filters/${id}`));
  }

  /**
   * Get user's recent searches
   */
  async getRecentSearches(params?: RecentSearchQueryParams): Promise<PaginatedResponse<RecentSearch>> {
    return this.client.get(this.buildPath('/recent'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Export search results to file
   */
  async exportResults(params: ExportSearchParams): Promise<ExportSearchResponse> {
    return this.client.post(this.buildPath('/export'), params);
  }
}

// Export singleton instance
export const searchService = new SearchService();
