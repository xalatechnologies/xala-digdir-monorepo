/**
 * Shared test fixtures for Digilist Platform
 */

import { test as baseTest, expect } from './qa-expert.fixture.js';
import * as blurEye from './blur-eye.helpers.js';
import * as evidence from './evidence.fixture.js';

// Demo tenant for testing
export const mockTenant = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  slug: 'digilist-kommune',
  name: 'Digilist Kommune',
  status: 'ACTIVE',
  defaultLocale: 'nb',
};

// Demo users with different roles
export const mockUsers = {
  admin: {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'admin@digilist.no',
    name: 'Admin User',
    role: 'ADMIN',
    tenantId: mockTenant.id,
    status: 'ACTIVE',
  },
  saksbehandler: {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    email: 'saksbehandler@digilist.no',
    name: 'Saksbehandler',
    role: 'SAKSBEHANDLER',
    tenantId: mockTenant.id,
    status: 'ACTIVE',
  },
  orgAdmin: {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    email: 'org-admin@example.org',
    name: 'Org Admin',
    role: 'ORG_ADMIN',
    tenantId: mockTenant.id,
    organizationId: 'org-1',
    status: 'ACTIVE',
  },
  orgMember: {
    id: 'dddddddd-dddd-dddd-dddd-ddddbbbbbbbb',
    email: 'member@example.org',
    name: 'Org Member',
    role: 'ORG_MEMBER',
    tenantId: mockTenant.id,
    organizationId: 'org-1',
    status: 'ACTIVE',
  },
  citizen: {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    email: 'citizen@example.com',
    name: 'Test Citizen',
    role: 'USER',
    tenantId: mockTenant.id,
    status: 'ACTIVE',
  },
};

// Demo organization
export const mockOrganization = {
  id: 'org-1',
  tenantId: mockTenant.id,
  name: 'Test Organization',
  slug: 'test-org',
  status: 'ACTIVE',
};

export * from './rental-objects.js';
export * from './bookings.js';

// Re-export specific helpers to avoid star export conflicts
export const { 
  discoverPageElements, 
  assertBlurEyeListView, 
  assertBlurEyeWizardView, 
  assertBlurEyeSettingsView,
  assertNoForbiddenTerminology,
  assertNoMissingI18nKeys,
  assertPageReady,
  getFeatureFlagsSnapshot,
  getCapabilitiesSnapshot,
  logBlurEyeResults
} = blurEye;

export const { EvidenceCollector } = evidence;

// Export the authoritative test instance
export const test = baseTest;
export { expect };
