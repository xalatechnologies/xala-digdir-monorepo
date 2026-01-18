/**
 * Capabilities Endpoints Tests
 *
 * Verifies that app-specific capability endpoints return correct data
 * based on authentication state and user role.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WEB_CAPABILITIES,
  MINSIDE_CAPABILITIES,
  BACKOFFICE_CAPABILITIES,
} from '@testing/stubs/api-imports';

describe('Capabilities Module', () => {
  describe('Web Capabilities', () => {
    it('should have anonymous capabilities', () => {
      expect(WEB_CAPABILITIES.anonymous).toContain('CAP_LISTING_VIEW');
      expect(WEB_CAPABILITIES.anonymous).toContain('CAP_LISTING_SEARCH');
      expect(WEB_CAPABILITIES.anonymous).not.toContain('CAP_BOOKING_CREATE');
    });

    it('should have user capabilities that extend anonymous', () => {
      expect(WEB_CAPABILITIES.user).toContain('CAP_LISTING_VIEW');
      expect(WEB_CAPABILITIES.user).toContain('CAP_BOOKING_CREATE');
      expect(WEB_CAPABILITIES.user).toContain('CAP_PROFILE_VIEW');
    });
  });

  describe('Minside Capabilities', () => {
    it('should have user dashboard capabilities', () => {
      expect(MINSIDE_CAPABILITIES.user).toContain('CAP_DASHBOARD_VIEW');
      expect(MINSIDE_CAPABILITIES.user).toContain('CAP_BOOKING_VIEW');
      expect(MINSIDE_CAPABILITIES.user).toContain('CAP_BOOKING_CANCEL');
      expect(MINSIDE_CAPABILITIES.user).toContain('CAP_PROFILE_EDIT');
    });

    it('should have GDPR capabilities for users', () => {
      expect(MINSIDE_CAPABILITIES.user).toContain('CAP_GDPR_DATA_REQUEST');
      expect(MINSIDE_CAPABILITIES.user).toContain('CAP_GDPR_DELETE_REQUEST');
    });
  });

  describe('Backoffice Capabilities', () => {
    it('should have super_admin with all capabilities', () => {
      const superAdmin = BACKOFFICE_CAPABILITIES.super_admin;

      expect(superAdmin).toContain('CAP_SYSTEM_CONFIG');
      expect(superAdmin).toContain('CAP_INTEGRATIONS_MANAGE');
      expect(superAdmin).toContain('CAP_USER_CREATE');
      expect(superAdmin).toContain('CAP_RENTAL_OBJECT_DELETE');
    });

    it('should have admin without system config', () => {
      const admin = BACKOFFICE_CAPABILITIES.admin;

      expect(admin).not.toContain('CAP_SYSTEM_CONFIG');
      expect(admin).not.toContain('CAP_INTEGRATIONS_MANAGE');
      expect(admin).toContain('CAP_USER_CREATE');
      expect(admin).toContain('CAP_RENTAL_OBJECT_DELETE');
    });

    it('should have saksbehandler with booking approval', () => {
      const saksbehandler = BACKOFFICE_CAPABILITIES.saksbehandler;

      expect(saksbehandler).toContain('CAP_BOOKING_APPROVE');
      expect(saksbehandler).toContain('CAP_BOOKING_REJECT');
      expect(saksbehandler).toContain('CAP_RENTAL_OBJECT_EDIT');
      expect(saksbehandler).not.toContain('CAP_USER_CREATE');
    });

    it('should have case_handler with limited capabilities', () => {
      const caseHandler = BACKOFFICE_CAPABILITIES.case_handler;

      expect(caseHandler).toContain('CAP_BOOKING_VIEW');
      expect(caseHandler).toContain('CAP_BOOKING_APPROVE');
      expect(caseHandler).not.toContain('CAP_RENTAL_OBJECT_CREATE');
      expect(caseHandler).not.toContain('CAP_USER_CREATE');
    });

    it('should have progressively fewer capabilities as role decreases', () => {
      const superAdminCount = BACKOFFICE_CAPABILITIES.super_admin.length;
      const adminCount = BACKOFFICE_CAPABILITIES.admin.length;
      const saksbehandlerCount = BACKOFFICE_CAPABILITIES.saksbehandler.length;
      const caseHandlerCount = BACKOFFICE_CAPABILITIES.case_handler.length;

      expect(superAdminCount).toBeGreaterThan(adminCount);
      expect(adminCount).toBeGreaterThan(saksbehandlerCount);
      expect(saksbehandlerCount).toBeGreaterThan(caseHandlerCount);
    });
  });

  describe('Capability Naming Convention', () => {
    it('should use CAP_ prefix for all capabilities', () => {
      const allCapabilities = [
        ...WEB_CAPABILITIES.anonymous,
        ...WEB_CAPABILITIES.user,
        ...MINSIDE_CAPABILITIES.user,
        ...BACKOFFICE_CAPABILITIES.super_admin,
      ];

      for (const cap of allCapabilities) {
        expect(cap).toMatch(/^CAP_/);
      }
    });

    it('should use SCREAMING_SNAKE_CASE', () => {
      const allCapabilities = [
        ...BACKOFFICE_CAPABILITIES.super_admin,
      ];

      for (const cap of allCapabilities) {
        expect(cap).toMatch(/^CAP_[A-Z_]+$/);
      }
    });
  });

  describe('Capability Consistency', () => {
    it('should not have duplicate capabilities within a role', () => {
      const roles = [
        WEB_CAPABILITIES.user,
        MINSIDE_CAPABILITIES.user,
        BACKOFFICE_CAPABILITIES.admin,
      ];

      for (const role of roles) {
        const unique = new Set(role);
        expect(unique.size).toBe(role.length);
      }
    });

    it('should have view capability before manage capability', () => {
      const admin = BACKOFFICE_CAPABILITIES.admin;

      // If you can manage, you should be able to view
      if (admin.includes('CAP_BOOKING_MANAGE')) {
        expect(admin).toContain('CAP_BOOKING_VIEW');
      }
      if (admin.includes('CAP_USER_CREATE')) {
        expect(admin).toContain('CAP_USER_VIEW');
      }
    });
  });
});

describe('SDK Capabilities Hooks', () => {
  // Mock tests for SDK hooks - actual integration tests would require API
  describe('useWebCapabilities', () => {
    it('should export useWebCapabilities hook', async () => {
      const hooks = await import('../../packages/client-sdk/src/hooks/use-capabilities');
      expect(hooks.useWebCapabilities).toBeDefined();
      expect(typeof hooks.useWebCapabilities).toBe('function');
    });
  });

  describe('useMinsideCapabilities', () => {
    it('should export useMinsideCapabilities hook', async () => {
      const hooks = await import('../../packages/client-sdk/src/hooks/use-capabilities');
      expect(hooks.useMinsideCapabilities).toBeDefined();
      expect(typeof hooks.useMinsideCapabilities).toBe('function');
    });
  });

  describe('useBackofficeCapabilities', () => {
    it('should export useBackofficeCapabilities hook', async () => {
      const hooks = await import('../../packages/client-sdk/src/hooks/use-capabilities');
      expect(hooks.useBackofficeCapabilities).toBeDefined();
      expect(typeof hooks.useBackofficeCapabilities).toBe('function');
    });
  });

  describe('helper hooks', () => {
    it('should export useHasCapability helper', async () => {
      const hooks = await import('../../packages/client-sdk/src/hooks/use-capabilities');
      expect(hooks.useHasCapability).toBeDefined();
    });

    it('should export useHasAllCapabilities helper', async () => {
      const hooks = await import('../../packages/client-sdk/src/hooks/use-capabilities');
      expect(hooks.useHasAllCapabilities).toBeDefined();
    });

    it('should export useFeatureFlag helper', async () => {
      const hooks = await import('../../packages/client-sdk/src/hooks/use-capabilities');
      expect(hooks.useFeatureFlag).toBeDefined();
    });
  });
});
