/**
 * Core Tables: Translations
 * Multi-tenant translation storage with system defaults and tenant overrides
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
import { tenants } from './tenants';

export const translations = platformSchema.table('translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  namespace: varchar('namespace', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  language: varchar('language', { length: 10 }).notNull(),
  value: text('value').notNull(),
  isSystemDefault: boolean('is_system_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
}, (table) => ({
  uniqueIdx: uniqueIndex('translations_unique_idx').on(table.tenantId, table.namespace, table.key, table.language),
  namespaceIdx: index('translations_namespace_idx').on(table.namespace),
  languageIdx: index('translations_language_idx').on(table.language),
  tenantIdx: index('translations_tenant_idx').on(table.tenantId),
  keyIdx: index('translations_key_idx').on(table.key),
  lookupIdx: index('translations_lookup_idx').on(table.namespace, table.language),
}));

export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
