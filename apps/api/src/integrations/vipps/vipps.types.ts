/**
 * Vipps Payment Integration Types
 * Norwegian mobile payment solution integration
 *
 * Environment Variables Required:
 * - VIPPS_CLIENT_ID
 * - VIPPS_CLIENT_SECRET
 * - VIPPS_SUBSCRIPTION_KEY
 * - VIPPS_MSN (Merchant Serial Number)
 * - VIPPS_ENVIRONMENT (test|production)
 * - VIPPS_CALLBACK_URL
 * - VIPPS_WEBHOOK_SECRET
 *
 * API Documentation: https://developer.vipps.no/docs/APIs
 * Rate limit: Varies by endpoint
 */

// =============================================================================
// Core Types
// =============================================================================

export interface VippsConfig {
  clientId: string;
  clientSecret: string;
  subscriptionKey: string;
  merchantSerialNumber: string;
  environment: 'test' | 'production';
  callbackUrl: string;
  webhookSecret?: string;
  useMock: boolean;
}

export interface VippsConnectionStatus {
  connected: boolean;
  provider: 'Vipps';
  merchantSerialNumber: string;
  environment: 'test' | 'production';
  lastHealthCheck?: string;
}

// =============================================================================
// Payment Types
// =============================================================================

export type VippsPaymentStatus =
  | 'CREATED'
  | 'INITIATED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'AUTHORIZED'
  | 'TERMINATED'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface VippsPayment {
  orderId: string;
  reference: string;
  amount: VippsAmount;
  status: VippsPaymentStatus;
  userFlow: 'WEB_REDIRECT' | 'NATIVE_REDIRECT' | 'PUSH_MESSAGE';
  paymentMethod?: VippsPaymentMethod;
  profile?: VippsUserProfile;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  authorizedAt?: string;
  capturedAt?: string;
  refundedAt?: string;
}

export interface VippsPaymentExtended extends VippsPayment {
  bookingId?: string;
  transactionHistory: VippsTransactionEvent[];
  metadata?: Record<string, string>;
}

export interface VippsAmount {
  currency: 'NOK';
  value: number; // In minor units (1 NOK = 100)
}

export interface VippsPaymentMethod {
  type: 'WALLET' | 'CARD';
  cardBin?: string; // First 6 digits of card
}

export interface VippsUserProfile {
  sub?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface VippsTransactionEvent {
  id: string;
  eventType: VippsEventType;
  amount: VippsAmount;
  timestamp: string;
  success: boolean;
  failureReason?: string;
}

export type VippsEventType =
  | 'CREATED'
  | 'INITIATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'CANCELLED';

// =============================================================================
// Request/Response Types
// =============================================================================

export interface CreateVippsPaymentDTO {
  amount: number; // In NOK (will be converted to minor units)
  reference: string; // Unique reference (e.g., booking ID)
  orderDescription: string;
  userFlow?: 'WEB_REDIRECT' | 'NATIVE_REDIRECT' | 'PUSH_MESSAGE';
  returnUrl: string;
  callbackUrl?: string;
  phoneNumber?: string; // Required for PUSH_MESSAGE
  metadata?: Record<string, string>;
}

export interface VippsPaymentResponse {
  orderId: string;
  reference: string;
  redirectUrl: string;
  status: VippsPaymentStatus;
}

export interface CaptureVippsPaymentDTO {
  orderId: string;
  amount?: number; // Partial capture amount (optional)
  description?: string;
}

export interface RefundVippsPaymentDTO {
  orderId: string;
  amount: number;
  description: string;
}

export interface VippsRefundResponse {
  orderId: string;
  refundId: string;
  amount: VippsAmount;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface VippsPaymentQueryParams {
  status?: VippsPaymentStatus;
  reference?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Webhook Types
// =============================================================================

export interface VippsWebhookPayload {
  orderId: string;
  reference: string;
  pspReference?: string;
  transactionId?: string;
  transactionType: VippsEventType;
  amount: VippsAmount;
  timestamp: string;
  success: boolean;
  errorInfo?: {
    errorCode: string;
    errorMessage: string;
  };
}

export interface VippsWebhookVerificationResult {
  valid: boolean;
  payload?: VippsWebhookPayload;
  error?: string;
}

// =============================================================================
// Agreement Types (Recurring Payments)
// =============================================================================

export type VippsAgreementStatus = 'PENDING' | 'ACTIVE' | 'STOPPED' | 'EXPIRED';

export interface VippsAgreement {
  agreementId: string;
  reference: string;
  status: VippsAgreementStatus;
  productName: string;
  productDescription?: string;
  price: VippsAmount;
  interval: VippsInterval;
  campaign?: VippsCampaign;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface VippsInterval {
  unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  count: number;
}

export interface VippsCampaign {
  campaignPrice: VippsAmount;
  end: string;
}

export interface CreateVippsAgreementDTO {
  reference: string;
  productName: string;
  productDescription?: string;
  price: number; // In NOK
  interval: VippsInterval;
  initialCharge?: number;
  campaign?: {
    price: number;
    endDate: string;
  };
  returnUrl: string;
}

export interface VippsChargeDTO {
  agreementId: string;
  amount: number;
  description: string;
  dueDate: string;
  orderId?: string;
}

export interface VippsCharge {
  chargeId: string;
  agreementId: string;
  amount: VippsAmount;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'DUE' | 'CHARGED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  createdAt: string;
  processedAt?: string;
}

// =============================================================================
// Integration Event Types (for audit trail)
// =============================================================================

export interface VippsIntegrationEvent {
  id: string;
  eventType: VippsEventType;
  entityType: 'payment' | 'agreement' | 'charge' | 'refund';
  entityId: string;
  externalRef?: string;
  status: 'pending' | 'success' | 'failed' | 'retry';
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
  retryCount: number;
  createdAt: string;
  processedAt?: string;
}

// =============================================================================
// Client Interface
// =============================================================================

export interface IVippsClient {
  // Connection
  getStatus(): Promise<VippsConnectionStatus>;

  // Payments (ePayment API)
  createPayment(data: CreateVippsPaymentDTO): Promise<VippsPaymentResponse>;
  getPayment(orderId: string): Promise<VippsPaymentExtended>;
  getPayments(params?: VippsPaymentQueryParams): Promise<{ data: VippsPayment[]; total: number }>;
  capturePayment(data: CaptureVippsPaymentDTO): Promise<VippsPayment>;
  cancelPayment(orderId: string): Promise<VippsPayment>;
  refundPayment(data: RefundVippsPaymentDTO): Promise<VippsRefundResponse>;

  // Webhooks
  verifyWebhook(signature: string, payload: string): Promise<VippsWebhookVerificationResult>;
  processWebhook(payload: VippsWebhookPayload): Promise<void>;

  // Recurring Payments (optional for demo)
  createAgreement?(data: CreateVippsAgreementDTO): Promise<VippsAgreement>;
  getAgreement?(agreementId: string): Promise<VippsAgreement>;
  stopAgreement?(agreementId: string): Promise<VippsAgreement>;
  createCharge?(data: VippsChargeDTO): Promise<VippsCharge>;
  getCharges?(agreementId: string): Promise<{ data: VippsCharge[]; total: number }>;
}
