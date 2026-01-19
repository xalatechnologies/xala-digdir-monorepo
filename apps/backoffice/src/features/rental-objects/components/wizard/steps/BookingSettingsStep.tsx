/**
 * Booking Settings Step Component
 * Super interactive tab for configuring pricing, policies, and booking timing
 * Designed for easy real-time editing with visual feedback
 */

import { useState } from 'react';
import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  NativeSelect,
  Button,
  Switch,
  CreditCardIcon,
  SettingsIcon,
  ClockIcon,
  CheckIcon,
  SparklesIcon,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface BookingSettingsStepProps {
  wizard: UseRentalObjectWizardReturn;
}

interface PricingPreset {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  memberDiscount: number;
  weekendModifier: number;
}

const PRICING_PRESETS: PricingPreset[] = [
  { id: 'free', name: 'Gratis', basePrice: 0, unit: 'hour', memberDiscount: 0, weekendModifier: 0 },
  { id: 'budget', name: 'Budsjett', basePrice: 20000, unit: 'hour', memberDiscount: 20, weekendModifier: 0 },
  { id: 'standard', name: 'Standard', basePrice: 50000, unit: 'hour', memberDiscount: 15, weekendModifier: 25 },
  { id: 'premium', name: 'Premium', basePrice: 100000, unit: 'hour', memberDiscount: 10, weekendModifier: 50 },
];

const TIMING_PRESETS = [
  { id: 'flexible', name: 'Fleksibel', minAdvance: 0, maxAdvance: 90, description: 'Ingen minstekrav' },
  { id: 'standard', name: 'Standard', minAdvance: 24, maxAdvance: 60, description: '24 timer i forveien' },
  { id: 'planned', name: 'Planlagt', minAdvance: 72, maxAdvance: 30, description: '3 dager i forveien' },
  { id: 'long-term', name: 'Langsiktig', minAdvance: 168, maxAdvance: 180, description: '1 uke i forveien' },
];

