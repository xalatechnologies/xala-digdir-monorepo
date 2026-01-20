/**
 * SDK Core Exports Tests
 * Validates SDK core exports are available
 */

import { describe, it, expect } from 'vitest';

describe('SDK Core Exports', () => {
  describe('initializeClient', () => {
    it('should export initializeClient function', async () => {
      const { initializeClient } = await import('@digilist/client-sdk');
      expect(initializeClient).toBeDefined();
      expect(typeof initializeClient).toBe('function');
    });
  });

  describe('getClient', () => {
    it('should export getClient function', async () => {
      const { getClient } = await import('@digilist/client-sdk');
      expect(getClient).toBeDefined();
      expect(typeof getClient).toBe('function');
    });
  });

  describe('setAuthToken', () => {
    it('should export setAuthToken function', async () => {
      const { setAuthToken } = await import('@digilist/client-sdk');
      expect(setAuthToken).toBeDefined();
      expect(typeof setAuthToken).toBe('function');
    });
  });

  describe('clearAuthToken', () => {
    it('should export clearAuthToken function', async () => {
      const { clearAuthToken } = await import('@digilist/client-sdk');
      expect(clearAuthToken).toBeDefined();
      expect(typeof clearAuthToken).toBe('function');
    });
  });

  describe('setTenantId', () => {
    it('should export setTenantId function', async () => {
      const { setTenantId } = await import('@digilist/client-sdk');
      expect(setTenantId).toBeDefined();
      expect(typeof setTenantId).toBe('function');
    });
  });

  describe('isClientInitialized', () => {
    it('should export isClientInitialized function', async () => {
      const { isClientInitialized } = await import('@digilist/client-sdk');
      expect(isClientInitialized).toBeDefined();
      expect(typeof isClientInitialized).toBe('function');
    });
  });

  describe('createClient', () => {
    it('should export createClient function', async () => {
      const { createClient } = await import('@digilist/client-sdk');
      expect(createClient).toBeDefined();
      expect(typeof createClient).toBe('function');
    });
  });

  describe('resetClient', () => {
    it('should export resetClient function', async () => {
      const { resetClient } = await import('@digilist/client-sdk');
      expect(resetClient).toBeDefined();
      expect(typeof resetClient).toBe('function');
    });
  });
});
