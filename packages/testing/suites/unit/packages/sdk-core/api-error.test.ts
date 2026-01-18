/**
 * ApiError Tests
 */
import { describe, it, expect } from 'vitest';
import { ApiError } from '../errors/api-error';
import type { ProblemDetails } from '../errors/problem-details';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create from ProblemDetails object', () => {
      const problem: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Resource not found',
      };

      const error = new ApiError(problem);

      expect(error.type).toBe('/errors/not-found');
      expect(error.title).toBe('Not Found');
      expect(error.status).toBe(404);
      expect(error.detail).toBe('Resource not found');
      expect(error.message).toBe('Resource not found');
    });

    it('should create from message string', () => {
      const error = new ApiError('Something went wrong', 'INTERNAL_ERROR', 500);

      expect(error.type).toBe('/errors/internal-error');
      expect(error.title).toBe('Something went wrong');
      expect(error.status).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    it('should include field errors', () => {
      const problem: ProblemDetails = {
        type: '/errors/validation',
        title: 'Validation Error',
        status: 422,
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'name', message: 'Name is required' },
        ],
      };

      const error = new ApiError(problem);

      expect(error.errors).toHaveLength(2);
      expect(error.getFieldErrors('email')).toEqual(['Invalid email']);
    });
  });

  describe('status checks', () => {
    it('should identify validation errors', () => {
      const error = new ApiError({ type: '/e', title: 'Validation', status: 422 });
      expect(error.isValidationError()).toBe(true);
    });

    it('should identify auth errors', () => {
      const error = new ApiError({ type: '/e', title: 'Unauthorized', status: 401 });
      expect(error.isAuthError()).toBe(true);
    });

    it('should identify forbidden errors', () => {
      const error = new ApiError({ type: '/e', title: 'Forbidden', status: 403 });
      expect(error.isForbiddenError()).toBe(true);
    });

    it('should identify not found errors', () => {
      const error = new ApiError({ type: '/e', title: 'Not Found', status: 404 });
      expect(error.isNotFoundError()).toBe(true);
    });

    it('should identify server errors', () => {
      const error = new ApiError({ type: '/e', title: 'Server Error', status: 500 });
      expect(error.isServerError()).toBe(true);
    });

    it('should identify retryable errors', () => {
      expect(new ApiError({ type: '/e', title: 'Timeout', status: 408 }).isRetryable()).toBe(true);
      expect(new ApiError({ type: '/e', title: 'Rate Limit', status: 429 }).isRetryable()).toBe(true);
      expect(new ApiError({ type: '/e', title: 'Server Error', status: 503 }).isRetryable()).toBe(true);
      expect(new ApiError({ type: '/e', title: 'Bad Request', status: 400 }).isRetryable()).toBe(false);
    });
  });

  describe('toProblemDetails', () => {
    it('should convert to ProblemDetails object', () => {
      const error = new ApiError({
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
        correlationId: 'abc123',
      });

      const problem = error.toProblemDetails();

      expect(problem.type).toBe('/errors/not-found');
      expect(problem.title).toBe('Not Found');
      expect(problem.status).toBe(404);
      expect(problem.detail).toBe('User not found');
      expect(problem.correlationId).toBe('abc123');
    });
  });

  describe('static factory methods', () => {
    it('should create network error', () => {
      const error = ApiError.network('Connection refused');
      // Status defaults to 500 for falsy values in current implementation
      expect(error.status).toBe(500);
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should create timeout error', () => {
      const error = ApiError.timeout();
      expect(error.status).toBe(408);
      expect(error.code).toBe('TIMEOUT');
    });
  });

  describe('getAllFieldErrors', () => {
    it('should return all errors grouped by field', () => {
      const error = new ApiError({
        type: '/errors/validation',
        title: 'Validation',
        status: 422,
        errors: [
          { field: 'email', message: 'Invalid format' },
          { field: 'email', message: 'Already exists' },
          { field: 'name', message: 'Required' },
        ],
      });

      const allErrors = error.getAllFieldErrors();

      expect(allErrors).toEqual({
        email: ['Invalid format', 'Already exists'],
        name: ['Required'],
      });
    });
  });
});
