/**
 * Image Compression Utilities
 * Wrapper around browser-image-compression with sensible defaults
 */

import imageCompression from 'browser-image-compression';
import type { ImageCompressionOptions, UploadError } from '@/types/upload';

/**
 * Default compression options for images
 */
const DEFAULT_COMPRESSION_OPTIONS: Required<Omit<ImageCompressionOptions, 'fileType'>> = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

/**
 * Compress a single image file
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Compressed File object
 * @throws UploadError if compression fails
 */
export async function compressImage(
  file: File,
  options?: ImageCompressionOptions
): Promise<File> {
  try {
    // Merge with default options
    const compressionOptions = {
      ...DEFAULT_COMPRESSION_OPTIONS,
      ...options,
    };

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    return compressedFile;
  } catch (error) {
    const uploadError: UploadError = {
      type: 'COMPRESSION_FAILED',
      message: error instanceof Error ? error.message : 'Failed to compress image',
      filename: file.name,
      details: { originalError: error },
    };
    throw uploadError;
  }
}

/**
 * Compress multiple image files
 * @param files - Array of image files to compress
 * @param options - Compression options (optional)
 * @returns Array of compressed File objects
 * @throws UploadError if any compression fails
 */
export async function compressImages(
  files: File[],
  options?: ImageCompressionOptions
): Promise<File[]> {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Check if a file is an image
 * @param file - The file to check
 * @returns True if the file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if an image file needs compression
 * @param file - The image file to check
 * @param maxSizeMB - Maximum file size in MB (default: 1)
 * @returns True if the file exceeds the size limit
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > maxSizeMB;
}

/**
 * Get human-readable file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate image file type
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types (default: common image types)
 * @returns True if file type is allowed
 */
export function validateImageType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate image file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @returns True if file size is within limits
 */
export function validateImageSize(file: File, maxSizeMB: number = 10): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): { valid: boolean; error?: UploadError } {
  const maxSizeMB = options?.maxSizeMB ?? 10;
  const allowedTypes = options?.allowedTypes;

  // Check if it's an image
  if (!isImageFile(file)) {
    return {
      valid: false,
      error: {
        type: 'INVALID_FILE_TYPE',
        message: 'File is not an image',
        filename: file.name,
      },
    };
  }

  // Check file type
  if (allowedTypes && !validateImageType(file, allowedTypes)) {
    return {
      valid: false,
      error: {
        type: 'INVALID_FILE_TYPE',
        message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        filename: file.name,
      },
    };
  }

  // Check file size
  if (!validateImageSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: {
        type: 'FILE_TOO_LARGE',
        message: `File size ${formatFileSize(file.size)} exceeds maximum of ${maxSizeMB} MB`,
        filename: file.name,
      },
    };
  }

  return { valid: true };
}
