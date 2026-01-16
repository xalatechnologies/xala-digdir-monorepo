/**
 * Basics Step Component
 * First step in the wizard for basic information
 */

import { useT } from '@xala/i18n';
import { Textfield, Textarea, NativeSelect, Heading, Paragraph, Alert } from '@xala/ds';
import { CategorySelector } from './CategorySelector';
import type { RentalObject, RentalObjectCategory } from '../../../types';
import { SUBCATEGORIES, CATEGORY_CONFIGS } from '../../../types';

interface BasicsStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
  category: RentalObjectCategory;
  onCategoryChange: (category: RentalObjectCategory) => void;
  isEditMode: boolean;
}

export function BasicsStep({
  data,
  onChange,
  errors,
  category,
  onCategoryChange,
  isEditMode,
}: BasicsStepProps): React.ReactElement {
  const t = useT();

  const subcategories = SUBCATEGORIES[category] || [];
  const timeModes = [
    { value: 'PERIOD', label: t('timeMode.PERIOD') },
    { value: 'SLOT', label: t('timeMode.SLOT') },
    { value: 'ALL_DAY', label: t('timeMode.ALL_DAY') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Category selection (only in create mode) */}
      {!isEditMode && (
        <CategorySelector
          selectedCategory={category}
          onCategoryChange={onCategoryChange}
          disabled={isEditMode}
        />
      )}

      {/* Error display */}
      {errors.length > 0 && (
        <Alert severity="danger">
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Name */}
      <Textfield
        label={t('rentalObjects.field.name')}
        value={data.name || ''}
        onChange={(e) => onChange({ name: e.target.value })}
        required
        description={t('rentalObjects.field.nameDescription')}
      />

      {/* Subcategory */}
      <NativeSelect
        label={t('rentalObjects.field.subcategory')}
        value={data.subcategory || ''}
        onChange={(e) => onChange({ subcategory: e.target.value || undefined })}
      >
        <option value="">{t('common.selectOption')}</option>
        {subcategories.map((sub) => (
          <option key={sub} value={sub}>
            {t(`subcategory.${sub}`, sub)}
          </option>
        ))}
      </NativeSelect>

      {/* Description */}
      <Textarea
        label={t('rentalObjects.field.description')}
        value={data.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={4}
        description={t('rentalObjects.field.descriptionHint')}
      />

      {/* Time Mode */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.field.timeMode')}
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.field.timeModeDescription')}
        </Paragraph>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {timeModes.map((mode) => (
            <label
              key={mode.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-3)',
                border: data.timeMode === mode.value
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '2px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                backgroundColor: data.timeMode === mode.value
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'transparent',
              }}
            >
              <input
                type="radio"
                name="timeMode"
                value={mode.value}
                checked={data.timeMode === mode.value}
                onChange={(e) => onChange({ timeMode: e.target.value as RentalObject['timeMode'] })}
                style={{ margin: 0 }}
              />
              <span>{mode.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <Textfield
        label={t('rentalObjects.field.tags')}
        value={data.tags?.join(', ') || ''}
        onChange={(e) => {
          const tags = e.target.value
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          onChange({ tags: tags.length > 0 ? tags : undefined });
        }}
        description={t('rentalObjects.field.tagsDescription')}
      />
    </div>
  );
}
