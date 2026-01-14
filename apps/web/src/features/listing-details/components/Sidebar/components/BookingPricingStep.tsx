/**
 * BookingPricingStep Component
 * Step 1: Price group selection, additional services, and terms acceptance
 */

import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

export interface PriceGroup {
  id: string;
  label: string;
  pricePerHour: number;
  description: string;
}

export interface AdditionalService {
  id: string;
  label: string;
  description: string;
  price: number;
}

export interface BookingPricingStepProps {
  priceGroups: PriceGroup[];
  additionalServices: AdditionalService[];
  selectedPriceGroup: string;
  selectedServices: Set<string>;
  termsAccepted: boolean;
  onPriceGroupChange: (groupId: string) => void;
  onServiceToggle: (serviceId: string, checked: boolean) => void;
  onTermsChange: (accepted: boolean) => void;
}

export function BookingPricingStep({
  priceGroups,
  additionalServices,
  selectedPriceGroup,
  selectedServices,
  termsAccepted,
  onPriceGroupChange,
  onServiceToggle,
  onTermsChange,
}: BookingPricingStepProps): React.ReactElement {
  return (
    <div style={{ padding: 'var(--ds-spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Price Group Selection */}
      <div>
        <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Prisgruppe
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Utleier tilbyr egne priser til enkelte kundegrupper. Valg av prisgruppe medfører en godkjenningsprosess.
        </Paragraph>
        <select
          value={selectedPriceGroup}
          onChange={(e) => onPriceGroupChange(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            fontSize: 'var(--ds-font-size-md)',
            color: 'var(--ds-color-neutral-text-default)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Velg prisgruppe</option>
          {priceGroups.map(group => (
            <option key={group.id} value={group.id}>
              {group.label} - {group.pricePerHour} kr/time
            </option>
          ))}
        </select>
        {selectedPriceGroup && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-accent-border-subtle)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-accent-text-default)' }}>
              {priceGroups.find(pg => pg.id === selectedPriceGroup)?.description}
            </Paragraph>
          </div>
        )}
      </div>

      {/* Additional Services */}
      <div>
        <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
          ANBEFALTE TILLEGG
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {additionalServices.map(service => (
            <label
              key={service.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: selectedServices.has(service.id)
                  ? '2px solid var(--ds-color-accent-base-default)'
                  : '1px solid var(--ds-color-neutral-border-subtle)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!selectedServices.has(service.id)) {
                  e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                  e.currentTarget.style.boxShadow = 'var(--ds-shadow-sm)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedServices.has(service.id)) {
                  e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedServices.has(service.id)}
                onChange={(e) => onServiceToggle(service.id, e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  accentColor: 'var(--ds-color-accent-base-default)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-1)' }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {service.label}
                  </Paragraph>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-accent-text-default)' }}>
                    +{service.price} kr
                  </Paragraph>
                </div>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {service.description}
                </Paragraph>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div>
        <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
          Vilkår og betingelser
        </Heading>
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            Les viktige vilkår
          </Paragraph>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-sm)', lineHeight: 'var(--ds-line-height-lg)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            <li>Avbestillingsregler og refusjonsvilkår</li>
            <li>Ansvar for skader og utstyr</li>
            <li>Ordensregler for lokalet</li>
          </ul>
          <div style={{ marginTop: 'var(--ds-spacing-3)', display: 'flex', gap: 'var(--ds-spacing-3)' }}>
            <a
              href="#"
              style={{
                color: 'var(--ds-color-accent-text-default)',
                fontSize: 'var(--ds-font-size-sm)',
                textDecoration: 'underline',
              }}
            >
              Les fullstendige vilkår
            </a>
            <a
              href="#"
              style={{
                color: 'var(--ds-color-accent-text-default)',
                fontSize: 'var(--ds-font-size-sm)',
                textDecoration: 'underline',
              }}
            >
              Personvernerklæring
            </a>
          </div>
        </div>

        {/* Terms acceptance checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--ds-spacing-3)',
            cursor: 'pointer',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-default)',
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              marginTop: '2px',
              accentColor: 'var(--ds-color-accent-base-default)',
              cursor: 'pointer',
            }}
          />
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Jeg har lest og godkjenner betingelsene
          </Paragraph>
        </label>
      </div>
    </div>
  );
}
