/**
 * Pricing Quote Zod Schemas
 * Validation schemas for server-side pricing calculation
 */
import { z } from 'zod';

/**
 * Pricing Quote Request
 */
export const PricingQuoteRequestSchema = z.object({
  listingId: z.string().uuid(),
  start: z.string().datetime({ offset: true }).or(z.coerce.date()),
  end: z.string().datetime({ offset: true }).or(z.coerce.date()),
  userGroupId: z.string().uuid().optional().nullable(),
  units: z.number().int().positive().optional(), // for package-based
});

export type PricingQuoteRequest = z.infer<typeof PricingQuoteRequestSchema>;

/**
 * Line Item in a quote
 */
export const QuoteLineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().int(), // in øre
  unit: z.enum(['HOUR', 'DAY', 'PACKAGE']),
  subtotal: z.number().int(), // in øre
  ruleId: z.string().uuid().optional(),
});

export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;

/**
 * Pricing Quote Response
 */
export const PricingQuoteResponseSchema = z.object({
  lineItems: z.array(QuoteLineItemSchema),
  totalAmount: z.number().int(), // in øre
  currency: z.string().length(3),
  ruleApplied: z.object({
    id: z.string().uuid(),
    description: z.string().optional(),
    ruleType: z.enum(['HOURLY', 'DAILY', 'PACKAGE']),
  }).optional().nullable(),
  isWeekend: z.boolean(),
  userGroupId: z.string().uuid().optional().nullable(),
  validUntil: z.string().datetime().optional(),
});

export type PricingQuoteResponse = z.infer<typeof PricingQuoteResponseSchema>;

/**
 * Pagination Schema
 */
export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
