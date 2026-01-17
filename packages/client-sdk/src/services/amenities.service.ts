/**
 * AMENITIES SERVICE (Client SDK)
 * 
 * Type-safe service for Amenities API endpoints.
 * Used by React Query hooks.
 */

import { BaseService } from './base.service';

// Define types locally since they don't exist in contracts yet
export interface AmenityDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  groupCode?: string;
  iconKey?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AmenityGroupDTO {
  code: string;
  name: string;
  description?: string;
  amenities: AmenityDTO[];
}

export interface CreateAmenityRequest {
  code: string;
  name: string;
  description?: string;
  groupCode?: string;
  iconKey?: string;
  isActive?: boolean;
}

export interface UpdateAmenityRequest {
  name?: string;
  description?: string;
  groupCode?: string;
  iconKey?: string;
  isActive?: boolean;
}

export interface AssignAmenitiesRequest {
  amenityIds: string[];
}

export class AmenitiesService extends BaseService {
  constructor() {
    super('/amenities');
  }

  /**
   * List all amenities
   */
  async list(): Promise<{ data: AmenityDTO[]; meta: { total: number } }> {
    return this.client.get<{ data: AmenityDTO[]; meta: { total: number } }>('');
  }

  /**
   * List amenities grouped by category
   */
  async listGrouped(): Promise<{ data: AmenityGroupDTO[] }> {
    return this.client.get<{ data: AmenityGroupDTO[] }>('/grouped');
  }

  /**
   * Get single amenity
   */
  async getById(id: string): Promise<{ data: AmenityDTO }> {
    return this.client.get<{ data: AmenityDTO }>(`/${id}`);
  }

  /**
   * Create amenity (admin only)
   */
  async create(data: CreateAmenityRequest): Promise<{ data: AmenityDTO }> {
    return this.client.post<{ data: AmenityDTO }>('' , data);
  }

  /**
   * Update amenity (admin only)
   */
  async update(id: string, data: UpdateAmenityRequest): Promise<{ data: AmenityDTO }> {
    return this.client.put<{ data: AmenityDTO }>(`/${id}`, data);
  }

  /**
   * Delete amenity (admin only)
   */
  async deleteById(id: string): Promise<void> {
    return this.client.delete(`/${id}`);
  }

  /**
   * Get amenities for rental object
   */
  async getForRentalObject(rentalObjectId: string): Promise<{ data: AmenityDTO[] }> {
    return this.client.get<{ data: AmenityDTO[] }>(`/rental-objects/${rentalObjectId}/amenities`);
  }

  /**
   * Assign amenities to rental object (admin only)
   */
  async assignToRentalObject(
    rentalObjectId: string,
    data: AssignAmenitiesRequest
  ): Promise<void> {
    return this.client.post(`/rental-objects/${rentalObjectId}/amenities/assign`, data);
  }
}

// Export singleton instance
export const amenitiesService = new AmenitiesService();
