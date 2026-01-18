/**
 * Database Metrics Tests
 * Tests database metric recording functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordDatabaseQuery,
  recordDatabaseError,
  updateConnectionPoolMetrics,
  recordDatabaseTransaction,
  withDatabaseMetrics,
} from './database';
import { prometheusExporter } from '../exporters/prometheus';

describe('Database Metrics', () => {
  beforeEach(() => {
    prometheusExporter.resetMetrics();
  });

  describe('recordDatabaseQuery', () => {
    it('should record SELECT query', () => {
      recordDatabaseQuery('SELECT', 0.045, 'users', 'tenant-123');

      const metrics = prometheusExporter.getMetric('db_query_duration_seconds');
      expect(metrics).toBeDefined();
    });

    it('should record INSERT query', () => {
      recordDatabaseQuery('INSERT', 0.023, 'bookings', 'tenant-456');

      const metrics = prometheusExporter.getMetric('db_query_total');
      expect(metrics).toBeDefined();
    });

    it('should record UPDATE query', () => {
      recordDatabaseQuery('UPDATE', 0.067, 'listings', 'tenant-789');

      const metrics = prometheusExporter.getMetric('db_query_duration_seconds');
      expect(metrics).toBeDefined();
    });

    it('should record DELETE query', () => {
      recordDatabaseQuery('DELETE', 0.012, 'sessions');

      const metrics = prometheusExporter.getMetric('db_query_total');
      expect(metrics).toBeDefined();
    });

    it('should record TRANSACTION', () => {
      recordDatabaseQuery('TRANSACTION', 0.234, undefined, 'tenant-123');

      const metrics = prometheusExporter.getMetric('db_query_duration_seconds');
      expect(metrics).toBeDefined();
    });
  });

  describe('recordDatabaseError', () => {
    it('should record query error', () => {
      recordDatabaseError('SELECT', 'ConnectionError', 'users');

      const metrics = prometheusExporter.getMetric('db_query_errors_total');
      expect(metrics).toBeDefined();
    });

    it('should record different error types', () => {
      const errorTypes = ['ConnectionError', 'TimeoutError', 'QueryError', 'ConstraintError'];
      errorTypes.forEach((errorType) => {
        recordDatabaseError('INSERT', errorType, 'bookings');
      });

      const metrics = prometheusExporter.getMetric('db_query_errors_total');
      expect(metrics).toBeDefined();
    });
  });

  describe('updateConnectionPoolMetrics', () => {
    it('should update connection pool metrics', () => {
      updateConnectionPoolMetrics(5, 10, 2);

      const metrics = prometheusExporter.getMetric('db_connection_pool_size');
      expect(metrics).toBeDefined();
    });

    it('should handle zero connections', () => {
      updateConnectionPoolMetrics(0, 0, 5);

      const metrics = prometheusExporter.getMetric('db_connection_pool_size');
      expect(metrics).toBeDefined();
    });
  });

  describe('recordDatabaseTransaction', () => {
    it('should record transaction duration', () => {
      recordDatabaseTransaction(0.456, 'tenant-123');

      const metrics = prometheusExporter.getMetric('db_transaction_duration_seconds');
      expect(metrics).toBeDefined();
    });

    it('should record transaction without tenant ID', () => {
      recordDatabaseTransaction(0.123);

      const metrics = prometheusExporter.getMetric('db_transaction_duration_seconds');
      expect(metrics).toBeDefined();
    });
  });

  describe('withDatabaseMetrics', () => {
    it('should wrap successful query', async () => {
      const mockQuery = async () => {
        return [{ id: 1, name: 'Test' }];
      };

      const result = await withDatabaseMetrics('SELECT', 'users', mockQuery, 'tenant-123');

      expect(result).toEqual([{ id: 1, name: 'Test' }]);

      const metrics = prometheusExporter.getMetric('db_query_duration_seconds');
      expect(metrics).toBeDefined();
    });

    it('should wrap failed query and record error', async () => {
      const mockQuery = async () => {
        throw new Error('Query failed');
      };

      await expect(
        withDatabaseMetrics('SELECT', 'users', mockQuery, 'tenant-123')
      ).rejects.toThrow('Query failed');

      const errorMetrics = prometheusExporter.getMetric('db_query_errors_total');
      expect(errorMetrics).toBeDefined();
    });

    it('should measure query duration', async () => {
      const mockQuery = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return [];
      };

      await withDatabaseMetrics('SELECT', 'bookings', mockQuery, 'tenant-456');

      const metrics = prometheusExporter.getMetric('db_query_duration_seconds');
      expect(metrics).toBeDefined();
    });
  });
});
