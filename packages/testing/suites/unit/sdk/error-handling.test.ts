/**
 * SDK Error Handling Tests
 * Validates SDK error handling exports
 */

import { describe, it, expect } from 'vitest';

describe('SDK Error Handling', () => {
  describe('ApiError', () => {
    it('should export ApiError class', async () => {
      const { ApiError } = await import('@digilist/client-sdk');
      expect(ApiError).toBeDefined();
      expect(typeof ApiError).toBe('function');
    });

    it('should be usable as error', async () => {
      const { ApiError } = await import('@digilist/client-sdk');
      const error = new ApiError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });
  });

  describe('FetchHttpClient', () => {
    it('should export FetchHttpClient class', async () => {
      const { FetchHttpClient } = await import('@digilist/client-sdk');
      expect(FetchHttpClient).toBeDefined();
      expect(typeof FetchHttpClient).toBe('function');
    });
  });
});
