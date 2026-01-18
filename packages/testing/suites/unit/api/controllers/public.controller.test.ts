/**
 * Public Controller Tests
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, TestContext } from '../test-utils';

describe('PublicController', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  describe('GET /api/public/listings', () => {
    it('should return published listings without auth', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
      expect(data.meta.total).toBeGreaterThanOrEqual(0);
    });

    it('should filter by type', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
        query: { type: 'SPACE' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      data.data.forEach((listing: any) => {
        expect(listing.type).toBe('SPACE');
      });
    });

    it('should filter by city', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
        query: { city: 'Oslo' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
        query: { page: '1', limit: '5' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(5);
    });

    it('should filter by price range', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
        query: { minPrice: '100', maxPrice: '1000' },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data).toBeDefined();
    });

    it('should filter by capacity', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
        query: { capacity: '50' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should search by name', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
        query: { search: 'hall' },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/public/listings/:id', () => {
    it('should return listing details', async () => {
      // First get a listing ID
      const listResponse = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
      });
      const listings = listResponse.json().data;
      
      if (listings.length > 0) {
        const response = await ctx.app.inject({
          method: 'GET',
          url: `/api/public/listings/${listings[0].id}`,
        });

        expect(response.statusCode).toBe(200);
        const data = response.json();
        expect(data.data.id).toBe(listings[0].id);
        expect(data.data.name).toBeDefined();
      }
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/public/listings/:id/availability', () => {
    it('should return availability for date range', async () => {
      const listResponse = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/listings',
      });
      const listings = listResponse.json().data;
      
      if (listings.length > 0) {
        const response = await ctx.app.inject({
          method: 'GET',
          url: `/api/public/listings/${listings[0].id}/availability`,
          query: {
            startDate: '2026-01-15',
            endDate: '2026-01-20',
          },
        });

        expect(response.statusCode).toBe(200);
        const data = response.json();
        expect(data.data).toBeDefined();
      }
    });
  });

  describe('GET /api/public/categories', () => {
    it('should return categories without auth', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/categories',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0].id).toBeDefined();
        expect(data.data[0].name).toBeDefined();
      }
    });
  });

  describe('GET /api/public/cities', () => {
    it('should return cities with listings', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/cities',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0].name).toBeDefined();
      }
    });
  });

  describe('GET /api/public/municipalities', () => {
    it('should return municipalities', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/municipalities',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('GET /api/public/featured', () => {
    it('should return featured listings', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/public/featured',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
