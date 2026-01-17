/**
 * Advanced Contracts Validation Schemas (Zod)
 * Validates request bodies for advanced feature endpoints
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { z } from 'zod';

// =============================================================================
// Search Schema
// =============================================================================

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(200),
  types: z.array(z.enum(['rental_object', 'booking', 'organization', 'user'])).optional(),
  filters: z.object({
    status: z.string().optional(),
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// =============================================================================
// GDPR Schemas
// =============================================================================

export const CreateDSARRequestSchema = z.object({
  email: z.string().email(),
  categories: z.array(z.string()).optional(),
  reason: z.string().max(500).optional(),
});

export type CreateDSARRequest = z.infer<typeof CreateDSARRequestSchema>;

export const UpdateConsentRequestSchema = z.object({
  consentType: z.string().min(1).max(100),
  granted: z.boolean(),
});

export type UpdateConsentRequest = z.infer<typeof UpdateConsentRequestSchema>;

// =============================================================================
// Reports Schemas
// =============================================================================

export const GenerateReportRequestSchema = z.object({
  type: z.enum(['BOOKINGS', 'REVENUE', 'USAGE', 'AUDIT']),
  format: z.enum(['PDF', 'XLSX', 'CSV', 'JSON']),
  parameters: z.object({
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    rentalObjectIds: z.array(z.string().uuid()).optional(),
    organizationIds: z.array(z.string().uuid()).optional(),
    groupBy: z.enum(['DAY', 'WEEK', 'MONTH']).optional(),
  }),
});

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;

// =============================================================================
// Season Rentals Schemas
// =============================================================================

export const ApplyForSeasonRequestSchema = z.object({
  orgId: z.string().uuid().optional(),
  preferredSlots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    rank: z.number().int().min(1).max(10),
  })).min(1).max(5),
  notes: z.string().max(1000).optional(),
});

export type ApplyForSeasonRequest = z.infer<typeof ApplyForSeasonRequestSchema>;

// =============================================================================
// Org Context Schemas
// =============================================================================

export const SetOrgContextRequestSchema = z.object({
  type: z.enum(['PRIVATE', 'MEMBERSHIP_ORG']),
  orgId: z.string().uuid().optional(),
}).refine((data) => {
  if (data.type === 'MEMBERSHIP_ORG' && !data.orgId) {
    return false;
  }
  return true;
}, {
  message: 'orgId is required when type is MEMBERSHIP_ORG',
  path: ['orgId'],
});

export type SetOrgContextRequest = z.infer<typeof SetOrgContextRequestSchema>;
