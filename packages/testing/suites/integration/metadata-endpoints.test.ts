/**
 * Metadata Endpoints Integration Tests
 *
 * Test coverage:
 * 1. GET /api/metadata/categories
 * 2. GET /api/metadata/categories/:key
 * 3. GET /api/metadata/time-modes
 * 4. GET /api/metadata/time-modes/:key
 * 5. GET /api/metadata/pricing-units
 * 6. GET /api/metadata/pricing-units/:key
 * 7. GET /api/metadata/statuses
 * 8. GET /api/metadata/statuses/:key
 * 9. Query parameter filtering
 * 10. Error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
import { MetadataController } from '@testing/stubs/api-imports';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Mock Fastify reply with captured state
class MockReply {
  sentData: any = null;
  sentStatus: number = 200;

  status(code: number) {
    this.sentStatus = code;
    return this;
  }

  async send(data: any) {
    this.sentData = data;
    return this;
  }
}

function createMockReply() {
  const mock = new MockReply();
  return {
    reply: mock as any as FastifyReply,
    mock,
  };
}

describe('Metadata Endpoints - Categories', () => {
  setupMockApi();
  let controller: MetadataController;

  beforeEach(() => {
    controller = new MetadataController();
  });

  it('GET /api/metadata/categories should return all categories', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategories(request as any, reply);

    expect(mock.sentData).toBeDefined();
    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.items).toBeInstanceOf(Array);
    expect(mock.sentData.data.items.length).toBeGreaterThan(0);
    expect(mock.sentData.data.totalCount).toBe(mock.sentData.data.items.length);
    expect(mock.sentData.data.version).toBeDefined();
  });

  it('GET /api/metadata/categories should filter by enabled', async () => {
    const request = { query: { enabled: 'true' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategories(request as any, reply);

    expect(mock.sentData.data.items.every((item: any) => item.enabled === true)).toBe(true);
  });

  it('GET /api/metadata/categories/:key should return single category', async () => {
    const request = { params: { key: 'LOKALER_OG_BANER' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategoryByKey(request as any, reply);

    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.key).toBe('LOKALER_OG_BANER');
    expect(mock.sentData.data.label).toBe('metadata.category.LOKALER_OG_BANER');
  });

  it('GET /api/metadata/categories/:key should return 404 for non-existent category', async () => {
    const request = { params: { key: 'NON_EXISTENT' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategoryByKey(request as any, reply);

    expect(mock.sentStatus).toBe(404);
    expect(mock.sentData.type).toBe('/errors/not-found');
    expect(mock.sentData.status).toBe(404);
    expect(mock.sentData.detail).toContain('NON_EXISTENT');
  });
});

describe('Metadata Endpoints - Time Modes', () => {
  setupMockApi();
  let controller: MetadataController;

  beforeEach(() => {
    controller = new MetadataController();
  });

  it('GET /api/metadata/time-modes should return all time modes', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getTimeModes(request as any, reply);

    expect(mock.sentData).toBeDefined();
    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.items).toBeInstanceOf(Array);
    expect(mock.sentData.data.items.length).toBe(3); // PERIOD, SLOT, ALL_DAY
  });

  it('GET /api/metadata/time-modes/:key should return single time mode', async () => {
    const request = { params: { key: 'PERIOD' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getTimeModeByKey(request as any, reply);

    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.key).toBe('PERIOD');
    expect(mock.sentData.data.allowCustomDuration).toBe(true);
  });

  it('GET /api/metadata/time-modes/:key should return 404 for non-existent time mode', async () => {
    const request = { params: { key: 'INVALID_MODE' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getTimeModeByKey(request as any, reply);

    expect(mock.sentStatus).toBe(404);
    expect(mock.sentData.type).toBe('/errors/not-found');
  });
});

describe('Metadata Endpoints - Pricing Units', () => {
  setupMockApi();
  let controller: MetadataController;

  beforeEach(() => {
    controller = new MetadataController();
  });

  it('GET /api/metadata/pricing-units should return all pricing units', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getPricingUnits(request as any, reply);

    expect(mock.sentData).toBeDefined();
    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.items).toBeInstanceOf(Array);
    expect(mock.sentData.data.items.length).toBeGreaterThan(0);
  });

  it('GET /api/metadata/pricing-units/:key should return single pricing unit', async () => {
    const request = { params: { key: 'HOUR' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getPricingUnitByKey(request as any, reply);

    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.key).toBe('HOUR');
    expect(mock.sentData.data.duration).toBe(60);
    expect(mock.sentData.data.abbreviation).toBe('hr');
  });

  it('GET /api/metadata/pricing-units/:key should return 404 for non-existent unit', async () => {
    const request = { params: { key: 'INVALID_UNIT' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getPricingUnitByKey(request as any, reply);

    expect(mock.sentStatus).toBe(404);
    expect(mock.sentData.type).toBe('/errors/not-found');
  });
});

describe('Metadata Endpoints - Statuses', () => {
  setupMockApi();
  let controller: MetadataController;

  beforeEach(() => {
    controller = new MetadataController();
  });

  it('GET /api/metadata/statuses should return all statuses', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getStatuses(request as any, reply);

    expect(mock.sentData).toBeDefined();
    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.items).toBeInstanceOf(Array);
    expect(mock.sentData.data.items.length).toBeGreaterThan(0);
  });

  it('GET /api/metadata/statuses should filter by statusType', async () => {
    const request = { query: { statusType: 'rental-object' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getStatuses(request as any, reply);

    expect(mock.sentData.data.items.every((item: any) => item.statusType === 'rental-object')).toBe(
      true
    );
  });

  it('GET /api/metadata/statuses/:key should return single status', async () => {
    const request = {
      params: { key: 'PUBLISHED' },
      query: { statusType: 'rental-object' },
    } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getStatusByKey(request as any, reply);

    expect(mock.sentData.data).toBeDefined();
    expect(mock.sentData.data.key).toBe('PUBLISHED');
    expect(mock.sentData.data.statusType).toBe('rental-object');
  });

  it('GET /api/metadata/statuses/:key should require statusType parameter', async () => {
    const request = {
      params: { key: 'PUBLISHED' },
      query: {},
    } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getStatusByKey(request as any, reply);

    expect(mock.sentStatus).toBe(400);
    expect(mock.sentData.type).toBe('/errors/bad-request');
    expect(mock.sentData.detail).toContain('statusType');
  });

  it('GET /api/metadata/statuses/:key should return 404 for non-existent status', async () => {
    const request = {
      params: { key: 'INVALID_STATUS' },
      query: { statusType: 'rental-object' },
    } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getStatusByKey(request as any, reply);

    expect(mock.sentStatus).toBe(404);
    expect(mock.sentData.type).toBe('/errors/not-found');
  });
});

describe('Metadata Endpoints - Response Format', () => {
  setupMockApi();
  let controller: MetadataController;

  beforeEach(() => {
    controller = new MetadataController();
  });

  it('should return RFC 7807 compliant error responses', async () => {
    const request = { params: { key: 'NON_EXISTENT' } } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategoryByKey(request as any, reply);

    expect(mock.sentStatus).toBe(404);
    expect(mock.sentData).toHaveProperty('type');
    expect(mock.sentData).toHaveProperty('title');
    expect(mock.sentData).toHaveProperty('status');
    expect(mock.sentData).toHaveProperty('detail');
    expect(mock.sentData.type).toContain('/errors/');
  });

  it('should wrap successful responses in data envelope', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategories(request as any, reply);

    expect(mock.sentData).toHaveProperty('data');
    expect(mock.sentData.data).toHaveProperty('items');
    expect(mock.sentData.data).toHaveProperty('totalCount');
    expect(mock.sentData.data).toHaveProperty('version');
  });
});

describe('Metadata Endpoints - Caching Headers', () => {
  setupMockApi();
  let controller: MetadataController;

  beforeEach(() => {
    controller = new MetadataController();
  });

  it('should include version for cache invalidation', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategories(request as any, reply);

    expect(mock.sentData.data.version).toBeDefined();
    expect(typeof mock.sentData.data.version).toBe('string');
  });

  it('should include lastUpdated timestamp', async () => {
    const request = { query: {} } as FastifyRequest;
    const { reply, mock } = createMockReply();

    await controller.getCategories(request as any, reply);

    expect(mock.sentData.data.lastUpdated).toBeDefined();
    // Should be valid ISO date
    expect(() => new Date(mock.sentData.data.lastUpdated)).not.toThrow();
  });
});
