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

// Rental Objects (Utleieobjekter) - Primary services
export {
  RentalObjectService,
  PublicRentalObjectService,
  rentalObjectService,
  publicRentalObjectService,
  type CategoryInfo,
  type SubcategoryInfo,
  type TimeModeInfo,
} from './rental-object.service';

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

// Calendar (Rental Object calendar config & availability matrix)
export {
  RentalObjectCalendarService,
  AvailabilityMatrixService,
  rentalObjectCalendarService,
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

// ID-porten (BankID/eID Hub)
export { idportenService } from './idporten.service';

// Vipps Login (OIDC Authentication)
export { vippsAuthService } from './vipps.service';
export type {
  IdPortenConfig,
  IdPortenUser,
  IdPortenTokens,
  IdPortenAuthResult,
  IdPortenLogoutResult,
} from './idporten.service';

// Integrations Configuration (ID-porten, Vipps, Visma, RCO, ACOS)
export { IntegrationsService, integrationsService } from './integrations.service';
export type {
  Integration,
  IntegrationUpdate,
  IntegrationTestResult,
} from './integrations.service';

// Profile & Preferences
export { ProfileService, profileService } from './profile.service';

// Authorization (RBAC)
export {
  AuthzService,
  authzService,
  type AuthzUserRole,
  type AuthzResource,
  type AuthzAction,
  type UserPermissionsDTO,
  type PermissionCheckResultDTO,
  type PermissionCheckParams,
} from './authz.service';

// GDPR Consent
export { GdprService, gdprService } from './gdpr.service';

// Notification System (complete notification system)
export { notificationSystemService } from './notification-system.service';
