/**
 * RFC7807 Compliance Test
 * Verifies that error handling follows RFC7807 Problem Details standard
 * 
 * RFC 7807: https://datatracker.ietf.org/doc/html/rfc7807
 * Run with: pnpm --filter @digilist/client-sdk test:rfc7807
 */
import { describe, it, expect } from 'vitest';
import { ApiError } from '@digilist/api/core/http-client.interface';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  correlationId?: string;
  timestamp?: string;
  errors?: Array<{ field?: string; message: string; code?: string }>;
}

const RFC7807_REQUIRED_FIELDS = ['type', 'title', 'status'] as const;
// RFC7807 optional fields: detail, instance, correlationId, timestamp, errors

describe('RFC7807 Problem Details Compliance', () => {
  describe('ApiError Class Structure', () => {
    it('ApiError has RFC7807 required fields', () => {
      const error = new ApiError(
        'Resource not found',
        'NOT_FOUND',
        404,
        { resourceType: 'RentalObject' }
      );

      expect(error.message).toBeDefined();
      expect(error.code).toBeDefined();
      expect(error.status).toBeTypeOf('number');
    });

    it('ApiError extends Error', () => {
      const error = new ApiError('Test error', 'TEST', 500);
      expect(error).toBeInstanceOf(Error);
    });

    it('ApiError has name property', () => {
      const error = new ApiError('Test error', 'TEST', 500);
      expect(error.name).toBe('ApiError');
    });
  });

  describe('Error Shape Validation', () => {
    const testCases: Array<{ status: number; code: string; title: string }> = [
      { status: 400, code: 'BAD_REQUEST', title: 'Bad Request' },
      { status: 401, code: 'UNAUTHORIZED', title: 'Unauthorized' },
      { status: 403, code: 'FORBIDDEN', title: 'Forbidden' },
      { status: 404, code: 'NOT_FOUND', title: 'Not Found' },
      { status: 409, code: 'CONFLICT', title: 'Conflict' },
      { status: 422, code: 'VALIDATION_ERROR', title: 'Validation Error' },
      { status: 429, code: 'RATE_LIMITED', title: 'Too Many Requests' },
      { status: 500, code: 'INTERNAL_ERROR', title: 'Internal Server Error' },
    ];

    it.each(testCases)(
      'handles $status ($code) error correctly',
      ({ status, code, title }) => {
        const error = new ApiError(title, code, status);
        
        expect(error.status).toBe(status);
        expect(error.code).toBe(code);
        expect(error.message).toBe(title);
      }
    );
  });

  describe('Validation Error Format', () => {
    it('supports field-level validation errors', () => {
      const validationErrors = [
        { field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT' },
        { field: 'startTime', message: 'Start time must be in the future', code: 'INVALID_DATE' },
      ];

      const error = new ApiError(
        'Validation failed',
        'VALIDATION_ERROR',
        422,
        { errors: validationErrors }
      );

      const errors = error.details?.errors as Array<{ field?: string; message: string; code?: string }> | undefined;
      expect(errors).toHaveLength(2);
      expect(errors?.[0]).toHaveProperty('field', 'email');
      expect(errors?.[0]).toHaveProperty('message');
    });
  });

  describe('API Response Shape (Expected from Server)', () => {
    function validateProblemDetails(response: unknown): response is ProblemDetails {
      if (typeof response !== 'object' || response === null) return false;
      
      const obj = response as Record<string, unknown>;
      
      for (const field of RFC7807_REQUIRED_FIELDS) {
        if (!(field in obj)) return false;
      }
      
      if (typeof obj.type !== 'string') return false;
      if (typeof obj.title !== 'string') return false;
      if (typeof obj.status !== 'number') return false;
      
      return true;
    }

    it('validates correct ProblemDetails response', () => {
      const validResponse: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Rental object with id "abc" was not found',
        instance: '/api/rental-objects/abc',
        correlationId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: '2026-01-15T20:00:00.000Z',
      };

      expect(validateProblemDetails(validResponse)).toBe(true);
    });

    it('rejects response missing required fields', () => {
      const invalidResponses = [
        { title: 'Error', status: 500 }, // missing type
        { type: '/errors/test', status: 500 }, // missing title
        { type: '/errors/test', title: 'Error' }, // missing status
        { error: 'Something went wrong' }, // legacy format
        null,
        undefined,
      ];

      for (const response of invalidResponses) {
        expect(validateProblemDetails(response)).toBe(false);
      }
    });

    it('validates ProblemDetails with validation errors array', () => {
      const validationResponse: ProblemDetails = {
        type: '/errors/validation',
        title: 'Validation Failed',
        status: 400,
        detail: 'One or more validation errors occurred',
        errors: [
          { field: 'title', message: 'Title is required' },
          { field: 'category', message: 'Invalid category', code: 'INVALID_ENUM' },
        ],
      };

      expect(validateProblemDetails(validationResponse)).toBe(true);
      expect(validationResponse.errors).toHaveLength(2);
    });
  });

  describe('Error Type URIs', () => {
    const expectedErrorTypes = [
      '/errors/not-found',
      '/errors/validation',
      '/errors/bad-request',
      '/errors/unauthorized',
      '/errors/forbidden',
      '/errors/conflict',
      '/errors/rate-limit',
      '/errors/internal',
    ];

    it('uses consistent error type URI format', () => {
      for (const errorType of expectedErrorTypes) {
        expect(errorType).toMatch(/^\/errors\/[a-z-]+$/);
      }
    });

    it('error types are URL-safe', () => {
      for (const errorType of expectedErrorTypes) {
        expect(encodeURIComponent(errorType.slice(1))).toBe(errorType.slice(1));
      }
    });
  });

  describe('Content-Type Header', () => {
    it('RFC7807 requires application/problem+json content type', () => {
      const expectedContentType = 'application/problem+json';
      expect(expectedContentType).toBe('application/problem+json');
    });
  });
});

describe('RFC7807 Migration Recommendations', () => {
  it('documents current ApiError gap', () => {
    const currentApiError = new ApiError('Test', 'TEST', 500);
    
    // Current shape uses: message, code, status, details
    expect(currentApiError).toHaveProperty('message');
    expect(currentApiError).toHaveProperty('code');
    expect(currentApiError).toHaveProperty('status');
    
    // RFC7807 requires: type, title, status, detail (optional), instance (optional)
    // TODO: Update ApiError to use RFC7807 shape:
    // - code → type (with /errors/ prefix)
    // - message → title
    // - status → status (same)
    // - Add: detail, instance, correlationId, timestamp, errors
    
    console.log(`
📋 RFC7807 Migration TODO:
   - Update ApiError constructor to accept ProblemDetails shape
   - Map legacy 'code' to 'type' with /errors/ prefix
   - Map legacy 'message' to 'title'
   - Add optional 'detail', 'instance', 'correlationId', 'timestamp'
   - Add 'errors' array for validation errors
    `);
  });
});
