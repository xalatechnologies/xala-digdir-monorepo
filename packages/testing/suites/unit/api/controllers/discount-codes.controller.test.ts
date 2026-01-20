/**
 * Discount Codes Controller Tests
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp, TestContext } from '@digilist/api/test-utils';

// SKIPPED: Needs implementation
describe.skip('DiscountCodesController', () => {
  let ctx: TestContext;
  let testCodeId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  describe('POST /api/discount-codes', () => {
    it('should create a percentage discount code', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: {
          code: 'SUMMER25',
          description: '25% summer discount',
          type: 'percentage',
          value: 25,
        },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.data.code).toBe('SUMMER25');
      expect(data.data.type).toBe('percentage');
      expect(data.data.value).toBe(25);
      expect(data.data.isActive).toBe(true);
      testCodeId = data.data.id;
    });

    it('should create a fixed discount code', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: {
          code: 'FIXED100',
          type: 'fixed',
          value: 100,
        },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.data.type).toBe('fixed');
      expect(data.data.value).toBe(100);
    });

    it('should create code with validity period', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: {
          code: 'TIMED10',
          type: 'percentage',
          value: 10,
          validFrom: '2026-01-01',
          validUntil: '2026-12-31',
        },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.data.validFrom).toBeDefined();
      expect(data.data.validUntil).toBeDefined();
    });

    it('should create code with max uses limit', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: {
          code: 'LIMITED50',
          type: 'percentage',
          value: 50,
          maxUses: 100,
        },
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.data.maxUses).toBe(100);
      expect(data.data.usedCount).toBe(0);
    });

    it('should reject duplicate code', async () => {
      await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'DUPLICATE', type: 'percentage', value: 10 },
      });

      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'DUPLICATE', type: 'percentage', value: 20 },
      });

      expect(response.statusCode).toBe(409);
      const data = response.json();
      expect(data.error.code).toBe('CONFLICT');
    });

    it('should require code field', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { type: 'percentage', value: 10 },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require type field', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'NOTYPE', value: 10 },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require value field', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'NOVALUE', type: 'percentage' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/discount-codes', () => {
    it('should list all discount codes', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/discount-codes',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
      expect(data.meta.total).toBeGreaterThanOrEqual(0);
    });

    it('should include default demo codes', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/discount-codes',
      });

      const data = response.json();
      const welcome = data.data.find((c: any) => c.code === 'WELCOME10');
      expect(welcome).toBeDefined();
    });
  });

  describe('GET /api/discount-codes/:id', () => {
    it('should return discount code by ID', async () => {
      // Create a code first
      const createRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'GETBYID', type: 'percentage', value: 15 },
      });
      const id = createRes.json().data.id;

      const response = await ctx.app.inject({
        method: 'GET',
        url: `/api/discount-codes/${id}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.code).toBe('GETBYID');
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/discount-codes/nonexistent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/discount-codes/:id', () => {
    it('should update discount code', async () => {
      const createRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'TOUPDATE', type: 'percentage', value: 10 },
      });
      const id = createRes.json().data.id;

      const response = await ctx.app.inject({
        method: 'PUT',
        url: `/api/discount-codes/${id}`,
        payload: {
          description: 'Updated description',
          value: 20,
          isActive: false,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.value).toBe(20);
      expect(data.data.isActive).toBe(false);
      expect(data.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await ctx.app.inject({
        method: 'PUT',
        url: '/api/discount-codes/nonexistent-id',
        payload: { value: 50 },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/discount-codes/:id', () => {
    it('should delete discount code', async () => {
      const createRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'TODELETE', type: 'percentage', value: 10 },
      });
      const id = createRes.json().data.id;

      const response = await ctx.app.inject({
        method: 'DELETE',
        url: `/api/discount-codes/${id}`,
      });

      expect(response.statusCode).toBe(200);

      // Verify deleted
      const getRes = await ctx.app.inject({
        method: 'GET',
        url: `/api/discount-codes/${id}`,
      });
      expect(getRes.statusCode).toBe(404);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await ctx.app.inject({
        method: 'DELETE',
        url: '/api/discount-codes/nonexistent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/discount-codes/validate', () => {
    it('should validate active code', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes/validate',
        payload: { code: 'WELCOME10', bookingValue: 1000 },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.valid).toBe(true);
      expect(data.data.discountAmount).toBeDefined();
    });

    it('should calculate percentage discount correctly', async () => {
      // Create 25% code
      await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'CALC25', type: 'percentage', value: 25 },
      });

      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes/validate',
        payload: { code: 'CALC25', bookingValue: 1000 },
      });

      const data = response.json();
      expect(data.data.discountAmount).toBe(250);
    });

    it('should calculate fixed discount correctly', async () => {
      await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'FIXCALC', type: 'fixed', value: 150 },
      });

      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes/validate',
        payload: { code: 'FIXCALC', bookingValue: 1000 },
      });

      const data = response.json();
      expect(data.data.discountAmount).toBe(150);
    });

    it('should return invalid for non-existent code', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes/validate',
        payload: { code: 'DOESNOTEXIST', bookingValue: 1000 },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.valid).toBe(false);
      expect(data.data.reason).toBe('Discount code not found');
    });

    it('should reject inactive codes', async () => {
      const createRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes',
        payload: { code: 'INACTIVE', type: 'percentage', value: 10 },
      });
      const id = createRes.json().data.id;

      await ctx.app.inject({
        method: 'PUT',
        url: `/api/discount-codes/${id}`,
        payload: { isActive: false },
      });

      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes/validate',
        payload: { code: 'INACTIVE', bookingValue: 1000 },
      });

      const data = response.json();
      expect(data.data.valid).toBe(false);
      expect(data.data.reason).toBe('Discount code is not active');
    });

    it('should require code in body', async () => {
      const response = await ctx.app.inject({
        method: 'POST',
        url: '/api/discount-codes/validate',
        payload: { bookingValue: 1000 },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
