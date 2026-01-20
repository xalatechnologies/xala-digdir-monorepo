import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatPercent,
} from '@digilist/api/formatters';

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
        const result = formatCurrency(1234.56, 'NOK', 'nb');
        // Norwegian format uses "kr" symbol and space as thousand separator
        expect(result).toMatch(/kr/);
        expect(result).toContain('1');
        expect(result).toContain('234');
      });

      it('should format zero value', () => {
        const result = formatCurrency(0, 'NOK', 'nb');
        expect(result).toMatch(/kr/);
        expect(result).toContain('0');
      });

      it('should format negative value', () => {
        const result = formatCurrency(-500, 'NOK', 'nb');
        expect(result).toMatch(/kr/);
        // Should contain minus sign or negative indicator
        expect(result).toMatch(/-|−/);
      });

      it('should format large values with grouping', () => {
        const result = formatCurrency(1234567.89, 'NOK', 'nb');
        expect(result).toMatch(/kr/);
        // Large numbers should have separators
        expect(result).toContain('1');
        expect(result).toContain('234');
        expect(result).toContain('567');
      });

      it('should format decimal values correctly', () => {
        const result = formatCurrency(99.99, 'NOK', 'nb');
        expect(result).toMatch(/kr/);
        expect(result).toMatch(/99/);
      });
    });

    describe('English (en) locale', () => {
      it('should format basic currency value', () => {
        const result = formatCurrency(1234.56, 'NOK', 'en');
        // English format uses "NOK" code and comma as thousand separator
        expect(result).toMatch(/NOK/);
        expect(result).toContain('1');
        expect(result).toContain('234');
      });

      it('should format zero value', () => {
        const result = formatCurrency(0, 'NOK', 'en');
        expect(result).toMatch(/NOK/);
        expect(result).toContain('0');
      });

      it('should format negative value', () => {
        const result = formatCurrency(-500, 'NOK', 'en');
        expect(result).toMatch(/NOK/);
        expect(result).toMatch(/-|−/);
      });

      it('should format large values with comma grouping', () => {
        const result = formatCurrency(1234567.89, 'NOK', 'en');
        expect(result).toMatch(/NOK/);
        // Should contain comma separators
        expect(result).toMatch(/1.*,.*234.*,.*567/);
      });
    });

    describe('currency options', () => {
      it('should use NOK as default currency', () => {
        const resultNb = formatCurrency(100, 'NOK', 'nb');
        const resultEn = formatCurrency(100, 'NOK', 'en');
        // Both should format as NOK
        expect(resultNb).toMatch(/kr/);
        expect(resultEn).toMatch(/NOK/);
      });

      it('should allow custom currency', () => {
        const result = formatCurrency(100, 'USD', 'en');
        // Should show USD symbol or code
        expect(result).toMatch(/\$|USD/);
      });

      it('should support currency code display', () => {
        const result = formatCurrency(100, 'NOK', 'nb', { currencyDisplay: 'code' });
        expect(result).toMatch(/NOK/);
      });

      it('should support currency name display', () => {
        const result = formatCurrency(100, 'NOK', 'nb', { currencyDisplay: 'name' });
        // Should contain full name (Norwegian krone or kroner)
        expect(result.toLowerCase()).toMatch(/krone/);
      });
    });

    describe('edge cases', () => {
      it('should handle very small values', () => {
        const result = formatCurrency(0.01, 'NOK', 'nb');
        expect(result).toMatch(/kr/);
        expect(result).toContain('0');
        expect(result).toContain('01');
      });

      it('should handle very large values', () => {
        const result = formatCurrency(999999999.99, 'NOK', 'nb');
        expect(result).toMatch(/kr/);
        // Should not throw
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('formatDate', () => {
    // Use a fixed date for consistent testing
    const testDate = new Date('2026-01-15T14:30:00Z');

    describe('Norwegian (nb) locale', () => {
      it('should format date in Norwegian format (dd.mm.yyyy)', () => {
        const result = formatDate(testDate, 'nb');
        // Norwegian format: 15.01.2026 (day.month.year)
        expect(result).toMatch(/15/);
        expect(result).toMatch(/01/);
        expect(result).toMatch(/2026/);
        // Should use dots as separators
        expect(result).toMatch(/\./);
      });

      it('should accept Date object', () => {
        const result = formatDate(new Date('2026-06-20'), 'nb');
        expect(result).toMatch(/20/);
        expect(result).toMatch(/06/);
        expect(result).toMatch(/2026/);
      });

      it('should accept ISO date string', () => {
        const result = formatDate('2026-03-10', 'nb');
        expect(result).toMatch(/10/);
        expect(result).toMatch(/03/);
        expect(result).toMatch(/2026/);
      });

      it('should return empty string for invalid date', () => {
        const result = formatDate('invalid-date', 'nb');
        expect(result).toBe('');
      });
    });

    describe('English (en) locale', () => {
      it('should format date in US format (mm/dd/yyyy)', () => {
        const result = formatDate(testDate, 'en');
        // US format: 1/15/2026 or 01/15/2026 (month/day/year)
        expect(result).toMatch(/15/);
        expect(result).toMatch(/2026/);
        // Should use slashes as separators
        expect(result).toMatch(/\//);
      });
    });

    describe('edge cases', () => {
      it('should handle dates at year boundaries', () => {
        const newYearsEve = formatDate(new Date('2026-12-31'), 'nb');
        const newYearsDay = formatDate(new Date('2027-01-01'), 'nb');
        expect(newYearsEve).toMatch(/31/);
        expect(newYearsEve).toMatch(/12/);
        expect(newYearsEve).toMatch(/2026/);
        expect(newYearsDay).toMatch(/01/);
        expect(newYearsDay).toMatch(/2027/);
      });

      it('should handle leap year date', () => {
        const leapDay = formatDate(new Date('2028-02-29'), 'nb');
        expect(leapDay).toMatch(/29/);
        expect(leapDay).toMatch(/02/);
        expect(leapDay).toMatch(/2028/);
      });
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2026-01-15T14:30:00Z');

    it('should format time in Norwegian format (24h)', () => {
      const result = formatTime(testDate, 'nb');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should format time in English format (12h)', () => {
      const result = formatTime(testDate, 'en');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should return empty string for invalid date', () => {
      const result = formatTime('invalid-date', 'nb');
      expect(result).toBe('');
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2026-01-15T14:30:00Z');

    it('should format date and time in Norwegian format', () => {
      const result = formatDateTime(testDate, 'nb');
      // Should contain date parts
      expect(result).toMatch(/15/);
      expect(result).toMatch(/01/);
      expect(result).toMatch(/2026/);
      // Should contain time parts
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should format date and time in English format', () => {
      const result = formatDateTime(testDate, 'en');
      expect(result).toMatch(/2026/);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should return empty string for invalid date', () => {
      const result = formatDateTime('invalid-date', 'nb');
      expect(result).toBe('');
    });
  });

  describe('formatNumber', () => {
    describe('Norwegian (nb) locale', () => {
      it('should format basic number with thousand separator', () => {
        const result = formatNumber(1234567, 'nb');
        // Norwegian uses space as thousand separator
        expect(result).toContain('1');
        expect(result).toContain('234');
        expect(result).toContain('567');
      });

      it('should format decimal numbers with comma', () => {
        const result = formatNumber(1234.56, 'nb');
        // Norwegian uses comma as decimal separator
        expect(result).toMatch(/1.*234.*,.*56/);
      });

      it('should format zero', () => {
        const result = formatNumber(0, 'nb');
        expect(result).toBe('0');
      });

      it('should format negative numbers', () => {
        const result = formatNumber(-1234, 'nb');
        expect(result).toMatch(/-|−/);
        expect(result).toContain('1');
        expect(result).toContain('234');
      });
    });

    describe('English (en) locale', () => {
      it('should format basic number with comma thousand separator', () => {
        const result = formatNumber(1234567, 'en');
        // English uses comma as thousand separator
        expect(result).toMatch(/1.*,.*234.*,.*567/);
      });

      it('should format decimal numbers with period', () => {
        const result = formatNumber(1234.56, 'en');
        // English uses period as decimal separator
        expect(result).toMatch(/1.*,.*234\.56/);
      });

      it('should format zero', () => {
        const result = formatNumber(0, 'en');
        expect(result).toBe('0');
      });

      it('should format negative numbers', () => {
        const result = formatNumber(-1234, 'en');
        expect(result).toMatch(/-|−/);
        expect(result).toMatch(/1.*,.*234/);
      });
    });

    describe('number options', () => {
      it('should respect minimumFractionDigits', () => {
        const result = formatNumber(100, 'en', { minimumFractionDigits: 2 });
        expect(result).toBe('100.00');
      });

      it('should respect maximumFractionDigits', () => {
        const result = formatNumber(1234.56, 'en', { maximumFractionDigits: 0 });
        // Should round to nearest integer
        expect(result).toMatch(/1.*,.*235/);
      });

      it('should disable grouping when useGrouping is false', () => {
        const result = formatNumber(1234567, 'en', { useGrouping: false });
        // No comma separators
        expect(result).toBe('1234567');
      });

      it('should enable grouping by default', () => {
        const result = formatNumber(1234567, 'en');
        // Should have comma separators
        expect(result).toContain(',');
      });
    });

    describe('edge cases', () => {
      it('should handle very small decimal values', () => {
        const result = formatNumber(0.000123, 'en', { maximumFractionDigits: 6 });
        expect(result).toContain('0');
        expect(result).toContain('000123');
      });

      it('should handle very large values', () => {
        const result = formatNumber(999999999999, 'nb');
        // Should not throw and should contain digits
        expect(typeof result).toBe('string');
        expect(result).toContain('999');
      });

      it('should handle Infinity', () => {
        // Intl handles Infinity as a special case
        const result = formatNumber(Infinity, 'en');
        expect(result).toMatch(/\u221e|Infinity|inf/i);
      });

      it('should handle NaN', () => {
        const result = formatNumber(NaN, 'en');
        expect(result).toMatch(/NaN/i);
      });
    });
  });

  describe('formatPercent', () => {
    it('should format percentage in Norwegian format', () => {
      const result = formatPercent(0.75, 'nb');
      expect(result).toMatch(/75/);
      expect(result).toMatch(/%/);
    });

    it('should format percentage in English format', () => {
      const result = formatPercent(0.75, 'en');
      expect(result).toMatch(/75/);
      expect(result).toMatch(/%/);
    });

    it('should format zero percentage', () => {
      const result = formatPercent(0, 'nb');
      expect(result).toMatch(/0/);
      expect(result).toMatch(/%/);
    });

    it('should format 100% correctly', () => {
      const result = formatPercent(1, 'nb');
      expect(result).toMatch(/100/);
      expect(result).toMatch(/%/);
    });
  });

  describe('locale consistency', () => {
    it('should produce different formats for nb vs en currencies', () => {
      const resultNb = formatCurrency(1234.56, 'NOK', 'nb');
      const resultEn = formatCurrency(1234.56, 'NOK', 'en');
      // Different symbols: kr vs NOK
      expect(resultNb).toMatch(/kr/);
      expect(resultEn).toMatch(/NOK/);
    });

    it('should produce different formats for nb vs en dates', () => {
      const date = new Date('2026-01-15');
      const resultNb = formatDate(date, 'nb');
      const resultEn = formatDate(date, 'en');
      // Norwegian uses dots, English uses slashes
      expect(resultNb).toMatch(/\./);
      expect(resultEn).toMatch(/\//);
    });

    it('should produce different formats for nb vs en numbers', () => {
      const resultNb = formatNumber(1234.56, 'nb');
      const resultEn = formatNumber(1234.56, 'en');
      // Norwegian uses comma as decimal, English uses period
      expect(resultNb).toMatch(/,/);
      expect(resultEn).toMatch(/\./);
    });
  });
});
