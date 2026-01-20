/**
 * Pricing Service
 * Complete pricing management for groups and rental object pricing
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '@/types/enums';
import type {
  PricingGroup,
  PricingGroupListResponse,
  CreatePricingGroupDTO,
  UpdatePricingGroupDTO,
  ListPricingGroupsQuery,
  RentalObjectPricing,
  UpdateRentalObjectPricingDTO,
  BookingQuoteRequest,
  BookingQuoteResponse,
  BulkUpdatePricingDTO,
  BulkUpdatePricingResponse,
} from '@/types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface PricingQuoteRequest {
  listingId: string;
  start: string | Date;
  end: string | Date;
  userGroupId?: string | null;
  units?: number;
}

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unit: 'HOUR' | 'DAY' | 'PACKAGE';
  subtotal: number;
  ruleId?: string;
}

export interface PricingQuoteResponse {
  lineItems: QuoteLineItem[];
  totalAmount: number;
  currency: string;
  ruleApplied: {
    id: string;
    description?: string;
    ruleType: 'HOURLY' | 'DAILY' | 'PACKAGE';
  } | null;
  isWeekend: boolean;
  userGroupId: string | null;
  validUntil?: string;
}

// =============================================================================
// Service
// =============================================================================

export class PricingService extends BaseService {
  constructor() {
    super('/pricing');
  }

  // ===========================================================================
  // PRICING GROUPS
  // ===========================================================================

  /**
   * List pricing groups with optional filtering
   */
  async listGroups(query?: Partial<ListPricingGroupsQuery>): Promise<PricingGroupListResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.search) params.set('search', query.search);
    if (query?.isActive !== undefined) params.set('isActive', String(query.isActive));
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    return this.client.get(this.buildPath(`/groups${queryString ? `?${queryString}` : ''}`));
  }

  /**
   * Get a single pricing group by ID
   */
  async getGroup(id: string): Promise<SingleResponse<PricingGroup>> {
    return this.client.get(this.buildPath(`/groups/${id}`));
  }

  /**
   * Get all active pricing groups (for dropdowns)
   */
  async getActiveGroups(): Promise<PaginatedResponse<PricingGroup>> {
    return this.client.get(this.buildPath('/groups?isActive=true&limit=100'));
  }

  /**
   * Create a new pricing group
   */
  async createGroup(data: CreatePricingGroupDTO): Promise<SingleResponse<PricingGroup>> {
    return this.client.post(this.buildPath('/groups'), data);
  }

  /**
   * Update a pricing group
   */
  async updateGroup(id: string, data: UpdatePricingGroupDTO): Promise<SingleResponse<PricingGroup>> {
    return this.client.patch(this.buildPath(`/groups/${id}`), data);
  }

  /**
   * Delete a pricing group
   */
  async deleteGroup(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/groups/${id}`));
  }

  // ===========================================================================
  // RENTAL OBJECT PRICING
  // ===========================================================================

  /**
   * Get pricing configuration for a rental object
   */
  async getRentalObjectPricing(rentalObjectId: string): Promise<SingleResponse<RentalObjectPricing>> {
    return this.client.get(this.buildPath(`/rental-objects/${rentalObjectId}`));
  }

  /**
   * Get all pricing variations for a rental object
   */
  async getPricingVariations(rentalObjectId: string): Promise<PaginatedResponse<RentalObjectPricing>> {
    return this.client.get(this.buildPath(`/rental-objects/${rentalObjectId}/variations`));
  }

  /**
   * Update pricing for a rental object
   */
  async updateRentalObjectPricing(
    rentalObjectId: string,
    data: UpdateRentalObjectPricingDTO
  ): Promise<SingleResponse<RentalObjectPricing>> {
    return this.client.patch(this.buildPath(`/rental-objects/${rentalObjectId}`), data);
  }

  /**
   * Bulk update pricing for multiple rental objects
   */
  async bulkUpdatePricing(data: BulkUpdatePricingDTO): Promise<BulkUpdatePricingResponse> {
    return this.client.post(this.buildPath('/rental-objects/bulk'), data);
  }

  // ===========================================================================
  // QUOTES
  // ===========================================================================

  /**
   * Get a pricing quote for a booking
   */
  async quote(request: PricingQuoteRequest): Promise<SingleResponse<PricingQuoteResponse>> {
    return this.client.post(this.buildPath('/quote'), {
      listingId: request.listingId,
      start: typeof request.start === 'string' ? request.start : request.start.toISOString(),
      end: typeof request.end === 'string' ? request.end : request.end.toISOString(),
      userGroupId: request.userGroupId,
      units: request.units,
    });
  }

  /**
   * Get a booking quote (alias for quote with different request format)
   */
  async getBookingQuote(data: BookingQuoteRequest): Promise<SingleResponse<BookingQuoteResponse>> {
    return this.client.post(this.buildPath('/quote'), data);
  }

  // ===========================================================================
  // USER PRICING GROUPS
  // ===========================================================================

  /**
   * Get the pricing group for a specific user
   */
  async getUserPricingGroup(userId?: string): Promise<SingleResponse<PricingGroup | null>> {
    const path = userId ? `/users/${userId}/group` : '/users/me/group';
    return this.client.get(this.buildPath(path));
  }

  /**
   * Get member count for a pricing group
   */
  async getGroupMembersCount(groupId: string): Promise<SingleResponse<{ count: number }>> {
    return this.client.get(this.buildPath(`/groups/${groupId}/members/count`));
  }
}

// Singleton instance
export const pricingService = new PricingService();
