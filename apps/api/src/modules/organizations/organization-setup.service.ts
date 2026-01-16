/**
 * Organization Setup Service
 * Handles organization initialization with default roles, settings, and configurations
 */
import { container } from '../../core/container';
import { organizations } from '../../database/schema/index';
import { eq } from 'drizzle-orm';
import { getAuditService } from '../../core/audit/audit.service';

/**
 * Default role definitions for new organizations
 */
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

/**
 * Organization setup configuration
 */
export interface OrganizationSetupConfig {
  organizationId: string;
  tenantId: string;
  actorType?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  customRoles?: RoleDefinition[];
}

/**
 * Default role templates based on actor type
 */
const DEFAULT_ROLES: Record<string, RoleDefinition[]> = {
  municipality: [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all organization features and settings',
      permissions: [
        'organization:manage',
        'users:manage',
        'listings:manage',
        'bookings:manage',
        'settings:manage',
        'reports:view',
        'audit:view',
      ],
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Manage listings and bookings, view reports',
      permissions: [
        'listings:manage',
        'bookings:manage',
        'reports:view',
      ],
    },
    {
      id: 'member',
      name: 'Member',
      description: 'Basic member with view and booking permissions',
      permissions: [
        'listings:view',
        'bookings:create',
        'bookings:view',
      ],
      isDefault: true,
    },
  ],
  organization: [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to organization features',
      permissions: [
        'organization:manage',
        'users:manage',
        'bookings:manage',
        'settings:manage',
      ],
    },
    {
      id: 'member',
      name: 'Member',
      description: 'Standard member with booking access',
      permissions: [
        'listings:view',
        'bookings:create',
        'bookings:view',
      ],
      isDefault: true,
    },
  ],
};

/**
 * OrganizationSetupService
 *
 * Provides methods to initialize new organizations with:
 * - Default role configurations based on actor type
 * - Default settings and branding
 * - Audit logging for setup activities
 */
export class OrganizationSetupService {
  private db: any;
  private auditService: ReturnType<typeof getAuditService>;

  constructor() {
    this.db = container.resolve<any>('Database');
    this.auditService = getAuditService();
  }

  /**
   * Get default roles for an actor type
   */
  getDefaultRoles(actorType: string = 'organization'): RoleDefinition[] {
    return DEFAULT_ROLES[actorType] || DEFAULT_ROLES.organization;
  }

  /**
   * Get default role (the role assigned to new members)
   */
  getDefaultRoleId(actorType: string = 'organization'): string {
    const roles = this.getDefaultRoles(actorType);
    const defaultRole = roles.find((r) => r.isDefault);
    return defaultRole?.id || 'member';
  }

  /**
   * Initialize organization with default settings
   * Called after organization creation to set up roles and configuration
   */
  async initializeOrganization(config: OrganizationSetupConfig): Promise<void> {
    const { organizationId, tenantId, actorType = 'organization', branding, customRoles } = config;

    // Determine roles to use (custom or default)
    const roles = customRoles || this.getDefaultRoles(actorType);

    // Build settings object
    const settings = {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isDefault: role.isDefault || false,
      })),
      branding: branding || {
        logo: null,
        primaryColor: '#0062ad',
        secondaryColor: '#1e2b3c',
      },
      features: {
        bookings: true,
        seasonalLeases: actorType === 'municipality',
        conversations: true,
        reports: true,
      },
      notifications: {
        email: true,
        inApp: true,
      },
    };

    // Update organization with settings
    await this.db
      .update(organizations)
      .set({
        settings,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    // Log audit event
    await this.auditService.log({
      tenantId,
      action: 'initialize',
      resource: 'organization',
      resourceId: organizationId,
      severity: 'info',
      metadata: {
        actorType,
        rolesCount: roles.length,
        defaultRole: this.getDefaultRoleId(actorType),
        features: Object.keys(settings.features),
      },
    });
  }

  /**
   * Update organization branding settings
   */
  async updateBranding(
    organizationId: string,
    tenantId: string,
    branding: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    }
  ): Promise<void> {
    // Get current organization
    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!org) {
      throw new Error('Organization not found');
    }

    // Merge branding settings
    const currentSettings = (org.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      branding: {
        ...(currentSettings.branding || {}),
        ...branding,
      },
    };

    // Update organization
    await this.db
      .update(organizations)
      .set({
        settings: updatedSettings,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    // Log audit event
    await this.auditService.log({
      tenantId,
      action: 'update',
      resource: 'organization',
      resourceId: organizationId,
      severity: 'info',
      metadata: {
        changes: ['branding'],
        branding,
      },
    });
  }

  /**
   * Get organization branding settings
   */
  async getBranding(organizationId: string): Promise<{
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  }> {
    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!org) {
      throw new Error('Organization not found');
    }

    const settings = (org.settings as any) || {};
    const branding = settings.branding || {};

    return {
      logo: branding.logo || null,
      primaryColor: branding.primaryColor || '#0062ad',
      secondaryColor: branding.secondaryColor || '#1e2b3c',
    };
  }

  /**
   * Check if a role is valid for an organization
   */
  async validateRole(organizationId: string, roleId: string): Promise<boolean> {
    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!org) {
      return false;
    }

    const settings = (org.settings as any) || {};
    const roles = settings.roles || [];

    return roles.some((r: RoleDefinition) => r.id === roleId);
  }

  /**
   * Get all roles for an organization
   */
  async getOrganizationRoles(organizationId: string): Promise<RoleDefinition[]> {
    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!org) {
      return [];
    }

    const settings = (org.settings as any) || {};
    return settings.roles || [];
  }
}

// Singleton instance
let setupServiceInstance: OrganizationSetupService | null = null;

export function getOrganizationSetupService(): OrganizationSetupService {
  if (!setupServiceInstance) {
    setupServiceInstance = new OrganizationSetupService();
  }
  return setupServiceInstance;
}

// Reset singleton for testing
export function resetOrganizationSetupService(): void {
  setupServiceInstance = null;
}
