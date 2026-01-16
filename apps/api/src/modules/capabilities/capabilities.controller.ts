/**
 * App-Specific Capabilities Controller
 *
 * Provides server-side capability endpoints per app context.
 * Replaces client-side capability mapping with server-authoritative source.
 *
 * Endpoints:
 * - GET /api/web/me/capabilities - Public website capabilities
 * - GET /api/minside/me/capabilities - User portal capabilities
 * - GET /api/backoffice/me/capabilities - Admin portal capabilities
 *
 * Benefits:
 * - Single source of truth for RBAC
 * - UI is capability-driven, not role-driven
 * - Feature flags included in response
 * - No business logic in frontend
 */

import { Controller, Get } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../core/container';

// =============================================================================
// Types
// =============================================================================

interface CapabilitiesRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  userRole?: string;
}

/**
 * Capability response structure
 */
export interface CapabilitiesResponse {
  data: {
    role: string;
    capabilities: string[];
    featureFlags: Record<string, boolean>;
    uiHints?: {
      showAdminNav?: boolean;
      showReports?: boolean;
      showAudit?: boolean;
      showIntegrations?: boolean;
      showSettings?: boolean;
    };
    organizationScopes?: string[];
  };
}

// =============================================================================
// Capability Definitions
// =============================================================================

/**
 * Web app capabilities (public-facing)
 */
const WEB_CAPABILITIES = {
  anonymous: [
    'CAP_LISTING_VIEW',
    'CAP_LISTING_SEARCH',
    'CAP_CATEGORY_VIEW',
  ],
  user: [
    'CAP_LISTING_VIEW',
    'CAP_LISTING_SEARCH',
    'CAP_CATEGORY_VIEW',
    'CAP_BOOKING_CREATE',
    'CAP_BOOKING_VIEW_OWN',
    'CAP_PROFILE_VIEW',
    'CAP_REVIEW_CREATE',
  ],
};

/**
 * Minside (user portal) capabilities
 */
const MINSIDE_CAPABILITIES = {
  user: [
    'CAP_DASHBOARD_VIEW',
    'CAP_BOOKING_VIEW',
    'CAP_BOOKING_CANCEL',
    'CAP_BOOKING_MODIFY',
    'CAP_PROFILE_VIEW',
    'CAP_PROFILE_EDIT',
    'CAP_NOTIFICATIONS_VIEW',
    'CAP_NOTIFICATIONS_MANAGE',
    'CAP_MESSAGES_VIEW',
    'CAP_MESSAGES_CREATE',
    'CAP_GDPR_DATA_REQUEST',
    'CAP_GDPR_DELETE_REQUEST',
  ],
};

/**
 * Backoffice (admin portal) capabilities
 */
const BACKOFFICE_CAPABILITIES = {
  super_admin: [
    'CAP_DASHBOARD_VIEW',
    'CAP_RENTAL_OBJECT_VIEW',
    'CAP_RENTAL_OBJECT_CREATE',
    'CAP_RENTAL_OBJECT_EDIT',
    'CAP_RENTAL_OBJECT_DELETE',
    'CAP_RENTAL_OBJECT_PUBLISH',
    'CAP_BOOKING_VIEW',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_REJECT',
    'CAP_BOOKING_CANCEL',
    'CAP_BOOKING_MANAGE',
    'CAP_USER_VIEW',
    'CAP_USER_CREATE',
    'CAP_USER_EDIT',
    'CAP_USER_DEACTIVATE',
    'CAP_ORG_VIEW',
    'CAP_ORG_EDIT',
    'CAP_REPORTS_VIEW',
    'CAP_REPORTS_EXPORT',
    'CAP_SETTINGS_VIEW',
    'CAP_SETTINGS_EDIT',
    'CAP_AUDIT_VIEW',
    'CAP_INTEGRATIONS_VIEW',
    'CAP_INTEGRATIONS_MANAGE',
    'CAP_SYSTEM_CONFIG',
  ],
  admin: [
    'CAP_DASHBOARD_VIEW',
    'CAP_RENTAL_OBJECT_VIEW',
    'CAP_RENTAL_OBJECT_CREATE',
    'CAP_RENTAL_OBJECT_EDIT',
    'CAP_RENTAL_OBJECT_DELETE',
    'CAP_RENTAL_OBJECT_PUBLISH',
    'CAP_BOOKING_VIEW',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_REJECT',
    'CAP_BOOKING_CANCEL',
    'CAP_BOOKING_MANAGE',
    'CAP_USER_VIEW',
    'CAP_USER_CREATE',
    'CAP_USER_EDIT',
    'CAP_USER_DEACTIVATE',
    'CAP_ORG_VIEW',
    'CAP_ORG_EDIT',
    'CAP_REPORTS_VIEW',
    'CAP_REPORTS_EXPORT',
    'CAP_SETTINGS_VIEW',
    'CAP_SETTINGS_EDIT',
    'CAP_AUDIT_VIEW',
  ],
  saksbehandler: [
    'CAP_DASHBOARD_VIEW',
    'CAP_RENTAL_OBJECT_VIEW',
    'CAP_RENTAL_OBJECT_CREATE',
    'CAP_RENTAL_OBJECT_EDIT',
    'CAP_RENTAL_OBJECT_PUBLISH',
    'CAP_BOOKING_VIEW',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_REJECT',
    'CAP_BOOKING_MANAGE',
    'CAP_REPORTS_VIEW',
  ],
  case_handler: [
    'CAP_DASHBOARD_VIEW',
    'CAP_RENTAL_OBJECT_VIEW',
    'CAP_BOOKING_VIEW',
    'CAP_BOOKING_APPROVE',
    'CAP_BOOKING_REJECT',
    'CAP_REPORTS_VIEW',
  ],
};

