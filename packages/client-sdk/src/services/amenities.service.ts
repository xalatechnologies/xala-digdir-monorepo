/**
 * Amenities Service
 * Handles amenity/feature management for rental objects
 */

import { BaseService } from './base.service';
import type {
  Amenity,
  CreateAmenityDTO,
  UpdateAmenityDTO,
  AmenityQueryParams,
  PaginatedResponse,
  SingleResponse,
  SuccessResponse,
} from '@/types';

// Export request types for hooks
export type CreateAmenityRequest = CreateAmenityDTO;
export type UpdateAmenityRequest = UpdateAmenityDTO;

export interface AssignAmenitiesRequest {
  amenityIds: string[];
}

export interface AmenityGroup {
  category: string;
  amenities: Amenity[];
}

export class AmenitiesService extends BaseService {
  constructor() {
    super('/api/amenities');
  }

  /**
   * Get all amenities with optional filtering
   */
  async getAll(params?: AmenityQueryParams): Promise<PaginatedResponse<Amenity>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * List all amenities (alias for getAll)
   */
  async list(): Promise<PaginatedResponse<Amenity>> {
    return this.getAll();
  }

  /**
   * List amenities grouped by category
   */
  async listGrouped(): Promise<SingleResponse<AmenityGroup[]>> {
    return this.client.get(this.buildPath('/grouped'));
  }

  /**
   * Get single amenity by ID
   */
  async getById(id: string): Promise<SingleResponse<Amenity>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get amenities for a specific rental object
   */
  async getForRentalObject(rentalObjectId: string): Promise<PaginatedResponse<Amenity>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}`));
  }

  /**
   * Get amenities by category
   */
  async getByCategory(category: string): Promise<PaginatedResponse<Amenity>> {
    return this.client.get(this.buildPath(), { 
      params: { category } 
    });
  }

  /**
   * Create new amenity
   */
  async create(data: CreateAmenityDTO): Promise<SingleResponse<Amenity>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing amenity
   */
  async update(id: string, data: UpdateAmenityDTO): Promise<SingleResponse<Amenity>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete amenity by ID
   */
  async deleteById(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Delete amenity (alias for deleteById)
   */
  async deleteAmenity(id: string): Promise<void> {
    await this.deleteById(id);
  }

  /**
   * Assign amenities to rental object
   */
  async assignToRentalObject(rentalObjectId: string, data: AssignAmenitiesRequest): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/rental-object/${rentalObjectId}`), data);
  }

  /**
   * Get popular amenities (most used)
   */
  async getPopular(limit = 10): Promise<PaginatedResponse<Amenity>> {
    return this.client.get(this.buildPath('/popular'), { 
      params: { limit } 
    });
  }

  /**
   * Search amenities by name
   */
  async search(query: string): Promise<PaginatedResponse<Amenity>> {
    return this.client.get(this.buildPath('/search'), { 
      params: { q: query } 
    });
  }
}

export const amenitiesService = new AmenitiesService();

