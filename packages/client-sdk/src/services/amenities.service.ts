/**
 * AMENITIES SERVICE (Client SDK)
 * 
 * Type-safe service for Amenities API endpoints.
 * Used by React Query hooks.
 */

import type {
  AmenityDTO,
  AmenityGroupDTO,
  ProblemDetailsDTO,
} from '@digilist/types';

export interface CreateAmenityRequest {
  code: string;
  name: string;
  description?: string;
  groupCode?: string;
  iconKey?: string;
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

export class AmenitiesService {
  constructor(private readonly baseUrl: string, private readonly fetch: typeof window.fetch) {}

  /**
   * List all amenities
   */
  async list(): Promise<{ data: AmenityDTO[]; meta: { total: number } }> {
    const response = await this.fetch(`${this.baseUrl}/amenities`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * List amenities grouped by category
   */
  async listGrouped(): Promise<{ data: AmenityGroupDTO[] }> {
    const response = await this.fetch(`${this.baseUrl}/amenities/grouped`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get single amenity
   */
  async get(id: string): Promise<{ data: AmenityDTO }> {
    const response = await this.fetch(`${this.baseUrl}/amenities/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Create amenity (admin only)
   */
  async create(data: CreateAmenityRequest): Promise<{ data: AmenityDTO }> {
    const response = await this.fetch(`${this.baseUrl}/amenities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Update amenity (admin only)
   */
  async update(id: string, data: UpdateAmenityRequest): Promise<{ data: AmenityDTO }> {
    const response = await this.fetch(`${this.baseUrl}/amenities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Delete amenity (admin only)
   */
  async deleteById(id: string): Promise<void> {
    const response = await this.fetch(`${this.baseUrl}/amenities/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }
  }

  /**
   * Get amenities for rental object
   */
  async getForRentalObject(rentalObjectId: string): Promise<{ data: AmenityDTO[] }> {
    const response = await this.fetch(`${this.baseUrl}/rental-objects/${rentalObjectId}/amenities`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Assign amenities to rental object (admin only)
   */
  async assignToRentalObject(
    rentalObjectId: string,
    data: AssignAmenitiesRequest
  ): Promise<void> {
    const response = await this.fetch(`${this.baseUrl}/rental-objects/${rentalObjectId}/amenities`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }
  }

  /**
   * Error handler
   */
  private async handleError(response: Response): Promise<ProblemDetailsDTO> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return {
      type: 'https://api.digilist.no/errors/unknown',
      title: 'Unknown Error',
      status: response.status,
      detail: await response.text(),
    };
  }
}
