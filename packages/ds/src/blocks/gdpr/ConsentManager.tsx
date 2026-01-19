/**
 * ConsentManager
 *
 * Component for managing GDPR consent preferences
 * - Marketing consent
 * - Analytics consent
 * - Third-party sharing consent
 * - Shows last updated timestamp
 */

import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Switch } from '@xala/ds';
import { useConsents, useUpdateConsents } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;

export function ConsentManager() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Fetch current consents
  const { data: consentsData, isLoading } = useConsents();
  const t = useT();

  // Update consents mutation
  const updateConsents = useUpdateConsents();

  // Local state for consent toggles
  const [consents, setConsents] = useState({
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update local state when consents data is loaded
  useEffect(() => {
    if (consentsData?.data) {
      // Handle both array format (from SDK) and object format
      const data = consentsData.data as any;
      if (Array.isArray(data)) {
        // SDK returns Consent[] array - find each consent type
        const findConsent = (type: string) => 
          data.find((c: any) => c.type === type)?.granted ?? false;
        setConsents({
          marketing: findConsent('marketing'),
          analytics: findConsent('analytics'),
          thirdPartySharing: findConsent('thirdPartySharing'),
        });
      } else {
        // Legacy object format
        setConsents({
          marketing: data.marketing ?? false,
          analytics: data.analytics ?? false,
          thirdPartySharing: data.thirdPartySharing ?? false,
        });
      }
    }
  }, [consentsData]);

  const updateConsent = (key: keyof typeof consents, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Transform local state to array format expected by SDK
      const payload = [
        { type: 'marketing', granted: consents.marketing },
        { type: 'analytics', granted: consents.analytics },
        { type: 'thirdPartySharing', granted: consents.thirdPartySharing },
      ];
      await updateConsents.mutateAsync(payload as any);
      setHasChanges(false);
    } catch (error) {
      console.error(t('validation.failed_to_update_consents'), error);
    }
  };

  const getLastUpdatedText = () => {
    const data = consentsData?.data as any;
    // Handle both array and object formats
    const updatedAt = Array.isArray(data) 
      ? data[0]?.updatedAt 
      : data?.updatedAt;
    if (!updatedAt) {
      return null;
    }

    const date = new Date(updatedAt);
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const consentSettings = [
    {
      key: 'marketing' as const,
      label: t('common.markedsforing'),
      description: t('common.motta_nyheter_tilbud_og'),
    },
    {
      key: 'analytics' as const,
      label: t('common.analyse_og_statistikk'),
      description: t('common.tillat_anonymisert_analyse_av'),
    },
    {
      key: 'thirdPartySharing' as const,
      label: t('common.deling_med_tredjeparter'),
      description: t('common.tillat_at_dine_data'),
    },
  ];

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 'var(--ds-spacing-3)',
        }}>
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Samtykker
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Administrer dine personvernpreferanser. Du kan når som helst endre eller trekke tilbake dine samtykker.
            </Paragraph>
          </div>
          {hasChanges && (
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={handleSave}
              disabled={updateConsents.isPending}
              style={{ minHeight: '44px', alignSelf: isMobile ? 'stretch' : 'flex-start' }}
            >
              {updateConsents.isPending ? t('state.saving') : 'Lagre endringer'}
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Laster samtykker...
          </Paragraph>
        )}

        {/* Consent toggles */}
        {!isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {/* Necessary consent - always enabled */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                  t('common.nodvendige_samtykker')
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Nødvendig for at tjenesten skal fungere. Kan ikke deaktiveres.
                </Paragraph>
              </div>
              <Switch
                aria-label={t('common.nodvendige_samtykker')}
                checked={true}
                disabled={true}
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Optional consents */}
            {consentSettings.map(item => (
              <div key={item.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              }}>
                <div style={{ flex: 1, paddingRight: 'var(--ds-spacing-3)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                    {item.label}
                  </Paragraph>
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {item.description}
                  </Paragraph>
                </div>
                <Switch
                  aria-label={item.label}
                  checked={consents[item.key]}
                  onChange={(e) => updateConsent(item.key, e.target.checked)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Last updated timestamp */}
        {!isLoading && getLastUpdatedText() && (
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Sist oppdatert: {getLastUpdatedText()}
          </Paragraph>
        )}

        {/* Success message */}
        {updateConsents.isSuccess && !hasChanges && (
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-success-surface)',
            border: '1px solid var(--ds-color-success-border)',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-success-text)' }}>
              Samtykker oppdatert
            </Paragraph>
          </div>
        )}

        {/* Error message */}
        {updateConsents.isError && (
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-danger-surface)',
            border: '1px solid var(--ds-color-danger-border)',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
              Det oppstod en feil ved lagring av samtykker. Vennligst prøv igjen senere.
            </Paragraph>
          </div>
        )}

        {/* Information */}
        <div style={{
          padding: 'var(--ds-spacing-3)',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            <strong>{t('common.om_samtykker')}</strong> Du kan når som helst endre eller trekke tilbake dine samtykker. Nødvendige samtykker kreves for at tjenesten skal fungere og kan ikke deaktiveres. Alle endringer i samtykker logges i henhold til GDPR-krav.
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
