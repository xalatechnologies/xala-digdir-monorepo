/**
 * AI Seed Generator Service
 * Handles demo data generation using AI
 * Used by saas-admin AI Seed Generator page
 */

import { BaseService } from './base.service';
import type { SingleResponse } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type EntityType = 'rental_objects' | 'users' | 'organizations' | 'bookings' | 'reviews';

export interface GenerateSeedRequest {
  entityType: EntityType;
  count: number;
  tenantId: string;
}

export interface GenerateSeedResponse {
  success: boolean;
  message: string;
  count: number;
  entityType: EntityType;
  tenantId: string;
  duration?: number;
  details?: {
    created: number;
    skipped: number;
    errors: string[];
  };
}

// ============================================================================
// Service
// ============================================================================

class AISeedService extends BaseService {
  constructor() {
    super('/api/admin/ai-seed-generator');
  }

  /**
   * Generate seed data for a tenant
   */
  async generate(data: GenerateSeedRequest): Promise<SingleResponse<GenerateSeedResponse>> {
    return this.client.post<SingleResponse<GenerateSeedResponse>>(this.buildPath(), data);
  }

  /**
   * Generate rental objects
   */
  async generateRentalObjects(tenantId: string, count: number): Promise<SingleResponse<GenerateSeedResponse>> {
    return this.generate({ entityType: 'rental_objects', count, tenantId });
  }

  /**
   * Generate users
   */
  async generateUsers(tenantId: string, count: number): Promise<SingleResponse<GenerateSeedResponse>> {
    return this.generate({ entityType: 'users', count, tenantId });
  }

  /**
   * Generate organizations
   */
  async generateOrganizations(tenantId: string, count: number): Promise<SingleResponse<GenerateSeedResponse>> {
    return this.generate({ entityType: 'organizations', count, tenantId });
  }

  /**
   * Generate bookings
   */
  async generateBookings(tenantId: string, count: number): Promise<SingleResponse<GenerateSeedResponse>> {
    return this.generate({ entityType: 'bookings', count, tenantId });
  }

  /**
   * Generate reviews
   */
  async generateReviews(tenantId: string, count: number): Promise<SingleResponse<GenerateSeedResponse>> {
    return this.generate({ entityType: 'reviews', count, tenantId });
  }
}

export const aiSeedService = new AISeedService();
