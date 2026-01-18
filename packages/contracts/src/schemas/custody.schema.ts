import { z } from 'zod';
import { UUIDSchema } from './common.schema';

/**
 * Custody Scopes
 */
export const CustodyScopeSchema = z.enum([
  'RO_VIEW',
  'RO_EDIT',
  'RO_MEDIA',
  'RO_MAINTENANCE',
  'RO_BOOKING_MANAGE',
  'RO_PRICING',
  'RO_REPORTING',
  'RO_DELEGATE',
]);

export type CustodyScope = z.infer<typeof CustodyScopeSchema>;

export const GranteeTypeSchema = z.enum(['USER', 'ORG']);
export type GranteeType = z.infer<typeof GranteeTypeSchema>;

/**
 * Custody Grant
 */
export const CustodyGrantSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  rentalObjectId: UUIDSchema,
  granteeType: GranteeTypeSchema,
  granteeId: UUIDSchema,
  scopes: z.array(CustodyScopeSchema),
  canSubdelegate: z.boolean(),
  effectiveFrom: z.coerce.date().nullable().optional(),
  effectiveTo: z.coerce.date().nullable().optional(),
  reason: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'REVOKED']),
  createdByUserId: UUIDSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullable().optional(),
  revokedByUserId: UUIDSchema.nullable().optional(),
});

export type CustodyGrant = z.infer<typeof CustodyGrantSchema>;

/**
 * Custody Subgrant
 */
export const CustodySubgrantSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  parentGrantId: UUIDSchema,
  orgId: UUIDSchema,
  memberUserId: UUIDSchema,
  scopes: z.array(CustodyScopeSchema),
  effectiveFrom: z.coerce.date().nullable().optional(),
  effectiveTo: z.coerce.date().nullable().optional(),
  status: z.enum(['ACTIVE', 'REVOKED']),
  createdByUserId: UUIDSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CustodySubgrant = z.infer<typeof CustodySubgrantSchema>;

/**
 * Create Custody Grant DTO
 */
export const CreateCustodyGrantDTOSchema = z.object({
  granteeType: GranteeTypeSchema,
  granteeId: UUIDSchema,
  scopes: z.array(CustodyScopeSchema),
  canSubdelegate: z.boolean().optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  reason: z.string().optional(),
});

export type CreateCustodyGrantDTO = z.infer<typeof CreateCustodyGrantDTOSchema>;

/**
 * Bulk Assign Custody Grant DTO
 */
export const BulkAssignCustodyGrantDTOSchema = z.object({
  rentalObjectIds: z.array(UUIDSchema),
  granteeType: GranteeTypeSchema,
  granteeId: UUIDSchema,
  scopes: z.array(CustodyScopeSchema),
});

export type BulkAssignCustodyGrantDTO = z.infer<typeof BulkAssignCustodyGrantDTOSchema>;

/**
 * Create Custody Subgrant DTO
 */
export const CreateCustodySubgrantDTOSchema = z.object({
  memberUserId: UUIDSchema,
  scopes: z.array(CustodyScopeSchema),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

export type CreateCustodySubgrantDTO = z.infer<typeof CreateCustodySubgrantDTOSchema>;
