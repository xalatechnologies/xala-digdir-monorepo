/**
 * User Projections
 *
 * UI-ready projection schemas for users.
 * Domain-specific projections for the Digilist rental booking platform.
 */
import { z } from 'zod';

// =============================================================================
// Card Projection
// =============================================================================

export const UserCardProjectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),

  // Display
  roleLabel: z.string(),
  roleColor: z.string(),
  statusLabel: z.string(),
  statusColor: z.string(),
  initials: z.string(),

  // Avatar
  avatarUrl: z.string().optional(),

  // Organization
  organizationName: z.string().optional(),

  // Status
  isOnline: z.boolean().optional(),
  lastSeenLabel: z.string().optional(),
});

export type UserCardProjection = z.infer<typeof UserCardProjectionSchema>;

// =============================================================================
// Details Projection
// =============================================================================

export const UserDetailsProjectionSchema = UserCardProjectionSchema.extend({
  // Full details
  role: z.string(),
  status: z.string(),

  // Contact (masked for privacy)
  nationalIdMasked: z.string().optional(),
  phone: z.string().optional(),

  // Organization
  organization: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),

  // Activity
  lastLoginAt: z.string().optional(),
  createdAt: z.string(),

  // Stats (domain-specific - booking count)
  stats: z.object({
    bookingCount: z.number(),
    lastBookingAt: z.string().optional(),
  }).optional(),

  // Permissions
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canChangeRole: z.boolean(),
  canSuspend: z.boolean(),

  // Actions
  availableActions: z.array(z.object({
    action: z.string(),
    label: z.string(),
    enabled: z.boolean(),
  })),
});

export type UserDetailsProjection = z.infer<typeof UserDetailsProjectionSchema>;

// =============================================================================
// Current User Projection (for /me endpoint)
// =============================================================================

export const CurrentUserProjectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  roleLabel: z.string(),

  // Avatar
  avatarUrl: z.string().optional(),
  initials: z.string(),

  // Organization
  organization: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),

  // Preferences
  preferences: z.object({
    language: z.string(),
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
  }).optional(),

  // Consents
  consents: z.object({
    marketing: z.boolean(),
    analytics: z.boolean(),
    lastUpdatedAt: z.string().optional(),
  }).optional(),
});

export type CurrentUserProjection = z.infer<typeof CurrentUserProjectionSchema>;
