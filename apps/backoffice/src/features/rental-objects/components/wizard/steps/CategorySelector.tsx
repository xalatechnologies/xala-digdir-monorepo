/**
 * Category Selector Step
 * First step in wizard - allows selecting the main category for a rental object
 */

import { useT } from '@xalatechnologies/platform/i18n';
import { Heading, Paragraph, Card, Badge } from '@xalatechnologies/platform/ui';
import type { UseRentalObjectWizardReturn } from '@/features/rental-objects';

export interface CategorySelectorProps {
  wizard: UseRentalObjectWizardReturn;
}

// SVG icons for each category
const CATEGORY_ICONS = {
  LOKALER_OG_BANER: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  UTSTYR_OG_INVENTAR: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  KJORETOY_OG_TRANSPORT: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
      <circle cx="6.5" cy="16.5" r="2.5"/>
      <circle cx="16.5" cy="16.5" r="2.5"/>
    </svg>
  ),
  OPPLEVELSER_OG_ARRANGEMENT: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
};

// Category descriptions
const CATEGORY_DESCRIPTIONS = {
  LOKALER_OG_BANER: 'Idrettshaller, møterom, kontorplasser og baner',
  UTSTYR_OG_INVENTAR: 'Verktøy, utstyr og inventar til utlån',
  KJORETOY_OG_TRANSPORT: 'Biler, varebiler og transportmidler',
  OPPLEVELSER_OG_ARRANGEMENT: 'Arrangementer, guidede turer og opplevelser',
};

const CATEGORIES = [
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  // 'KJORETOY_OG_TRANSPORT', // Hidden per user request
  'OPPLEVELSER_OG_ARRANGEMENT',
] as const;

export function CategorySelector({ wizard }: CategorySelectorProps) {
  const t = useT();
  const { currentCategory, setCategory, isEditMode } = wizard;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', width: '100%' }}>
        {/* Header */}
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('wizard.step.category')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {isEditMode
              ? t('rentalObjects.categoryCannotBeChanged')
              : t('rentalObjects.selectCategoryDescription')}
          </Paragraph>
        </div>

        {/* Category Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = category === currentCategory;

            return (
              <button
                key={category}
                type="button"
                onClick={() => !isEditMode && setCategory(category)}
                disabled={isEditMode}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: 'var(--ds-spacing-5)',
                  border: isSelected
                    ? '2px solid var(--ds-color-accent-border-default)'
                    : '2px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  backgroundColor: isSelected
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'var(--ds-color-neutral-surface-default)',
                  cursor: isEditMode ? 'not-allowed' : 'pointer',
                  opacity: isEditMode ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isEditMode && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-subtle)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isEditMode && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-default)';
                  }
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    color: isSelected
                      ? 'var(--ds-color-accent-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                    marginBottom: 'var(--ds-spacing-3)',
                  }}
                >
                  {CATEGORY_ICONS[category]}
                </div>

                {/* Title with Selected Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    marginBottom: 'var(--ds-spacing-2)',
                  }}
                >
                  <Heading
                    level={4}
                    data-size="xs"
                    style={{
                      margin: 0,
                      color: isSelected
                        ? 'var(--ds-color-accent-text-default)'
                        : 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {t(`rentalObjects.category.${category}`)}
                  </Heading>
                  {isSelected && <Badge color="success" size="sm">✓</Badge>}
                </div>

                {/* Description */}
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                    lineHeight: 'var(--ds-line-height-md)',
                  }}
                >
                  {CATEGORY_DESCRIPTIONS[category]}
                </Paragraph>
              </button>
            );
          })}
        </div>

        {/* Info Message */}
        {isEditMode && (
          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              borderLeft: '4px solid var(--ds-color-info-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('rentalObjects.categoryLockedInEditMode')}
            </Paragraph>
          </div>
        )}
    </div>
  );
}
