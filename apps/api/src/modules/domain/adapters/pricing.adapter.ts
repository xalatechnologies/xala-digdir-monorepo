/**
 * Pricing Domain Adapter
 * 
 * Wraps the existing PricingService with policy-aware behavior.
 * Falls back to legacy logic when policies are unavailable.
 * 
 * @module domain/adapters/pricing
 * @since 1.0.0
 */

import { BaseDomainAdapter, DomainGroup, type AdapterConfig, type AdapterContext, type AdapterResult } from './base.adapter';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Policy projection interface (mirrors policy.service.ts)
 */
export interface PolicyProjection {
  booking?: Record<string, unknown>;
  pricing?: Record<string, unknown> & { basePricing?: Record<string, unknown> };
  approval?: Record<string, unknown>;
  availability?: Record<string, unknown>;
}

/**
 * Pricing policy rules interface
 */
export interface PricingPolicyRules {
  basePricing?: {
    defaultHourlyRate?: number;
    defaultDailyRate?: number;
    currency?: string;
  };
  discountRules?: {
    memberDiscount?: number;
  };
}

/**
 * Policy service interface
 */
export interface PolicyServiceInterface {
  getProjection(tenantId: string, rentalObjectId?: string): Promise<PolicyProjection | null>;
}

/**
 * Price quote request
 */
export interface PriceQuoteRequest {
  rentalObjectId: string;
  startTime: Date | string;
  endTime: Date | string;
  addons?: Array<{ addonId: string; quantity: number }>;
  userGroupId?: string;
  discountCode?: string;
}

/**
 * Price breakdown item
 */
export interface PriceBreakdownItem {
  label: string;
  amount: number;
  type: 'base' | 'addon' | 'discount' | 'tax' | 'subtotal' | 'total';
}

/**
 * Price quote response
 */
export interface PriceQuoteDTO {
  rentalObjectId: string;
  basePrice: number;
  addonsTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  breakdown: PriceBreakdownItem[];
  appliedDiscounts: string[];
  userGroupDiscount?: number;
}

/**
 * Minimal interface for legacy PricingService
 */
export interface LegacyPricingService {
  calculateQuote(request: PriceQuoteRequest, context: { tenantId: string; userId?: string }): Promise<PriceQuoteDTO>;
  getPricingForRentalObject(rentalObjectId: string, context: { tenantId: string }): Promise<{
    hourlyRate: number;
    dailyRate: number;
    currency: string;
  }>;
}

// =============================================================================
// ADAPTER
// =============================================================================

/**
 * PricingDomainAdapter
 * Wraps PricingService with policy-driven behavior
 */
export class PricingDomainAdapter extends BaseDomainAdapter<LegacyPricingService> {
  private policyService?: PolicyServiceInterface;

  constructor(
    legacyService: LegacyPricingService,
    config: Partial<AdapterConfig> = {},
    policyService?: PolicyServiceInterface
  ) {
    super(legacyService, DomainGroup.BOOKING_RENTALS, config);
    this.policyService = policyService;
  }

  /**
   * Calculate price quote with policy-driven discounts
   */
  async calculateQuote(
    request: PriceQuoteRequest,
    context: AdapterContext
  ): Promise<AdapterResult<PriceQuoteDTO>> {
    return this.executeWithFallback(
      'calculateQuote',
      context,
      // Policy executor
      async () => {
        const policy = await this.getPricingPolicy(context.tenantId, request.rentalObjectId);
        
        // Get base quote from legacy
        const legacyQuote = await this.legacyService.calculateQuote(request, {
          tenantId: context.tenantId,
          userId: context.userId,
        });

        if (policy?.pricing) {
          // Apply policy-driven adjustments
          return this.applyPolicyAdjustments(legacyQuote, policy.pricing, request);
        }

        return legacyQuote;
      },
      // Legacy executor
      async () => {
        return this.legacyService.calculateQuote(request, {
          tenantId: context.tenantId,
          userId: context.userId,
        });
      }
    );
  }

  /**
   * Get pricing for rental object
   */
  async getPricingForRentalObject(
    rentalObjectId: string,
    context: AdapterContext
  ): Promise<AdapterResult<{ hourlyRate: number; dailyRate: number; currency: string }>> {
    return this.executeWithFallback(
      'getPricingForRentalObject',
      context,
      async () => {
        const policy = await this.getPricingPolicy(context.tenantId, rentalObjectId);
        
        // Get base pricing from legacy
        const basePricing = await this.legacyService.getPricingForRentalObject(rentalObjectId, {
          tenantId: context.tenantId,
        });

        if (policy?.pricing?.basePricing) {
          // Override with policy defaults if base is zero
          return {
            hourlyRate: basePricing.hourlyRate || (policy.pricing.basePricing as any).defaultHourlyRate || 0,
            dailyRate: basePricing.dailyRate || (policy.pricing.basePricing as any).defaultDailyRate || 0,
            currency: basePricing.currency || (policy.pricing.basePricing as any).currency || 'NOK',
          };
        }

        return basePricing;
      },
      async () => {
        return this.legacyService.getPricingForRentalObject(rentalObjectId, {
          tenantId: context.tenantId,
        });
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Get pricing policy for rental object
   */
  private async getPricingPolicy(
    tenantId: string,
    rentalObjectId?: string
  ): Promise<PolicyProjection | null> {
    if (!this.policyService) {
      return null;
    }

    try {
      return await this.policyService.getProjection(tenantId, rentalObjectId);
    } catch (error) {
      this.logger.warn('Failed to get pricing policy', { error });
      return null;
    }
  }

  /**
   * Apply policy-driven adjustments to quote
   */
  private applyPolicyAdjustments(
    quote: PriceQuoteDTO,
    pricingPolicy: PricingPolicyRules,
    request: PriceQuoteRequest
  ): PriceQuoteDTO {
    const adjustedQuote = { ...quote };
    const breakdown = [...quote.breakdown];
    const appliedDiscounts = [...quote.appliedDiscounts];

    // Apply member discount from policy
    const discountRules = pricingPolicy.discountRules as { memberDiscount?: number } | undefined;
    
    if (discountRules?.memberDiscount && request.userGroupId) {
      const memberDiscountPercent = discountRules.memberDiscount;
      const memberDiscountAmount = Math.round(quote.basePrice * (memberDiscountPercent / 100));
      
      adjustedQuote.discountAmount += memberDiscountAmount;
      adjustedQuote.totalAmount -= memberDiscountAmount;
      adjustedQuote.userGroupDiscount = memberDiscountPercent;
      
      breakdown.push({
        label: `Member discount (${memberDiscountPercent}%)`,
        amount: -memberDiscountAmount,
        type: 'discount',
      });
      
      appliedDiscounts.push('MEMBER_DISCOUNT');
    }

    adjustedQuote.breakdown = breakdown;
    adjustedQuote.appliedDiscounts = appliedDiscounts;

    return adjustedQuote;
  }
}
