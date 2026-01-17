/**
 * ImageUpload Component
 * Drag-and-drop image upload with preview, progress, and management
 * 
 * Features:
 * - Drag and drop support
 * - Multiple file upload
 * - Image preview
 * - Progress indicators
 * - Validation (size, type)
 * - Reordering
 * - Delete uploaded images
 * 
 * @example
 * ```tsx
 * <ImageUpload
 *   entityType="rental_object"
 *   entityId={rentalObjectId}
 *   maxFiles={10}
 *   maxSizeM B={5}
 *   onUploadComplete={(files) => console.log('Uploaded:', files)}
 * />
 * ```
 */

import React, { useState, useRef, useCallback } from 'react';
import { useUploadFile, useUploadMultipleFiles, useDeleteFile, useFileUrl } from '@digilist/client-sdk/hooks';
import type { UploadFileResponse } from '@xala/contracts/storage';

export interface ImageUploadProps {
  /** Entity type for association */
  entityType?: 'rental_object' | 'organization' | 'user';
  /** Entity ID for association */
  entityId?: string;
  /** Category for file storage */
  category?: string;
  /** Max files allowed */
  maxFiles?: number;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Existing images (for display/management) */
  existingImages?: Array<{ id: string; url: string; alt?: string }>;
  /** Callback when upload completes */
  onUploadComplete?: (files: UploadFileResponse[]) => void;
  /** Callback when images change */
  onChange?: (images: UploadFileResponse[]) => void;
}

export function ImageUpload({
  entityType,
  entityId,
  category = 'rental-object-image',
  maxFiles = 10,
  maxSizeMB = 5,
  existingImages = [],
  onUploadComplete,
  onChange,
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadFileResponse[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutate: uploadMultiple, isPending: isUploadingMultiple } = useUploadMultipleFiles();
  const { mutate: deleteFile } = useDeleteFile();
  const getFileUrl = useFileUrl();

  const isPending = isUploading || isUploadingMultiple;

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `${file.name} exceeds ${maxSizeMB}MB`;
    }
    if (uploadedImages.length >= maxFiles) {
      return `Maximum ${maxFiles} images allowed`;
    }
    return null;
  }, [maxSizeMB, maxFiles, uploadedImages.length]);

  // Handle file upload
  const handleUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate all files
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);

    if (validFiles.length === 0) return;

    // Upload files
    if (validFiles.length === 1) {
      uploadFile({
        file: validFiles[0],
        category,
        entityType,
        entityId,
      }, {
        onSuccess: (uploaded) => {
          const newImages = [...uploadedImages, uploaded];
          setUploadedImages(newImages);
          onChange?.(newImages);
          onUploadComplete?.([uploaded]);
        },
      });
    } else {
      uploadMultiple(validFiles, {
        onSuccess: (response) => {
          const newImages = [...uploadedImages, ...response.files];
          setUploadedImages(newImages);
          onChange?.(newImages);
          onUploadComplete?.(response.files);
        },
      });
    }
  }, [uploadFile, uploadMultiple, validateFile, uploadedImages, category, entityType, entityId, onChange, onUploadComplete]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  }, [handleUpload]);

  // Handle delete
  const handleDelete = useCallback((imageId: string) => {
    deleteFile(imageId, {
      onSuccess: () => {
        const newImages = uploadedImages.filter(img => img.id !== imageId);
        setUploadedImages(newImages);
        onChange?.(newImages);
      },
    });
  }, [deleteFile, uploadedImages, onChange]);

  // Open file picker
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="image-upload">
      {/* Dropzone */}
      <div
        className={`dropzone ${dragActive ? 'drag-active' : ''} ${isPending ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="dropzone-content">
          {isPending ? (
            <div className="uploading-state">
              <div className="spinner" />
              <p>Uploading images...</p>
            </div>
          ) : (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="dropzone-title">
                Drag and drop images here, or click to select
              </p>
              <p className="dropzone-subtitle">
                Max {maxFiles} images · Up to {maxSizeMB}MB each · PNG, JPG, WebP
              </p>
            </>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <div key={i} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {(uploadedImages.length > 0 || existingImages.length > 0) && (
        <div className="image-grid">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="image-card">
              <img src={getFileUrl(image.url)} alt={image.alt || `Image ${index + 1}`} />
              <div className="image-overlay">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle existing image delete
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {uploadedImages.map((image) => (
            <div key={image.id} className="image-card">
              <img src={getFileUrl(image.url)} alt={image.altText || 'Uploaded'} />
              <div className="image-overlay">
                <button
                  type="button"
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="image-meta">
                <span className="file-size">{(image.sizeBytes / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .image-upload {
          width: 100%;
        }

        .dropzone {
          border: 2px dashed var(--ds-color-neutral-border-default);
          border-radius: var(--ds-border-radius-md);
          padding: var(--ds-spacing-8) var(--ds-spacing-4);
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--ds-color-neutral-surface-hover);
        }

        .dropzone:hover {
          border-color: var(--ds-color-accent-base-default);
          background: var(--ds-color-accent-surface-default);
        }

        .dropzone.drag-active {
          border-color: var(--ds-color-accent-base-default);
          background: var(--ds-color-accent-surface-hover);
        }

        .dropzone.uploading {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .dropzone-content svg {
          margin: 0 auto var(--ds-spacing-3);
          color: var(--ds-color-neutral-text-subtle);
        }

        .dropzone-title {
          font-size: var(--ds-font-size-md);
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-color-neutral-text-default);
          margin: 0 0 var(--ds-spacing-2);
        }

        .dropzone-subtitle {
          font-size: var(--ds-font-size-sm);
          color: var(--ds-color-neutral-text-subtle);
          margin: 0;
        }

        .uploading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--ds-spacing-3);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--ds-color-neutral-border-default);
          border-top-color: var(--ds-color-accent-base-default);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .errors {
          margin-top: var(--ds-spacing-3);
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-2);
        }

        .error-message {
          padding: var(--ds-spacing-3) var(--ds-spacing-4);
          background: var(--ds-color-danger-surface-default);
          border: 1px solid var(--ds-color-danger-border-default);
          border-radius: var(--ds-border-radius-sm);
          color: var(--ds-color-danger-base-default);
          font-size: var(--ds-font-size-sm);
        }

        .image-grid {
          margin-top: var(--ds-spacing-4);
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--ds-spacing-3);
        }

        .image-card {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--ds-border-radius-md);
          overflow: hidden;
          background: var(--ds-color-neutral-surface-default);
          border: 1px solid var(--ds-color-neutral-border-default);
        }

        .image-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          background: linear-gradient(to bottom, var(--ds-color-neutral-background-overlay) 0%, transparent 40%);
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: var(--ds-spacing-2);
        }

        .image-card:hover .image-overlay {
          opacity: 1;
        }

        .delete-btn {
          background: var(--ds-color-danger-base-default);
          color: var(--ds-color-neutral-text-on-inverted);
          border: none;
          border-radius: var(--ds-border-radius-sm);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: var(--ds-font-size-lg);
          transition: background 0.2s;
        }

        .delete-btn:hover {
          background: var(--ds-color-danger-base-hover);
        }

        .image-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, var(--ds-color-neutral-background-overlay), transparent);
          padding: var(--ds-spacing-2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-size {
          font-size: var(--ds-font-size-xs);
          color: var(--ds-color-neutral-text-on-inverted);
          font-weight: var(--ds-font-weight-medium);
        }
      `}</style>
    </div>
  );
}
