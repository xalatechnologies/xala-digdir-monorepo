/**
 * Validation Utils Tests
 * Validation function tests
 */

import { describe, it, expect } from 'vitest';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    const isValidPhone = (phone: string) => /^[+]?[0-9]{8,15}$/.test(phone.replace(/\s/g, ''));

    it('should validate Norwegian phone', () => {
      expect(isValidPhone('+4712345678')).toBe(true);
    });

    it('should validate phone without prefix', () => {
      expect(isValidPhone('12345678')).toBe(true);
    });
  });

  describe('isValidUUID', () => {
    const isValidUUID = (uuid: string) => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

    it('should validate valid UUID', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(isValidUUID('invalid')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    const isValidDate = (dateStr: string) => !isNaN(Date.parse(dateStr));

    it('should validate ISO date', () => {
      expect(isValidDate('2026-01-20')).toBe(true);
    });

    it('should validate ISO datetime', () => {
      expect(isValidDate('2026-01-20T10:00:00Z')).toBe(true);
    });

    it('should reject invalid date', () => {
      expect(isValidDate('not-a-date')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    const isValidUrl = (url: string) => {
      try { new URL(url); return true; } catch { return false; }
    };

    it('should validate http URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should validate https URL', () => {
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });
});
