/**
 * Integration Tests for Rental Objects API Endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createFastifyApp } from '../../adapters/fastify.adapter';
import type { FastifyInstance } from 'fastify';

describe('Rental Objects API Integration Tests', () => {
  let app: FastifyInstance;
  let authToken: string;
  let testTenantId: string;

  beforeAll(async () => {
    app = await createFastifyApp();
    await app.ready();

    // Create test tenant and user (simplified - adjust based on your auth setup)
    testTenantId = 'test-tenant-123';

    // Mock auth token (adjust based on your auth implementation)
    authToken = 'test-auth-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/rental-objects', () => {
    it('should return list of rental objects', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toHaveProperty('total');
      expect(body.meta).toHaveProperty('page');
      expect(body.meta).toHaveProperty('limit');
      expect(body.meta).toHaveProperty('totalPages');
    });

    it('should support pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects?page=1&limit=10',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
    });

    it('should support filtering by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects?status=published',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((item: any) => {
        expect(item.status).toBe('published');
      });
    });

    it('should support filtering by type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects?type=SPACE',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((item: any) => {
        expect(item.type).toBe('SPACE');
      });
    });

    it('should support search query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects?search=test',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects',
      });

      // Adjust based on your auth implementation
      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('GET /api/rental-objects/:id', () => {
    it('should return rental object by ID', async () => {
      // First create a rental object to get its ID
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload: {
          name: 'Test Rental Object',
          type: 'SPACE',
          description: 'Test description',
        },
      });

      if (createResponse.statusCode === 201) {
        const created = JSON.parse(createResponse.body);
        const rentalObjectId = created.data?.id || created.data?.slug;

        const response = await app.inject({
          method: 'GET',
          url: `/api/rental-objects/${rentalObjectId}`,
          headers: {
            authorization: `Bearer ${authToken}`,
            'x-tenant-id': testTenantId,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveProperty('id');
        expect(body.data).toHaveProperty('name');
        expect(body.data.name).toBe('Test Rental Object');
      }
    });

    it('should return 404 for non-existent rental object', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/rental-objects/non-existent-id',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/rental-objects', () => {
    it('should create a new rental object', async () => {
      const payload = {
        name: 'New Test Rental Object',
        type: 'SPACE',
        description: 'Test description',
        capacity: 10,
        location: 'Oslo',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe(payload.name);
      expect(body.data.type).toBe(payload.type);
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload: {
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          'content-type': 'application/json',
        },
        payload: {
          name: 'Test',
          type: 'SPACE',
        },
      });

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('PUT /api/rental-objects/:id', () => {
    it('should update an existing rental object', async () => {
      // First create a rental object
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload: {
          name: 'Original Name',
          type: 'SPACE',
          description: 'Original description',
        },
      });

      if (createResponse.statusCode === 201) {
        const created = JSON.parse(createResponse.body);
        const rentalObjectId = created.data?.id || created.data?.slug;

        const updateResponse = await app.inject({
          method: 'PUT',
          url: `/api/rental-objects/${rentalObjectId}`,
          headers: {
            authorization: `Bearer ${authToken}`,
            'x-tenant-id': testTenantId,
            'content-type': 'application/json',
          },
          payload: {
            name: 'Updated Name',
            description: 'Updated description',
          },
        });

        expect(updateResponse.statusCode).toBe(200);
        const body = JSON.parse(updateResponse.body);
        expect(body.data.name).toBe('Updated Name');
        expect(body.data.description).toBe('Updated description');
      }
    });

    it('should return 404 for non-existent rental object', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/rental-objects/non-existent-id',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/rental-objects/:id', () => {
    it('should delete a rental object', async () => {
      // First create a rental object
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload: {
          name: 'To Be Deleted',
          type: 'SPACE',
          description: 'Will be deleted',
        },
      });

      if (createResponse.statusCode === 201) {
        const created = JSON.parse(createResponse.body);
        const rentalObjectId = created.data?.id || created.data?.slug;

        const deleteResponse = await app.inject({
          method: 'DELETE',
          url: `/api/rental-objects/${rentalObjectId}`,
          headers: {
            authorization: `Bearer ${authToken}`,
            'x-tenant-id': testTenantId,
          },
        });

        expect(deleteResponse.statusCode).toBe(200);

        // Verify it's deleted
        const getResponse = await app.inject({
          method: 'GET',
          url: `/api/rental-objects/${rentalObjectId}`,
          headers: {
            authorization: `Bearer ${authToken}`,
            'x-tenant-id': testTenantId,
          },
        });

        expect(getResponse.statusCode).toBe(404);
      }
    });

    it('should return 404 for non-existent rental object', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/rental-objects/non-existent-id',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/rental-objects/:id/publish', () => {
    it('should publish a rental object', async () => {
      // First create a draft rental object
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/rental-objects',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': testTenantId,
          'content-type': 'application/json',
        },
        payload: {
          name: 'Draft Object',
          type: 'SPACE',
          description: 'Draft description',
          status: 'draft',
        },
      });

      if (createResponse.statusCode === 201) {
        const created = JSON.parse(createResponse.body);
        const rentalObjectId = created.data?.id || created.data?.slug;

        const publishResponse = await app.inject({
          method: 'POST',
          url: `/api/rental-objects/${rentalObjectId}/publish`,
          headers: {
            authorization: `Bearer ${authToken}`,
            'x-tenant-id': testTenantId,
          },
        });

        expect(publishResponse.statusCode).toBe(200);
        const body = JSON.parse(publishResponse.body);
        expect(body.data.status).toBe('published');
      }
    });
  });
});
