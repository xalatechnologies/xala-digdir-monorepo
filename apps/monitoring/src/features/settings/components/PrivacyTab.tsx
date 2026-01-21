/**
 * PrivacyTab Component
 * Manages privacy settings, data export, consents, and account deletion
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  Switch,
  Alert,
  DownloadIcon,
  TrashIcon,
  ShieldIcon,
} from '@xalatechnologies/platform/ui';
import {
  useConsents,
  useUpdateConsents,
  useExportData,
  useDeleteAccount,
} from '@digilist/client-sdk';
import { useAuth } from '@xala/auth';

interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
}

export function PrivacyTab() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const t = useT();
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: consentsData } = useConsents();
  const consents = consentsData?.data;

  // Mutations
  const updateConsentsMutation = useUpdateConsents();
  const exportDataMutation = useExportData();
  const deleteAccountMutation = useDeleteAccount();

  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });

  // Load consents
  useEffect(() => {
    if (consents) {
      setConsentSettings({
        marketing: consents.marketing || false,
        analytics: consents.analytics || false,
        thirdPartySharing: consents.thirdPartySharing || false,
      });
    }
  }, [consents]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportDataMutation.mutateAsync();
      // Create download link
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mine-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm(t('common.er_du_sikker_paa'))) {
      try {
        await deleteAccountMutation.mutateAsync();
        logout();
        navigate('/');
      } catch {
        // Error handling is managed by the SDK
      }
    }
  };

  const handleUpdateConsents = async (field: keyof ConsentSettings, value: boolean) => {
    const newConsents = { ...consentSettings, [field]: value };
    setConsentSettings(newConsents);
    try {
      await updateConsentsMutation.mutateAsync(newConsents);
    } catch {
      // Error handling is managed by the SDK
    }
  };

  return (
    <Stack spacing={6}>
      {/* Data Export */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              <ShieldIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Dataeksport
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Last ned en kopi av alle dine personopplysninger
            </Paragraph>
          </div>

          <Alert>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              I henhold til GDPR har du rett til å få en kopi av dine personopplysninger. Eksporten inkluderer profil, bookinger, meldinger og aktivitetslogg.
            </Paragraph>
          </Alert>

          <Button
            variant="secondary"
            onClick={handleExportData}
            disabled={isExporting}
            type="button"
            aria-label={t('common.eksporter_mine_data')}
          >
            <DownloadIcon />
            {isExporting ? t('common.eksporterer') : 'Last ned mine data'}
          </Button>
        </Stack>
      </Card>

      {/* Consent Settings */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Samtykker
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Administrer hvordan vi bruker dine data
            </Paragraph>
          </div>

          <Stack spacing={3}>
            <div style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Markedsføring
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Motta tips, tilbud og nyheter på e-post
                </Paragraph>
              </div>
              <Switch
                checked={consentSettings.marketing}
                onChange={(e) => handleUpdateConsents('marketing', e.target.checked)}
                aria-label={t('common.markedsforing')}
              />
            </div>

            <div style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Analyse
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Hjelp oss forbedre tjenesten med anonymisert bruksdata
                </Paragraph>
              </div>
              <Switch
                checked={consentSettings.analytics}
                onChange={(e) => handleUpdateConsents('analytics', e.target.checked)}
                aria-label={t('settings.ariaLabel.analyse')}
              />
            </div>

            <div style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Deling med tredjeparter
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tillat deling av data med samarbeidspartnere
                </Paragraph>
              </div>
              <Switch
                checked={consentSettings.thirdPartySharing}
                onChange={(e) => handleUpdateConsents('thirdPartySharing', e.target.checked)}
                aria-label={t('common.deling_med_tredjeparter')}
              />
            </div>
          </Stack>
        </Stack>
      </Card>

      {/* Delete Account */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
              Slett konto
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Permanent sletting av din konto og alle tilknyttede data
            </Paragraph>
          </div>

          <Alert>
            <Stack spacing={2}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Dette kan ikke angres
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                Ved sletting av kontoen vil alle dine personopplysninger, bookinger, meldinger og aktivitetshistorikk bli permanent fjernet. Denne handlingen kan ikke reverseres.
              </Paragraph>
            </Stack>
          </Alert>

          <Button
            variant="secondary"
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: 'var(--ds-color-danger-surface-default)',
              color: 'var(--ds-color-danger-text-default)',
              borderColor: 'var(--ds-color-danger-border-default)'
            }} type="button"
          >
            <TrashIcon />
            Slett min konto
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
