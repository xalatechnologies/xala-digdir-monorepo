/**
 * Price Rules Service
 * Backoffice management of pricing rules and listing rules
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '@/types/enums';

// =============================================================================
// Types
// =============================================================================

export type PriceRuleType = 'HOURLY' | 'DAILY' | 'PACKAGE';
export type PriceUnit = 'HOUR' | 'DAY' | 'PACKAGE';

export type ListingCategory =
  | 'GYMSAL'
  | 'MUSIKKBINGE'
  | 'BYDELSHUS'
  | 'GRENDEHUS'
  | 'BIBLIOTEK'
  | 'UNGDOM'
  | 'FRIVILLIGHET'
  | 'UTE'
  | 'KULTUR'
  | 'MOTEROM'
  | 'IDRETT'
  | 'KURS'
  | 'OTHER';

export interface PriceRule {
  id: string;
  listingId: string;
  userGroupId?: string | null;
  ruleType: PriceRuleType;
  unit: PriceUnit;
  amount: number; // in øre
  currency: string;
  appliesWeekdays: boolean;
  appliesWeekends: boolean;
  packageName?: string | null;
  windowStart?: string | null;
  windowEnd?: string | null;
  description?: string | null;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePriceRuleDTO {
  listingId?: string; // Optional when using /listings/:id/price-rules endpoint
  userGroupId?: string | null;
  ruleType: PriceRuleType;
  unit: PriceUnit;
  amount: number;
  currency?: string;
  appliesWeekdays?: boolean;
  appliesWeekends?: boolean;
  packageName?: string;
  windowStart?: string;
  windowEnd?: string;
  description?: string;
  priority?: number;
}

export interface ListingRules {
  id: string;
  listingId: string;
  approvalRequired: boolean;
  minAge?: number | null;
  maxBookingDays?: number | null;
  minBookingHours?: number | null;
  cancellationDeadlineDays?: number | null;
  cancellationFeePercent?: number | null;
  depositAmount?: number | null;
  depositRequired: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertListingRulesDTO {
  approvalRequired?: boolean;
  minAge?: number | null;
  maxBookingDays?: number | null;
  minBookingHours?: number | null;
  cancellationDeadlineDays?: number | null;
  cancellationFeePercent?: number | null;
  depositAmount?: number | null;
  depositRequired?: boolean;
  notes?: string | null;
}

// =============================================================================
// Backoffice Price Rules Service
// =============================================================================

export class BackofficePriceRulesService extends BaseService {
  constructor() {
    super('/backoffice/listings');
  }

  /**
   * Get price rules for a listing
   */
  async getPriceRules(listingId: string): Promise<PaginatedResponse<PriceRule>> {
    return this.client.get(this.buildPath(`/${listingId}/price-rules`));
  }

  /**
   * Replace all price rules for a listing
   */
  async replacePriceRules(listingId: string, rules: CreatePriceRuleDTO[]): Promise<PaginatedResponse<PriceRule>> {
    return this.client.put(this.buildPath(`/${listingId}/price-rules`), { rules });
  }

  /**
   * Get listing rules
   */
  async getListingRules(listingId: string): Promise<SingleResponse<ListingRules | null>> {
    return this.client.get(this.buildPath(`/${listingId}/rules`));
  }

  /**
   * Upsert listing rules
   */
  async upsertListingRules(listingId: string, rules: UpsertListingRulesDTO): Promise<SingleResponse<ListingRules>> {
    return this.client.put(this.buildPath(`/${listingId}/rules`), rules);
  }
}

// =============================================================================
// Backoffice Listings Service (extended)
// =============================================================================

export interface BackofficeListingParams {
  status?: 'draft' | 'published' | 'archived';
  category?: ListingCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export class BackofficeListingsService extends BaseService {
  constructor() {
    super('/backoffice/listings');
  }

  /**
   * List all listings (any status)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async list(params?: BackofficeListingParams): Promise<PaginatedResponse<any>> {
    return this.client.get(this.buildPath(), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Create a new listing
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any): Promise<SingleResponse<any>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update a listing
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any): Promise<SingleResponse<any>> {
    return this.client.patch(this.buildPath(`/${id}`), data);
  }
}

// Singleton instances
export const backofficePriceRulesService = new BackofficePriceRulesService();
export const backofficeListingsService = new BackofficeListingsService();
