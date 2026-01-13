/**
 * API Types
 * Type definitions for Digilist API responses
 */

// =============================================================================
// Enums
// =============================================================================

export type ListingType = 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';
export type ListingStatus = 'draft' | 'published' | 'archived';
export type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Single item response wrapper
 */
export interface SingleResponse<T> {
  data: T;
}

// =============================================================================
// Domain Types (API Schema)
// =============================================================================

/**
 * Pricing information
 */
export interface Pricing {
  basePrice: number;
  currency: string;
  unit: PricingUnit;
  weekendModifier?: number;
  memberDiscount?: number;
}

/**
 * Tenant
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended';
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Listing (API response shape)
 */
export interface Listing {
  id: string;
  tenantId: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  type: ListingType;
  status: ListingStatus;
  description?: string | null;
  images: string[];
  pricing: Pricing;
  capacity?: number | null;
  metadata: ListingMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * Listing metadata (flexible schema for additional data)
 */
export interface ListingMetadata {
  // Location
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  
  // Category
  category?: string;
  subcategory?: string;
  
  // Facilities
  facilities?: string[];
  
  // Ratings
  rating?: number;
  reviewCount?: number;
  
  // Availability
  openingHours?: Record<string, { open: string; close: string }>;
  
  // Custom fields
  [key: string]: unknown;
}

/**
 * Booking
 */
export interface Booking {
  id: string;
  tenantId: string;
  listingId: string;
  userId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  totalPrice: number;
  currency: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional, depends on API response)
  listing?: Listing;
  user?: User;
}

/**
 * User
 */
