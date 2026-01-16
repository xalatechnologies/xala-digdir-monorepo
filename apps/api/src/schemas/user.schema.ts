/**
 * User Zod Schemas
 * Validation schemas for user domain
 */
import { z } from 'zod';

/**
 * User Role Enum
 */
export const UserRoleSchema = z.enum(['owner', 'tenant_admin', 'org_admin', 'manager', 'member', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * User Status Enum
 */
export const UserStatusSchema = z.enum(['active', 'invited', 'suspended', 'deleted']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

/**
 * Full User Schema
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid().optional().nullable(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  role: UserRoleSchema.default('member'),
  status: UserStatusSchema.default('active'),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.coerce.date(),
  lastLoginAt: z.coerce.date().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Create User DTO
 */
export const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  organizationId: z.string().uuid().optional(),
  role: UserRoleSchema.optional().default('member'),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

/**
 * Invite User DTO
 */
export const InviteUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  organizationId: z.string().uuid().optional(),
  role: UserRoleSchema.optional().default('member'),
  message: z.string().max(1000).optional(),
});

export type InviteUserDTO = z.infer<typeof InviteUserSchema>;

/**
 * Update User DTO
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  organizationId: z.string().uuid().optional().nullable(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

/**
 * Assign Role DTO
 */
export const AssignRoleSchema = z.object({
  role: UserRoleSchema,
});

export type AssignRoleDTO = z.infer<typeof AssignRoleSchema>;

/**
 * User Query Params
 */
export const UserQuerySchema = z.object({
  organizationId: z.string().uuid().optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type UserQueryParams = z.infer<typeof UserQuerySchema>;

/**
 * Consent Preferences Schema
 */
export const ConsentPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export type ConsentPreferences = z.infer<typeof ConsentPreferencesSchema>;

/**
 * User Consents Schema
 */
export const UserConsentsSchema = z.object({
  marketing: z.boolean().optional(),
  analytics: z.boolean().optional(),
  necessary: z.boolean().optional(),
  preferences: ConsentPreferencesSchema.optional(),
});

export type UserConsents = z.infer<typeof UserConsentsSchema>;

/**
 * Update Consents DTO
 */
export const UpdateConsentsSchema = z.object({
  marketing: z.boolean().optional(),
  analytics: z.boolean().optional(),
  necessary: z.boolean().optional(),
  preferences: ConsentPreferencesSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one consent field must be provided' }
);

export type UpdateConsentsDTO = z.infer<typeof UpdateConsentsSchema>;
