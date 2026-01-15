/**
 * Category Selector Component
 * Allows selecting the main category for a rental object
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph } from '@xala/ds';
import type { RentalObjectCategory, CategoryConfig } from '../../../types';
import { CATEGORY_CONFIGS } from '../../../types';

interface CategorySelectorProps {
  selectedCategory: RentalObjectCategory;
  onCategoryChange: (category: RentalObjectCategory) => void;
  disabled?: boolean;
}

const CATEGORY_ICONS: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'building',
  UTSTYR_OG_INVENTAR: 'package',
  KJORETOY_OG_TRANSPORT: 'car',
  OPPLEVELSER_OG_ARRANGEMENT: 'calendar',
};

export function CategorySelector({
  selectedCategory,
  onCategoryChange,
  disabled = false,
}: CategorySelectorProps): React.ReactElement {
  const t = useT();

  const categories = Object.values(CATEGORY_CONFIGS);

  return (
    <div>
      <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        {t('rentalObjects.selectCategory')}
      </Heading>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {categories.map((config) => {
          const isSelected = config.code === selectedCategory;

          return (
            <button
              key={config.code}
              type="button"
              onClick={() => !disabled && onCategoryChange(config.code)}
              disabled={disabled}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 'var(--ds-spacing-4)',
                border: isSelected
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '2px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-lg)',
                backgroundColor: isSelected
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-background-default)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {CATEGORY_ICONS[config.code]}
              </div>
              <Heading
                level={4}
                data-size="xs"
                style={{
                  marginBottom: 'var(--ds-spacing-1)',
                  color: isSelected
                    ? 'var(--ds-color-accent-text-default)'
                    : 'var(--ds-color-neutral-text-default)',
                }}
              >
                {t(`category.${config.code}`, config.labelNorwegian)}
              </Heading>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {config.description}
              </Paragraph>
            </button>
          );
        })}
      </div>
    </div>
  );
}
