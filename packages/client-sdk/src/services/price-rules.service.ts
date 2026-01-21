/**
 * Price Rules Service
 * Backoffice management of pricing rules and rental object rules
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '@/types/enums';
import type { RentalObjectCategory } from '@/types/rental-object';

// =============================================================================
// Types
// =============================================================================

export type PriceRuleType = 'HOURLY' | 'DAILY' | 'PACKAGE';
export type PriceUnit = 'HOUR' | 'DAY' | 'PACKAGE';

export interface PriceRule {
  id: string;
  rentalObjectId: string;
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
  rentalObjectId?: string; // Optional when using /rental-objects/:id/price-rules endpoint
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

export interface RentalObjectRules {
  id: string;
  rentalObjectId: string;
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

export interface UpsertRentalObjectRulesDTO {
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
    super('/backoffice/rental-objects');
  }

  /**
   * Get price rules for a rental object
   */
  async getPriceRules(rentalObjectId: string): Promise<PaginatedResponse<PriceRule>> {
    return this.client.get(this.buildPath(`/${rentalObjectId}/price-rules`));
  }

  /**
   * Replace all price rules for a rental object
   */
  async replacePriceRules(rentalObjectId: string, rules: CreatePriceRuleDTO[]): Promise<PaginatedResponse<PriceRule>> {
    return this.client.put(this.buildPath(`/${rentalObjectId}/price-rules`), { rules });
  }

  /**
   * Get rental object rules
   */
  async getRentalObjectRules(rentalObjectId: string): Promise<SingleResponse<RentalObjectRules | null>> {
    return this.client.get(this.buildPath(`/${rentalObjectId}/rules`));
  }

  /**
   * Upsert rental object rules
   */
  async upsertRentalObjectRules(rentalObjectId: string, rules: UpsertRentalObjectRulesDTO): Promise<SingleResponse<RentalObjectRules>> {
    return this.client.put(this.buildPath(`/${rentalObjectId}/rules`), rules);
  }
}

// =============================================================================
// Backoffice Rental Objects Service (extended)
// =============================================================================

export interface BackofficeRentalObjectParams {
  status?: 'draft' | 'published' | 'archived';
  category?: RentalObjectCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export class BackofficeRentalObjectsService extends BaseService {
  constructor() {
    super('/backoffice/rental-objects');
  }

  /**
   * List all rental objects (any status)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async list(params?: BackofficeRentalObjectParams): Promise<PaginatedResponse<any>> {
    return this.client.get(this.buildPath(), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Create a new rental object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any): Promise<SingleResponse<any>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update a rental object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any): Promise<SingleResponse<any>> {
    return this.client.patch(this.buildPath(`/${id}`), data);
  }
}

// Singleton instances
export const backofficePriceRulesService = new BackofficePriceRulesService();
export const backofficeRentalObjectsService = new BackofficeRentalObjectsService();

// Legacy aliases for backward compatibility
/** @deprecated Use BackofficeRentalObjectParams */
export type BackofficeListingParams = BackofficeRentalObjectParams;
/** @deprecated Use RentalObjectRules */
export type ListingRules = RentalObjectRules;
/** @deprecated Use UpsertRentalObjectRulesDTO */
export type UpsertListingRulesDTO = UpsertRentalObjectRulesDTO;
/** @deprecated Use backofficeRentalObjectsService */
export const backofficeListingsService = backofficeRentalObjectsService;
