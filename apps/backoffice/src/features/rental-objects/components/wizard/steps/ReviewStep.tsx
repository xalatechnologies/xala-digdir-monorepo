/**
 * Review Step Component
 * Final review before publishing
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph, Alert, Badge } from '@xala/ds';
import { canPublish } from '../../../utils/wizard-validation';
import type { RentalObject, RentalObjectCategory } from '../../../types';
import { CATEGORY_CONFIGS } from '../../../types';

interface ReviewStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
  category: RentalObjectCategory;
}

export function ReviewStep({ data, errors, category }: ReviewStepProps): React.ReactElement {
  const t = useT();
  const publishStatus = canPublish(data, category);
  const categoryConfig = CATEGORY_CONFIGS[category];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement => (
    <div
      style={{
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        marginBottom: 'var(--ds-spacing-4)',
      }}
    >
      <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
        {title}
      </Heading>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-2)' }}>
      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
        {label}
      </Paragraph>
      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500, textAlign: 'right' }}>
        {value || '-'}
      </Paragraph>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.review.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.review.description')}
        </Paragraph>
      </div>

      {/* Publish status */}
      {!publishStatus.canPublish && (
        <Alert severity="warning">
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {t('rentalObjects.step.review.missingRequired')}
          </Heading>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {publishStatus.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </Alert>
      )}

      {publishStatus.canPublish && (
        <Alert severity="success">
          {t('rentalObjects.step.review.readyToPublish')}
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert severity="danger">
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Basic Info */}
      <Section title={t('rentalObjects.step.basics')}>
        <Field label={t('rentalObjects.field.name')} value={data.name} />
        <Field
          label={t('rentalObjects.field.category')}
          value={
            <Badge color="neutral">
              {t(`category.${category}`, categoryConfig.labelNorwegian)}
            </Badge>
          }
        />
        <Field
          label={t('rentalObjects.field.subcategory')}
          value={data.subcategory ? t(`subcategory.${data.subcategory}`, data.subcategory) : undefined}
        />
        <Field label={t('rentalObjects.field.timeMode')} value={t(`timeMode.${data.timeMode}`)} />
        <Field
          label={t('rentalObjects.field.status')}
          value={
            <Badge color={data.status === 'published' ? 'success' : 'neutral'}>
              {t(`status.${data.status}`, data.status)}
            </Badge>
          }
        />
      </Section>

      {/* Description */}
      <Section title={t('rentalObjects.step.content')}>
        <Paragraph data-size="sm" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {data.description || t('rentalObjects.noDescription')}
        </Paragraph>
      </Section>

      {/* Location (if applicable) */}
      {categoryConfig.supportsLocation && data.location && (
        <Section title={t('rentalObjects.step.location')}>
          <Field label={t('rentalObjects.field.address')} value={data.location.address} />
          <Field
            label={t('rentalObjects.field.cityPostal')}
            value={[data.location.postalCode, data.location.city].filter(Boolean).join(' ')}
          />
          <Field label={t('rentalObjects.field.municipality')} value={data.location.municipality} />
        </Section>
      )}

      {/* Capacity (if applicable) */}
      {categoryConfig.supportsCapacity && data.capacity !== undefined && (
        <Section title={t('rentalObjects.step.capacity')}>
          <Field label={t('rentalObjects.field.capacity')} value={`${data.capacity} ${t('rentalObjects.persons')}`} />
        </Section>
      )}

      {/* Inventory (if applicable) */}
      {categoryConfig.supportsInventory && data.inventory && (
        <Section title={t('rentalObjects.step.inventory')}>
          <Field label={t('rentalObjects.field.totalQuantity')} value={data.inventory.totalQuantity} />
        </Section>
      )}

      {/* Pricing */}
      <Section title={t('rentalObjects.step.pricing')}>
        {data.pricing ? (
          <>
            <Field
              label={t('rentalObjects.field.basePrice')}
              value={`${data.pricing.basePrice} ${data.pricing.currency}`}
            />
            <Field label={t('rentalObjects.field.pricingUnit')} value={t(`pricingUnit.${data.pricing.unit}`)} />
          </>
        ) : (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
            {t('rentalObjects.noPricing')}
          </Paragraph>
        )}
      </Section>

      {/* Media */}
      <Section title={t('rentalObjects.step.media')}>
        {data.images && data.images.length > 0 ? (
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            {data.images.slice(0, 4).map((url, i) => (
              <div
                key={i}
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={url}
                  alt={`${t('rentalObjects.image')} ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
            {data.images.length > 4 && (
              <div
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  +{data.images.length - 4}
                </Paragraph>
              </div>
            )}
          </div>
        ) : (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
            {t('rentalObjects.noImages')}
          </Paragraph>
        )}
      </Section>
    </div>
  );
}
