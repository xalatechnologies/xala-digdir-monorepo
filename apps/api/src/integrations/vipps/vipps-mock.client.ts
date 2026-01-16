/**
 * Vipps Payment Mock Client
 * Deterministic mock implementation for demo/testing
 *
 * Features:
 * - In-memory storage for payments, agreements, charges
 * - Deterministic responses based on IDs and amounts
 * - Simulates all Vipps ePayment API behaviors
 * - No external API calls
 * - Demo data seeded on initialization
 */

import { randomUUID } from 'crypto';
import type {
  IVippsClient,
  VippsConnectionStatus,
  VippsPayment,
  VippsPaymentExtended,
  VippsPaymentResponse,
  VippsPaymentStatus,
  VippsPaymentQueryParams,
  CreateVippsPaymentDTO,
  CaptureVippsPaymentDTO,
  RefundVippsPaymentDTO,
  VippsRefundResponse,
  VippsWebhookPayload,
  VippsWebhookVerificationResult,
  VippsTransactionEvent,
  VippsAmount,
  VippsAgreement,
  VippsCharge,
  CreateVippsAgreementDTO,
  VippsChargeDTO,
} from './vipps.types';

/**
 * Mock Vipps Client
 * Provides deterministic responses for demo and testing
 */
export class VippsMockClient implements IVippsClient {
  // In-memory storage
  private payments: Map<string, VippsPaymentExtended> = new Map();
  private refunds: Map<string, VippsRefundResponse> = new Map();
  private agreements: Map<string, VippsAgreement> = new Map();
  private charges: Map<string, VippsCharge> = new Map();
  private orderCounter = 1;
  private refundCounter = 1;
  private agreementCounter = 1;
  private chargeCounter = 1;

  constructor() {
    this.seedDemoData();
  }

