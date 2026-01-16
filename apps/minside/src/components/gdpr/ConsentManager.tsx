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

const MOBILE_BREAKPOINT = 768;

export function ConsentManager() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Fetch current consents
  const { data: consentsData, isLoading } = useConsents();

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
      setConsents({
        marketing: consentsData.data.marketing ?? false,
        analytics: consentsData.data.analytics ?? false,
        thirdPartySharing: consentsData.data.thirdPartySharing ?? false,
      });
    }
  }, [consentsData]);

  const updateConsent = (key: keyof typeof consents, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateConsents.mutateAsync(consents);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update consents:', error);
    }
  };

  const getLastUpdatedText = () => {
    if (!consentsData?.data?.updatedAt) {
      return null;
    }

    const date = new Date(consentsData.data.updatedAt);
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
      label: 'Markedsføring',
      description: 'Motta nyheter, tilbud og annen markedsføringsinformasjon fra oss',
    },
    {
      key: 'analytics' as const,
      label: 'Analyse og statistikk',
      description: 'Tillat anonymisert analyse av din bruk av tjenesten for å forbedre opplevelsen',
    },
    {
      key: 'thirdPartySharing' as const,
      label: 'Deling med tredjeparter',
      description: 'Tillat at dine data deles med tredjeparter for integrasjoner og tjenester',
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
              {updateConsents.isPending ? 'Lagrer...' : 'Lagre endringer'}
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
                  Nødvendige samtykker
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Nødvendig for at tjenesten skal fungere. Kan ikke deaktiveres.
                </Paragraph>
              </div>
              <Switch
                aria-label="Nødvendige samtykker"
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
            <strong>Om samtykker:</strong> Du kan når som helst endre eller trekke tilbake dine samtykker. Nødvendige samtykker kreves for at tjenesten skal fungere og kan ikke deaktiveres. Alle endringer i samtykker logges i henhold til GDPR-krav.
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
