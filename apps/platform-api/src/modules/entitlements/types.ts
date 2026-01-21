/**
 * Entitlements & Feature Flags Type System
 * Single source of truth for what tenants/users can see and do
 */

export enum ModuleKey {
  BOOKING = 'BOOKING',
  APPROVALS = 'APPROVALS',
  REPORTING = 'REPORTING',
  INVOICING = 'INVOICING',
  AUDIT = 'AUDIT',
  INTEGRATIONS = 'INTEGRATIONS',
  TEMPLATES = 'TEMPLATES',
  EXPORTS = 'EXPORTS',
  ANALYTICS = 'ANALYTICS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  ORGANIZATIONS = 'ORGANIZATIONS',
  USERS = 'USERS',
  SETTINGS = 'SETTINGS',
}

export enum IntegrationKey {
  RCO_LOCKS = 'RCO_LOCKS',
  ACOS_ARCHIVE = 'ACOS_ARCHIVE',
  VIPPS_PAYMENT = 'VIPPS_PAYMENT',
  STRIPE_PAYMENT = 'STRIPE_PAYMENT',
  EMAIL_PROVIDER = 'EMAIL_PROVIDER',
  SMS_PROVIDER = 'SMS_PROVIDER',
  MAPBOX = 'MAPBOX',
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  CALENDAR_SYNC = 'CALENDAR_SYNC',
  WEBHOOK = 'WEBHOOK',
}

export enum FeatureKey {
  BOOKING_RECURRING = 'BOOKING_RECURRING',
  BOOKING_IN_GAME = 'BOOKING_IN_GAME',
  CALENDAR_BLACKOUTS = 'CALENDAR_BLACKOUTS',
  RATINGS_FEEDBACK = 'RATINGS_FEEDBACK',
  ORG_DASHBOARD = 'ORG_DASHBOARD',
  DSAR_EXPORT = 'DSAR_EXPORT',
  ADVANCED_SEARCH = 'ADVANCED_SEARCH',
  BULK_OPERATIONS = 'BULK_OPERATIONS',
  CUSTOM_FIELDS = 'CUSTOM_FIELDS',
  API_ACCESS = 'API_ACCESS',
  WEBHOOKS = 'WEBHOOKS',
  SSO = 'SSO',
  MULTI_LANGUAGE = 'MULTI_LANGUAGE',
  WHITE_LABEL = 'WHITE_LABEL',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
}

export enum RouteKey {
  // Backoffice routes
  BACKOFFICE_DASHBOARD = 'backoffice.dashboard',
  BACKOFFICE_BOOKINGS = 'backoffice.bookings',
  BACKOFFICE_BOOKINGS_CREATE = 'backoffice.bookings.create',
  BACKOFFICE_LISTINGS = 'backoffice.listings',
  BACKOFFICE_LISTINGS_CREATE = 'backoffice.listings.create',
  BACKOFFICE_APPROVALS = 'backoffice.approvals',
  BACKOFFICE_REPORTS = 'backoffice.reports',
  BACKOFFICE_USERS = 'backoffice.users',
  BACKOFFICE_ORGANIZATIONS = 'backoffice.organizations',
  BACKOFFICE_SETTINGS = 'backoffice.settings',
  BACKOFFICE_INTEGRATIONS = 'backoffice.integrations',
  BACKOFFICE_AUDIT = 'backoffice.audit',
  
  // Minside routes
  MINSIDE_DASHBOARD = 'minside.dashboard',
  MINSIDE_BOOKINGS = 'minside.bookings',
  MINSIDE_BOOKINGS_CREATE = 'minside.bookings.create',
  MINSIDE_ORG_DASHBOARD = 'minside.org.dashboard',
  MINSIDE_ORG_MEMBERS = 'minside.org.members',
  MINSIDE_ORG_BOOKINGS = 'minside.org.bookings',
  MINSIDE_PROFILE = 'minside.profile',
  
  // Web routes
  WEB_HOME = 'web.home',
  WEB_LISTINGS = 'web.listings',
  WEB_LISTING_DETAILS = 'web.listing.details',
  WEB_BOOKING = 'web.booking',
  
  // SaaS Admin routes
  SAAS_TENANTS = 'saas.tenants',
  SAAS_PLANS = 'saas.plans',
  SAAS_FEATURES = 'saas.features',
  SAAS_INTEGRATIONS = 'saas.integrations',
  SAAS_ANALYTICS = 'saas.analytics',
}

