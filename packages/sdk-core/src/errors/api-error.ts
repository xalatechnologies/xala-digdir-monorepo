/**
 * API Error Class
 *
 * Extends Error with RFC 7807 Problem Details support.
 * Schema-agnostic error handling for any API.
 */

import type { ProblemDetails, FieldError } from './problem-details';

/**
 * API Error class implementing RFC 7807 Problem Details
 * Provides typed error handling with full RFC7807 compliance
 */
export class ApiError extends Error implements ProblemDetails {
  public readonly type: string;
  public readonly title: string;
  public readonly status: number;
  public readonly detail?: string;
  public readonly instance?: string;
  public readonly correlationId?: string;
  public readonly timestamp?: string;
  public readonly errors?: FieldError[];

  /** @deprecated Use 'type' instead. Kept for backward compatibility. */
  public readonly code: string;
  /** @deprecated Use 'errors' instead. Kept for backward compatibility. */
  public readonly details?: Record<string, unknown>;

  constructor(problemOrMessage: string | ProblemDetails, code?: string, status?: number, details?: Record<string, unknown>) {
    if (typeof problemOrMessage === 'object') {
      const problem = problemOrMessage;
      super(problem.detail || problem.title);
      this.type = problem.type;
      this.title = problem.title;
      this.status = problem.status;
      this.detail = problem.detail;
      this.instance = problem.instance;
      this.correlationId = problem.correlationId;
      this.timestamp = problem.timestamp;
      this.errors = problem.errors;
      this.code = problem.type.split('/').pop() || 'UNKNOWN_ERROR';
      this.details = problem.errors ? { errors: problem.errors } : undefined;
    } else {
      super(problemOrMessage);
      this.type = code ? `/errors/${code.toLowerCase().replace(/_/g, '-')}` : '/errors/unknown';
      this.title = problemOrMessage;
      this.status = status || 500;
      this.detail = problemOrMessage;
      this.code = code || 'UNKNOWN_ERROR';
      this.details = details;
      this.timestamp = new Date().toISOString();
      if (details?.errors) {
        this.errors = details.errors as FieldError[];
      }
    }
    this.name = 'ApiError';
  }

  /**
   * Convert to RFC7807 ProblemDetails object
   */
  toProblemDetails(): ProblemDetails {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      errors: this.errors,
    };
  }

  /**
   * Check if error is a validation error with field-level errors
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a permission/authorization error
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a conflict error
   */
  isConflictError(): boolean {
    return this.status === 409;
  }

  /**
   * Check if error is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return (
      this.status === 408 || // Timeout
      this.status === 429 || // Rate limit
      this.status >= 500     // Server errors
    );
  }

  /**
   * Get validation errors for a specific field
   */
  getFieldErrors(field: string): string[] {
    if (!this.errors) return [];
    return this.errors.filter((e) => e.field === field).map((e) => e.message);
  }

  /**
   * Get all field errors as a map
   */
  getAllFieldErrors(): Record<string, string[]> {
    if (!this.errors) return {};

    const result: Record<string, string[]> = {};
    for (const error of this.errors) {
      const field = error.field || '_root';
      if (!result[field]) {
        result[field] = [];
      }
      result[field].push(error.message);
    }
    return result;
  }

  /**
   * Create from a fetch Response
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    const contentType = response.headers.get('content-type') || '';
    const isRFC7807 = contentType.includes('application/problem+json');

    try {
      const body = await response.json();

      if (isRFC7807 || body.type) {
        return new ApiError({
          type: body.type || '/errors/unknown',
          title: body.title || 'Request failed',
          status: body.status || response.status,
          detail: body.detail,
          instance: body.instance,
          correlationId: body.correlationId,
          timestamp: body.timestamp,
          errors: body.errors,
        });
      }

      // Legacy format
      return new ApiError(
        body.error?.message || body.message || 'Request failed',
        body.error?.code || body.code || 'UNKNOWN_ERROR',
        response.status,
        body.error?.details || body.details
      );
    } catch {
      return new ApiError('Request failed', 'UNKNOWN_ERROR', response.status);
    }
  }

  /**
   * Create a network error
   */
  static network(message = 'Network error'): ApiError {
    return new ApiError(message, 'NETWORK_ERROR', 0);
  }

  /**
   * Create a timeout error
   */
  static timeout(): ApiError {
    return new ApiError('Request timeout', 'TIMEOUT', 408);
  }
}
