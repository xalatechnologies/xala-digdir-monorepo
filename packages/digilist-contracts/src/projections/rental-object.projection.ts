/**
 * Rental Object Projections
 *
 * UI-ready projection schemas for rental objects.
 * These are display-optimized DTOs with pre-computed fields.
 */
import { z } from 'zod';

// =============================================================================
// Card Projection (for lists/grids)
// =============================================================================

export const RentalObjectCardProjectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),

  // Pre-computed display strings
  typeLabel: z.string(),
  categoryI18nKey: z.string(),
  locationFormatted: z.string().optional(),
  priceDisplay: z.string(),
  capacityLabel: z.string().optional(),

  // Media
  primaryImageUrl: z.string().optional(),

  // Truncated content
  descriptionExcerpt: z.string().optional(),

  // Computed states
  isAvailable: z.boolean(),
  isFeatured: z.boolean().optional(),

  // Tags
  tags: z.array(z.string()).optional(),
});

export type RentalObjectCardProjection = z.infer<typeof RentalObjectCardProjectionSchema>;

// =============================================================================
// Details Projection (for detail pages)
// =============================================================================

export const RentalObjectDetailsProjectionSchema = RentalObjectCardProjectionSchema.extend({
  // Full content
  description: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })),

  // Location details
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    municipality: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),

  // Pricing
  pricing: z.object({
    basePrice: z.number(),
    currency: z.string(),
    unit: z.string(),
    unitLabel: z.string(),
    formattedPrice: z.string(),
  }).optional(),

  // Opening hours
  openingHours: z.array(z.object({
    day: z.string(),
    dayLabel: z.string(),
    hoursDisplay: z.string(),
    isClosed: z.boolean(),
  })).optional(),

  // Features
  features: z.array(z.object({
    key: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })).optional(),

  // Rules
  rules: z.object({
    cancellation: z.string().optional(),
    deposit: z.string().optional(),
    ageRequirement: z.string().optional(),
  }).optional(),

  // Permissions (from RBAC layer)
  canBook: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean().optional(),

  // Available actions
  availableActions: z.array(z.object({
    action: z.string(),
    label: z.string(),
    enabled: z.boolean(),
    reason: z.string().optional(),
  })).optional(),

  // Booking widget config
  bookingConfig: z.object({
    timeMode: z.string(),
    minAdvanceHours: z.number().optional(),
    maxAdvanceDays: z.number().optional(),
    slotDurationMinutes: z.number().optional(),
  }).optional(),
});

export type RentalObjectDetailsProjection = z.infer<typeof RentalObjectDetailsProjectionSchema>;

// =============================================================================
// Search Result Projection
// =============================================================================

export const RentalObjectSearchResultProjectionSchema = RentalObjectCardProjectionSchema.extend({
  score: z.number().optional(),
  highlights: z.record(z.array(z.string())).optional(),
});

export type RentalObjectSearchResultProjection = z.infer<typeof RentalObjectSearchResultProjectionSchema>;
