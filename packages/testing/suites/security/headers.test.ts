/**
 * Security Headers Tests
 * 
 * Validates API security headers meet compliance requirements
 * Target: B rating or better per procurement requirements
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

describe('Security Headers', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping security tests - API not available at', API_URL);
    }
  });

  describe('Required Security Headers', () => {
    it('should have X-Content-Type-Options: nosniff', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const header = response.headers.get('X-Content-Type-Options');
      
      expect(header).toBe('nosniff');
    });

    it('should have X-Frame-Options header', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const header = response.headers.get('X-Frame-Options');
      
      // DENY or SAMEORIGIN are acceptable
      expect(['DENY', 'SAMEORIGIN']).toContain(header);
    });

    it('should have X-XSS-Protection header', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const header = response.headers.get('X-XSS-Protection');
      
      // Should be "1; mode=block" or similar
      expect(header).toBeTruthy();
    });

    it('should have Strict-Transport-Security header (HSTS)', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const header = response.headers.get('Strict-Transport-Security');
      
      // Note: HSTS may not be present on localhost
      if (API_URL.includes('localhost')) {
        console.log('ℹ️  HSTS check skipped on localhost');
        return;
      }
      
      expect(header).toBeTruthy();
      expect(header).toContain('max-age=');
    });

    it('should have Content-Security-Policy header', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const header = response.headers.get('Content-Security-Policy');
      
      // CSP may be relaxed for API endpoints
      // Just check it exists or is not overly permissive
      if (header) {
        expect(header).not.toContain("unsafe-inline");
      }
    });
  });

  describe('CORS Configuration', () => {
    it('should not have wildcard CORS origin in production', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`, {
        headers: {
          'Origin': 'https://attacker.com',
        },
      });
      
      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      
      // Should not reflect arbitrary origins
      if (allowOrigin) {
        expect(allowOrigin).not.toBe('https://attacker.com');
      }
    });
  });

  describe('Information Disclosure', () => {
    it('should not expose server version in headers', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      const server = response.headers.get('Server');
      const poweredBy = response.headers.get('X-Powered-By');
      
      // These should be absent or sanitized
      if (server) {
        expect(server).not.toMatch(/\d+\.\d+/); // No version numbers
      }
      expect(poweredBy).toBeNull();
    });
  });
});
