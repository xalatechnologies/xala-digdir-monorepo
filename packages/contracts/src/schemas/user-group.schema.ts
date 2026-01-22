/**
 * @digilist/contracts - User Group Schema
 *
 * Validation schemas for user group domain.
 * User groups define categories of users for pricing and access control.
 */
import { z } from 'zod';

import { UUIDSchema } from './base.schema';

// =====================================================================
// ENUMS
// =====================================================================

/**
 * User Group Code Enum
 * Predefined group codes for common user segments
 */
export const UserGroupCodeSchema = z.enum(['U19', 'ADULT_ORG', 'OTHER']);
export type UserGroupCode = z.infer<typeof UserGroupCodeSchema>;

// =====================================================================
// MAIN ENTITY SCHEMAS
// =====================================================================

/**
 * User Group Schema
 */
export const UserGroupSchema = z.object({
  id: UUIDSchema,
  code: UserGroupCodeSchema,
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type UserGroup = z.infer<typeof UserGroupSchema>;

// =====================================================================
// DTOs
// =====================================================================

/**
 * Create User Group DTO
 */
export const CreateUserGroupSchema = z.object({
  code: UserGroupCodeSchema,
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type CreateUserGroupDTO = z.infer<typeof CreateUserGroupSchema>;

/**
 * Update User Group DTO
 */
export const UpdateUserGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
});

export type UpdateUserGroupDTO = z.infer<typeof UpdateUserGroupSchema>;

// =====================================================================
// QUERY SCHEMAS
// =====================================================================

/**
 * User Groups Query Schema
 */
export const UserGroupsQuerySchema = z.object({
  code: UserGroupCodeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UserGroupsQuery = z.infer<typeof UserGroupsQuerySchema>;
