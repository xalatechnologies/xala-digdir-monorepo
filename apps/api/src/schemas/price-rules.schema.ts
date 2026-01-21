/**
 * Price Rules Zod Schemas
 * Validation schemas for pricing rules domain
 */
import { z } from 'zod';

/**
 * Listing Category Enum (expanded for demo)
 */
export const RentalObjectCategorySchema = z.enum([
  'GYMSAL',
  'MUSIKKBINGE',
  'BYDELSHUS',
  'GRENDEHUS',
  'BIBLIOTEK',
  'UNGDOM',
  'FRIVILLIGHET',
  'UTE',
  'KULTUR',
  'MOTEROM',
  'IDRETT',
  'KURS',
  'OTHER',
]);
export type RentalObjectCategory = z.infer<typeof RentalObjectCategorySchema>;

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

/**
 * Price Rule Schema
 */
export const PriceRuleSchema = z.object({
  id: z.string().uuid(),
  rentalObjectId: z.string().uuid(),
  userGroupId: z.string().uuid().optional().nullable(),
  ruleType: PriceRuleTypeSchema,
  unit: PriceUnitSchema,
  amount: z.number().int().nonnegative(), // in øre
  currency: z.string().length(3).default('NOK'),
  appliesWeekdays: z.boolean().default(true),
  appliesWeekends: z.boolean().default(false),
  packageName: z.string().optional().nullable(),
  windowStart: z.string().optional().nullable(),
  windowEnd: z.string().optional().nullable(),
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
  rentalObjectId: z.string().uuid(),
  userGroupId: z.string().uuid().optional().nullable(),
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
 * Listing Rules Schema
 */
export const ListingRulesSchema = z.object({
  id: z.string().uuid(),
  rentalObjectId: z.string().uuid(),
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
