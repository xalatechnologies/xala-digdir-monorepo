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
   * HTTP GET request
   */
  public async get<T>(path: string, config?: { params?: any }): Promise<T> {
    const url = this.buildPath(path);
    return this.client.get<T>(url, config);
  }

  /**
   * HTTP POST request
   */
  public async post<T>(path: string, data?: any, config?: any): Promise<T> {
    const url = this.buildPath(path);
    return this.client.post<T>(url, data, config);
  }

  /**
   * HTTP PUT request
   */
  public async put<T>(path: string, data?: any, config?: any): Promise<T> {
    const url = this.buildPath(path);
    return this.client.put<T>(url, data, config);
  }

  /**
   * HTTP PATCH request
   */
  public async patch<T>(path: string, data?: any, config?: any): Promise<T> {
    const url = this.buildPath(path);
    return this.client.patch<T>(url, data, config);
  }

  /**
   * HTTP DELETE request
   */
  public async delete<T = void>(path: string, config?: any): Promise<T> {
    const url = this.buildPath(path);
    return this.client.delete<T>(url, config);
  }

  /**
   * Upload media files to the API
   * @param path - API path (e.g., '/:id/media')
   * @param files - Files to upload
   * @param options - Upload options (fields, etc.)
   * @returns MediaUploadResponse with uploaded file details
   */
  public async uploadMedia(
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
