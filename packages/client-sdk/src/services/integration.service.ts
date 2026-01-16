/**
 * Integration Services
 * Single Responsibility: Handle third-party integration operations
 */

import { BaseService } from './base.service';
import type {
  TenantSettings,
  IntegrationSettings,
  RcoAccessCode,
  RcoLock,
  CreateAccessCodeDTO,
  RcoAccessCodeExtended,
  RcoAccessLog,
  RcoLockSchedule,
  RcoEmergencyLockdown,
  RcoLockExtended,
  CreateRcoScheduleDTO,
  RcoAccessLogQueryParams,
  VismaInvoice,
  CreateInvoiceDTO,
  VismaInvoiceExtended,
  VismaCustomer,
  VismaCreditNote,
  VismaPayment,
  VismaFinancialSummary,
  CreateVismaCustomerDTO,
  CreateVismaCreditNoteDTO,
  SendInvoiceReminderDTO,
  VismaInvoiceQueryParams,
  BrregOrganization,
  NifSportsClub,
  VippsPayment,
  InitiatePaymentDTO,
  CapturePaymentDTO,
  RefundPaymentDTO,
  AcosWebSakStatus,
  AcosCase,
  AcosDocument,
  CreateAcosCaseDTO,
  UploadAcosDocumentDTO,
  AcosArchiveMetadata
} from '../types/settings';
import type { SingleResponse, SuccessResponse, PaginatedResponse } from '../types/enums';

/**
 * Settings Service
 */
export class SettingsService extends BaseService {
  constructor() {
    super('/api/settings');
  }

  /**
   * Get tenant settings
   */
  async getSettings(): Promise<SingleResponse<TenantSettings>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Update tenant settings
   */
  async updateSettings(data: Partial<TenantSettings>): Promise<SingleResponse<TenantSettings>> {
    return this.client.put(this.buildPath(), data);
  }

  /**
   * Get integration settings
   */
  async getIntegrations(): Promise<SingleResponse<IntegrationSettings>> {
    return this.client.get(this.buildPath('/integrations'));
  }

  /**
   * Update integration settings
   */
  async updateIntegration(provider: string, data: Record<string, unknown>): Promise<SingleResponse<IntegrationSettings>> {
    return this.client.put(this.buildPath(`/integrations/${provider}`), data);
  }
}

/**
 * RCO Access Control Service
 * Enhanced with security features for municipal building access control
 */
export class RcoService extends BaseService {
  constructor() {
    super('/api/integrations/rco');
  }

  // ============================================================
  // Core Access Control
  // ============================================================

  /**
   * Get RCO connection status
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; activeAccessCodes: number; lockdownActive: boolean }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Generate access code for booking
   */
  async generateAccessCode(data: CreateAccessCodeDTO): Promise<SingleResponse<RcoAccessCode>> {
    return this.client.post(this.buildPath('/access-code'), data);
  }

  /**
   * Get connected locks
   */
  async getLocks(): Promise<SingleResponse<RcoLock[]>> {
    return this.client.get(this.buildPath('/locks'));
  }

  /**
   * Get extended lock details with metadata
   */
  async getLocksExtended(): Promise<SingleResponse<RcoLockExtended[]>> {
    return this.client.get(this.buildPath('/locks/extended'));
  }

  /**
   * Get single lock by ID
   */
  async getLock(lockId: string): Promise<SingleResponse<RcoLockExtended>> {
    return this.client.get(this.buildPath(`/locks/${lockId}`));
  }

