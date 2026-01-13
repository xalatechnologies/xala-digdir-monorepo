/**
 * API Client
 * Base fetch wrapper with error handling and single-tenant configuration
 */

/**
 * SDK Configuration
 */
export interface SdkConfig {
  /** API base URL */
  apiUrl: string;
  /** Tenant identifier (single-tenant mode) */
  tenantId: string;
  /** Subscription license key */
  licenseKey: string;
  /** Skip API calls and use mock data (for development) */
  useMockData?: boolean;
}

// Global SDK configuration
let sdkConfig: SdkConfig | null = null;

/**
 * Initialize the SDK with configuration
 * Call this once in your app's entry point (e.g., main.tsx)
 */
export function initializeSdk(config: SdkConfig): void {
  sdkConfig = config;
}

/**
 * Get the current SDK configuration
 * Throws if SDK is not initialized
 */
export function getSdkConfig(): SdkConfig {
  if (!sdkConfig) {
    throw new Error(
      '@xala/sdk not initialized. Call initializeSdk() in your app entry point.'
    );
  }
  return sdkConfig;
}

/**
 * Check if mock data mode is enabled
 */
export function isUsingMockData(): boolean {
  return sdkConfig?.useMockData ?? false;
}

/**
 * API Error class for typed error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, body?: unknown): ApiError {
    const message = (body as { message?: string })?.message || response.statusText;
    const code = (body as { code?: string })?.code;
    return new ApiError(message, response.status, code, body);
  }
}

/**
 * Request options for API calls
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** Skip tenant header (for public endpoints) */
  skipTenantHeader?: boolean;
}

/**
 * API Client class
 */
export class ApiClient {
  private baseUrl: string;
  private tenantId: string;
  private licenseKey: string;

  constructor(config?: SdkConfig) {
    const cfg = config || getSdkConfig();
    this.baseUrl = cfg.apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.tenantId = cfg.tenantId;
    this.licenseKey = cfg.licenseKey;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Get default headers including tenant and license
   * Only adds headers when values are provided (for CORS compatibility)
   */
  private getHeaders(customHeaders?: HeadersInit, skipTenantHeader = false): Headers {
    const headers = new Headers(customHeaders);
    
    // Set default content type
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add tenant header if provided and not skipped (for public endpoints)
    if (this.tenantId && !skipTenantHeader) {
      headers.set('X-Tenant-Id', this.tenantId);
    }
    
    // Only add license key if it's actually set (avoids CORS issues)
    if (this.licenseKey) {
      headers.set('X-License-Key', this.licenseKey);
    }
    
    return headers;
  }

  /**
   * Make an API request
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: customHeaders, skipTenantHeader, ...fetchOptions } = options;
    
    const url = this.buildUrl(path, params);
    const headers = this.getHeaders(customHeaders, skipTenantHeader);
    
    const fetchInit: RequestInit = {
      ...fetchOptions,
      headers,
    };
    
    if (body) {
      fetchInit.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchInit);

    // Parse response body
    let responseBody: unknown;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      throw ApiError.fromResponse(response, responseBody);
    }

    return responseBody as T;
  }

  /**
   * GET request
   */
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const options: RequestOptions = { method: 'GET' };
    if (params) {
      options.params = params;
    }
    return this.request<T>(path, options);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

// Singleton instance (initialized after initializeSdk is called)
let apiClientInstance: ApiClient | null = null;

/**
 * Get the shared API client instance
 */
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
}
