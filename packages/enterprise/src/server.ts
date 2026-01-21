/**
 * @xalatechnologies/enterprise/server
 *
 * SERVER-ONLY entrypoint for enterprise features.
 *
 * ⚠️ IMPORTANT: This module contains server-only code and must NEVER be
 * imported in frontend/client applications. It may depend on:
 * - @xalatechnologies/platform-schema (database tables)
 * - Node.js APIs (fs, crypto, etc.)
 * - Server-side secrets and configuration
 *
 * Frontend apps must import from '@xalatechnologies/enterprise' (default)
 * which only exports universal/isomorphic code.
 *
 * Allowed consumers:
 * - apps/platform-api
 * - apps/api (domain API)
 * - Server-side workers and jobs
 * - Migration scripts
 *
 * Banned consumers (lint rule enforced):
 * - apps/web
 * - apps/minside
 * - apps/backoffice
 * - apps/saas-admin
 * - apps/monitoring
 * - apps/docs-learning
 * - Any browser-targeted bundle
 */

// Server-only enterprise features will be added here
// Examples: DB-backed feature flag evaluation, audit integration, compliance checks

export const SERVER_MARKER = true; // Marker to detect accidental client import

// Placeholder for server-only feature flag evaluator
export interface ServerFeatureFlagContext {
  tenantId: string;
  userId?: string;
  organizationId?: string;
}

// Future: DB-backed feature flag service
// export { FeatureFlagService } from './feature-flags/server';

// Future: Audit integration
// export { AuditEnterpriseService } from './audit/server';

// Future: Compliance accelerators
// export { ComplianceService } from './compliance/server';
