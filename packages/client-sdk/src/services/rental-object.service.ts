/**
 * Rental Object Service
 * Handle all rental object (utleieobjekter) API operations
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
} from '../types/rental-object';
import type { SuccessResponse } from '../types/enums';
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

// =============================================================================
// Rental Object Service
// =============================================================================

export class RentalObjectService extends BaseService {
  constructor() {
    super('/api/listings');
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
  async delete(id: string): Promise<SuccessResponse> {
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
  async getAll(params?: RentalObjectQueryParams): Promise<RentalObjectsResponse> {
    return this.client.get(this.buildPath('/listings'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get public rental objects by category
   */
  async getByCategory(
    category: RentalObjectCategory,
    params?: Omit<RentalObjectQueryParams, 'category'>
  ): Promise<RentalObjectsResponse> {
    return this.getAll({ ...params, category });
  }

  /**
   * Get public rental object by ID
   */
  async getById(id: string): Promise<RentalObjectResponse> {
    return this.client.get(this.buildPath(`/listings/${id}`));
  }

  /**
   * Get public rental object by slug
   */
  async getBySlug(slug: string): Promise<RentalObjectResponse> {
    return this.client.get(this.buildPath(`/listings/slug/${slug}`));
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<{ data: CategoryInfo[] }> {
    return this.client.get(this.buildPath('/categories'));
  }
}

// Singleton instances
export const rentalObjectService = new RentalObjectService();
export const publicRentalObjectService = new PublicRentalObjectService();
