/**
 * User Group Zod Schemas
 * Validation schemas for user group domain
 */
import { z } from 'zod';

/**
 * User Group Code Enum
 */
export const UserGroupCodeSchema = z.enum(['U19', 'ADULT_ORG', 'OTHER']);
export type UserGroupCode = z.infer<typeof UserGroupCodeSchema>;

/**
 * User Group Schema
 */
export const UserGroupSchema = z.object({
  id: z.string().uuid(),
  code: UserGroupCodeSchema,
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type UserGroup = z.infer<typeof UserGroupSchema>;

/**
 * Create User Group DTO
 */
export const CreateUserGroupSchema = z.object({
  code: UserGroupCodeSchema,
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type CreateUserGroupDTO = z.infer<typeof CreateUserGroupSchema>;
