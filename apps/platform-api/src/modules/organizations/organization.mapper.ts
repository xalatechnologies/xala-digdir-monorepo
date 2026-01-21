/**
 * Organization ACL Mapper - Anti-Corruption Layer
 *
 * Transforms raw database organization entities to screen-ready projection DTOs.
 * This is the ONLY place where organization data transformation should happen.
 * UI components receive these projection DTOs directly - no further transformation allowed.
 */

// =============================================================================
// INTERNAL DB TYPES (Not exported - internal to ACL layer)
// =============================================================================

interface DbOrganization {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  settings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DbOrganizationWithMembers extends DbOrganization {
  memberCount?: number;
  members?: DbMember[];
}

interface DbMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

interface DbBranding {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headerBackground?: string;
  customCss?: string;
}

// =============================================================================
// PROJECTION DTOs (Exported for SDK/UI consumption)
// =============================================================================

/**
 * Organization card projection for list views
 */
export interface OrganizationCardProjectionDTO {
  id: string;
  tenantId: string;
  
  // Core info
  name: string;
  slug: string;
  type: string;
  typeLabel: string;
  
  // Status
  status: string;
  statusLabel: string;
  statusColor: string;
  
  // Membership
  memberCount: number;
  memberCountLabel: string;
  
  // Display
  logoUrl: string;
  initials: string;
  primaryColor: string;
  
  // Flags
  isActive: boolean;
  hasCustomBranding: boolean;
  
  // Permissions
  availableActions: string[];
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canManageBranding: boolean;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization details projection for detail views
 */
export interface OrganizationDetailsProjectionDTO extends OrganizationCardProjectionDTO {
  // Branding
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    headerBackground: string;
    hasCustomBranding: boolean;
  };
  
  // Members (first N for preview)
  memberPreview: MemberProjectionDTO[];
  hasMoreMembers: boolean;
  
  // Settings
  settings: {
    notificationsEnabled: boolean;
    publicProfile: boolean;
    allowMemberInvites: boolean;
  };
  
  // Contact info
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
}

/**
 * Member projection for organization member lists
 */
export interface MemberProjectionDTO {
  id: string;
  name: string;
  email: string;
  
  // Role
  role: string;
  roleLabel: string;
  roleColor: string;
  
  // Status
  status: string;
  statusLabel: string;
  
  // Display
  initials: string;
  avatarUrl: string;
  
  // Flags
  isActive: boolean;
  isAdmin: boolean;
  
  // Timestamps
  createdAt: string;
  joinedDisplay: string;
}

/**
 * Branding projection for organization branding management
 */
export interface BrandingProjectionDTO {
  organizationId: string;
  organizationName: string;
  
  // Logo
  logo: string;
  logoPreviewUrl: string;
  
  // Favicon
  favicon: string;
  faviconPreviewUrl: string;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  headerBackground: string;
  
  // Preview
  previewHtml: string;
  
