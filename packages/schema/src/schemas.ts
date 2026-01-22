/**
 * PostgreSQL Schema Definitions
 * Defines the named schemas used in the database
 */
import { pgSchema } from 'drizzle-orm/pg-core';

// Platform schema - core infrastructure tables (tenants, users, organizations)
export const platformSchema = pgSchema('platform');

// Domain schema - business logic tables (bookings, rental objects, etc.)
export const domainSchema = pgSchema('domain');

// SaaS schema - subscription and billing tables
export const saasSchema = pgSchema('saas');

// Compliance schema - audit and GDPR tables
export const complianceSchema = pgSchema('compliance');

// Monitoring schema - health checks and metrics
export const monitoringSchema = pgSchema('monitoring');
