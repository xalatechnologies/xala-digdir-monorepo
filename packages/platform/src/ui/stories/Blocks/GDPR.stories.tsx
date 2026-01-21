import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Switch,
  Alert,
  Badge,
  ShieldIcon,
  DownloadIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
} from '@xalatechnologies/platform/ui';
import { GdprRequestStatusBadge as RequestStatusBadge } from '../../src/blocks/StatusBadges';
import type { GdprRequestStatusType as GdprRequestStatus } from '../../src/blocks/StatusBadges';

/**
 * GDPR components for privacy management and data subject rights.
 *
 * ## Components
 * - **ConsentManager**: Manage consent preferences (marketing, analytics, third-party)
 * - **DataExportCard**: Request and download personal data export
 * - **DeleteAccountCard**: Request account deletion with confirmation
 * - **RequestStatusBadge**: Status indicators for GDPR requests
 *
 * ## Stub Components (Pending Implementation)
 * - **ConsentPopup**: Cookie consent dialog
 * - **ConsentSettings**: Full-page consent settings
 * - **DataSubjectRequestForm**: General GDPR request form
 *
 * ## Features
 * - GDPR Article 15-22 compliance
 * - Data export in JSON format
 * - Right to be forgotten (account deletion)
 * - Consent management with audit trail
 * - Norwegian localization
 *
 * ## Accessibility
 * - Form labels and descriptions
 * - Status announcements for screen readers
 * - Keyboard navigation
 * - High contrast status colors
 */
const meta: Meta<typeof RequestStatusBadge> = {
  title: 'Blocks/GDPR',
  component: RequestStatusBadge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
GDPR privacy management components for Norwegian municipal services.

## Components Overview

### Functional Components
- **ConsentManager**: Full consent management UI with toggles for marketing, analytics, and third-party sharing
- **DataExportCard**: Request personal data export with status tracking
- **DeleteAccountCard**: Account deletion flow with confirmation
- **RequestStatusBadge**: Status indicator badges for GDPR requests

### Placeholder Components (Coming Soon)
- **ConsentPopup**: First-visit cookie consent dialog
- **ConsentSettings**: Detailed consent configuration page
- **DataSubjectRequestForm**: General GDPR rights request form

## GDPR Compliance
These components support:
- Article 15: Right of access (data export)
- Article 17: Right to erasure (account deletion)
- Article 7: Conditions for consent (consent management)
- Article 30: Records of processing activities (audit logs)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RequestStatusBadge>;

// =============================================================================
// Request Status Badge Stories
// =============================================================================

/**
 * Request status badge showing all possible states
 */
export const StatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Heading level={2} data-size="sm">GDPR Request Status Badges</Heading>
      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        Status indicators for GDPR data export and deletion requests.
      </Paragraph>

      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <RequestStatusBadge status="pending" />
          <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Venter</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <RequestStatusBadge status="processing" />
          <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Behandles</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <RequestStatusBadge status="completed" />
          <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Fullført</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <RequestStatusBadge status="rejected" />
          <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Avslått</span>
        </div>
      </div>

      <Heading level={3} data-size="xs" style={{ marginTop: 'var(--ds-spacing-4)' }}>Størrelser</Heading>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
        <RequestStatusBadge status="completed" size="sm" />
        <RequestStatusBadge status="completed" size="md" />
        <RequestStatusBadge status="completed" size="lg" />
      </div>
    </div>
  ),
};

// =============================================================================
// Consent Manager Stories
// =============================================================================

/**
 * Interactive consent management demo (mocked)
 */