export function BookingSettingsStep({ wizard }: BookingSettingsStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['booking-settings'] || errors['booking'] || [];
  const [activeTab, setActiveTab] = useState<'pricing' | 'policies' | 'timing'>('pricing');

  // Cast to any to access booking-specific fields not in RentalObject type
  const data = formData as any;
  const currentCategory = data.category;
  const basePrice = data.basePrice || 0;
  const pricingUnit = data.pricingUnit || 'hour';
  const memberDiscount = data.memberDiscount || 0;
  const cancellationPolicy = data.cancellationPolicy || '';
  const minAdvanceNotice = data.minAdvanceNotice || 0;
  const maxAdvanceBooking = data.maxAdvanceBooking || 30;
  const weekendPriceModifier = data.weekendPriceModifier || 0;
  
  const requiresApproval = data.requiresApproval ?? false;
  const allowInstantBooking = data.allowInstantBooking ?? true;
  const allowRecurringBookings = data.allowRecurringBookings ?? false;

  const applyPricingPreset = (preset: PricingPreset) => {
    updateFormData({
      basePrice: preset.basePrice,
      pricingUnit: preset.unit,
      memberDiscount: preset.memberDiscount,
      weekendPriceModifier: preset.weekendModifier,
    } as any);
  };

  const applyTimingPreset = (preset: typeof TIMING_PRESETS[0]) => {
    updateFormData({
      minAdvanceNotice: preset.minAdvance,
      maxAdvanceBooking: preset.maxAdvance,
    } as any);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      hour: 'time',
      day: 'dag',
      booking: 'booking',
      week: 'uke',
    };
    return labels[unit] || unit;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header with price preview */}
      <Card style={{ padding: 'var(--ds-spacing-6)', background: 'linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-accent-surface-hover) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
              <CreditCardIcon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--ds-color-accent-text-default)' }} />
              <Heading level={2} data-size="md" style={{ margin: 0 }}>
                {t('wizard.step.bookingSettings')}
              </Heading>
            </div>
            <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Konfigurer priser, regler og bookinginnstillinger
            </Paragraph>
          </div>
          
          {/* Live Price Preview */}
          <div style={{ 
            padding: 'var(--ds-spacing-4)', 
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            textAlign: 'center',
            minWidth: '180px',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Gjeldende pris
            </Paragraph>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ds-color-accent-text-default)' }}>
              {formatPrice(basePrice)}
            </div>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              per {getUnitLabel(pricingUnit)}
            </Paragraph>
          </div>
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
      <div style={{ 
        display: 'flex', 
        gap: 'var(--ds-spacing-2)', 
        borderBottom: '2px solid var(--ds-color-neutral-border-subtle)',
        paddingBottom: 'var(--ds-spacing-1)',
      }}>
        {[
          { id: 'pricing' as const, label: 'Priser', icon: CreditCardIcon },
          { id: 'policies' as const, label: 'Regler', icon: SettingsIcon },
          { id: 'timing' as const, label: 'Timing', icon: ClockIcon },
        ].map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? 'primary' : 'tertiary'}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              borderRadius: 'var(--ds-border-radius-md) var(--ds-border-radius-md) 0 0',
              borderBottom: activeTab === tab.id ? '2px solid var(--ds-color-accent-base-default)' : 'none',
            }}
          >
            <tab.icon style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-2)' }} />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
            {/* Quick Presets */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                <SparklesIcon style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }} />
                Hurtigvalg
              </Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
                {PRICING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPricingPreset(preset)}
                    style={{
                      padding: 'var(--ds-spacing-4)',
                      border: basePrice === preset.basePrice ? '2px solid var(--ds-color-accent-border-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: basePrice === preset.basePrice ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>{preset.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatPrice(preset.basePrice)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pricing */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
                  Grunnpris (øre)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={5000}
                    value={basePrice}
                    onChange={(e) => updateFormData({ basePrice: parseInt(e.target.value, 10) } as any)}
                    style={{ flex: 1, height: '8px', cursor: 'pointer' }}
                  />
                  <Textfield
                    type="number"
                    aria-label="Pris i kroner"
                    value={(basePrice / 100).toString()}
                    onChange={(e) => updateFormData({ basePrice: (parseFloat(e.target.value) || 0) * 100 } as any)}
                    min={0}
                    style={{ width: '120px' }}
                  />
                  <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>kr</span>
                </div>
              </div>

              <NativeSelect
                label="Prisenhet"
                value={pricingUnit}
                onChange={(e) => updateFormData({ pricingUnit: e.target.value } as any)}
              >
                <option value="hour">Per time</option>
                <option value="day">Per dag</option>
                <option value="booking">Per booking</option>
                <option value="week">Per uke</option>
              </NativeSelect>
            </div>

            {/* Member Discount Slider */}
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
                Medlemsrabatt: {memberDiscount}%
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>0%</span>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={memberDiscount}
                  onChange={(e) => updateFormData({ memberDiscount: parseInt(e.target.value, 10) } as any)}
                  style={{ flex: 1, height: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>50%</span>
              </div>
              {memberDiscount > 0 && (
                <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
                  Medlemspris: {formatPrice(basePrice * (1 - memberDiscount / 100))} per {getUnitLabel(pricingUnit)}
                </Paragraph>
              )}
            </div>

            {/* Weekend Modifier (only for venues) */}
            {currentCategory === 'LOKALER_OG_BANER' && (
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
                  Helgetillegg: {weekendPriceModifier > 0 ? '+' : ''}{weekendPriceModifier}%
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>-50%</span>
                  <input
                    type="range"
                    min={-50}
                    max={100}
                    value={weekendPriceModifier}
                    onChange={(e) => updateFormData({ weekendPriceModifier: parseInt(e.target.value, 10) } as any)}
                    style={{ flex: 1, height: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>+100%</span>
                </div>
                {weekendPriceModifier !== 0 && (
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: weekendPriceModifier > 0 ? 'var(--ds-color-warning-text-default)' : 'var(--ds-color-success-text-default)' }}>
                    Helgepris: {formatPrice(basePrice * (1 + weekendPriceModifier / 100))} per {getUnitLabel(pricingUnit)}
                  </Paragraph>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
            {/* Quick Toggles */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
                Bookinginnstillinger
              </Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Direktebooking</div>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      La brukere booke umiddelbart uten godkjenning
                    </Paragraph>
                  </div>
                  <Switch
                    aria-label="Direktebooking"
                    checked={allowInstantBooking}
                    onChange={(e) => updateFormData({ allowInstantBooking: e.target.checked } as any)}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Krever godkjenning</div>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Administrator må godkjenne hver booking
                    </Paragraph>
                  </div>
                  <Switch
                    aria-label="Krever godkjenning"
                    checked={requiresApproval}
                    onChange={(e) => updateFormData({ requiresApproval: e.target.checked } as any)}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Tillat gjentagende bookinger</div>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Brukere kan sette opp ukentlige/månedlige bookinger
                    </Paragraph>
                  </div>
                  <Switch
                    aria-label="Tillat gjentagende bookinger"
                    checked={allowRecurringBookings}
                    onChange={(e) => updateFormData({ allowRecurringBookings: e.target.checked } as any)}
                  />
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                Avbestillingsregler
              </Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
                {[
                  { label: 'Fleksibel', value: 'Gratis avbestilling inntil 24 timer før.' },
                  { label: 'Moderat', value: 'Gratis avbestilling inntil 3 dager før. 50% gebyr etter det.' },
                  { label: 'Streng', value: 'Ingen refusjon ved avbestilling.' },
                ].map((policy) => (
                  <button
                    key={policy.label}
                    type="button"
                    onClick={() => updateFormData({ cancellationPolicy: policy.value } as any)}
                    style={{
                      padding: 'var(--ds-spacing-3)',
                      border: cancellationPolicy === policy.value ? '2px solid var(--ds-color-accent-border-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: cancellationPolicy === policy.value ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                    }}
                  >
                    {policy.label}
                  </button>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
                  Egendefinerte regler
                </label>
                <textarea
                  value={cancellationPolicy}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ cancellationPolicy: e.target.value } as any)}
                  rows={3}
                  placeholder="Skriv dine egne avbestillingsregler..."
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timing Tab */}
      {activeTab === 'timing' && (
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
            {/* Timing Presets */}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                <SparklesIcon style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }} />
                Hurtigvalg for timing
              </Heading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
                {TIMING_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyTimingPreset(preset)}
                    style={{
                      padding: 'var(--ds-spacing-4)',
                      border: minAdvanceNotice === preset.minAdvance ? '2px solid var(--ds-color-accent-border-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: minAdvanceNotice === preset.minAdvance ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-1)' }}>{preset.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Timing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-6)' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
                  Minimum varsel: {minAdvanceNotice} timer
                </label>
                <input
                  type="range"
                  min={0}
                  max={168}
                  step={1}
                  value={minAdvanceNotice}
                  onChange={(e) => updateFormData({ minAdvanceNotice: parseInt(e.target.value, 10) } as any)}
                  style={{ width: '100%', height: '8px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                  <span>Ingen</span>
                  <span>1 uke</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
                  Maks fremtidig booking: {maxAdvanceBooking} dager
                </label>
                <input
                  type="range"
                  min={1}
                  max={365}
                  value={maxAdvanceBooking}
                  onChange={(e) => updateFormData({ maxAdvanceBooking: parseInt(e.target.value, 10) } as any)}
                  style={{ width: '100%', height: '8px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                  <span>1 dag</span>
                  <span>1 år</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              borderLeft: '4px solid var(--ds-color-info-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                <strong>Oppsummering:</strong> Brukere må booke minst {minAdvanceNotice === 0 ? 'umiddelbart' : `${minAdvanceNotice} timer`} i forveien og kan booke opp til {maxAdvanceBooking} dager frem i tid.
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Status */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--ds-spacing-4)', 
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CheckIcon style={{ width: '1rem', height: '1rem', color: basePrice > 0 ? 'var(--ds-color-success-icon-default)' : 'var(--ds-color-neutral-icon-subtle)' }} />
          <span style={{ fontSize: '0.875rem' }}>Pris satt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CheckIcon style={{ width: '1rem', height: '1rem', color: cancellationPolicy ? 'var(--ds-color-success-icon-default)' : 'var(--ds-color-neutral-icon-subtle)' }} />
          <span style={{ fontSize: '0.875rem' }}>Avbestillingsregler</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CheckIcon style={{ width: '1rem', height: '1rem', color: 'var(--ds-color-success-icon-default)' }} />
          <span style={{ fontSize: '0.875rem' }}>Timing konfigurert</span>
        </div>
      </div>
    </div>
  );
}
