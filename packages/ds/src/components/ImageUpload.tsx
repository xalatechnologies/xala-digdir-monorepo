/**
 * ImageUpload Component
 * Drag-and-drop image upload with preview, progress, and management
 *
 * TODO: This component requires SDK file upload hooks that are not yet implemented:
 * - useUploadFile
 * - useUploadMultipleFiles
 * - useDeleteFile
 * - useFileUrl
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   entityType="rental_object"
 *   entityId={rentalObjectId}
 *   maxFiles={10}
 *   maxSizeMB={5}
 *   onUploadComplete={(files) => console.log('Uploaded:', files)}
 * />
 * ```
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button, Paragraph } from '@digdir/designsystemet-react';

// Placeholder type until SDK implements file upload
interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  altText?: string;
}

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
  onUploadComplete?: (files: UploadedFile[]) => void;
  /** Callback when images change */
  onChange?: (images: UploadedFile[]) => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ImageUpload - Placeholder component
 *
 * This component is a placeholder until SDK file upload hooks are implemented.
 * Currently displays a stub UI for development purposes.
 */
export function ImageUpload({
  maxFiles = 10,
  maxSizeMB = 5,
  existingImages = [],
  disabled = false,
}: ImageUploadProps): React.ReactElement {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `${file.name} exceeds ${maxSizeMB}MB`;
    }
    if (selectedFiles.length + existingImages.length >= maxFiles) {
      return `Maximum ${maxFiles} images allowed`;
    }
    return null;
  }, [maxSizeMB, maxFiles, selectedFiles.length, existingImages.length]);

  // Handle file selection (local preview only - no upload)
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  }, [validateFile]);

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
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // Handle delete
  const handleDelete = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Open file picker
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Dropzone */}
      <div
        style={{
          border: `2px dashed ${dragActive ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-border-default)'}`,
          borderRadius: 'var(--ds-border-radius-md)',
          padding: 'var(--ds-spacing-8) var(--ds-spacing-4)',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          backgroundColor: dragActive ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
          opacity: disabled ? 0.6 : 1,
        }}
        onDragEnter={disabled ? undefined : handleDrag}
        onDragLeave={disabled ? undefined : handleDrag}
        onDragOver={disabled ? undefined : handleDrag}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : openFilePicker}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        <div>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ margin: '0 auto var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Paragraph data-size="md" style={{ margin: '0 0 var(--ds-spacing-2)', fontWeight: 600 }}>
            Drag and drop images here, or click to select
          </Paragraph>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Max {maxFiles} images · Up to {maxSizeMB}MB each · PNG, JPG, WebP
          </Paragraph>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ marginTop: 'var(--ds-spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {errors.map((error, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                background: 'var(--ds-color-danger-surface-default)',
                border: '1px solid var(--ds-color-danger-border-default)',
                borderRadius: 'var(--ds-border-radius-sm)',
                color: 'var(--ds-color-danger-base-default)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Image Grid - Local previews only */}
      {(selectedFiles.length > 0 || existingImages.length > 0) && (
        <div style={{
          marginTop: 'var(--ds-spacing-4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 'var(--ds-spacing-3)',
        }}>
          {existingImages.map((image, index) => (
            <div
              key={`existing-${index}`}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
                background: 'var(--ds-color-neutral-surface-default)',
                border: '1px solid var(--ds-color-neutral-border-default)',
              }}
            >
              <img
                src={image.url}
                alt={image.alt || `Image ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}

          {selectedFiles.map((file, index) => (
            <div
              key={`selected-${index}`}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
                background: 'var(--ds-color-neutral-surface-default)',
                border: '1px solid var(--ds-color-neutral-border-default)',
              }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Button
                type="button"
                variant="primary"
                data-size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                style={{
                  position: 'absolute',
                  top: 'var(--ds-spacing-2)',
                  right: 'var(--ds-spacing-2)',
                  minWidth: 'auto',
                  padding: 'var(--ds-spacing-1)',
                  backgroundColor: 'var(--ds-color-danger-base-default)',
                }}
              >
                ✕
              </Button>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--ds-spacing-2)',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              }}>
                <span style={{
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'white',
                }}>
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder notice */}
      <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-warning-text-default)' }}>
        Note: Upload functionality requires SDK hooks (useUploadFile, etc.) to be implemented.
      </Paragraph>
    </div>
  );
}
