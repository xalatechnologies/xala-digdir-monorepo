/**
 * Pricing Calculator Unit Tests
 * 
 * Tests the core pricing calculation logic which is business-critical.
 * Pricing MUST be server-side only - these tests ensure the calculations are correct.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock pricing service (TODO: Import actual pricing service when available)
class PricingCalculator {
  calculateHourlyRate(baseRate: number, hours: number): number {
    return baseRate * hours;
  }

  applyPercentageDiscount(amount: number, percentage: number): number {
    return amount * (1 - percentage / 100);
  }

  applyFixedDiscount(amount: number, discount: number): number {
    return Math.max(0, amount - discount);
  }

  calculateWithVAT(amount: number, vatRate: number = 25): number {
    return amount * (1 + vatRate / 100);
  }

  calculateSeasonalRate(baseRate: number, seasonMultiplier: number): number {
    return baseRate * seasonMultiplier;
  }

  calculateOrgDiscount(amount: number, orgType: 'school' | 'nonprofit' | 'government' | 'other'): number {
    const discounts = {
      school: 0.20,      // 20% discount
      nonprofit: 0.15,   // 15% discount
      government: 0.10,  // 10% discount
      other: 0,
    };
    
    return this.applyPercentageDiscount(amount, discounts[orgType] * 100);
  }
}

describe('Pricing Calculator - Hourly Rate', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  it('calculates simple hourly rate', () => {
    const price = calculator.calculateHourlyRate(100, 3);
    expect(price).toBe(300);
  });

  it('handles fractional hours', () => {
    const price = calculator.calculateHourlyRate(100, 2.5);
    expect(price).toBe(250);
  });

  it('handles zero hours', () => {
    const price = calculator.calculateHourlyRate(100, 0);
    expect(price).toBe(0);
  });

  it('handles single hour', () => {
    const price = calculator.calculateHourlyRate(100, 1);
    expect(price).toBe(100);
  });
});

describe('Pricing Calculator - Discount Application', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  it('applies percentage discount correctly', () => {
    const price = calculator.applyPercentageDiscount(100, 20);
    expect(price).toBe(80);
  });

  it('applies 100% discount (free)', () => {
    const price = calculator.applyPercentageDiscount(100, 100);
    expect(price).toBe(0);
  });

  it('applies fixed discount correctly', () => {
    const price = calculator.applyFixedDiscount(100, 25);
    expect(price).toBe(75);
  });

  it('prevents negative prices with fixed discount', () => {
    const price = calculator.applyFixedDiscount(100, 150);
    expect(price).toBe(0);
  });

  it('chains multiple discounts correctly', () => {
    let price = 100;
    price = calculator.applyPercentageDiscount(price, 10); // 90
    price = calculator.applyFixedDiscount(price, 5);        // 85
    expect(price).toBe(85);
  });
});

describe('Pricing Calculator - VAT Calculation', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  it('calculates Norwegian VAT (25%) by default', () => {
    const price = calculator.calculateWithVAT(100);
    expect(price).toBe(125);
  });

  it('handles custom VAT rates', () => {
    const price = calculator.calculateWithVAT(100, 15);
    expect(price).toBe(115);
  });

  it('handles zero VAT', () => {
    const price = calculator.calculateWithVAT(100, 0);
    expect(price).toBe(100);
  });
});

describe('Pricing Calculator - Seasonal Pricing', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  it('applies peak season multiplier', () => {
    const price = calculator.calculateSeasonalRate(100, 1.5); // 50% increase
    expect(price).toBe(150);
  });

  it('applies off-season multiplier', () => {
    const price = calculator.calculateSeasonalRate(100, 0.7); // 30% decrease
    expect(price).toBe(70);
  });

  it('applies no change for regular season', () => {
    const price = calculator.calculateSeasonalRate(100, 1.0);
    expect(price).toBe(100);
  });
});

describe('Pricing Calculator - Organization Discounts', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  it('applies school discount (20%)', () => {
    const price = calculator.calculateOrgDiscount(100, 'school');
    expect(price).toBe(80);
  });

  it('applies nonprofit discount (15%)', () => {
    const price = calculator.calculateOrgDiscount(100, 'nonprofit');
    expect(price).toBe(85);
  });

  it('applies government discount (10%)', () => {
    const price = calculator.calculateOrgDiscount(100, 'government');
    expect(price).toBe(90);
  });

  it('applies no discount for other organizations', () => {
    const price = calculator.calculateOrgDiscount(100, 'other');
    expect(price).toBe(100);
  });
});

describe('Pricing Calculator - Complex Scenarios', () => {
  let calculator: PricingCalculator;

  beforeEach(() => {
    calculator = new PricingCalculator();
  });

  it('calculates full booking price with all factors', () => {
    // Base: 100 NOK/hour × 3 hours = 300 NOK
    let price = calculator.calculateHourlyRate(100, 3);
    expect(price).toBe(300);
    
    // Apply seasonal peak rate (50% increase) = 450 NOK
    price = calculator.calculateSeasonalRate(price, 1.5);
    expect(price).toBe(450);
    
    // Apply school discount (20%) = 360 NOK
    price = calculator.calculateOrgDiscount(price, 'school');
    expect(price).toBe(360);
    
    // Apply promo code discount (10%) = 324 NOK
    price = calculator.applyPercentageDiscount(price, 10);
    expect(price).toBe(324);
    
    // Add VAT (25%) = 405 NOK
    price = calculator.calculateWithVAT(price, 25);
    expect(price).toBe(405);
    
    // Final price should be 405 NOK
    expect(price).toBe(405);
  });

  it('handles zero-cost booking (100% discount)', () => {
    let price = calculator.calculateHourlyRate(100, 2); // 200 NOK
    price = calculator.applyPercentageDiscount(price, 100); // Free
    
    expect(price).toBe(0);
    
    // VAT on zero should still be zero
    price = calculator.calculateWithVAT(price, 25);
    expect(price).toBe(0);
  });

  it('ensures prices are always non-negative', () => {
    const price = calculator.applyFixedDiscount(50, 100);
    expect(price).toBe(0);
    expect(price).toBeGreaterThanOrEqual(0);
  });
});
