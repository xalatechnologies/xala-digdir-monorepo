/**
 * Visma Enterprise Integration Types
 * Norwegian municipal ERP/invoicing system integration
 *
 * Environment Variables Required:
 * - VISMA_API_URL (Visma.net API endpoint)
 * - VISMA_CLIENT_ID
 * - VISMA_CLIENT_SECRET
 * - VISMA_TENANT_ID
 *
 * License Note: Requires 'Visma.net Financials API access' license (Norway)
 * Rate limit: 600 requests/minute per endpoint
 */

// =============================================================================
// Core Types
// =============================================================================

export interface VismaConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  useMock: boolean;
}

export interface VismaConnectionStatus {
  connected: boolean;
  provider: 'Visma Enterprise';
  version?: string;
  lastSync?: string;
  pendingInvoices: number;
  overdueInvoices: number;
}

export interface VismaSyncResult {
  success: boolean;
  syncedAt: string;
  invoicesSynced: number;
  paymentsSynced: number;
  customersSynced: number;
}

// =============================================================================
// Invoice Types
// =============================================================================

export interface VismaInvoice {
  invoiceNumber: string;
  bookingId: string;
  organizationId: string;
  amount: number;
  currency: string;
  description?: string;
  status: VismaInvoiceStatus;
  dueDate: string;
  createdAt: string;
}

export type VismaInvoiceStatus = 'created' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface VismaInvoiceExtended extends VismaInvoice {
  customerReference?: string;
  ourReference?: string;
  lines: VismaInvoiceLine[];
  vatAmount: number;
  totalWithVat: number;
  paymentReference?: string;
  sentAt?: string;
  paidAt?: string;
  remindersSent: number;
  lastReminderAt?: string;
}

export interface VismaInvoiceLine {
  id: string;
  lineNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent?: number;
  vatRate: number;
  lineTotal: number;
}

export interface CreateVismaInvoiceDTO {
  bookingId: string;
  organizationId: string;
  amount: number;
  description?: string;
  lines?: Omit<VismaInvoiceLine, 'id' | 'lineNumber' | 'lineTotal'>[];
  customerReference?: string;
  ourReference?: string;
  dueDate?: string;
}

export interface VismaInvoiceQueryParams {
  status?: VismaInvoiceStatus;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

// =============================================================================
// Customer Types
// =============================================================================

export interface VismaCustomer {
  id: string;
  customerNumber: string;
  organizationNumber?: string;
  name: string;
  customerType: 'organization' | 'private';
  email?: string;
  phone?: string;
  invoiceAddress: VismaAddress;
  creditLimit?: number;
  paymentTermsDays: number;
  createdAt: string;
}

export interface VismaAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface CreateVismaCustomerDTO {
  organizationNumber?: string;
  name: string;
  customerType: VismaCustomer['customerType'];
  email?: string;
  phone?: string;
  invoiceAddress: VismaAddress;
  paymentTermsDays?: number;
  creditLimit?: number;
}

// =============================================================================
// Credit Note Types
// =============================================================================

export interface VismaCreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceNumber: string;
  customerId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'draft' | 'sent' | 'applied';
  createdAt: string;
}

export interface CreateVismaCreditNoteDTO {
  invoiceNumber: string;
  reason: string;
  amount?: number; // If not provided, full credit
}

// =============================================================================
// Payment Types
// =============================================================================

export interface VismaPayment {
  id: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: VismaPaymentMethod;
  bankReference?: string;
}

export type VismaPaymentMethod = 'bank_transfer' | 'vipps' | 'card' | 'cash' | 'other';

export interface RegisterVismaPaymentDTO {
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: VismaPaymentMethod;
  bankReference?: string;
}

// =============================================================================
// Report Types
// =============================================================================

export interface VismaFinancialSummary {
  periodStart: string;
  periodEnd: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueAmount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueInvoiceCount: number;
}

export interface VismaAgedReceivables {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90Plus: number;
  total: number;
}

export interface VismaExportResult {
  downloadUrl: string;
  expiresAt: string;
}

export type VismaExportFormat = 'csv' | 'saft' | 'ehf';

// =============================================================================
// Reminder Types
// =============================================================================

export interface SendInvoiceReminderDTO {
  invoiceNumber: string;
  reminderType: 'first' | 'second' | 'final';
  additionalMessage?: string;
}

// =============================================================================
// Integration Event Types (for audit trail)
// =============================================================================

export interface VismaIntegrationEvent {
  id: string;
  eventType: VismaEventType;
  entityType: 'invoice' | 'customer' | 'payment' | 'credit_note';
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

export type VismaEventType =
  | 'invoice_created'
  | 'invoice_sent'
  | 'invoice_paid'
  | 'invoice_cancelled'
  | 'invoice_reminder_sent'
  | 'customer_created'
  | 'customer_updated'
  | 'payment_registered'
  | 'credit_note_created'
  | 'credit_note_sent'
  | 'sync_completed';

// =============================================================================
// Client Interface
// =============================================================================

export interface IVismaClient {
  // Connection
  getStatus(): Promise<VismaConnectionStatus>;
  sync(): Promise<VismaSyncResult>;

  // Invoices
  createInvoice(data: CreateVismaInvoiceDTO): Promise<VismaInvoice>;
  getInvoices(params?: VismaInvoiceQueryParams): Promise<{ data: VismaInvoice[]; total: number }>;
  getInvoice(invoiceNumber: string): Promise<VismaInvoiceExtended>;
  sendInvoice(invoiceNumber: string): Promise<VismaInvoice>;
  sendReminder(data: SendInvoiceReminderDTO): Promise<VismaInvoice>;
  markInvoicePaid(invoiceNumber: string, paymentDate?: string): Promise<VismaInvoice>;
  cancelInvoice(invoiceNumber: string, reason: string): Promise<VismaInvoice>;

  // Customers
  getCustomers(params?: { page?: number; limit?: number }): Promise<{ data: VismaCustomer[]; total: number }>;
  getCustomer(customerId: string): Promise<VismaCustomer>;
  getCustomerByOrgNumber(organizationNumber: string): Promise<VismaCustomer | null>;
  createCustomer(data: CreateVismaCustomerDTO): Promise<VismaCustomer>;
  updateCustomer(customerId: string, data: Partial<CreateVismaCustomerDTO>): Promise<VismaCustomer>;
  getCustomerInvoices(customerId: string): Promise<{ data: VismaInvoice[]; total: number }>;

  // Credit Notes
  getCreditNotes(params?: { page?: number; limit?: number }): Promise<{ data: VismaCreditNote[]; total: number }>;
  createCreditNote(data: CreateVismaCreditNoteDTO): Promise<VismaCreditNote>;
  sendCreditNote(creditNoteNumber: string): Promise<VismaCreditNote>;

  // Payments
  getPayments(params?: {
    invoiceNumber?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: VismaPayment[]; total: number }>;
  registerPayment(data: RegisterVismaPaymentDTO): Promise<VismaPayment>;

  // Reports
  getFinancialSummary(periodStart: string, periodEnd: string): Promise<VismaFinancialSummary>;
  getAgedReceivables(): Promise<VismaAgedReceivables>;
  exportToAccounting(fromDate: string, toDate: string, format: VismaExportFormat): Promise<VismaExportResult>;
}
