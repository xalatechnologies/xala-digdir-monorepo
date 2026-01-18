/**
 * @digilist/database-schema
 * 
 * Single source of truth for all Drizzle ORM schema definitions.
 * Organized into modules by domain:
 * 
 * - schemas: pgSchema definitions (platform, domain, saas, compliance, monitoring)
 * - core: tenants, organizations, users (foundation tables)
 * - domain: rental-objects, bookings (business entities)
 * - platform: sessions, memberships, permissions (infrastructure)
 * - saas: entitlements, plans (multi-tenancy)
 * - compliance: audit-logs (governance)
 */

// Schema definitions
export * from './schemas';

// Core module (foundation - no external deps)
export * from './core';

// Domain module (business entities)
export * from './domain';

// Platform module (sessions, permissions)
export * from './platform';

// SaaS module (entitlements & subscriptions)
export * from './saas';

// Compliance module (audit logs)
export * from './compliance';
