/**
 * Media Step Component
 * For uploading and managing images and media
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Paragraph, Button, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface MediaStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function MediaStep({ data, onChange, errors }: MediaStepProps): React.ReactElement {
  const t = useT();
  const images = data.images || [];

  const addImage = (): void => {
    onChange({ images: [...images, ''] });
  };

  const updateImage = (index: number, url: string): void => {
    const updated = images.map((img, i) => (i === index ? url : img));
    onChange({ images: updated });
  };

  const removeImage = (index: number): void => {
    onChange({ images: images.filter((_, i) => i !== index) });
  };

  const moveImage = (index: number, direction: 'up' | 'down'): void => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange({ images: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.media.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.media.description')}
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <Alert severity="danger">
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Image list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {images.map((imageUrl, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-3)',
              alignItems: 'flex-start',
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {/* Preview */}
            <div
              style={{
                width: '80px',
                height: '60px',
                backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                borderRadius: 'var(--ds-border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${t('rentalObjects.image')} ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-body-sm)' }}>{t('rentalObjects.image')}</span>
              )}
            </div>

            {/* URL input */}
            <div style={{ flex: 1 }}>
              <Textfield
                label={index === 0 ? t('rentalObjects.field.coverImage') : `${t('rentalObjects.image')} ${index + 1}`}
                value={imageUrl}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={() => moveImage(index, 'up')}
                disabled={index === 0}
                aria-label={t('common.moveUp')}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={() => moveImage(index, 'down')}
                disabled={index === images.length - 1}
                aria-label={t('common.moveDown')}
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="tertiary"
                color="danger"
                size="sm"
                onClick={() => removeImage(index)}
                aria-label={t('common.delete')}
              >
                X
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add image button */}
      <Button type="button" variant="secondary" onClick={addImage}>
        + {t('rentalObjects.addImage')}
      </Button>

      {/* Info box */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          {t('rentalObjects.step.media.hint')}
        </Paragraph>
      </div>
    </div>
  );
}
