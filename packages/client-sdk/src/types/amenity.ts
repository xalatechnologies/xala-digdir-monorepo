/**
 * Amenity Types
 * Single Responsibility: Amenity entity and DTOs for rental object features
 */

import type { TenantEntity, BaseQueryParams } from './enums';

// =============================================================================
// Amenity Entity
// =============================================================================

export interface Amenity extends TenantEntity {
  name: string;
  nameKey?: string;
  descriptionKey?: string;
  category: string;
  icon?: string;
  sortOrder?: number;
  isActive: boolean;
}

// =============================================================================
// Amenity DTOs
// =============================================================================

export interface CreateAmenityDTO {
  name: string;
  nameKey?: string;
  descriptionKey?: string;
  category: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateAmenityDTO {
  name?: string;
  nameKey?: string;
  descriptionKey?: string;
  category?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AmenityQueryParams extends BaseQueryParams {
  category?: string;
  isActive?: boolean;
  search?: string;
}
