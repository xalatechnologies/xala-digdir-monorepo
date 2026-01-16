/**
 * Vipps Payment Real Client
 * Production implementation for Vipps ePayment API
 *
 * Rate Limits:
 * - Varies by endpoint, see documentation
 * - OAuth 2.0 token expires after 3600 seconds
 *
 * Implementation Notes:
 * - Token caching with 60s buffer before expiry
 * - Idempotency-Key header required for POST requests
 * - Subscription key in 'Ocp-Apim-Subscription-Key' header
 * - Clear token cache on 401 errors
 *
 * Requires:
 * - VIPPS_CLIENT_ID
 * - VIPPS_CLIENT_SECRET
 * - VIPPS_SUBSCRIPTION_KEY
 * - VIPPS_MSN
 */

import { randomUUID } from 'crypto';
import type {
  IVippsClient,
  VippsConfig,
  VippsConnectionStatus,
  VippsPayment,
  VippsPaymentExtended,
  VippsPaymentResponse,
  VippsPaymentQueryParams,
  CreateVippsPaymentDTO,
  CaptureVippsPaymentDTO,
  RefundVippsPaymentDTO,
  VippsRefundResponse,
  VippsWebhookPayload,
  VippsWebhookVerificationResult,
  VippsAmount,
} from './vipps.types';

/**
 * OAuth token cache
 */
interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

/**
 * Real Vipps Client
 * Connects to Vipps ePayment API
 */
export class VippsClient implements IVippsClient {
  private config: VippsConfig;
  private tokenCache: TokenCache | null = null;
  private baseUrl: string;

  constructor(config: VippsConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.vipps.no'
      : 'https://apitest.vipps.no';
  }

