/**
 * User ACL Mapper - Anti-Corruption Layer
 *
 * Transforms raw database user entities to screen-ready projection DTOs.
 * This is the ONLY place where user data transformation should happen.
 * UI components receive these projection DTOs directly - no further transformation allowed.
 */

// =============================================================================
// INTERNAL DB TYPES (Not exported - internal to ACL layer)
// =============================================================================

interface DbUser {
  id: string;
  tenantId: string;
  organizationId: string | null;
  email: string;
  name: string;
  nationalId: string | null;
  role: string;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface DbUserWithOrganization extends DbUser {
  organizationName?: string;
  organizationSlug?: string;
}

interface DbConsent {
  type: string;
  granted: boolean;
  grantedAt: Date | null;
  version: string;
}

// =============================================================================
// PROJECTION DTOs (Exported for SDK/UI consumption)
// =============================================================================

/**
 * User card projection for list views
 */
export interface UserCardProjectionDTO {
  id: string;
  tenantId: string;
  
  // Identity
  name: string;
  email: string;
  initials: string;
  avatarUrl: string;
  
  // Organization
  organizationId: string | null;
  organizationName: string | null;
  hasOrganization: boolean;
  
  // Role & Status
  role: string;
  roleLabel: string;
  roleColor: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  
  // Activity
  lastLoginAt: string | null;
  lastLoginDisplay: string;
  isOnline: boolean;
  
  // Flags
  isActive: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  
  // Permissions
  availableActions: string[];
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeactivate: boolean;
    canReactivate: boolean;
    canChangeRole: boolean;
    canImpersonate: boolean;
  };
  
  // Timestamps
  createdAt: string;
  createdDisplay: string;
}

/**
 * User details projection for detail/profile views
 */
export interface UserDetailsProjectionDTO extends UserCardProjectionDTO {
  // Extended identity
  nationalIdMasked: string;
  hasNationalId: boolean;
  
  // Contact preferences
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    timezone: string;
  };
  
  // Consents (GDPR)
  consents: {
    marketing: boolean;
    analytics: boolean;
    necessary: boolean;
    consentVersion: string;
    lastUpdated: string;
  };
  
  // Activity stats
  stats: {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
  
  // Security
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string | null;
    activeSessions: number;
  };
  
  // Audit trail (last N actions)
  recentActivity: Array<{
    id: string;
    action: string;
    actionLabel: string;
    timestamp: string;
    timestampDisplay: string;
    details: string;
  }>;
}

/**
 * Current user projection (for /me endpoints)
 */
export interface CurrentUserProjectionDTO {
  id: string;
  tenantId: string;
  
  // Identity
  name: string;
  email: string;
  initials: string;
  avatarUrl: string;
  
  // Organization
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  
  // Role
  role: string;
  roleLabel: string;
  
  // Status
  status: string;
  isActive: boolean;
  isVerified: boolean;
  
  // Preferences
  preferences: {
    language: string;
    timezone: string;
    theme: string;
  };
  
  // Feature flags (user-specific)
  featureFlags: Record<string, boolean>;
  
  // Permissions (what the user can do)
  capabilities: string[];
}

/**
 * User consent projection (GDPR)
 */
export interface UserConsentProjectionDTO {
  userId: string;
  
  // Required consents
  necessary: {
    granted: boolean;
    required: true;
    description: string;
  };
  
  // Optional consents
  marketing: {
    granted: boolean;
    grantedAt: string | null;
    canWithdraw: boolean;
    description: string;
  };
  
  analytics: {
    granted: boolean;
    grantedAt: string | null;
    canWithdraw: boolean;
    description: string;
  };
  
  // Preferences
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  
  // Metadata
  consentVersion: string;
  lastUpdated: string;
  
  // Actions
  availableActions: string[];
}

// =============================================================================
// LABEL/COLOR MAPPINGS - Use i18n keys
// =============================================================================

