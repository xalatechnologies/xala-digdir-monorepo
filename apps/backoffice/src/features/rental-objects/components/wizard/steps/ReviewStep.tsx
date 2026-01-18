/**
 * Review Step Component
 * Final review and summary before publishing (all categories)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Button,
  Badge,
  EyeIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EditIcon,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface ReviewStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function ReviewStep({ wizard }: ReviewStepProps) {
  const t = useT();
  const { formData, goToStep, currentStep } = wizard;

  const currentCategory = formData.category;
  const hasErrors = Object.keys(wizard.errors).some((key) => wizard.errors[key].length > 0);

  const Section = ({
    title,
    stepId,
    children
  }: {
    title: string;
    stepId: string;
    children: React.ReactNode
  }) => (
    <div
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <Heading level={4} data-size="xs" style={{ margin: 0 }}>
          {title}
        </Heading>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={() => goToStep(stepId)}
          aria-label={t('action.edit')}
        >
          <EditIcon
            style={{ width: '1rem', height: '1rem' }}
            aria-hidden="true"
          />
          {t('form.review.edit')}
        </Button>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-2)' }}>
      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
        {label}:
      </Paragraph>
      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', textAlign: 'right' }}>
        {value || '-'}
      </Paragraph>
    </div>
  );

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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <EyeIcon
              style={{
                width: '2rem',
                height: '2rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={2} data-size="md" style={{ margin: 0 }}>
              {t('wizard.step.review')}
            </Heading>
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.reviewDescription')}
          </Paragraph>
        </div>

        {/* Status Alert */}
        {hasErrors ? (
          <Alert severity="danger">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <AlertTriangleIcon
                style={{ width: '1.25rem', height: '1.25rem' }}
                aria-hidden="true"
              />
              <span>{t('form.review.hasErrors')}</span>
            </div>
          </Alert>
        ) : (
          <Alert severity="success">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon
                style={{ width: '1.25rem', height: '1.25rem' }}
                aria-hidden="true"
              />
              <span>{t('form.review.readyToPublish')}</span>
            </div>
          </Alert>
        )}

        {/* Basic Information */}
        <Section title={t('wizard.step.basics')} stepId="basics">
          <Field label={t('form.basics.name')} value={formData.name} />
          <Field
            label={t('form.basics.category')}
            value={
              <Badge color="info" size="sm">
                {formData.category ? t(`form.category.${formData.category}`) : '-'}
              </Badge>
            }
          />
          <Field label={t('form.basics.description')} value={formData.description?.substring(0, 100) + '...'} />
        </Section>

        {/* Media */}
        <Section title={t('wizard.step.media')} stepId="media">
          {formData.images && (formData.images as string[]).length > 0 ? (
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                {(formData.images as string[]).length} {t('form.review.imagesUploaded')}
              </Paragraph>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                {(formData.images as string[]).slice(0, 4).map((url, i) => (
                  <div
                    key={i}
                    style={{
                      width: '80px',
                      height: '60px',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <img
                      src={url}
                      alt={`Image ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
                {(formData.images as string[]).length > 4 && (
                  <div
                    style={{
                      width: '80px',
                      height: '60px',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      +{(formData.images as string[]).length - 4}
                    </Paragraph>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
              {t('form.review.noImages')}
            </Paragraph>
          )}
        </Section>

        {/* Category-Specific Sections */}
        {currentCategory === 'LOKALER_OG_BANER' && (
          <>
            <Section title={t('wizard.step.location')} stepId="location">
              <Field label={t('form.location.address')} value={formData.pickupLocation?.address} />
              <Field label={t('form.location.city')} value={formData.pickupLocation?.city} />
            </Section>
            <Section title={t('wizard.step.capacity')} stepId="capacity">
              <Field label={t('form.capacity.maxPersons')} value={formData.capacity} />
            </Section>
            <Section title={t('wizard.step.openingHours')} stepId="opening-hours">
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {t('form.review.openingHoursConfigured')}
              </Paragraph>
            </Section>
          </>
        )}

        {(currentCategory === 'UTSTYR_OG_INVENTAR' || currentCategory === 'KJORETOY_OG_TRANSPORT') && (
          <>
            <Section title={t('wizard.step.inventory')} stepId="inventory">
              <Field label={t('form.inventory.totalQuantity')} value={formData.totalQuantity} />
              <Field label={t('form.inventory.policy')} value={formData.inventoryPolicy} />
            </Section>
            <Section title={t('wizard.step.pickup')} stepId="pickup">
              <Field label={t('form.pickup.location')} value={formData.pickupLocation?.address} />
            </Section>
          </>
        )}

        {currentCategory === 'KJORETOY_OG_TRANSPORT' && (
          <Section title={t('wizard.step.requirements')} stepId="requirements">
            <Field label={t('form.requirements.licenseRequired')} value={formData.licenseRequired ? t('common.yes') : t('common.no')} />
            <Field label={t('form.requirements.minimumAge')} value={formData.ageRequirement} />
            <Field label={t('form.requirements.depositRequired')} value={formData.depositRequired ? t('common.yes') : t('common.no')} />
          </Section>
        )}

        {currentCategory === 'OPPLEVELSER_OG_ARRANGEMENT' && (
          <>
            <Section title={t('wizard.step.capacity')} stepId="capacity">
              <Field label={t('form.capacity.maxParticipants')} value={formData.capacity} />
            </Section>
            <Section title={t('wizard.step.packages')} stepId="packages">
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {(formData.packages as unknown[])?.length || 0} {t('form.review.packagesConfigured')}
              </Paragraph>
            </Section>
            <Section title={t('wizard.step.schedule')} stepId="schedule">
              <Field label={t('form.schedule.type')} value={formData.scheduleType} />
            </Section>
          </>
        )}

        {/* Booking Configuration */}
        <Section title={t('wizard.step.booking')} stepId="booking">
          <Field label={t('form.booking.basePrice')} value={`${formData.basePrice} øre`} />
          <Field label={t('form.booking.pricingUnit')} value={formData.pricingUnit} />
          <Field label={t('form.booking.memberDiscount')} value={`${formData.memberDiscount}%`} />
        </Section>

        {/* Content */}
        <Section title={t('wizard.step.content')} stepId="content">
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            {formData.richContent?.substring(0, 150) || t('form.review.noContent')}...
          </Paragraph>
          <Field label={t('form.content.faq')} value={`${(formData.faqs as unknown[])?.length || 0} ${t('form.review.faqItems')}`} />
        </Section>

        {/* Info Message */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderLeft: '4px solid var(--ds-color-info-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
            <span style={{ fontSize: 'var(--ds-font-size-lg)', flexShrink: 0 }}>💡</span>
            <span>{t('rentalObjects.reviewInfo')}</span>
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
