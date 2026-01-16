/**
 * Visma Enterprise Mock Client
 * Deterministic mock implementation for demo/testing
 *
 * Features:
 * - In-memory storage for invoices, customers, payments
 * - Deterministic responses based on IDs
 * - Simulates all Visma.net API behaviors
 * - No external API calls
 */

import type {
  IVismaClient,
  VismaConnectionStatus,
  VismaSyncResult,
  VismaInvoice,
  VismaInvoiceExtended,
  VismaInvoiceQueryParams,
  VismaInvoiceStatus,
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
  VismaInvoiceLine,
} from './visma.types';

/**
 * Mock Visma Enterprise Client
 * Provides deterministic responses for demo and testing
 */
export class VismaMockClient implements IVismaClient {
  // In-memory storage
  private invoices: Map<string, VismaInvoiceExtended> = new Map();
  private customers: Map<string, VismaCustomer> = new Map();
  private creditNotes: Map<string, VismaCreditNote> = new Map();
  private payments: Map<string, VismaPayment> = new Map();
  private invoiceCounter = 1;
  private customerCounter = 1000;
  private creditNoteCounter = 1;
  private paymentCounter = 1;

  constructor() {
    this.seedDemoData();
  }

  /**
   * Seed initial demo data for consistent demo experience
   */
  private seedDemoData(): void {
    // Seed demo customers
    const demoCustomers: VismaCustomer[] = [
      {
        id: 'cust-001',
        customerNumber: 'K1001',
        organizationNumber: '912345678',
        name: 'Oslo Idrettslag',
        customerType: 'organization',
        email: 'post@osloil.no',
        phone: '+47 22 12 34 56',
        invoiceAddress: {
          street: 'Idrettsveien 1',
          postalCode: '0150',
          city: 'Oslo',
          country: 'NO',
        },
        creditLimit: 50000,
        paymentTermsDays: 30,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cust-002',
        customerNumber: 'K1002',
        organizationNumber: '987654321',
        name: 'Bergen Fotballklubb',
        customerType: 'organization',
        email: 'post@bergenfk.no',
        phone: '+47 55 12 34 56',
        invoiceAddress: {
          street: 'Fotballveien 5',
          postalCode: '5020',
          city: 'Bergen',
          country: 'NO',
        },
        paymentTermsDays: 14,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cust-003',
        customerNumber: 'K1003',
        name: 'Ola Nordmann',
        customerType: 'private',
        email: 'ola@example.no',
        phone: '+47 99 88 77 66',
        invoiceAddress: {
          street: 'Storgata 10',
          postalCode: '3000',
          city: 'Drammen',
          country: 'NO',
        },
        paymentTermsDays: 14,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    demoCustomers.forEach((c) => this.customers.set(c.id, c));

    // Seed demo invoices
    const demoInvoices: VismaInvoiceExtended[] = [
      {
        invoiceNumber: 'INV-000001',
        bookingId: 'booking-001',
        organizationId: 'cust-001',
        amount: 5000,
        currency: 'NOK',
        description: 'Leie av møterom - Kulturhuset',
        status: 'paid',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        customerReference: 'REF-OIL-2025',
        ourReference: 'Saksbehandler A',
        lines: [
          {
            id: 'line-1',
            lineNumber: 1,
            productCode: 'ROOM-MTG',
            description: 'Møterom A - 4 timer',
            quantity: 4,
            unit: 'timer',
            unitPrice: 1000,
            discountPercent: 0,
            vatRate: 25,
            lineTotal: 4000,
          },
          {
            id: 'line-2',
            lineNumber: 2,
            productCode: 'SVC-CATERING',
            description: 'Kaffe og te pakke',
            quantity: 1,
            unit: 'stk',
            unitPrice: 1000,
            vatRate: 25,
            lineTotal: 1000,
          },
        ],
        vatAmount: 1250,
        totalWithVat: 6250,
        paymentReference: '12345678901',
        sentAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        remindersSent: 0,
      },
      {
        invoiceNumber: 'INV-000002',
        bookingId: 'booking-002',
        organizationId: 'cust-002',
        amount: 7500,
        currency: 'NOK',
        description: 'Leie av gymsal - Idrettshall',
        status: 'sent',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lines: [
          {
            id: 'line-3',
            lineNumber: 1,
            productCode: 'ROOM-GYM',
            description: 'Gymsal - heldag',
            quantity: 1,
            unit: 'dag',
            unitPrice: 7500,
            vatRate: 25,
            lineTotal: 7500,
          },
        ],
        vatAmount: 1875,
        totalWithVat: 9375,
        paymentReference: '12345678902',
        sentAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        remindersSent: 0,
      },
      {
        invoiceNumber: 'INV-000003',
        bookingId: 'booking-003',
        organizationId: 'cust-001',
        amount: 3500,
        currency: 'NOK',
        description: 'Leie av møterom A',
        status: 'overdue',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        lines: [
          {
            id: 'line-4',
            lineNumber: 1,
            productCode: 'ROOM-MTG',
            description: 'Møterom A - 3,5 timer',
            quantity: 3.5,
            unit: 'timer',
            unitPrice: 1000,
            vatRate: 25,
            lineTotal: 3500,
          },
        ],
        vatAmount: 875,
        totalWithVat: 4375,
        paymentReference: '12345678903',
        sentAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
        remindersSent: 2,
        lastReminderAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    demoInvoices.forEach((inv) => this.invoices.set(inv.invoiceNumber, inv));
    this.invoiceCounter = 4;

    // Seed demo payments
    const demoPayments: VismaPayment[] = [
      {
        id: 'pay-001',
        invoiceNumber: 'INV-000001',
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 6250,
        currency: 'NOK',
        paymentMethod: 'bank_transfer',
        bankReference: 'REF123456',
      },
    ];

    demoPayments.forEach((p) => this.payments.set(p.id, p));
    this.paymentCounter = 2;

    // Seed demo credit notes
    const demoCreditNotes: VismaCreditNote[] = [
      {
        id: 'cn-001',
        creditNoteNumber: 'CN-000001',
        originalInvoiceNumber: 'INV-000001',
        customerId: 'cust-001',
        amount: 1000,
        currency: 'NOK',
        reason: 'Rabatt for langvarig kunde',
        status: 'sent',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    demoCreditNotes.forEach((cn) => this.creditNotes.set(cn.creditNoteNumber, cn));
    this.creditNoteCounter = 2;
  }

  // =============================================================================
  // Connection & Sync
  // =============================================================================

  async getStatus(): Promise<VismaConnectionStatus> {
    const pendingInvoices = Array.from(this.invoices.values()).filter(
      (inv) => inv.status === 'created' || inv.status === 'sent'
    ).length;
    const overdueInvoices = Array.from(this.invoices.values()).filter(
      (inv) => inv.status === 'overdue'
    ).length;

    return {
      connected: true,
      provider: 'Visma Enterprise',
      version: '1.0.0-mock',
      lastSync: new Date().toISOString(),
      pendingInvoices,
      overdueInvoices,
    };
  }

  async sync(): Promise<VismaSyncResult> {
    // Simulate sync delay
    await this.delay(100);

    return {
      success: true,
      syncedAt: new Date().toISOString(),
      invoicesSynced: this.invoices.size,
      paymentsSynced: this.payments.size,
      customersSynced: this.customers.size,
    };
  }

  // =============================================================================
  // Invoices
  // =============================================================================

  async createInvoice(data: CreateVismaInvoiceDTO): Promise<VismaInvoice> {
    const invoiceNumber = `INV-${this.invoiceCounter.toString().padStart(6, '0')}`;
    this.invoiceCounter++;

    const lines: VismaInvoiceLine[] = data.lines?.map((line, index) => ({
      id: `line-${Date.now()}-${index}`,
      lineNumber: index + 1,
      productCode: line.productCode,
      description: line.description,
      quantity: line.quantity,
      unit: line.unit,
      unitPrice: line.unitPrice,
      discountPercent: line.discountPercent,
      vatRate: line.vatRate,
      lineTotal: line.quantity * line.unitPrice * (1 - (line.discountPercent || 0) / 100),
    })) || [{
      id: `line-${Date.now()}`,
      lineNumber: 1,
      productCode: 'DEFAULT',
      description: data.description || 'Leie',
      quantity: 1,
      unit: 'stk',
      unitPrice: data.amount,
      vatRate: 25,
      lineTotal: data.amount,
    }];

    const vatAmount = lines.reduce((sum, line) => sum + (line.lineTotal * line.vatRate / 100), 0);
    const totalWithVat = data.amount + vatAmount;

    const invoice: VismaInvoiceExtended = {
      invoiceNumber,
      bookingId: data.bookingId,
      organizationId: data.organizationId,
      amount: data.amount,
      currency: 'NOK',
      description: data.description,
      status: 'created',
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      customerReference: data.customerReference,
      ourReference: data.ourReference,
      lines,
      vatAmount,
      totalWithVat,
      paymentReference: this.generateKID(),
      remindersSent: 0,
    };

    this.invoices.set(invoiceNumber, invoice);

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

  async getInvoices(params?: VismaInvoiceQueryParams): Promise<{ data: VismaInvoice[]; total: number }> {
    let invoices = Array.from(this.invoices.values());

    // Apply filters
    if (params?.status) {
      invoices = invoices.filter((inv) => inv.status === params.status);
    }
    if (params?.customerId) {
      invoices = invoices.filter((inv) => inv.organizationId === params.customerId);
    }
    if (params?.fromDate) {
      const fromDate = new Date(params.fromDate).getTime();
      invoices = invoices.filter((inv) => new Date(inv.createdAt).getTime() >= fromDate);
    }
    if (params?.toDate) {
      const toDate = new Date(params.toDate).getTime();
      invoices = invoices.filter((inv) => new Date(inv.createdAt).getTime() <= toDate);
    }
    if (params?.minAmount !== undefined) {
      invoices = invoices.filter((inv) => inv.amount >= params.minAmount!);
    }
    if (params?.maxAmount !== undefined) {
      invoices = invoices.filter((inv) => inv.amount <= params.maxAmount!);
    }

    // Pagination
    const total = invoices.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    invoices = invoices.slice(start, start + limit);

    return {
      data: invoices.map(this.toBasicInvoice),
      total,
    };
  }

  async getInvoice(invoiceNumber: string): Promise<VismaInvoiceExtended> {
    const invoice = this.invoices.get(invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceNumber} not found`);
    }
    return { ...invoice };
  }

  async sendInvoice(invoiceNumber: string): Promise<VismaInvoice> {
    const invoice = this.invoices.get(invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceNumber} not found`);
    }

    invoice.status = 'sent';
    invoice.sentAt = new Date().toISOString();

    return this.toBasicInvoice(invoice);
  }

  async sendReminder(data: SendInvoiceReminderDTO): Promise<VismaInvoice> {
    const invoice = this.invoices.get(data.invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice ${data.invoiceNumber} not found`);
    }

    invoice.remindersSent = (invoice.remindersSent || 0) + 1;
    invoice.lastReminderAt = new Date().toISOString();

    return this.toBasicInvoice(invoice);
  }

  async markInvoicePaid(invoiceNumber: string, paymentDate?: string): Promise<VismaInvoice> {
    const invoice = this.invoices.get(invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceNumber} not found`);
    }

    invoice.status = 'paid';
    invoice.paidAt = paymentDate || new Date().toISOString();

    return this.toBasicInvoice(invoice);
  }

  async cancelInvoice(invoiceNumber: string, reason: string): Promise<VismaInvoice> {
    const invoice = this.invoices.get(invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceNumber} not found`);
    }

    invoice.status = 'cancelled';

    return this.toBasicInvoice(invoice);
  }

  // =============================================================================
  // Customers
  // =============================================================================

  async getCustomers(params?: { page?: number; limit?: number }): Promise<{ data: VismaCustomer[]; total: number }> {
    let customers = Array.from(this.customers.values());

    const total = customers.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    customers = customers.slice(start, start + limit);

    return { data: customers, total };
  }

  async getCustomer(customerId: string): Promise<VismaCustomer> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }
    return { ...customer };
  }

  async getCustomerByOrgNumber(organizationNumber: string): Promise<VismaCustomer | null> {
    const customer = Array.from(this.customers.values()).find(
      (c) => c.organizationNumber === organizationNumber
    );
    return customer ? { ...customer } : null;
  }

  async createCustomer(data: CreateVismaCustomerDTO): Promise<VismaCustomer> {
    this.customerCounter++;
    const customerId = `cust-${this.customerCounter.toString().padStart(3, '0')}`;
    const customerNumber = `K${this.customerCounter}`;

    const customer: VismaCustomer = {
      id: customerId,
      customerNumber,
      organizationNumber: data.organizationNumber,
      name: data.name,
      customerType: data.customerType,
      email: data.email,
      phone: data.phone,
      invoiceAddress: data.invoiceAddress,
      creditLimit: data.creditLimit,
      paymentTermsDays: data.paymentTermsDays || 30,
      createdAt: new Date().toISOString(),
    };

    this.customers.set(customerId, customer);
    return { ...customer };
  }

  async updateCustomer(customerId: string, data: Partial<CreateVismaCustomerDTO>): Promise<VismaCustomer> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const updated: VismaCustomer = {
      ...customer,
      ...data,
      invoiceAddress: data.invoiceAddress || customer.invoiceAddress,
    };

    this.customers.set(customerId, updated);
    return { ...updated };
  }

  async getCustomerInvoices(customerId: string): Promise<{ data: VismaInvoice[]; total: number }> {
    return this.getInvoices({ customerId });
  }

  // =============================================================================
  // Credit Notes
  // =============================================================================

  async getCreditNotes(params?: { page?: number; limit?: number }): Promise<{ data: VismaCreditNote[]; total: number }> {
    let creditNotes = Array.from(this.creditNotes.values());

    const total = creditNotes.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    creditNotes = creditNotes.slice(start, start + limit);

    return { data: creditNotes, total };
  }

  async createCreditNote(data: CreateVismaCreditNoteDTO): Promise<VismaCreditNote> {
    const invoice = this.invoices.get(data.invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice ${data.invoiceNumber} not found`);
    }

    const creditNoteNumber = `CN-${this.creditNoteCounter.toString().padStart(6, '0')}`;
    this.creditNoteCounter++;

    const creditNote: VismaCreditNote = {
      id: `cn-${Date.now()}`,
      creditNoteNumber,
      originalInvoiceNumber: data.invoiceNumber,
      customerId: invoice.organizationId,
      amount: data.amount || invoice.amount,
      currency: invoice.currency,
      reason: data.reason,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    this.creditNotes.set(creditNoteNumber, creditNote);
    return { ...creditNote };
  }

  async sendCreditNote(creditNoteNumber: string): Promise<VismaCreditNote> {
    const creditNote = this.creditNotes.get(creditNoteNumber);
    if (!creditNote) {
      throw new Error(`Credit note ${creditNoteNumber} not found`);
    }

    creditNote.status = 'sent';
    return { ...creditNote };
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
    let payments = Array.from(this.payments.values());

    if (params?.invoiceNumber) {
      payments = payments.filter((p) => p.invoiceNumber === params.invoiceNumber);
    }
    if (params?.fromDate) {
      const fromDate = new Date(params.fromDate).getTime();
      payments = payments.filter((p) => new Date(p.paymentDate).getTime() >= fromDate);
    }
    if (params?.toDate) {
      const toDate = new Date(params.toDate).getTime();
      payments = payments.filter((p) => new Date(p.paymentDate).getTime() <= toDate);
    }

    const total = payments.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    payments = payments.slice(start, start + limit);

    return { data: payments, total };
  }

  async registerPayment(data: RegisterVismaPaymentDTO): Promise<VismaPayment> {
    const paymentId = `pay-${this.paymentCounter.toString().padStart(3, '0')}`;
    this.paymentCounter++;

    const payment: VismaPayment = {
      id: paymentId,
      invoiceNumber: data.invoiceNumber,
      paymentDate: data.paymentDate,
      amount: data.amount,
      currency: 'NOK',
      paymentMethod: data.paymentMethod,
      bankReference: data.bankReference,
    };

    this.payments.set(paymentId, payment);

    // Update invoice status if full payment
    const invoice = this.invoices.get(data.invoiceNumber);
    if (invoice && data.amount >= invoice.totalWithVat) {
      invoice.status = 'paid';
      invoice.paidAt = data.paymentDate;
    }

    return { ...payment };
  }

  // =============================================================================
  // Reports
  // =============================================================================

  async getFinancialSummary(periodStart: string, periodEnd: string): Promise<VismaFinancialSummary> {
    const startTime = new Date(periodStart).getTime();
    const endTime = new Date(periodEnd).getTime();

    const invoicesInPeriod = Array.from(this.invoices.values()).filter((inv) => {
      const invTime = new Date(inv.createdAt).getTime();
      return invTime >= startTime && invTime <= endTime;
    });

    const totalInvoiced = invoicesInPeriod.reduce((sum, inv) => sum + inv.totalWithVat, 0);
    const paidInvoices = invoicesInPeriod.filter((inv) => inv.status === 'paid');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.totalWithVat, 0);
    const overdueInvoices = invoicesInPeriod.filter((inv) => inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.totalWithVat, 0);

    return {
      periodStart,
      periodEnd,
      totalInvoiced,
      totalPaid,
      outstandingBalance: totalInvoiced - totalPaid,
      overdueAmount,
      invoiceCount: invoicesInPeriod.length,
      paidInvoiceCount: paidInvoices.length,
      overdueInvoiceCount: overdueInvoices.length,
    };
  }

  async getAgedReceivables(): Promise<VismaAgedReceivables> {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const unpaidInvoices = Array.from(this.invoices.values()).filter(
      (inv) => inv.status !== 'paid' && inv.status !== 'cancelled'
    );

    let current = 0;
    let days30 = 0;
    let days60 = 0;
    let days90 = 0;
    let days90Plus = 0;

    unpaidInvoices.forEach((inv) => {
      const dueTime = new Date(inv.dueDate).getTime();
      const daysOverdue = Math.floor((now - dueTime) / day);
      const amount = inv.totalWithVat;

      if (daysOverdue <= 0) {
        current += amount;
      } else if (daysOverdue <= 30) {
        days30 += amount;
      } else if (daysOverdue <= 60) {
        days60 += amount;
      } else if (daysOverdue <= 90) {
        days90 += amount;
      } else {
        days90Plus += amount;
      }
    });

    return {
      current,
      days30,
      days60,
      days90,
      days90Plus,
      total: current + days30 + days60 + days90 + days90Plus,
    };
  }

  async exportToAccounting(fromDate: string, toDate: string, format: VismaExportFormat): Promise<VismaExportResult> {
    // Mock export URL
    const exportId = `export-${Date.now()}`;
    return {
      downloadUrl: `https://mock.visma.no/export/${exportId}.${format}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  // =============================================================================
  // Helpers
  // =============================================================================

  private toBasicInvoice(inv: VismaInvoiceExtended): VismaInvoice {
    return {
      invoiceNumber: inv.invoiceNumber,
      bookingId: inv.bookingId,
      organizationId: inv.organizationId,
      amount: inv.amount,
      currency: inv.currency,
      description: inv.description,
      status: inv.status,
      dueDate: inv.dueDate,
      createdAt: inv.createdAt,
    };
  }

  private generateKID(): string {
    // Generate Norwegian KID (Kundeidentifikasjon) number
    // Simple mock: 11 digits
    const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    const checkDigit = this.calculateMod10(digits);
    return digits + checkDigit;
  }

  private calculateMod10(digits: string): string {
    // Simple MOD10 check digit calculation
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
