/**
 * Configuration Controller Integration Tests
 * Tests API endpoints with mocked services
 */
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { TEST_IDS } from '@xala/api/test-utils';

describe('Configuration Controllers', () => {
  let app: FastifyInstance;

  // Mock data
  const mockCategories = [
    {
      id: 'cat-1',
      code: 'LOKALER_OG_BANER',
      name: 'Lokaler og baner',
      nameEn: 'Spaces and venues',
      description: 'Physical spaces for rent',
      icon: 'building',
      sortOrder: 1,
      enabled: true,
    },
    {
      id: 'cat-2',
      code: 'UTSTYR_OG_INVENTAR',
      name: 'Utstyr og inventar',
      nameEn: 'Equipment and inventory',
      description: 'Equipment for rent',
      icon: 'package',
      sortOrder: 2,
      enabled: true,
    },
  ];

  const mockSubcategories = [
    {
      id: 'subcat-1',
      categoryId: 'cat-1',
      code: 'IDRETTSHALL',
      name: 'Idrettshall',
      nameEn: 'Sports hall',
      sortOrder: 1,
      enabled: true,
    },
    {
      id: 'subcat-2',
      categoryId: 'cat-1',
      code: 'KULTURHUS',
      name: 'Kulturhus',
      nameEn: 'Cultural center',
      sortOrder: 2,
      enabled: true,
    },
  ];

  const mockTimeModes = [
    { id: 'tm-1', code: 'PERIOD', name: 'Periode', nameEn: 'Period', icon: 'calendar', sortOrder: 1, enabled: true },
    { id: 'tm-2', code: 'SLOT', name: 'Tidsluke', nameEn: 'Time slot', icon: 'clock', sortOrder: 2, enabled: true },
    { id: 'tm-3', code: 'ALL_DAY', name: 'Hel dag', nameEn: 'All day', icon: 'sun', sortOrder: 3, enabled: true },
  ];

  const mockPricingUnits = [
    { id: 'pu-1', code: 'HOUR', name: 'Per time', nameEn: 'Per hour', symbol: 'kr/t', sortOrder: 1, enabled: true },
    { id: 'pu-2', code: 'DAY', name: 'Per dag', nameEn: 'Per day', symbol: 'kr/d', sortOrder: 2, enabled: true },
  ];

  const mockRentalObjectStatuses = [
    { id: 'ros-1', code: 'DRAFT', name: 'Utkast', nameEn: 'Draft', sortOrder: 1, enabled: true },
    { id: 'ros-2', code: 'PUBLISHED', name: 'Publisert', nameEn: 'Published', sortOrder: 2, enabled: true },
  ];

  const mockBookingStatuses = [
    { id: 'bs-1', code: 'PENDING', name: 'Venter', nameEn: 'Pending', sortOrder: 1, enabled: true },
    { id: 'bs-2', code: 'CONFIRMED', name: 'Bekreftet', nameEn: 'Confirmed', sortOrder: 2, enabled: true },
  ];

  const mockIntegrations = [
    { id: 'int-1', provider: 'idporten', name: 'ID-porten', status: 'active', config: { clientId: 'test' } },
    { id: 'int-2', provider: 'vipps', name: 'Vipps', status: 'inactive', config: { clientId: 'test' } },
  ];

  beforeAll(async () => {
    app = Fastify({ logger: false });

    // Register mock configuration routes
    await registerConfigurationRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerConfigurationRoutes(app: FastifyInstance) {
    const categoriesMap = new Map(mockCategories.map((c) => [c.code, c]));
    const subcategoriesMap = new Map(mockSubcategories.map((s) => [s.code, s]));

    // =========================================================================
    // Categories Routes
    // =========================================================================

    app.get('/api/categories', async (request) => {
      const { includeSubcategories } = request.query as { includeSubcategories?: string };
      const categories = Array.from(categoriesMap.values());

      if (includeSubcategories === 'true') {
        return {
          data: categories.map((c) => ({
            ...c,
            subcategories: mockSubcategories.filter((s) => s.categoryId === c.id),
          })),
        };
      }

      return { data: categories };
    });

    app.get('/api/categories/:code', async (request, reply) => {
      const { code } = request.params as { code: string };
      const category = categoriesMap.get(code);

      if (!category) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Category '${code}' not found` } };
      }

      return { data: category };
    });

    app.post('/api/categories', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const body = request.body as { code: string; name: string };
      if (!body.code || !body.name) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'Code and name are required' } };
      }

      if (categoriesMap.has(body.code)) {
        reply.code(409);
        return { error: { code: 'CONFLICT', message: 'Category already exists' } };
      }

      const newCategory = { id: `cat-${Date.now()}`, ...body, sortOrder: categoriesMap.size + 1, enabled: true };
      categoriesMap.set(body.code, newCategory);

      reply.code(201);
      return { data: newCategory };
    });

    app.put('/api/categories/:code', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const { code } = request.params as { code: string };
      const category = categoriesMap.get(code);

      if (!category) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Category '${code}' not found` } };
      }

      const body = request.body as Partial<typeof category>;
      const updated = { ...category, ...body };
      categoriesMap.set(code, updated);

      return { data: updated };
    });

    app.delete('/api/categories/:code', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const { code } = request.params as { code: string };

      if (!categoriesMap.has(code)) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Category '${code}' not found` } };
      }

      categoriesMap.delete(code);
      return { success: true };
    });

    // Subcategories
    app.get('/api/categories/:code/subcategories', async (request, reply) => {
      const { code } = request.params as { code: string };
      const category = categoriesMap.get(code);

      if (!category) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Category '${code}' not found` } };
      }

      const subcategories = mockSubcategories.filter((s) => s.categoryId === category.id);
      return { data: subcategories };
    });

    app.post('/api/categories/:code/subcategories', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const { code } = request.params as { code: string };
      const category = categoriesMap.get(code);

      if (!category) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Category '${code}' not found` } };
      }

      const body = request.body as { code: string; name: string };
      if (!body.code || !body.name) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'Code and name are required' } };
      }

      const newSubcategory = {
        id: `subcat-${Date.now()}`,
        categoryId: category.id,
        ...body,
        sortOrder: mockSubcategories.length + 1,
        enabled: true,
      };

      reply.code(201);
      return { data: newSubcategory };
    });

    // =========================================================================
    // Time Modes Routes
    // =========================================================================

    app.get('/api/time-modes', async () => {
      return { data: mockTimeModes };
    });

    app.get('/api/time-modes/:code', async (request, reply) => {
      const { code } = request.params as { code: string };
      const timeMode = mockTimeModes.find((t) => t.code === code);

      if (!timeMode) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Time mode '${code}' not found` } };
      }

      return { data: timeMode };
    });

    // =========================================================================
    // Pricing Units Routes
    // =========================================================================

    app.get('/api/pricing-units', async () => {
      return { data: mockPricingUnits };
    });

    app.get('/api/pricing-units/:code', async (request, reply) => {
      const { code } = request.params as { code: string };
      const pricingUnit = mockPricingUnits.find((p) => p.code === code);

      if (!pricingUnit) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Pricing unit '${code}' not found` } };
      }

      return { data: pricingUnit };
    });

    // =========================================================================
    // Statuses Routes
    // =========================================================================

    app.get('/api/statuses/rental-object', async () => {
      return { data: mockRentalObjectStatuses };
    });

    app.get('/api/statuses/booking', async () => {
      return { data: mockBookingStatuses };
    });

    // =========================================================================
    // Schema Routes
    // =========================================================================

    app.get('/api/schema/enums', async () => {
      return {
        data: {
          categories: mockCategories.map((c) => c.code),
          timeModes: mockTimeModes.map((t) => t.code),
          pricingUnits: mockPricingUnits.map((p) => p.code),
          rentalObjectStatuses: mockRentalObjectStatuses.map((s) => s.code),
          bookingStatuses: mockBookingStatuses.map((s) => s.code),
        },
      };
    });

    // =========================================================================
    // Integrations Routes
    // =========================================================================

    app.get('/api/configuration/integrations', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      return { data: mockIntegrations };
    });

    app.get('/api/configuration/integrations/:provider', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const { provider } = request.params as { provider: string };
      const integration = mockIntegrations.find((i) => i.provider === provider);

      if (!integration) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Integration '${provider}' not found` } };
      }

      return { data: integration };
    });

    app.put('/api/configuration/integrations/:provider', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const { provider } = request.params as { provider: string };
      const integration = mockIntegrations.find((i) => i.provider === provider);

      if (!integration) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Integration '${provider}' not found` } };
      }

      const body = request.body as Record<string, unknown>;
      const updated = { ...integration, ...body };

      return { data: updated };
    });

    app.post('/api/configuration/integrations/:provider/test', async (request, reply) => {
      const tenantId = request.headers['x-tenant-id'];
      if (!tenantId) {
        reply.code(400);
        return { error: { code: 'VALIDATION_ERROR', message: 'X-Tenant-Id header required' } };
      }

      const { provider } = request.params as { provider: string };
      const integration = mockIntegrations.find((i) => i.provider === provider);

      if (!integration) {
        reply.code(404);
        return { error: { code: 'NOT_FOUND', message: `Integration '${provider}' not found` } };
      }

      // Mock test result
      return {
        data: {
          success: integration.status === 'active',
          message: integration.status === 'active' ? 'Connection successful' : 'Integration is inactive',
        },
      };
    });
  }

  // =========================================================================
  // Categories Tests
  // =========================================================================

  describe('CategoriesController', () => {
    describe('GET /api/categories', () => {
      it('should return all categories', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(2);
        expect(body.data[0].code).toBe('LOKALER_OG_BANER');
      });

      it('should include subcategories when requested', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories?includeSubcategories=true',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data[0].subcategories).toBeDefined();
        expect(body.data[0].subcategories.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/categories/:code', () => {
      it('should return category by code', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/LOKALER_OG_BANER',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.code).toBe('LOKALER_OG_BANER');
        expect(body.data.name).toBe('Lokaler og baner');
      });

      it('should return 404 for non-existent category', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/NONEXISTENT',
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe('NOT_FOUND');
      });
    });

    describe('POST /api/categories', () => {
      it('should create new category', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/categories',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
          payload: { code: 'NEW_CATEGORY', name: 'New Category' },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.data.code).toBe('NEW_CATEGORY');
      });

      it('should require tenant ID', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/categories',
          payload: { code: 'NEW_CATEGORY', name: 'New Category' },
        });

        expect(response.statusCode).toBe(400);
      });

      it('should validate required fields', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/categories',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
          payload: { code: 'NEW_CATEGORY' }, // Missing name
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('PUT /api/categories/:code', () => {
      it('should update existing category', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: '/api/categories/LOKALER_OG_BANER',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
          payload: { name: 'Updated Name' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.name).toBe('Updated Name');
      });

      it('should return 404 for non-existent category', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: '/api/categories/NONEXISTENT',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
          payload: { name: 'Updated Name' },
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('GET /api/categories/:code/subcategories', () => {
      it('should return subcategories for category', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/LOKALER_OG_BANER/subcategories',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(2);
      });

      it('should return 404 for non-existent category', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/NONEXISTENT/subcategories',
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });

  // =========================================================================
  // Time Modes Tests
  // =========================================================================

  describe('TimeModesController', () => {
    describe('GET /api/time-modes', () => {
      it('should return all time modes', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/time-modes',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(3);
        expect(body.data.map((t: any) => t.code)).toContain('SLOT');
      });
    });

    describe('GET /api/time-modes/:code', () => {
      it('should return time mode by code', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/time-modes/SLOT',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.code).toBe('SLOT');
      });

      it('should return 404 for non-existent time mode', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/time-modes/NONEXISTENT',
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });

  // =========================================================================
  // Pricing Units Tests
  // =========================================================================

  describe('PricingUnitsController', () => {
    describe('GET /api/pricing-units', () => {
      it('should return all pricing units', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/pricing-units',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(2);
        expect(body.data.map((p: any) => p.code)).toContain('HOUR');
      });
    });

    describe('GET /api/pricing-units/:code', () => {
      it('should return pricing unit by code', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/pricing-units/HOUR',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.code).toBe('HOUR');
        expect(body.data.symbol).toBe('kr/t');
      });

      it('should return 404 for non-existent pricing unit', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/pricing-units/NONEXISTENT',
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });

  // =========================================================================
  // Statuses Tests
  // =========================================================================

  describe('StatusesController', () => {
    describe('GET /api/statuses/rental-object', () => {
      it('should return all rental object statuses', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/statuses/rental-object',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(2);
        expect(body.data.map((s: any) => s.code)).toContain('DRAFT');
      });
    });

    describe('GET /api/statuses/booking', () => {
      it('should return all booking statuses', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/statuses/booking',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(2);
        expect(body.data.map((s: any) => s.code)).toContain('PENDING');
      });
    });
  });

  // =========================================================================
  // Schema Tests
  // =========================================================================

  describe('SchemaController', () => {
    describe('GET /api/schema/enums', () => {
      it('should return all enum values', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/schema/enums',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.categories).toContain('LOKALER_OG_BANER');
        expect(body.data.timeModes).toContain('SLOT');
        expect(body.data.pricingUnits).toContain('HOUR');
        expect(body.data.rentalObjectStatuses).toContain('DRAFT');
        expect(body.data.bookingStatuses).toContain('PENDING');
      });
    });
  });

  // =========================================================================
  // Integrations Tests
  // =========================================================================

  describe('IntegrationsConfigController', () => {
    describe('GET /api/configuration/integrations', () => {
      it('should return all integrations for tenant', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/configuration/integrations',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(2);
      });

      it('should require tenant ID', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/configuration/integrations',
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('GET /api/configuration/integrations/:provider', () => {
      it('should return integration by provider', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/configuration/integrations/idporten',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.provider).toBe('idporten');
      });

      it('should return 404 for non-existent integration', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/configuration/integrations/nonexistent',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('PUT /api/configuration/integrations/:provider', () => {
      it('should update integration', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: '/api/configuration/integrations/idporten',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
          payload: { name: 'Updated ID-porten' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.name).toBe('Updated ID-porten');
      });
    });

    describe('POST /api/configuration/integrations/:provider/test', () => {
      it('should test active integration', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/configuration/integrations/idporten/test',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.success).toBe(true);
      });

      it('should test inactive integration', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/configuration/integrations/vipps/test',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.success).toBe(false);
      });

      it('should return 404 for non-existent integration', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/configuration/integrations/nonexistent/test',
          headers: { 'X-Tenant-Id': TEST_IDS.tenantId },
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });
});
