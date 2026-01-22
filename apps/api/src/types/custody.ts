/**
 * Custody Types and Schemas
 *
 * Local type definitions for the custody delegation system.
 * These replace imports from the deleted @xalatechnologies/platform/contracts package.
 */

import { z } from 'zod';

// =============================================================================
// Types
// =============================================================================

export type CustodyScope =
  | 'VIEW'
  | 'MANAGE_BOOKINGS'
  | 'MANAGE_CALENDAR'
  | 'MANAGE_PRICING'
  | 'MANAGE_SETTINGS'
  | 'FULL_ACCESS';

export type GranteeType = 'USER' | 'ORG';

// =============================================================================
// Schemas
// =============================================================================

export const CustodyScopeSchema = z.enum([
  'VIEW',
  'MANAGE_BOOKINGS',
  'MANAGE_CALENDAR',
  'MANAGE_PRICING',
  'MANAGE_SETTINGS',
  'FULL_ACCESS',
]);

export const GranteeTypeSchema = z.enum(['USER', 'ORG']);

export const CreateCustodyGrantDTOSchema = z.object({
  granteeType: GranteeTypeSchema,
  granteeId: z.string().uuid(),
  scopes: z.array(CustodyScopeSchema).min(1),
  canSubdelegate: z.boolean().optional().default(false),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  reason: z.string().max(500).optional(),
});

export const BulkAssignCustodyGrantDTOSchema = z.object({
  rentalObjectIds: z.array(z.string().uuid()).min(1),
  granteeType: GranteeTypeSchema,
  granteeId: z.string().uuid(),
  scopes: z.array(CustodyScopeSchema).min(1),
});

export const CreateCustodySubgrantDTOSchema = z.object({
  memberUserId: z.string().uuid(),
  scopes: z.array(CustodyScopeSchema).min(1),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

// =============================================================================
// Inferred Types
// =============================================================================

export type CreateCustodyGrantDTO = z.infer<typeof CreateCustodyGrantDTOSchema>;
export type BulkAssignCustodyGrantDTO = z.infer<typeof BulkAssignCustodyGrantDTOSchema>;
export type CreateCustodySubgrantDTO = z.infer<typeof CreateCustodySubgrantDTOSchema>;
