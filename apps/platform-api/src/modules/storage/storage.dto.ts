/**
 * Storage API DTOs
 * Request/Response contracts for file upload endpoints
 */

import { z } from 'zod';

/**
 * Upload File Request (multipart/form-data)
 */
export const UploadFileRequestSchema = z.object({
  // Files come from multipart form data
  tenantId: z.string().uuid(),
  category: z.enum(['rental-object-image', 'rental-object-document', 'user-avatar', 'organization-logo', 'attachment']),
  entityType: z.enum(['rental_object', 'organization', 'user', 'booking']).optional(),
  entityId: z.string().uuid().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
});

export type UploadFileRequest = z.infer<typeof UploadFileRequestSchema>;

/**
 * Upload File Response
 */
export const UploadFileResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  filename: z.string(),
  originalFilename: z.string(),
  mimetype: z.string(),
  sizeBytes: z.number(),
  category: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  createdAt: z.string(),
});

export type UploadFileResponse = z.infer<typeof UploadFileResponseSchema>;

/**
 * Upload Multiple Files Response
 */
export const UploadMultipleFilesResponseSchema = z.object({
  files: z.array(UploadFileResponseSchema),
  totalUploaded: z.number(),
  totalFailed: z.number(),
  errors: z.array(z.object({
    filename: z.string(),
    error: z.string(),
  })).optional(),
});

export type UploadMultipleFilesResponse = z.infer<typeof UploadMultipleFilesResponseSchema>;

/**
 * List Files Query
 */
export const ListFilesQuerySchema = z.object({
  tenantId: z.string().uuid().optional(),
  category: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ListFilesQuery = z.infer<typeof ListFilesQuerySchema>;

/**
 * List Files Response
 */
export const ListFilesResponseSchema = z.object({
  data: z.array(UploadFileResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type ListFilesResponse = z.infer<typeof ListFilesResponseSchema>;

/**
 * Delete File Request
 */
export const DeleteFileRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export type DeleteFileRequest = z.infer<typeof DeleteFileRequestSchema>;

/**
 * Update File Metadata Request
 */
export const UpdateFileMetadataRequestSchema = z.object({
  altText: z.string().optional(),
  caption: z.string().optional(),
});

export type UpdateFileMetadataRequest = z.infer<typeof UpdateFileMetadataRequestSchema>;
