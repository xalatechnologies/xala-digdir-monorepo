/**
 * Storage Service
 * Client SDK service for file upload/download operations
 */

import { BaseService } from './base.service';
import { getClientConfig } from '@/core/client-factory';
import type {
  UploadFileResponse,
  UploadMultipleFilesResponse,
  ListFilesQuery,
  ListFilesResponse,
  UpdateFileMetadataRequest,
  FileUploadInput,
} from '@/types/storage.types';

export class StorageService extends BaseService {
  constructor() {
    super('/api/storage');
  }

  /**
   * Upload a single file
   */
  async uploadFile(input: FileUploadInput): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', input.file);

    if (input.category) formData.append('category', input.category);
    if (input.entityType) formData.append('entityType', input.entityType);
    if (input.entityId) formData.append('entityId', input.entityId);
    if (input.altText) formData.append('altText', input.altText);
    if (input.caption) formData.append('caption', input.caption);

    return this.client.post<UploadFileResponse>(
      '/api/storage/upload',
      formData
    );
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[]): Promise<UploadMultipleFilesResponse> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.client.post<UploadMultipleFilesResponse>(
      '/api/storage/upload-multiple',
      formData
    );
  }

  /**
   * List files
   */
  async listFiles(query: ListFilesQuery = {}): Promise<ListFilesResponse> {
    return this.client.get<ListFilesResponse>(
      '/api/storage/files',
      { params: query as Record<string, string | number | boolean | undefined> }
    );
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.client.delete(`/api/storage/files/${fileId}`);
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    updates: UpdateFileMetadataRequest
  ): Promise<UploadFileResponse> {
    return this.client.patch<UploadFileResponse>(
      `/api/storage/files/${fileId}`,
      updates
    );
  }

  /**
   * Get file URL for display
   * Converts relative paths to absolute URLs
   */
  getFileUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const config = getClientConfig();
    const baseURL = config?.baseUrl || '';

    // Handle both /storage/... and /seed-images/... formats
    if (path.startsWith('/storage/')) {
      return `${baseURL}${path}`;
    }

    if (path.startsWith('/seed-images/')) {
      return `${baseURL}/storage${path}`;
    }

    return `${baseURL}/storage${path}`;
  }
}
