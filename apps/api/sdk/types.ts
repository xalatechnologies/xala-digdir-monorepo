/**
 * Digilist SDK - Complete TypeScript Types
 * Generated from API Specification v1.0
 */

// =============================================================================
// Enums & Constants
// =============================================================================

export type ListingType = 'SPACE' | 'RESOURCE' | 'SERVICE' | 'EVENT' | 'VEHICLE' | 'OTHER';

export type BookingModel = 'TIME_RANGE' | 'SLOT' | 'ALL_DAY' | 'QUANTITY' | 'CAPACITY' | 'PACKAGE';

export type ListingStatus = 'draft' | 'published' | 'archived' | 'maintenance';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

export type AllocationStatus = 'confirmed' | 'pending' | 'blocked' | 'maintenance';

export type SeasonalLeaseStatus = 'active' | 'upcoming' | 'expired' | 'cancelled';

export type ConversationStatus = 'active' | 'resolved' | 'archived';

export type OrganizationStatus = 'active' | 'inactive' | 'suspended';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type UserRole = 'admin' | 'saksbehandler' | 'user';

export type ActorType = 'private' | 'business' | 'sports_club' | 'youth_organization' | 'school' | 'municipality';

export type MessageSenderType = 'user' | 'admin' | 'system';

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export type DiscountType = 'percentage' | 'fixed';

export type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';

// =============================================================================
// Core Entity Types
// =============================================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  settings?: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
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

export interface IntegrationSettings {
  bankid: { enabled: boolean; clientId?: string };
  vipps: { enabled: boolean; merchantId?: string };
  idporten: { enabled: boolean; clientId?: string };
  visma: { enabled: boolean; companyId?: string };
  brreg: { enabled: boolean };
  rco: { enabled: boolean; apiKey?: string };
  outlook: { enabled: boolean };
  googleCalendar: { enabled: boolean };
}

// =============================================================================
// Listing Types
// =============================================================================