  /**
   * Seed initial demo data for consistent demo experience
   */
  private seedDemoData(): void {
    // Seed demo payments in various states
    const demoPayments: VippsPaymentExtended[] = [
      {
        orderId: 'VIPPS-DEMO-001',
        reference: 'booking-demo-001',
        amount: { currency: 'NOK', value: 150000 }, // 1500 NOK
        status: 'CAPTURED',
        userFlow: 'WEB_REDIRECT',
        paymentMethod: { type: 'WALLET' },
        profile: {
          sub: 'demo-user-001',
          name: 'Ola Nordmann',
          email: 'ola@example.no',
          phoneNumber: '+4799887766',
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        authorizedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        capturedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        bookingId: 'booking-demo-001',
        transactionHistory: [
          {
            id: 'txn-001',
            eventType: 'CREATED',
            amount: { currency: 'NOK', value: 150000 },
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
          {
            id: 'txn-002',
            eventType: 'AUTHORIZED',
            amount: { currency: 'NOK', value: 150000 },
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
          {
            id: 'txn-003',
            eventType: 'CAPTURED',
            amount: { currency: 'NOK', value: 150000 },
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
        ],
        metadata: { source: 'demo' },
      },
      {
        orderId: 'VIPPS-DEMO-002',
        reference: 'booking-demo-002',
        amount: { currency: 'NOK', value: 250000 }, // 2500 NOK
        status: 'AUTHORIZED',
        userFlow: 'WEB_REDIRECT',
        paymentMethod: { type: 'WALLET' },
        profile: {
          sub: 'demo-user-002',
          name: 'Kari Hansen',
          email: 'kari@example.no',
          phoneNumber: '+4798765432',
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        authorizedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        bookingId: 'booking-demo-002',
        transactionHistory: [
          {
            id: 'txn-004',
            eventType: 'CREATED',
            amount: { currency: 'NOK', value: 250000 },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
          {
            id: 'txn-005',
            eventType: 'AUTHORIZED',
            amount: { currency: 'NOK', value: 250000 },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
        ],
        metadata: { source: 'demo' },
      },
      {
        orderId: 'VIPPS-DEMO-003',
        reference: 'booking-demo-003',
        amount: { currency: 'NOK', value: 75000 }, // 750 NOK
        status: 'INITIATED',
        userFlow: 'WEB_REDIRECT',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min from now
        bookingId: 'booking-demo-003',
        transactionHistory: [
          {
            id: 'txn-006',
            eventType: 'CREATED',
            amount: { currency: 'NOK', value: 75000 },
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            success: true,
          },
          {
            id: 'txn-007',
            eventType: 'INITIATED',
            amount: { currency: 'NOK', value: 75000 },
            timestamp: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
            success: true,
          },
        ],
        metadata: { source: 'demo' },
      },
      {
        orderId: 'VIPPS-DEMO-004',
        reference: 'booking-demo-004',
        amount: { currency: 'NOK', value: 100000 }, // 1000 NOK
        status: 'REFUNDED',
        userFlow: 'WEB_REDIRECT',
        paymentMethod: { type: 'WALLET' },
        profile: {
          sub: 'demo-user-003',
          name: 'Per Olsen',
          email: 'per@example.no',
          phoneNumber: '+4791234567',
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        authorizedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        capturedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        refundedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        bookingId: 'booking-demo-004',
        transactionHistory: [
          {
            id: 'txn-008',
            eventType: 'CREATED',
            amount: { currency: 'NOK', value: 100000 },
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
          {
            id: 'txn-009',
            eventType: 'CAPTURED',
            amount: { currency: 'NOK', value: 100000 },
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
          {
            id: 'txn-010',
            eventType: 'REFUNDED',
            amount: { currency: 'NOK', value: 100000 },
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
          },
        ],
        metadata: { source: 'demo', refundReason: 'Booking cancelled' },
      },
    ];

    demoPayments.forEach((p) => this.payments.set(p.orderId, p));
    this.orderCounter = 5;

    // Seed demo refund
    const demoRefunds: VippsRefundResponse[] = [
      {
        orderId: 'VIPPS-DEMO-004',
        refundId: 'REFUND-DEMO-001',
        amount: { currency: 'NOK', value: 100000 },
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    demoRefunds.forEach((r) => this.refunds.set(r.refundId, r));
    this.refundCounter = 2;

    // Seed demo agreement (recurring)
    const demoAgreements: VippsAgreement[] = [
      {
        agreementId: 'AGR-DEMO-001',
        reference: 'membership-demo-001',
        status: 'ACTIVE',
        productName: 'Idrettslag Medlemskap',
        productDescription: 'Månedlig medlemskap for Oslo Idrettslag',
        price: { currency: 'NOK', value: 50000 }, // 500 NOK/month
        interval: { unit: 'MONTH', count: 1 },
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    demoAgreements.forEach((a) => this.agreements.set(a.agreementId, a));
    this.agreementCounter = 2;
  }

  // =============================================================================
  // Connection
  // =============================================================================

  async getStatus(): Promise<VippsConnectionStatus> {
    return {
      connected: true,
      provider: 'Vipps',
      merchantSerialNumber: 'MOCK-MSN-123456',
      environment: 'test',
      lastHealthCheck: new Date().toISOString(),
    };
  }

  // =============================================================================
  // Payments
  // =============================================================================

  async createPayment(data: CreateVippsPaymentDTO): Promise<VippsPaymentResponse> {
    const orderId = `VIPPS-${this.orderCounter.toString().padStart(6, '0')}`;
    this.orderCounter++;

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    const payment: VippsPaymentExtended = {
      orderId,
      reference: data.reference,
      amount: { currency: 'NOK', value: data.amount * 100 },
      status: 'CREATED',
      userFlow: data.userFlow || 'WEB_REDIRECT',
      createdAt: now,
      updatedAt: now,
      expiresAt,
      bookingId: data.reference,
      transactionHistory: [
        {
          id: `txn-${Date.now()}`,
          eventType: 'CREATED',
          amount: { currency: 'NOK', value: data.amount * 100 },
          timestamp: now,
          success: true,
        },
      ],
      metadata: data.metadata,
    };

    this.payments.set(orderId, payment);

    // Simulate deterministic behavior based on amount
    // Amounts ending in 99 will fail, others succeed
    const willFail = data.amount % 100 === 99;

    if (willFail) {
      // Schedule payment to fail after a short delay
      setTimeout(() => {
        const p = this.payments.get(orderId);
        if (p && p.status === 'CREATED') {
          p.status = 'ABORTED';
          p.updatedAt = new Date().toISOString();
          p.transactionHistory.push({
            id: `txn-${Date.now()}`,
            eventType: 'ABORTED',
            amount: p.amount,
            timestamp: new Date().toISOString(),
            success: false,
            failureReason: 'User aborted payment',
          });
        }
      }, 100);
    } else {
      // Schedule payment to be authorized after a short delay (simulating user completing)
      setTimeout(() => {
        const p = this.payments.get(orderId);
        if (p && p.status === 'CREATED') {
          p.status = 'INITIATED';
          p.updatedAt = new Date().toISOString();
          p.transactionHistory.push({
            id: `txn-${Date.now()}`,
            eventType: 'INITIATED',
            amount: p.amount,
            timestamp: new Date().toISOString(),
            success: true,
          });
        }
      }, 50);
    }

    return {
      orderId,
      reference: data.reference,
      redirectUrl: `https://vipps.no/checkout/mock/${orderId}?returnUrl=${encodeURIComponent(data.returnUrl)}`,
      status: 'CREATED',
    };
  }

  async getPayment(orderId: string): Promise<VippsPaymentExtended> {
    const payment = this.payments.get(orderId);
    if (!payment) {
      throw new Error(`Payment ${orderId} not found`);
    }

    // Check if payment should expire
    if (payment.expiresAt && new Date(payment.expiresAt) < new Date()) {
      if (payment.status === 'CREATED' || payment.status === 'INITIATED') {
        payment.status = 'EXPIRED';
        payment.updatedAt = new Date().toISOString();
        payment.transactionHistory.push({
          id: `txn-${Date.now()}`,
          eventType: 'EXPIRED',
          amount: payment.amount,
          timestamp: new Date().toISOString(),
          success: false,
          failureReason: 'Payment session expired',
        });
      }
    }

    return { ...payment };
  }

  async getPayments(params?: VippsPaymentQueryParams): Promise<{ data: VippsPayment[]; total: number }> {
    let payments = Array.from(this.payments.values());

    // Apply filters
    if (params?.status) {
      payments = payments.filter((p) => p.status === params.status);
    }
    if (params?.reference) {
      payments = payments.filter((p) => p.reference === params.reference);
    }
    if (params?.fromDate) {
      const fromDate = new Date(params.fromDate).getTime();
      payments = payments.filter((p) => new Date(p.createdAt).getTime() >= fromDate);
    }
    if (params?.toDate) {
      const toDate = new Date(params.toDate).getTime();
      payments = payments.filter((p) => new Date(p.createdAt).getTime() <= toDate);
    }

    // Sort by createdAt descending
    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = payments.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    payments = payments.slice(start, start + limit);

    return {
      data: payments.map(this.toBasicPayment),
      total,
    };
  }

  async capturePayment(data: CaptureVippsPaymentDTO): Promise<VippsPayment> {
    const payment = this.payments.get(data.orderId);
    if (!payment) {
      throw new Error(`Payment ${data.orderId} not found`);
    }

    if (payment.status !== 'AUTHORIZED') {
      throw new Error(`Payment ${data.orderId} cannot be captured (status: ${payment.status})`);
    }

    const captureAmount = data.amount
      ? { currency: 'NOK' as const, value: data.amount * 100 }
      : payment.amount;

    payment.status = 'CAPTURED';
    payment.capturedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();
    payment.transactionHistory.push({
      id: `txn-${Date.now()}`,
      eventType: 'CAPTURED',
      amount: captureAmount,
      timestamp: new Date().toISOString(),
      success: true,
    });

    return this.toBasicPayment(payment);
  }

  async cancelPayment(orderId: string): Promise<VippsPayment> {
    const payment = this.payments.get(orderId);
    if (!payment) {
      throw new Error(`Payment ${orderId} not found`);
    }

    if (!['CREATED', 'INITIATED', 'AUTHORIZED'].includes(payment.status)) {
      throw new Error(`Payment ${orderId} cannot be cancelled (status: ${payment.status})`);
    }

    payment.status = 'TERMINATED';
    payment.updatedAt = new Date().toISOString();
    payment.transactionHistory.push({
      id: `txn-${Date.now()}`,
      eventType: 'CANCELLED',
      amount: payment.amount,
      timestamp: new Date().toISOString(),
      success: true,
    });

    return this.toBasicPayment(payment);
  }

  async refundPayment(data: RefundVippsPaymentDTO): Promise<VippsRefundResponse> {
    const payment = this.payments.get(data.orderId);
    if (!payment) {
      throw new Error(`Payment ${data.orderId} not found`);
    }

    if (payment.status !== 'CAPTURED') {
      throw new Error(`Payment ${data.orderId} cannot be refunded (status: ${payment.status})`);
    }

    const refundAmount: VippsAmount = { currency: 'NOK', value: data.amount * 100 };
    const isFullRefund = refundAmount.value >= payment.amount.value;

    const refundId = `REFUND-${this.refundCounter.toString().padStart(6, '0')}`;
    this.refundCounter++;

    const refund: VippsRefundResponse = {
      orderId: data.orderId,
      refundId,
      amount: refundAmount,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    this.refunds.set(refundId, refund);

    // Update payment status
    payment.status = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    payment.refundedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();
    payment.transactionHistory.push({
      id: `txn-${Date.now()}`,
      eventType: 'REFUNDED',
      amount: refundAmount,
      timestamp: new Date().toISOString(),
      success: true,
    });

    return { ...refund };
  }

  // =============================================================================
  // Webhooks
  // =============================================================================

  async verifyWebhook(signature: string, payload: string): Promise<VippsWebhookVerificationResult> {
    // Mock always returns valid for testing
    try {
      const parsed = JSON.parse(payload) as VippsWebhookPayload;

      if (!parsed.orderId || !parsed.transactionType) {
        return { valid: false, error: 'Missing required fields' };
      }

      return { valid: true, payload: parsed };
    } catch {
      return { valid: false, error: 'Invalid JSON payload' };
    }
  }

  async processWebhook(payload: VippsWebhookPayload): Promise<void> {
    const payment = this.payments.get(payload.orderId);
    if (!payment) {
      return; // Ignore unknown payments
    }

    // Update payment based on webhook
    const statusMap: Record<string, VippsPaymentStatus> = {
      'AUTHORIZED': 'AUTHORIZED',
      'CAPTURED': 'CAPTURED',
      'REFUNDED': 'REFUNDED',
      'ABORTED': 'ABORTED',
      'EXPIRED': 'EXPIRED',
      'CANCELLED': 'TERMINATED',
    };

    const newStatus = statusMap[payload.transactionType];
    if (newStatus) {
      payment.status = newStatus;
      payment.updatedAt = payload.timestamp;

      if (newStatus === 'AUTHORIZED') {
        payment.authorizedAt = payload.timestamp;
      } else if (newStatus === 'CAPTURED') {
        payment.capturedAt = payload.timestamp;
      } else if (newStatus === 'REFUNDED') {
        payment.refundedAt = payload.timestamp;
      }

      payment.transactionHistory.push({
        id: payload.transactionId || `txn-${Date.now()}`,
        eventType: payload.transactionType,
        amount: payload.amount,
        timestamp: payload.timestamp,
        success: payload.success,
        failureReason: payload.errorInfo?.errorMessage,
      });
    }
  }

  // =============================================================================
  // Recurring Payments (Optional)
  // =============================================================================

  async createAgreement(data: CreateVippsAgreementDTO): Promise<VippsAgreement> {
    const agreementId = `AGR-${this.agreementCounter.toString().padStart(6, '0')}`;
    this.agreementCounter++;

    const agreement: VippsAgreement = {
      agreementId,
      reference: data.reference,
      status: 'PENDING',
      productName: data.productName,
      productDescription: data.productDescription,
      price: { currency: 'NOK', value: data.price * 100 },
      interval: data.interval,
      campaign: data.campaign
        ? {
            campaignPrice: { currency: 'NOK', value: data.campaign.price * 100 },
            end: data.campaign.endDate,
          }
        : undefined,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.agreements.set(agreementId, agreement);

    // Simulate user accepting agreement
    setTimeout(() => {
      const a = this.agreements.get(agreementId);
      if (a && a.status === 'PENDING') {
        a.status = 'ACTIVE';
      }
    }, 100);

    return { ...agreement };
  }

  async getAgreement(agreementId: string): Promise<VippsAgreement> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) {
      throw new Error(`Agreement ${agreementId} not found`);
    }
    return { ...agreement };
  }

  async stopAgreement(agreementId: string): Promise<VippsAgreement> {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) {
      throw new Error(`Agreement ${agreementId} not found`);
    }

    agreement.status = 'STOPPED';
    agreement.endDate = new Date().toISOString();

    return { ...agreement };
  }

  async createCharge(data: VippsChargeDTO): Promise<VippsCharge> {
    const agreement = this.agreements.get(data.agreementId);
    if (!agreement) {
      throw new Error(`Agreement ${data.agreementId} not found`);
    }

    if (agreement.status !== 'ACTIVE') {
      throw new Error(`Agreement ${data.agreementId} is not active`);
    }

    const chargeId = `CHG-${this.chargeCounter.toString().padStart(6, '0')}`;
    this.chargeCounter++;

    const charge: VippsCharge = {
      chargeId,
      agreementId: data.agreementId,
      amount: { currency: 'NOK', value: data.amount * 100 },
      description: data.description,
      dueDate: data.dueDate,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.charges.set(chargeId, charge);

    // Simulate charge being processed
    setTimeout(() => {
      const c = this.charges.get(chargeId);
      if (c && c.status === 'PENDING') {
        c.status = 'CHARGED';
        c.processedAt = new Date().toISOString();
      }
    }, 200);

    return { ...charge };
  }

  async getCharges(agreementId: string): Promise<{ data: VippsCharge[]; total: number }> {
    const charges = Array.from(this.charges.values()).filter(
      (c) => c.agreementId === agreementId
    );

    return {
      data: charges,
      total: charges.length,
    };
  }

  // =============================================================================
  // Helpers
  // =============================================================================

  private toBasicPayment(payment: VippsPaymentExtended): VippsPayment {
    return {
      orderId: payment.orderId,
      reference: payment.reference,
      amount: payment.amount,
      status: payment.status,
      userFlow: payment.userFlow,
      paymentMethod: payment.paymentMethod,
      profile: payment.profile,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      expiresAt: payment.expiresAt,
      authorizedAt: payment.authorizedAt,
      capturedAt: payment.capturedAt,
      refundedAt: payment.refundedAt,
    };
  }

  /**
   * Simulate user completing payment (for demo purposes)
   * Call this to move a payment from INITIATED to AUTHORIZED
   */
  async simulateUserCompletion(orderId: string): Promise<VippsPayment> {
    const payment = this.payments.get(orderId);
    if (!payment) {
      throw new Error(`Payment ${orderId} not found`);
    }

    if (payment.status !== 'INITIATED' && payment.status !== 'CREATED') {
      throw new Error(`Payment ${orderId} cannot be completed (status: ${payment.status})`);
    }

    payment.status = 'AUTHORIZED';
    payment.authorizedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();
    payment.paymentMethod = { type: 'WALLET' };
    payment.profile = {
      sub: `mock-user-${Date.now()}`,
      name: 'Mock Bruker',
      email: 'mock@example.no',
      phoneNumber: '+4799999999',
    };
    payment.transactionHistory.push({
      id: `txn-${Date.now()}`,
      eventType: 'AUTHORIZED',
      amount: payment.amount,
      timestamp: new Date().toISOString(),
      success: true,
    });

    return this.toBasicPayment(payment);
  }
}