  /**
   * Remote unlock
   */
  async unlock(lockId: string, duration?: number): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/unlock'), { lockId, duration });
  }

  // ============================================================
  // Access Codes Management
  // ============================================================

  /**
   * Get all active access codes
   */
  async getAccessCodes(params?: {
    listingId?: string;
    bookingId?: string;
    active?: boolean
  }): Promise<PaginatedResponse<RcoAccessCodeExtended>> {
    return this.client.get(this.buildPath('/access-codes'), { params });
  }

  /**
   * Get access code by code value
   */
  async getAccessCode(code: string): Promise<SingleResponse<RcoAccessCodeExtended>> {
    return this.client.get(this.buildPath(`/access-codes/${code}`));
  }

  /**
   * Revoke an access code
   */
  async revokeAccessCode(code: string, reason?: string): Promise<SingleResponse<RcoAccessCodeExtended>> {
    return this.client.post(this.buildPath(`/access-codes/${code}/revoke`), { reason });
  }

  /**
   * Extend access code validity
   */
  async extendAccessCode(code: string, newValidUntil: string): Promise<SingleResponse<RcoAccessCodeExtended>> {
    return this.client.put(this.buildPath(`/access-codes/${code}/extend`), { validUntil: newValidUntil });
  }

  // ============================================================
  // Access Logs & Audit
  // ============================================================

  /**
   * Get access logs with filtering
   */
  async getAccessLogs(params?: RcoAccessLogQueryParams): Promise<PaginatedResponse<RcoAccessLog>> {
    return this.client.get(this.buildPath('/access-logs'), { params });
  }

  /**
   * Get access logs for a specific lock
   */
  async getLockAccessLogs(lockId: string, params?: Omit<RcoAccessLogQueryParams, 'lockId'>): Promise<PaginatedResponse<RcoAccessLog>> {
    return this.client.get(this.buildPath(`/locks/${lockId}/access-logs`), { params });
  }

  /**
   * Get access logs for a specific booking
   */
  async getBookingAccessLogs(bookingId: string): Promise<PaginatedResponse<RcoAccessLog>> {
    return this.client.get(this.buildPath(`/access-logs/booking/${bookingId}`));
  }

  // ============================================================
  // Lock Schedules
  // ============================================================

  /**
   * Get schedules for a lock
   */
  async getLockSchedules(lockId: string): Promise<SingleResponse<RcoLockSchedule[]>> {
    return this.client.get(this.buildPath(`/locks/${lockId}/schedules`));
  }

  /**
   * Create lock schedule
   */
  async createSchedule(data: CreateRcoScheduleDTO): Promise<SingleResponse<RcoLockSchedule>> {
    return this.client.post(this.buildPath('/schedules'), data);
  }

  /**
   * Update lock schedule
   */
  async updateSchedule(scheduleId: string, data: Partial<CreateRcoScheduleDTO>): Promise<SingleResponse<RcoLockSchedule>> {
    return this.client.put(this.buildPath(`/schedules/${scheduleId}`), data);
  }

  /**
   * Delete lock schedule
   */
  async deleteSchedule(scheduleId: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/schedules/${scheduleId}`));
  }

  // ============================================================
  // Emergency Lockdown
  // ============================================================

  /**
   * Get current lockdown status
   */
  async getLockdownStatus(): Promise<SingleResponse<RcoEmergencyLockdown>> {
    return this.client.get(this.buildPath('/lockdown/status'));
  }

  /**
   * Activate emergency lockdown
   */
  async activateLockdown(reason: string, lockIds?: string[]): Promise<SingleResponse<RcoEmergencyLockdown>> {
    return this.client.post(this.buildPath('/lockdown/activate'), { reason, lockIds });
  }

  /**
   * Deactivate emergency lockdown
   */
  async deactivateLockdown(): Promise<SingleResponse<RcoEmergencyLockdown>> {
    return this.client.post(this.buildPath('/lockdown/deactivate'));
  }

  // ============================================================
  // Sync & Diagnostics
  // ============================================================

  /**
   * Trigger sync with RCO system
   */
  async sync(): Promise<SuccessResponse & { syncedLocks: number; syncedCodes: number }> {
    return this.client.post(this.buildPath('/sync'));
  }

  /**
   * Test lock connectivity
   */
  async testLock(lockId: string): Promise<SingleResponse<{ lockId: string; responsive: boolean; latencyMs: number }>> {
    return this.client.post(this.buildPath(`/locks/${lockId}/test`));
  }
}

/**
 * Visma ERP Service
 * Enhanced with enterprise features for Norwegian municipal financial management
 */
export class VismaService extends BaseService {
  constructor() {
    super('/api/integrations/visma');
  }

  // ============================================================
  // Core Status & Sync
  // ============================================================

  /**
   * Get Visma connection status
   */
  async getStatus(): Promise<SingleResponse<{
    connected: boolean;
    pendingInvoices: number;
    overdueInvoices: number;
    lastSync?: string;
  }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Trigger sync with Visma
   */
  async sync(): Promise<SuccessResponse & { invoicesSynced: number; paymentsSynced: number; customersSynced: number }> {
    return this.client.post(this.buildPath('/sync'));
  }

  // ============================================================
  // Invoice Management
  // ============================================================

  /**
   * Create invoice
   */
  async createInvoice(data: CreateInvoiceDTO): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath('/invoices'), data);
  }

  /**
   * Get invoices with filtering
   */
  async getInvoices(params?: VismaInvoiceQueryParams): Promise<PaginatedResponse<VismaInvoice>> {
    return this.client.get(this.buildPath('/invoices'), { params });
  }

  /**
   * Get invoice by number
   */
  async getInvoice(invoiceNumber: string): Promise<SingleResponse<VismaInvoiceExtended>> {
    return this.client.get(this.buildPath(`/invoices/${invoiceNumber}`));
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceNumber: string): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath(`/invoices/${invoiceNumber}/send`));
  }

  /**
   * Send invoice reminder
   */
  async sendReminder(data: SendInvoiceReminderDTO): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath(`/invoices/${data.invoiceNumber}/reminder`), data);
  }

  /**
   * Mark invoice as paid manually
   */
  async markInvoicePaid(invoiceNumber: string, paymentDate?: string): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath(`/invoices/${invoiceNumber}/mark-paid`), { paymentDate });
  }

  /**
   * Cancel invoice (void)
   */
  async cancelInvoice(invoiceNumber: string, reason: string): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath(`/invoices/${invoiceNumber}/cancel`), { reason });
  }

  // ============================================================
  // Customer Management
  // ============================================================

  /**
   * Get all customers
   */
  async getCustomers(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<VismaCustomer>> {
    return this.client.get(this.buildPath('/customers'), { params });
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<SingleResponse<VismaCustomer>> {
    return this.client.get(this.buildPath(`/customers/${customerId}`));
  }

  /**
   * Get customer by organization number
   */
  async getCustomerByOrgNumber(organizationNumber: string): Promise<SingleResponse<VismaCustomer | null>> {
    return this.client.get(this.buildPath(`/customers/org/${organizationNumber}`));
  }

  /**
   * Create customer
   */
  async createCustomer(data: CreateVismaCustomerDTO): Promise<SingleResponse<VismaCustomer>> {
    return this.client.post(this.buildPath('/customers'), data);
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, data: Partial<CreateVismaCustomerDTO>): Promise<SingleResponse<VismaCustomer>> {
    return this.client.put(this.buildPath(`/customers/${customerId}`), data);
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(customerId: string): Promise<PaginatedResponse<VismaInvoice>> {
    return this.client.get(this.buildPath(`/customers/${customerId}/invoices`));
  }

  // ============================================================
  // Credit Notes
  // ============================================================

  /**
   * Get credit notes
   */
  async getCreditNotes(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<VismaCreditNote>> {
    return this.client.get(this.buildPath('/credit-notes'), { params });
  }

  /**
   * Create credit note for invoice
   */
  async createCreditNote(data: CreateVismaCreditNoteDTO): Promise<SingleResponse<VismaCreditNote>> {
    return this.client.post(this.buildPath('/credit-notes'), data);
  }

  /**
   * Send credit note
   */
  async sendCreditNote(creditNoteNumber: string): Promise<SingleResponse<VismaCreditNote>> {
    return this.client.post(this.buildPath(`/credit-notes/${creditNoteNumber}/send`));
  }

  // ============================================================
  // Payments
  // ============================================================

  /**
   * Get payments
   */
  async getPayments(params?: {
    invoiceNumber?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<VismaPayment>> {
    return this.client.get(this.buildPath('/payments'), { params });
  }

  /**
   * Register manual payment
   */
  async registerPayment(data: {
    invoiceNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: VismaPayment['paymentMethod'];
    bankReference?: string;
  }): Promise<SingleResponse<VismaPayment>> {
    return this.client.post(this.buildPath('/payments'), data);
  }

  // ============================================================
  // Financial Reports
  // ============================================================

  /**
   * Get financial summary for period
   */
  async getFinancialSummary(params: {
    periodStart: string;
    periodEnd: string;
  }): Promise<SingleResponse<VismaFinancialSummary>> {
    return this.client.get(this.buildPath('/reports/summary'), { params });
  }

  /**
   * Get aged receivables report
   */
  async getAgedReceivables(): Promise<SingleResponse<{
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days90Plus: number;
    total: number;
  }>> {
    return this.client.get(this.buildPath('/reports/aged-receivables'));
  }

  /**
   * Export invoices to accounting format
   */
  async exportToAccounting(params: {
    fromDate: string;
    toDate: string;
    format: 'csv' | 'saft' | 'ehf';
  }): Promise<SingleResponse<{ downloadUrl: string; expiresAt: string }>> {
    return this.client.post(this.buildPath('/export'), params);
  }
}

/**
 * BRREG (Norwegian Business Registry) Service
 */
export class BrregService extends BaseService {
  constructor() {
    super('/api/integrations/brreg');
  }

  /**
   * Lookup organization by number
   */
  async lookup(orgNumber: string): Promise<SingleResponse<BrregOrganization>> {
    return this.client.get(this.buildPath(`/lookup/${orgNumber}`));
  }

  /**
   * Verify organization
   */
  async verify(organizationNumber: string): Promise<SingleResponse<{ verified: boolean }>> {
    return this.client.post(this.buildPath('/verify'), { organizationNumber });
  }
}

/**
 * NIF (Norwegian Sports Federation) Service
 */
export class NifService extends BaseService {
  constructor() {
    super('/api/integrations/nif');
  }

  /**
   * Lookup sports club
   */
  async lookup(clubId: string): Promise<SingleResponse<NifSportsClub>> {
    return this.client.get(this.buildPath(`/lookup/${clubId}`));
  }
}

/**
 * Vipps Payments Service
 */
export class VippsService extends BaseService {
  constructor() {
    super('/api/integrations/vipps');
  }

  /**
   * Get Vipps connection status
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; merchantId: string }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Initiate payment
   */
  async initiatePayment(data: InitiatePaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/initiate'), data);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string): Promise<SingleResponse<VippsPayment>> {
    return this.client.get(this.buildPath(`/payment/${orderId}`));
  }

  /**
   * Capture payment (finalize authorized payment)
   */
  async capturePayment(data: CapturePaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/capture'), data);
  }

  /**
   * Refund payment (full or partial)
   */
  async refundPayment(data: RefundPaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/refund'), data);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<PaginatedResponse<VippsPayment>> {
    return this.client.get(this.buildPath('/history'));
  }
}

/**
 * Calendar Sync Service
 */
export class CalendarSyncService extends BaseService {
  constructor() {
    super('/api/integrations/calendar');
  }

  /**
   * Get calendar sync status
   */
  async getStatus(): Promise<SingleResponse<{
    googleCalendar: { connected: boolean };
    outlookCalendar: { connected: boolean; lastSync?: string };
  }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Trigger calendar sync
   */
  async sync(provider: 'google' | 'outlook'): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/sync'), { provider });
  }
}

/**
 * ACOS WebSak Service
 * Norwegian Municipal Case Management System Integration
 *
 * ACOS WebSak is used by Norwegian municipalities for:
 * - Document management (dokumenthåndtering)
 * - Case tracking (saksstyring)
 * - Archive compliance following NOARK standards
 */
export class AcosWebSakService extends BaseService {
  constructor() {
    super('/api/integrations/acos-websak');
  }

  /**
   * Get ACOS WebSak connection status
   */
  async getStatus(): Promise<SingleResponse<AcosWebSakStatus>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Create a new case in ACOS WebSak
   * Used when a booking requires formal case processing
   */
  async createCase(data: CreateAcosCaseDTO): Promise<SingleResponse<AcosCase>> {
    return this.client.post(this.buildPath('/cases'), data);
  }

  /**
   * Get case by ID
   */
  async getCase(caseId: string): Promise<SingleResponse<AcosCase>> {
    return this.client.get(this.buildPath(`/cases/${caseId}`));
  }

  /**
   * Get case by booking ID (for booking-linked cases)
   */
  async getCaseByBookingId(bookingId: string): Promise<SingleResponse<AcosCase | null>> {
    return this.client.get(this.buildPath(`/cases/booking/${bookingId}`));
  }

  /**
   * List all cases with optional filters
   */
  async listCases(params?: {
    status?: AcosCase['status'];
    caseType?: AcosCase['caseType'];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AcosCase>> {
    return this.client.get(this.buildPath('/cases'), { params });
  }

  /**
   * Update case status
   */
  async updateCaseStatus(caseId: string, status: AcosCase['status']): Promise<SingleResponse<AcosCase>> {
    return this.client.put(this.buildPath(`/cases/${caseId}/status`), { status });
  }

  /**
   * Archive a case (NOARK compliance)
   */
  async archiveCase(caseId: string, metadata?: AcosArchiveMetadata): Promise<SingleResponse<AcosCase>> {
    return this.client.post(this.buildPath(`/cases/${caseId}/archive`), metadata);
  }

  /**
   * Upload document to a case
   */
  async uploadDocument(data: UploadAcosDocumentDTO): Promise<SingleResponse<AcosDocument>> {
    return this.client.post(this.buildPath('/documents'), data);
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<SingleResponse<AcosDocument>> {
    return this.client.get(this.buildPath(`/documents/${documentId}`));
  }

  /**
   * List documents for a case
   */
  async listDocuments(caseId: string): Promise<PaginatedResponse<AcosDocument>> {
    return this.client.get(this.buildPath(`/cases/${caseId}/documents`));
  }

  /**
   * Archive a document (NOARK compliance)
   */
  async archiveDocument(documentId: string): Promise<SingleResponse<AcosDocument>> {
    return this.client.post(this.buildPath(`/documents/${documentId}/archive`));
  }

  /**
   * Trigger full sync with ACOS WebSak
   */
  async sync(): Promise<SuccessResponse & { syncedCases: number; syncedDocuments: number }> {
    return this.client.post(this.buildPath('/sync'));
  }
}

// Singleton instances
export const settingsService = new SettingsService();
export const rcoService = new RcoService();
export const vismaService = new VismaService();
export const brregService = new BrregService();
export const nifService = new NifService();
export const vippsService = new VippsService();
export const calendarSyncService = new CalendarSyncService();
export const acosWebSakService = new AcosWebSakService();
