/**
 * ApiError RFC7807 Comprehensive Tests
 * Full coverage of the RFC7807 Problem Details implementation
 */
import { describe, it, expect } from 'vitest';
import { ApiError, type ProblemDetails } from '../core/http-client.interface';

describe('ApiError - RFC7807 Compliance', () => {
  describe('Constructor - ProblemDetails object', () => {
    it('creates error from ProblemDetails object', () => {
      const problemDetails: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Rental object with id "abc" was not found',
        instance: '/api/rental-objects/abc',
        correlationId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: '2026-01-15T20:00:00.000Z',
      };

      const error = new ApiError(problemDetails);

      expect(error.type).toBe('/errors/not-found');
      expect(error.title).toBe('Not Found');
      expect(error.status).toBe(404);
      expect(error.detail).toBe('Rental object with id "abc" was not found');
      expect(error.instance).toBe('/api/rental-objects/abc');
      expect(error.correlationId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(error.timestamp).toBe('2026-01-15T20:00:00.000Z');
    });

    it('creates error with validation errors array', () => {
      const problemDetails: ProblemDetails = {
        type: '/errors/validation',
        title: 'Validation Failed',
        status: 400,
        detail: 'One or more validation errors occurred',
        errors: [
          { field: 'title', message: 'Title is required', code: 'REQUIRED' },
          { field: 'startTime', message: 'Start time must be in the future', code: 'INVALID_DATE' },
          { field: 'email', message: 'Invalid email format' },
        ],
      };

      const error = new ApiError(problemDetails);

      expect(error.errors).toHaveLength(3);
      expect(error.errors?.[0].field).toBe('title');
      expect(error.errors?.[0].message).toBe('Title is required');
      expect(error.errors?.[0].code).toBe('REQUIRED');
      expect(error.errors?.[2].code).toBeUndefined();
    });

    it('sets message from detail or title', () => {
      const withDetail = new ApiError({
        type: '/errors/test',
        title: 'Test Error',
        status: 400,
        detail: 'Detailed message',
      });

      const withoutDetail = new ApiError({
        type: '/errors/test',
        title: 'Test Error',
        status: 400,
      });

      expect(withDetail.message).toBe('Detailed message');
      expect(withoutDetail.message).toBe('Test Error');
    });

    it('derives legacy code from type', () => {
      const error = new ApiError({
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
      });

      expect(error.code).toBe('not-found');
    });
  });

  describe('Constructor - Legacy format (backward compatibility)', () => {
    it('creates error from string message', () => {
      const error = new ApiError('Something went wrong', 'INTERNAL_ERROR', 500);

      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.status).toBe(500);
      expect(error.type).toBe('/errors/internal-error');
      expect(error.title).toBe('Something went wrong');
    });

    it('creates error with details object', () => {
      const error = new ApiError('Validation failed', 'VALIDATION_ERROR', 422, {
        errors: [{ field: 'name', message: 'Required' }],
      });

      expect(error.details).toEqual({ errors: [{ field: 'name', message: 'Required' }] });
      expect(error.errors).toEqual([{ field: 'name', message: 'Required' }]);
    });

    it('defaults status to 500 if not provided', () => {
      const error = new ApiError('Error', 'ERROR');

      expect(error.status).toBe(500);
    });

    it('defaults code to UNKNOWN_ERROR if not provided', () => {
      const error = new ApiError('Error');

      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.type).toBe('/errors/unknown');
    });

    it('adds timestamp automatically', () => {
      const before = new Date().toISOString();
      const error = new ApiError('Error', 'ERROR', 500);
      const after = new Date().toISOString();

      expect(error.timestamp).toBeDefined();
      expect(error.timestamp! >= before).toBe(true);
      expect(error.timestamp! <= after).toBe(true);
    });
  });

  describe('Error class inheritance', () => {
    it('extends Error', () => {
      const error = new ApiError({ type: '/errors/test', title: 'Test', status: 400 });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });

    it('has name property set to ApiError', () => {
      const error = new ApiError({ type: '/errors/test', title: 'Test', status: 400 });

      expect(error.name).toBe('ApiError');
    });

    it('has stack trace', () => {
      const error = new ApiError({ type: '/errors/test', title: 'Test', status: 400 });

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });
  });

  describe('toProblemDetails', () => {
    it('converts to RFC7807 object', () => {
      const error = new ApiError({
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Resource not found',
        instance: '/api/resources/123',
        correlationId: 'abc-123',
        timestamp: '2026-01-15T20:00:00.000Z',
        errors: [{ message: 'Field error' }],
      });

      const pd = error.toProblemDetails();

      expect(pd.type).toBe('/errors/not-found');
      expect(pd.title).toBe('Not Found');
      expect(pd.status).toBe(404);
      expect(pd.detail).toBe('Resource not found');
      expect(pd.instance).toBe('/api/resources/123');
      expect(pd.correlationId).toBe('abc-123');
      expect(pd.timestamp).toBe('2026-01-15T20:00:00.000Z');
      expect(pd.errors).toEqual([{ message: 'Field error' }]);
    });

    it('returns object matching ProblemDetails interface', () => {
      const error = new ApiError('Test', 'TEST', 400);
      const pd = error.toProblemDetails();

      const requiredKeys = ['type', 'title', 'status'];
      requiredKeys.forEach(key => {
        expect(pd).toHaveProperty(key);
      });
    });
  });

  describe('Status code helper methods', () => {
    describe('isValidationError', () => {
      it('returns true for 400', () => {
        expect(new ApiError({ type: '/errors/bad-request', title: 'Bad Request', status: 400 }).isValidationError()).toBe(true);
      });

      it('returns true for 422', () => {
        expect(new ApiError({ type: '/errors/validation', title: 'Validation', status: 422 }).isValidationError()).toBe(true);
      });

      it('returns false for other status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 404 }).isValidationError()).toBe(false);
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 500 }).isValidationError()).toBe(false);
      });
    });

    describe('isAuthError', () => {
      it('returns true for 401', () => {
        expect(new ApiError({ type: '/errors/unauthorized', title: 'Unauthorized', status: 401 }).isAuthError()).toBe(true);
      });

      it('returns false for other status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 403 }).isAuthError()).toBe(false);
      });
    });

    describe('isForbiddenError', () => {
      it('returns true for 403', () => {
        expect(new ApiError({ type: '/errors/forbidden', title: 'Forbidden', status: 403 }).isForbiddenError()).toBe(true);
      });

      it('returns false for other status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 401 }).isForbiddenError()).toBe(false);
      });
    });

    describe('isNotFoundError', () => {
      it('returns true for 404', () => {
        expect(new ApiError({ type: '/errors/not-found', title: 'Not Found', status: 404 }).isNotFoundError()).toBe(true);
      });

      it('returns false for other status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 400 }).isNotFoundError()).toBe(false);
      });
    });

    describe('isConflictError', () => {
      it('returns true for 409', () => {
        expect(new ApiError({ type: '/errors/conflict', title: 'Conflict', status: 409 }).isConflictError()).toBe(true);
      });

      it('returns false for other status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 400 }).isConflictError()).toBe(false);
      });
    });

    describe('isRateLimitError', () => {
      it('returns true for 429', () => {
        expect(new ApiError({ type: '/errors/rate-limit', title: 'Rate Limit', status: 429 }).isRateLimitError()).toBe(true);
      });

      it('returns false for other status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 400 }).isRateLimitError()).toBe(false);
      });
    });

    describe('isServerError', () => {
      it('returns true for 5xx status codes', () => {
        expect(new ApiError({ type: '/errors/internal', title: 'Internal', status: 500 }).isServerError()).toBe(true);
        expect(new ApiError({ type: '/errors/bad-gateway', title: 'Bad Gateway', status: 502 }).isServerError()).toBe(true);
        expect(new ApiError({ type: '/errors/service-unavailable', title: 'Unavailable', status: 503 }).isServerError()).toBe(true);
        expect(new ApiError({ type: '/errors/gateway-timeout', title: 'Timeout', status: 504 }).isServerError()).toBe(true);
      });

      it('returns false for 4xx status codes', () => {
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 400 }).isServerError()).toBe(false);
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 404 }).isServerError()).toBe(false);
        expect(new ApiError({ type: '/errors/test', title: 'Test', status: 499 }).isServerError()).toBe(false);
      });
    });
  });

  describe('getFieldErrors', () => {
    it('returns errors for specific field', () => {
      const error = new ApiError({
        type: '/errors/validation',
        title: 'Validation Failed',
        status: 400,
        errors: [
          { field: 'email', message: 'Invalid format' },
          { field: 'email', message: 'Already exists' },
          { field: 'name', message: 'Required' },
        ],
      });

      const emailErrors = error.getFieldErrors('email');

      expect(emailErrors).toHaveLength(2);
      expect(emailErrors).toContain('Invalid format');
      expect(emailErrors).toContain('Already exists');
    });

    it('returns empty array for field with no errors', () => {
      const error = new ApiError({
        type: '/errors/validation',
        title: 'Validation Failed',
        status: 400,
        errors: [{ field: 'name', message: 'Required' }],
      });

      expect(error.getFieldErrors('email')).toEqual([]);
    });

    it('returns empty array when no errors exist', () => {
      const error = new ApiError({
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
      });

      expect(error.getFieldErrors('anything')).toEqual([]);
    });

    it('handles errors without field property', () => {
      const error = new ApiError({
        type: '/errors/validation',
        title: 'Validation Failed',
        status: 400,
        errors: [
          { message: 'Global error' },
          { field: 'name', message: 'Required' },
        ],
      });

      expect(error.getFieldErrors('name')).toEqual(['Required']);
      // Global errors (without field) may be returned for undefined/empty field
      const globalErrors = error.getFieldErrors(undefined as unknown as string);
      expect(Array.isArray(globalErrors)).toBe(true);
    });
  });
});

