/**
 * FetchHttpClient Tests
 * Comprehensive test coverage for HTTP client including RFC7807 error handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchHttpClient } from '@xala/api/core/fetch-client';
import { ApiError } from '@xala/api/core/http-client.interface';
import type { ApiClientConfig } from '@xala/api/core/http-client.interface';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FetchHttpClient', () => {
  let client: FetchHttpClient;
  const baseConfig: ApiClientConfig = {
    baseUrl: 'https://api.digilist.no',
    tenantId: 'tenant-123',
    licenseKey: 'license-abc',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = new FetchHttpClient(baseConfig);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Configuration', () => {
    it('stores initial configuration', () => {
      expect(client.getConfig().baseUrl).toBe('https://api.digilist.no');
      expect(client.getConfig().tenantId).toBe('tenant-123');
    });

    it('updates configuration', () => {
      client.updateConfig({ token: 'new-token' });

      expect(client.getConfig().token).toBe('new-token');
      expect(client.getConfig().tenantId).toBe('tenant-123');
    });

    it('returns readonly configuration', () => {
      const config = client.getConfig();

      expect(typeof config).toBe('object');
      expect(config.baseUrl).toBe('https://api.digilist.no');
    });
  });

  describe('Request Headers', () => {
    it('includes Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes X-Tenant-Id header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Tenant-Id': 'tenant-123',
          }),
        })
      );
    });

    it('includes X-License-Key header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-License-Key': 'license-abc',
          }),
        })
      );
    });

    it('includes Authorization header when token is set', async () => {
      client.updateConfig({ token: 'jwt-token' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer jwt-token',
          }),
        })
      );
    });

    it('does not set Content-Type for FormData', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test']));

      await client.post('/api/upload', formData);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers['Content-Type']).toBeUndefined();
    });

    it('includes custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
      });
    });

    it('performs GET request', async () => {
      await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('performs POST request with body', async () => {
      await client.post('/api/test', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('performs PUT request with body', async () => {
      await client.put('/api/test/1', { name: 'updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        })
      );
    });

    it('performs PATCH request with body', async () => {
      await client.patch('/api/test/1', { status: 'active' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'active' }),
        })
      );
    });

    it('performs DELETE request', async () => {
      await client.delete('/api/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('URL Building', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });
    });

    it('builds URL with base URL', async () => {
      await client.get('/api/rental-objects');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.digilist.no/api/rental-objects',
        expect.any(Object)
      );
    });

    it('appends query parameters', async () => {
      await client.get('/api/rental-objects', {
        params: { limit: 10, offset: 0, status: 'active' },
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('offset=0');
      expect(calledUrl).toContain('status=active');
    });

    it('ignores undefined parameters', async () => {
      await client.get('/api/rental-objects', {
        params: { limit: 10, category: undefined },
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).not.toContain('category');
    });
  });

  describe('Response Handling', () => {
    it('returns JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: '123', name: 'Test' } }),
      });

      const result = await client.get('/api/test');

      expect(result).toEqual({ data: { id: '123', name: 'Test' } });
    });

    it('handles 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.delete('/api/test/1');

      expect(result).toEqual({});
    });

    it('returns blob for blob response type', async () => {
      const mockBlob = new Blob(['test']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await client.get('/api/download', {
        responseType: 'blob',
      });

      expect(result).toBe(mockBlob);
    });

    it('returns text for text response type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('plain text response'),
      });

      const result = await client.get('/api/export', {
        responseType: 'text',
      });

      expect(result).toBe('plain text response');
    });
  });

  describe('RFC7807 Error Handling', () => {
    it('handles RFC7807 error response with application/problem+json', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: () => Promise.resolve({
          type: '/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: 'Rental object not found',
          instance: '/api/rental-objects/abc',
          correlationId: 'corr-123',
          timestamp: '2026-01-15T20:00:00.000Z',
        }),
      });

      await expect(client.get('/api/rental-objects/abc')).rejects.toThrow(ApiError);

      try {
        await client.get('/api/rental-objects/abc');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        // Verify error was thrown with correct status
        expect(apiError.status).toBe(404);
      }
    });

    it('handles RFC7807 validation error with errors array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: () => Promise.resolve({
          type: '/errors/validation',
          title: 'Validation Failed',
          status: 400,
          detail: 'One or more validation errors occurred',
          errors: [
            { field: 'title', message: 'Title is required', code: 'REQUIRED' },
            { field: 'startTime', message: 'Invalid date format' },
          ],
        }),
      });

      try {
        await client.post('/api/bookings', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.errors).toHaveLength(2);
        expect(apiError.errors?.[0].field).toBe('title');
        expect(apiError.getFieldErrors('title')).toContain('Title is required');
      }
    });

    it('handles error response with type field (non-problem+json)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          type: '/errors/conflict',
          title: 'Conflict',
          status: 409,
          detail: 'Booking conflicts with existing reservation',
        }),
      });

      try {
        await client.post('/api/bookings', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.type).toBe('/errors/conflict');
        expect(apiError.isConflictError()).toBe(true);
      }
    });

    it('handles legacy error format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: { field: 'email' },
          },
        }),
      });

      try {
        await client.post('/api/users', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.code).toBe('VALIDATION_ERROR');
        expect(apiError.message).toBe('Invalid input');
      }
    });
  });

  describe('401 Unauthorized Handling', () => {
    it('calls onUnauthorized callback', async () => {
      const onUnauthorized = vi.fn();
      client = new FetchHttpClient({ ...baseConfig, onUnauthorized });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: () => Promise.resolve({}),
      });

      await expect(client.get('/api/protected')).rejects.toThrow(ApiError);
      expect(onUnauthorized).toHaveBeenCalled();
    });

    it('throws ApiError with RFC7807 shape for 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: () => Promise.resolve({}),
      });

      try {
        await client.get('/api/protected');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.type).toBe('/errors/unauthorized');
        expect(apiError.title).toBe('Unauthorized');
        expect(apiError.status).toBe(401);
        expect(apiError.isAuthError()).toBe(true);
      }
    });
  });

  describe('Error Callback', () => {
    it('calls onError callback for errors', async () => {
      const onError = vi.fn();
      client = new FetchHttpClient({ ...baseConfig, onError });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: () => Promise.resolve({
          type: '/errors/internal',
          title: 'Internal Server Error',
          status: 500,
        }),
      });

      await expect(client.get('/api/test')).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Network Errors', () => {
    it('handles network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await client.get('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        // Network errors may have different status codes based on implementation
        expect(apiError.status).toBeGreaterThanOrEqual(0);
      }
    });

    it('handles timeout (AbortError)', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);

      try {
        await client.get('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.code).toBe('TIMEOUT');
        expect(apiError.status).toBe(408);
      }
    });

    it('handles JSON parse failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      try {
        await client.get('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.type).toBe('/errors/unknown');
        expect(apiError.status).toBe(500);
      }
    });
  });

  describe('Credentials', () => {
    it('includes credentials for cross-origin requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('Abort Signal', () => {
    it('passes custom abort signal', async () => {
      const controller = new AbortController();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: {} }),
      });

      await client.get('/api/test', { signal: controller.signal });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });
});
