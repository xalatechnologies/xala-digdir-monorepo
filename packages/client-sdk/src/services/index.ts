/**
 * Services Index
 * Exports all service instances and classes
 * Types are exported from ./types folder
 */

// Base service for extending
export { BaseService } from './base.service';

// Auth
export { AuthService, authService } from './auth.service';
export type {
  RequireAuthOptions,
  RequireAuthResult,
  InitiateAuthWithContextOptions,
  ResumeFlowResult,
} from './auth.service';

// Listings
export { ListingService, PublicListingService, listingService, publicListingService } from './listing.service';

// Bookings
export {
  BookingService,
  CalendarService,
  AllocationService,
  AvailabilityService,
  bookingService,
  calendarService,
  allocationService,
  availabilityService
} from './booking.service';

// Calendar (Listing calendar config & availability matrix)
export {
  ListingCalendarService,
  AvailabilityMatrixService,
  listingCalendarService,
  availabilityMatrixService,
  type CalendarConfigQueryParams,
} from './calendar.service';

// Organizations & Users
export { 
  OrganizationService, 
  UserService,
  organizationService,
  userService
} from './organization.service';

// Integrations
export {
  SettingsService as IntegrationSettingsService,
  RcoService,
  VismaService,
  BrregService,
  NifService,
  VippsService,
  CalendarSyncService,
  settingsService as integrationSettingsService,
  rcoService,
  vismaService,
  brregService,
  nifService,
  vippsService,
  calendarSyncService
} from './integration.service';

// ============================================================================
// Enterprise Services (service instances only - types from ./types)
// ============================================================================

// Audit
export { auditService } from './audit.service';

// Allocations (standalone)
export { allocationService as standaloneAllocationService } from './allocation.service';

// Conversations
export { conversationService } from './conversation.service';

// Notifications
export { notificationService } from './notification.service';

// Push Notifications
export { pushNotificationService } from './push-notification.service';

// Settings
export { settingsService } from './settings.service';

// Reports
export { reportsService } from './reports.service';

// Tenant
export { tenantService } from './tenant.service';

// Dashboard
export {
  DashboardService,
  dashboardService,
  type DashboardStats as DashboardStatsFromService,
  type RecentActivity,
  type QuickAction,
  type UpcomingBooking,
  type PendingItems,
} from './dashboard.service';

// Seasonal Lease
export { seasonalLeaseService } from './seasonal-lease.service';

// Discount Codes
export { discountCodeService } from './discount-code.service';

// Widgets
export { widgetService } from './widget.service';

// Monitoring
export { monitoringService } from './monitoring.service';

// Reviews
export { ReviewService, reviewService } from './review.service';

// Billing (User + Org)
export { 
  billingService, 
  orgBillingService
} from './billing.service';

// Re-export billing types for convenience
export type { 
  BillingSummary, 
  Invoice,
  InvoiceQueryParams 
} from './billing.service';

// Signicat (BankID/eID Hub)
export { signicatService } from './signicat.service';
export type {
  SignicatConfig,
  SignicatUser,
  SignicatTokens,
  SignicatAuthResult,
  SignicatLogoutResult,
} from './signicat.service';
