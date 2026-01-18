/**
 * Policy Engine Schema
 * Database tables for configuration-driven, policy-driven architecture
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { tenants, users, rentalObjects } from './base-tables';
import { saasSchema } from './schemas';

// ============================================================================
// Policy Sets (Versioned, Published)
// ============================================================================

/**
 * Policy sets define domain behavior rules
 * Types: booking, pricing, approval, payment, availability, privacy
 */
export const policySets = saasSchema.table('policy_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Policy Identity
  policyType: varchar('policy_type', { length: 50 }).notNull(),
  version: integer('version').notNull().default(1),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Policy Configuration (flexible JSONB)
  rules: jsonb('rules').notNull().default({}),
  
  // Workflow Status
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Audit
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('policy_sets_tenant_idx').on(table.tenantId),
  typeIdx: index('policy_sets_type_idx').on(table.policyType),
  statusIdx: index('policy_sets_status_idx').on(table.status),
  publishedIdx: index('policy_sets_published_idx').on(table.tenantId, table.policyType, table.status),
  versionUnique: unique('policy_sets_version_unique').on(table.tenantId, table.policyType, table.version),
}));

// ============================================================================
// Policy Set Audit Log
// ============================================================================

export const policySetAudit = saasSchema.table('policy_set_audit', {
  id: uuid('id').primaryKey().defaultRandom(),
  policySetId: uuid('policy_set_id').notNull().references(() => policySets.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Change Details
  action: varchar('action', { length: 20 }).notNull(),
  oldState: jsonb('old_state'),
  newState: jsonb('new_state').notNull(),
  
  // Actor
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  reason: text('reason'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  policyIdx: index('policy_set_audit_policy_idx').on(table.policySetId),
  tenantIdx: index('policy_set_audit_tenant_idx').on(table.tenantId),
  actionIdx: index('policy_set_audit_action_idx').on(table.action),
  timeIdx: index('policy_set_audit_time_idx').on(table.createdAt),
}));

// ============================================================================
// Tenant Configs (Versioned, Published)
// ============================================================================

export const tenantConfigs = saasSchema.table('tenant_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Config Identity
  configType: varchar('config_type', { length: 50 }).notNull(),
  version: integer('version').notNull().default(1),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  
  // Configuration Data
  data: jsonb('data').notNull().default({}),
  
  // Workflow Status
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Audit
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tenant_configs_tenant_idx').on(table.tenantId),
  typeIdx: index('tenant_configs_type_idx').on(table.configType),
  statusIdx: index('tenant_configs_status_idx').on(table.status),
  publishedIdx: index('tenant_configs_published_idx').on(table.tenantId, table.configType, table.status),
  versionUnique: unique('tenant_configs_version_unique').on(table.tenantId, table.configType, table.version),
}));

// ============================================================================
// Seed Blueprints
// ============================================================================

export const seedBlueprints = saasSchema.table('seed_blueprints', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Blueprint Identity
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  description: text('description'),
  
  // Blueprint Definition
  blueprint: jsonb('blueprint').notNull().default({}),
  
  // Categorization
  category: varchar('category', { length: 50 }).notNull().default('demo'),
  tags: text('tags').array().default([]),
  
  // Status
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  
  // Audit
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  codeIdx: index('seed_blueprints_code_idx').on(table.code),
  categoryIdx: index('seed_blueprints_category_idx').on(table.category),
  activeIdx: index('seed_blueprints_active_idx').on(table.isActive),
  defaultIdx: index('seed_blueprints_default_idx').on(table.isDefault),
}));

// ============================================================================
// Seed Executions
// ============================================================================

export const seedExecutions = saasSchema.table('seed_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  blueprintId: uuid('blueprint_id').references(() => seedBlueprints.id, { onDelete: 'set null' }),
  
  // Execution Status
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  
  // Results
  entitiesCreated: jsonb('entities_created').default({}),
  entityCounts: jsonb('entity_counts').default({}),
  
  // Error Handling
  errorLog: text('error_log'),
  warnings: jsonb('warnings').default([]),
  
  // Rollback Support
  rollbackAvailable: boolean('rollback_available').notNull().default(true),
  rolledBackAt: timestamp('rolled_back_at', { withTimezone: true }),
  rolledBackBy: uuid('rolled_back_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Timing
  executedBy: uuid('executed_by').references(() => users.id, { onDelete: 'set null' }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationMs: integer('duration_ms'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('seed_executions_tenant_idx').on(table.tenantId),
  blueprintIdx: index('seed_executions_blueprint_idx').on(table.blueprintId),
  statusIdx: index('seed_executions_status_idx').on(table.status),
  timeIdx: index('seed_executions_time_idx').on(table.createdAt),
}));

// ============================================================================
// Message Templates
// ============================================================================

export const messageTemplates = saasSchema.table('message_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Scope: NULL = platform default
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Template Identity
  templateKey: varchar('template_key', { length: 100 }).notNull(),
  channel: varchar('channel', { length: 20 }).notNull(),
  
  // Versioning
  version: integer('version').notNull().default(1),
  name: varchar('name', { length: 255 }),
  
  // Content (i18n)
  subject: jsonb('subject'), // { nb: '...', en: '...' }
  body: jsonb('body').notNull(), // { nb: '...', en: '...' }
  
  // Template Variables
  variables: text('variables').array().notNull().default([]),
  
  // Rendering Hints
  contentType: varchar('content_type', { length: 20 }).notNull().default('html'),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Audit
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('message_templates_tenant_idx').on(table.tenantId),
  keyIdx: index('message_templates_key_idx').on(table.templateKey),
  channelIdx: index('message_templates_channel_idx').on(table.channel),
  statusIdx: index('message_templates_status_idx').on(table.status),
  publishedIdx: index('message_templates_published_idx').on(table.tenantId, table.templateKey, table.channel, table.status),
  versionUnique: unique('message_templates_version_unique').on(table.tenantId, table.templateKey, table.channel, table.version),
}));

