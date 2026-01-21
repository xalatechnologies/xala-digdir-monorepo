/**
 * @xalatechnologies/database-schema
 *
 * Platform database schema - foundation tables for any SaaS application.
 *
 * This package contains platform-agnostic database tables that can be used
 * by any SaaS domain. Domain-specific tables should be defined in separate
 * domain packages that extend these base tables.
 *
 * Modules:
 * - schemas: pgSchema definitions (platform, domain, saas, compliance, monitoring)
 * - core: tenants, organizations, users (foundation tables)
 * - platform: sessions, memberships, permissions (infrastructure)
 * - saas: entitlements, plans, menu system (multi-tenancy)
 * - compliance: audit-logs, gdpr-requests (governance)
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
