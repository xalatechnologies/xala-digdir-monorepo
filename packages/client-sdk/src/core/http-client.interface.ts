/**
 * HTTP Client Interface
 * Interface Segregation: Define minimal contract for HTTP operations
 * Dependency Inversion: Depend on abstractions, not implementations
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
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
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
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
 * API Error class for typed error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
