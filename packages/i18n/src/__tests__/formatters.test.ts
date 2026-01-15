import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from '../formatters';

/**
 * Formatter Tests
 *
 * These tests verify:
 * 1. Currency formatting with Norwegian and English locales
 * 2. Date formatting with various options
 * 3. Number formatting with grouping and decimal precision
 *
 * Note: Intl.NumberFormat/DateTimeFormat output varies slightly by environment,
 * so we use flexible matchers where appropriate.
 */
describe('Formatters', () => {
  describe('formatCurrency', () => {
    describe('Norwegian (nb) locale', () => {
      it('should format basic currency value', () => {
        const format = formatCurrency('nb');
        const result = format(1234.56);
        // Norwegian format uses "kr" symbol and space as thousand separator
        expect(result).toMatch(/kr/);
        expect(result).toContain('1');
        expect(result).toContain('234');
      });

      it('should format zero value', () => {
        const format = formatCurrency('nb');
        const result = format(0);
        expect(result).toMatch(/kr/);
        expect(result).toContain('0');
      });

      it('should format negative value', () => {
        const format = formatCurrency('nb');
        const result = format(-500);
        expect(result).toMatch(/kr/);
        // Should contain minus sign or negative indicator
        expect(result).toMatch(/-|−/);
      });

      it('should format large values with grouping', () => {
        const format = formatCurrency('nb');
        const result = format(1234567.89);
        expect(result).toMatch(/kr/);
        // Large numbers should have separators
        expect(result).toContain('1');
        expect(result).toContain('234');
        expect(result).toContain('567');
      });

      it('should format decimal values correctly', () => {
        const format = formatCurrency('nb');
        const result = format(99.99);
        expect(result).toMatch(/kr/);
        expect(result).toMatch(/99/);
      });
    });

    describe('English (en) locale', () => {
      it('should format basic currency value', () => {
        const format = formatCurrency('en');
        const result = format(1234.56);
        // English format uses "NOK" code and comma as thousand separator
        expect(result).toMatch(/NOK/);
        expect(result).toContain('1');
        expect(result).toContain('234');
      });

      it('should format zero value', () => {
        const format = formatCurrency('en');
        const result = format(0);
        expect(result).toMatch(/NOK/);
        expect(result).toContain('0');
      });

      it('should format negative value', () => {
        const format = formatCurrency('en');
        const result = format(-500);
        expect(result).toMatch(/NOK/);
        expect(result).toMatch(/-|−/);
      });

      it('should format large values with comma grouping', () => {
        const format = formatCurrency('en');
        const result = format(1234567.89);
        expect(result).toMatch(/NOK/);
        // Should contain comma separators
        expect(result).toMatch(/1.*,.*234.*,.*567/);
      });
    });

    describe('currency options', () => {
      it('should use NOK as default currency', () => {
        const formatNb = formatCurrency('nb');
        const formatEn = formatCurrency('en');
        // Both should format as NOK
        const resultNb = formatNb(100);
        const resultEn = formatEn(100);
        expect(resultNb).toMatch(/kr/);
        expect(resultEn).toMatch(/NOK/);
      });

      it('should allow custom currency', () => {
        const format = formatCurrency('en', { currency: 'USD' });
        const result = format(100);
        // Should show USD symbol or code
        expect(result).toMatch(/\$|USD/);
      });

      it('should support currency code display', () => {
        const format = formatCurrency('nb', { currencyDisplay: 'code' });
        const result = format(100);
        expect(result).toMatch(/NOK/);
      });

      it('should support currency name display', () => {
        const format = formatCurrency('nb', { currencyDisplay: 'name' });
        const result = format(100);
        // Should contain full name (Norwegian krone or kroner)
        expect(result.toLowerCase()).toMatch(/krone/);
      });
    });

    describe('edge cases', () => {
      it('should handle very small values', () => {
        const format = formatCurrency('nb');
        const result = format(0.01);
        expect(result).toMatch(/kr/);
        expect(result).toContain('0');
        expect(result).toContain('01');
      });

      it('should handle very large values', () => {
        const format = formatCurrency('nb');
        const result = format(999999999.99);
        expect(result).toMatch(/kr/);
        // Should not throw
        expect(typeof result).toBe('string');
      });

      it('should return consistent formatter function', () => {
        const format = formatCurrency('nb');
        // Same formatter should produce consistent results
        expect(format(100)).toBe(format(100));
      });
    });
  });

  describe('formatDate', () => {
    // Use a fixed date for consistent testing
    const testDate = new Date('2026-01-15T14:30:00Z');

    describe('Norwegian (nb) locale', () => {
      it('should format date in Norwegian format (dd.mm.yyyy)', () => {
        const format = formatDate('nb');
        const result = format(testDate);
        // Norwegian format: 15.01.2026 (day.month.year)
        expect(result).toMatch(/15/);
        expect(result).toMatch(/01/);
        expect(result).toMatch(/2026/);
        // Should use dots as separators
        expect(result).toMatch(/\./);
      });

      it('should format date with time when includeTime is true', () => {
        const format = formatDate('nb', { includeTime: true });
        const result = format(testDate);
        // Should include time component
        expect(result).toMatch(/\d{2}:\d{2}/);
      });

      it('should accept Date object', () => {
        const format = formatDate('nb');
        const result = format(new Date('2026-06-20'));
        expect(result).toMatch(/20/);
        expect(result).toMatch(/06/);
        expect(result).toMatch(/2026/);
      });

      it('should accept timestamp number', () => {
        const format = formatDate('nb');
        const timestamp = new Date('2026-12-25').getTime();
        const result = format(timestamp);
        expect(result).toMatch(/25/);
        expect(result).toMatch(/12/);
        expect(result).toMatch(/2026/);
      });

      it('should accept ISO date string', () => {
        const format = formatDate('nb');
        const result = format('2026-03-10');
        expect(result).toMatch(/10/);
        expect(result).toMatch(/03/);
        expect(result).toMatch(/2026/);
      });
    });

    describe('English (en) locale', () => {
      it('should format date in US format (mm/dd/yyyy)', () => {
        const format = formatDate('en');
        const result = format(testDate);
        // US format: 1/15/2026 or 01/15/2026 (month/day/year)
        expect(result).toMatch(/15/);
        expect(result).toMatch(/2026/);
        // Should use slashes as separators
        expect(result).toMatch(/\//);
      });

      it('should format date with time when includeTime is true', () => {
        const format = formatDate('en', { includeTime: true });
        const result = format(testDate);
        // Should include time component
        expect(result).toMatch(/\d{1,2}:\d{2}/);
      });
    });

    describe('date style options', () => {
      it('should support short dateStyle', () => {
        const format = formatDate('nb', { dateStyle: 'short' });
        const result = format(testDate);
        // Short format - compact representation
        expect(result.length).toBeLessThan(20);
      });

      it('should support medium dateStyle', () => {
        const format = formatDate('nb', { dateStyle: 'medium' });
        const result = format(testDate);
        expect(result).toMatch(/2026/);
      });

      it('should support long dateStyle', () => {
        const format = formatDate('nb', { dateStyle: 'long' });
        const result = format(testDate);
        // Long format should include more detail
        expect(result).toMatch(/2026/);
      });

      it('should support full dateStyle', () => {
        const format = formatDate('nb', { dateStyle: 'full' });
        const result = format(testDate);
        // Full format should include day of week
        expect(result).toMatch(/2026/);
      });
    });

    describe('time style options', () => {
      it('should support short timeStyle', () => {
        const format = formatDate('nb', { timeStyle: 'short' });
        const result = format(testDate);
        // Short time format (HH:MM)
        expect(result).toMatch(/\d{1,2}:\d{2}/);
      });

      it('should support medium timeStyle', () => {
        const format = formatDate('nb', { timeStyle: 'medium' });
        const result = format(testDate);
        // Medium time format (HH:MM:SS)
        expect(result).toMatch(/\d{1,2}:\d{2}/);
      });
    });

    describe('edge cases', () => {
      it('should handle dates at year boundaries', () => {
        const format = formatDate('nb');
        const newYearsEve = format(new Date('2026-12-31'));
        const newYearsDay = format(new Date('2027-01-01'));
        expect(newYearsEve).toMatch(/31/);
        expect(newYearsEve).toMatch(/12/);
        expect(newYearsEve).toMatch(/2026/);
        expect(newYearsDay).toMatch(/01/);
        expect(newYearsDay).toMatch(/2027/);
      });

      it('should handle leap year date', () => {
        const format = formatDate('nb');
        const leapDay = format(new Date('2028-02-29'));
        expect(leapDay).toMatch(/29/);
        expect(leapDay).toMatch(/02/);
        expect(leapDay).toMatch(/2028/);
      });

      it('should return consistent formatter function', () => {
        const format = formatDate('nb');
        const date = new Date('2026-05-15');
        expect(format(date)).toBe(format(date));
      });
    });
  });

  describe('formatNumber', () => {
    describe('Norwegian (nb) locale', () => {
      it('should format basic number with thousand separator', () => {
        const format = formatNumber('nb');
        const result = format(1234567);
        // Norwegian uses space as thousand separator
        expect(result).toContain('1');
        expect(result).toContain('234');
        expect(result).toContain('567');
      });

      it('should format decimal numbers with comma', () => {
        const format = formatNumber('nb');
        const result = format(1234.56);
        // Norwegian uses comma as decimal separator
        expect(result).toMatch(/1.*234.*,.*56/);
      });

      it('should format zero', () => {
        const format = formatNumber('nb');
        const result = format(0);
        expect(result).toBe('0');
      });

      it('should format negative numbers', () => {
        const format = formatNumber('nb');
        const result = format(-1234);
        expect(result).toMatch(/-|−/);
        expect(result).toContain('1');
        expect(result).toContain('234');
      });
    });

    describe('English (en) locale', () => {
      it('should format basic number with comma thousand separator', () => {
        const format = formatNumber('en');
        const result = format(1234567);
        // English uses comma as thousand separator
        expect(result).toMatch(/1.*,.*234.*,.*567/);
      });

      it('should format decimal numbers with period', () => {
        const format = formatNumber('en');
        const result = format(1234.56);
        // English uses period as decimal separator
        expect(result).toMatch(/1.*,.*234\.56/);
      });

      it('should format zero', () => {
        const format = formatNumber('en');
        const result = format(0);
        expect(result).toBe('0');
      });

      it('should format negative numbers', () => {
        const format = formatNumber('en');
        const result = format(-1234);
        expect(result).toMatch(/-|−/);
        expect(result).toMatch(/1.*,.*234/);
      });
    });

    describe('number options', () => {
      it('should respect minimumFractionDigits', () => {
        const format = formatNumber('en', { minimumFractionDigits: 2 });
        const result = format(100);
        expect(result).toBe('100.00');
      });

      it('should respect maximumFractionDigits', () => {
        const format = formatNumber('en', { maximumFractionDigits: 0 });
        const result = format(1234.56);
        // Should round to nearest integer
        expect(result).toMatch(/1.*,.*235/);
      });

      it('should respect both fraction digit options', () => {
        const format = formatNumber('en', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        });
        expect(format(100)).toBe('100.00');
        expect(format(100.12345)).toMatch(/100\.1235?/);
      });

      it('should disable grouping when useGrouping is false', () => {
        const format = formatNumber('en', { useGrouping: false });
        const result = format(1234567);
        // No comma separators
        expect(result).toBe('1234567');
      });

      it('should enable grouping by default', () => {
        const format = formatNumber('en');
        const result = format(1234567);
        // Should have comma separators
        expect(result).toContain(',');
      });
    });

    describe('edge cases', () => {
      it('should handle very small decimal values', () => {
        const format = formatNumber('en', { maximumFractionDigits: 6 });
        const result = format(0.000123);
        expect(result).toContain('0');
        expect(result).toContain('000123');
      });

      it('should handle very large values', () => {
        const format = formatNumber('nb');
        const result = format(999999999999);
        // Should not throw and should contain digits
        expect(typeof result).toBe('string');
        expect(result).toContain('999');
      });

      it('should handle Infinity', () => {
        const format = formatNumber('en');
        // Intl handles Infinity as a special case
        const result = format(Infinity);
        expect(result).toMatch(/\u221e|Infinity|inf/i);
      });

      it('should handle NaN', () => {
        const format = formatNumber('en');
        const result = format(NaN);
        expect(result).toMatch(/NaN/i);
      });

      it('should return consistent formatter function', () => {
        const format = formatNumber('nb');
        expect(format(1234)).toBe(format(1234));
      });
    });
  });

  describe('locale consistency', () => {
    it('should produce different formats for nb vs en currencies', () => {
      const formatNb = formatCurrency('nb');
      const formatEn = formatCurrency('en');
      const resultNb = formatNb(1234.56);
      const resultEn = formatEn(1234.56);
      // Different symbols: kr vs NOK
      expect(resultNb).toMatch(/kr/);
      expect(resultEn).toMatch(/NOK/);
    });

    it('should produce different formats for nb vs en dates', () => {
      const formatNb = formatDate('nb');
      const formatEn = formatDate('en');
      const date = new Date('2026-01-15');
      const resultNb = formatNb(date);
      const resultEn = formatEn(date);
      // Norwegian uses dots, English uses slashes
      expect(resultNb).toMatch(/\./);
      expect(resultEn).toMatch(/\//);
    });

    it('should produce different formats for nb vs en numbers', () => {
      const formatNb = formatNumber('nb');
      const formatEn = formatNumber('en');
      const resultNb = formatNb(1234.56);
      const resultEn = formatEn(1234.56);
      // Norwegian uses comma as decimal, English uses period
      expect(resultNb).toMatch(/,/);
      expect(resultEn).toMatch(/\./);
    });
  });
});
