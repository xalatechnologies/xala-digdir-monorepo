/**
 * HTTP Client Types
 *
 * Schema-agnostic type definitions for HTTP operations.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request body type supporting JSON and multipart/form-data
 */
export type RequestBody = unknown | FormData;

/**
 * Request options for HTTP operations
 */
export interface RequestOptions {
  /** URL query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Custom HTTP headers */
  headers?: Record<string, string>;
  /** Request body (for POST/PUT/PATCH) */
  body?: RequestBody;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
  /** Expected response type */
  responseType?: 'json' | 'blob' | 'text';
}

/**
 * HTTP response wrapper
 */
export interface HttpResponse<T> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Headers;
}

/**
 * HTTP Client Contract
 * Allows for different implementations (fetch, axios, etc.)
 */
export interface IHttpClient {
  /** Perform GET request */
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  /** Perform POST request */
  post<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
  /** Perform PUT request */
  put<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
  /** Perform PATCH request */
  patch<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
  /** Perform DELETE request */
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** Current tenant ID (for multi-tenant APIs) */
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
  /** Include credentials in cross-origin requests */
  credentials?: RequestCredentials;
}
