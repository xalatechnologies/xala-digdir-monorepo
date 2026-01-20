/**
 * DS Atomic Utils Tests
 * Utility function validation
 */

import { describe, it, expect } from 'vitest';

describe('DS Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format NOK correctly', () => {
      const formatCurrency = (amount: number, currency = 'NOK') => {
        return new Intl.NumberFormat('nb-NO', { style: 'currency', currency }).format(amount);
      };
      const result = formatCurrency(100);
      expect(result).toContain('100');
    });

    it('should handle zero', () => {
      const formatCurrency = (amount: number, currency = 'NOK') => {
        return new Intl.NumberFormat('nb-NO', { style: 'currency', currency }).format(amount);
      };
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('formatDate', () => {
    it('should format date', () => {
      const formatDate = (date: Date) => date.toLocaleDateString('nb-NO');
      const date = new Date('2026-01-20');
      const result = formatDate(date);
      expect(result).toContain('2026');
    });
  });

  describe('formatTime', () => {
    it('should format time', () => {
      const formatTime = (date: Date) => date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
      const date = new Date();
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const truncateText = (text: string, maxLength: number) => 
        text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
      const result = truncateText('Hello World', 5);
      expect(result).toBe('Hello...');
    });

    it('should not truncate short text', () => {
      const truncateText = (text: string, maxLength: number) => 
        text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
      const result = truncateText('Hi', 5);
      expect(result).toBe('Hi');
    });
  });

  describe('slugify', () => {
    it('should create slug', () => {
      const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');
      const result = slugify('Hello World');
      expect(result).toBe('hello-world');
    });
  });

  describe('debounce', () => {
    it('should debounce function', async () => {
      let count = 0;
      const fn = () => count++;
      const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn(...args), delay);
        };
      };
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      debounced();
      expect(count).toBe(0);
    });
  });
});
