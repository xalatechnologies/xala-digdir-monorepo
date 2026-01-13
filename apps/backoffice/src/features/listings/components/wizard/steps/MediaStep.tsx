/**
 * Media Step
 * Image and document upload management
 */

import { useCallback, useState } from 'react';
import { Paragraph, Heading, Button, Card } from '@xala/ds';
import { useUploadListingMedia, useDeleteListingMedia } from '@digilist/client-sdk';
import type { BackofficeListing, ListingDocument } from '../../../types';

export interface MediaStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function MediaStep({ data, onChange, errors = [] }: MediaStepProps) {
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isDraggingDocs, setIsDraggingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = useUploadListingMedia();
  const deleteMutation = useDeleteListingMedia();

  const images = data.images || [];
  const documents: ListingDocument[] = data.documents || [];
  const listingId = data.id;

  // Image handling
  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(true);
  }, []);

  const handleImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
  }, []);

  const handleImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      if (!listingId) {
        const newUrls = await Promise.all(
          files.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          })
        );
        onChange({ images: [...images, ...newUrls] });
      } else {
        await uploadMutation.mutateAsync({ id: listingId, files });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [listingId, images, onChange, uploadMutation]);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      if (!listingId) {
        const newUrls = await Promise.all(
          files.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          })
        );
        onChange({ images: [...images, ...newUrls] });
      } else {
        await uploadMutation.mutateAsync({ id: listingId, files });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  }, [listingId, images, onChange, uploadMutation]);

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    if (!listingId || imageUrl.startsWith('data:')) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange({ images: newImages });
    } else {
      try {
        const parts = imageUrl.split('/');
        const mediaId = parts[parts.length - 1] || index.toString();
        await deleteMutation.mutateAsync({ listingId, mediaId });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  }, [listingId, images, onChange, deleteMutation]);

  const handleSetCover = useCallback((index: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    if (moved) {
      newImages.unshift(moved);
      onChange({ images: newImages });
    }
  }, [images, onChange]);

  // Document handling
  const handleDocDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocs(true);
  }, []);

  const handleDocDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocs(false);
  }, []);

  const handleDocDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocs(false);

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const files = Array.from(e.dataTransfer.files).filter(f => allowedTypes.includes(f.type) || f.name.endsWith('.pdf'));
    if (files.length === 0) return;

    const newDocs = await Promise.all(
      files.map(file => {
        return new Promise<ListingDocument>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              url: reader.result as string,
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    onChange({ documents: [...documents, ...newDocs] });
  }, [documents, onChange]);

  const handleDocSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs = await Promise.all(
      files.map(file => {
        return new Promise<ListingDocument>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              url: reader.result as string,
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    onChange({ documents: [...documents, ...newDocs] });
    e.target.value = '';
  }, [documents, onChange]);

  const handleRemoveDoc = useCallback((docId: string) => {
    const newDocs = documents.filter(d => d.id !== docId);
    onChange({ documents: newDocs });
  }, [documents, onChange]);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocIcon = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-danger-base-default)' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Media
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Last opp bilder og dokumenter for utleieobjektet
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* IMAGES SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Bilder
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Det første bildet blir hovedbilde
              </Paragraph>
            </div>
          </div>
          {images.length > 0 && (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {images.length} {images.length === 1 ? 'bilde' : 'bilder'}
            </Paragraph>
          )}
        </div>

        {/* Image Drop zone */}
        <div
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById('image-input')?.click()}
          style={{
            border: `2px dashed ${isDraggingImages ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
            textAlign: 'center',
            backgroundColor: isDraggingImages ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)', animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
              <Paragraph data-size="sm" style={{ margin: 0 }}>Laster opp bilder...</Paragraph>
            </div>
          ) : (
            <>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Dra og slipp bilder her
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                eller klikk for å velge filer • JPG, PNG, WebP
              </Paragraph>
            </>
          )}
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Image gallery */}
        {images.length > 0 && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {images.map((url, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: 'var(--ds-border-radius-md)',
                  overflow: 'hidden',
                  border: index === 0 ? '3px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <img
                  src={url}
                  alt={`Bilde ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {index === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--ds-spacing-1)',
                      left: 'var(--ds-spacing-1)',
                      padding: '2px var(--ds-spacing-2)',
                      fontSize: 'var(--ds-font-size-xs)',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      backgroundColor: 'var(--ds-color-accent-base-default)',
                      color: 'white',
                      borderRadius: 'var(--ds-border-radius-sm)',
                    }}
                  >
                    Hovedbilde
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'var(--ds-spacing-2)',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex',
                    gap: 'var(--ds-spacing-1)',
                    justifyContent: 'flex-end',
                  }}
                >
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSetCover(index); }}
                      style={{
                        padding: '2px var(--ds-spacing-2)',
                        fontSize: '10px',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Hovedbilde
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                    style={{
                      padding: '2px var(--ds-spacing-2)',
                      fontSize: '10px',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* DOCUMENTS SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Dokumenter
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Manualer, bruksanvisninger og retningslinjer
              </Paragraph>
            </div>
          </div>
          {documents.length > 0 && (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {documents.length} {documents.length === 1 ? 'dokument' : 'dokumenter'}
            </Paragraph>
          )}
        </div>

        {/* Document Drop zone */}
        <div
          onDragOver={handleDocDragOver}
          onDragLeave={handleDocDragLeave}
          onDrop={handleDocDrop}
          onClick={() => document.getElementById('doc-input')?.click()}
          style={{
            border: `2px dashed ${isDraggingDocs ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
            textAlign: 'center',
            backgroundColor: isDraggingDocs ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            Dra og slipp dokumenter her
          </Paragraph>
          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            eller klikk for å velge filer • PDF, Word, Excel
          </Paragraph>
          <input
            id="doc-input"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            multiple
            onChange={handleDocSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Document list */}
        {documents.length > 0 && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  {getDocIcon(doc.type)}
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {doc.name}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatFileSize(doc.size)}
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => handleRemoveDoc(doc.id)}
                    style={{ color: 'var(--ds-color-danger-text-default)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
            Tips for gode bilder
          </Heading>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-info-text-default)' }}>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Bruk god belysning og vis rommet fra flere vinkler</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Inkluder bilder av fasiliteter og utstyr</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Anbefalt oppløsning: minimum 1200x800 piksler</Paragraph></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
