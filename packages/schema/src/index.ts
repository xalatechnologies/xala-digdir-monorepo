/**
 * @digilist/database-schema
 *
 * Complete database schema for Digilist rental/booking platform.
 * Includes both core tables (tenants, users, organizations) and
 * domain tables (rental_objects, bookings, allocations, seasonal_leases).
 */

// Schema definitions (pgSchema)
export * from './schemas';

// Core platform tables (tenants, users, organizations)
export * from './core';

// Domain-specific tables (rental objects, bookings, etc.)
export * from './domain';
