/**
 * FileUploader Component
 *
 * A drag-and-drop file uploader with preview support.
 * Supports multiple files, file type restrictions, and size limits.
 *
 * SSR-safe: Uses 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/FileUploader
 */

'use client';

import React, { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress?: number;
  error?: string;
  uploaded?: boolean;
}

export interface FileUploaderProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  showPreview?: boolean;
  previewType?: 'list' | 'grid';
  placeholder?: {
    title?: string;
    description?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function UploadCloudIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ImageFileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function PDFIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12h4M10 16h4M8 20h8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function generateId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageFileIcon />;
  if (type === 'application/pdf') return <PDFIcon />;
  return <FileIcon />;
}

function isImageFile(type: string): boolean {
  return type.startsWith('image/');
}

// =============================================================================
// FileUploader Component
// =============================================================================

export function FileUploader({
  value = [],
  onChange,
  onUpload,
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  disabled = false,
  label,
  helperText,
  error,
  showPreview = true,
  previewType = 'list',
  placeholder = {
    title: 'Drop files here or click to upload',
    description: 'Supports images, PDFs, and documents',
  },
  className,
  style,
}: FileUploaderProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      if (disabled) return;

      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file) continue;

        if (value.length + newFiles.length >= maxFiles) {
          break;
        }

        if (file.size > maxSize) {
          newFiles.push({
            id: generateId(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            error: `File exceeds ${formatFileSize(maxSize)} limit`,
          });
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: generateId(),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        };

        if (isImageFile(file.type)) {
          uploadedFile.preview = URL.createObjectURL(file);
        }

        newFiles.push(uploadedFile);
      }

      const updatedFiles = [...value, ...newFiles];
      onChange?.(updatedFiles);

      if (onUpload) {
        for (const uploadedFile of newFiles) {
          if (uploadedFile.error) continue;

          try {
            const url = await onUpload(uploadedFile.file);
            const index = updatedFiles.findIndex((f) => f.id === uploadedFile.id);
            if (index !== -1) {
              const existing = updatedFiles[index];
              if (existing) {
                updatedFiles[index] = { ...existing, uploaded: true, preview: url };
                onChange?.([...updatedFiles]);
              }
            }
          } catch {
            const index = updatedFiles.findIndex((f) => f.id === uploadedFile.id);
            if (index !== -1) {
              const existing = updatedFiles[index];
              if (existing) {
                updatedFiles[index] = { ...existing, error: 'Upload failed' };
                onChange?.([...updatedFiles]);
              }
            }
          }
        }
      }
    },
    [value, onChange, onUpload, disabled, maxFiles, maxSize]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      e.target.value = '';
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const file = value.find((f) => f.id === id);
      if (file?.preview && isImageFile(file.type)) {
        URL.revokeObjectURL(file.preview);
      }
      onChange?.(value.filter((f) => f.id !== id));
    },
    [value, onChange]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const borderColor = error
    ? 'var(--ds-color-danger-border-default)'
    : isDragging
    ? 'var(--ds-color-accent-border-default)'
    : 'var(--ds-color-neutral-border-default)';

  const backgroundColor = isDragging
    ? 'var(--ds-color-accent-surface-subtle)'
    : 'var(--ds-color-neutral-background-default)';

  return (
    <div className={className} style={style}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-8)',
          borderWidth: 'var(--ds-border-width-lg)',
          borderStyle: 'dashed',
          borderColor,
          borderRadius: 'var(--ds-border-radius-lg)',
          backgroundColor,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        <div style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }}>
          <UploadCloudIcon />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
            textAlign: 'center',
          }}
        >
          {placeholder.title}
        </p>

        {placeholder.description && (
          <p
            style={{
              margin: 'var(--ds-spacing-1) 0 0 0',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'center',
            }}
          >
            {placeholder.description}
          </p>
        )}

        {maxSize && (
          <p
            style={{
              margin: 'var(--ds-spacing-2) 0 0 0',
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Max file size: {formatFileSize(maxSize)}
          </p>
        )}
      </div>

      {(error || helperText) && (
        <p
          style={{
            marginTop: 'var(--ds-spacing-1)',
            fontSize: 'var(--ds-font-size-sm)',
            color: error ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {error || helperText}
        </p>
      )}

      {showPreview && value.length > 0 && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-4)',
            display: previewType === 'grid' ? 'grid' : 'flex',
            flexDirection: previewType === 'list' ? 'column' : undefined,
            gridTemplateColumns: previewType === 'grid' ? 'repeat(auto-fill, minmax(120px, 1fr))' : undefined,
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {value.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: previewType === 'list' ? 'center' : 'flex-start',
                flexDirection: previewType === 'grid' ? 'column' : 'row',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderWidth: 'var(--ds-border-width-default)',
                borderStyle: 'solid',
                borderColor: file.error
                  ? 'var(--ds-color-danger-border-default)'
                  : 'var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              {file.preview && isImageFile(file.type) ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  style={{
                    width: previewType === 'grid' ? '100%' : 'var(--ds-sizing-12)',
                    height: previewType === 'grid' ? 'var(--ds-sizing-20)' : 'var(--ds-sizing-12)',
                    objectFit: 'cover',
                    borderRadius: 'var(--ds-border-radius-sm)',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: previewType === 'grid' ? '100%' : 'var(--ds-sizing-12)',
                    height: previewType === 'grid' ? 'var(--ds-sizing-20)' : 'var(--ds-sizing-12)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {getFileIcon(file.type)}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: 'var(--ds-color-neutral-text-default)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    marginTop: 'var(--ds-spacing-1)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {formatFileSize(file.size)}
                  </span>
                  {file.uploaded && (
                    <span style={{ color: 'var(--ds-color-success-text-default)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                      <CheckCircleIcon />
                      <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>Uploaded</span>
                    </span>
                  )}
                  {file.error && (
                    <span style={{ color: 'var(--ds-color-danger-text-default)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                      <AlertCircleIcon />
                      <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{file.error}</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file.id);
                }}
                aria-label={`Remove ${file.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--ds-spacing-1)',
                  backgroundColor: 'transparent',
                  borderWidth: '0',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  transition: 'color 0.15s ease',
                }}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUploader;
