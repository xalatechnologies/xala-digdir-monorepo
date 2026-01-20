/**
 * Prometheus Integration Tests
 * Tests Prometheus configuration and scraping
 */

import { describe, it, expect } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';

// TODO: Skipped - needs implementation
describe.skip('Prometheus Integration', () => {
  setupMockApi();
  const prometheusConfig = parse(
    readFileSync(resolve(__dirname, '../../prometheus/prometheus.yml'), 'utf-8')
  );

  describe('Configuration', () => {
  setupMockApi();
    it('should have valid global configuration', () => {
      expect(prometheusConfig.global).toBeDefined();
      expect(prometheusConfig.global.scrape_interval).toBeDefined();
      expect(prometheusConfig.global.evaluation_interval).toBeDefined();
    });

    it('should have alertmanager configured', () => {
      expect(prometheusConfig.alerting).toBeDefined();
      expect(prometheusConfig.alerting.alertmanagers).toBeDefined();
      expect(Array.isArray(prometheusConfig.alerting.alertmanagers)).toBe(true);
    });

    it('should have rule files configured', () => {
      expect(prometheusConfig.rule_files).toBeDefined();
      expect(Array.isArray(prometheusConfig.rule_files)).toBe(true);
      expect(prometheusConfig.rule_files.length).toBeGreaterThan(0);
    });
  });

  describe('Scrape Configurations', () => {
  setupMockApi();
    it('should have scrape configs defined', () => {
      expect(prometheusConfig.scrape_configs).toBeDefined();
      expect(Array.isArray(prometheusConfig.scrape_configs)).toBe(true);
      expect(prometheusConfig.scrape_configs.length).toBeGreaterThan(0);
    });

    it('should have API scrape config', () => {
      const apiConfig = prometheusConfig.scrape_configs.find(
        (config: any) => config.job_name === 'api'
      );
      expect(apiConfig).toBeDefined();
      expect(apiConfig.metrics_path).toBe('/metrics');
    });

    it('should have web app scrape config', () => {
      const webConfig = prometheusConfig.scrape_configs.find(
        (config: any) => config.job_name === 'web'
      );
      expect(webConfig).toBeDefined();
    });

    it('should have postgres exporter config', () => {
      const postgresConfig = prometheusConfig.scrape_configs.find(
        (config: any) => config.job_name === 'postgres'
      );
      expect(postgresConfig).toBeDefined();
    });

    it('should have node exporter config', () => {
      const nodeConfig = prometheusConfig.scrape_configs.find(
        (config: any) => config.job_name === 'node'
      );
      expect(nodeConfig).toBeDefined();
    });
  });

  describe('Scrape Intervals', () => {
  setupMockApi();
    it('should have appropriate scrape intervals', () => {
      prometheusConfig.scrape_configs.forEach((config: any) => {
        if (config.scrape_interval) {
          // Parse interval (e.g., "10s", "30s")
          const interval = parseInt(config.scrape_interval);
          expect(interval).toBeGreaterThan(0);
          expect(interval).toBeLessThanOrEqual(60);
        }
      });
    });
  });
});
