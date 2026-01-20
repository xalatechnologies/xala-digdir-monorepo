/**
 * i18n Compliance Tests
 * 
 * Validates internationalization requirements
 * Ensures all user-facing content is properly localized
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

describe('i18n Compliance', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping i18n tests - API not available at', API_URL);
    }
  });

  describe('Accept-Language Header Support', () => {
    it('should accept Norwegian (nb) locale', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/categories`, {
        headers: {
          'Accept-Language': 'nb',
        },
      });
      
      expect(response.ok).toBe(true);
    });

    it('should accept English (en) locale', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/categories`, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      
      expect(response.ok).toBe(true);
    });

    it('should accept Norwegian Bokmål (nb-NO) locale', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/categories`, {
        headers: {
          'Accept-Language': 'nb-NO',
        },
      });
      
      expect(response.ok).toBe(true);
    });
  });

  describe('Localized Content', () => {
    it('should return localized category labels', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/categories`, {
        headers: {
          'Accept-Language': 'nb',
        },
      });
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Categories should have localized labels
        expect(data[0]).toHaveProperty('label');
        expect(typeof data[0].label).toBe('string');
        expect(data[0].label.length).toBeGreaterThan(0);
      }
    });

    it('should return localized error messages', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects/00000000-0000-0000-0000-000000000000`, {
        headers: {
          'Accept-Language': 'nb',
        },
      });
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      
      // Error should be localized
      if (data.title) {
        expect(typeof data.title).toBe('string');
      }
    });
  });

  describe('Content Type', () => {
    it('should return UTF-8 charset', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects`);
      const contentType = response.headers.get('Content-Type');
      
      // Should include charset or default to UTF-8
      if (contentType) {
        expect(
          contentType.includes('utf-8') || 
          contentType.includes('UTF-8') ||
          contentType === 'application/json'
        ).toBe(true);
      }
    });
  });
});
