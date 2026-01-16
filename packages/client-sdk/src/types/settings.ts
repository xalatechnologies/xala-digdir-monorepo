/**
 * Settings & Integration Types
 * Single Responsibility: Tenant settings and third-party integrations
 */

// =============================================================================
// Tenant Settings
// =============================================================================

export interface BookingSettingsConfig {
  requireApproval: boolean;
  defaultLeadTimeMinutes: number;
  maxAdvanceDays: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  cancellationHours: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmation: boolean;
  bookingReminder: boolean;
  reminderHoursBefore: number;
}

export interface PaymentSettings {
  enabled: boolean;
  provider: 'vipps' | 'stripe' | 'invoice';
  requirePaymentUpfront: boolean;
  vatRate: number;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  displayName?: string;
  logo?: string;
  primaryColor?: string;
  timezone: string;
  currency: string;
  language: string;
  bookingSettings?: BookingSettingsConfig;
  notificationSettings?: NotificationSettings;
  paymentSettings?: PaymentSettings;
}

// =============================================================================
// Integration Settings
// =============================================================================

export interface IntegrationConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface IntegrationSettings {
  bankid: IntegrationConfig & { clientId?: string };
  vipps: IntegrationConfig & { merchantId?: string };
  idporten: IntegrationConfig & { clientId?: string };
  visma: IntegrationConfig & { companyId?: string };
  brreg: IntegrationConfig;
  rco: IntegrationConfig & { apiKey?: string };
  outlook: IntegrationConfig;
  googleCalendar: IntegrationConfig;
}

// =============================================================================
// RCO Access Control
// =============================================================================

export interface RcoAccessCode {
  code: string;
  bookingId: string;
  listingId: string;
  validFrom: string;
  validUntil: string;
  type: 'PIN' | 'RFID' | 'QR';
  createdAt: string;
}

export interface RcoLock {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
}

export interface CreateAccessCodeDTO {
  bookingId: string;
  listingId: string;
  validFrom: string;
  validUntil: string;
}

/** Extended RCO access code with security features */
export interface RcoAccessCodeExtended extends RcoAccessCode {
  /** Access level (visitor, member, admin) */
  accessLevel: 'visitor' | 'member' | 'admin';
  /** User ID associated with this code */
  userId?: string;
  /** Organization ID associated with this code */
  organizationId?: string;
  /** Number of times the code has been used */
  usageCount: number;
  /** Maximum number of uses (null = unlimited) */
  maxUses?: number | null;
  /** Whether the code has been revoked */
  revoked: boolean;
  /** Revocation reason if revoked */
  revokedReason?: string;
  /** Revocation timestamp */
  revokedAt?: string;
}

/** RCO access log entry */
export interface RcoAccessLog {
  id: string;
  /** Lock ID that was accessed */
  lockId: string;
  /** Access code used */
  accessCode: string;
  /** Access code type */
  codeType: RcoAccessCode['type'];
  /** Whether access was granted */
  accessGranted: boolean;
  /** Reason for denial if access was denied */
  denialReason?: 'invalid_code' | 'expired' | 'revoked' | 'time_restriction' | 'max_uses_reached';
  /** Timestamp of access attempt */
  timestamp: string;
  /** User ID if associated */
  userId?: string;
  /** Booking ID if associated */
  bookingId?: string;
}

/** RCO lock schedule */
export interface RcoLockSchedule {
  id: string;
  lockId: string;
  /** Day of week (0 = Sunday, 6 = Saturday) */
  dayOfWeek: number;
  /** Start time (HH:mm) */
  startTime: string;
  /** End time (HH:mm) */
  endTime: string;
  /** Whether the lock is accessible during this period */
  isAccessible: boolean;
  /** Optional description */
  description?: string;
}

/** RCO emergency lockdown status */
export interface RcoEmergencyLockdown {
  active: boolean;
  activatedAt?: string;
  activatedBy?: string;
  reason?: string;
  affectedLocks: string[];
}

/** Extended RCO lock with additional metadata */
export interface RcoLockExtended extends RcoLock {
  /** Lock type (entry, interior, gate) */
  lockType: 'entry' | 'interior' | 'gate' | 'elevator';
  /** Associated listing IDs */
  listingIds: string[];
  /** Battery level percentage (for wireless locks) */
  batteryLevel?: number;
  /** Last activity timestamp */
  lastActivity?: string;
  /** Firmware version */
  firmwareVersion?: string;
}

