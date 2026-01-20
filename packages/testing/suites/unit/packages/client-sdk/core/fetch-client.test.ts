/**
 * Unit Tests for Core HTTP Client
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchHttpClient } from '@digilist/api/core/fetch-client';
import { ApiError } from '@digilist/api/core/http-client.interface';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// SKIPPED
describe.skip('FetchHttpClient', () => {
  let client: FetchHttpClient;

  beforeEach(() => {
    client = new FetchHttpClient({
      baseUrl: 'https://api.test.no',
      tenantId: 'test-tenant-123',
    });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with base URL', () => {
      expect(client).toBeDefined();
    });

    it('should create client with all options', () => {
      const fullClient = new FetchHttpClient({
        baseUrl: 'https://api.test.no',
        tenantId: 'tenant-123',
        licenseKey: 'license-abc',
        token: 'jwt-token',
        timeout: 30000,
        defaultHeaders: { 'X-Custom': 'value' },
      });
      expect(fullClient).toBeDefined();
    });
  });

  describe('GET requests', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: '1', name: 'Test' } }),
      });

      const result = await client.get<{ data: { id: string; name: string } }>('/api/listings');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual({ id: '1', name: 'Test' });
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      });

      await client.get('/api/listings', {
        params: { page: 1, limit: 10, status: 'active' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.no/api/listings?page=1&limit=10&status=active',
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: { id: 'new-1' } }),
      });

      const result = await client.post<{ data: { id: string } }>('/api/bookings', {
        listingId: 'listing-1',
        startTime: '2026-01-20T10:00:00Z',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.no/api/bookings',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            listingId: 'listing-1',
            startTime: '2026-01-20T10:00:00Z',
          }),
        })
      );
      expect(result.data).toEqual({ id: 'new-1' });
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: '1', updated: true } }),
      });

      await client.put('/api/listings/1', { name: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.no/api/listings/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await client.delete('/api/listings/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.no/api/listings/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.patch('/api/listings/1', { status: 'published' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.no/api/listings/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError on 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
        }),
      });

      await expect(client.get('/api/test')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError on 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        }),
      });

      await expect(client.get('/api/test')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError on 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          error: { code: 'NOT_FOUND', message: 'Resource not found' },
        }),
      });

      try {
        await client.get('/api/test');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw ApiError on 500 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: { code: 'SERVER_ERROR', message: 'Internal error' },
        }),
      });

      await expect(client.get('/api/test')).rejects.toThrow(ApiError);
    });

    it('should call onUnauthorized callback on 401', async () => {
      const onUnauthorized = vi.fn();
      const authClient = new FetchHttpClient({
        baseUrl: 'https://api.test.no',
        onUnauthorized,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        }),
      });

      try {
        await authClient.get('/api/test');
      } catch {
        // Expected
      }

      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback on errors', async () => {
      const onError = vi.fn();
      const errorClient = new FetchHttpClient({
        baseUrl: 'https://api.test.no',
        onError,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: { code: 'SERVER_ERROR', message: 'Internal error' },
        }),
      });

      try {
        await errorClient.get('/api/test');
      } catch {
        // Expected
      }

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration', () => {
    it('should update config with updateConfig', () => {
      client.updateConfig({ token: 'new-token' });
      const config = client.getConfig();
      expect(config.token).toBe('new-token');
    });

    it('should clear token by updating config', () => {
      client.updateConfig({ token: 'some-token' });
      client.updateConfig({ token: undefined });
      const config = client.getConfig();
      expect(config.token).toBeUndefined();
    });

    it('should update tenant ID', () => {
      client.updateConfig({ tenantId: 'new-tenant-456' });
      const config = client.getConfig();
      expect(config.tenantId).toBe('new-tenant-456');
    });

    it('should get current config', () => {
      const config = client.getConfig();
      expect(config.baseUrl).toBe('https://api.test.no');
      expect(config.tenantId).toBe('test-tenant-123');
    });
  });
});