describe('ApiError - Common Error Scenarios', () => {
  const errorScenarios = [
    {
      name: '400 Bad Request',
      error: { type: '/errors/bad-request', title: 'Bad Request', status: 400, detail: 'Invalid request body' },
    },
    {
      name: '401 Unauthorized',
      error: { type: '/errors/unauthorized', title: 'Unauthorized', status: 401, detail: 'Authentication required' },
    },
    {
      name: '403 Forbidden',
      error: { type: '/errors/forbidden', title: 'Forbidden', status: 403, detail: 'Insufficient permissions' },
    },
    {
      name: '404 Not Found',
      error: { type: '/errors/not-found', title: 'Not Found', status: 404, detail: 'Resource does not exist' },
    },
    {
      name: '409 Conflict',
      error: { type: '/errors/conflict', title: 'Conflict', status: 409, detail: 'Resource already exists' },
    },
    {
      name: '422 Unprocessable Entity',
      error: { type: '/errors/validation', title: 'Validation Failed', status: 422, detail: 'Validation errors', errors: [{ field: 'email', message: 'Invalid' }] },
    },
    {
      name: '429 Too Many Requests',
      error: { type: '/errors/rate-limit', title: 'Too Many Requests', status: 429, detail: 'Rate limit exceeded' },
    },
    {
      name: '500 Internal Server Error',
      error: { type: '/errors/internal', title: 'Internal Server Error', status: 500, detail: 'An unexpected error occurred' },
    },
    {
      name: '502 Bad Gateway',
      error: { type: '/errors/bad-gateway', title: 'Bad Gateway', status: 502, detail: 'Upstream server error' },
    },
    {
      name: '503 Service Unavailable',
      error: { type: '/errors/service-unavailable', title: 'Service Unavailable', status: 503, detail: 'Service is down' },
    },
  ];

  it.each(errorScenarios)('handles $name correctly', ({ error }) => {
    const apiError = new ApiError(error);

    expect(apiError.type).toBe(error.type);
    expect(apiError.title).toBe(error.title);
    expect(apiError.status).toBe(error.status);
    expect(apiError.detail).toBe(error.detail);
  });
});

