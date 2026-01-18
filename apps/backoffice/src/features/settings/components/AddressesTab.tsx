/**
 * AddressesTab Component
 * Manages user address information including residence and invoice addresses
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  FormField,
  Textfield,
  Select,
  SaveIcon,
  CopyIcon,
  InfoIcon,
} from '@xala/ds';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  type Address,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

interface AddressData {
  invoiceAddress: Address;
  residenceAddress: Address;
}

export function AddressesTab() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const { data: currentUserData } = useCurrentUser();
  const t = useT();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();

  const [addressData, setAddressData] = useState<AddressData>({
    invoiceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    },
    residenceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    },
  });

  // Load current user into address form
  useEffect(() => {
    if (currentUser) {
      setAddressData({
        invoiceAddress: currentUser.invoiceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
        residenceAddress: currentUser.residenceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
      });
    }
  }, [currentUser]);

  const handleSaveAddresses = async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync(addressData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyResidenceToInvoice = () => {
    setAddressData(prev => ({
      ...prev,
      invoiceAddress: { ...prev.residenceAddress },
    }));
  };

  return (
    <Stack spacing={5}>
      {/* Intro */}
      <Card>
        <Stack spacing={3}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Adresseinformasjon
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Administrer din bostedsadresse og fakturaadresse. Disse brukes for kommunikasjon og fakturering.
            </Paragraph>
          </div>
        </Stack>
      </Card>

      {/* Residence Address */}
      <Card>
        <Stack spacing={5}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Bostedsadresse
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Din registrerte bostedsadresse
            </Paragraph>
          </div>

          <Stack spacing={4}>
            <FormField label="Gateadresse" required>
              <Textfield aria-label={t('settings.ariaLabel.gateadresse')}
                value={addressData.residenceAddress.street}
                onChange={(e) => setAddressData(prev => ({
                  ...prev,
                  residenceAddress: { ...prev.residenceAddress, street: e.target.value }
                }))}
                placeholder={t('common.storgata_1')}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label="Poststed" required>
                <Textfield aria-label={t('settings.ariaLabel.poststed')}
                  value={addressData.residenceAddress.city}
                  onChange={(e) => setAddressData(prev => ({
                    ...prev,
                    residenceAddress: { ...prev.residenceAddress, city: e.target.value }
                  }))}
                  placeholder={t('settings.placeholder.oslo')}
                />
              </FormField>

              <FormField label="Postnummer" required>
                <Textfield aria-label={t('common.postnummer_bosted')}
                  value={addressData.residenceAddress.postalCode}
                  onChange={(e) => setAddressData(prev => ({
                    ...prev,
                    residenceAddress: { ...prev.residenceAddress, postalCode: e.target.value }
                  }))}
                  placeholder="0010"
                  maxLength={4}
                />
              </FormField>
            </div>

            <FormField label="Land" required>
              <Select
                value={addressData.residenceAddress.country || 'Norge'}
                onChange={(e) => setAddressData(prev => ({
                  ...prev,
                  residenceAddress: { ...prev.residenceAddress, country: e.target.value }
                }))}
              >
                <option value="Norge">{t('settings.text.norge')}</option>
                <option value="Sverige">{t('settings.text.sverige')}</option>
                <option value="Danmark">{t('settings.text.danmark')}</option>
                <option value="Finland">{t('settings.text.finland')}</option>
              </Select>
            </FormField>
          </Stack>
        </Stack>
      </Card>

      {/* Invoice Address */}
      <Card>
        <Stack spacing={5}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                Fakturaadresse
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Adresse for fakturering og betalingsinformasjon
              </Paragraph>
            </div>
            <Button
              variant="tertiary"
              data-size="sm"
              onClick={handleCopyResidenceToInvoice} type="button"
            >
              <CopyIcon />
              Kopier fra bostedsadresse
            </Button>
          </div>

          <Stack spacing={4}>
            <FormField label="Gateadresse" required>
              <Textfield aria-label={t('settings.ariaLabel.gateadresse')}
                value={addressData.invoiceAddress.street}
                onChange={(e) => setAddressData(prev => ({
                  ...prev,
                  invoiceAddress: { ...prev.invoiceAddress, street: e.target.value }
                }))}
                placeholder={t('common.storgata_1')}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label="Poststed" required>
                <Textfield aria-label={t('settings.ariaLabel.poststed')}
                  value={addressData.invoiceAddress.city}
                  onChange={(e) => setAddressData(prev => ({
                    ...prev,
                    invoiceAddress: { ...prev.invoiceAddress, city: e.target.value }
                  }))}
                  placeholder={t('settings.placeholder.oslo')}
                />
              </FormField>

              <FormField label="Postnummer" required>
                <Textfield aria-label={t('common.postnummer_faktura')}
                  value={addressData.invoiceAddress.postalCode}
                  onChange={(e) => setAddressData(prev => ({
                    ...prev,
                    invoiceAddress: { ...prev.invoiceAddress, postalCode: e.target.value }
                  }))}
                  placeholder="0010"
                  maxLength={4}
                />
              </FormField>
            </div>

            <FormField label="Land" required>
              <Select
                value={addressData.invoiceAddress.country || 'Norge'}
                onChange={(e) => setAddressData(prev => ({
                  ...prev,
                  invoiceAddress: { ...prev.invoiceAddress, country: e.target.value }
                }))}
              >
                <option value="Norge">{t('settings.text.norge')}</option>
                <option value="Sverige">{t('settings.text.sverige')}</option>
                <option value="Danmark">{t('settings.text.danmark')}</option>
                <option value="Finland">{t('settings.text.finland')}</option>
              </Select>
            </FormField>
          </Stack>
        </Stack>
      </Card>

      {/* Address Verification Info */}
      <Card style={{ backgroundColor: 'var(--ds-color-info-surface-default)', border: '1px solid var(--ds-color-info-border-subtle)' }}>
        <Stack spacing={3}>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'flex-start' }}>
            <InfoIcon style={{ color: 'var(--ds-color-info-text-default)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                Adresseverifikasjon
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Vi verifiserer adresseinformasjon mot offentlige registre for å sikre korrekt levering og kommunikasjon.
                Endringer i adresse kan ta opptil 24 timer å tre i kraft.
              </Paragraph>
            </div>
          </div>
        </Stack>
      </Card>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleSaveAddresses} disabled={isSaving} type="button" aria-label={t('common.lagre_adresser')}>
          <SaveIcon />
          {isSaving ? t('state.saving') : 'Lagre adresser'}
        </Button>
      </div>
    </Stack>
  );
}
