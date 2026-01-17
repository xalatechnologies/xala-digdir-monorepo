/**
 * Storage Contracts
 * Shared TypeScript types for file upload/management
 * Used by both API and Client SDK
 */

export interface UploadFileRequest {
  tenantId: string;
  category: 'rental-object-image' | 'rental-object-document' | 'user-avatar' | 'organization-logo' | 'attachment';
  entityType?: 'rental_object' | 'organization' | 'user' | 'booking';
  entityId?: string;
  altText?: string;
  caption?: string;
}

export interface UploadFileResponse {
  id: string;
  url: string;
  filename: string;
  originalFilename: string;
  mimetype: string;
  sizeBytes: number;
  category: string;
  entityType?: string;
  entityId?: string;
  altText?: string;
  caption?: string;
  createdAt: string;
}

export interface UploadMultipleFilesResponse {
  files: UploadFileResponse[];
  totalUploaded: number;
  totalFailed: number;
  errors?: Array<{
    filename: string;
    error: string;
  }>;
}

export interface ListFilesQuery {
  tenantId?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}

export interface ListFilesResponse {
  data: UploadFileResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateFileMetadataRequest {
  altText?: string;
  caption?: string;
}

/**
 * Client-side file with File object
 */
export interface FileUploadInput {
  file: File;
  category?: string;
  entityType?: string;
  entityId?: string;
  altText?: string;
  caption?: string;
}
