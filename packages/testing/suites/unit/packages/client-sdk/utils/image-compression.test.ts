/**
 * Unit Tests for Image Compression Utilities
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as imageCompression from 'browser-image-compression';
import {
  compressImage,
  compressImages,
  isImageFile,
  needsCompression,
  formatFileSize,
  validateImageType,
  validateImageSize,
  validateImageFile,
} from '@xala/api/utils/image-compression';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}));

describe('Image Compression Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('compressImage', () => {
    it('should compress an image file', async () => {
      const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const compressedFile = new File(['compressed'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(imageCompression.default).mockResolvedValue(compressedFile);

      const result = await compressImage(originalFile);

      expect(result).toBe(compressedFile);
      expect(imageCompression.default).toHaveBeenCalledWith(
        originalFile,
        expect.objectContaining({
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
        })
      );
    });

    it('should use custom compression options', async () => {
      const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const compressedFile = new File(['compressed'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(imageCompression.default).mockResolvedValue(compressedFile);

      await compressImage(originalFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
      });

      expect(imageCompression.default).toHaveBeenCalledWith(
        originalFile,
        expect.objectContaining({
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
        })
      );
    });

    it('should throw UploadError on compression failure', async () => {
      const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(imageCompression.default).mockRejectedValue(new Error('Compression failed'));

      await expect(compressImage(originalFile)).rejects.toMatchObject({
        type: 'COMPRESSION_FAILED',
        message: 'Compression failed',
        filename: 'test.jpg',
      });
    });
  });

  describe('compressImages', () => {
    it('should compress multiple image files', async () => {
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      const compressedFile1 = new File(['compressed1'], 'test1.jpg', { type: 'image/jpeg' });
      const compressedFile2 = new File(['compressed2'], 'test2.jpg', { type: 'image/jpeg' });

      vi.mocked(imageCompression.default)
        .mockResolvedValueOnce(compressedFile1)
        .mockResolvedValueOnce(compressedFile2);

      const result = await compressImages([file1, file2]);

      expect(result).toEqual([compressedFile1, compressedFile2]);
      expect(imageCompression.default).toHaveBeenCalledTimes(2);
    });

    it('should handle empty array', async () => {
      const result = await compressImages([]);
      expect(result).toEqual([]);
    });
  });

  describe('isImageFile', () => {
    it('should return true for image files', () => {
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(isImageFile(imageFile)).toBe(true);
    });

    it('should return true for PNG files', () => {
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
      expect(isImageFile(pngFile)).toBe(true);
    });

    it('should return false for non-image files', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(isImageFile(textFile)).toBe(false);
    });

    it('should return false for PDF files', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      expect(isImageFile(pdfFile)).toBe(false);
    });
  });

  describe('needsCompression', () => {
    it('should return true for files larger than default 1MB', () => {
      const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      expect(needsCompression(largeFile)).toBe(true);
    });

    it('should return false for files smaller than default 1MB', () => {
      const smallFile = new File([new ArrayBuffer(500 * 1024)], 'small.jpg', {
        type: 'image/jpeg',
      });
      expect(needsCompression(smallFile)).toBe(false);
    });

    it('should use custom size threshold', () => {
      const file = new File([new ArrayBuffer(1.5 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });
      expect(needsCompression(file, 2)).toBe(false);
      expect(needsCompression(file, 1)).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
    });
  });

  describe('validateImageType', () => {
    it('should validate JPEG files', () => {
      const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateImageType(jpegFile)).toBe(true);
    });

    it('should validate PNG files', () => {
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
      expect(validateImageType(pngFile)).toBe(true);
    });

    it('should reject non-image files', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(validateImageType(textFile)).toBe(false);
    });

    it('should use custom allowed types', () => {
      const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });
      const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      expect(validateImageType(webpFile, ['image/webp'])).toBe(true);
      expect(validateImageType(jpegFile, ['image/webp'])).toBe(false);
    });
  });

  describe('validateImageSize', () => {
    it('should accept files within default 10MB limit', () => {
      const smallFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'small.jpg', {
        type: 'image/jpeg',
      });
      expect(validateImageSize(smallFile)).toBe(true);
    });

    it('should reject files exceeding default 10MB limit', () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      expect(validateImageSize(largeFile)).toBe(false);
    });

    it('should use custom size limit', () => {
      const file = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });
      expect(validateImageSize(file, 3)).toBe(true);
      expect(validateImageSize(file, 1)).toBe(false);
    });
  });

  describe('validateImageFile', () => {
    it('should validate correct image file', () => {
      const imageFile = new File([new ArrayBuffer(1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = validateImageFile(imageFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-image file', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = validateImageFile(textFile);

      expect(result.valid).toBe(false);
      expect(result.error).toMatchObject({
        type: 'INVALID_FILE_TYPE',
        message: 'File is not an image',
        filename: 'test.txt',
      });
    });

    it('should reject files with wrong type', () => {
      const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });

      const result = validateImageFile(webpFile, {
        allowedTypes: ['image/jpeg', 'image/png'],
      });

      expect(result.valid).toBe(false);
      expect(result.error).toMatchObject({
        type: 'INVALID_FILE_TYPE',
        filename: 'test.webp',
      });
    });

    it('should reject files exceeding size limit', () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const result = validateImageFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toMatchObject({
        type: 'FILE_TOO_LARGE',
        filename: 'large.jpg',
      });
    });

    it('should use custom validation options', () => {
      const file = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result1 = validateImageFile(file, { maxSizeMB: 1 });
      expect(result1.valid).toBe(false);

      const result2 = validateImageFile(file, { maxSizeMB: 3 });
      expect(result2.valid).toBe(true);
    });
  });
});
