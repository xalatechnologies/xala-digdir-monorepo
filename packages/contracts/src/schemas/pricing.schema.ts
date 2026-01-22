/**
 * @digilist/contracts - Pricing Schema
 *
 * Validation schemas for pricing quote calculations.
 * Used for server-side price computation for bookings.
 */
import { z } from 'zod';

import { UUIDSchema } from './base.schema';

// =====================================================================
// ENUMS
// =====================================================================

/**
 * Price unit for line items
 */
export const QuotePriceUnitSchema = z.enum(['HOUR', 'DAY', 'PACKAGE']);
export type QuotePriceUnit = z.infer<typeof QuotePriceUnitSchema>;

/**
 * Price rule type for applied rules
 */
export const QuoteRuleTypeSchema = z.enum(['HOURLY', 'DAILY', 'PACKAGE']);
export type QuoteRuleType = z.infer<typeof QuoteRuleTypeSchema>;

// =====================================================================
// REQUEST DTOs
// =====================================================================

/**
 * Pricing Quote Request
 */
export const PricingQuoteRequestSchema = z.object({
  rentalObjectId: UUIDSchema,
  start: z.string().datetime({ offset: true }).or(z.coerce.date()),
  end: z.string().datetime({ offset: true }).or(z.coerce.date()),
  userGroupId: UUIDSchema.optional().nullable(),
  units: z.number().int().positive().optional(), // for package-based pricing
});

export type PricingQuoteRequest = z.infer<typeof PricingQuoteRequestSchema>;

// =====================================================================
// RESPONSE DTOs
// =====================================================================

/**
 * Line Item in a quote
 */
export const QuoteLineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().int(), // in øre (Norwegian cents)
  unit: QuotePriceUnitSchema,
  subtotal: z.number().int(), // in øre
  ruleId: UUIDSchema.optional(),
});

export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;

/**
 * Applied price rule in quote
 */
export const AppliedPriceRuleSchema = z.object({
  id: UUIDSchema,
  description: z.string().optional(),
  ruleType: QuoteRuleTypeSchema,
});

export type AppliedPriceRule = z.infer<typeof AppliedPriceRuleSchema>;

/**
 * Pricing Quote Response
 */
export const PricingQuoteResponseSchema = z.object({
  lineItems: z.array(QuoteLineItemSchema),
  totalAmount: z.number().int(), // in øre
  currency: z.string().length(3), // ISO 4217 (e.g., 'NOK')
  ruleApplied: AppliedPriceRuleSchema.optional().nullable(),
  isWeekend: z.boolean(),
  userGroupId: UUIDSchema.optional().nullable(),
  validUntil: z.string().datetime().optional(),
});

export type PricingQuoteResponse = z.infer<typeof PricingQuoteResponseSchema>;

// =====================================================================
// HELPERS
// =====================================================================

/**
 * Create a paginated response schema for pricing-related entities.
 * Note: Use createPaginatedResponseSchema from base.schema for general use.
 */
export const PricingPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

export type PricingPaginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
