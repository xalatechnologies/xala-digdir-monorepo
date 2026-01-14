/**
 * Fetch HTTP Client Implementation
 * Single Responsibility: HTTP communication using fetch API
 * Open/Closed: Extensible through configuration, closed for modification
 */

import type { IHttpClient, RequestOptions, ApiClientConfig, RequestBody } from './http-client.interface';
import { ApiError } from './http-client.interface';

export class FetchHttpClient implements IHttpClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * Update configuration (e.g., after login)
   */
  updateConfig(updates: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<ApiClientConfig> {
    return this.config;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private buildHeaders(customHeaders?: Record<string, string>, isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
    };

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.config.tenantId) {
      headers['X-Tenant-Id'] = this.config.tenantId;
    }

    if (this.config.licenseKey) {
      headers['X-License-Key'] = this.config.licenseKey;
    }

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: RequestOptions & { body?: RequestBody }
  ): Promise<T> {
    const url = this.buildUrl(path, options?.params);

    // Detect if body is FormData to handle Content-Type correctly
    const isFormData = options?.body instanceof FormData;
    const headers = this.buildHeaders(options?.headers, isFormData);

    const controller = new AbortController();
    const timeoutId = this.config.timeout
      ? setTimeout(() => controller.abort(), this.config.timeout)
      : null;

    try {
      // Prepare request body - FormData passes through, others get JSON.stringify
      let body: BodyInit | undefined;
      if (options?.body) {
        body = isFormData ? (options.body as FormData) : JSON.stringify(options.body);
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: options?.signal ?? controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.config.onUnauthorized?.();
        throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      // Handle error responses
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ 
          error: { code: 'UNKNOWN_ERROR', message: 'Request failed' }
        }));
        
        const error = new ApiError(
          errorBody.error?.message || 'Request failed',
          errorBody.error?.code || 'UNKNOWN_ERROR',
          response.status,
          errorBody.error?.details
        );
        
        this.config.onError?.(error);
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 'TIMEOUT', 408);
      }

      const apiError = new ApiError(
        error instanceof Error ? error.message : 'Network error',
        'NETWORK_ERROR',
        0
      );
      this.config.onError?.(apiError);
      throw apiError;
    }
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  async put<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  async patch<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }
}