/** Create lock schedule DTO */
export interface CreateRcoScheduleDTO {
  lockId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAccessible: boolean;
  description?: string;
}

/** Query parameters for access logs */
export interface RcoAccessLogQueryParams {
  lockId?: string;
  userId?: string;
  bookingId?: string;
  accessGranted?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Visma ERP
// =============================================================================

export interface VismaInvoice {
  invoiceNumber: string;
  bookingId: string;
  organizationId: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'created' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface CreateInvoiceDTO {
  bookingId: string;
  organizationId: string;
  amount: number;
  description?: string;
}

/** Extended Visma invoice with line items */
export interface VismaInvoiceExtended extends VismaInvoice {
  /** Customer reference */
  customerReference?: string;
  /** Our reference (saksbehandler) */
  ourReference?: string;
  /** Invoice lines */
  lines: VismaInvoiceLine[];
  /** Total VAT amount */
  vatAmount: number;
  /** Total amount including VAT */
  totalWithVat: number;
  /** Payment reference (KID) */
  paymentReference?: string;
  /** Sent timestamp */
  sentAt?: string;
  /** Paid timestamp */
  paidAt?: string;
  /** Reminders sent count */
  remindersSent: number;
  /** Last reminder date */
  lastReminderAt?: string;
}

/** Visma invoice line item */
export interface VismaInvoiceLine {
  id: string;
  /** Line number */
  lineNumber: number;
  /** Product/service code */
  productCode: string;
  /** Description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Unit (timer, stk, dag, etc.) */
  unit: string;
  /** Unit price excluding VAT */
  unitPrice: number;
  /** Discount percentage */
  discountPercent?: number;
  /** VAT rate (usually 25% in Norway) */
  vatRate: number;
  /** Line total excluding VAT */
  lineTotal: number;
}

/** Visma customer (organization/contact) */
export interface VismaCustomer {
  id: string;
  /** Customer number in Visma */
  customerNumber: string;
  /** Organization number */
  organizationNumber?: string;
  /** Customer name */
  name: string;
  /** Customer type */
  customerType: 'organization' | 'private';
  /** Contact email */
  email?: string;
  /** Contact phone */
  phone?: string;
  /** Invoice address */
  invoiceAddress: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  /** Credit limit */
  creditLimit?: number;
  /** Payment terms (days) */
  paymentTermsDays: number;
  /** Created date */
  createdAt: string;
}

/** Visma credit note */
export interface VismaCreditNote {
  id: string;
  /** Credit note number */
  creditNoteNumber: string;
  /** Original invoice number */
  originalInvoiceNumber: string;
  /** Customer ID */
  customerId: string;
  /** Total amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Reason for credit */
  reason: string;
  /** Status */
  status: 'draft' | 'sent' | 'applied';
  /** Created date */
  createdAt: string;
}

/** Visma payment record */
export interface VismaPayment {
  id: string;
  /** Invoice number */
  invoiceNumber: string;
  /** Payment date */
  paymentDate: string;
  /** Amount paid */
  amount: number;
  /** Currency */
  currency: string;
  /** Payment method */
  paymentMethod: 'bank_transfer' | 'vipps' | 'card' | 'cash' | 'other';
  /** Bank reference */
  bankReference?: string;
}

/** Visma financial summary */
export interface VismaFinancialSummary {
  /** Period start */
  periodStart: string;
  /** Period end */
  periodEnd: string;
  /** Total invoiced */
  totalInvoiced: number;
  /** Total paid */
  totalPaid: number;
  /** Outstanding balance */
  outstandingBalance: number;
  /** Overdue amount */
  overdueAmount: number;
  /** Number of invoices */
  invoiceCount: number;
  /** Number of paid invoices */
  paidInvoiceCount: number;
  /** Number of overdue invoices */
  overdueInvoiceCount: number;
}

/** Create customer DTO */
export interface CreateVismaCustomerDTO {
  organizationNumber?: string;
  name: string;
  customerType: VismaCustomer['customerType'];
  email?: string;
  phone?: string;
  invoiceAddress: VismaCustomer['invoiceAddress'];
  paymentTermsDays?: number;
}

/** Create credit note DTO */
export interface CreateVismaCreditNoteDTO {
  invoiceNumber: string;
  reason: string;
  amount?: number; // If not provided, full credit
}

/** Send invoice reminder DTO */
export interface SendInvoiceReminderDTO {
  invoiceNumber: string;
  reminderType: 'first' | 'second' | 'final';
  additionalMessage?: string;
}

/** Query parameters for invoices */
export interface VismaInvoiceQueryParams {
  status?: VismaInvoice['status'];
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

// =============================================================================
// BRREG (Norwegian Business Registry)
// =============================================================================

export interface BrregOrganization {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: { kode: string; beskrivelse: string };
  registreringsdatoEnhetsregisteret: string;
  forretningsadresse: {
    adresse: string[];
    postnummer: string;
    poststed: string;
    kommune: string;
    land: string;
  };
  naeringskode1?: { kode: string; beskrivelse: string };
}

// =============================================================================
// NIF (Norwegian Sports Federation)
// =============================================================================

export interface NifSportsClub {
  id: string;
  name: string;
  region: string;
  sports: string[];
  memberCount: number;
  verified: boolean;
  eligibleForDiscount: boolean;
  discountPercentage: number;
}

// =============================================================================
// Vipps Payments
// =============================================================================

export interface VippsPayment {
  orderId: string;
  bookingId?: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  redirectUrl?: string;
  paidAt?: string;
  // Refund tracking
  refundedAmount?: number;
  refundStatus?: 'none' | 'partial' | 'full';
  refundedAt?: string;
  // Deposit handling
  depositAmount?: number;
  captureAmount?: number;
  capturedAt?: string;
}

export interface InitiatePaymentDTO {
  bookingId: string;
  amount: number;
  description?: string;
  returnUrl: string;
}

export interface CapturePaymentDTO {
  orderId: string;
  amount?: number; // Optional for partial capture
}

export interface RefundPaymentDTO {
  orderId: string;
  amount?: number; // Optional for partial refund
  reason?: string;
}

// =============================================================================
// ACOS WebSak (Norwegian Municipal Case Management System)
// =============================================================================

/** ACOS WebSak connection status */
export interface AcosWebSakStatus {
  connected: boolean;
  provider: 'ACOS WebSak';
  version?: string;
  lastSync?: string;
  pendingCases: number;
  pendingDocuments: number;
}

/** ACOS WebSak case (sak) */
export interface AcosCase {
  /** ACOS case ID */
  id: string;
  /** NOARK case number (saksår/sekvensnummer) */
  caseNumber: string;
  /** Case title */
  title: string;
  /** Case status */
  status: 'open' | 'closed' | 'archived' | 'on_hold';
  /** Case type */
  caseType: 'booking' | 'application' | 'complaint' | 'inquiry';
  /** Associated booking ID (if applicable) */
  bookingId?: string;
  /** Associated listing ID (if applicable) */
  listingId?: string;
  /** Case handler (saksbehandler) ID */
  responsibleUserId?: string;
  /** Creation date */
  createdAt: string;
  /** Last modified date */
  updatedAt: string;
  /** Archive date (if archived) */
  archivedAt?: string;
}

/** ACOS WebSak document (dokument) */
export interface AcosDocument {
  /** ACOS document ID */
  id: string;
  /** NOARK document number */
  documentNumber: string;
  /** Document title */
  title: string;
  /** Document type */
  documentType: 'incoming' | 'outgoing' | 'internal' | 'notat';
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Associated case ID */
  caseId: string;
  /** Document status */
  status: 'draft' | 'finalized' | 'archived';
  /** Author user ID */
  authorId?: string;
  /** Upload date */
  uploadedAt: string;
  /** Archive date (if archived) */
  archivedAt?: string;
}

/** Create case in ACOS WebSak */
export interface CreateAcosCaseDTO {
  title: string;
  caseType: AcosCase['caseType'];
  bookingId?: string;
  listingId?: string;
  description?: string;
}

/** Upload document to ACOS WebSak */
export interface UploadAcosDocumentDTO {
  caseId: string;
  title: string;
  documentType: AcosDocument['documentType'];
  fileContent: string; // Base64 encoded
  fileName: string;
  mimeType: string;
}

/** ACOS WebSak archive metadata */
export interface AcosArchiveMetadata {
  /** NOARK archive series */
  archiveSeries: string;
  /** Classification code */
  classificationCode: string;
  /** Retention period in years */
  retentionPeriod: number;
  /** Archive unit */
  archiveUnit: string;
}
