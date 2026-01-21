import { z } from 'zod';
import {
  RentalObjectStatusSchema,
  RentalObjectTypeSchema,
  RentalObjectPricingSchema,
  RentalObjectLocationSchema,
  RentalObjectAmenitiesSchema,
  RentalObjectDimensionsSchema,
} from '../schemas/rental-object';

/**
 * Rental Object List Item Projection
 *
 * Used for displaying rental objects in lists and search results.
 * Contains essential information for cards and table rows.
 */
export const RentalObjectListProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema,
  organizationId: z.string().uuid(),
  organizationName: z.string().optional(),
  location: z
    .object({
      harborName: z.string().optional(),
      pier: z.string().optional(),
      position: z.string().optional(),
    })
    .nullable(),
  pricing: z.object({
    basePrice: z.number(),
    currency: z.string(),
    priceUnit: z.string(),
  }),
  thumbnailUrl: z.string().url().nullable(),
  isAvailable: z.boolean(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
    })
    .nullable(),
  updatedAt: z.coerce.date(),
});

export type RentalObjectListProjection = z.infer<typeof RentalObjectListProjectionSchema>;

/**
 * Rental Object Detail Projection
 *
 * Used for displaying full rental object details on detail pages.
 * Includes all information and related entities.
 */
export const RentalObjectDetailProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema,
  organizationId: z.string().uuid(),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
    logoUrl: z.string().url().nullable(),
  }),
  dimensions: RentalObjectDimensionsSchema.nullable(),
  pricing: RentalObjectPricingSchema,
  location: RentalObjectLocationSchema.nullable(),
  amenities: RentalObjectAmenitiesSchema.nullable(),
  maxCapacity: z.number().nullable(),
  images: z.array(z.string().url()),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  // Availability info
  availability: z.object({
    isCurrentlyAvailable: z.boolean(),
    nextAvailableDate: z.coerce.date().nullable(),
    hasActiveAllocation: z.boolean(),
    hasUpcomingBookings: z.boolean(),
  }),
  // Statistics
  statistics: z
    .object({
      totalBookings: z.number(),
      averageRating: z.number().nullable(),
      occupancyRate: z.number(),
    })
    .nullable(),
  // Permissions for the current user
  permissions: z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canManageBookings: z.boolean(),
    canManageAllocations: z.boolean(),
  }),
  // Available actions
  availableActions: z.array(
    z.enum([
      'edit',
      'delete',
      'archive',
      'restore',
      'set_maintenance',
      'create_booking',
      'create_allocation',
      'view_calendar',
      'view_history',
    ])
  ),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type RentalObjectDetailProjection = z.infer<typeof RentalObjectDetailProjectionSchema>;

/**
 * Rental Object Card Projection
 *
 * Used for displaying rental objects in card grids on the public-facing site.
 * Optimized for quick loading and visual display.
 */
export const RentalObjectCardProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema,
  thumbnailUrl: z.string().url().nullable(),
  location: z
    .object({
      harborName: z.string().optional(),
      pier: z.string().optional(),
    })
    .nullable(),
  pricing: z.object({
    basePrice: z.number(),
    currency: z.string(),
    priceUnit: z.string(),
    formattedPrice: z.string(),
  }),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      displayText: z.string(),
    })
    .nullable(),
  amenities: z.object({
    hasElectricity: z.boolean(),
    hasWater: z.boolean(),
    amenityCount: z.number(),
  }),
  isAvailable: z.boolean(),
  availabilityText: z.string(),
});

export type RentalObjectCardProjection = z.infer<typeof RentalObjectCardProjectionSchema>;

/**
 * Rental Object Select Option Projection
 *
 * Used for dropdown selects and autocomplete fields.
 * Minimal data for quick loading in forms.
 */
export const RentalObjectSelectProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema,
  location: z
    .object({
      harborName: z.string().optional(),
      pier: z.string().optional(),
      position: z.string().optional(),
    })
    .nullable(),
  isAvailable: z.boolean(),
  displayLabel: z.string(),
});

export type RentalObjectSelectProjection = z.infer<typeof RentalObjectSelectProjectionSchema>;

/**
 * Rental Object Calendar Projection
 *
 * Used for calendar views showing allocations and bookings.
 */
export const RentalObjectCalendarProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: RentalObjectTypeSchema,
  pier: z.string().nullable(),
  position: z.string().nullable(),
  events: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(['booking', 'allocation', 'maintenance']),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      title: z.string(),
      status: z.string(),
      color: z.string().optional(),
    })
  ),
});

export type RentalObjectCalendarProjection = z.infer<typeof RentalObjectCalendarProjectionSchema>;

/**
 * Rental Object Map Marker Projection
 *
 * Used for displaying rental objects on a map.
 */
export const RentalObjectMapMarkerProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: RentalObjectTypeSchema,
  status: RentalObjectStatusSchema,
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  isAvailable: z.boolean(),
  pricing: z.object({
    formattedPrice: z.string(),
  }),
});

export type RentalObjectMapMarkerProjection = z.infer<typeof RentalObjectMapMarkerProjectionSchema>;
