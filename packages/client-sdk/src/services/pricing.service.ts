/**
 * Pricing Service
 * Server-side pricing quote requests
 * All pricing logic lives in the API (SDK-first principle)
 */

import { BaseService } from './base.service';
import type { SingleResponse } from '../types/enums';

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
  unitPrice: number; // in øre
  unit: 'HOUR' | 'DAY' | 'PACKAGE';
  subtotal: number; // in øre
  ruleId?: string;
}

export interface PricingQuoteResponse {
  lineItems: QuoteLineItem[];
  totalAmount: number; // in øre
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

  /**
   * Get a pricing quote for a booking
   * All pricing logic is calculated server-side
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
}

// Singleton instance
export const pricingService = new PricingService();
