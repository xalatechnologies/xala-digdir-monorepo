/**
 * DeleteAccountCard
 *
 * Component for requesting account deletion in compliance with GDPR
 * - Request account deletion (soft delete)
 * - Show pending deletion request status
 * - Confirmation dialog before creating request
 * - Ability to cancel pending request
 */

import { useState } from 'react';
import { Card } from '../../primitives';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { useMyGdprRequests, useCreateGdprRequest, useCancelGdprRequest } from '@digilist/client-sdk/hooks';
import type { GdprRequest } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

export function DeleteAccountCard() {
  const t = useT();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user's deletion requests
  const { data: requestsData, isLoading } = useMyGdprRequests({
    requestType: 'deletion',
    limit: 1
  });

  // Mutations
  const createRequest = useCreateGdprRequest();
  const cancelRequest = useCancelGdprRequest();

  // Find the most recent deletion request
  const deletionRequest: GdprRequest | undefined = requestsData?.data?.[0];

  const handleShowConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDeletion = async () => {
    setIsDeleting(true);
    try {
      await createRequest.mutateAsync({ requestType: 'deletion' });
      setShowConfirmation(false);
    } catch (error) {
      console.error(t('validation.failed_to_create_deletion'), error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!deletionRequest?.id) return;

    try {
      await cancelRequest.mutateAsync(deletionRequest.id);
    } catch (error) {
      console.error(t('validation.failed_to_cancel_deletion'), error);
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Din forespørsel om sletting av konto er mottatt og venter på behandling.';
      case 'processing':
        return 'Vi behandler forespørselen din. Dette kan ta noen dager.';
      case 'completed':
        return 'Kontoen din har blitt slettet. Du vil bli logget ut om kort tid.';
      case 'rejected':
        return 'Forespørselen din ble avvist. Kontakt support for mer informasjon.';
      default:
        return '';
    }
  };

  const canCancelRequest = deletionRequest && (deletionRequest.status === 'pending' || deletionRequest.status === 'processing');

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Slett konto
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Be om permanent sletting av kontoen din og alle tilhørende data. Dette er en irreversibel handling.
          </Paragraph>
        </div>

        {/* Loading state */}
        {isLoading && (
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Laster...
          </Paragraph>
        )}

        {/* No active deletion request - show warning and button */}
        {!isLoading && !deletionRequest && !showConfirmation && (
          <>
            {/* Warning message */}
            <div style={{
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-danger-surface)',
              border: '1px solid var(--ds-color-danger-border)',
            }}>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 600, color: 'var(--ds-color-danger-text)' }}>
                ⚠️ Advarsel
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
                Sletting av kontoen din vil føre til:
              </Paragraph>
              <ul style={{ margin: 'var(--ds-spacing-2) 0 0 0', paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-danger-text)' }}>
                <li><Paragraph data-size="sm" style={{ margin: 0 }}>{t('gdpr.text.allProfilinformasjonBlirFjernet')}</Paragraph></li>
                <li><Paragraph data-size="sm" style={{ margin: 0 }}>{t('gdpr.text.alleBookingerBlirKansellert')}</Paragraph></li>
                <li><Paragraph data-size="sm" style={{ margin: 0 }}>{t('gdpr.text.meldingerOgHistorikkBlirSlettet')}</Paragraph></li>
                <li><Paragraph data-size="sm" style={{ margin: 0 }}>{t('gdpr.text.duMisterTilgangTilTjenesten')}</Paragraph></li>
              </ul>
            </div>

            <Button
              type="button"
              variant="secondary"
              data-size="md"
              onClick={handleShowConfirmation}
              style={{
                minHeight: '44px',
                alignSelf: 'flex-start',
                backgroundColor: 'var(--ds-color-danger-surface)',
                color: 'var(--ds-color-danger-text)',
                borderColor: 'var(--ds-color-danger-border)',
              }}
            >
              {t('actions.slett_min_konto')}
            </Button>
          </>
        )}

        {/* Confirmation dialog */}
        {!isLoading && !deletionRequest && showConfirmation && (
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
              Denne handlingen kan ikke angres. En administrator vil behandle forespørselen din innen 30 dager i henhold til GDPR-forskriftene.
            </Paragraph>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
              <Button
                type="button"
                variant="primary"
                data-size="md"
                onClick={handleConfirmDeletion}
                disabled={isDeleting || createRequest.isPending}
                style={{
                  minHeight: '44px',
                  backgroundColor: 'var(--ds-color-danger-base)',
                  borderColor: 'var(--ds-color-danger-base)',
                }}
              >
                {isDeleting || createRequest.isPending ? t('common.sender_foresporsel') : 'Ja, slett kontoen min'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                data-size="md"
                onClick={handleCancelConfirmation}
                disabled={isDeleting || createRequest.isPending}
                style={{ minHeight: '44px' }}
              >
                Avbryt
              </Button>
            </div>
          </div>
        )}

        {/* Active deletion request exists */}
        {!isLoading && deletionRequest && (() => {
          const requestedDate: string = new Date(deletionRequest.requestedAt).toLocaleDateString('nb-NO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div style={{
              padding: 'var(--ds-spacing-4)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: deletionRequest.status === 'completed'
                ? 'var(--ds-color-danger-surface)'
                : deletionRequest.status === 'rejected'
                ? 'var(--ds-color-warning-surface)'
                : 'var(--ds-color-info-surface)',
              border: '1px solid',
              borderColor: deletionRequest.status === 'completed'
                ? 'var(--ds-color-danger-border)'
                : deletionRequest.status === 'rejected'
                ? 'var(--ds-color-warning-border)'
                : 'var(--ds-color-info-border)',
            }}>
              {/* Status message */}
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 500 }}>
                {getStatusMessage(deletionRequest.status)}
              </Paragraph>

              {/* Request date */}
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Forespurt: {requestedDate}
              </Paragraph>

              {/* Rejection reason */}
              {deletionRequest.status === 'rejected' && deletionRequest.metadata?.rejectionReason && (
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text)' }}>
                  Årsak: {String(deletionRequest.metadata.rejectionReason)}
                </Paragraph>
              )}

              {/* Cancel button for pending/processing requests */}
              {canCancelRequest && (
                <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    data-size="sm"
                    onClick={handleCancelRequest}
                    disabled={cancelRequest.isPending}
                    style={{ minHeight: '40px' }}
                  >
                    {cancelRequest.isPending ? t('common.kansellerer') : 'Angre forespørsel'}
                  </Button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Error state */}
        {(createRequest.isError || cancelRequest.isError) && (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
            Det oppstod en feil. Vennligst prøv igjen senere.
          </Paragraph>
        )}

        {/* Information */}
        <div style={{
          padding: 'var(--ds-spacing-3)',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            <strong>{t('common.gdprrettigheter')}</strong> I henhold til GDPR har du rett til å bli glemt. Forespørselen din vil bli behandlet innen 30 dager. Du kan angre forespørselen før den er behandlet.
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
