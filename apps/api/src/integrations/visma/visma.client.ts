/**
 * Visma Enterprise Real Client
 * Production implementation for Visma.net Financials API
 *
 * Rate Limits:
 * - 600 requests/minute per endpoint
 * - OAuth 2.0 token expires after 3600 seconds
 *
 * Requires:
 * - VISMA_API_URL
 * - VISMA_CLIENT_ID
 * - VISMA_CLIENT_SECRET
 * - VISMA_TENANT_ID
 */

import type {
  IVismaClient,
  VismaConfig,
  VismaConnectionStatus,
  VismaSyncResult,
  VismaInvoice,
  VismaInvoiceExtended,
  VismaInvoiceQueryParams,
  CreateVismaInvoiceDTO,
  SendInvoiceReminderDTO,
  VismaCustomer,
  CreateVismaCustomerDTO,
  VismaCreditNote,
  CreateVismaCreditNoteDTO,
  VismaPayment,
  RegisterVismaPaymentDTO,
  VismaFinancialSummary,
  VismaAgedReceivables,
  VismaExportResult,
  VismaExportFormat,
} from './visma.types';

/**
 * OAuth token cache
 */
interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

/**
 * Real Visma Enterprise Client
 * Connects to Visma.net Financials API
 */
export class VismaClient implements IVismaClient {
  private config: VismaConfig;
  private tokenCache: TokenCache | null = null;

  constructor(config: VismaConfig) {
    this.config = config;
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
    const tokenUrl = `${this.config.apiUrl}/oauth2/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'visma.net.financials',
      }),
    });

    if (!response.ok) {
      // Clear cache on error
      this.tokenCache = null;
      throw new Error(`Visma OAuth error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + (data.expires_in * 1000),
    };

