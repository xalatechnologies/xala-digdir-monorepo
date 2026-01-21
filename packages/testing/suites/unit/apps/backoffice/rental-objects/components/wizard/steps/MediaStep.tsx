/**
 * Media Step Component
 * Drag-and-drop image upload with preview, reordering, and alt text editing
 */

import { useState, useCallback, useRef } from 'react';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  Heading,
  Paragraph,
  Button,
  Alert,
  Card,
  Badge,
  Textfield,
  Spinner,
  Stack,
} from '@xalatechnologies/platform/ui';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface MediaStepProps {
  wizard: UseRentalObjectWizardReturn;
}

interface ImageItem {
  id: string;
  file?: File;
  url: string;
  altText?: string;
  isPrimary: boolean;
  isUploading?: boolean;
}

export function MediaStep({ wizard }: MediaStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['media'] || [];

  const [images, setImages] = useState<ImageItem[]>(
    formData.images?.map((url, index) => ({
      id: `image-${index}`,
      url,
      altText: formData.imageAltTexts?.[index] || '',
      isPrimary: index === 0,
    })) || []
  );

  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return t('validation.invalidImageFormat');
    }

    if (file.size > maxSizeBytes) {
      return t('validation.imageTooLarge');
    }

    return null;
  };

  // Handle file upload (simulated - in real app would use SDK)
  const uploadFile = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real implementation, use SDK to upload to storage
    // const url = await mediaService.upload(file);

    // For now, create local preview URL
    return URL.createObjectURL(file);
  };

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check total images limit
    if (images.length + fileArray.length > 10) {
      alert(t('validation.maxImagesExceeded', { max: 10 }));
      return;
    }

    // Validate and upload files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const newImage: ImageItem = {
        id: tempId,
        file,
        url: '',
        altText: '',
        isPrimary: images.length === 0,
        isUploading: true,
      };

      setImages(prev => [...prev, newImage]);

      try {
        const url = await uploadFile(file);
        setImages(prev =>
          prev.map(img =>
            img.id === tempId
              ? { ...img, url, isUploading: false }
              : img
          )
        );
      } catch (error) {
        console.error(t('validation.upload_failed'), error);
        setImages(prev => prev.filter(img => img.id !== tempId));
        alert(t('error.uploadFailed'));
      }
    }
  }, [images.length, t]);

  // Update form data when images change
  const syncToFormData = useCallback((updatedImages: ImageItem[]) => {
    updateFormData({
      images: updatedImages.map(img => img.url),
      imageAltTexts: updatedImages.map(img => img.altText || ''),
    });
  }, [updateFormData]);

  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // File input click handler
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Remove image
  const handleRemoveImage = (id: string) => {
    const confirmed = window.confirm(t('confirm.deleteImage'));
    if (!confirmed) return;

    const updated = images.filter(img => img.id !== id);

    // If removed primary, make first image primary
    if (updated.length > 0) {
      const hadPrimary = images.find(img => img.id === id)?.isPrimary;
      if (hadPrimary) {
        updated[0].isPrimary = true;
      }
    }

    setImages(updated);
    syncToFormData(updated);
  };

  // Set primary image
  const handleSetPrimary = (id: string) => {
    const updated = images.map(img => ({
      ...img,
      isPrimary: img.id === id,
    }));
    setImages(updated);
    syncToFormData(updated);
  };

  // Update alt text
  const handleAltTextChange = (id: string, altText: string) => {
    const updated = images.map(img =>
      img.id === id ? { ...img, altText } : img
    );
    setImages(updated);
    syncToFormData(updated);
  };

  // Reorder images (drag-to-reorder)
  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...images];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setImages(updated);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    syncToFormData(images);
  };

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header */}
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('wizard.step.media')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.mediaDescription')}
          </Paragraph>
        </div>

        {/* Error Display */}
        {currentStepErrors.length > 0 && (
          <Alert severity="danger">
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {currentStepErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging
              ? '2px dashed var(--ds-color-accent-border-default)'
              : '2px dashed var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-8)',
            textAlign: 'center',
            backgroundColor: isDragging
              ? 'var(--ds-color-accent-surface-subtle)'
              : 'var(--ds-color-neutral-surface-subtle)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onClick={handleBrowseClick}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            📸
          </div>
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {t('media.dropzone.title')}
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('media.dropzone.description')}
          </Paragraph>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            style={{ marginTop: 'var(--ds-spacing-4)' }}
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
          >
            {t('media.browseFiles')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Requirements Info */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderLeft: '4px solid var(--ds-color-info-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            <strong>{t('media.requirements.title')}</strong>
          </Paragraph>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)', fontSize: 'var(--ds-font-size-sm)' }}>
            <li>{t('media.requirements.formats')}</li>
            <li>{t('media.requirements.maxSize')}</li>
            <li>{t('media.requirements.minImages')}</li>
            <li>{t('media.requirements.maxImages')}</li>
          </ul>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div>
            <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              {t('media.uploadedImages')} ({images.length}/10)
            </Heading>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  draggable={!image.isUploading}
                  onDragStart={() => handleImageDragStart(index)}
                  onDragOver={(e) => handleImageDragOver(e, index)}
                  onDragEnd={handleImageDragEnd}
                  style={{
                    border: image.isPrimary
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '1px solid var(--ds-color-neutral-border-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    cursor: image.isUploading ? 'default' : 'move',
                    opacity: draggedIndex === index ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {/* Image Preview */}
                  <div
                    style={{
                      width: '100%',
                      height: '150px',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                      marginBottom: 'var(--ds-spacing-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {image.isUploading ? (
                      <Stack direction="column" gap={2} align="center">
                        <Spinner size="md" />
                        <Paragraph data-size="xs">{t('common.uploading')}</Paragraph>
                      </Stack>
                    ) : (
                      <>
                        <img
                          src={image.url}
                          alt={image.altText || `${t('rentalObjects.image')} ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        {image.isPrimary && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 'var(--ds-spacing-2)',
                              left: 'var(--ds-spacing-2)',
                            }}
                          >
                            <Badge color="success" size="sm">
                              {t('media.primaryImage')}
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Alt Text */}
                  <Textfield
                    label={t('media.altText')}
                    value={image.altText || ''}
                    onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                    placeholder={t('media.altTextPlaceholder')}
                    size="sm"
                    disabled={image.isUploading}
                  />

                  {/* Actions */}
                  <Stack direction="row" gap={2} style={{ marginTop: 'var(--ds-spacing-3)' }}>
                    {!image.isPrimary && (
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={image.isUploading}
                        style={{ flex: 1 }}
                      >
                        {t('media.setPrimary')}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={image.isUploading}
                      style={{
                        flex: image.isPrimary ? 1 : 0,
                        color: 'var(--ds-color-danger-text-default)',
                      }}
                    >
                      {t('common.delete')}
                    </Button>
                  </Stack>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
