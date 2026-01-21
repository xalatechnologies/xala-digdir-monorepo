/**
 * Category Selector Step
 * First step in wizard - allows selecting the main category for a rental object
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph, Card, Badge } from '@xalatechnologies/platform/ui';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface CategorySelectorProps {
  wizard: UseRentalObjectWizardReturn;
}

// Icon emojis for each category
const CATEGORY_ICONS = {
  LOKALER_OG_BANER: '🏢',
  UTSTYR_OG_INVENTAR: '📦',
  KJORETOY_OG_TRANSPORT: '🚗',
  OPPLEVELSER_OG_ARRANGEMENT: '🎉',
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
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
] as const;

export function CategorySelector({ wizard }: CategorySelectorProps) {
  const t = useT();
  const { currentCategory, setCategory, isEditMode } = wizard;

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                    fontSize: '3rem',
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
              💡 {t('rentalObjects.categoryLockedInEditMode')}
            </Paragraph>
          </div>
        )}
      </div>
    </Card>
  );
}