export enum NavItemKey {
  // Backoffice navigation
  BACKOFFICE_NAV_DASHBOARD = 'backoffice.nav.dashboard',
  BACKOFFICE_NAV_BOOKINGS = 'backoffice.nav.bookings',
  BACKOFFICE_NAV_LISTINGS = 'backoffice.nav.listings',
  BACKOFFICE_NAV_APPROVALS = 'backoffice.nav.approvals',
  BACKOFFICE_NAV_REPORTS = 'backoffice.nav.reports',
  BACKOFFICE_NAV_USERS = 'backoffice.nav.users',
  BACKOFFICE_NAV_ORGANIZATIONS = 'backoffice.nav.organizations',
  BACKOFFICE_NAV_SETTINGS = 'backoffice.nav.settings',
  BACKOFFICE_NAV_INTEGRATIONS = 'backoffice.nav.integrations',
  BACKOFFICE_NAV_AUDIT = 'backoffice.nav.audit',
  
  // Minside navigation
  MINSIDE_NAV_DASHBOARD = 'minside.nav.dashboard',
  MINSIDE_NAV_BOOKINGS = 'minside.nav.bookings',
  MINSIDE_NAV_ORG_DASHBOARD = 'minside.nav.org.dashboard',
  MINSIDE_NAV_ORG_MEMBERS = 'minside.nav.org.members',
  MINSIDE_NAV_PROFILE = 'minside.nav.profile',
  
  // SaaS Admin navigation
  SAAS_NAV_TENANTS = 'saas.nav.tenants',
  SAAS_NAV_PLANS = 'saas.nav.plans',
  SAAS_NAV_FEATURES = 'saas.nav.features',
  SAAS_NAV_INTEGRATIONS = 'saas.nav.integrations',
  SAAS_NAV_ANALYTICS = 'saas.nav.analytics',
}

export enum ActionKey {
  BOOKING_CREATE = 'booking.create',
  BOOKING_EDIT = 'booking.edit',
  BOOKING_DELETE = 'booking.delete',
  BOOKING_APPROVE = 'booking.approve',
  BOOKING_REJECT = 'booking.reject',
  LISTING_CREATE = 'listing.create',
  LISTING_EDIT = 'listing.edit',
  LISTING_DELETE = 'listing.delete',
  LISTING_PUBLISH = 'listing.publish',
  USER_CREATE = 'user.create',
  USER_EDIT = 'user.edit',
  USER_DELETE = 'user.delete',
  ORG_CREATE = 'org.create',
  ORG_EDIT = 'org.edit',
  ORG_DELETE = 'org.delete',
  EXPORT_DATA = 'export.data',
  VIEW_AUDIT = 'audit.view',
  MANAGE_INTEGRATIONS = 'integrations.manage',
}

export enum EntitlementDecision {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  READONLY = 'READONLY',
}

export enum NavItemState {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
  DISABLED = 'DISABLED',
}

export enum IntegrationStatus {
  OK = 'OK',
  MISSING = 'MISSING',
  INVALID = 'INVALID',
  DISABLED = 'DISABLED',
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export interface IntegrationConfig {
  integrationKey: IntegrationKey;
  status: IntegrationStatus;
  configJson?: Record<string, unknown>;
  lastValidatedAt?: Date;
}

export interface NavItem {
  key: NavItemKey;
  labelKey: string;
  routeKey?: RouteKey;
  iconKey?: string;
  parentKey?: NavItemKey;
  section?: string;
  contexts: string[];
  order: number;
}

export interface EffectiveEntitlements {
  tenantId: string;
  userId: string;
  roles: string[];
  subscription: {
    planId: string;
    planName: string;
    status: string;
    tier: string;
  } | null;
  
  enabledModules: ModuleKey[];
  enabledFeatures: FeatureKey[];
  enabledIntegrations: IntegrationKey[];
  
  integrationStatuses: Record<IntegrationKey, {
    status: string;
    lastValidatedAt?: string;
    validationError?: string;
  }>;
  
  routes: Record<RouteKey, boolean>;
  navItems: Record<string, NavItem[]>;
  
  evaluatedAt: string;
  cacheUntil: string;
}

export interface EntitlementEvaluationContext {
  tenantId: string;
  userId: string;
  roles: string[];
  organizationId?: string;
  environment?: string;
}

export interface PlanEntitlement {
  planId: string;
  moduleKey?: ModuleKey;
  featureKey?: FeatureKey;
  integrationKey?: IntegrationKey;
  defaultEnabled: boolean;
}

export interface TenantOverride {
  tenantId: string;
  keyType: 'module' | 'feature' | 'integration';
  key: string;
  enabled: boolean;
  reason?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface RoutePolicy {
  app: string;
  routeKey: RouteKey;
  requiredRoles: string[];
  requiredModules: ModuleKey[];
  requiredFeatures: FeatureKey[];
  isPublic: boolean;
}

export interface NavPolicy {
  app: string;
  navItemKey: NavItemKey;
  routeKey?: RouteKey;
  requiredRoles: string[];
  requiredModules: ModuleKey[];
  requiredFeatures: FeatureKey[];
  labelKey: string;
  iconKey?: string;
  parentKey?: NavItemKey;
  section?: string;
  contexts: string[];
  order: number;
}
