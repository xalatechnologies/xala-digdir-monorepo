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
} from '../types';

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
   * Get single amenity by ID
   */
  async getById(id: string): Promise<SingleResponse<Amenity>> {
    return this.client.get(this.buildPath(`/${id}`));
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
   * Delete amenity
   */
  async delete(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
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
