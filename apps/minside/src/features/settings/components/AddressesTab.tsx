/**
 * AddressesTab Component
 * Manages user address information including residence and invoice addresses
 */

import { useState, useEffect } from 'react';
import { useT } from '@xala/i18n';
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

interface AddressData {
  invoiceAddress: Address;
  residenceAddress: Address;
}

export function AddressesTab() {
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
              {t('common.adresseinformasjon')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.administrer.bostedsadresse.og.fakturaadresse')}
            </Paragraph>
          </div>
        </Stack>
      </Card>

      {/* Residence Address */}
      <Card>
        <Stack spacing={5}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.bostedsadresse')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.din.registrerte.bostedsadresse')}
            </Paragraph>
          </div>

          <Stack spacing={4}>
            <FormField label={t('common.gateadresse')} required>
              <Textfield aria-label={t('common.gateadresse')}
                value={addressData.residenceAddress.street}
                onChange={(e) => setAddressData(prev => ({
                  ...prev,
                  residenceAddress: { ...prev.residenceAddress, street: e.target.value }
                }))}
                placeholder={t('common.storgata_1')}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label={t('common.poststed')} required>
                <Textfield aria-label={t('common.poststed')}
                  value={addressData.residenceAddress.city}
                  onChange={(e) => setAddressData(prev => ({
                    ...prev,
                    residenceAddress: { ...prev.residenceAddress, city: e.target.value }
                  }))}
                  placeholder={t('settings.placeholder.oslo')}
                />
              </FormField>

              <FormField label={t('common.postnummer')} required>
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

            <FormField label={t('common.land')} required>
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
                {t('common.fakturaadresse')}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('common.adresse.for.fakturering')}
              </Paragraph>
            </div>
            <Button
              variant="tertiary"
              data-size="sm"
              onClick={handleCopyResidenceToInvoice} type="button"
            >
              <CopyIcon />
              {t('common.kopier.fra.bostedsadresse')}
            </Button>
          </div>

          <Stack spacing={4}>
            <FormField label={t('common.gateadresse')} required>
              <Textfield aria-label={t('common.gateadresse')}
                value={addressData.invoiceAddress.street}
                onChange={(e) => setAddressData(prev => ({
                  ...prev,
                  invoiceAddress: { ...prev.invoiceAddress, street: e.target.value }
                }))}
                placeholder={t('common.storgata_1')}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label={t('common.poststed')} required>
                <Textfield aria-label={t('common.poststed')}
                  value={addressData.invoiceAddress.city}
                  onChange={(e) => setAddressData(prev => ({
                    ...prev,
                    invoiceAddress: { ...prev.invoiceAddress, city: e.target.value }
                  }))}
                  placeholder={t('settings.placeholder.oslo')}
                />
              </FormField>

              <FormField label={t('common.postnummer')} required>
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

            <FormField label={t('common.land')} required>
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
                {t('common.adresseverifikasjon')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('common.vi.verifiserer.adresse.info')}
              </Paragraph>
            </div>
          </div>
        </Stack>
      </Card>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleSaveAddresses}
          disabled={isSaving}
          type="button"
          aria-label={isSaving ? t('common.lagrer_adresser') : 'Lagre adresser'}
        >
          <SaveIcon />
          {isSaving ? t('state.saving') : t('common.lagre_adresser')}
        </Button>
      </div>
    </Stack>
  );
}
