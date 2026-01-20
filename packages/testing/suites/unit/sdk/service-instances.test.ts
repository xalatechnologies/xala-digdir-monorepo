/**
 * SDK Service Instances Tests
 * Validates SDK service instances exports
 */

import { describe, it, expect } from 'vitest';

describe('SDK Service Instances', () => {
  describe('organizationService', () => {
    it('should export organizationService instance', async () => {
      const { organizationService } = await import('@digilist/client-sdk');
      expect(organizationService).toBeDefined();
    });
  });

  describe('idportenService', () => {
    it('should export idportenService instance', async () => {
      const { idportenService } = await import('@digilist/client-sdk');
      expect(idportenService).toBeDefined();
    });
  });

  describe('vippsAuthService', () => {
    it('should export vippsAuthService instance', async () => {
      const { vippsAuthService } = await import('@digilist/client-sdk');
      expect(vippsAuthService).toBeDefined();
    });
  });
});
