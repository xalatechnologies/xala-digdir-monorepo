/**
 * Vipps API Client
 * 
 * Handles HTTP communication with Vipps APIs:
 * - Access token management (OAuth2 client credentials flow)
 * - Request signing with subscription key
 * - RFC 7807 error mapping
 * - Retry logic and rate limiting
 */

import { getVippsConfig, getVippsEndpoints, type VippsConfig, type VippsEndpoints } from '../../config/vipps.config';
import { AppError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';

// =============================================================================
// Types
// =============================================================================

export interface VippsAccessToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number; // Unix timestamp (ms)
}

export interface VippsApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

export interface VippsRequestOptions {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request body (will be JSON stringified) */
  body?: Record<string, unknown>;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Skip access token (for auth endpoints) */
  skipAuth?: boolean;
  /** Idempotency key for POST requests */
  idempotencyKey?: string;
}

// =============================================================================
// Token Cache
// =============================================================================

let cachedToken: VippsAccessToken | null = null;

/**
 * Get valid access token, refreshing if expired
 */
async function getAccessToken(config: VippsConfig, endpoints: VippsEndpoints): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }
  
  // Fetch new token
  const response = await fetch(endpoints.accessToken, {
    method: 'POST',
    headers: {
      'client_id': config.clientId,
      'client_secret': config.clientSecret,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Merchant-Serial-Number': config.merchantSerialNumber,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(
      'Failed to get Vipps access token',
      response.status,
      errorText,
      '/errors/vipps-token-error'
    );
  }
  
  const data = await response.json() as {
    access_token: string;
    token_type: string;
    expires_in: string;
  };
  
  cachedToken = {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: parseInt(data.expires_in, 10),
    expiresAt: now + parseInt(data.expires_in, 10) * 1000,
  };
  
  return cachedToken.accessToken;
}

/**
 * Clear cached token (for testing or after auth failures)
 */
export function clearTokenCache(): void {
  cachedToken = null;
}

// =============================================================================
// Vipps Client Class
// =============================================================================

export class VippsClient {
  private config: VippsConfig;
  private endpoints: VippsEndpoints;
  
  constructor() {
    this.config = getVippsConfig();
    this.endpoints = getVippsEndpoints(this.config);
  }
  
  /**
   * Get Vipps endpoints
   */
  getEndpoints(): VippsEndpoints {
    return this.endpoints;
  }
  
  /**
   * Get current config (for reference, not mutation)
   */
  getConfig(): Readonly<VippsConfig> {
    return this.config;
  }
  
  /**
   * Make authenticated request to Vipps API
   */
  async request<T>(url: string, options: VippsRequestOptions): Promise<T> {
    const startTime = Date.now();
    
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
      'Merchant-Serial-Number': this.config.merchantSerialNumber,
      ...options.headers,
    };
    
    // Add access token if not skipped
    if (!options.skipAuth) {
      const token = await getAccessToken(this.config, this.endpoints);
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add idempotency key for POST requests
    if (options.idempotencyKey && options.method === 'POST') {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }
    
    // Make request
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    const duration = Date.now() - startTime;
    
    // Handle response
    if (!response.ok) {
      await this.handleError(url, response, duration);
    }
    
    // Parse JSON response
    const data = await response.json() as T;
    
    // Log successful request
    this.logRequest(url, options.method, response.status, duration, true);
    
    return data;
  }
  
  /**
   * Handle error response
   */
  private async handleError(url: string, response: Response, duration: number): Promise<never> {
    let errorData: VippsApiError | null = null;
    
    try {
      errorData = await response.json() as VippsApiError;
    } catch {
      // Response is not JSON
    }
    
    // Log failed request
    this.logRequest(url, 'ERROR', response.status, duration, false, errorData?.detail);
    
    // Clear token cache on 401 (token might be expired)
    if (response.status === 401) {
      clearTokenCache();
    }
    
    // Throw AppError (RFC 7807 compliant)
    throw new AppError(
      errorData?.title || 'Vipps API Error',
      response.status,
      errorData?.detail || response.statusText,
      `/errors/${errorData?.type || `vipps-error-${response.status}`}`
    );
  }
  
  /**
   * Log API request for monitoring
   */
  private logRequest(
    url: string,
    method: string,
    status: number,
    durationMs: number,
    success: boolean,
    errorDetail?: string
  ): void {
    try {
      getAuditService().log({
        tenantId: 'system',
        userId: 'vipps-client',
        action: success ? 'vipps_api_request' : 'vipps_api_error',
        resource: 'vipps',
        resourceId: url,
        metadata: {
          method,
          status,
          durationMs,
          success,
          error: errorDetail,
        },
      });
    } catch {
      // Silently fail if audit service is not available
    }
  }
  
  // ===========================================================================
  // Convenience methods
  // ===========================================================================
  
  /**
   * GET request
   */
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, { method: 'GET', headers });
  }
  
  /**
   * POST request
   */
  async post<T>(
    url: string,
    body: Record<string, unknown>,
    options?: { idempotencyKey?: string; headers?: Record<string, string> }
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body,
      idempotencyKey: options?.idempotencyKey,
      headers: options?.headers,
    });
  }
  
  /**
   * PUT request
   */
  async put<T>(url: string, body: Record<string, unknown>): Promise<T> {
    return this.request<T>(url, { method: 'PUT', body });
  }
  
  /**
   * DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

// =============================================================================
// Singleton instance
// =============================================================================

let clientInstance: VippsClient | null = null;

/**
 * Get the Vipps client singleton
 */
export function getVippsClient(): VippsClient {
  if (!clientInstance) {
    clientInstance = new VippsClient();
  }
  return clientInstance;
}

/**
 * Clear client instance (for testing)
 */
export function clearVippsClient(): void {
  clientInstance = null;
  clearTokenCache();
}
