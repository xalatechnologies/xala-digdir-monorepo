/**
 * Listing Service
 * Single Responsibility: Handle all listing-related API operations
 */

import { BaseService } from './base.service';
import type {
  Listing,
  ListingQueryParams,
  CreateListingDTO,
  UpdateListingDTO,
  ListingAvailability,
  ListingStats,
  Category,
  City,
  Municipality,
  TimeSlot,
  AvailabilityQueryParams,
  PublicListingParams,
  ListingCalendarConfigProjectionDTO
} from '../types/listing';
import type { ListingCardProjectionDTO, ListingDetailsProjectionDTO } from '../types/projection-dtos';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';
import type { UploadOptions, MediaUploadResponse } from '../types/upload';

export class ListingService extends BaseService {
  constructor() {
    super('/api/listings');
  }

  /**
   * Get paginated listings
   */
  async getAll(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single listing by ID
   */
  async getById(id: string): Promise<SingleResponse<Listing>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get listing by slug
   */
  async getBySlug(slug: string): Promise<SingleResponse<Listing>> {
    return this.client.get(this.buildPath(`/slug/${slug}`));
  }

  /**
   * Create new listing
   */
  async create(data: CreateListingDTO): Promise<SingleResponse<Listing>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing listing
   */
  async update(id: string, data: UpdateListingDTO): Promise<SingleResponse<Listing>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete listing
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Publish listing
   */
  async publish(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/publish`));
  }

  /**
   * Archive listing
   */
  async archive(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/archive`));
  }

  /**
   * Get listing availability
   */
  async getAvailability(id: string, params: AvailabilityQueryParams): Promise<SingleResponse<ListingAvailability>> {
    return this.client.get(this.buildPath(`/${id}/availability`), { 
      params: params as unknown as Record<string, string | number | boolean> 
    });
  }

  /**
   * Get listing statistics
   */
  async getStats(id: string): Promise<SingleResponse<ListingStats>> {
    return this.client.get(this.buildPath(`/${id}/stats`));
  }

  /**
   * Get listing calendar configuration.
   * Returns booking modes, constraints, and calendar display settings.
   * This is a screen-ready projection containing all configuration needed to render the booking calendar UI.
   *
   * @param id - Listing ID
   * @returns ListingCalendarConfigProjectionDTO with booking modes and constraints
   */
  async getCalendarConfig(id: string): Promise<SingleResponse<ListingCalendarConfigProjectionDTO>> {
    return this.client.get(this.buildPath(`/${id}/calendar-config`));
  }

  /**
   * Add media to listing (legacy method - use uploadMedia for new implementations)
   * @deprecated Use uploadMedia() for new implementations
   */
  async addMedia(id: string, urls: string[]): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/${id}/media`), { urls });
  }

  /**
   * Upload media files to listing
   * Uses multipart/form-data for proper file upload with progress tracking
   * @param id - Listing ID
   * @param files - Files to upload
   * @param options - Upload options including progress callback
   * @returns MediaUploadResponse with uploaded file details
   */
  async uploadMedia(id: string, files: File[], options?: UploadOptions): Promise<MediaUploadResponse> {
    return super.uploadMedia(`/${id}/media`, files, options);
  }

  /**
   * Remove media from listing
   */
  async removeMedia(id: string, mediaId: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}/media/${mediaId}`));
  }

  /**
   * Duplicate listing
   */
  async duplicate(id: string): Promise<SingleResponse<Listing>> {
    return this.client.post(this.buildPath(`/${id}/duplicate`));
  }

  /**
   * Unpublish listing (set to draft)
   */
  async unpublish(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/unpublish`));
  }

  /**
   * Restore archived listing
   */
  async restore(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/${id}/restore`));
  }
}

/**
 * Public Listing Service (No Auth Required)
 */
export class PublicListingService extends BaseService {
  constructor() {
    super('/api/public');
  }

  /**
   * Get public listings (returns screen-ready projection DTOs)
   */
  async getListings(params?: PublicListingParams): Promise<PaginatedResponse<ListingCardProjectionDTO>> {
    return this.client.get(this.buildPath('/listings'), { 
      params: params as Record<string, string | number | boolean> 
    });
  }

  /**
   * Get public listing by ID (returns screen-ready projection DTO)
   */
  async getListing(id: string): Promise<SingleResponse<ListingDetailsProjectionDTO>> {
    return this.client.get(this.buildPath(`/listings/${id}`));
  }

  /**
   * Get public availability
   */
  async getAvailability(listingId: string, params: AvailabilityQueryParams): Promise<SingleResponse<TimeSlot[]>> {
    return this.client.get(this.buildPath(`/listings/${listingId}/availability`), {
      params: params as unknown as Record<string, string | number | boolean>
    });
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<SingleResponse<Category[]>> {
    return this.client.get(this.buildPath('/categories'));
  }

  /**
   * Get cities
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
   * Get featured listings
   */
  async getFeatured(): Promise<SingleResponse<Listing[]>> {
    return this.client.get(this.buildPath('/featured'));
  }
}

// Singleton instances
export const listingService = new ListingService();
export const publicListingService = new PublicListingService();
