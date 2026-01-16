/**
 * Content Step Component
 * For detailed content, highlights, and amenities
 */

import { useT } from '@xala/i18n';
import { Textarea, Textfield, Heading, Paragraph, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface ContentStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function ContentStep({ data, onChange, errors }: ContentStepProps): React.ReactElement {
  const t = useT();
  const content = data.content || {};

  const updateContent = (updates: Partial<typeof content>): void => {
    onChange({
      content: {
        ...content,
        ...updates,
      },
    });
  };

  const parseList = (value: string): string[] => {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.content.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.content.description')}
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

      {/* Full Description */}
      <Textarea
        label={t('rentalObjects.field.fullDescription')}
        value={content.fullDescription || ''}
        onChange={(e) => updateContent({ fullDescription: e.target.value })}
        rows={6}
        description={t('rentalObjects.field.fullDescriptionHint')}
      />

      {/* Highlights */}
      <Textarea
        label={t('rentalObjects.field.highlights')}
        value={content.highlights?.join('\n') || ''}
        onChange={(e) => updateContent({ highlights: parseList(e.target.value) })}
        rows={4}
        description={t('rentalObjects.field.highlightsHint')}
      />

      {/* Amenities */}
      <Textarea
        label={t('rentalObjects.field.amenities')}
        value={content.amenities?.join('\n') || ''}
        onChange={(e) => updateContent({ amenities: parseList(e.target.value) })}
        rows={4}
        description={t('rentalObjects.field.amenitiesHint')}
      />

      {/* Included Facilities */}
      <Textarea
        label={t('rentalObjects.field.includedFacilities')}
        value={content.includedFacilities?.join('\n') || ''}
        onChange={(e) => updateContent({ includedFacilities: parseList(e.target.value) })}
        rows={4}
        description={t('rentalObjects.field.includedFacilitiesHint')}
      />
    </div>
  );
}
