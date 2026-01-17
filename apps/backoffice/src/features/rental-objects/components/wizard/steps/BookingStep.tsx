/**
 * Booking Step Component
 * For configuring pricing and booking policies (all categories)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Textarea,
  NativeSelect,
  CreditCardIcon,
  SettingsIcon,
  ClockIcon,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface BookingStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function BookingStep({ wizard }: BookingStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['booking'] || [];

  const currentCategory = formData.category;
  const basePrice = formData.basePrice || 0;
  const pricingUnit = formData.pricingUnit || 'hour';
  const memberDiscount = formData.memberDiscount || 0;
  const cancellationPolicy = formData.cancellationPolicy || '';
  const minAdvanceNotice = formData.minAdvanceNotice || 0;
  const maxAdvanceBooking = formData.maxAdvanceBooking || 30;
  const weekendPriceModifier = formData.weekendPriceModifier || 0;

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
            <CreditCardIcon
              style={{
                width: '2rem',
                height: '2rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={2} data-size="md" style={{ margin: 0 }}>
              {t('wizard.step.booking')}
            </Heading>
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.bookingDescription')}
          </Paragraph>
        </div>

        {/* Error Display */}
        {currentStepErrors.length > 0 && (
          <Alert severity="danger">
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {currentStepErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Pricing Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <CreditCardIcon
              style={{
                width: '1.5rem',
                height: '1.5rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.booking.pricing')}
            </Heading>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('form.booking.basePrice')}
                type="number"
                value={basePrice.toString()}
                onChange={(e) =>
                  updateFormData({ basePrice: e.target.value ? parseInt(e.target.value, 10) : 0 })
                }
                min={0}
                step={100}
                required
                description={t('form.booking.basePriceDescription')}
              />

              <NativeSelect
                label={t('form.booking.pricingUnit')}
                value={pricingUnit}
                onChange={(e) => updateFormData({ pricingUnit: e.target.value })}
              >
                <option value="hour">{t('form.booking.unit.hour')}</option>
                <option value="day">{t('form.booking.unit.day')}</option>
                <option value="booking">{t('form.booking.unit.booking')}</option>
                <option value="week">{t('form.booking.unit.week')}</option>
              </NativeSelect>
            </div>

            <Textfield
              label={t('form.booking.memberDiscount')}
              type="number"
              value={memberDiscount.toString()}
              onChange={(e) =>
                updateFormData({ memberDiscount: e.target.value ? parseInt(e.target.value, 10) : 0 })
              }
              min={0}
              max={100}
              description={t('form.booking.memberDiscountDescription')}
            />

            {/* Weekend Price Modifier (LOKALER_OG_BANER only) */}
            {currentCategory === 'LOKALER_OG_BANER' && (
              <Textfield
                label={t('form.booking.weekendPriceModifier')}
                type="number"
                value={weekendPriceModifier.toString()}
                onChange={(e) =>
                  updateFormData({ weekendPriceModifier: e.target.value ? parseInt(e.target.value, 10) : 0 })
                }
                min={-100}
                max={100}
                description={t('form.booking.weekendPriceModifierDescription')}
              />
            )}
          </div>
        </div>

        {/* Booking Policies */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <SettingsIcon
              style={{
                width: '1.5rem',
                height: '1.5rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.booking.policies')}
            </Heading>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textarea
              label={t('form.booking.cancellationPolicy')}
              value={cancellationPolicy}
              onChange={(e) => updateFormData({ cancellationPolicy: e.target.value })}
              rows={4}
              placeholder={t('form.booking.cancellationPolicyPlaceholder')}
              description={t('form.booking.cancellationPolicyDescription')}
            />
          </div>
        </div>

        {/* Timing Requirements */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <ClockIcon
              style={{
                width: '1.5rem',
                height: '1.5rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.booking.timing')}
            </Heading>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('form.booking.minAdvanceNotice')}
              type="number"
              value={minAdvanceNotice.toString()}
              onChange={(e) =>
                updateFormData({ minAdvanceNotice: e.target.value ? parseInt(e.target.value, 10) : 0 })
              }
              min={0}
              description={t('form.booking.minAdvanceNoticeDescription')}
            />

            <Textfield
              label={t('form.booking.maxAdvanceBooking')}
              type="number"
              value={maxAdvanceBooking.toString()}
              onChange={(e) =>
                updateFormData({ maxAdvanceBooking: e.target.value ? parseInt(e.target.value, 10) : 30 })
              }
              min={1}
              description={t('form.booking.maxAdvanceBookingDescription')}
            />
          </div>
        </div>

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
            <span>{t('rentalObjects.bookingInfo')}</span>
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
