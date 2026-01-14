/**
 * Tenant Zod Schemas
 * Validation schemas for tenant domain
 */
import { z } from 'zod';

/**
 * Tenant Status Enum
 */
export const TenantStatusSchema = z.enum(['active', 'suspended', 'deleted']);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

/**
 * Tenant Settings Schema
 */
export const TenantSettingsSchema = z.object({
  features: z.object({
    rbac: z.boolean().default(true),
    invitations: z.boolean().default(true),
    auditLogs: z.boolean().default(true),
  }).optional(),
  branding: z.object({
    primaryColor: z.string().optional(),
    name: z.string().optional(),
    logo: z.string().url().optional(),
  }).optional(),
  notifications: z.object({
    emailEnabled: z.boolean().default(true),
    slackEnabled: z.boolean().default(false),
  }).optional(),
}).passthrough();

/**
 * Full Tenant Schema
 */
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').max(100),
  domain: z.string().max(255).optional().nullable(),
  settings: TenantSettingsSchema.optional().default({}),
  status: TenantStatusSchema.default('active'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

/**
 * Create Tenant DTO
 */
export const CreateTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  domain: z.string().max(255).optional(),
  settings: TenantSettingsSchema.optional(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(1).max(255),
  plan: z.enum(['free', 'pro', 'enterprise']).optional().default('free'),
});

export type CreateTenantDTO = z.infer<typeof CreateTenantSchema>;

/**
 * Update Tenant DTO
 */
export const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z.string().max(255).optional().nullable(),
  settings: TenantSettingsSchema.optional(),
  status: TenantStatusSchema.optional(),
});

export type UpdateTenantDTO = z.infer<typeof UpdateTenantSchema>;

/**
 * Tenant Query Params
 */
export const TenantQuerySchema = z.object({
  status: TenantStatusSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type TenantQueryParams = z.infer<typeof TenantQuerySchema>;
