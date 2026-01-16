/**
 * Booking Step Component
 * For booking configuration and policies
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Paragraph, Switch, NativeSelect, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface BookingStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function BookingStep({ data, onChange, errors }: BookingStepProps): React.ReactElement {
  const t = useT();
  const config = data.bookingConfig || {};
  const pricing = data.pricing || { basePrice: 0, currency: 'NOK', unit: 'hour' };

  const updateConfig = (updates: Partial<typeof config>): void => {
    onChange({
      bookingConfig: {
        ...config,
        ...updates,
      },
    });
  };

  const updatePricing = (updates: Partial<typeof pricing>): void => {
    onChange({
      pricing: {
        ...pricing,
        ...updates,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.booking.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.booking.description')}
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

      {/* Pricing */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          {t('rentalObjects.field.pricing')}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <Textfield
            type="number"
            label={t('rentalObjects.field.basePrice')}
            value={pricing.basePrice.toString()}
            onChange={(e) => updatePricing({ basePrice: parseFloat(e.target.value) || 0 })}
            min={0}
            required
          />

          <NativeSelect
            label={t('rentalObjects.field.currency')}
            value={pricing.currency}
            onChange={(e) => updatePricing({ currency: e.target.value })}
          >
            <option value="NOK">NOK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </NativeSelect>

          <NativeSelect
            label={t('rentalObjects.field.pricingUnit')}
            value={pricing.unit}
            onChange={(e) => updatePricing({ unit: e.target.value as typeof pricing.unit })}
          >
            <option value="hour">{t('pricingUnit.hour')}</option>
            <option value="day">{t('pricingUnit.day')}</option>
            <option value="week">{t('pricingUnit.week')}</option>
            <option value="month">{t('pricingUnit.month')}</option>
            <option value="booking">{t('pricingUnit.booking')}</option>
          </NativeSelect>
        </div>
      </div>

      {/* Booking Model */}
      <NativeSelect
        label={t('rentalObjects.field.bookingModel')}
        value={config.bookingModel || 'instant'}
        onChange={(e) => updateConfig({ bookingModel: e.target.value as typeof config.bookingModel })}
      >
        <option value="instant">{t('bookingModel.instant')}</option>
        <option value="request">{t('bookingModel.request')}</option>
        <option value="approval">{t('bookingModel.approval')}</option>
      </NativeSelect>

      {/* Time Settings */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          {t('rentalObjects.field.timeSettings')}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <Textfield
            type="number"
            label={t('rentalObjects.field.slotDuration')}
            value={config.slotDurationMinutes?.toString() || ''}
            onChange={(e) => updateConfig({ slotDurationMinutes: parseInt(e.target.value, 10) || undefined })}
            min={15}
            step={15}
            description={t('rentalObjects.field.slotDurationDescription')}
          />

          <Textfield
            type="number"
            label={t('rentalObjects.field.minLeadTime')}
            value={config.minLeadTimeHours?.toString() || ''}
            onChange={(e) => updateConfig({ minLeadTimeHours: parseInt(e.target.value, 10) || undefined })}
            min={0}
            description={t('rentalObjects.field.minLeadTimeDescription')}
          />

          <Textfield
            type="number"
            label={t('rentalObjects.field.maxAdvanceDays')}
            value={config.maxAdvanceDays?.toString() || ''}
            onChange={(e) => updateConfig({ maxAdvanceDays: parseInt(e.target.value, 10) || undefined })}
            min={1}
            description={t('rentalObjects.field.maxAdvanceDaysDescription')}
          />

          <Textfield
            type="number"
            label={t('rentalObjects.field.bufferMinutes')}
            value={config.bufferBeforeMinutes?.toString() || ''}
            onChange={(e) => updateConfig({ bufferBeforeMinutes: parseInt(e.target.value, 10) || undefined })}
            min={0}
            description={t('rentalObjects.field.bufferDescription')}
          />
        </div>
      </div>

      {/* Policies */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          {t('rentalObjects.field.policies')}
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <Switch
            checked={config.approvalRequired || false}
            onChange={(e) => updateConfig({ approvalRequired: e.target.checked })}
          >
            {t('rentalObjects.field.approvalRequired')}
          </Switch>

          <Switch
            checked={config.paymentRequired || false}
            onChange={(e) => updateConfig({ paymentRequired: e.target.checked })}
          >
            {t('rentalObjects.field.paymentRequired')}
          </Switch>

          <Switch
            checked={config.allowRecurring || false}
            onChange={(e) => updateConfig({ allowRecurring: e.target.checked })}
          >
            {t('rentalObjects.field.allowRecurring')}
          </Switch>

          <Switch
            checked={config.allowSeasonalLease || false}
            onChange={(e) => updateConfig({ allowSeasonalLease: e.target.checked })}
          >
            {t('rentalObjects.field.allowSeasonalLease')}
          </Switch>
        </div>
      </div>

      {/* Cancellation Policy */}
      <NativeSelect
        label={t('rentalObjects.field.cancellationPolicy')}
        value={config.cancellationPolicy || 'flexible'}
        onChange={(e) => updateConfig({ cancellationPolicy: e.target.value as typeof config.cancellationPolicy })}
      >
        <option value="flexible">{t('cancellationPolicy.flexible')}</option>
        <option value="moderate">{t('cancellationPolicy.moderate')}</option>
        <option value="strict">{t('cancellationPolicy.strict')}</option>
      </NativeSelect>
    </div>
  );
}
