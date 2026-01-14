/**
 * Upload Types
 * Single Responsibility: All upload-related type definitions
 */

import type { BaseEntity } from './enums';

// =============================================================================
// Upload Progress
// =============================================================================

/**
 * Upload progress event
 * Emitted during file upload to track progress
 */
export interface UploadProgressEvent {
  /** Number of bytes uploaded so far */
  loaded: number;

  /** Total number of bytes to upload */
  total: number;

  /** Upload progress percentage (0-100) */
  percentage: number;

  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;

  /** Upload speed in bytes per second */
  speed?: number;
}

/**
 * Upload progress callback function
 */
export type UploadProgressCallback = (progress: UploadProgressEvent) => void;

// =============================================================================
// Upload Options
// =============================================================================

/**
 * Image compression options
 */
export interface ImageCompressionOptions {
  /** Maximum file size in MB (default: 1) */
  maxSizeMB?: number;

  /** Maximum width or height in pixels (default: 1920) */
  maxWidthOrHeight?: number;

  /** Use web worker for compression (default: true) */
  useWebWorker?: boolean;

  /** Initial quality (0-1, default: 0.8) */
  initialQuality?: number;

  /** File type (default: original file type) */
  fileType?: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Progress callback function */
  onProgress?: UploadProgressCallback;

  /** Whether to compress images before upload (default: true) */
  compress?: boolean;

  /** Image compression options */
  compressionOptions?: ImageCompressionOptions;

  /** Additional form fields to include in the upload */
  fields?: Record<string, string>;

  /** Request timeout in milliseconds */
  timeout?: number;
}

// =============================================================================
// Upload Response
// =============================================================================

/**
 * Uploaded file metadata
 */
export interface UploadedFile {
  /** Original filename */
  originalName: string;

  /** Stored filename */
  filename: string;

  /** Public URL to access the file */
  url: string;

  /** File size in bytes */
  size: number;

  /** MIME type */
  mimeType: string;

  /** File width in pixels (for images) */
  width?: number;

  /** File height in pixels (for images) */
  height?: number;
}

/**
 * Upload response
 */
export interface UploadResponse {
  /** Whether the upload was successful */
  success: boolean;

  /** Uploaded files */
  files: UploadedFile[];

  /** Error message if upload failed */
  error?: string;
}

/**
 * Media upload response (extends BaseEntity for audit trail)
 */
export interface MediaUploadResponse extends BaseEntity {
  /** ID of the entity the media belongs to */
  entityId: string;

  /** Type of entity (listing, organization, user) */
  entityType: 'listing' | 'organization' | 'user';

  /** Uploaded file URLs */
  urls: string[];

  /** Uploaded files metadata */
  files: UploadedFile[];
}

// =============================================================================
// Upload Error Types
// =============================================================================

/**
 * Upload error types
 */
export type UploadErrorType =
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UPLOAD_FAILED'
  | 'COMPRESSION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'VALIDATION_ERROR';

/**
 * Upload error
 */
export interface UploadError {
  /** Error type */
  type: UploadErrorType;

  /** Human-readable error message */
  message: string;

  /** Original filename that failed */
  filename?: string;

  /** Additional error details */
  details?: Record<string, unknown>;
}
