/**
 * Base Service
 * Open/Closed: Base class that can be extended for domain services
 * Liskov Substitution: All services can be used interchangeably
 */

import type { IHttpClient } from '../core/http-client.interface';
import { getClient } from '../core/client-factory';
import type { MediaUploadResponse, UploadOptions } from '../types/upload';

export abstract class BaseService {
  protected readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  protected get client(): IHttpClient {
    return getClient();
  }

  protected buildPath(path: string = ''): string {
    return `${this.basePath}${path}`;
  }

  /**
   * Upload media files to the API
   * @param path - API path (e.g., '/:id/media')
   * @param files - Files to upload
   * @param options - Upload options (fields, etc.)
   * @returns MediaUploadResponse with uploaded file details
   */
  protected async uploadMedia(
    path: string,
    files: File[],
    options?: UploadOptions
  ): Promise<MediaUploadResponse> {
    // Create FormData for multipart/form-data upload
    const formData = new FormData();

    // Add files to FormData
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Add additional form fields if provided
    if (options?.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Make POST request with FormData
    return this.client.post<MediaUploadResponse>(
      this.buildPath(path),
      formData
    );
  }
}