const ROLE_LABELS: Record<string, string> = {
  member: 'sdk.user.role.member',
  admin: 'sdk.user.role.admin',
  caseworker: 'sdk.user.role.caseworker',
  saas_admin: 'sdk.user.role.saasAdmin',
  owner: 'sdk.user.role.owner',
  viewer: 'sdk.user.role.viewer',
  MEMBER: 'sdk.user.role.member',
  ADMIN: 'sdk.user.role.admin',
  CASEWORKER: 'sdk.user.role.caseworker',
  SAAS_ADMIN: 'sdk.user.role.saasAdmin',
};

const ROLE_COLORS: Record<string, string> = {
  member: 'neutral',
  admin: 'brand1',
  caseworker: 'info',
  saas_admin: 'brand2',
  owner: 'brand2',
  viewer: 'subtle',
  MEMBER: 'neutral',
  ADMIN: 'brand1',
  CASEWORKER: 'info',
  SAAS_ADMIN: 'brand2',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'sdk.user.status.active',
  inactive: 'sdk.user.status.inactive',
  suspended: 'sdk.user.status.suspended',
  pending: 'sdk.user.status.pending',
  invited: 'sdk.user.status.invited',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
  pending: 'warning',
  invited: 'info',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function safeString(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

function safeNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function safeBoolean(val: unknown): boolean {
  return val === true || val === 'true';
}

function formatDate(date: Date | string | null): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

function formatRelativeDate(date: Date | string | null): string {
  if (!date) return 'sdk.time.never';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 5) return 'sdk.time.justNow';
  if (diffMins < 60) return `${diffMins} sdk.time.minutesAgo`;
  if (diffHours < 24) return `${diffHours} sdk.time.hoursAgo`;
  if (diffDays === 1) return 'sdk.time.yesterday';
  if (diffDays < 7) return `${diffDays} sdk.time.daysAgo`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sdk.time.weeksAgo`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} sdk.time.monthsAgo`;
  return `${Math.floor(diffDays / 365)} sdk.time.yearsAgo`;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function maskNationalId(nationalId: string | null): string {
  if (!nationalId) return '';
  // Norwegian national ID: show only last 5 digits
  if (nationalId.length === 11) {
    return `******${nationalId.slice(-5)}`;
  }
  // Generic masking
  return '*'.repeat(Math.max(0, nationalId.length - 4)) + nationalId.slice(-4);
}

function isOnline(lastLoginAt: Date | string | null): boolean {
  if (!lastLoginAt) return false;
  const last = typeof lastLoginAt === 'string' ? new Date(lastLoginAt) : lastLoginAt;
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  // Consider online if last login was within 15 minutes
  return diffMs < 15 * 60 * 1000;
}

function getAvailableActions(user: DbUser, viewerRole: string = 'member', isOwn: boolean = false): string[] {
  const actions: string[] = ['view'];
  const isAdmin = ['admin', 'saas_admin', 'ADMIN', 'SAAS_ADMIN'].includes(viewerRole);
  
  if (isOwn) {
    actions.push('edit_profile', 'change_password', 'manage_consents');
  }
  
  if (isAdmin && !isOwn) {
    actions.push('edit');
    
    if (user.status === 'active') {
      actions.push('deactivate');
    }
    if (user.status === 'inactive' || user.status === 'suspended') {
      actions.push('reactivate');
    }
    
    actions.push('change_role');
    
    // Only super admins can impersonate
    if (viewerRole === 'saas_admin' || viewerRole === 'SAAS_ADMIN') {
      actions.push('impersonate');
    }
    
    // Only if not the last admin
    actions.push('delete');
  }
  
  return actions;
}

function getPermissions(user: DbUser, viewerRole: string = 'member', isOwn: boolean = false): UserCardProjectionDTO['permissions'] {
  const isAdmin = ['admin', 'saas_admin', 'ADMIN', 'SAAS_ADMIN'].includes(viewerRole);
  const isSuperAdmin = ['saas_admin', 'SAAS_ADMIN'].includes(viewerRole);
  
  return {
    canView: true,
    canEdit: isOwn || isAdmin,
    canDelete: isAdmin && !isOwn,
    canDeactivate: isAdmin && !isOwn && user.status === 'active',
    canReactivate: isAdmin && !isOwn && ['inactive', 'suspended'].includes(user.status),
    canChangeRole: isAdmin && !isOwn,
    canImpersonate: isSuperAdmin && !isOwn,
  };
}

function extractPreferences(metadata: Record<string, unknown> | null): UserDetailsProjectionDTO['preferences'] {
  if (!metadata) {
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      language: 'nb',
      timezone: 'Europe/Oslo',
    };
  }
  
  const prefs = (metadata.preferences as Record<string, unknown>) || {};
  
  return {
    emailNotifications: safeBoolean(prefs.emailNotifications ?? true),
    smsNotifications: safeBoolean(prefs.smsNotifications ?? false),
    pushNotifications: safeBoolean(prefs.pushNotifications ?? true),
    language: safeString(prefs.language) || 'nb',
    timezone: safeString(prefs.timezone) || 'Europe/Oslo',
  };
}

function extractConsents(metadata: Record<string, unknown> | null): UserDetailsProjectionDTO['consents'] {
  if (!metadata) {
    return {
      marketing: false,
      analytics: true,
      necessary: true,
      consentVersion: '1.0',
      lastUpdated: new Date().toISOString(),
    };
  }
  
  const consents = (metadata.consents as Record<string, unknown>) || {};
  
  return {
    marketing: safeBoolean(consents.marketing),
    analytics: safeBoolean(consents.analytics ?? true),
    necessary: true, // Always required
    consentVersion: safeString(consents.version) || '1.0',
    lastUpdated: safeString(consents.updatedAt) || new Date().toISOString(),
  };
}

function extractStats(metadata: Record<string, unknown> | null): UserDetailsProjectionDTO['stats'] {
  if (!metadata) {
    return {
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    };
  }
  
  const stats = (metadata.stats as Record<string, unknown>) || {};
  
  return {
    totalBookings: safeNumber(stats.totalBookings),
    activeBookings: safeNumber(stats.activeBookings),
    completedBookings: safeNumber(stats.completedBookings),
    cancelledBookings: safeNumber(stats.cancelledBookings),
  };
}

function extractSecurity(metadata: Record<string, unknown> | null): UserDetailsProjectionDTO['security'] {
  if (!metadata) {
    return {
      twoFactorEnabled: false,
      lastPasswordChange: null,
      activeSessions: 1,
    };
  }
  
  const security = (metadata.security as Record<string, unknown>) || {};
  
  return {
    twoFactorEnabled: safeBoolean(security.twoFactorEnabled),
    lastPasswordChange: safeString(security.lastPasswordChange) || null,
    activeSessions: safeNumber(security.activeSessions) || 1,
  };
}

// =============================================================================
// MAIN MAPPER FUNCTIONS
// =============================================================================

/**
 * Map a database user to a card projection DTO
 */
export function toUserCardProjection(
  user: DbUserWithOrganization,
  options: { viewerRole?: string; isOwn?: boolean } = {}
): UserCardProjectionDTO {
  const { viewerRole = 'member', isOwn = false } = options;
  const role = user.role.toLowerCase();
  const isAdmin = ['admin', 'saas_admin', 'owner'].includes(role);
  
  return {
    id: user.id,
    tenantId: user.tenantId,
    
    name: user.name,
    email: user.email,
    initials: getInitials(user.name),
    avatarUrl: '',
    
    organizationId: user.organizationId,
    organizationName: user.organizationName || null,
    hasOrganization: Boolean(user.organizationId),
    
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || `sdk.user.role.${user.role}`,
    roleColor: ROLE_COLORS[user.role] || 'neutral',
    status: user.status,
    statusLabel: STATUS_LABELS[user.status] || `sdk.user.status.${user.status}`,
    statusColor: STATUS_COLORS[user.status] || 'neutral',
    
    lastLoginAt: formatDate(user.lastLoginAt),
    lastLoginDisplay: formatRelativeDate(user.lastLoginAt),
    isOnline: isOnline(user.lastLoginAt),
    
    isActive: user.status === 'active',
    isAdmin,
    isVerified: Boolean(user.nationalId),
    
    availableActions: getAvailableActions(user, viewerRole, isOwn),
    permissions: getPermissions(user, viewerRole, isOwn),
    
    createdAt: formatDate(user.createdAt) || new Date().toISOString(),
    createdDisplay: formatRelativeDate(user.createdAt),
  };
}

/**
 * Map a database user to a details projection DTO
 */
export function toUserDetailsProjection(
  user: DbUserWithOrganization,
  options: { viewerRole?: string; isOwn?: boolean; recentActivity?: Array<{ action: string; timestamp: Date; details: string }> } = {}
): UserDetailsProjectionDTO {
  const { viewerRole = 'member', isOwn = false, recentActivity = [] } = options;
  const card = toUserCardProjection(user, { viewerRole, isOwn });
  
  const activityList = recentActivity.map((activity, i) => ({
    id: `activity-${i}`,
    action: activity.action,
    actionLabel: `sdk.activity.${activity.action}`,
    timestamp: formatDate(activity.timestamp) || new Date().toISOString(),
    timestampDisplay: formatRelativeDate(activity.timestamp),
    details: activity.details || '',
  }));
  
  return {
    ...card,
    
    nationalIdMasked: maskNationalId(user.nationalId),
    hasNationalId: Boolean(user.nationalId),
    
    preferences: extractPreferences(user.metadata),
    consents: extractConsents(user.metadata),
    stats: extractStats(user.metadata),
    security: extractSecurity(user.metadata),
    
    recentActivity: activityList,
  };
}

/**
 * Map a database user to a current user projection DTO (for /me endpoints)
 */
export function toCurrentUserProjection(
  user: DbUserWithOrganization,
  options: { featureFlags?: Record<string, boolean>; capabilities?: string[] } = {}
): CurrentUserProjectionDTO {
  const { featureFlags = {}, capabilities = [] } = options;
  const prefs = extractPreferences(user.metadata);
  
  return {
    id: user.id,
    tenantId: user.tenantId,
    
    name: user.name,
    email: user.email,
    initials: getInitials(user.name),
    avatarUrl: '',
    
    organizationId: user.organizationId,
    organizationName: user.organizationName || null,
    organizationSlug: user.organizationSlug || null,
    
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || `sdk.user.role.${user.role}`,
    
    status: user.status,
    isActive: user.status === 'active',
    isVerified: Boolean(user.nationalId),
    
    preferences: {
      language: prefs.language,
      timezone: prefs.timezone,
      theme: safeString((user.metadata as any)?.preferences?.theme) || 'auto',
    },
    
    featureFlags,
    capabilities,
  };
}

/**
 * Map user consents to a consent projection DTO (GDPR)
 */
export function toUserConsentProjection(
  user: DbUser,
  consents: DbConsent[] = []
): UserConsentProjectionDTO {
  const consentMap = new Map(consents.map(c => [c.type, c]));
  const metadata = user.metadata || {};
  const prefs = extractPreferences(metadata);
  
  const marketing = consentMap.get('marketing');
  const analytics = consentMap.get('analytics');
  
  return {
    userId: user.id,
    
    necessary: {
      granted: true,
      required: true,
      description: 'sdk.consent.necessary.description',
    },
    
    marketing: {
      granted: marketing?.granted ?? false,
      grantedAt: formatDate(marketing?.grantedAt ?? null),
      canWithdraw: true,
      description: 'sdk.consent.marketing.description',
    },
    
    analytics: {
      granted: analytics?.granted ?? true,
      grantedAt: formatDate(analytics?.grantedAt ?? null),
      canWithdraw: true,
      description: 'sdk.consent.analytics.description',
    },
    
    preferences: {
      emailNotifications: prefs.emailNotifications,
      smsNotifications: prefs.smsNotifications,
      pushNotifications: prefs.pushNotifications,
    },
    
    consentVersion: '1.0',
    lastUpdated: formatDate(user.createdAt) || new Date().toISOString(),
    
    availableActions: ['update_preferences', 'download_data', 'delete_account'],
  };
}

/**
 * Map multiple users to card projections
 */
export function toUserCardProjections(
  users: DbUserWithOrganization[],
  options: { viewerRole?: string; viewerId?: string } = {}
): UserCardProjectionDTO[] {
  return users.map(user =>
    toUserCardProjection(user, {
      viewerRole: options.viewerRole,
      isOwn: user.id === options.viewerId,
    })
  );
}
