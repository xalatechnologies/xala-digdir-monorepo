/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 *
 * This module provides full RFC 7807 compliance for API error handling.
 * It is schema-agnostic and can be used with any API.
 */

/**
 * RFC 7807 Problem Details interface
 */
export interface ProblemDetails {
  /** URI reference identifying the problem type */
  type: string;
  /** Short, human-readable summary of the problem */
  title: string;
  /** HTTP status code */
  status: number;
  /** Human-readable explanation specific to this occurrence */
  detail?: string;
  /** URI reference identifying the specific occurrence */
  instance?: string;
  /** Correlation ID for request tracing */
  correlationId?: string;
  /** ISO 8601 timestamp of the error */
  timestamp?: string;
  /** Field-level validation errors */
  errors?: FieldError[];
}

/**
 * Field-level validation error
 */
export interface FieldError {
  /** Field path (e.g., "body.email" or "name") */
  field?: string;
  /** Error message */
  message: string;
  /** Error code (e.g., "required", "invalid_format") */
  code?: string;
}

/**
 * Check if an object is a valid RFC 7807 Problem Details response
 */
export function isProblemDetails(obj: unknown): obj is ProblemDetails {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const problem = obj as Record<string, unknown>;
  return (
    typeof problem.type === 'string' &&
    typeof problem.title === 'string' &&
    typeof problem.status === 'number'
  );
}

/**
 * Parse an error response into RFC 7807 Problem Details
 */
export function parseProblemDetails(
  response: unknown,
  status: number
): ProblemDetails {
  // Already RFC 7807 compliant
  if (isProblemDetails(response)) {
    return response;
  }

  // Legacy error format: { error: { code, message, details } }
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;

    if (obj.error && typeof obj.error === 'object') {
      const error = obj.error as Record<string, unknown>;
      return {
        type: `/errors/${String(error.code || 'unknown').toLowerCase().replace(/_/g, '-')}`,
        title: String(error.message || 'Request failed'),
        status,
        detail: String(error.message || undefined),
        errors: error.details ? parseFieldErrors(error.details) : undefined,
      };
    }

    // Simple { message, code } format
    if (obj.message) {
      return {
        type: `/errors/${String(obj.code || 'unknown').toLowerCase().replace(/_/g, '-')}`,
        title: String(obj.message),
        status,
        detail: String(obj.message),
      };
    }
  }

  // Fallback for unknown format
  return {
    type: '/errors/unknown',
    title: 'Request failed',
    status,
    detail: typeof response === 'string' ? response : undefined,
  };
}

/**
 * Parse field errors from various formats
 */
function parseFieldErrors(details: unknown): FieldError[] | undefined {
  if (Array.isArray(details)) {
    return details.map((e) => ({
      field: e.field || e.path,
      message: e.message || String(e),
      code: e.code,
    }));
  }

  if (typeof details === 'object' && details !== null) {
    const errors: FieldError[] = [];
    for (const [field, value] of Object.entries(details)) {
      if (Array.isArray(value)) {
        value.forEach((msg) => errors.push({ field, message: String(msg) }));
      } else {
        errors.push({ field, message: String(value) });
      }
    }
    return errors.length > 0 ? errors : undefined;
  }

  return undefined;
}

/**
 * Create a Problem Details object for common error types
 */
export const ProblemDetailsFactory = {
  /**
   * 400 Bad Request
   */
  badRequest(message: string, errors?: FieldError[]): ProblemDetails {
    return {
      type: '/errors/bad-request',
      title: 'Bad Request',
      status: 400,
      detail: message,
      errors,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 401 Unauthorized
   */
  unauthorized(message = 'Authentication is required'): ProblemDetails {
    return {
      type: '/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 403 Forbidden
   */
  forbidden(message = 'Access denied'): ProblemDetails {
    return {
      type: '/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 404 Not Found
   */
  notFound(resource: string, id?: string): ProblemDetails {
    return {
      type: '/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: id ? `${resource} with ID ${id} not found` : `${resource} not found`,
      instance: id ? `/${resource.toLowerCase()}/${id}` : undefined,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 409 Conflict
   */
  conflict(message: string): ProblemDetails {
    return {
      type: '/errors/conflict',
      title: 'Conflict',
      status: 409,
      detail: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 422 Unprocessable Entity (Validation)
   */
  validation(errors: FieldError[]): ProblemDetails {
    return {
      type: '/errors/validation',
      title: 'Validation Error',
      status: 422,
      detail: 'One or more validation errors occurred',
      errors,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 429 Too Many Requests
   */
  rateLimit(retryAfter?: number): ProblemDetails {
    return {
      type: '/errors/rate-limit',
      title: 'Too Many Requests',
      status: 429,
      detail: retryAfter
        ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
        : 'Rate limit exceeded',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 500 Internal Server Error
   */
  internal(message = 'An unexpected error occurred'): ProblemDetails {
    return {
      type: '/errors/internal',
      title: 'Internal Server Error',
      status: 500,
      detail: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 503 Service Unavailable
   */
  serviceUnavailable(message = 'Service temporarily unavailable'): ProblemDetails {
    return {
      type: '/errors/service-unavailable',
      title: 'Service Unavailable',
      status: 503,
      detail: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Network/timeout errors
   */
  network(message = 'Network error'): ProblemDetails {
    return {
      type: '/errors/network',
      title: 'Network Error',
      status: 0,
      detail: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Request timeout
   */
  timeout(): ProblemDetails {
    return {
      type: '/errors/timeout',
      title: 'Request Timeout',
      status: 408,
      detail: 'The request timed out',
      timestamp: new Date().toISOString(),
    };
  },
};