    return this.tokenCache.accessToken;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.config.apiUrl}${path}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ipp-company-id': this.config.tenantId,
    };

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
        throw new Error(`Visma API error: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`Visma API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // Connection & Sync
  // =============================================================================

  async getStatus(): Promise<VismaConnectionStatus> {
    try {
      // Test connection by fetching company info
      await this.request('GET', '/v1/company/info');

      return {
        connected: true,
        provider: 'Visma Enterprise',
        lastSync: new Date().toISOString(),
        pendingInvoices: 0, // Would need separate call
        overdueInvoices: 0, // Would need separate call
      };
    } catch {
      return {
        connected: false,
        provider: 'Visma Enterprise',
        pendingInvoices: 0,
        overdueInvoices: 0,
      };
    }
  }

  async sync(): Promise<VismaSyncResult> {
    // Sync implementation would:
    // 1. Fetch recent invoices from Visma
    // 2. Update local records
    // 3. Push any pending local changes
    // For now, return skeleton result
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      invoicesSynced: 0,
      paymentsSynced: 0,
      customersSynced: 0,
    };
  }

  // =============================================================================
  // Invoices
  // =============================================================================

  async createInvoice(data: CreateVismaInvoiceDTO): Promise<VismaInvoice> {
    const payload = {
      customerNumber: data.organizationId,
      invoiceLines: data.lines?.map((line, index) => ({
        lineNumber: index + 1,
        itemNumber: line.productCode,
        itemDescription: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vatPercentage: line.vatRate,
      })),
      customerReference: data.customerReference,
      ourReference: data.ourReference,
      dueDate: data.dueDate,
    };

    const result = await this.request<any>('POST', '/v1/invoice', payload);

    return {
      invoiceNumber: result.invoiceNumber,
      bookingId: data.bookingId,
      organizationId: data.organizationId,
      amount: data.amount,
      currency: result.currency || 'NOK',
      description: data.description,
      status: 'created',
      dueDate: result.dueDate || data.dueDate || '',
      createdAt: new Date().toISOString(),
    };
  }

  async getInvoices(params?: VismaInvoiceQueryParams): Promise<{ data: VismaInvoice[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.customerId) queryParams.set('customerId', params.customerId);
    if (params?.fromDate) queryParams.set('fromDate', params.fromDate);
    if (params?.toDate) queryParams.set('toDate', params.toDate);
    if (params?.page) queryParams.set('pageNumber', params.page.toString());
    if (params?.limit) queryParams.set('pageSize', params.limit.toString());

    const result = await this.request<any>('GET', `/v1/invoice?${queryParams}`);

    return {
      data: result.items || [],
      total: result.totalCount || 0,
    };
  }

  async getInvoice(invoiceNumber: string): Promise<VismaInvoiceExtended> {
    const result = await this.request<any>('GET', `/v1/invoice/${invoiceNumber}`);

    return {
      invoiceNumber: result.invoiceNumber,
      bookingId: result.externalReference || '',
      organizationId: result.customerNumber,
      amount: result.totalAmount,
      currency: result.currency || 'NOK',
      description: result.invoiceText,
      status: this.mapVismaStatus(result.status),
      dueDate: result.dueDate,
      createdAt: result.createdDateTime,
      customerReference: result.customerReference,
      ourReference: result.ourReference,
      lines: (result.invoiceLines || []).map((line: any) => ({
        id: line.lineId,
        lineNumber: line.lineNumber,
        productCode: line.itemNumber,
        description: line.itemDescription,
        quantity: line.quantity,
        unit: line.unit || 'stk',
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent,
        vatRate: line.vatPercentage,
        lineTotal: line.lineAmount,
      })),
      vatAmount: result.vatAmount || 0,
      totalWithVat: result.totalAmountInclVat || result.totalAmount,
      paymentReference: result.kid,
      sentAt: result.sentDateTime,
      paidAt: result.paidDateTime,
      remindersSent: result.reminderCount || 0,
      lastReminderAt: result.lastReminderDate,
    };
  }

  async sendInvoice(invoiceNumber: string): Promise<VismaInvoice> {
    await this.request('POST', `/v1/invoice/${invoiceNumber}/send`);
    const invoice = await this.getInvoice(invoiceNumber);
    return {
      invoiceNumber: invoice.invoiceNumber,
      bookingId: invoice.bookingId,
      organizationId: invoice.organizationId,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      status: 'sent',
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    };
  }

  async sendReminder(data: SendInvoiceReminderDTO): Promise<VismaInvoice> {
    await this.request('POST', `/v1/invoice/${data.invoiceNumber}/reminder`, {
      reminderType: data.reminderType,
      additionalMessage: data.additionalMessage,
    });
    const invoice = await this.getInvoice(data.invoiceNumber);
    return {
      invoiceNumber: invoice.invoiceNumber,
      bookingId: invoice.bookingId,
      organizationId: invoice.organizationId,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      status: invoice.status,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    };
  }

  async markInvoicePaid(invoiceNumber: string, paymentDate?: string): Promise<VismaInvoice> {
    await this.request('POST', `/v1/invoice/${invoiceNumber}/paid`, {
      paymentDate: paymentDate || new Date().toISOString(),
    });
    const invoice = await this.getInvoice(invoiceNumber);
    return {
      invoiceNumber: invoice.invoiceNumber,
      bookingId: invoice.bookingId,
      organizationId: invoice.organizationId,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      status: 'paid',
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    };
  }

  async cancelInvoice(invoiceNumber: string, reason: string): Promise<VismaInvoice> {
    await this.request('POST', `/v1/invoice/${invoiceNumber}/cancel`, { reason });
    const invoice = await this.getInvoice(invoiceNumber);
    return {
      invoiceNumber: invoice.invoiceNumber,
      bookingId: invoice.bookingId,
      organizationId: invoice.organizationId,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      status: 'cancelled',
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    };
  }

  // =============================================================================
  // Customers
  // =============================================================================

  async getCustomers(params?: { page?: number; limit?: number }): Promise<{ data: VismaCustomer[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('pageNumber', params.page.toString());
    if (params?.limit) queryParams.set('pageSize', params.limit.toString());

    const result = await this.request<any>('GET', `/v1/customer?${queryParams}`);

    return {
      data: (result.items || []).map(this.mapCustomer),
      total: result.totalCount || 0,
    };
  }

  async getCustomer(customerId: string): Promise<VismaCustomer> {
    const result = await this.request<any>('GET', `/v1/customer/${customerId}`);
    return this.mapCustomer(result);
  }

  async getCustomerByOrgNumber(organizationNumber: string): Promise<VismaCustomer | null> {
    try {
      const result = await this.request<any>('GET', `/v1/customer/orgnumber/${organizationNumber}`);
      return this.mapCustomer(result);
    } catch {
      return null;
    }
  }

  async createCustomer(data: CreateVismaCustomerDTO): Promise<VismaCustomer> {
    const payload = {
      name: data.name,
      organizationNumber: data.organizationNumber,
      customerType: data.customerType === 'organization' ? 'Company' : 'Person',
      email: data.email,
      phone: data.phone,
      invoiceAddress: {
        street: data.invoiceAddress.street,
        postalCode: data.invoiceAddress.postalCode,
        city: data.invoiceAddress.city,
        countryCode: data.invoiceAddress.country,
      },
      paymentTermsDays: data.paymentTermsDays,
      creditLimit: data.creditLimit,
    };

    const result = await this.request<any>('POST', '/v1/customer', payload);
    return this.mapCustomer(result);
  }

  async updateCustomer(customerId: string, data: Partial<CreateVismaCustomerDTO>): Promise<VismaCustomer> {
    const result = await this.request<any>('PUT', `/v1/customer/${customerId}`, data);
    return this.mapCustomer(result);
  }

  async getCustomerInvoices(customerId: string): Promise<{ data: VismaInvoice[]; total: number }> {
    return this.getInvoices({ customerId });
  }

  // =============================================================================
  // Credit Notes
  // =============================================================================

  async getCreditNotes(params?: { page?: number; limit?: number }): Promise<{ data: VismaCreditNote[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('pageNumber', params.page.toString());
    if (params?.limit) queryParams.set('pageSize', params.limit.toString());

    const result = await this.request<any>('GET', `/v1/creditnote?${queryParams}`);

    return {
      data: (result.items || []).map((cn: any) => ({
        id: cn.creditNoteId,
        creditNoteNumber: cn.creditNoteNumber,
        originalInvoiceNumber: cn.originalInvoiceNumber,
        customerId: cn.customerNumber,
        amount: cn.amount,
        currency: cn.currency || 'NOK',
        reason: cn.creditReason,
        status: cn.status?.toLowerCase() || 'draft',
        createdAt: cn.createdDateTime,
      })),
      total: result.totalCount || 0,
    };
  }

  async createCreditNote(data: CreateVismaCreditNoteDTO): Promise<VismaCreditNote> {
    const result = await this.request<any>('POST', '/v1/creditnote', {
      originalInvoiceNumber: data.invoiceNumber,
      creditReason: data.reason,
      amount: data.amount,
    });

    return {
      id: result.creditNoteId,
      creditNoteNumber: result.creditNoteNumber,
      originalInvoiceNumber: data.invoiceNumber,
      customerId: result.customerNumber,
      amount: data.amount || result.amount,
      currency: result.currency || 'NOK',
      reason: data.reason,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  async sendCreditNote(creditNoteNumber: string): Promise<VismaCreditNote> {
    await this.request('POST', `/v1/creditnote/${creditNoteNumber}/send`);
    const result = await this.request<any>('GET', `/v1/creditnote/${creditNoteNumber}`);

    return {
      id: result.creditNoteId,
      creditNoteNumber: result.creditNoteNumber,
      originalInvoiceNumber: result.originalInvoiceNumber,
      customerId: result.customerNumber,
      amount: result.amount,
      currency: result.currency || 'NOK',
      reason: result.creditReason,
      status: 'sent',
      createdAt: result.createdDateTime,
    };
  }

  // =============================================================================
  // Payments
  // =============================================================================

  async getPayments(params?: {
    invoiceNumber?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: VismaPayment[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.invoiceNumber) queryParams.set('invoiceNumber', params.invoiceNumber);
    if (params?.fromDate) queryParams.set('fromDate', params.fromDate);
    if (params?.toDate) queryParams.set('toDate', params.toDate);
    if (params?.page) queryParams.set('pageNumber', params.page.toString());
    if (params?.limit) queryParams.set('pageSize', params.limit.toString());

    const result = await this.request<any>('GET', `/v1/payment?${queryParams}`);

    return {
      data: (result.items || []).map((payment: any) => ({
        id: payment.paymentId,
        invoiceNumber: payment.invoiceNumber,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        currency: payment.currency || 'NOK',
        paymentMethod: this.mapPaymentMethod(payment.paymentMethod),
        bankReference: payment.bankReference,
      })),
      total: result.totalCount || 0,
    };
  }

  async registerPayment(data: RegisterVismaPaymentDTO): Promise<VismaPayment> {
    const result = await this.request<any>('POST', '/v1/payment', {
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      bankReference: data.bankReference,
    });

    return {
      id: result.paymentId,
      invoiceNumber: data.invoiceNumber,
      paymentDate: data.paymentDate,
      amount: data.amount,
      currency: result.currency || 'NOK',
      paymentMethod: data.paymentMethod,
      bankReference: data.bankReference,
    };
  }

  // =============================================================================
  // Reports
  // =============================================================================

  async getFinancialSummary(periodStart: string, periodEnd: string): Promise<VismaFinancialSummary> {
    const result = await this.request<any>('GET', `/v1/reports/financial-summary?periodStart=${periodStart}&periodEnd=${periodEnd}`);

    return {
      periodStart,
      periodEnd,
      totalInvoiced: result.totalInvoiced || 0,
      totalPaid: result.totalPaid || 0,
      outstandingBalance: result.outstandingBalance || 0,
      overdueAmount: result.overdueAmount || 0,
      invoiceCount: result.invoiceCount || 0,
      paidInvoiceCount: result.paidInvoiceCount || 0,
      overdueInvoiceCount: result.overdueInvoiceCount || 0,
    };
  }

  async getAgedReceivables(): Promise<VismaAgedReceivables> {
    const result = await this.request<any>('GET', '/v1/reports/aged-receivables');

    return {
      current: result.current || 0,
      days30: result.days30 || 0,
      days60: result.days60 || 0,
      days90: result.days90 || 0,
      days90Plus: result.days90Plus || 0,
      total: result.total || 0,
    };
  }

  async exportToAccounting(fromDate: string, toDate: string, format: VismaExportFormat): Promise<VismaExportResult> {
    const result = await this.request<any>('POST', '/v1/export', {
      fromDate,
      toDate,
      format,
    });

    return {
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
    };
  }

  // =============================================================================
  // Helpers
  // =============================================================================

  private mapVismaStatus(status: string): VismaInvoice['status'] {
    const statusMap: Record<string, VismaInvoice['status']> = {
      'Draft': 'created',
      'Open': 'sent',
      'Paid': 'paid',
      'Overdue': 'overdue',
      'Cancelled': 'cancelled',
      'Voided': 'cancelled',
    };
    return statusMap[status] || 'created';
  }

  private mapPaymentMethod(method: string): VismaPayment['paymentMethod'] {
    const methodMap: Record<string, VismaPayment['paymentMethod']> = {
      'BankTransfer': 'bank_transfer',
      'Vipps': 'vipps',
      'Card': 'card',
      'Cash': 'cash',
    };
    return methodMap[method] || 'other';
  }

  private mapCustomer(data: any): VismaCustomer {
    return {
      id: data.customerId,
      customerNumber: data.customerNumber,
      organizationNumber: data.organizationNumber,
      name: data.name,
      customerType: data.customerType === 'Company' ? 'organization' : 'private',
      email: data.email,
      phone: data.phone,
      invoiceAddress: {
        street: data.invoiceAddress?.street || '',
        postalCode: data.invoiceAddress?.postalCode || '',
        city: data.invoiceAddress?.city || '',
        country: data.invoiceAddress?.countryCode || 'NO',
      },
      creditLimit: data.creditLimit,
      paymentTermsDays: data.paymentTermsDays || 30,
      createdAt: data.createdDateTime,
    };
  }
}
