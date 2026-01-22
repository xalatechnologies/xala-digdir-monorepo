/**
 * Contract Types and Schemas
 *
 * Local type definitions for common API contracts.
 * These replace imports from the deleted @xalatechnologies/platform/contracts package.
 */

import { z } from 'zod';

// =============================================================================
// Common Schemas
// =============================================================================

export const UUIDSchema = z.string().uuid();

export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: 'Slug must be lowercase alphanumeric with hyphens',
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const PaginatedResponseMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const MetadataSchema = z.record(z.string(), z.unknown());

export const CurrencyCodeSchema = z.enum(['NOK', 'EUR', 'USD', 'SEK', 'DKK']);

export const MoneySchema = z.object({
  amount: z.number(),
  currency: CurrencyCodeSchema,
});

// RFC 7807 Problem Details
export const ProblemDetailsSchema = z.object({
  type: z.string().url().optional(),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

export const FieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

// =============================================================================
// Capabilities
// =============================================================================

export const CapabilitySchema = z.string();

export const UIHintsSchema = z.object({
  showBookingButton: z.boolean().optional(),
  showPricing: z.boolean().optional(),
  showCalendar: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  showMap: z.boolean().optional(),
});

export const FeatureFlagsSchema = z.record(z.string(), z.boolean());

export const CapabilitiesResponseSchema = z.object({
  capabilities: z.array(CapabilitySchema),
  uiHints: UIHintsSchema.optional(),
  featureFlags: FeatureFlagsSchema.optional(),
});

// Common capability keys
export const CAPABILITIES = {
  // Booking capabilities
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_UPDATE: 'bookings.update',
  BOOKINGS_DELETE: 'bookings.delete',
  BOOKINGS_APPROVE: 'bookings.approve',

  // Rental object capabilities
  LISTINGS_READ: 'listings.read',
  LISTINGS_CREATE: 'listings.create',
  LISTINGS_UPDATE: 'listings.update',
  LISTINGS_DELETE: 'listings.delete',

  // User capabilities
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Admin capabilities
  ADMIN_READ: 'admin.read',
  ADMIN_WRITE: 'admin.write',
  ADMIN_SETTINGS: 'admin.settings',

  // Backoffice capabilities
  BACKOFFICE_ACCESS: 'backoffice.access',
  BACKOFFICE_ORGS_READ: 'backoffice_orgs.read',
  BACKOFFICE_ORGS_WRITE: 'backoffice_orgs.write',
} as const;

// =============================================================================
// Inferred Types
// =============================================================================

export type Pagination = z.infer<typeof PaginationSchema>;
export type PaginatedResponseMeta = z.infer<typeof PaginatedResponseMetaSchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
export type FieldError = z.infer<typeof FieldErrorSchema>;
export type Capability = z.infer<typeof CapabilitySchema>;
export type UIHints = z.infer<typeof UIHintsSchema>;
export type CapabilitiesResponse = z.infer<typeof CapabilitiesResponseSchema>;
export type CapabilityKey = keyof typeof CAPABILITIES;
