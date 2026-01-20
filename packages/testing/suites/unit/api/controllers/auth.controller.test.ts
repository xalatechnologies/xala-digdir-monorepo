/**
 * Auth Controller Tests
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { createTestApp, createTestRequest, TestContext } from '@digilist/api/test-utils';

describe('AuthController', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@test.no' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data).toBeDefined();
      expect(data.data.token).toBeDefined();
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe('admin@test.no');
    });

    it('should return a properly formatted JWT token', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@test.no' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const token = data.data.token;

      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Each part should be non-empty
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('should return validation error for missing email', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const data = response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'nonexistent@test.no' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return session with valid user header', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/session',
        headers: { 'X-User-Id': ctx.testUserId },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.user).toBeDefined();
    });

    it('should return a properly formatted JWT token', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/session',
        headers: { 'X-User-Id': ctx.testUserId },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const token = data.data.token;

      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Each part should be non-empty
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('should return 401 without user header', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/session',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: { 'X-User-Id': ctx.testUserId },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.success).toBe(true);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        headers: { 'X-User-Id': ctx.testUserId },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.token).toBeDefined();
    });

    it('should return a properly formatted JWT token', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        headers: { 'X-User-Id': ctx.testUserId },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const token = data.data.token;

      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Each part should be non-empty
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/auth/providers', () => {
    it('should return available auth providers', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/providers',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      const bankid = data.data.find((p: any) => p.id === 'bankid');
      expect(bankid).toBeDefined();
      expect(bankid.name).toBe('BankID');
    });
  });

  describe('GET /api/auth/csrf', () => {
    it('should return CSRF token', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/auth/csrf',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.token).toBeDefined();
      expect(data.data.expiresAt).toBeDefined();
    });
  });

  describe('POST /api/auth/email', () => {
    it('should authenticate with email/password', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/email',
        payload: { email: 'admin@test.no', password: 'password123' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.token).toBeDefined();
    });

    it('should return a properly formatted JWT token', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/email',
        payload: { email: 'admin@test.no', password: 'password123' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const token = data.data.token;

      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Each part should be non-empty
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('should reject without password', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/auth/email',
        payload: { email: 'admin@test.no' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
