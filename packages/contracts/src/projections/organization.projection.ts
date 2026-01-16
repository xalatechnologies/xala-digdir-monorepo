/**
 * Organization Projections
 *
 * UI-ready projection schemas for organizations.
 */
import { z } from 'zod';

// =============================================================================
// Card Projection
// =============================================================================

export const OrganizationCardProjectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  
  // Display
  typeLabel: z.string(),
  memberCountLabel: z.string(),
  initials: z.string(),
  
  // Branding
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  
  // Status
  status: z.string(),
  statusLabel: z.string(),
  
  // Computed
  isActive: z.boolean(),
});

export type OrganizationCardProjection = z.infer<typeof OrganizationCardProjectionSchema>;

// =============================================================================
// Details Projection
// =============================================================================

export const OrganizationDetailsProjectionSchema = OrganizationCardProjectionSchema.extend({
  // Type
  type: z.string(),
  
  // Branding
  branding: z.object({
    logo: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    favicon: z.string().optional(),
  }).optional(),
  
  // Stats
  stats: z.object({
    memberCount: z.number(),
    rentalObjectCount: z.number(),
    bookingCount: z.number(),
  }).optional(),
  
  // Members preview
  members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    roleLabel: z.string(),
  })).optional(),
  
  // Permissions
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canManageMembers: z.boolean(),
  
  // Meta
  createdAt: z.string(),
});

export type OrganizationDetailsProjection = z.infer<typeof OrganizationDetailsProjectionSchema>;

// =============================================================================
// Member Projection
// =============================================================================

export const MemberProjectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  roleLabel: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  joinedAt: z.string(),
  lastActiveAt: z.string().optional(),
  avatarUrl: z.string().optional(),
  initials: z.string(),
});

export type MemberProjection = z.infer<typeof MemberProjectionSchema>;
