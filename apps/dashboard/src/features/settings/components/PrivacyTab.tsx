/**
 * PrivacyTab Component
 * Manages privacy settings, data export, consents, and account deletion
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xalatechnologies/platform/i18n';
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
import { useAuth } from '@xalatechnologies/platform/auth';

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

  // Load consents - handle both array format (from SDK) and object format
  useEffect(() => {
    if (consents) {
      const data = consents as any;
      if (Array.isArray(data)) {
        // SDK returns Consent[] array - find each consent type
        const findConsent = (type: string) => 
          data.find((c: any) => c.type === type)?.granted ?? false;
        setConsentSettings({
          marketing: findConsent('marketing'),
          analytics: findConsent('analytics'),
          thirdPartySharing: findConsent('thirdPartySharing'),
        });
      } else {
        // Legacy object format
        setConsentSettings({
          marketing: data.marketing || false,
          analytics: data.analytics || false,
          thirdPartySharing: data.thirdPartySharing || false,
        });
      }
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
      // Transform to array format expected by SDK
      const payload = [
        { type: 'marketing', granted: newConsents.marketing },
        { type: 'analytics', granted: newConsents.analytics },
        { type: 'thirdPartySharing', granted: newConsents.thirdPartySharing },
      ];
      await updateConsentsMutation.mutateAsync(payload as any);
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
              {t('common.dataeksport')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.last.ned.kopi.av.personopplysninger')}
            </Paragraph>
          </div>

          <Alert>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('common.gdpr.eksport.beskrivelse')}
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
            {isExporting ? t('common.eksporterer') : t('common.last.ned.mine.data')}
          </Button>
        </Stack>
      </Card>

      {/* Consent Settings */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.samtykker')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.administrer.hvordan.vi.bruker.data')}
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
                  {t('common.markedsforing')}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('common.motta.tips.tilbud.nyheter')}
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
                  {t('common.analyse')}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('common.hjelp.oss.forbedre.tjenesten')}
                </Paragraph>
              </div>
              <Switch
                checked={consentSettings.analytics}
                onChange={(e) => handleUpdateConsents('analytics', e.target.checked)}
                aria-label={t('common.analyse')}
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
                  {t('common.deling.med.tredjeparter')}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('common.tillat.deling.med.partnere')}
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
              {t('common.slett.konto')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.permanent.sletting.av.konto')}
            </Paragraph>
          </div>

          <Alert>
            <Stack spacing={2}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('common.dette.kan.ikke.angres')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {t('common.sletting.advarsel')}
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
            {t('common.slett.min.konto')}
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
