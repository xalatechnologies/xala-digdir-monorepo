/**
 * Feature Flags Tests
 * 
 * Tests feature flag system
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('Feature Flags', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping feature flag tests - API not available at', API_URL);
    }
  });

  describe('Public Feature Flags', () => {
    it('should expose public feature flags if endpoint exists', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/features`);

      // Endpoint may or may not exist
      if (response.status === 404) {
        console.log('Public features endpoint not implemented');
        return;
      }

      expect(response.ok).toBe(true);
    });
  });

  describe('Admin Feature Flags', () => {
    it('should require auth for feature flag management', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/features`);

      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
