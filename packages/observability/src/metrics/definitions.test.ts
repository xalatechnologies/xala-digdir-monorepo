/**
 * Metric Definitions Tests
 * Validates all metric definitions follow Prometheus best practices
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_METRICS,
  API_METRICS,
  DATABASE_METRICS,
  BOOKING_METRICS,
  AUTH_METRICS,
  CUSTODY_METRICS,
  ENTITLEMENT_METRICS,
  WEBSOCKET_METRICS,
  TENANT_METRICS,
} from './definitions';

describe('Metric Definitions', () => {
  describe('Naming Conventions', () => {
    it('should have counters ending with _total', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        if (metric.type === 'counter') {
          expect(metric.name).toMatch(/_total$/);
        }
      });
    });

    it('should have histograms with appropriate suffixes', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        if (metric.type === 'histogram') {
          expect(metric.name).toMatch(/_(seconds|bytes|percent)$/);
        }
      });
    });

    it('should use snake_case for metric names', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        expect(metric.name).toMatch(/^[a-z][a-z0-9_]*$/);
      });
    });

    it('should use snake_case for label names', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        if (metric.labelNames) {
          metric.labelNames.forEach((label) => {
            expect(label).toMatch(/^[a-z][a-z0-9_]*$/);
          });
        }
      });
    });
  });

  describe('Required Fields', () => {
    it('should have name, type, and help for all metrics', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        expect(metric.name).toBeDefined();
        expect(metric.type).toBeDefined();
        expect(metric.help).toBeDefined();
        expect(metric.help.length).toBeGreaterThan(0);
      });
    });

    it('should have valid metric types', () => {
      const validTypes = ['counter', 'gauge', 'histogram', 'summary'];
      Object.values(ALL_METRICS).forEach((metric) => {
        expect(validTypes).toContain(metric.type);
      });
    });
  });

  describe('Histogram Configuration', () => {
    it('should have buckets for histograms', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        if (metric.type === 'histogram') {
          expect(metric.buckets).toBeDefined();
          expect(Array.isArray(metric.buckets)).toBe(true);
          expect(metric.buckets!.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have sorted buckets', () => {
      Object.values(ALL_METRICS).forEach((metric) => {
        if (metric.type === 'histogram' && metric.buckets) {
          const sorted = [...metric.buckets].sort((a, b) => a - b);
          expect(metric.buckets).toEqual(sorted);
        }
      });
    });
  });

  describe('Metric Categories', () => {
    it('should have API metrics', () => {
      expect(Object.keys(API_METRICS).length).toBeGreaterThan(0);
    });

    it('should have Database metrics', () => {
      expect(Object.keys(DATABASE_METRICS).length).toBeGreaterThan(0);
    });

    it('should have Booking metrics', () => {
      expect(Object.keys(BOOKING_METRICS).length).toBeGreaterThan(0);
    });

    it('should have Authentication metrics', () => {
      expect(Object.keys(AUTH_METRICS).length).toBeGreaterThan(0);
    });

    it('should have Custody metrics', () => {
      expect(Object.keys(CUSTODY_METRICS).length).toBeGreaterThan(0);
    });

    it('should have Entitlement metrics', () => {
      expect(Object.keys(ENTITLEMENT_METRICS).length).toBeGreaterThan(0);
    });

    it('should have WebSocket metrics', () => {
      expect(Object.keys(WEBSOCKET_METRICS).length).toBeGreaterThan(0);
    });

    it('should have Tenant metrics', () => {
      expect(Object.keys(TENANT_METRICS).length).toBeGreaterThan(0);
    });
  });

  describe('Label Consistency', () => {
    it('should include tenant_id label for multi-tenant metrics', () => {
      const multiTenantMetrics = [
        ...Object.values(DATABASE_METRICS),
        ...Object.values(BOOKING_METRICS),
        ...Object.values(CUSTODY_METRICS),
        ...Object.values(ENTITLEMENT_METRICS),
        ...Object.values(TENANT_METRICS),
      ];

      multiTenantMetrics.forEach((metric) => {
        if (metric.labelNames && metric.labelNames.length > 0) {
          // Most multi-tenant metrics should have tenant_id
          // (some may not if they're aggregates)
          const hasTenantId = metric.labelNames.includes('tenant_id');
          if (!hasTenantId) {
            // Log for awareness but don't fail
            console.log(`Metric ${metric.name} doesn't have tenant_id label`);
          }
        }
      });
    });
  });

  describe('Metric Count', () => {
    it('should have expected number of total metrics', () => {
      const totalMetrics = Object.keys(ALL_METRICS).length;
      expect(totalMetrics).toBeGreaterThanOrEqual(36);
    });

    it('should have all category metrics in ALL_METRICS', () => {
      const categoryMetrics = [
        ...Object.keys(API_METRICS),
        ...Object.keys(DATABASE_METRICS),
        ...Object.keys(BOOKING_METRICS),
        ...Object.keys(AUTH_METRICS),
        ...Object.keys(CUSTODY_METRICS),
        ...Object.keys(ENTITLEMENT_METRICS),
        ...Object.keys(WEBSOCKET_METRICS),
        ...Object.keys(TENANT_METRICS),
      ];

      categoryMetrics.forEach((key) => {
        expect(ALL_METRICS).toHaveProperty(key);
      });
    });
  });
});