// ============================================================================
// Rental Object Policies (Links rental objects to policy sets)
// ============================================================================

export const rentalObjectPolicies = saasSchema.table('rental_object_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  
  // Policy References
  bookingPolicyId: uuid('booking_policy_id').references(() => policySets.id, { onDelete: 'set null' }),
  pricingPolicyId: uuid('pricing_policy_id').references(() => policySets.id, { onDelete: 'set null' }),
  approvalPolicyId: uuid('approval_policy_id').references(() => policySets.id, { onDelete: 'set null' }),
  paymentPolicyId: uuid('payment_policy_id').references(() => policySets.id, { onDelete: 'set null' }),
  availabilityPolicyId: uuid('availability_policy_id').references(() => policySets.id, { onDelete: 'set null' }),
  
  // Fallback Behavior
  useTenantDefaults: boolean('use_tenant_defaults').notNull().default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('rental_object_policies_tenant_idx').on(table.tenantId),
  roIdx: index('rental_object_policies_ro_idx').on(table.rentalObjectId),
  roUnique: unique('rental_object_policies_unique').on(table.tenantId, table.rentalObjectId),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type PolicySet = typeof policySets.$inferSelect;
export type NewPolicySet = typeof policySets.$inferInsert;

export type PolicySetAuditEntry = typeof policySetAudit.$inferSelect;
export type NewPolicySetAuditEntry = typeof policySetAudit.$inferInsert;

export type TenantConfig = typeof tenantConfigs.$inferSelect;
export type NewTenantConfig = typeof tenantConfigs.$inferInsert;

export type SeedBlueprint = typeof seedBlueprints.$inferSelect;
export type NewSeedBlueprint = typeof seedBlueprints.$inferInsert;

export type SeedExecution = typeof seedExecutions.$inferSelect;
export type NewSeedExecution = typeof seedExecutions.$inferInsert;

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type NewMessageTemplate = typeof messageTemplates.$inferInsert;

export type RentalObjectPolicy = typeof rentalObjectPolicies.$inferSelect;
export type NewRentalObjectPolicy = typeof rentalObjectPolicies.$inferInsert;

// ============================================================================
// Policy Rule Types
// ============================================================================

export interface BookingPolicyRules {
  allowedModes: ('INSTANT' | 'REQUEST' | 'APPROVAL_REQUIRED')[];
  slotRules: {
    minDurationMinutes: number;
    maxDurationMinutes: number;
    bufferMinutes: number;
    allowOvernight: boolean;
  };
  recurringRules: {
    enabled: boolean;
    maxOccurrences: number;
    allowedPatterns: ('daily' | 'weekly' | 'monthly')[];
  };
  seasonRules: {
    enabled: boolean;
    applicationRequired: boolean;
    prioritySystem: 'first_come' | 'weighted' | 'manual';
  };
  restrictions: {
    requiresOrganization: boolean;
    allowedOrgTypes: string[];
    blackoutDates: string[];
  };
}

export interface PricingPolicyRules {
  basePricing: {
    defaultHourlyRate: number;
    defaultDailyRate: number;
    currency: string;
  };
  discountRules: {
    memberDiscount: number;
    longBookingDiscount: { minHours: number; percentage: number }[];
    earlyBirdDiscount: { daysInAdvance: number; percentage: number };
  };
  surchargeRules: {
    weekendSurcharge: number;
    holidaySurcharge: number;
    peakHourSurcharge: { hours: number[]; percentage: number };
  };
  depositRules: {
    required: boolean;
    percentage: number;
    minimumAmount: number;
  };
}

export interface ApprovalPolicyRules {
  requiresApproval: boolean;
  autoApproveFor: {
    verifiedOrganizations: boolean;
    repeatBookers: boolean;
    lowRiskBookings: boolean;
  };
  escalationRules: {
    assignToRole: string;
    slaHours: number;
    reminderIntervalHours: number;
  };
  denialReasons: string[];
}

export interface PaymentPolicyRules {
  onlinePaymentEnabled: boolean;
  invoiceEnabled: boolean;
  depositRequired: boolean;
  depositPercentage: number;
  depositMinimumCents: number;
  prepaymentRequired: boolean;
  cancellationPolicy: {
    freeCancellationHours: number;
    penaltyPercentage: number;
  };
  refundPolicy: {
    fullRefundHours: number;
    partialRefundPercentage: number;
  };
}

export interface AvailabilityPolicyRules {
  defaultOpeningHours: {
    [day: number]: { open: string; close: string } | null;
  };
  holidayBehavior: 'closed' | 'reduced' | 'normal';
  maintenanceWindows: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  bufferBetweenBookings: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
}
