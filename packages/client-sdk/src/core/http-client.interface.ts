/**
 * HTTP Client Interface
 * Interface Segregation: Define minimal contract for HTTP operations
 * Dependency Inversion: Depend on abstractions, not implementations
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request body type supporting JSON and multipart/form-data
 */
export type RequestBody = unknown | FormData;

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: RequestBody;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob' | 'text';
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * HTTP Client Contract
 * Allows for different implementations (fetch, axios, etc.)
 */
export interface IHttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** Current tenant ID */
  tenantId?: string;
  /** License key for the tenant */
  licenseKey?: string;
  /** JWT token for authentication */
  token?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Callback when 401 is received */
  onUnauthorized?: () => void;
  /** Callback for all errors */
  onError?: (error: Error) => void;
  /** Custom headers to include in all requests */
  defaultHeaders?: Record<string, string>;
}

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
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
  errors?: Array<{ field?: string; message: string; code?: string }>;
}

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
  public readonly errors?: Array<{ field?: string; message: string; code?: string }>;

  /** @deprecated Use 'type' instead. Kept for backward compatibility. */
  public readonly code: string;
  /** @deprecated Use 'errors' instead. Kept for backward compatibility. */
  public readonly details?: Record<string, unknown>;

  constructor(
    messageOrProblem: string | ProblemDetails,
    code?: string,
    status?: number,
    details?: Record<string, unknown>
  ) {
    if (typeof messageOrProblem === 'object') {
      const problem = messageOrProblem;
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
      super(messageOrProblem);
      this.type = code ? `/errors/${code.toLowerCase().replace(/_/g, '-')}` : '/errors/unknown';
      this.title = messageOrProblem;
      this.status = status || 500;
      this.detail = messageOrProblem;
      this.code = code || 'UNKNOWN_ERROR';
      this.details = details;
      this.timestamp = new Date().toISOString();
      if (details?.errors) {
        this.errors = details.errors as Array<{ field?: string; message: string; code?: string }>;
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
   * Get validation errors for a specific field
   */
  getFieldErrors(field: string): string[] {
    if (!this.errors) return [];
    return this.errors
      .filter(e => e.field === field)
      .map(e => e.message);
  }
}
