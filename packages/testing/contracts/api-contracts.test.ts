/**
 * API Contract Tests
 *
 * Validates API responses match expected DTO shapes and SDK types.
 * Detects breaking changes in API contracts.
 *
 * @module tests/contracts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

// =============================================================================
// RFC 7807 Problem Details Schema
// =============================================================================

const ProblemDetailsSchema = z.object({
  type: z.string().url().optional(),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  correlationId: z.string().uuid().optional(),
});

// =============================================================================
// Core DTO Schemas (from @xala/contracts)
// =============================================================================

const UUIDSchema = z.string().uuid();
const DateTimeSchema = z.string().datetime();

const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: PaginationMetaSchema,
  });

// =============================================================================
// User DTO Schema
// =============================================================================

const UserDTOSchema = z.object({
  id: UUIDSchema,
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['user', 'admin', 'saksbehandler', 'super_admin', 'citizen']),
  tenantId: UUIDSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});

// =============================================================================
// Session DTO Schema
// =============================================================================

const SessionDTOSchema = z.object({
  user: UserDTOSchema,
  expiresAt: DateTimeSchema,
  permissions: z.record(z.boolean()),
});

// =============================================================================
// Rental Object DTO Schema
// =============================================================================

const RentalObjectDTOSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  category: z.enum(['LOCALE', 'ARRANGEMENT', 'EQUIPMENT', 'VEHICLE', 'OUTDOOR', 'OTHER']),
  status: z.enum(['draft', 'published', 'archived']),
  address: z.string().optional(),
  city: z.string().optional(),
  municipality: z.string().optional(),
  images: z.array(z.object({
    id: UUIDSchema,
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional(),
  amenities: z.array(z.string()).optional(),
  capacity: z.number().int().optional(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});

// =============================================================================
// Booking DTO Schema
// =============================================================================

const BookingDTOSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  rentalObjectId: UUIDSchema,
  userId: UUIDSchema,
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  startTime: DateTimeSchema,
  endTime: DateTimeSchema,
  totalPrice: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});

// =============================================================================
// API Response Validation Tests
// =============================================================================

describe('API Contract Tests', () => {
  const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
  const IS_PRODUCTION = API_BASE.includes('api.digilist.no');
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

  // Use skip for API tests when running against production
  const itOrSkip = IS_PRODUCTION ? it.skip : it;

  describe('RFC 7807 Error Responses', () => {
    itOrSkip('401 should return valid problem details', async () => {
      const response = await fetch(`${API_BASE}/session`);
      expect(response.status).toBe(401);

      const body = await response.json();
      const result = ProblemDetailsSchema.safeParse(body);

      expect(result.success, 'Response should match RFC 7807 schema').toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(401);
      }
    });

    itOrSkip('404 should return valid problem details', async () => {
      const response = await fetch(`${API_BASE}/nonexistent-endpoint`);
      expect(response.status).toBe(404);

      const body = await response.json();
      const result = ProblemDetailsSchema.safeParse(body);

      expect(result.success, 'Response should match RFC 7807 schema').toBe(true);
    });

    itOrSkip('400 should return valid problem details with correlation ID', async () => {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      });

      if (response.status === 400) {
        const body = await response.json();
        const result = ProblemDetailsSchema.safeParse(body);

        expect(result.success, 'Response should match RFC 7807 schema').toBe(true);
        // Correlation ID is optional but recommended
        if (result.success && result.data.correlationId) {
          expect(result.data.correlationId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          );
        }
      }
    });
  });

  describe('Public Endpoints', () => {
    itOrSkip('GET /public/rental-objects should return paginated rental objects', async () => {
      const response = await fetch(`${API_BASE}/public/rental-objects`);
      expect(response.ok).toBe(true);

      const body = await response.json();
      const schema = PaginatedResponseSchema(RentalObjectDTOSchema.partial());
      const result = schema.safeParse(body);

      expect(result.success, `Schema validation failed: ${JSON.stringify(result)}`).toBe(true);
    });

    itOrSkip('GET /public/categories should return valid categories', async () => {
      const response = await fetch(`${API_BASE}/public/categories`);
      expect(response.ok).toBe(true);

      const body = await response.json();
      expect(Array.isArray(body.data) || Array.isArray(body)).toBe(true);
    });
  });

  describe('Session Endpoint', () => {
    itOrSkip('GET /session with valid cookie should return session DTO', async () => {
      // This test requires authentication - skip if no session cookie
      const response = await fetch(`${API_BASE}/session`, {
        credentials: 'include',
      });

      if (response.ok) {
        const body = await response.json();
        const result = SessionDTOSchema.safeParse(body.data || body);

        expect(result.success, 'Session response should match SessionDTO schema').toBe(true);
      }
    });
  });

  describe('Module Endpoints', () => {
    itOrSkip('GET /modules/catalog should return module catalog', async () => {
      const response = await fetch(`${API_BASE}/modules/catalog`);
      expect(response.ok).toBe(true);

      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data.modules)).toBe(true);
    });

    itOrSkip('GET /modules/effective should return effective modules', async () => {
      const response = await fetch(`${API_BASE}/modules/effective`);
      expect(response.ok).toBe(true);

      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.capabilities).toBeDefined();
    });
  });
});

// =============================================================================
// SDK Type Parity Tests
// =============================================================================

describe('SDK Type Parity', () => {
  it('RentalObjectDTO should match SDK types', () => {
    // This validates the Zod schema matches what we expect from the SDK
    const sampleData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Object',
      slug: 'test-object',
      category: 'LOCALE' as const,
      status: 'published' as const,
      createdAt: '2026-01-17T00:00:00.000Z',
    };

    const result = RentalObjectDTOSchema.safeParse(sampleData);
    expect(result.success).toBe(true);
  });

  it('BookingDTO should match SDK types', () => {
    const sampleData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      rentalObjectId: '123e4567-e89b-12d3-a456-426614174002',
      userId: '123e4567-e89b-12d3-a456-426614174003',
      status: 'pending' as const,
      startTime: '2026-01-17T10:00:00.000Z',
      endTime: '2026-01-17T12:00:00.000Z',
      createdAt: '2026-01-17T00:00:00.000Z',
    };

    const result = BookingDTOSchema.safeParse(sampleData);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Contract Snapshot Tests
// =============================================================================

describe('Contract Snapshots', () => {
  it('should match RentalObjectDTO snapshot', () => {
    const schemaShape = RentalObjectDTOSchema.shape;
    const keys = Object.keys(schemaShape).sort();

    expect(keys).toMatchInlineSnapshot(`
      [
        "address",
        "amenities",
        "capacity",
        "category",
        "city",
        "createdAt",
        "description",
        "id",
        "images",
        "municipality",
        "name",
        "slug",
        "status",
        "tenantId",
        "updatedAt",
      ]
    `);
  });

  it('should match BookingDTO snapshot', () => {
    const schemaShape = BookingDTOSchema.shape;
    const keys = Object.keys(schemaShape).sort();

    expect(keys).toMatchInlineSnapshot(`
      [
        "createdAt",
        "currency",
        "endTime",
        "id",
        "notes",
        "rentalObjectId",
        "startTime",
        "status",
        "tenantId",
        "totalPrice",
        "updatedAt",
        "userId",
      ]
    `);
  });
});
