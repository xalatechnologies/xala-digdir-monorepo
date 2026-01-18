/**
 * Navigation Types
 * TypeScript types and Zod schemas for admin navigation
 */

import { z } from 'zod';

// ============================================================================
// Admin Menu Item
// ============================================================================

export const AdminMenuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string(),
  order: z.number(),
  permission: z.string(),
});

export type AdminMenuItem = z.infer<typeof AdminMenuItemSchema>;

// ============================================================================
// Current User Context
// ============================================================================

export const CurrentUserSchema = z.object({
  id: z.string(),
  role: z.string(),
  tenantId: z.string().nullable(),
  organizationId: z.string().nullable(),
});

export type CurrentUser = z.infer<typeof CurrentUserSchema>;

// ============================================================================
// Navigation Response
// ============================================================================

export const NavigationResponseSchema = z.object({
  currentUser: CurrentUserSchema,
  permissions: z.array(z.string()),
  menu: z.array(AdminMenuItemSchema),
  featureFlags: z.record(z.string(), z.boolean()),
});

export type NavigationResponse = z.infer<typeof NavigationResponseSchema>;

// ============================================================================
// API Response Wrapper
// ============================================================================

export const NavigationApiResponseSchema = z.object({
  data: NavigationResponseSchema,
});

export type NavigationApiResponse = z.infer<typeof NavigationApiResponseSchema>;
