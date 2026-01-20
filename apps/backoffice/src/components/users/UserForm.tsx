/**
 * User Form Component
 * Create and edit backoffice users with role assignment
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  FormField,
  Textfield,
  Select,
  Alert,
} from '@xala/ds';
import type { User, CreateUserDTO, UserRole } from '@digilist/client-sdk';
import { FormSection, FormActions, InfoBox } from '@xala/ds';
import { useT } from '@xala/i18n';

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserDTO) => Promise<void>;
  onCancel: () => void;
}

const roleOptions = [
  { value: 'admin', label: 'Administrator', description: 'Full tilgang til alle funksjoner' },
  { value: 'saksbehandler', label: 'Saksbehandler', description: 'Behandle bookinger og forespørsler' },
];

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const t = useT();
  const [formData, setFormData] = useState<CreateUserDTO>({
    name: '',
    email: '',
    phone: '',
    role: 'saksbehandler',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      });
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }

    if (!formData.role) {
      newErrors.role = 'Rolle er påkrevd';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up empty strings
      const cleanData: CreateUserDTO = {
        ...formData,
        phone: formData.phone?.trim() || undefined,
      };

      await onSubmit(cleanData);
    } catch {
      // Failed to save user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateUserDTO) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectedRoleOption = roleOptions.find(opt => opt.value === formData.role);

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={5}>
        {/* Info Alert */}
        {!user && (
          <Alert severity="info">
            t('common.brukeren_vil_motta_en')
          </Alert>
        )}

        {/* Basic Information */}
        <FormSection title={t('users.title.brukerinformasjon')}>
          <Stack spacing={4}>
            <FormField
              label={t('common.fullt_navn')}
              required
              
              description={t('common.brukerens_fulle_navn')}
            >
              <Textfield
                value={formData.name}
                onChange={(e) => handleChange('name')(e.target.value)}
                placeholder={t('common.feks_ola_nordmann')}
                
              />
            </FormField>

            <FormField
              label={t('label.email')}
              required
              error={errors.email || undefined}
              description={user ? t('common.brukerens_epostadresse') : 'Invitasjonen sendes til denne adressen'}
            >
              <Textfield
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email')(e.target.value)}
                placeholder={t('users.placeholder.olanordmannkommuneno')}
                
                disabled={!!user} // Can't change email when editing
              />
            </FormField>

            <FormField
              label="Telefon"
              description={t('common.valgfri_kontaktinformasjon')}
            >
              <Textfield
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone')(e.target.value)}
                placeholder={t('users.placeholder.4712345678')}
              />
            </FormField>
          </Stack>
        </FormSection>

        {/* Role Assignment */}
        <FormSection title={t('common.tilgangsnivaa')}>
          <Stack spacing={4}>
            <FormField
              label="Rolle"
              required
              error={errors.role || undefined}
              description={t('common.velg_brukerens_rolle_og')}
            >
              <Select
                value={formData.role}
                onChange={(e) => handleChange('role')(e.target.value as UserRole)}
                error={!!errors.role}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Role Description */}
            {selectedRoleOption && (
              <InfoBox variant="info">
                <strong>{selectedRoleOption.label}:</strong> {selectedRoleOption.description}
              </InfoBox>
            )}
          </Stack>
        </FormSection>

        {/* Role Permission Details */}
        <FormSection title={`Tilganger for ${selectedRoleOption?.label}`}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {formData.role === 'admin' ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)' }}>
                <li>{t('common.full_tilgang_til_alle')}</li>
                <li>{t('common.behandle_bookinger_og_foresporsler')}</li>
                <li>{t('common.administrere_organisasjoner_og_medlemmer')}</li>
                <li>{t('common.administrere_brukere_og_roller')}</li>
                <li>{t('common.konfigurere_systeminnstillinger')}</li>
                <li>{t('common.se_rapporter_og_statistikk')}</li>
                <li>{t('common.se_revisjonslogger')}</li>
              </ul>
            ) : formData.role === 'saksbehandler' ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)' }}>
                <li>{t('common.behandle_bookinger_og_foresporsler')}</li>
                <li>{t('common.administrere_lokaler_og_ressurser')}</li>
                <li>{t('common.administrere_sesongleie')}</li>
                <li>{t('common.behandle_meldinger_fra_brukere')}</li>
                <li>{t('common.se_kalender_og_rapporter')}</li>
                <li>{t('common.kan_ikke_administrere_brukere')}</li>
              </ul>
            ) : (
              <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{t('common.ingen_tilganger')}</div>
            )}
          </div>
        </FormSection>

        {/* Actions */}
        <FormActions
          submitText={user ? t('common.lagre_endringer') : 'Send invitasjon'}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </form>
  );
}
