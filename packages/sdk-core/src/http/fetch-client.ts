/**
 * Fetch HTTP Client Implementation
 *
 * Schema-agnostic HTTP client using the Fetch API.
 * Provides RFC 7807 error handling and multi-tenant support.
 */

import type { IHttpClient, RequestOptions, ApiClientConfig, RequestBody } from './types';
import { ApiError } from '../errors/api-error';

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
    options?: RequestOptions & { body?: RequestBody; _isRetry?: boolean }
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
        credentials: this.config.credentials ?? 'include',
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Handle 401 Unauthorized with single retry
      if (response.status === 401 && !options?._isRetry) {
        // Try to refresh token once
        try {
          await this.refreshToken();

          // Retry original request once
          return this.request<T>(method, path, {
            ...options,
            _isRetry: true, // Prevent infinite retry
          });
        } catch {
          // Refresh failed - emit auth expired event and throw
          this.emitAuthExpiredEvent();
          this.config.onUnauthorized?.();
          throw new ApiError({
            type: '/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: 'Authentication is required',
          });
        }
      }

      // Handle 401 after retry attempt (no more retries)
      if (response.status === 401 && options?._isRetry) {
        this.emitAuthExpiredEvent();
        this.config.onUnauthorized?.();
        throw new ApiError({
          type: '/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication is required',
        });
      }

      // Handle error responses
      if (!response.ok) {
        const error = await ApiError.fromResponse(response);
        this.config.onError?.(error);
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Handle different response types
      const responseType = options?.responseType || 'json';

      if (responseType === 'blob') {
        return response.blob() as Promise<T>;
      } else if (responseType === 'text') {
        return response.text() as Promise<T>;
      }

      return response.json();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = ApiError.timeout();
        this.config.onError?.(timeoutError);
        throw timeoutError;
      }

      const networkError = ApiError.network(
        error instanceof Error ? error.message : 'Network error'
      );
      this.config.onError?.(networkError);
      throw networkError;
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

  /**
   * Attempt to refresh access token using refresh token cookie
   * @private
   */
  private async refreshToken(): Promise<void> {
    const refreshUrl = `${this.config.baseUrl}/api/auth/refresh`;

    const response = await fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include', // Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    // New tokens are automatically set via Set-Cookie headers
  }

  /**
   * Emit custom event for auth expiration
   * @private
   */
  private emitAuthExpiredEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }
}
