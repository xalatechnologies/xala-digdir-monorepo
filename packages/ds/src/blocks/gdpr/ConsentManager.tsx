/**
 * ConsentManager
 *
 * Component for managing GDPR consent preferences.
 * Domain-agnostic - receives all data and callbacks via props.
 *
 * @example
 * ```tsx
 * // In app with SDK hooks
 * function ConsentPage() {
 *   const { data: consentsData, isLoading } = useConsents();
 *   const updateConsents = useUpdateConsents();
 *
 *   const [consents, setConsents] = useState({
 *     marketing: false,
 *     analytics: false,
 *     thirdPartySharing: false,
 *   });
 *
 *   return (
 *     <ConsentManager
 *       consents={consents}
 *       onConsentChange={(key, value) => setConsents({ ...consents, [key]: value })}
 *       isLoading={isLoading}
 *       isSaving={updateConsents.isPending}
 *       isError={updateConsents.isError}
 *       isSuccess={updateConsents.isSuccess}
 *       hasChanges={hasChanges}
 *       onSave={handleSave}
 *       lastUpdated={consentsData?.data?.[0]?.updatedAt}
 *       consentSettings={consentSettings}
 *       labels={labels}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Switch } from '@xala/ds';

// =============================================================================
// Types
// =============================================================================

export interface ConsentSetting {
  key: string;
  label: string;
  description: string;
}

export interface ConsentManagerLabels {
  title: string;
  description: string;
  loading: string;
  saveButton: string;
  savingButton: string;
  successMessage: string;
  errorMessage: string;
  infoTitle: string;
  infoDescription: string;
  requiredConsentLabel: string;
  requiredConsentDescription: string;
}

export interface ConsentManagerProps {
  /** Current consent values */
  consents: Record<string, boolean>;
  /** Callback when a consent value changes */
  onConsentChange: (key: string, value: boolean) => void;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether consents are being saved */
  isSaving: boolean;
  /** Whether there was an error saving */
  isError: boolean;
  /** Whether save was successful */
  isSuccess: boolean;
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Callback to save consents */
  onSave: () => void | Promise<void>;
  /** Last updated timestamp (ISO string) */
  lastUpdated?: string | null;
  /** Consent settings to display */
  consentSettings: ConsentSetting[];
  /** Labels for i18n */
  labels: ConsentManagerLabels;
}

// =============================================================================
// Default Labels
// =============================================================================

export const DEFAULT_CONSENT_MANAGER_LABELS: ConsentManagerLabels = {
  title: 'Samtykker',
  description: 'Administrer dine personvernpreferanser. Du kan nar som helst endre eller trekke tilbake dine samtykker.',
  loading: 'Laster samtykker...',
  saveButton: 'Lagre endringer',
  savingButton: 'Lagrer...',
  successMessage: 'Samtykker oppdatert',
  errorMessage: 'Det oppstod en feil ved lagring av samtykker. Vennligst prov igjen senere.',
  infoTitle: 'Om samtykker',
  infoDescription: 'Du kan nar som helst endre eller trekke tilbake dine samtykker. Nodvendige samtykker kreves for at tjenesten skal fungere og kan ikke deaktiveres. Alle endringer i samtykker logges i henhold til GDPR-krav.',
  requiredConsentLabel: 'Nodvendige samtykker',
  requiredConsentDescription: 'Nodvendig for at tjenesten skal fungere. Kan ikke deaktiveres.',
};

// =============================================================================
// Default Consent Settings
// =============================================================================

export const DEFAULT_CONSENT_SETTINGS: ConsentSetting[] = [
  {
    key: 'marketing',
    label: 'Markedsforing',
    description: 'Motta nyheter, tilbud og oppdateringer fra oss.',
  },
  {
    key: 'analytics',
    label: 'Analyse og statistikk',
    description: 'Tillat anonymisert analyse av bruksmonstre for a forbedre tjenesten.',
  },
  {
    key: 'thirdPartySharing',
    label: 'Deling med tredjeparter',
    description: 'Tillat at dine data deles med partnere for utvidet funksjonalitet.',
  },
];

// =============================================================================
// Component
// =============================================================================

const MOBILE_BREAKPOINT = 768;

export function ConsentManager({
  consents,
  onConsentChange,
  isLoading,
  isSaving,
  isError,
  isSuccess,
  hasChanges,
  onSave,
  lastUpdated,
  consentSettings = DEFAULT_CONSENT_SETTINGS,
  labels = DEFAULT_CONSENT_MANAGER_LABELS,
}: ConsentManagerProps): React.ReactElement {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLastUpdatedText = () => {
    if (!lastUpdated) return null;

    const date = new Date(lastUpdated);
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
              {labels.title}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.description}
            </Paragraph>
          </div>
          {hasChanges && (
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={onSave}
              disabled={isSaving}
              style={{ minHeight: '44px', alignSelf: isMobile ? 'stretch' : 'flex-start' }}
            >
              {isSaving ? labels.savingButton : labels.saveButton}
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {labels.loading}
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
                  {labels.requiredConsentLabel}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {labels.requiredConsentDescription}
                </Paragraph>
              </div>
              <Switch
                aria-label={labels.requiredConsentLabel}
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
                  checked={consents[item.key] ?? false}
                  onChange={(e) => onConsentChange(item.key, e.target.checked)}
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
        {isSuccess && !hasChanges && (
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-success-surface)',
            border: '1px solid var(--ds-color-success-border)',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-success-text)' }}>
              {labels.successMessage}
            </Paragraph>
          </div>
        )}

        {/* Error message */}
        {isError && (
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-danger-surface)',
            border: '1px solid var(--ds-color-danger-border)',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
              {labels.errorMessage}
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
            <strong>{labels.infoTitle}</strong> {labels.infoDescription}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
