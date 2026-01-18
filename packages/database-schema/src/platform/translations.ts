/**
 * Platform Tables: Translations
 * i18n translations table with tenant override support
 * 
 * Enables:
 * - Runtime translation management via SaaS Admin
 * - Per-tenant translation overrides
 * - Language fallback chains
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { platformSchema } from '../schemas';
import { tenants } from '../core/tenants';

export const translations = platformSchema.table('translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Null = system default, otherwise tenant-specific override
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Namespace groups related keys (e.g., 'auth', 'booking', 'payment')
  namespace: varchar('namespace', { length: 50 }).notNull(),
  
  // Translation key (e.g., 'loginButton', 'checkingStatus')
  key: varchar('key', { length: 100 }).notNull(),
  
  // ISO language code (e.g., 'nb', 'en', 'nn')
  language: varchar('language', { length: 10 }).notNull(),
  
  // The translated text value
  value: text('value').notNull(),
  
  // System defaults cannot be deleted by tenants
  isSystemDefault: boolean('is_system_default').notNull().default(false),
  
  // Track changes for audit
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (table) => ({
  // Unique constraint: one value per tenant/namespace/key/language
  uniqueTranslation: uniqueIndex('translations_unique_idx')
    .on(table.tenantId, table.namespace, table.key, table.language),
  
  // Query indexes
  namespaceIdx: index('translations_namespace_idx').on(table.namespace),
  languageIdx: index('translations_language_idx').on(table.language),
  tenantIdx: index('translations_tenant_idx').on(table.tenantId),
  keyIdx: index('translations_key_idx').on(table.key),
  
  // Composite for common lookups
  lookupIdx: index('translations_lookup_idx')
    .on(table.namespace, table.language),
}));

export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;

/**
 * Translation namespaces enum for type safety
 */
export const TRANSLATION_NAMESPACES = [
  'common',
  'auth',
  'bookings',
  'calendar',
  'help',
  'nav',
  'organizations',
  'payment',
  'saasAdmin',
  'seasons',
  'settings',
  'tenantAdmin',
  'form',
  'docs',
  'security',
  'rentalObjects',
  'integrations',
] as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = ['nb', 'en', 'nn'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
