/**
 * @digilist/database-schema
 *
 * Domain-specific database schema for Digilist.
 * Re-exports platform tables and adds domain-specific tables.
 */

// Re-export platform schemas (for backward compatibility)
export * from '@xalatechnologies/database-schema';

// Domain-specific tables
export * from './domain';
