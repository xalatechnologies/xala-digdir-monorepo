/**
 * @digilist/database-schema
 *
 * Domain-specific database schema for Digilist rental/booking platform.
 *
 * IMPORTANT: This package exports ONLY domain tables (rental_objects, bookings,
 * allocations, seasonal_leases). Platform tables (tenants, users, organizations,
 * sessions, permissions, audit_logs, etc.) are in @xalatechnologies/platform-schema.
 *
 * Consumers needing platform tables should import directly:
 *   import { tenants, users } from '@xalatechnologies/platform-schema';
 *
 * This package is part of digilist-domain repository and publishes
 * to @digilist/* namespace.
 */

// Domain-specific tables ONLY
// Platform tables are NOT re-exported - import from @xalatechnologies/platform-schema
export * from './domain';
