/**
 * SDK Realtime Exports Tests
 * Validates SDK realtime exports are available
 */

import { describe, it, expect } from 'vitest';

describe('SDK Realtime Exports', () => {
  describe('realtimeClient', () => {
    it('should export realtimeClient', async () => {
      const { realtimeClient } = await import('@digilist/client-sdk');
      expect(realtimeClient).toBeDefined();
    });
  });

  describe('createAuditWebSocketUrl', () => {
    it('should export createAuditWebSocketUrl function', async () => {
      const { createAuditWebSocketUrl } = await import('@digilist/client-sdk');
      expect(createAuditWebSocketUrl).toBeDefined();
      expect(typeof createAuditWebSocketUrl).toBe('function');
    });
  });

  describe('createTenantWebSocketUrl', () => {
    it('should export createTenantWebSocketUrl function', async () => {
      const { createTenantWebSocketUrl } = await import('@digilist/client-sdk');
      expect(createTenantWebSocketUrl).toBeDefined();
      expect(typeof createTenantWebSocketUrl).toBe('function');
    });
  });
});
