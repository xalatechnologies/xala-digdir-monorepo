/**
 * Shared test fixtures for Digilist Platform
 */

import { test as baseTest, expect } from './qa-expert.fixture.js';
import * as blurEye from './blur-eye.helpers.js';
import * as evidence from './evidence.fixture.js';

export * from './tenants.js';
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
