/**
 * Pricing Service
 * Server-side pricing calculation logic
 * All pricing logic MUST live here, not in UI
 */

import { mockDb } from '../../adapters/db.adapter';
import type { PricingQuoteRequest, PricingQuoteResponse, QuoteLineItem } from '../../schemas/pricing.schema';

interface PriceRule {
  id: string;
  rental_object_id: string;
  user_group_id: string | null;
  rule_type: 'HOURLY' | 'DAILY' | 'PACKAGE';
  unit: 'HOUR' | 'DAY' | 'PACKAGE';
  amount: number; // in øre
  currency: string;
  applies_weekdays: boolean;
  applies_weekends: boolean;
  package_name: string | null;
  window_start: string | null;
  window_end: string | null;
  description: string | null;
  priority: number;
}

export class PricingService {
  /**
   * Calculate price quote for a booking
   * This is the ONLY place pricing logic lives (SDK-first principle)
   */
  async calculateQuote(request: PricingQuoteRequest): Promise<PricingQuoteResponse> {
    const { rentalObjectId, start, end, userGroupId } = request;

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Determine if weekend
    const isWeekend = this.isWeekendBooking(startDate, endDate);

    // Get applicable price rules for this rental object
    const rules = await this.getPriceRules(rentalObjectId, userGroupId, isWeekend);

    if (rules.length === 0) {
      // Fallback to rental object base price
      const rentalObject = await this.getRentalObject(rentalObjectId);
      return this.createFallbackQuote(rentalObject, startDate, endDate, isWeekend, userGroupId);
    }
    
    // Find best matching rule (highest priority)
    const bestRule = this.selectBestRule(rules, userGroupId, isWeekend);
    
    // Calculate based on rule type
    const lineItems = this.calculateLineItems(bestRule, startDate, endDate);
    const totalAmount = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    return {
      lineItems,
      totalAmount,
      currency: bestRule.currency,
      ruleApplied: {
        id: bestRule.id,
        description: bestRule.description || undefined,
        ruleType: bestRule.rule_type,
      },
      isWeekend,
      userGroupId: userGroupId || null,
    };
  }

  /**
   * Check if booking spans weekend days
   */
  private isWeekendBooking(start: Date, end: Date): boolean {
    const day = start.getDay();
    // Saturday = 6, Sunday = 0
    return day === 0 || day === 6;
  }

  /**
   * Get price rules for a rental object, optionally filtered by user group
   */
  private async getPriceRules(
    rentalObjectId: string,
    userGroupId: string | null | undefined,
    isWeekend: boolean
  ): Promise<PriceRule[]> {
    // In real implementation, this would query the database
    // For now, return mock data matching our seed
    const allRules = await mockDb.query<PriceRule[]>(`
      SELECT * FROM price_rules
      WHERE rental_object_id = $1
      AND (
        (applies_weekends = $2 AND $2 = true) OR
        (applies_weekdays = $3 AND $3 = true)
      )
      ORDER BY priority DESC
    `, [rentalObjectId, isWeekend, !isWeekend]);
    
    // Handle null or return as array
    const rulesArray: PriceRule[] = Array.isArray(allRules) 
      ? (allRules as PriceRule[]) 
      : allRules ? [allRules as PriceRule] : [];
    
    // Filter to rules applicable for this user group (or general rules)
    return rulesArray.filter((rule: PriceRule) => 
      rule.user_group_id === null || 
      rule.user_group_id === userGroupId
    );
  }

  /**
   * Select the best matching rule (highest priority, most specific)
   */
  private selectBestRule(rules: PriceRule[], userGroupId: string | null | undefined, isWeekend: boolean): PriceRule {
    // Prefer user-group-specific rules over general rules
    const specificRules = rules.filter(r => r.user_group_id === userGroupId);
    if (specificRules.length > 0) {
      return specificRules.sort((a, b) => b.priority - a.priority)[0];
    }
    
    // Fall back to general rules (user_group_id = null)
    const generalRules = rules.filter(r => r.user_group_id === null);
    if (generalRules.length > 0) {
      return generalRules.sort((a, b) => b.priority - a.priority)[0];
    }
    
    // Return first available rule
    return rules[0];
  }

  /**
   * Calculate line items based on rule type
   */
  private calculateLineItems(rule: PriceRule, start: Date, end: Date): QuoteLineItem[] {
    switch (rule.rule_type) {
      case 'HOURLY':
        return this.calculateHourlyLineItems(rule, start, end);
      case 'DAILY':
        return this.calculateDailyLineItems(rule, start, end);
      case 'PACKAGE':
        return this.calculatePackageLineItems(rule, start, end);
      default:
        throw new Error(`Unknown rule type: ${rule.rule_type}`);
    }
  }

  private calculateHourlyLineItems(rule: PriceRule, start: Date, end: Date): QuoteLineItem[] {
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    return [{
      description: rule.description || 'Timeleie',
      quantity: hours,
      unitPrice: rule.amount,
      unit: 'HOUR',
      subtotal: hours * rule.amount,
      ruleId: rule.id,
    }];
  }

  private calculateDailyLineItems(rule: PriceRule, start: Date, end: Date): QuoteLineItem[] {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return [{
      description: rule.description || 'Dagsleie',
      quantity: days,
      unitPrice: rule.amount,
      unit: 'DAY',
      subtotal: days * rule.amount,
      ruleId: rule.id,
    }];
  }

  private calculatePackageLineItems(rule: PriceRule, _start: Date, _end: Date): QuoteLineItem[] {
    return [{
      description: rule.description || rule.package_name || 'Pakke',
      quantity: 1,
      unitPrice: rule.amount,
      unit: 'PACKAGE',
      subtotal: rule.amount,
      ruleId: rule.id,
    }];
  }

  /**
   * Get rental object for fallback pricing
   */
  private async getRentalObject(rentalObjectId: string): Promise<{ pricing: { basePrice: number; unit: string } }> {
    const rentalObject = await mockDb.query<any>('SELECT * FROM rental_objects WHERE id = $1', [rentalObjectId]);
    return rentalObject || { pricing: { basePrice: 0, unit: 'hour' } };
  }

  /**
   * Create fallback quote when no rules match
   */
  private createFallbackQuote(
    rentalObject: any,
    start: Date,
    end: Date,
    isWeekend: boolean,
    userGroupId: string | null | undefined
  ): PricingQuoteResponse {
    const basePrice = rentalObject?.pricing?.basePrice || 0;
    const unit = rentalObject?.pricing?.unit || 'hour';
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    return {
      lineItems: [{
        description: 'Standardpris',
        quantity: hours,
        unitPrice: basePrice * 100, // convert to øre
        unit: unit.toUpperCase() as 'HOUR' | 'DAY' | 'PACKAGE',
        subtotal: hours * basePrice * 100,
      }],
      totalAmount: hours * basePrice * 100,
      currency: 'NOK',
      ruleApplied: null,
      isWeekend,
      userGroupId: userGroupId || null,
    };
  }
}
