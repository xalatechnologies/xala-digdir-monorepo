/**
 * Rental Object Service
 * Primary service for rental object (utleieobjekter) API operations
 * 
 * This is the main service for all rental object operations.
 * Uses the new /api/rental-objects endpoint.
 */

import { BaseService } from './base.service';
import type {
  RentalObject,
  RentalObjectQueryParams,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectCategory,
  RentalObjectsResponse,
  RentalObjectResponse,
  RentalObjectAvailability,
  RentalObjectStats,
  RentalObjectCalendarConfig,
  AvailabilityQueryParams,
  PublicRentalObjectParams,
  TimeSlot,
  City,
  Municipality,
} from '../types/rental-object';
import type { SuccessResponse, SingleResponse } from '../types/enums';
import type { UploadOptions, MediaUploadResponse } from '../types/upload';

// =============================================================================
// Category Info Types
// =============================================================================

export interface CategoryInfo {
  id: RentalObjectCategory;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  examples: string[];
}

export interface SubcategoryInfo {
  id: string;
  name: string;
  nameEn: string;
  category: RentalObjectCategory;
}

export interface TimeModeInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  calendarBehavior: string;
}

// =============================================================================
// Rental Object Service
// =============================================================================

export class RentalObjectService extends BaseService {
  constructor() {
    super('/api/rental-objects');
  }

  /**
   * Get paginated rental objects with category filtering
   */
  async getAll(params?: RentalObjectQueryParams): Promise<RentalObjectsResponse> {
    const response = await this.client.get<RentalObjectsResponse>(this.buildPath(), {
      params: params as Record<string, string | number | boolean>,
    });
    return response;
  }

  /**
   * Get rental objects by category
   */
  async getByCategory(
    category: RentalObjectCategory,
    params?: Omit<RentalObjectQueryParams, 'category'>
  ): Promise<RentalObjectsResponse> {
    return this.getAll({ ...params, category });
  }

  /**
   * Get single rental object by ID
   */
  async getById(id: string): Promise<RentalObjectResponse> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get rental object by slug
   */
  async getBySlug(slug: string): Promise<RentalObjectResponse> {
    return this.client.get(this.buildPath(`/slug/${slug}`));
  }

  /**
   * Create new rental object
   */
  async create(data: CreateRentalObjectDTO): Promise<RentalObjectResponse> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing rental object
   */
  async update(id: string, data: UpdateRentalObjectDTO): Promise<RentalObjectResponse> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete rental object
   */
  async deleteById(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Publish rental object
   */
  async publish(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/publish`));
  }

  /**
   * Archive rental object
   */
  async archive(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/archive`));
  }

  /**
   * Unpublish rental object (set to draft)
   */
  async unpublish(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/unpublish`));
  }

  /**
   * Restore archived rental object
   */
  async restore(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/restore`));
  }

  /**
   * Duplicate rental object
   */
  async duplicate(id: string): Promise<RentalObjectResponse> {
    return this.client.post(this.buildPath(`/${id}/duplicate`));
  }

  /**
   * Upload media files to rental object
   */
  async uploadMedia(id: string, files: File[], options?: UploadOptions): Promise<MediaUploadResponse> {
    return super.uploadMedia(`/${id}/media`, files, options);
  }

  /**
   * Remove media from rental object
   */
  async removeMedia(id: string, mediaId: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}/media/${mediaId}`));
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<{ data: CategoryInfo[] }> {
    return this.client.get('/api/categories');
  }

  /**
   * Get subcategories for a specific category
   */
  async getSubcategories(category: RentalObjectCategory): Promise<{ data: SubcategoryInfo[] }> {
    return this.client.get(`/api/categories/${category}/subcategories`);
  }

  /**
   * Get available booking time modes
   */
  async getTimeModes(): Promise<SingleResponse<TimeModeInfo[]>> {
    return this.client.get('/api/categories/time-modes');
  }

  /**
   * Get rental object availability
   */
  async getAvailability(id: string, params: AvailabilityQueryParams): Promise<SingleResponse<RentalObjectAvailability>> {
    return this.client.get(this.buildPath(`/${id}/availability`), {
      params: params as unknown as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get rental object statistics
   */
  async getStats(id: string): Promise<SingleResponse<RentalObjectStats>> {
    return this.client.get(this.buildPath(`/${id}/stats`));
  }

  /**
   * Get rental object calendar configuration
   * Returns booking modes, constraints, and calendar display settings.
   */
  async getCalendarConfig(id: string): Promise<SingleResponse<RentalObjectCalendarConfig>> {
    return this.client.get(this.buildPath(`/${id}/calendar-config`));
  }
}

// =============================================================================
// Public Rental Object Service (No Auth Required)
// =============================================================================

export class PublicRentalObjectService extends BaseService {
  constructor() {
    super('/api/public');
  }

  /**
   * Get public rental objects
   */
  async getAll(params?: PublicRentalObjectParams): Promise<RentalObjectsResponse> {
    return this.client.get(this.buildPath('/rental-objects'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get public rental objects by category
   */
  async getByCategory(
    category: RentalObjectCategory,
    params?: Omit<PublicRentalObjectParams, 'category'>
  ): Promise<RentalObjectsResponse> {
    return this.getAll({ ...params, category });
  }

  /**
   * Get public rental object by ID
   */
  async getById(id: string): Promise<RentalObjectResponse> {
    return this.client.get(this.buildPath(`/rental-objects/${id}`));
  }

  /**
   * Get public rental object by slug
   */
  async getBySlug(slug: string): Promise<RentalObjectResponse> {
    return this.client.get(this.buildPath(`/rental-objects/slug/${slug}`));
  }

  /**
   * Get public availability
   */
  async getAvailability(rentalObjectId: string, params: AvailabilityQueryParams): Promise<SingleResponse<TimeSlot[]>> {
    return this.client.get(this.buildPath(`/rental-objects/${rentalObjectId}/availability`), {
      params: params as unknown as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<{ data: CategoryInfo[] }> {
    return this.client.get(this.buildPath('/categories'));
  }

  /**
   * Get cities with rental objects
   */
  async getCities(): Promise<SingleResponse<City[]>> {
    return this.client.get(this.buildPath('/cities'));
  }

  /**
   * Get municipalities
   */
  async getMunicipalities(): Promise<SingleResponse<Municipality[]>> {
    return this.client.get(this.buildPath('/municipalities'));
  }

  /**
   * Get featured rental objects
   */
  async getFeatured(): Promise<SingleResponse<RentalObject[]>> {
    return this.client.get(this.buildPath('/featured'));
  }
}

// Singleton instances
export const rentalObjectService = new RentalObjectService();
export const publicRentalObjectService = new PublicRentalObjectService();
