/**
 * Core Module Index
 * Re-exports all core tables in dependency order
 *
 * Platform-agnostic foundation tables for any SaaS application.
 */

// Export in dependency order (no circular deps)
export * from './tenants';
export * from './organizations';
export * from './users';
