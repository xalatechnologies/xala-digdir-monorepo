/**
 * Platform Services Index
 *
 * Platform services are domain-agnostic and provide core infrastructure:
 * - Authentication & Authorization
 * - Tenant & User Management
 * - Permissions & Access Control
 * - Audit & Compliance
 * - Notifications & Communication
 * - Integrations & External APIs
 * - Monitoring & Security
 * - SaaS & Billing
 *
 * These services are part of @xalatechnologies/platform and can be used
 * across different domain applications.
 */

// =============================================================================
// Authentication & Authorization
// =============================================================================
export { AuthService, authService } from '../services/auth.service';
export { AuthzService, authzService } from '../services/authz.service';
export { idportenService } from '../services/idporten.service';
export { vippsAuthService } from '../services/vipps.service';

// =============================================================================
// Tenant Management
// =============================================================================
export { tenantService } from '../services/tenant.service';
export { tenantAdminService } from '../services/tenant-admin.service';
export {
  TenantAdminUserService,
  tenantAdminUserService,
} from '../services/tenant-admin-user.service';
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
} from '../services/tenant-admin-user.service';

// =============================================================================
// User Management
// =============================================================================
export { UserService, userService } from '../services/organization.service';

// =============================================================================
// Organization Management
// =============================================================================
export {
  OrganizationService,
  organizationService,
} from '../services/organization.service';

// =============================================================================
// Permissions & Access Control
// =============================================================================
export {
  PermissionAssignmentService,
  permissionAssignmentService,
} from '../services/permission-assignment.service';
export {
  AccessGrantService,
  accessGrantService,
} from '../services/access-grant.service';
export {
  ScopeAssignmentService,
  scopeAssignmentService,
} from '../services/scope-assignment.service';
export type {
  ScopeType,
  ScopeStatus,
  CreateScopeAssignmentDTO,
  UpdateScopeAssignmentDTO,
  AssignScopesDTO,
  ScopeQueryParams,
  EffectiveScope,
  ScopeDelegationNode,
} from '../services/scope-assignment.service';
export { CustodyService, custodyService } from '../services/custody.service';
export type { CustodyGrant } from '../services/custody.service';

// =============================================================================
// Audit & Compliance
// =============================================================================
export { auditService } from '../services/audit.service';
export { GdprService, gdprService } from '../services/gdpr.service';

// =============================================================================
// Settings & Configuration
// =============================================================================
export { settingsService } from '../services/settings.service';
export { modulesService, ModulesService } from '../services/modules.service';
export type {
  ModuleDTO,
  ModuleInfoDTO,
  EffectiveModulesDTO,
  ModuleCatalogDTO,
  UpdateModuleDTO,
  FeatureDisabledError,
} from '../services/modules.service';
export { NavigationService } from '../services/navigation.service';
export type {
  BackofficeMenuResponse,
  UserContextResponse,
} from '../services/navigation.service';

// =============================================================================
// Monitoring & Security
// =============================================================================
export { monitoringService } from '../services/monitoring.service';
export { monitoringExtendedService } from '../services/monitoring-extended.service';
export { securityService } from '../services/security.service';

// =============================================================================
// Billing & SaaS
// =============================================================================
export { billingService, orgBillingService } from '../services/billing.service';
export type {
  BillingSummary,
  Invoice,
  InvoiceQueryParams,
} from '../services/billing.service';
export { saasService } from '../services/saas.service';

// =============================================================================
// Storage & Metadata
// =============================================================================
export { StorageService } from '../services/storage.service';
export {
  MetadataService,
  metadataService,
} from '../services/metadata.service';
export type {
  CategoryMetadata,
  TimeModeMetadata,
  PricingUnitMetadata,
  StatusMetadata,
  MetadataResponse,
  MetadataFilter,
} from '../services/metadata.service';
export { searchService } from '../services/search.service';

// =============================================================================
// Help & Support
// =============================================================================
export { helpService } from '../services/help.service';

// =============================================================================
// Notifications & Communication
// =============================================================================
export { notificationService } from '../services/notification.service';
export { notificationSystemService } from '../services/notification-system.service';
export { pushNotificationService } from '../services/push-notification.service';
export { conversationService } from '../services/conversation.service';

// =============================================================================
// Integrations & External APIs
// =============================================================================
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
  calendarSyncService,
} from '../services/integration.service';
export { integrationCredentialsService } from '../services/integration-credentials.service';
export { brregService as brregLookupService } from '../services/brreg.service';

// =============================================================================
// Scanners & Code Quality
// =============================================================================
export { scannerService } from '../services/scanner.service';
export type {
  ScannerType,
  ScannerResult,
  ScannerStatus,
} from '../services/scanner.service';
