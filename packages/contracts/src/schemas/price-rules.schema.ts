/**
 * @digilist/contracts - Price Rules Schema
 *
 * Validation schemas for pricing rules domain.
 * Price rules define how rental objects are priced based on
 * time windows, user groups, and rule types.
 */
import { z } from 'zod';

import { UUIDSchema, CurrencyCodeSchema } from './base.schema';

// =====================================================================
// ENUMS
// =====================================================================

/**
 * Price Rule Type Enum
 */
export const PriceRuleTypeSchema = z.enum(['HOURLY', 'DAILY', 'PACKAGE']);
export type PriceRuleType = z.infer<typeof PriceRuleTypeSchema>;

/**
 * Price Unit Enum
 */
export const PriceUnitSchema = z.enum(['HOUR', 'DAY', 'PACKAGE']);
export type PriceUnit = z.infer<typeof PriceUnitSchema>;

// =====================================================================
// MAIN ENTITY SCHEMAS
// =====================================================================

/**
 * Price Rule Schema
 */
export const PriceRuleSchema = z.object({
  id: UUIDSchema,
  rentalObjectId: UUIDSchema,
  userGroupId: UUIDSchema.optional().nullable(),
  ruleType: PriceRuleTypeSchema,
  unit: PriceUnitSchema,
  amount: z.number().int().nonnegative(), // in øre (Norwegian cents)
  currency: z.string().length(3).default('NOK'),
  appliesWeekdays: z.boolean().default(true),
  appliesWeekends: z.boolean().default(false),
  packageName: z.string().optional().nullable(),
  windowStart: z.string().optional().nullable(), // HH:MM format
  windowEnd: z.string().optional().nullable(), // HH:MM format
  description: z.string().optional().nullable(),
  priority: z.number().int().default(0),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type PriceRule = z.infer<typeof PriceRuleSchema>;

/**
 * Create Price Rule DTO
 */
export const CreatePriceRuleSchema = z.object({
  rentalObjectId: UUIDSchema,
  userGroupId: UUIDSchema.optional().nullable(),
  ruleType: PriceRuleTypeSchema,
  unit: PriceUnitSchema,
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  appliesWeekdays: z.boolean().default(true),
  appliesWeekends: z.boolean().default(false),
  packageName: z.string().optional(),
  windowStart: z.string().optional(),
  windowEnd: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().int().default(0),
});

export type CreatePriceRuleDTO = z.infer<typeof CreatePriceRuleSchema>;

/**
 * Update Price Rule DTO
 */
export const UpdatePriceRuleSchema = CreatePriceRuleSchema.partial().omit({
  rentalObjectId: true,
});

export type UpdatePriceRuleDTO = z.infer<typeof UpdatePriceRuleSchema>;

// =====================================================================
// LISTING RULES (Business Rules for Rental Objects)
// =====================================================================

/**
 * Listing Rules Schema
 * Configuration for booking rules on a rental object
 */
export const ListingRulesSchema = z.object({
  id: UUIDSchema,
  rentalObjectId: UUIDSchema,
  approvalRequired: z.boolean().default(false),
  minAge: z.number().int().positive().optional().nullable(),
  maxBookingDays: z.number().int().positive().optional().nullable(),
  minBookingHours: z.number().int().positive().optional().nullable(),
  cancellationDeadlineDays: z.number().int().nonnegative().optional().nullable(),
  cancellationFeePercent: z.number().int().min(0).max(100).optional().nullable(),
  depositAmount: z.number().int().nonnegative().optional().nullable(),
  depositRequired: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type ListingRules = z.infer<typeof ListingRulesSchema>;

/**
 * Upsert Listing Rules DTO
 */
export const UpsertListingRulesSchema = z.object({
  approvalRequired: z.boolean().optional(),
  minAge: z.number().int().positive().optional().nullable(),
  maxBookingDays: z.number().int().positive().optional().nullable(),
  minBookingHours: z.number().int().positive().optional().nullable(),
  cancellationDeadlineDays: z.number().int().nonnegative().optional().nullable(),
  cancellationFeePercent: z.number().int().min(0).max(100).optional().nullable(),
  depositAmount: z.number().int().nonnegative().optional().nullable(),
  depositRequired: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export type UpsertListingRulesDTO = z.infer<typeof UpsertListingRulesSchema>;

// =====================================================================
// QUERY SCHEMAS
// =====================================================================

/**
 * Price Rules Query Schema
 */
export const PriceRulesQuerySchema = z.object({
  rentalObjectId: UUIDSchema.optional(),
  userGroupId: UUIDSchema.optional(),
  ruleType: PriceRuleTypeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PriceRulesQuery = z.infer<typeof PriceRulesQuerySchema>;
