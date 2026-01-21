/**
 * @xalatechnologies/platform-schema
 *
 * Platform database schema - foundation tables for any SaaS application.
 *
 * This package contains platform-agnostic database tables that can be used
 * by any SaaS domain. Domain-specific tables should be defined in separate
 * domain packages (e.g., @digilist/database-schema) that extend these base tables.
 *
 * Modules:
 * - schemas: pgSchema definitions (platform, saas, compliance, monitoring)
 * - core: tenants, organizations, users (foundation tables)
 * - platform: sessions, memberships, permissions (infrastructure)
 * - saas: entitlements, plans, menu system (multi-tenancy)
 * - compliance: audit-logs, gdpr-requests (governance)
 *
 * Note: This package is part of xala-platform-core repository and publishes
 * to @xalatechnologies/* namespace. It has NO domain-specific dependencies.
 */

// Schema definitions
export * from './schemas';

// Core module (foundation - no external deps)
export * from './core';

// Platform module (sessions, permissions)
export * from './platform';

// SaaS module (entitlements & subscriptions)
export * from './saas';

// Compliance module (audit logs)
export * from './compliance';
