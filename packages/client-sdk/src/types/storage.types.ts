/**
 * Storage Types
 * Type definitions for file storage operations
 */

export interface FileUploadInput {
  file: File;
  category?: string;
  entityType?: string;
  entityId?: string;
  altText?: string;
  caption?: string;
}

export interface UploadFileResponse {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  altText?: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface UploadMultipleFilesResponse {
  files: UploadFileResponse[];
  failed: Array<{ filename: string; error: string }>;
}

export interface ListFilesQuery {
  page?: number;
  limit?: number;
  category?: string;
  entityType?: string;
  entityId?: string;
  search?: string;
  sortBy?: 'filename' | 'uploadedAt' | 'size';
  sortOrder?: 'asc' | 'desc';
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
  category?: string;
}
