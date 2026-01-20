/**
 * SDK Utils Exports Tests
 * Validates SDK utility exports are available
 */

import { describe, it, expect } from 'vitest';

describe('SDK Utils Exports', () => {
  describe('formatDate', () => {
    it('should export formatDate function', async () => {
      const { formatDate } = await import('@digilist/client-sdk');
      expect(formatDate).toBeDefined();
      expect(typeof formatDate).toBe('function');
    });
  });

  describe('formatTime', () => {
    it('should export formatTime function', async () => {
      const { formatTime } = await import('@digilist/client-sdk');
      expect(formatTime).toBeDefined();
      expect(typeof formatTime).toBe('function');
    });
  });

  describe('formatCurrency', () => {
    it('should export formatCurrency function', async () => {
      const { formatCurrency } = await import('@digilist/client-sdk');
      expect(formatCurrency).toBeDefined();
      expect(typeof formatCurrency).toBe('function');
    });
  });

  describe('formatPercent', () => {
    it('should export formatPercent function', async () => {
      const { formatPercent } = await import('@digilist/client-sdk');
      expect(formatPercent).toBeDefined();
      expect(typeof formatPercent).toBe('function');
    });
  });

  describe('formatDateTime', () => {
    it('should export formatDateTime function', async () => {
      const { formatDateTime } = await import('@digilist/client-sdk');
      expect(formatDateTime).toBeDefined();
      expect(typeof formatDateTime).toBe('function');
    });
  });

  describe('formatRelativeTime', () => {
    it('should export formatRelativeTime function', async () => {
      const { formatRelativeTime } = await import('@digilist/client-sdk');
      expect(formatRelativeTime).toBeDefined();
      expect(typeof formatRelativeTime).toBe('function');
    });
  });

  describe('formatWeekdays', () => {
    it('should export formatWeekdays function', async () => {
      const { formatWeekdays } = await import('@digilist/client-sdk');
      expect(formatWeekdays).toBeDefined();
      expect(typeof formatWeekdays).toBe('function');
    });
  });

  describe('formatBytes', () => {
    it('should export formatBytes function', async () => {
      const { formatBytes } = await import('@digilist/client-sdk');
      expect(formatBytes).toBeDefined();
      expect(typeof formatBytes).toBe('function');
    });
  });
});
