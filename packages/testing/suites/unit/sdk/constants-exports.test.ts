/**
 * SDK Constants Exports Tests
 * Validates SDK constants exports are available
 */

import { describe, it, expect } from 'vitest';

describe('SDK Constants Exports', () => {
  describe('LISTING_TYPE_LABELS', () => {
    it('should export LISTING_TYPE_LABELS', async () => {
      const { LISTING_TYPE_LABELS } = await import('@digilist/client-sdk');
      expect(LISTING_TYPE_LABELS).toBeDefined();
      expect(typeof LISTING_TYPE_LABELS).toBe('object');
    });
  });

  describe('LISTING_TYPE_OPTIONS', () => {
    it('should export LISTING_TYPE_OPTIONS', async () => {
      const { LISTING_TYPE_OPTIONS } = await import('@digilist/client-sdk');
      expect(LISTING_TYPE_OPTIONS).toBeDefined();
      expect(Array.isArray(LISTING_TYPE_OPTIONS)).toBe(true);
    });
  });

  describe('CAPACITY_OPTIONS', () => {
    it('should export CAPACITY_OPTIONS', async () => {
      const { CAPACITY_OPTIONS } = await import('@digilist/client-sdk');
      expect(CAPACITY_OPTIONS).toBeDefined();
      expect(Array.isArray(CAPACITY_OPTIONS)).toBe(true);
    });
  });

  describe('NOTIFICATION_TYPES_REGISTRY', () => {
    it('should export NOTIFICATION_TYPES_REGISTRY', async () => {
      const { NOTIFICATION_TYPES_REGISTRY } = await import('@digilist/client-sdk');
      expect(NOTIFICATION_TYPES_REGISTRY).toBeDefined();
    });
  });

  describe('DEFAULT_NOTIFICATION_PREFERENCES', () => {
    it('should export DEFAULT_NOTIFICATION_PREFERENCES', async () => {
      const { DEFAULT_NOTIFICATION_PREFERENCES } = await import('@digilist/client-sdk');
      expect(DEFAULT_NOTIFICATION_PREFERENCES).toBeDefined();
    });
  });
});