export const ConsentManagerDemo: Story = {
  render: () => {
    const [consents, setConsents] = useState({
      marketing: false,
      analytics: true,
      thirdPartySharing: false,
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const updateConsent = (key: keyof typeof consents, value: boolean) => {
      setConsents(prev => ({ ...prev, [key]: value }));
      setHasChanges(true);
      setShowSuccess(false);
    };

    const handleSave = () => {
      setHasChanges(false);
      setShowSuccess(true);
      console.log('Consents saved:', consents);
    };

    const consentSettings = [
      {
        key: 'marketing' as const,
        label: 'Markedsføring',
        description: 'Motta nyheter, tilbud og oppdateringer via e-post og SMS.',
      },
      {
        key: 'analytics' as const,
        label: 'Analyse og statistikk',
        description: 'Tillat anonymisert analyse av bruksmønstre for forbedring av tjenesten.',
      },
      {
        key: 'thirdPartySharing' as const,
        label: 'Deling med tredjeparter',
        description: 'Tillat at dine data deles med utvalgte partnere for tilpassede tjenester.',
      },
    ];

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
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
                style={{ minHeight: '44px', alignSelf: 'flex-start' }}
              >
                Lagre endringer
              </Button>
            )}
          </div>

          {/* Consent toggles */}
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

          {/* Last updated */}
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Sist oppdatert: 15. januar 2026 kl. 14:32
          </Paragraph>

          {/* Success message */}
          {showSuccess && (
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

          {/* Information */}
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              <strong>Om samtykker:</strong> Du kan når som helst endre eller trekke tilbake dine samtykker.
              Nødvendige samtykker kreves for at tjenesten skal fungere og kan ikke deaktiveres.
              Alle endringer i samtykker logges i henhold til GDPR-krav.
            </Paragraph>
          </div>
        </div>
      </Card>
    );
  },
};

// =============================================================================
// Data Export Card Stories
// =============================================================================

/**
 * Data export card with different states
 */
export const DataExportStates: Story = {
  render: () => {
    const [exportState, setExportState] = useState<'idle' | 'pending' | 'processing' | 'completed'>('idle');

    const handleExport = () => {
      setExportState('pending');
      setTimeout(() => setExportState('processing'), 1500);
      setTimeout(() => setExportState('completed'), 4000);
    };

    const handleDownload = () => {
      console.log('Downloading export...');
      alert('Dataeksport lastet ned (demo)');
    };

    const getStatusMessage = () => {
      switch (exportState) {
        case 'pending':
          return 'Din forespørsel er mottatt og venter på behandling.';
        case 'processing':
          return 'Vi forbereder dataene dine. Dette kan ta noen minutter.';
        case 'completed':
          return 'Dataeksporten er klar for nedlasting.';
        default:
          return '';
      }
    };

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
              <DownloadIcon size={24} style={{ color: 'var(--ds-color-accent-base-default)' }} />
              <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                Eksporter mine data
              </Heading>
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Last ned en kopi av alle dataene vi har lagret om deg i JSON-format.
              Dette inkluderer profil, bookinger, meldinger og aktivitet.
            </Paragraph>
          </div>

          {/* No active request */}
          {exportState === 'idle' && (
            <Button
              type="button"
              variant="secondary"
              data-size="md"
              onClick={handleExport}
              style={{ minHeight: '44px', alignSelf: 'flex-start' }}
            >
              Eksporter mine data
            </Button>
          )}

          {/* Active request */}
          {exportState !== 'idle' && (
            <div style={{
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: exportState === 'completed'
                ? 'var(--ds-color-success-surface)'
                : 'var(--ds-color-info-surface)',
              border: `1px solid ${exportState === 'completed'
                ? 'var(--ds-color-success-border)'
                : 'var(--ds-color-info-border)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                {exportState === 'completed' ? (
                  <CheckIcon size={18} style={{ color: 'var(--ds-color-success-text)' }} />
                ) : (
                  <ClockIcon size={18} style={{ color: 'var(--ds-color-info-text)' }} />
                )}
                <RequestStatusBadge status={exportState as GdprRequestStatus} />
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
                {getStatusMessage()}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Forespurt: {new Date().toLocaleDateString('nb-NO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Paragraph>

              {exportState === 'completed' && (
                <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
                  <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-warning-text)' }}>
                    Denne nedlastingen utløper om 30 dager.
                  </Paragraph>
                  <Button
                    type="button"
                    variant="primary"
                    data-size="sm"
                    onClick={handleDownload}
                    style={{ minHeight: '40px' }}
                  >
                    Last ned mine data
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Information */}
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              <strong>Viktig:</strong> Dataeksporten vil være tilgjengelig for nedlasting i 30 dager fra den er klar.
              Av sikkerhetshensyn må du være innlogget for å laste ned dataene.
            </Paragraph>
          </div>

          {/* Reset button for demo */}
          {exportState !== 'idle' && (
            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={() => setExportState('idle')}
              style={{ alignSelf: 'flex-start' }}
            >
              Tilbakestill demo
            </Button>
          )}
        </div>
      </Card>
    );
  },
};

// =============================================================================
// Delete Account Card Stories
// =============================================================================

/**
 * Account deletion flow with confirmation
 */
export const DeleteAccountFlow: Story = {
  render: () => {
    const [state, setState] = useState<'idle' | 'confirm' | 'pending' | 'completed'>('idle');

    const handleShowConfirm = () => setState('confirm');
    const handleCancel = () => setState('idle');
    const handleConfirmDelete = () => {
      setState('pending');
      console.log('Account deletion requested');
    };
    const handleCancelRequest = () => {
      setState('idle');
      console.log('Deletion request cancelled');
    };

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
              <TrashIcon size={24} style={{ color: 'var(--ds-color-danger-base-default)' }} />
              <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                Slett konto
              </Heading>
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Be om permanent sletting av kontoen din og alle tilhørende data.
              Dette er en irreversibel handling.
            </Paragraph>
          </div>

          {/* Idle state - warning and button */}
          {state === 'idle' && (
            <>
              <div style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-danger-surface)',
                border: '1px solid var(--ds-color-danger-border)',
              }}>
                <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 600, color: 'var(--ds-color-danger-text)' }}>
                  Advarsel
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
                  Sletting av kontoen din vil føre til:
                </Paragraph>
                <ul style={{ margin: 'var(--ds-spacing-2) 0 0 0', paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-danger-text)' }}>
                  <li><Paragraph data-size="sm" style={{ margin: 0 }}>All profilinformasjon blir fjernet</Paragraph></li>
                  <li><Paragraph data-size="sm" style={{ margin: 0 }}>Alle bookinger blir kansellert</Paragraph></li>
                  <li><Paragraph data-size="sm" style={{ margin: 0 }}>Meldinger og historikk blir slettet</Paragraph></li>
                  <li><Paragraph data-size="sm" style={{ margin: 0 }}>Du mister tilgang til tjenesten</Paragraph></li>
                </ul>
              </div>

              <Button
                type="button"
                variant="secondary"
                data-size="md"
                onClick={handleShowConfirm}
                style={{
                  minHeight: '44px',
                  alignSelf: 'flex-start',
                  backgroundColor: 'var(--ds-color-danger-surface)',
                  color: 'var(--ds-color-danger-text)',
                  borderColor: 'var(--ds-color-danger-border)',
                }}
              >
                Slett min konto
              </Button>
            </>
          )}

          {/* Confirmation dialog */}
          {state === 'confirm' && (
            <div style={{
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-danger-surface)',
              border: '2px solid var(--ds-color-danger-border)',
            }}>
              <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-danger-text)' }}>
                Er du sikker?
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-danger-text)' }}>
                Denne handlingen kan ikke angres. En administrator vil behandle forespørselen din
                innen 30 dager i henhold til GDPR-forskriftene.
              </Paragraph>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="primary"
                  data-size="md"
                  onClick={handleConfirmDelete}
                  style={{
                    minHeight: '44px',
                    backgroundColor: 'var(--ds-color-danger-base-default)',
                    borderColor: 'var(--ds-color-danger-base-default)',
                  }}
                >
                  Ja, slett kontoen min
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  data-size="md"
                  onClick={handleCancel}
                  style={{ minHeight: '44px' }}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          )}

          {/* Pending state */}
          {state === 'pending' && (
            <div style={{
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-info-surface)',
              border: '1px solid var(--ds-color-info-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                <ClockIcon size={18} style={{ color: 'var(--ds-color-info-text)' }} />
                <RequestStatusBadge status="pending" />
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
                Din forespørsel om sletting av konto er mottatt og venter på behandling.
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Forespurt: {new Date().toLocaleDateString('nb-NO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Paragraph>
              <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
                <Button
                  type="button"
                  variant="secondary"
                  data-size="sm"
                  onClick={handleCancelRequest}
                  style={{ minHeight: '40px' }}
                >
                  Angre forespørsel
                </Button>
              </div>
            </div>
          )}

          {/* Information */}
          <div style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              <strong>GDPR-rettigheter:</strong> I henhold til GDPR har du rett til å bli glemt.
              Forespørselen din vil bli behandlet innen 30 dager. Du kan angre forespørselen før den er behandlet.
            </Paragraph>
          </div>
        </div>
      </Card>
    );
  },
};

// =============================================================================
// Stub Component Previews
// =============================================================================

/**
 * Consent Popup preview (placeholder)
 */
export const ConsentPopupPreview: Story = {
  render: () => (
    <div>
      <Alert data-color="info" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ margin: 0 }}>
          <strong>Ikke implementert:</strong> ConsentPopup er en placeholder som venter på
          backend consent API implementering.
        </Paragraph>
      </Alert>

      {/* Mock consent popup */}
      <Card style={{
        padding: 'var(--ds-spacing-5)',
        maxWidth: '500px',
        border: '2px dashed var(--ds-color-neutral-border-subtle)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <ShieldIcon size={24} style={{ color: 'var(--ds-color-accent-base-default)' }} />
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              Vi bruker informasjonskapsler
            </Heading>
          </div>

          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Vi bruker informasjonskapsler for å forbedre din opplevelse på nettsiden.
            Noen er nødvendige for at siden skal fungere, mens andre hjelper oss å forstå
            hvordan du bruker tjenesten.
          </Paragraph>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
            <Button variant="primary" data-size="md">
              Godta alle
            </Button>
            <Button variant="secondary" data-size="md">
              Kun nødvendige
            </Button>
            <Button variant="tertiary" data-size="md">
              Tilpass valg
            </Button>
          </div>

          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Ved å klikke &quot;Godta alle&quot; samtykker du til vår bruk av informasjonskapsler.
            Les mer i vår <a href="#" style={{ color: 'var(--ds-color-accent-text-default)' }}>personvernerklæring</a>.
          </Paragraph>
        </div>
      </Card>
    </div>
  ),
};

/**
 * Data Subject Request Form preview (placeholder)
 */
export const DataSubjectRequestFormPreview: Story = {
  render: () => (
    <div>
      <Alert data-color="info" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ margin: 0 }}>
          <strong>Ikke implementert:</strong> DataSubjectRequestForm er en placeholder.
          Brukes for generelle GDPR-forespørsler som rettelse av data, begrensning av behandling, osv.
        </Paragraph>
      </Alert>

      {/* Mock request form */}
      <Card style={{
        padding: 'var(--ds-spacing-5)',
        maxWidth: '600px',
        border: '2px dashed var(--ds-color-neutral-border-subtle)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            GDPR-forespørsel
          </Heading>

          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Send en forespørsel om dine personvernrettigheter. Vi vil behandle forespørselen
            din innen 30 dager i henhold til GDPR.
          </Paragraph>

          {/* Mock form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 500, fontSize: 'var(--ds-font-size-sm)' }}>
                Type forespørsel
              </label>
              <select style={{
                width: '100%',
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
              }}>
                <option>Velg type...</option>
                <option>Innsyn i mine data (Art. 15)</option>
                <option>Retting av data (Art. 16)</option>
                <option>Sletting av data (Art. 17)</option>
                <option>Begrensning av behandling (Art. 18)</option>
                <option>Dataportabilitet (Art. 20)</option>
                <option>Innsigelse mot behandling (Art. 21)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 500, fontSize: 'var(--ds-font-size-sm)' }}>
                Beskrivelse
              </label>
              <textarea style={{
                width: '100%',
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                minHeight: '100px',
                fontSize: 'var(--ds-font-size-sm)',
                resize: 'vertical',
              }} placeholder="Beskriv din forespørsel..." />
            </div>
          </div>

          <Button variant="primary" data-size="md" style={{ alignSelf: 'flex-start' }}>
            Send forespørsel
          </Button>
        </div>
      </Card>
    </div>
  ),
};

// =============================================================================
// Complete Privacy Center Example
// =============================================================================

/**
 * Complete privacy center with all GDPR functionality
 */
export const PrivacyCenter: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'consent' | 'export' | 'delete' | 'requests'>('consent');
    const [consents, setConsents] = useState({
      marketing: false,
      analytics: true,
      thirdPartySharing: false,
    });

    // Mock request history
    const requestHistory = [
      { id: '1', type: 'export', status: 'completed' as GdprRequestStatus, date: '2026-01-10' },
      { id: '2', type: 'export', status: 'completed' as GdprRequestStatus, date: '2025-12-15' },
    ];

    return (
      <div style={{ maxWidth: '800px' }}>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Personvern og data
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Administrer dine personverninnstillinger og utøv dine GDPR-rettigheter.
        </Paragraph>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-4)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          paddingBottom: 'var(--ds-spacing-2)',
          flexWrap: 'wrap',
        }}>
          <Button
            variant={activeTab === 'consent' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('consent')}
          >
            <ShieldIcon size={16} />
            Samtykker
          </Button>
          <Button
            variant={activeTab === 'export' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('export')}
          >
            <DownloadIcon size={16} />
            Eksporter data
          </Button>
          <Button
            variant={activeTab === 'delete' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('delete')}
          >
            <TrashIcon size={16} />
            Slett konto
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('requests')}
          >
            <ClockIcon size={16} />
            Historikk
          </Button>
        </div>

        {/* Tab content */}
        {activeTab === 'consent' && (
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Dine samtykker
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {[
                { key: 'necessary', label: 'Nødvendige', desc: 'Kreves for tjenesten', disabled: true, checked: true },
                { key: 'marketing', label: 'Markedsføring', desc: 'Nyheter og tilbud', disabled: false, checked: consents.marketing },
                { key: 'analytics', label: 'Analyse', desc: 'Anonymisert statistikk', disabled: false, checked: consents.analytics },
                { key: 'thirdPartySharing', label: 'Tredjeparter', desc: 'Deling med partnere', disabled: false, checked: consents.thirdPartySharing },
              ].map((item) => (
                <div key={item.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                }}>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{item.label}</Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{item.desc}</Paragraph>
                  </div>
                  <Switch
                    aria-label={item.label}
                    checked={item.checked}
                    disabled={item.disabled}
                    onChange={item.disabled ? undefined : (e) => {
                      if (item.key !== 'necessary') {
                        setConsents(prev => ({ ...prev, [item.key]: e.target.checked }));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'export' && (
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Eksporter mine data
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Last ned alle dine data i JSON-format.
            </Paragraph>
            <Button variant="secondary" data-size="md">
              Be om dataeksport
            </Button>
          </Card>
        )}

        {activeTab === 'delete' && (
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Slett konto
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Be om permanent sletting av din konto og data.
            </Paragraph>
            <Button
              variant="secondary"
              data-size="md"
              style={{
                backgroundColor: 'var(--ds-color-danger-surface)',
                color: 'var(--ds-color-danger-text)',
                borderColor: 'var(--ds-color-danger-border)',
              }}
            >
              Slett min konto
            </Button>
          </Card>
        )}

        {activeTab === 'requests' && (
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Forespørselshistorikk
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {requestHistory.map((req) => (
                <div key={req.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                }}>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                      {req.type === 'export' ? 'Dataeksport' : 'Kontosletting'}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {new Date(req.date).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Paragraph>
                  </div>
                  <RequestStatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  },
};