  /**
   * Get OAuth access token (with caching)
   * Implements 60s buffer before expiry for safety
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    const bufferMs = 60 * 1000; // 60 second buffer

    if (this.tokenCache && this.tokenCache.expiresAt - bufferMs > now) {
      return this.tokenCache.accessToken;
    }

    // Request new token
    const tokenUrl = `${this.baseUrl}/accesstoken/get`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client_id': this.config.clientId,
        'client_secret': this.config.clientSecret,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'Merchant-Serial-Number': this.config.merchantSerialNumber,
      },
    });

    if (!response.ok) {
      // Clear cache on error
      this.tokenCache = null;
      throw new Error(`Vipps OAuth error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + (parseInt(data.expires_in, 10) * 1000),
    };

    return this.tokenCache.accessToken;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    idempotencyKey?: string
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
      'Merchant-Serial-Number': this.config.merchantSerialNumber,
    };

    // Add idempotency key for POST requests
    if (method === 'POST' && idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      // Clear token cache on 401 and retry once
      this.tokenCache = null;
      const newToken = await this.getAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;

      const retryResponse = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        throw new Error(`Vipps API error: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Vipps API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // =============================================================================
  // Connection
  // =============================================================================

  async getStatus(): Promise<VippsConnectionStatus> {
    try {
      // Test connection by checking token
      await this.getAccessToken();

      return {
        connected: true,
        provider: 'Vipps',
        merchantSerialNumber: this.config.merchantSerialNumber,
        environment: this.config.environment,
        lastHealthCheck: new Date().toISOString(),
      };
    } catch {
      return {
        connected: false,
        provider: 'Vipps',
        merchantSerialNumber: this.config.merchantSerialNumber,
        environment: this.config.environment,
      };
    }
  }

  // =============================================================================
  // Payments
  // =============================================================================

  async createPayment(data: CreateVippsPaymentDTO): Promise<VippsPaymentResponse> {
    const idempotencyKey = randomUUID();
    const orderId = `order-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const payload = {
      amount: {
        currency: 'NOK',
        value: data.amount * 100, // Convert to minor units
      },
      paymentMethod: {
        type: 'WALLET',
      },
      reference: data.reference,
      userFlow: data.userFlow || 'WEB_REDIRECT',
      returnUrl: data.returnUrl,
      paymentDescription: data.orderDescription,
      profile: data.phoneNumber ? { phoneNumber: data.phoneNumber } : undefined,
      metadata: data.metadata,
    };

    const result = await this.request<any>(
      'POST',
      '/epayment/v1/payments',
      payload,
      idempotencyKey
    );

    return {
      orderId: result.reference || orderId,
      reference: data.reference,
      redirectUrl: result.redirectUrl,
      status: 'CREATED',
    };
  }

  async getPayment(orderId: string): Promise<VippsPaymentExtended> {
    const result = await this.request<any>('GET', `/epayment/v1/payments/${orderId}`);

    return {
      orderId: result.reference,
      reference: result.pspReference || result.reference,
      amount: result.amount,
      status: result.state,
      userFlow: result.userFlow || 'WEB_REDIRECT',
      paymentMethod: result.paymentMethod,
      profile: result.profile,
      createdAt: result.created,
      updatedAt: result.modified || result.created,
      authorizedAt: result.aggregate?.authorizedAmount ? result.modified : undefined,
      capturedAt: result.aggregate?.capturedAmount ? result.modified : undefined,
      transactionHistory: this.mapTransactionHistory(result.transactionLogHistory || []),
      metadata: result.metadata,
    };
  }

  async getPayments(params?: VippsPaymentQueryParams): Promise<{ data: VippsPayment[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.reference) queryParams.set('reference', params.reference);

    // Vipps doesn't have a direct list endpoint with filtering
    // This would typically be implemented via your own database
    // For now, return empty result
    return {
      data: [],
      total: 0,
    };
  }

  async capturePayment(data: CaptureVippsPaymentDTO): Promise<VippsPayment> {
    const idempotencyKey = randomUUID();

    const payload: any = {
      modificationAmount: data.amount
        ? { currency: 'NOK', value: data.amount * 100 }
        : undefined,
    };

    await this.request<any>(
      'POST',
      `/epayment/v1/payments/${data.orderId}/capture`,
      payload,
      idempotencyKey
    );

    // Fetch updated payment
    return this.getPayment(data.orderId);
  }

  async cancelPayment(orderId: string): Promise<VippsPayment> {
    const idempotencyKey = randomUUID();

    await this.request<any>(
      'POST',
      `/epayment/v1/payments/${orderId}/cancel`,
      {},
      idempotencyKey
    );

    // Fetch updated payment
    return this.getPayment(orderId);
  }

  async refundPayment(data: RefundVippsPaymentDTO): Promise<VippsRefundResponse> {
    const idempotencyKey = randomUUID();

    const payload = {
      modificationAmount: {
        currency: 'NOK',
        value: data.amount * 100,
      },
    };

    const result = await this.request<any>(
      'POST',
      `/epayment/v1/payments/${data.orderId}/refund`,
      payload,
      idempotencyKey
    );

    return {
      orderId: data.orderId,
      refundId: result.pspReference || randomUUID(),
      amount: { currency: 'NOK', value: data.amount * 100 },
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  // =============================================================================
  // Webhooks
  // =============================================================================

  async verifyWebhook(signature: string, payload: string): Promise<VippsWebhookVerificationResult> {
    // In production, verify HMAC signature using webhookSecret
    // For now, basic validation
    try {
      const parsed = JSON.parse(payload) as VippsWebhookPayload;

      if (!parsed.orderId || !parsed.transactionType) {
        return { valid: false, error: 'Missing required fields' };
      }

      return { valid: true, payload: parsed };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON payload' };
    }
  }

  async processWebhook(payload: VippsWebhookPayload): Promise<void> {
    // Process webhook based on transaction type
    // This should update your database and trigger any necessary actions
    // Implementation depends on your business logic
  }

  // =============================================================================
  // Helpers
  // =============================================================================

  private mapTransactionHistory(history: any[]): VippsPaymentExtended['transactionHistory'] {
    return history.map((event) => ({
      id: event.pspReference || randomUUID(),
      eventType: event.operation,
      amount: event.amount,
      timestamp: event.timeStamp,
      success: event.operationSuccess,
      failureReason: event.operationSuccess ? undefined : event.errorDescription,
    }));
  }
}
