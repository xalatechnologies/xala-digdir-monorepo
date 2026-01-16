/**
 * Vipps Checkout Service
 * 
 * Implements Vipps Checkout API for payment processing:
 * - Create checkout sessions
 * - Get payment status
 * - Capture authorized payments
 * - Process refunds
 * 
 * @see https://developer.vippsmobilepay.com/docs/APIs/checkout-api/
 */

import { randomUUID } from 'crypto';
import { getVippsConfig, getVippsEndpoints, VIPPS_PAYMENT_STATUS, type VippsPaymentStatus } from '../../config/vipps.config';
import { getVippsClient } from './vipps.client';
import { AppError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';

// =============================================================================
// Types
// =============================================================================

export interface CheckoutSessionRequest {
  /** Booking ID to associate with payment */
  bookingId: string;
  /** Amount in smallest unit (øre for NOK) */
  amount: number;
  /** Currency code (default: NOK) */
  currency?: string;
  /** Payment description */
  description: string;
  /** Return URL after payment */
  returnUrl: string;
  /** Callback URL for webhooks */
  callbackUrl?: string;
  /** Customer info (optional) */
  customer?: {
    phoneNumber?: string;
    email?: string;
  };
  /** Tenant ID for audit logging */
  tenantId?: string;
  /** User ID for audit logging */
  userId?: string;
}

export interface CheckoutSessionResponse {
  /** Unique order reference */
  reference: string;
  /** URL to redirect user to Vipps checkout */
  redirectUrl: string;
  /** Session token for frontend */
  token?: string;
  /** Polling URL for status checks */
  pollingUrl?: string;
}

export interface PaymentStatusResponse {
  /** Order reference */
  reference: string;
  /** Payment status */
  status: VippsPaymentStatus;
  /** Amount in smallest unit */
  amount: number;
  /** Currency */
  currency: string;
  /** Booking ID if associated */
  bookingId?: string;
  /** Timestamp of last status change */
  modifiedAt: string;
  /** Captured amount (if captured) */
  capturedAmount?: number;
  /** Refunded amount (if refunded) */
  refundedAmount?: number;
  /** Transaction history */
  transactionHistory?: Array<{
    type: string;
    amount: number;
    timestamp: string;
  }>;
}

export interface CaptureRequest {
  /** Order reference */
  reference: string;
  /** Amount to capture (default: full amount) */
  amount?: number;
  /** Idempotency key */
  idempotencyKey?: string;
}

export interface RefundRequest {
  /** Order reference */
  reference: string;
  /** Amount to refund (default: full amount) */
  amount?: number;
  /** Reason for refund */
  reason?: string;
  /** Idempotency key */
  idempotencyKey?: string;
}

// =============================================================================
// Vipps API Response Types
// =============================================================================

interface VippsCheckoutSessionResponse {
  token: string;
  checkoutFrontendUrl: string;
  pollingUrl: string;
}

interface VippsPaymentDetailsResponse {
  reference: string;
  state: string;
  amount: {
    value: number;
    currency: string;
  };
  aggregate: {
    authorizedAmount: { value: number; currency: string };
    capturedAmount: { value: number; currency: string };
    refundedAmount: { value: number; currency: string };
    cancelledAmount: { value: number; currency: string };
  };
  pspReference?: string;
  paymentMethod?: {
    type: string;
  };
  profile?: {
    sub: string;
    email?: string;
    phoneNumber?: string;
  };
  transactionLogHistory?: Array<{
    operation: string;
    amount: { value: number; currency: string };
    operationSuccess: boolean;
    timeStamp: string;
  }>;
}

// =============================================================================
// Vipps Checkout Service
// =============================================================================

export class VippsCheckoutService {
  private config = getVippsConfig();
  private endpoints = getVippsEndpoints(this.config);
  private client = getVippsClient();

  /**
   * Create a new checkout session
   */
  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const reference = `digilist-${request.bookingId}-${Date.now()}`;
    
    // Build Vipps checkout request
    const vippsRequest = {
      merchantInfo: {
        callbackUrl: request.callbackUrl || `${this.config.paymentCallbackUrl}/api/webhooks/vipps`,
        returnUrl: request.returnUrl,
        callbackAuthorizationToken: this.generateCallbackToken(),
      },
      transaction: {
        amount: {
          value: request.amount,
          currency: request.currency || 'NOK',
        },
        paymentDescription: request.description,
        reference,
      },
      prefillCustomer: request.customer ? {
        phoneNumber: request.customer.phoneNumber,
        email: request.customer.email,
      } : undefined,
      configuration: {
        customerInteraction: 'CUSTOMER_PRESENT',
        elements: 'PaymentAndContactInfo',
        countries: { supported: ['NO'] },
      },
    };

    try {
      const response = await this.client.post<VippsCheckoutSessionResponse>(
        this.endpoints.checkoutSession,
        vippsRequest,
        { idempotencyKey: reference }
      );

      // Audit log
      this.logPaymentEvent('checkout_session_created', {
        reference,
        bookingId: request.bookingId,
        amount: request.amount,
        currency: request.currency || 'NOK',
        tenantId: request.tenantId,
        userId: request.userId,
      });

      return {
        reference,
        redirectUrl: response.checkoutFrontendUrl,
        token: response.token,
        pollingUrl: response.pollingUrl,
      };
    } catch (error) {
      this.logPaymentEvent('checkout_session_failed', {
        reference,
        bookingId: request.bookingId,
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: request.tenantId,
        userId: request.userId,
      });
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    try {
      const response = await this.client.get<VippsPaymentDetailsResponse>(
        this.endpoints.checkoutStatus(reference)
      );

      return this.mapPaymentStatus(reference, response);
    } catch (error) {
      // Check if it's a 404 - payment not found
      if (error instanceof AppError && error.status === 404) {
        throw new AppError(
          'Payment not found',
          404,
          `No payment found with reference: ${reference}`,
          '/errors/payment-not-found'
        );
      }
      throw error;
    }
  }

  /**
   * Capture an authorized payment
   */
  async capturePayment(request: CaptureRequest): Promise<PaymentStatusResponse> {
    const idempotencyKey = request.idempotencyKey || `capture-${request.reference}-${Date.now()}`;

    const captureRequest = {
      modificationAmount: request.amount ? {
        value: request.amount,
        currency: 'NOK',
      } : undefined,
    };

    try {
      await this.client.post(
        this.endpoints.paymentCapture(request.reference),
        captureRequest,
        { idempotencyKey }
      );

      this.logPaymentEvent('payment_captured', {
        reference: request.reference,
        amount: request.amount,
      });

      // Return updated status
      return this.getPaymentStatus(request.reference);
    } catch (error) {
      this.logPaymentEvent('payment_capture_failed', {
        reference: request.reference,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Refund a payment (full or partial)
   */
  async refundPayment(request: RefundRequest): Promise<PaymentStatusResponse> {
    const idempotencyKey = request.idempotencyKey || `refund-${request.reference}-${Date.now()}`;

    const refundRequest = {
      modificationAmount: request.amount ? {
        value: request.amount,
        currency: 'NOK',
      } : undefined,
      description: request.reason || 'Refund requested',
    };

    try {
      await this.client.post(
        this.endpoints.paymentRefund(request.reference),
        refundRequest,
        { idempotencyKey }
      );

      this.logPaymentEvent('payment_refunded', {
        reference: request.reference,
        amount: request.amount,
        reason: request.reason,
      });

      // Return updated status
      return this.getPaymentStatus(request.reference);
    } catch (error) {
      this.logPaymentEvent('payment_refund_failed', {
        reference: request.reference,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Cancel a payment (before capture)
   */
  async cancelPayment(reference: string): Promise<PaymentStatusResponse> {
    try {
      await this.client.delete(
        this.endpoints.paymentStatus(reference)
      );

      this.logPaymentEvent('payment_cancelled', { reference });

      return this.getPaymentStatus(reference);
    } catch (error) {
      this.logPaymentEvent('payment_cancel_failed', {
        reference,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Map Vipps response to our status format
   */
  private mapPaymentStatus(reference: string, response: VippsPaymentDetailsResponse): PaymentStatusResponse {
    // Extract booking ID from reference (format: digilist-{bookingId}-{timestamp})
    const bookingIdMatch = reference.match(/^digilist-(.+)-\d+$/);
    const bookingId = bookingIdMatch ? bookingIdMatch[1] : undefined;

    // Map Vipps state to our status
    const status = this.mapVippsState(response.state);

    return {
      reference,
      status,
      amount: response.amount.value,
      currency: response.amount.currency,
      bookingId,
      modifiedAt: new Date().toISOString(),
      capturedAmount: response.aggregate?.capturedAmount?.value,
      refundedAmount: response.aggregate?.refundedAmount?.value,
      transactionHistory: response.transactionLogHistory?.map(t => ({
        type: t.operation,
        amount: t.amount.value,
        timestamp: t.timeStamp,
      })),
    };
  }

  /**
   * Map Vipps state to our payment status
   */
  private mapVippsState(state: string): VippsPaymentStatus {
    const stateMap: Record<string, VippsPaymentStatus> = {
      'CREATED': VIPPS_PAYMENT_STATUS.CREATED,
      'AUTHORIZED': VIPPS_PAYMENT_STATUS.AUTHORIZED,
      'CAPTURED': VIPPS_PAYMENT_STATUS.CAPTURED,
      'CANCELLED': VIPPS_PAYMENT_STATUS.CANCELLED,
      'REFUNDED': VIPPS_PAYMENT_STATUS.REFUNDED,
      'FAILED': VIPPS_PAYMENT_STATUS.FAILED,
      'EXPIRED': VIPPS_PAYMENT_STATUS.EXPIRED,
      'ABORTED': VIPPS_PAYMENT_STATUS.CANCELLED,
      'TERMINATED': VIPPS_PAYMENT_STATUS.CANCELLED,
    };

    return stateMap[state] || VIPPS_PAYMENT_STATUS.FAILED;
  }

  /**
   * Generate callback authorization token
   */
  private generateCallbackToken(): string {
    return `cb-${randomUUID()}`;
  }

  /**
   * Log payment event for audit
   */
  private logPaymentEvent(action: string, metadata: Record<string, unknown>): void {
    try {
      getAuditService().log({
        tenantId: (metadata.tenantId as string) || 'system',
        userId: (metadata.userId as string) || 'vipps-service',
        action,
        resource: 'payment',
        resourceId: (metadata.reference as string) || 'unknown',
        metadata,
      });
    } catch {
      // Silently fail if audit service unavailable
    }
  }
}

// =============================================================================
// Singleton
// =============================================================================

let serviceInstance: VippsCheckoutService | null = null;

export function getVippsCheckoutService(): VippsCheckoutService {
  if (!serviceInstance) {
    serviceInstance = new VippsCheckoutService();
  }
  return serviceInstance;
}

export function clearVippsCheckoutService(): void {
  serviceInstance = null;
}