  // Status
  hasCustomBranding: boolean;
  lastUpdated: string;
}

// =============================================================================
// LABEL/COLOR MAPPINGS - Use i18n keys
// =============================================================================

const TYPE_LABELS: Record<string, string> = {
  organization: 'sdk.organization.type.organization',
  municipality: 'sdk.organization.type.municipality',
  company: 'sdk.organization.type.company',
  nonprofit: 'sdk.organization.type.nonprofit',
  school: 'sdk.organization.type.school',
  club: 'sdk.organization.type.club',
  other: 'sdk.organization.type.other',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'sdk.organization.status.active',
  inactive: 'sdk.organization.status.inactive',
  suspended: 'sdk.organization.status.suspended',
  pending: 'sdk.organization.status.pending',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
  pending: 'warning',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'sdk.member.role.admin',
  owner: 'sdk.member.role.owner',
  manager: 'sdk.member.role.manager',
  member: 'sdk.member.role.member',
  viewer: 'sdk.member.role.viewer',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'brand1',
  owner: 'brand2',
  manager: 'info',
  member: 'neutral',
  viewer: 'subtle',
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

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'sdk.time.today';
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

function getMemberCountLabel(count: number): string {
  if (count === 0) return 'sdk.organization.noMembers';
  if (count === 1) return 'sdk.organization.oneMember';
  return `${count} sdk.organization.members`;
}

function getAvailableActions(org: DbOrganization, userRole: string = 'member'): string[] {
  const actions: string[] = ['view'];
  const isAdmin = ['admin', 'owner', 'ADMIN', 'SAAS_ADMIN'].includes(userRole);
  
  if (isAdmin) {
    actions.push('edit', 'manage_members', 'manage_branding');
    if (org.status !== 'suspended') {
      actions.push('suspend');
    }
    if (org.status === 'suspended') {
      actions.push('activate');
    }
    actions.push('delete');
  }
  
  return actions;
}

function getPermissions(org: DbOrganization, userRole: string = 'member'): OrganizationCardProjectionDTO['permissions'] {
  const isAdmin = ['admin', 'owner', 'ADMIN', 'SAAS_ADMIN'].includes(userRole);
  const isManager = ['manager', 'MANAGER'].includes(userRole);
  
  return {
    canView: true,
    canEdit: isAdmin || isManager,
    canDelete: isAdmin,
    canManageMembers: isAdmin || isManager,
    canManageBranding: isAdmin,
  };
}

function extractBranding(settings: Record<string, unknown> | null): DbBranding {
  if (!settings) return {};
  const branding = settings.branding as Record<string, unknown> | undefined;
  if (!branding) return {};
  
  return {
    logo: safeString(branding.logo),
    favicon: safeString(branding.favicon),
    primaryColor: safeString(branding.primaryColor),
    secondaryColor: safeString(branding.secondaryColor),
    headerBackground: safeString(branding.headerBackground),
    customCss: safeString(branding.customCss),
  };
}

function extractSettings(settings: Record<string, unknown> | null): OrganizationDetailsProjectionDTO['settings'] {
  if (!settings) {
    return {
      notificationsEnabled: true,
      publicProfile: false,
      allowMemberInvites: true,
    };
  }
  
  return {
    notificationsEnabled: safeBoolean(settings.notificationsEnabled),
    publicProfile: safeBoolean(settings.publicProfile),
    allowMemberInvites: safeBoolean(settings.allowMemberInvites),
  };
}

function extractContact(settings: Record<string, unknown> | null): { email: string; phone: string; website: string; address: string } {
  if (!settings) {
    return { email: '', phone: '', website: '', address: '' };
  }
  
  const contact = (settings.contact as Record<string, unknown>) || {};
  
  return {
    email: safeString(contact.email) || safeString(settings.contactEmail),
    phone: safeString(contact.phone) || safeString(settings.contactPhone),
    website: safeString(contact.website) || safeString(settings.website),
    address: safeString(contact.address) || safeString(settings.address),
  };
}

// =============================================================================
// MAIN MAPPER FUNCTIONS
// =============================================================================

/**
 * Map a database organization to a card projection DTO
 */
export function toOrganizationCardProjection(
  org: DbOrganizationWithMembers,
  options: { userRole?: string } = {}
): OrganizationCardProjectionDTO {
  const { userRole = 'member' } = options;
  const branding = extractBranding(org.settings);
  const memberCount = org.memberCount || 0;
  
  return {
    id: org.id,
    tenantId: org.tenantId,
    
    name: org.name,
    slug: org.slug,
    type: org.type,
    typeLabel: TYPE_LABELS[org.type] || `sdk.organization.type.${org.type}`,
    
    status: org.status,
    statusLabel: STATUS_LABELS[org.status] || `sdk.organization.status.${org.status}`,
    statusColor: STATUS_COLORS[org.status] || 'neutral',
    
    memberCount,
    memberCountLabel: getMemberCountLabel(memberCount),
    
    logoUrl: branding.logo || '',
    initials: getInitials(org.name),
    primaryColor: branding.primaryColor || '#0062BA',
    
    isActive: org.status === 'active',
    hasCustomBranding: Boolean(branding.logo || branding.primaryColor),
    
    availableActions: getAvailableActions(org, userRole),
    permissions: getPermissions(org, userRole),
    
    createdAt: formatDate(org.createdAt),
    updatedAt: formatDate(org.updatedAt),
  };
}

/**
 * Map a database organization to a details projection DTO
 */
export function toOrganizationDetailsProjection(
  org: DbOrganizationWithMembers,
  options: { userRole?: string; memberPreviewLimit?: number } = {}
): OrganizationDetailsProjectionDTO {
  const { userRole = 'member', memberPreviewLimit = 5 } = options;
  const card = toOrganizationCardProjection(org, { userRole });
  const branding = extractBranding(org.settings);
  const settings = extractSettings(org.settings);
  const contact = extractContact(org.settings);
  
  const members = org.members || [];
  const memberPreview = members.slice(0, memberPreviewLimit).map(toMemberProjection);
  
  return {
    ...card,
    
    branding: {
      logo: branding.logo || '',
      favicon: branding.favicon || '',
      primaryColor: branding.primaryColor || '#0062BA',
      secondaryColor: branding.secondaryColor || '#1E2B3C',
      headerBackground: branding.headerBackground || '',
      hasCustomBranding: Boolean(branding.logo || branding.primaryColor),
    },
    
    memberPreview,
    hasMoreMembers: members.length > memberPreviewLimit,
    
    settings,
    
    contactEmail: contact.email,
    contactPhone: contact.phone,
    website: contact.website,
    address: contact.address,
  };
}

/**
 * Map a database member to a member projection DTO
 */
export function toMemberProjection(member: DbMember): MemberProjectionDTO {
  const isAdmin = ['admin', 'owner'].includes(member.role.toLowerCase());
  
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    
    role: member.role,
    roleLabel: ROLE_LABELS[member.role.toLowerCase()] || `sdk.member.role.${member.role}`,
    roleColor: ROLE_COLORS[member.role.toLowerCase()] || 'neutral',
    
    status: member.status,
    statusLabel: STATUS_LABELS[member.status] || `sdk.member.status.${member.status}`,
    
    initials: getInitials(member.name),
    avatarUrl: '',
    
    isActive: member.status === 'active',
    isAdmin,
    
    createdAt: formatDate(member.createdAt),
    joinedDisplay: formatRelativeDate(member.createdAt),
  };
}

/**
 * Map organization branding to a branding projection DTO
 */
export function toBrandingProjection(
  org: DbOrganization
): BrandingProjectionDTO {
  const branding = extractBranding(org.settings);
  const hasCustomBranding = Boolean(branding.logo || branding.primaryColor);
  
  return {
    organizationId: org.id,
    organizationName: org.name,
    
    logo: branding.logo || '',
    logoPreviewUrl: branding.logo || '',
    
    favicon: branding.favicon || '',
    faviconPreviewUrl: branding.favicon || '',
    
    primaryColor: branding.primaryColor || '#0062BA',
    secondaryColor: branding.secondaryColor || '#1E2B3C',
    headerBackground: branding.headerBackground || '',
    
    previewHtml: '',
    
    hasCustomBranding,
    lastUpdated: formatDate(org.updatedAt),
  };
}

/**
 * Map multiple organizations to card projections
 */
export function toOrganizationCardProjections(
  orgs: DbOrganizationWithMembers[],
  options: { userRole?: string } = {}
): OrganizationCardProjectionDTO[] {
  return orgs.map(org => toOrganizationCardProjection(org, options));
}

/**
 * Map multiple members to member projections
 */
export function toMemberProjections(members: DbMember[]): MemberProjectionDTO[] {
  return members.map(toMemberProjection);
}
