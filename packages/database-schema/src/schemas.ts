/**
 * PostgreSQL Schema Namespaces
 * Centralized definitions to avoid circular dependencies
 */

import { pgSchema } from 'drizzle-orm/pg-core';

export const platformSchema = pgSchema('platform');
export const domainSchema = pgSchema('domain');
export const complianceSchema = pgSchema('compliance');
export const monitoringSchema = pgSchema('monitoring');
export const saasSchema = pgSchema('saas');
