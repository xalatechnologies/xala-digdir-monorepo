/**
 * Organization Schemas
 *
 * Domain-specific contract definitions for organizations (kommune/municipality).
 * These are Digilist-specific organizational structures.
 */
import { z } from 'zod';
import {
  UUIDSchema,
  SlugSchema,
  TimestampsSchema,
  PaginationSchema,
  SortOrderSchema,
} from './base.schema';

// =============================================================================
// Enums
// =============================================================================

export const OrganizationTypeSchema = z.enum([
  'organization',
  'municipality',
  'company',
  'association',
  'club',
]);

export type OrganizationType = z.infer<typeof OrganizationTypeSchema>;

export const OrganizationStatusSchema = z.enum([
  'active',
  'pending',
  'suspended',
  'deleted',
]);

export type OrganizationStatus = z.infer<typeof OrganizationStatusSchema>;

// =============================================================================
// Settings & Branding
// =============================================================================

export const BrandingSchema = z.object({
  logo: z.string().url().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  favicon: z.string().url().optional(),
});

export type Branding = z.infer<typeof BrandingSchema>;

export const OrganizationSettingsSchema = z.object({
  branding: BrandingSchema.optional(),
  features: z.record(z.boolean()).optional(),
  bookingRules: z.object({
    maxAdvanceBookingDays: z.number().int().positive().optional(),
    minAdvanceBookingHours: z.number().int().nonnegative().optional(),
    requireApproval: z.boolean().optional(),
  }).optional(),
});

export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;

// =============================================================================
// Full Organization Schema
// =============================================================================

export const OrganizationSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  name: z.string().min(1).max(255),
  slug: SlugSchema,
  type: OrganizationTypeSchema.default('organization'),
  status: OrganizationStatusSchema.default('active'),
  settings: OrganizationSettingsSchema.optional().default({}),
  memberCount: z.number().int().nonnegative().optional(),
}).merge(TimestampsSchema);

export type Organization = z.infer<typeof OrganizationSchema>;

// =============================================================================
// Create DTO
// =============================================================================

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: SlugSchema.optional(),
  type: OrganizationTypeSchema.optional().default('organization'),
  settings: OrganizationSettingsSchema.optional(),
  branding: BrandingSchema.optional(),
  actorType: z.string().optional(),
});

export type CreateOrganizationDTO = z.infer<typeof CreateOrganizationSchema>;

// =============================================================================
// Update DTO
// =============================================================================

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: SlugSchema.optional(),
  type: OrganizationTypeSchema.optional(),
  status: OrganizationStatusSchema.optional(),
  settings: OrganizationSettingsSchema.optional(),
});

export type UpdateOrganizationDTO = z.infer<typeof UpdateOrganizationSchema>;

// =============================================================================
// Query Parameters
// =============================================================================

export const OrganizationQuerySchema = PaginationSchema.extend({
  type: OrganizationTypeSchema.optional(),
  status: OrganizationStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'memberCount']).optional().default('name'),
  sortOrder: SortOrderSchema.optional().default('asc'),
});

export type OrganizationQueryParams = z.infer<typeof OrganizationQuerySchema>;
