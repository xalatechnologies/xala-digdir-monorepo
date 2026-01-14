/**
 * Unit Tests for Monitoring Hooks
 * Tests that verify monitoring hooks are properly defined
 */
import { describe, it, expect } from 'vitest';

import {
  useHealth,
  useMetrics,
  useLogs,
  useIncidents,
  useDatabaseStats,
  useApiUsage,
  useTriggerHealthCheck,
} from '../use-monitoring';

describe('Monitoring Hooks', () => {
  describe('useHealth', () => {
    it('should be defined', () => {
      expect(useHealth).toBeDefined();
      expect(typeof useHealth).toBe('function');
    });
  });

  describe('useMetrics', () => {
    it('should be defined', () => {
      expect(useMetrics).toBeDefined();
      expect(typeof useMetrics).toBe('function');
    });
  });

  describe('useLogs', () => {
    it('should be defined', () => {
      expect(useLogs).toBeDefined();
      expect(typeof useLogs).toBe('function');
    });
  });

  describe('useIncidents', () => {
    it('should be defined', () => {
      expect(useIncidents).toBeDefined();
      expect(typeof useIncidents).toBe('function');
    });
  });

  describe('useDatabaseStats', () => {
    it('should be defined', () => {
      expect(useDatabaseStats).toBeDefined();
      expect(typeof useDatabaseStats).toBe('function');
    });
  });

  describe('useApiUsage', () => {
    it('should be defined', () => {
      expect(useApiUsage).toBeDefined();
      expect(typeof useApiUsage).toBe('function');
    });
  });

  describe('useTriggerHealthCheck', () => {
    it('should be defined', () => {
      expect(useTriggerHealthCheck).toBeDefined();
      expect(typeof useTriggerHealthCheck).toBe('function');
    });
  });

  describe('Type Exports', () => {
    it('should export all necessary types', async () => {
      const module = await import('../use-monitoring');

      // Verify all hooks are exported
      expect(module).toHaveProperty('useHealth');
      expect(module).toHaveProperty('useMetrics');
      expect(module).toHaveProperty('useLogs');
      expect(module).toHaveProperty('useIncidents');
      expect(module).toHaveProperty('useDatabaseStats');
      expect(module).toHaveProperty('useApiUsage');
      expect(module).toHaveProperty('useTriggerHealthCheck');
    });
  });
});
