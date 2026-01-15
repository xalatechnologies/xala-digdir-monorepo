/**
 * Basics Step
 * Type selection, name, slug, and visibility settings
 */

import { Textfield, Select, Paragraph, Heading, Label, Textarea } from '@xala/ds';
import { useT } from '@xala/i18n';
import { LISTING_TYPE_OPTIONS } from '../../constants';
import type { BackofficeListing, BackofficeListingType } from '../../../types';

export interface BasicsStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function BasicsStep({ data, onChange, errors = [] }: BasicsStepProps) {
  const t = useT();

  const VISIBILITY_OPTIONS = [
    { value: 'public', label: t('listings.wizard.visibility.public') },
    { value: 'unlisted', label: t('listings.wizard.visibility.unlisted') },
    { value: 'private', label: t('listings.wizard.visibility.private') },
  ];
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ type: e.target.value as BackofficeListingType });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'o')
      .replace(/[å]/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    onChange({ name, slug });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ slug: e.target.value });
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ visibility: e.target.value as 'public' | 'unlisted' | 'private' });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ description: e.target.value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('listings.wizard.basics.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('listings.wizard.basics.description')}
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

      {/* Type selection */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
          {t('listings.wizard.basics.type')}
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('listings.wizard.basics.typeDescription')}
        </Paragraph>
        <Select
          value={data.type || 'SPACE'}
          onChange={handleTypeChange}
          aria-label={t('listings.wizard.basics.type')}
        >
          {LISTING_TYPE_OPTIONS.filter(opt => opt.id !== 'ALL').map((option) => (
            <option key={option.id} value={option.id}>
              {t(`listings.type.${option.id}`)}
            </option>
          ))}
        </Select>
      </div>

      {/* Name */}
      <div>
        <Textfield
          label={t('listings.wizard.basics.name')}
          description={t('listings.wizard.basics.nameDescription')}
          value={data.name || ''}
          onChange={handleNameChange}
          placeholder={t('listings.wizard.basics.namePlaceholder')}
          required
        />
      </div>

      {/* Slug */}
      <div>
        <Textfield
          label={t('listings.wizard.basics.slug')}
          description={t('listings.wizard.basics.slugDescription')}
          value={data.slug || ''}
          onChange={handleSlugChange}
          placeholder={t('listings.wizard.basics.slugPlaceholder')}
        />
        {data.slug && (
          <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('listings.wizard.basics.urlPreview')}: /utleie/{data.slug}
          </Paragraph>
        )}
      </div>

      {/* Visibility */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
          {t('listings.wizard.basics.visibility')}
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('listings.wizard.basics.visibilityDescription')}
        </Paragraph>
        <Select
          value={data.visibility || 'public'}
          onChange={handleVisibilityChange}
          aria-label={t('listings.wizard.basics.visibility')}
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Short description */}
      <div>
        <Label
          htmlFor="description"
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
          {t('listings.wizard.basics.description')}
        </Label>
        <Paragraph
          data-size="xs"
          style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          {t('listings.wizard.basics.descriptionHint')}
        </Paragraph>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={handleDescriptionChange}
          placeholder={t('listings.wizard.basics.descriptionPlaceholder')}
          rows={4}
          style={{
            width: '100%',
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            fontSize: 'var(--ds-font-size-md)',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
}
