/**
 * Services Index
 * Exports all service instances and classes
 * Types are exported from ./types folder
 */

// Base service for extending
export { BaseService } from './base.service';

// Amenities
export { AmenitiesService, amenitiesService } from './amenities.service';

// Auth
export { AuthService, authService } from './auth.service';

// Authorization / RBAC
export { AuthzService, authzService } from './authz.service';
export { AccessGrantService, accessGrantService } from './access-grant.service';
export { PermissionAssignmentService, permissionAssignmentService } from './permission-assignment.service';

// Rental Objects (primary)
export {
  RentalObjectService,
  PublicRentalObjectService,
  rentalObjectService,
  publicRentalObjectService
} from './rental-object.service';

// Listings
// TODO: Create listing.service.ts file
// export { ListingService, PublicListingService, listingService, publicListingService } from './listing.service';

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

// Metadata
export {
  MetadataService,
  metadataService,
  type CategoryMetadata,
  type TimeModeMetadata,
  type PricingUnitMetadata,
  type StatusMetadata,
  type MetadataResponse,
  type MetadataFilter,
} from './metadata.service';

// Seasonal Lease
export { seasonalLeaseService } from './seasonal-lease.service';

// Seasons
export { seasonService } from './season.service';

// Season Applications
export { seasonApplicationService } from './season-application.service';

// Discount Codes
export { discountCodeService } from './discount-code.service';

// Widgets
export { widgetService } from './widget.service';

// Monitoring
export { monitoringService } from './monitoring.service';

// Reviews
export { ReviewService, reviewService } from './review.service';

// Integrations (simple service)
export { integrationsService } from './integrations.service';
export type { Integration, IntegrationUpdate, IntegrationTestResult } from './integrations.service';

// ID-porten
export { idportenService } from './idporten.service';

// Vipps
export { vippsAuthService } from './vipps.service';

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

// SaaS Admin - Service only (types from ./types)
export { saasService } from './saas.service';

// Tenant Admin - Service only (types from ./types)
export { tenantAdminService } from './tenant-admin.service';

// Tenant Admin User Management
export {
  TenantAdminUserService,
  tenantAdminUserService
} from './tenant-admin-user.service';
export type {
  TenantUser,
  UserRole as TenantUserRole,
  UserStatus as TenantUserStatus,
  InviteUserDTO,
  AssignRoleDTO,
  AssignOrganizationDTO,
  DelegateScope,
  AssignScopeDTO,
  EffectivePermissions,
  UserQueryParams as TenantUserQueryParams,
  UserInvitation,
  ResendInvitationDTO,
  CancelInvitationDTO,
} from './tenant-admin-user.service';

// Scope Assignment - Case handler scope delegation
export {
  ScopeAssignmentService,
  scopeAssignmentService
} from './scope-assignment.service';

// Custody - Resource-scoped delegation hierarchy
export {
  CustodyService,
  custodyService
} from './custody.service';
export type { CustodyGrant } from './custody.service';
export type {
  ScopeType,
  ScopeStatus,
  // CaseHandlerScope - already exported from ./types/rbac
  CreateScopeAssignmentDTO,
  UpdateScopeAssignmentDTO,
  AssignScopesDTO,
  ScopeQueryParams,
  EffectiveScope,
  ScopeDelegationNode,
} from './scope-assignment.service';

// Modules - Feature flags
export { modulesService, ModulesService } from './modules.service';
export type {
  ModuleDTO,
  ModuleInfoDTO,
  EffectiveModulesDTO,
  ModuleCatalogDTO,
  UpdateModuleDTO,
  FeatureDisabledError,
} from './modules.service';

// Org Dashboard - For org_admin/org_member roles
export { orgDashboardService } from './org-dashboard.service';

// Blocks - Calendar blocks management
export { blocksService } from './blocks.service';
export type { BlockQueryParams, BlockListResponse } from './blocks.service';

// Admin Permissions - Rental object specific permissions (different from RBAC)
export {
  adminPermissionService,
} from './admin-permission.service';
export type {
  RentalObjectPermissionGrant,
  GrantPermissionDTO,
  AdminPermissionQueryParams,
} from './admin-permission.service';

// AI Seed Generator
export { aiSeedService } from './ai-seed.service';
export type {
  EntityType as SeedEntityType,
  GenerateSeedRequest,
  GenerateSeedResponse,
} from './ai-seed.service';

// Scanners - Code quality and compliance
export { scannerService } from './scanner.service';
export type {
  ScannerType,
  ScannerResult,
  ScannerStatus,
} from './scanner.service';

// Activities - Public activities (classes, events, etc.)
export { activityService } from './activity.service';
export type {
  Activity,
  ActivityCategory,
  ActivityQueryParams,
  ActivityRegistration,
  RegisterForActivityDTO,
} from './activity.service';
