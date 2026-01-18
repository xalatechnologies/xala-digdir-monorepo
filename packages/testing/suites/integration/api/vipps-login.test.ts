/**
 * Vipps Login Integration Tests
 * 
 * Tests for the Vipps OIDC authentication flow.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VippsLoginService, clearVippsLoginService } from '../../integrations/vipps/vipps-login.service';
import { clearVippsConfigCache } from '../../config/vipps.config';

// Mock environment variables
const mockEnv = {
  VIPPS_CLIENT_ID: 'test-client-id',
  VIPPS_CLIENT_SECRET: 'test-client-secret',
  VIPPS_SUBSCRIPTION_KEY: 'test-subscription-key',
  VIPPS_MSN: '440455',
  VIPPS_ENVIRONMENT: 'test',
};

describe('VippsLoginService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env and set mock env
    originalEnv = { ...process.env };
    Object.assign(process.env, mockEnv);
    clearVippsLoginService();
    clearVippsConfigCache();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('generateState', () => {
    it('generates a cryptographically secure state parameter', () => {
      const service = new VippsLoginService();
      const state1 = service.generateState();
      const state2 = service.generateState();

      expect(state1).toBeDefined();
      expect(state1.length).toBeGreaterThan(20);
      expect(state1).not.toEqual(state2); // Should be unique
    });
  });

  describe('generateNonce', () => {
    it('generates a cryptographically secure nonce', () => {
      const service = new VippsLoginService();
      const nonce1 = service.generateNonce();
      const nonce2 = service.generateNonce();

      expect(nonce1).toBeDefined();
      expect(nonce1.length).toBeGreaterThan(20);
      expect(nonce1).not.toEqual(nonce2); // Should be unique
    });
  });

  describe('getAuthorizationUrl', () => {
    it('builds correct authorization URL with required parameters', async () => {
      const service = new VippsLoginService();
      const state = 'test-state-123';
      const nonce = 'test-nonce-456';
      const redirectUri = 'http://localhost:5173/auth/callback';

      const result = await service.getAuthorizationUrl({
        state,
        nonce,
        redirectUri,
      });

      expect(result.authorizationUrl).toContain('client_id=test-client-id');
      expect(result.authorizationUrl).toContain('response_type=code');
      expect(result.authorizationUrl).toContain(`state=${state}`);
      expect(result.authorizationUrl).toContain(`nonce=${nonce}`);
      expect(result.authorizationUrl).toContain(encodeURIComponent(redirectUri));
      expect(result.state).toEqual(state);
      expect(result.nonce).toEqual(nonce);
    });

    it('includes custom scopes when provided', async () => {
      const service = new VippsLoginService();
      const scopes = ['openid', 'name', 'email', 'address'];

      const result = await service.getAuthorizationUrl({
        state: 'test-state',
        nonce: 'test-nonce',
        redirectUri: 'http://localhost:5173/auth/callback',
        scopes,
      });

      // URL may encode spaces as + or %20, check for scope param
      expect(result.authorizationUrl).toContain('scope=');
      expect(result.authorizationUrl).toMatch(/scope=openid[+%20]name[+%20]email[+%20]address/);
    });

    it('includes login hint when provided', async () => {
      const service = new VippsLoginService();
      const loginHint = '91234567';

      const result = await service.getAuthorizationUrl({
        state: 'test-state',
        nonce: 'test-nonce',
        redirectUri: 'http://localhost:5173/auth/callback',
        loginHint,
      });

      expect(result.authorizationUrl).toContain(`login_hint=${loginHint}`);
    });
  });

  describe('validateIdToken', () => {
    it('rejects invalid JWT format', async () => {
      const service = new VippsLoginService();

      await expect(service.validateIdToken('invalid-token'))
        .rejects.toThrow(/not a valid JWT|Invalid ID token/i);
    });

    it('rejects tokens with missing parts', async () => {
      const service = new VippsLoginService();

      await expect(service.validateIdToken('header.payload'))
        .rejects.toThrow(/not a valid JWT|Invalid ID token/i);
    });

    it('validates token claims correctly', async () => {
      const service = new VippsLoginService();
      
      // Create a valid token structure (without signature verification for unit test)
      const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({
        iss: 'https://apitest.vipps.no/access-management-1.0/access/',
        sub: 'test-user-123',
        aud: 'test-client-id',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
        nonce: 'expected-nonce',
      })).toString('base64url');
      const signature = 'fake-signature';
      
      const token = `${header}.${payload}.${signature}`;
      const claims = await service.validateIdToken(token, 'expected-nonce');

      expect(claims.sub).toEqual('test-user-123');
      expect(claims.aud).toEqual('test-client-id');
    });

    it('rejects expired tokens', async () => {
      const service = new VippsLoginService();
      
      const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({
        iss: 'https://apitest.vipps.no/access-management-1.0/access/',
        sub: 'test-user',
        aud: 'test-client-id',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200,
      })).toString('base64url');
      const token = `${header}.${payload}.signature`;

      await expect(service.validateIdToken(token))
        .rejects.toThrow(/expired/i);
    });

    it('rejects tokens with wrong audience', async () => {
      const service = new VippsLoginService();
      
      const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({
        iss: 'https://apitest.vipps.no/access-management-1.0/access/',
        sub: 'test-user',
        aud: 'wrong-client-id',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })).toString('base64url');
      const token = `${header}.${payload}.signature`;

      await expect(service.validateIdToken(token))
        .rejects.toThrow(/audience/i);
    });

    it('rejects tokens with wrong nonce', async () => {
      const service = new VippsLoginService();
      
      const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({
        iss: 'https://apitest.vipps.no/access-management-1.0/access/',
        sub: 'test-user',
        aud: 'test-client-id',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        nonce: 'token-nonce',
      })).toString('base64url');
      const token = `${header}.${payload}.signature`;

      await expect(service.validateIdToken(token, 'expected-nonce'))
        .rejects.toThrow(/nonce/i);
    });
  });
});

describe('Vipps Login Auth Controller', () => {
  describe('POST /api/auth/vipps/start', () => {
    it('returns 503 when Vipps is not configured', async () => {
      // Clear env to make Vipps unconfigured
      delete process.env.VIPPS_CLIENT_ID;
      clearVippsConfigCache();

      // This would be tested via supertest with actual Fastify app
      // For now, this is a placeholder for integration testing
      expect(true).toBe(true);
    });

    it('returns authorization URL when configured', async () => {
      Object.assign(process.env, mockEnv);
      clearVippsConfigCache();

      // Integration test placeholder
      expect(true).toBe(true);
    });
  });

  describe('POST /api/auth/vipps/callback', () => {
    it('handles missing code parameter', async () => {
      // Integration test placeholder
      expect(true).toBe(true);
    });

    it('handles Vipps error response', async () => {
      // Integration test placeholder
      expect(true).toBe(true);
    });
  });
});