export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface ListingQueryParams {
  organizationId?: string;
  type?: ListingType;
  status?: ListingStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface BookingQueryParams {
  listingId?: string;
  userId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Create/Update DTOs
// =============================================================================

export interface CreateListingDTO {
  name: string;
  slug?: string;
  organizationId?: string;
  type?: ListingType;
  description?: string;
  images?: string[];
  pricing?: Partial<Pricing>;
  capacity?: number;
  metadata?: Partial<ListingMetadata>;
}

export interface UpdateListingDTO {
  name?: string;
  type?: ListingType;
  description?: string | null;
  images?: string[];
  pricing?: Partial<Pricing>;
  capacity?: number | null;
  metadata?: Partial<ListingMetadata>;
}

export interface CreateBookingDTO {
  listingId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Calendar / Availability Types
// =============================================================================

export type AllocationStatus = 'confirmed' | 'pending' | 'blocked' | 'maintenance';

/**
 * Calendar event (booking or allocation)
 */
export interface CalendarEvent {
  id: string;
  listingId: string;
  listingName?: string;
  title: string;
  startTime: string;
  endTime: string;
  status: AllocationStatus;
  bookingId?: string;
  userId?: string;
  userName?: string;
  organizationName?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Time slot availability
 */
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
  reason?: string;
}

/**
 * Availability query params
 */
export interface AvailabilityQueryParams {
  listingId?: string;
  startDate: string;
  endDate: string;
  duration?: number;
}

/**
 * Calendar query params
 */
export interface CalendarQueryParams {
  listingId?: string;
  startDate: string;
  endDate: string;
  status?: AllocationStatus;
}

/**
 * Create allocation DTO (block time, maintenance, etc.)
 */
export interface CreateAllocationDTO {
  listingId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: AllocationStatus;
  notes?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate: string;
    weekdays?: number[];
  };
}

// =============================================================================
// Seasonal Rental Types
// =============================================================================

export type SeasonalLeaseStatus = 'active' | 'upcoming' | 'expired' | 'cancelled';

/**
 * Seasonal lease agreement
 */
export interface SeasonalLease {
  id: string;
  tenantId: string;
  listingId: string;
  listingName?: string;
  organizationId: string;
  organizationName?: string;
  startDate: string;
  endDate: string;
  weekdays: number[]; // 0=Sunday, 1=Monday, etc.
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: SeasonalLeaseStatus;
  totalPrice: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Seasonal lease query params
 */
export interface SeasonalLeaseQueryParams {
  listingId?: string;
  organizationId?: string;
  status?: SeasonalLeaseStatus;
  page?: number;
  limit?: number;
}

/**
 * Create seasonal lease DTO
 */
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

/**
 * Update seasonal lease DTO
 */
export interface UpdateSeasonalLeaseDTO {
  endDate?: string;
  weekdays?: number[];
  startTime?: string;
  endTime?: string;
  status?: SeasonalLeaseStatus;
  totalPrice?: number;
  notes?: string;
}

// =============================================================================
// Messages / Conversations Types
// =============================================================================

export type ConversationStatus = 'active' | 'resolved' | 'archived';
export type MessageSender = 'user' | 'admin' | 'system';

/**
 * Conversation
 */
export interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string;
  organizationId?: string;
  organizationName?: string;
  bookingId?: string;
  subject?: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Message
 */
export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  senderId?: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

/**
 * Conversation query params
 */
export interface ConversationQueryParams {
  userId?: string;
  bookingId?: string;
  status?: ConversationStatus;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Message query params
 */
export interface MessageQueryParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

/**
 * Create message DTO
 */
export interface CreateMessageDTO {
  conversationId: string;
  content: string;
  attachments?: string[];
}

/**
 * Create conversation DTO
 */
export interface CreateConversationDTO {
  userId: string;
  bookingId?: string;
  subject?: string;
  initialMessage: string;
}

// =============================================================================
// Reports / Analytics Types
// =============================================================================

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ReportType = 'usage' | 'revenue' | 'bookings' | 'organizations';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

/**
 * Report query params
 */
export interface ReportQueryParams {
  type: ReportType;
  startDate: string;
  endDate: string;
  listingId?: string;
  organizationId?: string;
  period?: ReportPeriod;
}

/**
 * Usage report data
 */
export interface UsageReport {
  period: string;
  listingId: string;
  listingName: string;
  totalBookings: number;
  totalHours: number;
  utilizationRate: number;
  revenue: number;
}

/**
 * Revenue report data
 */
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  bookingCount: number;
  averageBookingValue: number;
  byListing: {
    listingId: string;
    listingName: string;
    revenue: number;
    percentage: number;
  }[];
  byPaymentStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
}

/**
 * Booking statistics
 */
export interface BookingStats {
  period: string;
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
  confirmationRate: number;
  cancellationRate: number;
}

/**
 * Organization activity report
 */
export interface OrganizationReport {
  organizationId: string;
  organizationName: string;
  totalBookings: number;
  totalSpent: number;
  activeSeasonalLeases: number;
  lastBookingDate?: string;
}

/**
 * Dashboard KPIs
 */
export interface DashboardKPIs {
  activeListings: number;
  pendingRequests: number;
  todayBookings: number;
  weekBookings: number;
  monthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  topListings: {
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }[];
}

// =============================================================================
// Organization Types
// =============================================================================

export type OrganizationStatus = 'active' | 'inactive' | 'suspended';

/**
 * Organization
 */
export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  organizationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  status: OrganizationStatus;
  memberCount?: number;
  activeBookings?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization member
 */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

/**
 * Organization query params
 */
export interface OrganizationQueryParams {
  status?: OrganizationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Create organization DTO
 */
export interface CreateOrganizationDTO {
  name: string;
  organizationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

/**
 * Update organization DTO
 */
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
// User Management Types (Extended)
// =============================================================================

export type UserRole = 'admin' | 'saksbehandler' | 'user';
export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * Extended user type for backoffice
 */
export interface BackofficeUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  organizationName?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User query params
 */
export interface UserQueryParams {
  role?: UserRole;
  status?: UserStatus;
  organizationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Create user DTO
 */
export interface CreateUserDTO {
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
}

/**
 * Update user DTO
 */
export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  organizationId?: string;
}

// =============================================================================
// UI Types (Transformed for components)
// =============================================================================

/**
 * UI-friendly listing type (matches @xala/ds ListingCard props)
 */
export interface UiListing {
  id: string;
  name: string;
  type: string;
  listingType: ListingType;
  location: string;
  description: string;
  facilities: string[];
  moreFacilities: number;
  capacity: number;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  image: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Transform API Listing to UI Listing
 */
export function transformListing(listing: Listing): UiListing {
  const metadata = listing.metadata || {};
  const facilities = metadata.facilities || [];
  const maxFacilities = 3;

  const result: UiListing = {
    id: listing.id,
    name: listing.name,
    type: metadata.category || listing.type,
    listingType: listing.type,
    location: metadata.address || metadata.city || 'Unknown',
    description: listing.description || '',
    facilities: facilities.slice(0, maxFacilities),
    moreFacilities: Math.max(0, facilities.length - maxFacilities),
    capacity: listing.capacity || 0,
    price: listing.pricing?.basePrice || 0,
    priceUnit: mapPricingUnit(listing.pricing?.unit || 'hour'),
    rating: metadata.rating || 0,
    reviewCount: metadata.reviewCount || 0,
    available: listing.status === 'published',
    image: listing.images?.[0] || '/placeholder.jpg',
  };

  // Only add optional properties if they have values
  if (metadata.latitude !== undefined) {
    result.latitude = metadata.latitude;
  }
  if (metadata.longitude !== undefined) {
    result.longitude = metadata.longitude;
  }

  return result;
}

/**
 * Map API pricing unit to Norwegian display string
 */
function mapPricingUnit(unit: PricingUnit): string {
  const unitMap: Record<PricingUnit, string> = {
    hour: 'time',
    day: 'dag',
    booking: 'booking',
    week: 'uke',
    month: 'måned',
  };
  return unitMap[unit] || unit;
}

/**
 * Transform multiple listings
 */
export function transformListings(listings: Listing[]): UiListing[] {
  return listings.map(transformListing);
}