export interface Listing {
  id: string;
  tenantId: string;
  organizationId?: string;
  name: string;
  slug: string;
  type: ListingType;
  bookingModel?: BookingModel;
  status: ListingStatus;
  description?: string;
  images: string[];
  pricing: ListingPricing;
  capacity?: number;
  quantity?: number;
  metadata?: ListingMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ListingPricing {
  basePrice: number;
  currency: string;
  unit: PricingUnit;
  weekendMultiplier?: number;
  peakHoursMultiplier?: number;
}

export interface ListingMetadata {
  address?: string;
  city?: string;
  postalCode?: string;
  location?: {
    lat?: number;
    lng?: number;
    city?: string;
    municipality?: string;
  };
  facilities?: string[];
  amenities?: string[];
  openingHours?: Record<string, { open: string; close: string }>;
  rules?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

export interface ListingQueryParams {
  type?: ListingType;
  status?: ListingStatus;
  organizationId?: string;
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  amenities?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateListingDTO {
  name: string;
  slug?: string;
  type: ListingType;
  bookingModel?: BookingModel;
  description?: string;
  images?: string[];
  pricing?: Partial<ListingPricing>;
  capacity?: number;
  organizationId?: string;
  metadata?: ListingMetadata;
}

export interface UpdateListingDTO {
  name?: string;
  description?: string;
  images?: string[];
  pricing?: Partial<ListingPricing>;
  capacity?: number;
  metadata?: ListingMetadata;
}

export interface ListingAvailability {
  listingId: string;
  startDate: string;
  endDate: string;
  blockedSlots: Array<{
    startTime: string;
    endTime: string;
    status: string;
  }>;
}

export interface ListingStats {
  listingId: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  lastBooking?: string;
}

// =============================================================================
// Booking Types
// =============================================================================

export interface Booking {
  id: string;
  tenantId: string;
  listingId: string;
  userId: string;
  organizationId?: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  startTime: string;
  endTime: string;
  quantity?: number;
  totalPrice: string;
  currency: string;
  notes?: string;
  metadata?: BookingMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface BookingMetadata {
  attendees?: number;
  equipment?: string[];
  recurring?: boolean;
  frequency?: string;
  weekdays?: number[];
}

export interface BookingQueryParams {
  status?: BookingStatus;
  listingId?: string;
  userId?: string;
  organizationId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateBookingDTO {
  listingId: string;
  startTime: string | Date;
  endTime: string | Date;
  userId?: string;
  notes?: string;
  totalPrice?: number;
  metadata?: BookingMetadata;
}

export interface UpdateBookingDTO {
  startTime?: string | Date;
  endTime?: string | Date;
  notes?: string;
  metadata?: BookingMetadata;
}

export interface CancelBookingDTO {
  reason?: string;
}

export interface BookingPricing {
  listingId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  basePrice: number;
  discount: number;
  totalPrice: number;
  currency: string;
}

export interface CalendarEvent {
  id: string;
  listingId: string;
  listingName?: string;
  title?: string;
  start: string;
  end: string;
  status: string;
  bookingId?: string;
  userName?: string;
  organizationName?: string;
  color?: string;
}

// =============================================================================
// Seasonal Lease Types
// =============================================================================

export interface SeasonalLease {
  id: string;
  tenantId: string;
  listingId: string;
  organizationId: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  status: SeasonalLeaseStatus;
  totalPrice: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeasonalLeaseDTO {
  listingId: string;
  organizationId: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  totalPrice?: number;
  notes?: string;
}

export interface UpdateSeasonalLeaseDTO {
  weekdays?: number[];
  startTime?: string;
  endTime?: string;
  totalPrice?: number;
  notes?: string;
}

// =============================================================================
// Organization Types
// =============================================================================

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  organizationNumber?: string;
  actorType: ActorType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  status: OrganizationStatus;
  verified: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'member';
  user?: User;
  joinedAt: string;
}

export interface CreateOrganizationDTO {
  name: string;
  organizationNumber?: string;
  actorType?: ActorType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  status?: OrganizationStatus;
}

// =============================================================================
// User Types
// =============================================================================

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  role?: UserRole;
}

// =============================================================================
// Conversation & Message Types
// =============================================================================

export interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  bookingId?: string;
  subject?: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId?: string;
  senderName: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface CreateConversationDTO {
  userId?: string;
  bookingId?: string;
  subject?: string;
  initialMessage?: string;
}

export interface SendMessageDTO {
  content: string;
  attachments?: string[];
}

// =============================================================================
// Allocation Types
// =============================================================================

export interface Allocation {
  id: string;
  tenantId: string;
  listingId: string;
  bookingId?: string;
  startTime: string;
  endTime: string;
  quantity?: number;
  allocationType?: 'BOOKING' | 'BLOCK' | 'MAINTENANCE' | 'SEASONAL';
  status: AllocationStatus;
  title?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateAllocationDTO {
  listingId: string;
  startTime: string | Date;
  endTime: string | Date;
  title?: string;
  status?: AllocationStatus;
  notes?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate: string;
    weekdays?: number[];
  };
}

// =============================================================================
// Dashboard & Report Types
// =============================================================================

export interface DashboardKPIs {
  activeListings: number;
  pendingRequests: number;
  todayBookings: number;
  weekBookings: number;
  monthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  topListings: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface UsageReport {
  period: string;
  listingId: string;
  listingName: string;
  totalBookings: number;
  totalHours: number;
  utilizationRate: number;
  revenue: number;
}

export interface RevenueReport {
  totalCents: number;
  data: Array<{
    period: string;
    amountCents: number;
  }>;
}

export interface BookingReport {
  data: Array<{
    date: string;
    confirmed: number;
    cancelled: number;
    pending: number;
    revenue: number;
  }>;
}

export interface ReportQueryParams {
  period?: ReportPeriod;
  startDate: string;
  endDate: string;
  listingId?: string;
  organizationId?: string;
}

// =============================================================================
// Audit Types
// =============================================================================

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  resourceId?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditQueryParams {
  resource?: string;
  action?: string;
  userId?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Discount Code Types
// =============================================================================

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minBookingValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  listingIds?: string[];
  actorTypes?: ActorType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeDTO {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minBookingValue?: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  listingIds?: string[];
  actorTypes?: ActorType[];
}

export interface ValidateDiscountResult {
  valid: boolean;
  code?: DiscountCode;
  discountAmount?: number;
  reason?: string;
}

// =============================================================================
// Auth Types
// =============================================================================

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
  icon?: string;
  loginUrl?: string;
}

// =============================================================================
// Public API Types
// =============================================================================

export interface PublicListingParams {
  type?: ListingType;
  city?: string;
  municipality?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface City {
  name: string;
  slug: string;
  listingCount?: number;
}

export interface Municipality {
  code: string;
  name: string;
  county: string;
  listingCount?: number;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug?: string;
  description?: string;
  icon?: string;
  listingCount?: number;
  parentId?: string;
  children?: Category[];
}

// =============================================================================
// Integration Types
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

export interface VippsPayment {
  orderId: string;
  bookingId?: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  redirectUrl?: string;
  paidAt?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SuccessResponse {
  success: boolean;
}

// =============================================================================
// GDPR Types
// =============================================================================

export interface GdprDataExport {
  user: User;
  bookings: Booking[];
  conversations: Conversation[];
  organizations: Organization[];
  auditEvents: AuditEvent[];
  exportedAt: string;
}

export interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  updatedAt: string;
}

// =============================================================================
// Time Slot Types
// =============================================================================

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export interface AvailabilityQueryParams {
  startDate: string;
  endDate: string;
  duration?: number;
}

// =============================================================================
// Share Link Types
// =============================================================================

export interface ShareLink {
  token: string;
  type: 'listing' | 'booking';
  resourceId: string;
  expiresAt: string;
  url: string;
  createdAt: string;
}

export interface CreateShareLinkDTO {
  type: 'listing' | 'booking';
  resourceId: string;
  expiresIn?: number; // seconds
}
