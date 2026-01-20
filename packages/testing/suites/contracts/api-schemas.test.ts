/**
 * API Contract Tests
 * 
 * Validates API responses match expected schemas (RFC 7807, DTOs)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
import { z } from 'zod';

const API_URL = testConfig.apiUrl;

// =============================================================================
// CONTRACT SCHEMAS (Zod)
// =============================================================================

const PaginatedResponseSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number().optional(),
});

const RentalObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryKey: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  capacity: z.number().optional().nullable(),
  images: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional().nullable(),
});

const ProblemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  violations: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

const CategorySchema = z.object({
  key: z.string(),
  label: z.string(),
  icon: z.string().optional(),
});

// =============================================================================
// HELPERS
// =============================================================================

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

// =============================================================================
// TESTS
// =============================================================================

describe('API Contract Validation', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping contract tests - API not available at', API_URL);
    }
  });

  describe('Public Rental Objects Endpoint', () => {
    it('should return valid paginated response schema', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects`);
      const data = await response.json();

      const result = PaginatedResponseSchema.safeParse(data);
      
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error('Schema validation errors:', result.error.issues);
      }
    });

    it('should return valid rental object items', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects?limit=5`);
      const data = await response.json();

      // Validate each item matches schema
      for (const item of data.items) {
        const result = RentalObjectSchema.safeParse(item);
        
        expect(result.success).toBe(true);
        if (!result.success) {
          console.error('Item validation failed:', item.id, result.error.issues);
        }
      }
    });
  });

  describe('Categories Endpoint', () => {
    it('should return valid category schema', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/categories`);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);

      for (const category of data) {
        const result = CategorySchema.safeParse(category);
        
        expect(result.success).toBe(true);
        if (!result.success) {
          console.error('Category validation failed:', category, result.error.issues);
        }
      }
    });
  });

  describe('RFC 7807 Error Responses', () => {
    it('should return valid problem details for 404', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects/00000000-0000-0000-0000-000000000000`);
      
      expect(response.status).toBe(404);

      const data = await response.json();
      const result = ProblemDetailsSchema.safeParse(data);
      
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error('Problem details validation failed:', result.error.issues);
      }

      expect(data.status).toBe(404);
    });

    it('should include correct content-type for errors', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects/00000000-0000-0000-0000-000000000000`);
      
      const contentType = response.headers.get('content-type');
      
      // RFC 7807 specifies application/problem+json
      expect(
        contentType?.includes('application/json') || 
        contentType?.includes('application/problem+json')
      ).toBe(true);
    });
  });

  describe('Health Endpoint', () => {
    it('should return health status', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/health`);
      
      expect(response.ok).toBe(true);

      const data = await response.json();
      
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
    });
  });
});
