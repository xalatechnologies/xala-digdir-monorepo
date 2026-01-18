/**
 * Privacy Page - GDPR Data Subject Rights Portal
 *
 * Citizen-facing GDPR portal with:
 * - Data export
 * - Delete account
 * - Consent management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Switch,
  Alert,
  Spinner,
  DownloadIcon,
  TrashIcon,
  ShieldIcon,
} from '@xala/ds';
import {
  useCreateGdprRequest,
  useConsents,
  useUpdateConsents,
} from '@digilist/client-sdk';
import { useAuth } from '@xala/auth';
import { useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;

export function PrivacyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const t = useT();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Queries
  const { data: consentsData, isLoading: isLoadingConsents } = useConsents();
  const consents = consentsData?.data;

  // Mutations
  const createGdprRequestMutation = useCreateGdprRequest();
  const updateConsentsMutation = useUpdateConsents();

  // State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load consents into state
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
    setExportSuccess(false);
    try {
      await createGdprRequestMutation.mutateAsync({
        requestType: 'export',
        metadata: { reason: 'User requested data export via privacy portal' },
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (error) {
      console.error(t('validation.failed_to_request_data'), error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        t('common.er_du_sikker_paa')
      )
    ) {
      try {
        await createGdprRequestMutation.mutateAsync({
          requestType: 'deletion',
          metadata: { reason: 'User requested account deletion via privacy portal' },
        });
        alert(
          'Din slettingsforespørsel er mottatt og vil bli behandlet innen 30 dager. Du vil motta en e-post når forespørselen er fullført.'
        );
        await logout();
        navigate('/');
      } catch (error) {
        console.error(t('validation.failed_to_request_account'), error);
      }
    }
  };

  const handleUpdateConsent = async (field: keyof typeof consentSettings, value: boolean) => {
    const newConsents = { ...consentSettings, [field]: value };
    setConsentSettings(newConsents);
    try {
      await updateConsentsMutation.mutateAsync(newConsents);
    } catch (error) {
      console.error(t('validation.failed_to_update_consents'), error);
      setConsentSettings(consentSettings);
    }
  };

  if (isLoadingConsents) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster personverninnstillinger..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Personvern
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer dine personverninnstillinger og GDPR-rettigheter
          </Paragraph>
        </div>
        {exportSuccess && (
          <Alert style={{ maxWidth: isMobile ? '100%' : '400px' }}>
            t('common.din_eksportforesporsel_er_mottatt')
          </Alert>
        )}
      </div>

      {/* Data Export Card */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              <ShieldIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Eksporter dine data
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Last ned en kopi av alle dine personopplysninger
            </Paragraph>
          </div>

          <Alert>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              I henhold til GDPR artikkel 20 har du rett til å få en kopi av dine personopplysninger i et strukturert,
              maskinlesbart format. Eksporten inkluderer profil, bookinger, meldinger og aktivitetslogg.
            </Paragraph>
          </Alert>

          <div>
            <Button
              type="button"
              variant="secondary"
              data-size="md"
              onClick={handleExportData}
              disabled={isExporting}
              style={{ minHeight: '44px' }}
            >
              <DownloadIcon />
              {isExporting ? t('common.behandler_foresporsel') : 'Be om dataeksport'}
            </Button>
            <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', marginBottom: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Du vil motta en e-post med en nedlastingslenke når eksporten er klar (innen 30 dager)
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Consent Manager Card */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Samtykker
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Administrer hvordan vi bruker dine data
            </Paragraph>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {/* Marketing Consent */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                  t('common.markedsforing')
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Motta tips, tilbud og nyheter på e-post
                </Paragraph>
              </div>
              <Switch
                aria-label={t('common.markedsforing')}
                checked={consentSettings.marketing}
                onChange={(e) => handleUpdateConsent('marketing', e.target.checked)}
              />
            </div>

            {/* Analytics Consent */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                  Analyse
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Hjelp oss forbedre tjenesten med anonymisert bruksdata
                </Paragraph>
              </div>
              <Switch
                aria-label="Analyse"
                checked={consentSettings.analytics}
                onChange={(e) => handleUpdateConsent('analytics', e.target.checked)}
              />
            </div>

            {/* Third Party Sharing Consent */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                  t('common.deling_med_tredjeparter')
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tillat deling av data med samarbeidspartnere
                </Paragraph>
              </div>
              <Switch
                aria-label={t('common.deling_med_tredjeparter')}
                checked={consentSettings.thirdPartySharing}
                onChange={(e) => handleUpdateConsent('thirdPartySharing', e.target.checked)}
              />
            </div>
          </div>

          <Alert>
            <Paragraph data-size="xs" style={{ margin: 0 }}>
              Endringer i samtykker trer i kraft umiddelbart. Du kan endre disse innstillingene når som helst.
            </Paragraph>
          </Alert>
        </div>
      </Card>

      {/* Delete Account Card */}
      <Card style={{ padding: 'var(--ds-spacing-5)', border: '1px solid var(--ds-color-danger-border-default)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
              Slett konto
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Permanent sletting av din konto og alle tilknyttede data
            </Paragraph>
          </div>

          <Alert>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                Dette kan ikke angres
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                I henhold til GDPR artikkel 17 har du rett til å få slettet dine personopplysninger.
                Ved sletting av kontoen vil alle dine personopplysninger, bookinger, meldinger og
                aktivitetshistorikk bli permanent fjernet. Denne handlingen kan ikke reverseres.
              </Paragraph>
            </div>
          </Alert>

          <div>
            <Button
              type="button"
              variant="secondary"
              data-size="md"
              onClick={handleDeleteAccount}
              style={{
                minHeight: '44px',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                color: 'var(--ds-color-danger-text-default)',
                borderColor: 'var(--ds-color-danger-border-default)',
              }}
            >
              <TrashIcon />
              Slett min konto
            </Button>
            <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', marginBottom: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Din slettingsforespørsel vil bli behandlet innen 30 dager
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Additional GDPR Information */}
      <Card style={{ padding: 'var(--ds-spacing-5)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Dine rettigheter
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            I henhold til GDPR (General Data Protection Regulation) har du følgende rettigheter:
          </Paragraph>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)' }}>
            <li>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                <strong>{t('common.rett_til_innsyn')}</strong> Du kan be om en kopi av dine personopplysninger
              </Paragraph>
            </li>
            <li>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                <strong>{t('common.rett_til_retting')}</strong> Du kan korrigere feil i dine personopplysninger
              </Paragraph>
            </li>
            <li>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                <strong>{t('common.rett_til_sletting')}</strong> Du kan be om at dine personopplysninger slettes
              </Paragraph>
            </li>
            <li>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                <strong>{t('common.rett_til_dataportabilitet')}</strong> Du kan få dine data i et maskinlesbart format
              </Paragraph>
            </li>
          </ul>
          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            For spørsmål om personvern, kontakt personvernansvarlig på personvern@digilist.no
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}
