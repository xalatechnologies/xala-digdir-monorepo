/**
 * Price Calculation Service Tests
 * 
 * Tests pricing logic for bookings
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// TYPES
// =============================================================================

interface PricingRule {
  type: 'hourly' | 'daily' | 'flat';
  basePrice: number;
  currency: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
}

interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  minHours?: number;
}

interface PriceCalculation {
  basePrice: number;
  hours: number;
  discounts: { name: string; amount: number }[];
  totalBeforeVat: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  currency: string;
}

// =============================================================================
// PRICING LOGIC
// =============================================================================

function calculateDurationHours(slot: TimeSlot): number {
  return (slot.end.getTime() - slot.start.getTime()) / (1000 * 60 * 60);
}

function calculateBasePrice(slot: TimeSlot, rule: PricingRule): number {
  const hours = calculateDurationHours(slot);
  
  switch (rule.type) {
    case 'hourly':
      return hours * rule.basePrice;
    case 'daily':
      const days = Math.ceil(hours / 24);
      return days * rule.basePrice;
    case 'flat':
      return rule.basePrice;
    default:
      return 0;
  }
}

function applyDiscounts(
  basePrice: number,
  discounts: Discount[],
  hours: number
): { name: string; amount: number }[] {
  const appliedDiscounts: { name: string; amount: number }[] = [];
  
  for (const discount of discounts) {
    if (discount.minHours && hours < discount.minHours) {
      continue;
    }
    
    const amount = discount.type === 'percentage'
      ? basePrice * (discount.value / 100)
      : discount.value;
    
    appliedDiscounts.push({
      name: `${discount.type === 'percentage' ? discount.value + '%' : discount.value + ' kr'} rabatt`,
      amount: Math.round(amount * 100) / 100,
    });
  }
  
  return appliedDiscounts;
}

function calculatePrice(
  slot: TimeSlot,
  rule: PricingRule,
  discounts: Discount[],
  vatRate: number = 25
): PriceCalculation {
  const hours = calculateDurationHours(slot);
  const basePrice = calculateBasePrice(slot, rule);
  const appliedDiscounts = applyDiscounts(basePrice, discounts, hours);
  
  const totalDiscounts = appliedDiscounts.reduce((sum, d) => sum + d.amount, 0);
  const totalBeforeVat = basePrice - totalDiscounts;
  const vatAmount = totalBeforeVat * (vatRate / 100);
  
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    hours,
    discounts: appliedDiscounts,
    totalBeforeVat: Math.round(totalBeforeVat * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    vatRate,
    total: Math.round((totalBeforeVat + vatAmount) * 100) / 100,
    currency: rule.currency,
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('Price Calculation Service', () => {
  describe('calculateDurationHours', () => {
    it('should calculate hours correctly', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T09:00:00Z'),
        end: new Date('2026-01-20T12:00:00Z'),
      };
      
      expect(calculateDurationHours(slot)).toBe(3);
    });

    it('should handle partial hours', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T09:00:00Z'),
        end: new Date('2026-01-20T10:30:00Z'),
      };
      
      expect(calculateDurationHours(slot)).toBe(1.5);
    });
  });

  describe('calculateBasePrice', () => {
    it('should calculate hourly pricing', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T09:00:00Z'),
        end: new Date('2026-01-20T12:00:00Z'),
      };
      
      const rule: PricingRule = {
        type: 'hourly',
        basePrice: 500,
        currency: 'NOK',
      };
      
      expect(calculateBasePrice(slot, rule)).toBe(1500); // 3 hours * 500
    });

    it('should calculate daily pricing', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T00:00:00Z'),
        end: new Date('2026-01-21T00:00:00Z'),
      };
      
      const rule: PricingRule = {
        type: 'daily',
        basePrice: 2000,
        currency: 'NOK',
      };
      
      expect(calculateBasePrice(slot, rule)).toBe(2000);
    });

    it('should calculate flat pricing', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T09:00:00Z'),
        end: new Date('2026-01-20T17:00:00Z'),
      };
      
      const rule: PricingRule = {
        type: 'flat',
        basePrice: 1000,
        currency: 'NOK',
      };
      
      expect(calculateBasePrice(slot, rule)).toBe(1000);
    });
  });

  describe('applyDiscounts', () => {
    it('should apply percentage discount', () => {
      const discounts: Discount[] = [
        { type: 'percentage', value: 10 },
      ];
      
      const applied = applyDiscounts(1000, discounts, 2);
      
      expect(applied).toHaveLength(1);
      expect(applied[0].amount).toBe(100);
    });

    it('should apply fixed discount', () => {
      const discounts: Discount[] = [
        { type: 'fixed', value: 150 },
      ];
      
      const applied = applyDiscounts(1000, discounts, 2);
      
      expect(applied).toHaveLength(1);
      expect(applied[0].amount).toBe(150);
    });

    it('should not apply discount if minHours not met', () => {
      const discounts: Discount[] = [
        { type: 'percentage', value: 20, minHours: 4 },
      ];
      
      const applied = applyDiscounts(1000, discounts, 2);
      
      expect(applied).toHaveLength(0);
    });

    it('should apply discount if minHours met', () => {
      const discounts: Discount[] = [
        { type: 'percentage', value: 20, minHours: 4 },
      ];
      
      const applied = applyDiscounts(1000, discounts, 5);
      
      expect(applied).toHaveLength(1);
      expect(applied[0].amount).toBe(200);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate full price with VAT', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T09:00:00Z'),
        end: new Date('2026-01-20T11:00:00Z'),
      };
      
      const rule: PricingRule = {
        type: 'hourly',
        basePrice: 500,
        currency: 'NOK',
      };
      
      const result = calculatePrice(slot, rule, [], 25);
      
      expect(result.basePrice).toBe(1000);
      expect(result.hours).toBe(2);
      expect(result.totalBeforeVat).toBe(1000);
      expect(result.vatAmount).toBe(250);
      expect(result.total).toBe(1250);
      expect(result.currency).toBe('NOK');
    });

    it('should apply discounts before VAT', () => {
      const slot: TimeSlot = {
        start: new Date('2026-01-20T09:00:00Z'),
        end: new Date('2026-01-20T11:00:00Z'),
      };
      
      const rule: PricingRule = {
        type: 'hourly',
        basePrice: 500,
        currency: 'NOK',
      };
      
      const discounts: Discount[] = [
        { type: 'percentage', value: 10 },
      ];
      
      const result = calculatePrice(slot, rule, discounts, 25);
      
      expect(result.basePrice).toBe(1000);
      expect(result.discounts[0].amount).toBe(100);
      expect(result.totalBeforeVat).toBe(900);
      expect(result.vatAmount).toBe(225);
      expect(result.total).toBe(1125);
    });
  });
});
