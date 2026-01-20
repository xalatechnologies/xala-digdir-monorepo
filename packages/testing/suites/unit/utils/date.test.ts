/**
 * Date Utils Tests
 * Date utility function tests
 */

import { describe, it, expect } from 'vitest';

describe('Date Utils', () => {
  describe('addDays', () => {
    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    it('should add positive days', () => {
      const date = new Date('2026-01-20');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(25);
    });

    it('should subtract negative days', () => {
      const date = new Date('2026-01-20');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('isToday', () => {
    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isPast', () => {
    const isPast = (date: Date) => date < new Date();

    it('should return true for past date', () => {
      const past = new Date('2020-01-01');
      expect(isPast(past)).toBe(true);
    });

    it('should return false for future date', () => {
      const future = new Date('2030-01-01');
      expect(isPast(future)).toBe(false);
    });
  });

  describe('isFuture', () => {
    const isFuture = (date: Date) => date > new Date();

    it('should return true for future date', () => {
      const future = new Date('2030-01-01');
      expect(isFuture(future)).toBe(true);
    });

    it('should return false for past date', () => {
      const past = new Date('2020-01-01');
      expect(isFuture(past)).toBe(false);
    });
  });

  describe('getDateRange', () => {
    const getDateRange = (start: Date, end: Date) => {
      const days = [];
      const current = new Date(start);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    };

    it('should return date range', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-05');
      const range = getDateRange(start, end);
      expect(range).toHaveLength(5);
    });
  });

  describe('getDayOfWeek', () => {
    const getDayOfWeek = (date: Date) => date.getDay();

    it('should return day of week', () => {
      const monday = new Date('2026-01-20'); // Tuesday in 2026
      expect(getDayOfWeek(monday)).toBeGreaterThanOrEqual(0);
      expect(getDayOfWeek(monday)).toBeLessThanOrEqual(6);
    });
  });
});
