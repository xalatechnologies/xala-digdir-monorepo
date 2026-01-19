/**
 * Booking Settings Step Component
 * Enhanced version with tabs, presets, and live preview
 * Using proper DS components and i18n
 */

import { useState } from 'react';
import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Textarea,
  NativeSelect,
  Button,
  Checkbox,
  CreditCardIcon,
  SettingsIcon,
  ClockIcon,
  CheckIcon,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface BookingSettingsStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function BookingSettingsStep({ wizard }: BookingSettingsStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['booking-settings'] || errors['booking'] || [];
  const [activeTab, setActiveTab] = useState<'pricing' | 'policies' | 'timing'>('pricing');

  const currentCategory = formData.category;
  const basePrice = formData.basePrice || 0;
  const pricingUnit = formData.pricingUnit || 'hour';
  const memberDiscount = formData.memberDiscount || 0;
  const cancellationPolicy = formData.cancellationPolicy || '';
  const minAdvanceNotice = formData.minAdvanceNotice || 0;
  const maxAdvanceBooking = formData.maxAdvanceBooking || 30;
  const weekendPriceModifier = formData.weekendPriceModifier || 0;

  const requiresApproval = (formData as any).requiresApproval ?? false;
  const allowInstantBooking = (formData as any).allowInstantBooking ?? true;
  const allowRecurringBookings = (formData as any).allowRecurringBookings ?? false;

  const formatPrice = (cents: number): string => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const applyPricingPreset = (presetBasePrice: number, presetDiscount: number): void => {
    updateFormData({
      basePrice: presetBasePrice,
      memberDiscount: presetDiscount,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header with Live Price Preview */}
      <Card style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-accent-surface-default)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
              <CreditCardIcon style={{ width: '2rem', height: '2rem', color: 'var(--ds-color-accent-text-default)' }} aria-hidden="true" />
              <Heading level={2} data-size="md" style={{ margin: 0 }}>
                {t('wizard.step.booking-settings')}
              </Heading>
            </div>
            <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('rentalObjects.bookingDescription')}
            </Paragraph>
          </div>
          
          {/* Live Price Preview */}
          <Card style={{ padding: 'var(--ds-spacing-4)', minWidth: '180px', textAlign: 'center' }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('form.booking.currentPrice')}
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ margin: 'var(--ds-spacing-1) 0', color: 'var(--ds-color-accent-text-default)' }}>
              {formatPrice(basePrice)}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t(`form.booking.unit.${pricingUnit}`)}
            </Paragraph>
          </Card>
        </div>
      </Card>

      {/* Error Display */}
      {currentStepErrors.length > 0 && (
        <Alert data-color="danger">
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {currentStepErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', borderBottom: '2px solid var(--ds-color-neutral-border-subtle)' }}>
        <Button
          type="button"
          variant={activeTab === 'pricing' ? 'primary' : 'tertiary'}
          onClick={() => setActiveTab('pricing')}
        >
          <CreditCardIcon style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-2)' }} aria-hidden="true" />
          {t('form.booking.pricing')}
        </Button>
        <Button
          type="button"
          variant={activeTab === 'policies' ? 'primary' : 'tertiary'}
          onClick={() => setActiveTab('policies')}
        >
          <SettingsIcon style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-2)' }} aria-hidden="true" />
          {t('form.booking.policies')}
        </Button>
        <Button
          type="button"
          variant={activeTab === 'timing' ? 'primary' : 'tertiary'}
          onClick={() => setActiveTab('timing')}
        >
          <ClockIcon style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-2)' }} aria-hidden="true" />
          {t('form.booking.timing')}
        </Button>
      </div>

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <Card style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-neutral-surface-default)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
            {/* Quick Presets */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                {t('form.booking.quickPresets')}
              </Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
                <Button type="button" variant={basePrice === 0 ? 'primary' : 'secondary'} onClick={() => applyPricingPreset(0, 0)}>
                  {t('form.booking.preset.free')}
                </Button>
                <Button type="button" variant={basePrice === 20000 ? 'primary' : 'secondary'} onClick={() => applyPricingPreset(20000, 20)}>
                  {t('form.booking.preset.budget')}
                </Button>
                <Button type="button" variant={basePrice === 50000 ? 'primary' : 'secondary'} onClick={() => applyPricingPreset(50000, 15)}>
                  {t('form.booking.preset.standard')}
                </Button>
                <Button type="button" variant={basePrice === 100000 ? 'primary' : 'secondary'} onClick={() => applyPricingPreset(100000, 10)}>
                  {t('form.booking.preset.premium')}
                </Button>
              </div>
            </div>

            {/* Custom Pricing */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('form.booking.basePrice')}
                type="number"
                value={basePrice.toString()}
                onChange={(e) => updateFormData({ basePrice: e.target.value ? parseInt(e.target.value, 10) : 0 })}
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
              onChange={(e) => updateFormData({ memberDiscount: e.target.value ? parseInt(e.target.value, 10) : 0 })}
              min={0}
              max={100}
              description={t('form.booking.memberDiscountDescription')}
            />

            {/* Member Price Preview */}
            {memberDiscount > 0 && (
              <Alert data-color="success">
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {t('form.booking.memberPricePreview')}: {formatPrice(basePrice * (1 - memberDiscount / 100))}
                </Paragraph>
              </Alert>
            )}

            {/* Weekend Price Modifier (LOKALER_OG_BANER only) */}
            {currentCategory === 'LOKALER_OG_BANER' && (
              <Textfield
                label={t('form.booking.weekendPriceModifier')}
                type="number"
                value={weekendPriceModifier.toString()}
                onChange={(e) => updateFormData({ weekendPriceModifier: e.target.value ? parseInt(e.target.value, 10) : 0 })}
                min={-100}
                max={100}
                description={t('form.booking.weekendPriceModifierDescription')}
              />
            )}
          </div>
        </Card>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <Card style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-neutral-surface-default)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
            {/* Booking Options */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
                {t('form.booking.bookingOptions')}
              </Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                <Checkbox
                  label={t('form.booking.allowInstantBooking')}
                  description={t('form.booking.allowInstantBookingDescription')}
                  checked={allowInstantBooking}
                  onChange={(e) => updateFormData({ allowInstantBooking: e.target.checked } as any)}
                />
                <Checkbox
                  label={t('form.booking.requiresApproval')}
                  description={t('form.booking.requiresApprovalDescription')}
                  checked={requiresApproval}
                  onChange={(e) => updateFormData({ requiresApproval: e.target.checked } as any)}
                />
                <Checkbox
                  label={t('form.booking.allowRecurringBookings')}
                  description={t('form.booking.allowRecurringBookingsDescription')}
                  checked={allowRecurringBookings}
                  onChange={(e) => updateFormData({ allowRecurringBookings: e.target.checked } as any)}
                />
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                {t('form.booking.cancellationPolicy')}
              </Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
                <Button
                  type="button"
                  variant={cancellationPolicy.includes('24 timer') ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ cancellationPolicy: t('form.booking.cancellation.flexible') })}
                >
                  {t('form.booking.cancellation.flexibleLabel')}
                </Button>
                <Button
                  type="button"
                  variant={cancellationPolicy.includes('3 dager') ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ cancellationPolicy: t('form.booking.cancellation.moderate') })}
                >
                  {t('form.booking.cancellation.moderateLabel')}
                </Button>
                <Button
                  type="button"
                  variant={cancellationPolicy.includes('Ingen refusjon') ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ cancellationPolicy: t('form.booking.cancellation.strict') })}
                >
                  {t('form.booking.cancellation.strictLabel')}
                </Button>
              </div>
              <Textarea
                label={t('form.booking.customCancellationPolicy')}
                value={cancellationPolicy}
                onChange={(e) => updateFormData({ cancellationPolicy: e.target.value })}
                rows={4}
                placeholder={t('form.booking.cancellationPolicyPlaceholder')}
                description={t('form.booking.cancellationPolicyDescription')}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Timing Tab */}
      {activeTab === 'timing' && (
        <Card style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-neutral-surface-default)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
            {/* Timing Presets */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                {t('form.booking.timingPresets')}
              </Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
                <Button
                  type="button"
                  variant={minAdvanceNotice === 0 ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ minAdvanceNotice: 0, maxAdvanceBooking: 90 })}
                >
                  {t('form.booking.timing.flexible')}
                </Button>
                <Button
                  type="button"
                  variant={minAdvanceNotice === 24 ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ minAdvanceNotice: 24, maxAdvanceBooking: 60 })}
                >
                  {t('form.booking.timing.standard')}
                </Button>
                <Button
                  type="button"
                  variant={minAdvanceNotice === 72 ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ minAdvanceNotice: 72, maxAdvanceBooking: 30 })}
                >
                  {t('form.booking.timing.planned')}
                </Button>
                <Button
                  type="button"
                  variant={minAdvanceNotice === 168 ? 'primary' : 'secondary'}
                  onClick={() => updateFormData({ minAdvanceNotice: 168, maxAdvanceBooking: 180 })}
                >
                  {t('form.booking.timing.longterm')}
                </Button>
              </div>
            </div>

            {/* Custom Timing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('form.booking.minAdvanceNotice')}
                type="number"
                value={minAdvanceNotice.toString()}
                onChange={(e) => updateFormData({ minAdvanceNotice: e.target.value ? parseInt(e.target.value, 10) : 0 })}
                min={0}
                description={t('form.booking.minAdvanceNoticeDescription')}
              />
              <Textfield
                label={t('form.booking.maxAdvanceBooking')}
                type="number"
                value={maxAdvanceBooking.toString()}
                onChange={(e) => updateFormData({ maxAdvanceBooking: e.target.value ? parseInt(e.target.value, 10) : 30 })}
                min={1}
                description={t('form.booking.maxAdvanceBookingDescription')}
              />
            </div>

            {/* Summary */}
            <Alert data-color="info">
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                <strong>{t('form.booking.timingSummary')}:</strong> {t('form.booking.timingSummaryText', { minAdvance: minAdvanceNotice, maxAdvance: maxAdvanceBooking })}
              </Paragraph>
            </Alert>
          </div>
        </Card>
      )}

      {/* Status Summary */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CheckIcon style={{ width: '1rem', height: '1rem', color: basePrice > 0 ? 'var(--ds-color-success-icon-default)' : 'var(--ds-color-neutral-icon-subtle)' }} aria-hidden="true" />
          <Paragraph data-size="sm" style={{ margin: 0 }}>{t('form.booking.status.priceSet')}</Paragraph>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CheckIcon style={{ width: '1rem', height: '1rem', color: cancellationPolicy ? 'var(--ds-color-success-icon-default)' : 'var(--ds-color-neutral-icon-subtle)' }} aria-hidden="true" />
          <Paragraph data-size="sm" style={{ margin: 0 }}>{t('form.booking.status.cancellationSet')}</Paragraph>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CheckIcon style={{ width: '1rem', height: '1rem', color: 'var(--ds-color-success-icon-default)' }} aria-hidden="true" />
          <Paragraph data-size="sm" style={{ margin: 0 }}>{t('form.booking.status.timingSet')}</Paragraph>
        </div>
      </div>
    </div>
  );
}
