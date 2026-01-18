/**
 * CANONICAL PERMISSION CATALOG
 * 
 * Single source of truth for all permissions in the platform.
 * Used by:
 * - Database seed (platform.permissions table)
 * - API authorization guards
 * - Frontend permission checks
 * - Role assignment UI
 * 
 * Pattern: <resource>:<action>
 * Scopes: Global, Tenant, Organization, Self
 */

export const PERMISSIONS = {
  // ========================================================================
  // RENTAL OBJECTS
  // ========================================================================
  RENTAL_OBJECTS_READ: 'rental_objects:read',
  RENTAL_OBJECTS_CREATE: 'rental_objects:create',
  RENTAL_OBJECTS_UPDATE: 'rental_objects:update',
  RENTAL_OBJECTS_DELETE: 'rental_objects:delete',
  RENTAL_OBJECTS_PUBLISH: 'rental_objects:publish',
  RENTAL_OBJECTS_ARCHIVE: 'rental_objects:archive',
  
  // Categories
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_MANAGE: 'categories:manage',
  
  // Metadata
  METADATA_READ: 'metadata:read',
  METADATA_MANAGE: 'metadata:manage',
  
  // Amenities
  AMENITIES_READ: 'amenities:read',
  AMENITIES_MANAGE: 'amenities:manage',
  
  // Add-ons
  ADDONS_READ: 'addons:read',
  ADDONS_MANAGE: 'addons:manage',
  
  // ========================================================================
  // PRICING
  // ========================================================================
  PRICING_READ: 'pricing:read',
  PRICING_MANAGE: 'pricing:manage',
  PRICING_QUOTE: 'pricing:quote',
  PRICING_GROUPS_MANAGE: 'pricing_groups:manage',
  
  // ========================================================================
  // ADMIN NAVIGATION (Backoffice Menu Items)
  // ========================================================================
  ADMIN_DASHBOARD_VIEW: 'admin:dashboard:view',
  ADMIN_ADMINISTRASJON_VIEW: 'admin:administrasjon:view',
  ADMIN_UTLEIEOBJEKTER_VIEW: 'admin:utleieobjekter:view',
  ADMIN_PRISGRUPPER_VIEW: 'admin:prisgrupper:view',
  ADMIN_BOOKINGER_VIEW: 'admin:bookinger:view',
  ADMIN_KALENDER_VIEW: 'admin:kalender:view',
  ADMIN_SESONGLEIE_VIEW: 'admin:sesongleie:view',
  ADMIN_BRUKERE_VIEW: 'admin:brukere:view',
  ADMIN_MELDINGER_VIEW: 'admin:meldinger:view',
  ADMIN_MELDINGSMALER_VIEW: 'admin:meldingsmaler:view',
  ADMIN_SYSTEM_VIEW: 'admin:system:view',
  ADMIN_OKONOMI_VIEW: 'admin:okonomi:view',
  ADMIN_RAPPORTER_VIEW: 'admin:rapporter:view',
  ADMIN_AUDITLOG_VIEW: 'admin:auditlog:view',
  ADMIN_ANMELDELSER_VIEW: 'admin:anmeldelser:view',
  ADMIN_INNSTILLINGER_VIEW: 'admin:innstillinger:view',
  ADMIN_HJELP_VIEW: 'admin:hjelp:view',
  
  // ========================================================================
  // BOOKINGS
  // ========================================================================
  BOOKINGS_READ: 'bookings:read',
  BOOKINGS_READ_ALL: 'bookings:read_all', // Read all tenant bookings
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_UPDATE: 'bookings:update',
  BOOKINGS_CANCEL: 'bookings:cancel',
  BOOKINGS_APPROVE: 'bookings:approve',
  BOOKINGS_REJECT: 'bookings:reject',
  
  // Time blocks (admin only)
  BLOCKS_READ: 'blocks:read',
  BLOCKS_CREATE: 'blocks:create',
  BLOCKS_DELETE: 'blocks:delete',
  
  // ========================================================================
  // PAYMENTS
  // ========================================================================
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_REFUND: 'payments:refund',
  PAYMENTS_RECONCILE: 'payments:reconcile',
  INVOICES_READ: 'invoices:read',
  INVOICES_DOWNLOAD: 'invoices:download',
  
  // ========================================================================
  // CASES (SSA-L Workflow)
  // ========================================================================
  CASES_READ: 'cases:read',
  CASES_CREATE: 'cases:create',
  CASES_ASSIGN: 'cases:assign',
  CASES_RESOLVE: 'cases:resolve',
  CASES_ESCALATE: 'cases:escalate',
  
  // ========================================================================
  // TEMPLATES & DOCUMENTS
  // ========================================================================
  TEMPLATES_READ: 'templates:read',
  TEMPLATES_MANAGE: 'templates:manage',
  DOCUMENTS_GENERATE: 'documents:generate',
  
  // ========================================================================
  // CONVERSATIONS & MESSAGING
  // ========================================================================
  CONVERSATIONS_READ: 'conversations:read',
  CONVERSATIONS_WRITE: 'conversations:write',
  CONVERSATIONS_MODERATE: 'conversations:moderate',
  MESSAGES_READ: 'messages:read',
  MESSAGES_WRITE: 'messages:write',
  
  // ========================================================================
  // NOTIFICATIONS
  // ========================================================================
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_DISPATCH: 'notifications:dispatch',
  NOTIFICATION_TEMPLATES_MANAGE: 'notification_templates:manage',
  
  // ========================================================================
  // SUPPORT & HELP
  // ========================================================================
  SUPPORT_TICKETS_READ: 'support_tickets:read',
  SUPPORT_TICKETS_CREATE: 'support_tickets:create',
  SUPPORT_TICKETS_MANAGE: 'support_tickets:manage',
  HELP_ARTICLES_READ: 'help_articles:read',
  HELP_ARTICLES_MANAGE: 'help_articles:manage',
  
  // ========================================================================
  // RAG & KNOWLEDGE BASE
  // ========================================================================
  KB_QUERY: 'kb:query',
  KB_INGEST: 'kb:ingest',
  KB_MANAGE_SOURCES: 'kb:manage_sources',
  
  // ========================================================================
  // SEO
  // ========================================================================
  SEO_READ: 'seo:read',
  SEO_MANAGE: 'seo:manage',
  STATIC_PAGES_MANAGE: 'static_pages:manage',
  REDIRECTS_MANAGE: 'redirects:manage',
  
  // ========================================================================
  // GEO
  // ========================================================================
  GEO_AREAS_READ: 'geo_areas:read',
  GEO_AREAS_MANAGE: 'geo_areas:manage',
  
  // ========================================================================
  // BILLING & ENTITLEMENTS
  // ========================================================================
  BILLING_READ: 'billing:read',
  BILLING_MANAGE: 'billing:manage',
  MODULES_READ: 'modules:read',
  PLANS_READ: 'plans:read',
  PLANS_MANAGE: 'plans:manage',
  SUBSCRIPTIONS_READ: 'subscriptions:read',
  SUBSCRIPTIONS_MANAGE: 'subscriptions:manage',
  ENTITLEMENTS_READ: 'entitlements:read',
  ENTITLEMENTS_MANAGE: 'entitlements:manage',
  
  // ========================================================================
  // USERS & ORGANIZATIONS
  // ========================================================================
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_IMPERSONATE: 'users:impersonate',
  
  ORGANIZATIONS_READ: 'organizations:read',
  ORGANIZATIONS_MANAGE: 'organizations:manage',
  
  // ========================================================================
  // ROLES & PERMISSIONS
  // ========================================================================
  ROLES_READ: 'roles:read',
  ROLES_MANAGE: 'roles:manage',
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_ASSIGN: 'permissions:assign',
  
  // ========================================================================
  // AUDIT & COMPLIANCE
  // ========================================================================
  AUDIT_LOGS_READ: 'audit_logs:read',
  AUDIT_LOGS_EXPORT: 'audit_logs:export',
  
  COMPLIANCE_DSAR_MANAGE: 'compliance:dsar_manage',
  COMPLIANCE_RETENTION_MANAGE: 'compliance:retention_manage',
  COMPLIANCE_DPIA_MANAGE: 'compliance:dpia_manage',
  
  DATA_ACCESS_EVENTS_READ: 'data_access_events:read',
  
  // ========================================================================
  // MONITORING & INCIDENTS
  // ========================================================================
  MONITORING_READ: 'monitoring:read',
  INCIDENTS_READ: 'incidents:read',
  INCIDENTS_MANAGE: 'incidents:manage',
  ERROR_EVENTS_READ: 'error_events:read',
  PERFORMANCE_METRICS_READ: 'performance_metrics:read',
  
  // ========================================================================
  // SECURITY
  // ========================================================================
  API_KEYS_READ: 'api_keys:read',
  API_KEYS_MANAGE: 'api_keys:manage',
  SERVICE_ACCOUNTS_MANAGE: 'service_accounts:manage',
  IP_ALLOWLISTS_MANAGE: 'ip_allowlists:manage',
  MFA_MANAGE: 'mfa:manage',
  SECURITY_EVENTS_READ: 'security_events:read',
  
  // ========================================================================
  // MODERATION
  // ========================================================================
  MODERATION_FLAGS_READ: 'moderation_flags:read',
  MODERATION_FLAGS_REVIEW: 'moderation_flags:review',
  USER_BLOCKS_MANAGE: 'user_blocks:manage',
  RATE_LIMITS_MANAGE: 'rate_limits:manage',
  
  // ========================================================================
  // FEATURE FLAGS & CONFIG
  // ========================================================================
  FEATURE_FLAGS_READ: 'feature_flags:read',
  FEATURE_FLAGS_MANAGE: 'feature_flags:manage',
  RUNTIME_CONFIG_MANAGE: 'runtime_config:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role Definitions (Default Mappings)
 */
export const ROLE_PERMISSIONS = {
  // ========================================================================
  // SUPER_ADMIN (Platform Owner)
  // ========================================================================
  SUPER_ADMIN: Object.values(PERMISSIONS), // All permissions
  
  // ========================================================================
  // TENANT_ADMIN (Municipality Admin)
  // ========================================================================
  TENANT_ADMIN: [
    // Rental Objects - Full control
    PERMISSIONS.RENTAL_OBJECTS_READ,
    PERMISSIONS.RENTAL_OBJECTS_CREATE,
    PERMISSIONS.RENTAL_OBJECTS_UPDATE,
    PERMISSIONS.RENTAL_OBJECTS_DELETE,
    PERMISSIONS.RENTAL_OBJECTS_PUBLISH,
    PERMISSIONS.RENTAL_OBJECTS_ARCHIVE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.METADATA_MANAGE,
    PERMISSIONS.AMENITIES_MANAGE,
    PERMISSIONS.ADDONS_MANAGE,
    
    // Pricing - Full control
    PERMISSIONS.PRICING_READ,
    PERMISSIONS.PRICING_MANAGE,
    PERMISSIONS.PRICING_QUOTE,
    PERMISSIONS.PRICING_GROUPS_MANAGE,
    
    // Bookings - Full control
    PERMISSIONS.BOOKINGS_READ_ALL,
    PERMISSIONS.BOOKINGS_APPROVE,
    PERMISSIONS.BOOKINGS_REJECT,
    PERMISSIONS.BLOCKS_CREATE,
    PERMISSIONS.BLOCKS_DELETE,
    
    // Cases - Full control
    PERMISSIONS.CASES_READ,
    PERMISSIONS.CASES_ASSIGN,
    PERMISSIONS.CASES_RESOLVE,
    PERMISSIONS.CASES_ESCALATE,
    
    // Templates
    PERMISSIONS.TEMPLATES_MANAGE,
    PERMISSIONS.DOCUMENTS_GENERATE,
    
    // Conversations
    PERMISSIONS.CONVERSATIONS_READ,
    PERMISSIONS.CONVERSATIONS_MODERATE,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS_DISPATCH,
    PERMISSIONS.NOTIFICATION_TEMPLATES_MANAGE,
    
    // Support
    PERMISSIONS.SUPPORT_TICKETS_MANAGE,
    PERMISSIONS.HELP_ARTICLES_MANAGE,
    
    // RAG
    PERMISSIONS.KB_INGEST,
    PERMISSIONS.KB_MANAGE_SOURCES,
    
    // SEO
    PERMISSIONS.SEO_MANAGE,
    PERMISSIONS.STATIC_PAGES_MANAGE,
    PERMISSIONS.REDIRECTS_MANAGE,
    
    // Billing
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.SUBSCRIPTIONS_READ,
    PERMISSIONS.ENTITLEMENTS_READ,
    
    // Users
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ORGANIZATIONS_MANAGE,
    
    // Audit
    PERMISSIONS.AUDIT_LOGS_READ,
    PERMISSIONS.MONITORING_READ,
    
    // Moderation
    PERMISSIONS.MODERATION_FLAGS_REVIEW,
    
    // Admin Navigation (Backoffice Menu)
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_ADMINISTRASJON_VIEW,
    PERMISSIONS.ADMIN_UTLEIEOBJEKTER_VIEW,
    PERMISSIONS.ADMIN_PRISGRUPPER_VIEW,
    PERMISSIONS.ADMIN_BOOKINGER_VIEW,
    PERMISSIONS.ADMIN_KALENDER_VIEW,
    PERMISSIONS.ADMIN_SESONGLEIE_VIEW,
    PERMISSIONS.ADMIN_BRUKERE_VIEW,
    PERMISSIONS.ADMIN_MELDINGER_VIEW,
    PERMISSIONS.ADMIN_MELDINGSMALER_VIEW,
    PERMISSIONS.ADMIN_SYSTEM_VIEW,
    PERMISSIONS.ADMIN_OKONOMI_VIEW,
    PERMISSIONS.ADMIN_RAPPORTER_VIEW,
    PERMISSIONS.ADMIN_AUDITLOG_VIEW,
    PERMISSIONS.ADMIN_ANMELDELSER_VIEW,
    PERMISSIONS.ADMIN_INNSTILLINGER_VIEW,
    PERMISSIONS.ADMIN_HJELP_VIEW,
    
    // Feature Flags
    PERMISSIONS.FEATURE_FLAGS_READ,
  ],
  
  // ========================================================================
  // SAKSBEHANDLER (Case Handler)
  // ========================================================================
  SAKSBEHANDLER: [
    // Rental Objects - Read only
    PERMISSIONS.RENTAL_OBJECTS_READ,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.METADATA_READ,
    PERMISSIONS.AMENITIES_READ,
    PERMISSIONS.ADDONS_READ,
    
    // Pricing - Read + Quote
    PERMISSIONS.PRICING_READ,
    PERMISSIONS.PRICING_QUOTE,
    
    // Bookings - Full control
    PERMISSIONS.BOOKINGS_READ_ALL,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_APPROVE,
    PERMISSIONS.BOOKINGS_REJECT,
    
    // Cases - Full control
    PERMISSIONS.CASES_READ,
    PERMISSIONS.CASES_CREATE,
    PERMISSIONS.CASES_ASSIGN,
    PERMISSIONS.CASES_RESOLVE,
    
    // Documents
    PERMISSIONS.DOCUMENTS_GENERATE,
    
    // Conversations - Full
    PERMISSIONS.CONVERSATIONS_READ,
    PERMISSIONS.CONVERSATIONS_WRITE,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_WRITE,
    
    // Notifications - Read
    PERMISSIONS.NOTIFICATIONS_READ,
    
    // Support
    PERMISSIONS.SUPPORT_TICKETS_READ,
    PERMISSIONS.SUPPORT_TICKETS_MANAGE,
    PERMISSIONS.HELP_ARTICLES_READ,
    
    // RAG
    PERMISSIONS.KB_QUERY,
    
    // Audit - own actions
    PERMISSIONS.AUDIT_LOGS_READ,
  ],
  
  // ========================================================================
  // CITIZEN (Public User)
  // ========================================================================
  CITIZEN: [
    // Rental Objects - Read only
    PERMISSIONS.RENTAL_OBJECTS_READ,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.AMENITIES_READ,
    PERMISSIONS.ADDONS_READ,
    
    // Pricing - Read + Quote
    PERMISSIONS.PRICING_READ,
    PERMISSIONS.PRICING_QUOTE,
    
    // Bookings - Own only
    PERMISSIONS.BOOKINGS_READ, // Self-scoped
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_CANCEL, // Own bookings only
    
    // Conversations - Own only
    PERMISSIONS.CONVERSATIONS_READ, // Self-scoped
    PERMISSIONS.CONVERSATIONS_WRITE,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_WRITE,
    
    // Notifications - Own
    PERMISSIONS.NOTIFICATIONS_READ,
    
    // Support
    PERMISSIONS.SUPPORT_TICKETS_CREATE,
    PERMISSIONS.HELP_ARTICLES_READ,
    
    // RAG
    PERMISSIONS.KB_QUERY,
  ],
  
  // ========================================================================
  // ORG_ADMIN (Organization Admin - Company/Club)
  // ========================================================================
  ORG_ADMIN: [
    // Rental Objects - Read
    PERMISSIONS.RENTAL_OBJECTS_READ,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.AMENITIES_READ,
    PERMISSIONS.ADDONS_READ,
    
    // Pricing - Read + Quote
    PERMISSIONS.PRICING_READ,
    PERMISSIONS.PRICING_QUOTE,
    
    // Bookings - Org scope
    PERMISSIONS.BOOKINGS_READ, // Org-scoped
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_CANCEL,
    
    // Conversations - Org scope
    PERMISSIONS.CONVERSATIONS_READ,
    PERMISSIONS.CONVERSATIONS_WRITE,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_WRITE,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS_READ,
    
    // Support
    PERMISSIONS.SUPPORT_TICKETS_CREATE,
    PERMISSIONS.HELP_ARTICLES_READ,
    
    // RAG
    PERMISSIONS.KB_QUERY,
    
    // Users - Org members only
    PERMISSIONS.USERS_READ, // Org-scoped
  ],
} as const;

export type RoleName = keyof typeof ROLE_PERMISSIONS;

/**
 * Permission Categories (For UI Grouping)
 */
export const PERMISSION_CATEGORIES = {
  RENTAL_MANAGEMENT: 'Rental Management',
  BOOKING_MANAGEMENT: 'Booking Management',
  PRICING: 'Pricing & Quotes',
  CASE_MANAGEMENT: 'Case Management',
  COMMUNICATIONS: 'Communications',
  CONTENT: 'Content & SEO',
  BILLING: 'Billing & Subscriptions',
  USER_MANAGEMENT: 'User Management',
  SECURITY: 'Security & Access',
  COMPLIANCE: 'Compliance & Audit',
  MONITORING: 'Monitoring & Incidents',
  CONFIGURATION: 'Configuration',
} as const;

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: RoleName): readonly Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role has permission
 */
export function roleHasPermission(role: RoleName, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Get permission display name
 */
export function getPermissionDisplayName(permission: Permission): string {
  return permission
    .split(':')
    .map(part => part.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' '))
    .join(': ');
}