// =============================================================================
// Controller
// =============================================================================

@Controller('/api')
export class CapabilitiesController {
  /**
   * GET /api/web/me/capabilities
   *
   * Returns capabilities for the public web app.
   * Anonymous users get limited capabilities.
   */
  @Get('/web/me/capabilities')
  async getWebCapabilities(
    request: CapabilitiesRequest,
    reply: FastifyReply
  ): Promise<CapabilitiesResponse> {
    const isAuthenticated = Boolean(request.userId);
    const role = isAuthenticated ? 'user' : 'anonymous';
    const capabilities =
      WEB_CAPABILITIES[role as keyof typeof WEB_CAPABILITIES] ||
      WEB_CAPABILITIES.anonymous;

    return {
      data: {
        role,
        capabilities,
        featureFlags: await this.getTenantFeatures(request.tenantId),
      },
    };
  }

  /**
   * GET /api/minside/me/capabilities
   *
   * Returns capabilities for the user portal (minside).
   * Requires authentication.
   */
  @Get('/minside/me/capabilities')
  async getMinsideCapabilities(
    request: CapabilitiesRequest,
    reply: FastifyReply
  ): Promise<CapabilitiesResponse | void> {
    if (!request.userId) {
      reply.status(401);
      return reply.send({
        type: '/errors/unauthorized',
        title: 'Authentication Required',
        status: 401,
        detail: 'You must be logged in to access minside capabilities',
      });
    }

    return {
      data: {
        role: 'user',
        capabilities: MINSIDE_CAPABILITIES.user,
        featureFlags: await this.getTenantFeatures(request.tenantId),
        uiHints: {
          showSettings: true,
        },
      },
    };
  }

  /**
   * GET /api/backoffice/me/capabilities
   *
   * Returns capabilities for the admin portal (backoffice).
   * Requires authentication and returns role-specific capabilities.
   */
  @Get('/backoffice/me/capabilities')
  async getBackofficeCapabilities(
    request: CapabilitiesRequest,
    reply: FastifyReply
  ): Promise<CapabilitiesResponse | void> {
    if (!request.userId) {
      reply.status(401);
      return reply.send({
        type: '/errors/unauthorized',
        title: 'Authentication Required',
        status: 401,
        detail: 'You must be logged in to access backoffice capabilities',
      });
    }

    // Determine effective role
    const role = this.mapToEffectiveRole(request.userRole);
    const capabilities =
      BACKOFFICE_CAPABILITIES[role as keyof typeof BACKOFFICE_CAPABILITIES] ||
      BACKOFFICE_CAPABILITIES.case_handler;

    // Compute UI hints based on capabilities
    const uiHints = {
      showAdminNav: capabilities.includes('CAP_USER_VIEW'),
      showReports: capabilities.includes('CAP_REPORTS_VIEW'),
      showAudit: capabilities.includes('CAP_AUDIT_VIEW'),
      showIntegrations: capabilities.includes('CAP_INTEGRATIONS_VIEW'),
      showSettings: capabilities.includes('CAP_SETTINGS_VIEW'),
    };

    return {
      data: {
        role,
        capabilities,
        featureFlags: await this.getTenantFeatures(request.tenantId),
        uiHints,
      },
    };
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Map user role to effective backoffice role
   */
  private mapToEffectiveRole(
    userRole: string | undefined
  ): keyof typeof BACKOFFICE_CAPABILITIES {
    if (!userRole) return 'case_handler';

    const roleMap: Record<string, keyof typeof BACKOFFICE_CAPABILITIES> = {
      super_admin: 'super_admin',
      admin: 'admin',
      saksbehandler: 'saksbehandler',
      case_handler: 'case_handler',
      user: 'case_handler', // Default fallback for regular users
    };

    return roleMap[userRole.toLowerCase()] || 'case_handler';
  }

  /**
   * Get tenant-specific feature flags
   */
  private async getTenantFeatures(
    tenantId: string | null | undefined
  ): Promise<Record<string, boolean>> {
    if (!tenantId) {
      return {};
    }

    try {
      // Attempt to get feature flags service from container
      const featureFlagsService = container.resolve<{
        getTenantFeatures: (tenantId: string) => Promise<Record<string, boolean>>;
      }>('FeatureFlagsService');

      if (featureFlagsService) {
        return await featureFlagsService.getTenantFeatures(tenantId);
      }
    } catch {
      // Service not registered, return empty
    }

    return {};
  }
}

// =============================================================================
// Exports
// =============================================================================

export {
  WEB_CAPABILITIES,
  MINSIDE_CAPABILITIES,
  BACKOFFICE_CAPABILITIES,
};
