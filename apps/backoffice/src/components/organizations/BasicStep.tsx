/**
 * BasicStep Component
 * Collects basic organization information (name, contact, address)
 */

import { Stack, FormField, Textfield, Select, Paragraph, Heading } from '@xala/ds';
import type { ActorType } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export interface BasicData {
  name: string;
  organizationNumber?: string;
  actorType?: ActorType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface BasicStepProps {
  data: BasicData;
  onChange: (data: BasicData) => void;
  errors?: string[];
}

export function BasicStep({ data, onChange, errors = [] }: BasicStepProps) {
  const t = useT();
  const handleChange = (field: keyof BasicData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <Heading level={3} data-size="md" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
        Grunnleggende informasjon
      </Heading>
      <Paragraph
        data-size="sm"
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          marginBottom: 'var(--ds-spacing-5)'
        }}
      >
        Fyll ut organisasjonens grunnleggende informasjon. Navn og type er påkrevd.
      </Paragraph>

      {errors.length > 0 && (
        <div
          style={{
            marginBottom: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph
              key={idx}
              data-size="sm"
              style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}
            >
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      <Stack gap="4">
        {/* Name field (required) */}
        <FormField label="Organisasjonsnavn" htmlFor="org-name">
          <Textfield
            id="org-name"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Skriv inn organisasjonsnavn"
            required
          />
        </FormField>

        {/* Actor Type (required) */}
        <FormField label="Organisasjonstype" htmlFor="actor-type">
          <Select
            id="actor-type"
            value={data.actorType || 'municipality'}
            onChange={(e) => handleChange('actorType', e.target.value)}
          >
            <option value="municipality">Kommune</option>
            <option value="organization">Organisasjon</option>
            <option value="business">Bedrift</option>
            <option value="sports_club">Idrettslag</option>
            <option value="youth_organization">Ungdomsorganisasjon</option>
            <option value="school">Skole</option>
          </Select>
        </FormField>

        {/* Organization Number (optional) */}
        <FormField label="Organisasjonsnummer" htmlFor="org-number">
          <Textfield
            id="org-number"
            value={data.organizationNumber || ''}
            onChange={(e) => handleChange('organizationNumber', e.target.value)}
            placeholder="9 siffer"
          />
        </FormField>

        {/* Contact section */}
        <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Kontaktinformasjon
          </Heading>

          <Stack gap="3">
            <FormField label="E-post" htmlFor="email">
              <Textfield
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="post@example.no"
              />
            </FormField>

            <FormField label="Telefon" htmlFor="phone">
              <Textfield
                id="phone"
                type="tel"
                value={data.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+47 123 45 678"
              />
            </FormField>
          </Stack>
        </div>

        {/* Address section */}
        <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Adresse
          </Heading>

          <Stack gap="3">
            <FormField label="Gateadresse" htmlFor="address">
              <Textfield
                id="address"
                value={data.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Gateadresse"
              />
            </FormField>

            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
              <FormField label="Postnummer" htmlFor="postal-code" style={{ flex: '0 0 120px' }}>
                <Textfield
                  id="postal-code"
                  value={data.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="0000"
                  maxLength={4}
                />
              </FormField>

              <FormField label="Poststed" htmlFor="city" style={{ flex: '1' }}>
                <Textfield
                  id="city"
                  value={data.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Oslo"
                />
              </FormField>
            </div>
          </Stack>
        </div>
      </Stack>
    </div>
  );
}
