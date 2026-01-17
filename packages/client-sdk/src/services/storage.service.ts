/**
 * Storage Service
 * Client SDK service for file upload/download operations
 */

import { BaseService } from '../core/base-service';
import type {
  UploadFileResponse,
  UploadMultipleFilesResponse,
  ListFilesQuery,
  ListFilesResponse,
  UpdateFileMetadataRequest,
  FileUploadInput,
} from '@xala/contracts/storage';

export class StorageService extends BaseService {
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

    const response = await this.http.post<UploadFileResponse>(
      '/api/storage/upload',
      formData,
      {
        headers: {
          // Let browser set Content-Type with boundary for multipart
          'Content-Type': undefined,
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[]): Promise<UploadMultipleFilesResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.http.post<UploadMultipleFilesResponse>(
      '/api/storage/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      }
    );

    return response.data;
  }

  /**
   * List files
   */
  async listFiles(query: ListFilesQuery = {}): Promise<ListFilesResponse> {
    const response = await this.http.get<ListFilesResponse>(
      '/api/storage/files',
      { params: query }
    );

    return response.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.http.delete(`/api/storage/files/${fileId}`);
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    updates: UpdateFileMetadataRequest
  ): Promise<UploadFileResponse> {
    const response = await this.http.patch<UploadFileResponse>(
      `/api/storage/files/${fileId}`,
      updates
    );

    return response.data;
  }

  /**
   * Get file URL for display
   * Converts relative paths to absolute URLs
   */
  getFileUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Handle both /storage/... and /seed-images/... formats
    if (path.startsWith('/storage/')) {
      return `${this.http.defaults.baseURL}${path}`;
    }
    
    if (path.startsWith('/seed-images/')) {
      return `${this.http.defaults.baseURL}/storage${path}`;
    }
    
    return `${this.http.defaults.baseURL}/storage${path}`;
  }
}