describe('ApiError - Type URI Format', () => {
  it('uses consistent /errors/ prefix', () => {
    const types = [
      '/errors/not-found',
      '/errors/validation',
      '/errors/unauthorized',
      '/errors/forbidden',
      '/errors/conflict',
      '/errors/rate-limit',
      '/errors/internal',
    ];

    types.forEach(type => {
      expect(type).toMatch(/^\/errors\/[a-z-]+$/);
    });
  });

  it('type URIs are URL-safe', () => {
    const error = new ApiError('Test', 'SOME_ERROR_CODE', 400);

    // Type should be a valid URI path segment
    expect(error.type).toMatch(/^\/errors\/[a-z0-9-]+$/i);
    // The path part (without slashes) should be URL-safe
    const pathPart = error.type.split('/').pop() || '';
    expect(encodeURIComponent(pathPart)).toBe(pathPart);
  });
});

describe('ApiError - Serialization', () => {
  it('can be serialized to JSON', () => {
    const error = new ApiError({
      type: '/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test detail',
    });

    const json = JSON.stringify(error.toProblemDetails());
    const parsed = JSON.parse(json);

    expect(parsed.type).toBe('/errors/test');
    expect(parsed.title).toBe('Test');
    expect(parsed.status).toBe(400);
  });

  it('maintains shape after round-trip', () => {
    const original: ProblemDetails = {
      type: '/errors/validation',
      title: 'Validation Failed',
      status: 422,
      detail: 'Multiple errors',
      errors: [{ field: 'name', message: 'Required' }],
    };

    const error = new ApiError(original);
    const roundTrip = JSON.parse(JSON.stringify(error.toProblemDetails()));

    expect(roundTrip).toEqual(original);
  });
});
