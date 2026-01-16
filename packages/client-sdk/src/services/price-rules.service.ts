/**
 * Price Rules Service
 * Backoffice management of pricing rules and listing rules
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '../types/enums';

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
   * Get all price rules configured for a specific listing
   *
   * @param listingId - The listing ID to fetch rules for
   * @returns Promise resolving to paginated price rules
   *
   * @example
   * ```typescript
   * const rules = await backofficePriceRulesService.getPriceRules('listing-123');
   * rules.data.forEach(rule => {
   *   console.log(`${rule.ruleType}: ${rule.amount / 100} kr per ${rule.unit}`);
   * });
   * ```
   */
  async getPriceRules(listingId: string): Promise<PaginatedResponse<PriceRule>> {
    return this.client.get(this.buildPath(`/${listingId}/price-rules`));
  }

  /**
   * Replace all price rules for a listing (destructive operation)
   * Removes existing rules and creates new ones atomically
   *
   * @param listingId - The listing ID to update rules for
   * @param rules - Array of new price rules to set
   * @returns Promise resolving to the new set of price rules
   *
   * @example
   * ```typescript
   * // Set up pricing with weekday/weekend differential
   * const updatedRules = await backofficePriceRulesService.replacePriceRules('listing-123', [
   *   {
   *     ruleType: 'HOURLY',
   *     unit: 'HOUR',
   *     amount: 50000, // 500 kr in øre
   *     appliesWeekdays: true,
   *     appliesWeekends: false,
   *     priority: 1
   *   },
   *   {
   *     ruleType: 'HOURLY',
   *     unit: 'HOUR',
   *     amount: 75000, // 750 kr in øre
   *     appliesWeekdays: false,
   *     appliesWeekends: true,
   *     priority: 2
   *   }
   * ]);
   * ```
   */
  async replacePriceRules(listingId: string, rules: CreatePriceRuleDTO[]): Promise<PaginatedResponse<PriceRule>> {
    return this.client.put(this.buildPath(`/${listingId}/price-rules`), { rules });
  }

  /**
   * Get business rules for a listing (approval, age restrictions, cancellation policy, etc.)
   *
   * @param listingId - The listing ID to fetch rules for
   * @returns Promise resolving to listing rules or null if not configured
   *
   * @example
   * ```typescript
   * const rules = await backofficePriceRulesService.getListingRules('listing-123');
   * if (rules.data) {
   *   console.log(`Min age: ${rules.data.minAge || 'None'}`);
   *   console.log(`Approval required: ${rules.data.approvalRequired}`);
   *   console.log(`Cancellation deadline: ${rules.data.cancellationDeadlineDays} days`);
   * }
   * ```
   */
  async getListingRules(listingId: string): Promise<SingleResponse<ListingRules | null>> {
    return this.client.get(this.buildPath(`/${listingId}/rules`));
  }

  /**
   * Create or update listing rules (upsert operation)
   * Merges provided fields with existing rules
   *
   * @param listingId - The listing ID to update rules for
   * @param rules - Partial listing rules to set or update
   * @returns Promise resolving to the updated listing rules
   *
   * @example
   * ```typescript
   * // Set approval requirement and age restriction
   * const updated = await backofficePriceRulesService.upsertListingRules('listing-123', {
   *   approvalRequired: true,
   *   minAge: 18,
   *   cancellationDeadlineDays: 7,
   *   cancellationFeePercent: 25
   * });
   *
   * // Update deposit settings
   * const withDeposit = await backofficePriceRulesService.upsertListingRules('listing-456', {
   *   depositRequired: true,
   *   depositAmount: 200000 // 2000 kr in øre
   * });
   * ```
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
   * List all listings with optional filtering (any status including drafts)
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated listings
   *
   * @example
   * ```typescript
   * // Get all published gymsal listings
   * const listings = await backofficeListingsService.list({
   *   status: 'published',
   *   category: 'GYMSAL',
   *   page: 1,
   *   limit: 20
   * });
   *
   * // Search for listings by name
   * const searchResults = await backofficeListingsService.list({
   *   search: 'idrettshall',
   *   limit: 10
   * });
   * ```
   */
  async list(params?: BackofficeListingParams): Promise<PaginatedResponse<any>> {
    return this.client.get(this.buildPath(), { 
      params: params as Record<string, string | number | boolean> 
    });
  }

  /**
   * Create a new listing in backoffice
   *
   * @param data - Listing creation data
   * @returns Promise resolving to the created listing
   *
   * @example
   * ```typescript
   * const newListing = await backofficeListingsService.create({
   *   title: 'Idrettshall Sentrum',
   *   category: 'GYMSAL',
   *   status: 'draft',
   *   description: 'Modern sports hall in city center'
   * });
   * ```
   */
  async create(data: any): Promise<SingleResponse<any>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update an existing listing (partial update)
   *
   * @param id - The listing ID to update
   * @param data - Partial listing data to update
   * @returns Promise resolving to the updated listing
   *
   * @example
   * ```typescript
   * // Publish a draft listing
   * const published = await backofficeListingsService.update('listing-123', {
   *   status: 'published'
   * });
   *
   * // Update listing details
   * const updated = await backofficeListingsService.update('listing-456', {
   *   title: 'Updated Title',
   *   description: 'New description'
   * });
   * ```
   */
  async update(id: string, data: any): Promise<SingleResponse<any>> {
    return this.client.patch(this.buildPath(`/${id}`), data);
  }
}

// Singleton instances
export const backofficePriceRulesService = new BackofficePriceRulesService();
export const backofficeListingsService = new BackofficeListingsService();
