/**
 * @digilist/testing
 * 
 * Centralized testing infrastructure for the Digilist Platform.
 * 
 * Test Categories:
 * - Unit: Component and service tests
 * - Integration: API and database integration tests
 * - E2E: End-to-end user flow tests (Playwright)
 * - Security: Auth, RBAC, penetration tests
 * - Compliance: GDPR, WCAG, SOC2, i18n tests
 * - Performance: Load, stress, render performance tests
 * 
 * Usage:
 *   import { renderWithProviders, mockUser, mockTenant } from '@digilist/testing';
 */

// Fixtures
export * from './fixtures/index.js';

// Mocks
export * from './mocks/index.js';

// Utilities
export * from './utils/index.js';

// Setup
export * from './setup/index.js';
export * from './config/test-config';
