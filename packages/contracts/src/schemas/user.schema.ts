/**
 * User Schemas
 *
 * Contract definitions for users.
 */
import { z } from 'zod';
import {
  UUIDSchema,
  MetadataSchema,
  TimestampsSchema,
  PaginationSchema,
  SortOrderSchema,
} from './common.schema';

// =============================================================================
// Enums
// =============================================================================

export const UserRoleSchema = z.enum([
  'owner',
  'tenant_admin',
  'admin',
  'org_admin',
  'manager',
  'case_handler',
  'saksbehandler',
  'member',
  'viewer',
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum([
  'active',
  'invited',
  'pending_invitation',
  'suspended',
  'deleted',
]);

export type UserStatus = z.infer<typeof UserStatusSchema>;

// =============================================================================
// Full User Schema
// =============================================================================

export const UserSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  organizationId: UUIDSchema.optional().nullable(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  nationalId: z.string().optional().nullable(),
  role: UserRoleSchema.default('member'),
  status: UserStatusSchema.default('active'),
  metadata: MetadataSchema,
  lastLoginAt: z.coerce.date().optional().nullable(),
}).merge(TimestampsSchema);

export type User = z.infer<typeof UserSchema>;

// =============================================================================
// Create DTO
// =============================================================================

export const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  organizationId: UUIDSchema.optional(),
  nationalId: z.string().optional(),
  role: UserRoleSchema.optional().default('member'),
  metadata: MetadataSchema.optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

// =============================================================================
// Invite DTO
// =============================================================================

export const InviteUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  organizationId: UUIDSchema.optional(),
  role: UserRoleSchema.optional().default('member'),
  message: z.string().max(1000).optional(),
  invitedByUserId: z.string().optional(),
});

export type InviteUserDTO = z.infer<typeof InviteUserSchema>;

// =============================================================================
// Update DTO
// =============================================================================

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  organizationId: UUIDSchema.optional().nullable(),
  nationalId: z.string().optional().nullable(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  metadata: MetadataSchema.optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

// =============================================================================
// Assign Role DTO
// =============================================================================

export const AssignRoleSchema = z.object({
  role: UserRoleSchema,
});

export type AssignRoleDTO = z.infer<typeof AssignRoleSchema>;

// =============================================================================
// Query Parameters
// =============================================================================

export const UserQuerySchema = PaginationSchema.extend({
  organizationId: UUIDSchema.optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).optional().default('name'),
  sortOrder: SortOrderSchema.optional().default('asc'),
});

export type UserQueryParams = z.infer<typeof UserQuerySchema>;

// =============================================================================
// Consent Preferences (GDPR)
// =============================================================================

export const ConsentPreferencesSchema = z.object({
  marketing: z.boolean().default(false),
  analytics: z.boolean().default(false),
  thirdParty: z.boolean().default(false),
  dataProcessing: z.boolean().default(true),
});

export type ConsentPreferences = z.infer<typeof ConsentPreferencesSchema>;
