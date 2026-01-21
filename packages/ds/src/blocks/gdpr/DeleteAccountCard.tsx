/**
 * DeleteAccountCard
 *
 * Component for requesting account deletion in compliance with GDPR.
 * Domain-agnostic - receives all data and callbacks via props.
 *
 * @example
 * ```tsx
 * // In app with SDK hooks
 * function DeleteAccountPage() {
 *   const { data: requestsData, isLoading } = useMyGdprRequests({ requestType: 'deletion', limit: 1 });
 *   const createRequest = useCreateGdprRequest();
 *   const cancelRequest = useCancelGdprRequest();
 *
 *   return (
 *     <DeleteAccountCard
 *       deletionRequest={requestsData?.data?.[0]}
 *       isLoading={isLoading}
 *       isDeleting={createRequest.isPending}
 *       isCancelling={cancelRequest.isPending}
 *       isError={createRequest.isError || cancelRequest.isError}
 *       onConfirmDeletion={() => createRequest.mutateAsync({ requestType: 'deletion' })}
 *       onCancelRequest={() => cancelRequest.mutateAsync(requestsData?.data?.[0]?.id)}
 *       labels={labels}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState } from 'react';
import { Card } from '../../primitives';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export interface GdprDeletionRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  metadata?: {
    rejectionReason?: string;
    [key: string]: unknown;
  };
}

export interface DeleteAccountCardLabels {
  title: string;
  description: string;
  loading: string;
  warningTitle: string;
  warningItems: string[];
  deleteButton: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmButton: string;
  confirmingButton: string;
  cancelButton: string;
  cancelRequestButton: string;
  cancellingButton: string;
  errorMessage: string;
  infoTitle: string;
  infoDescription: string;
  statusMessages: {
    pending: string;
    processing: string;
    completed: string;
    rejected: string;
  };
  requestedLabel: string;
  rejectionLabel: string;
}

export interface DeleteAccountCardProps {
  /** Current deletion request (if any) */
  deletionRequest?: GdprDeletionRequest | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether a deletion request is being created */
  isDeleting: boolean;
  /** Whether a deletion request is being cancelled */
  isCancelling: boolean;
  /** Whether there was an error */
  isError: boolean;
  /** Callback to confirm deletion request */
  onConfirmDeletion: () => void | Promise<void>;
  /** Callback to cancel deletion request */
  onCancelRequest: () => void | Promise<void>;
  /** Labels for i18n */
  labels: DeleteAccountCardLabels;
}

// =============================================================================
// Default Labels
// =============================================================================

export const DEFAULT_DELETE_ACCOUNT_LABELS: DeleteAccountCardLabels = {
  title: 'Slett konto',
  description: 'Be om permanent sletting av kontoen din og alle tilhorende data. Dette er en irreversibel handling.',
  loading: 'Laster...',
  warningTitle: 'Advarsel',
  warningItems: [
    'All profilinformasjon blir fjernet',
    'Alle bookinger blir kansellert',
    'Meldinger og historikk blir slettet',
    'Du mister tilgang til tjenesten',
  ],
  deleteButton: 'Slett min konto',
  confirmTitle: 'Er du sikker?',
  confirmDescription: 'Denne handlingen kan ikke angres. En administrator vil behandle foresporselen din innen 30 dager i henhold til GDPR-forskriftene.',
  confirmButton: 'Ja, slett kontoen min',
  confirmingButton: 'Sender foresporsel...',
  cancelButton: 'Avbryt',
  cancelRequestButton: 'Angre foresporsel',
  cancellingButton: 'Kansellerer...',
  errorMessage: 'Det oppstod en feil. Vennligst prov igjen senere.',
  infoTitle: 'GDPR-rettigheter',
  infoDescription: 'I henhold til GDPR har du rett til a bli glemt. Foresporselen din vil bli behandlet innen 30 dager. Du kan angre foresporselen for den er behandlet.',
  statusMessages: {
    pending: 'Din foresporsel om sletting av konto er mottatt og venter pa behandling.',
    processing: 'Vi behandler foresporselen din. Dette kan ta noen dager.',
    completed: 'Kontoen din har blitt slettet. Du vil bli logget ut om kort tid.',
    rejected: 'Foresporselen din ble avvist. Kontakt support for mer informasjon.',
  },
  requestedLabel: 'Forespurt:',
  rejectionLabel: 'Arsak:',
};

// =============================================================================
// Sub-components
// =============================================================================

interface DeletionRequestStatusProps {
  deletionRequest: GdprDeletionRequest;
  labels: DeleteAccountCardLabels;
  canCancelRequest: boolean;
  onCancelRequest: () => void | Promise<void>;
  isCancelling: boolean;
}

function DeletionRequestStatus({
  deletionRequest,
  labels,
  canCancelRequest,
  onCancelRequest,
  isCancelling,
}: DeletionRequestStatusProps): React.ReactElement {
  const status = deletionRequest.status;
  const rejectionReason = deletionRequest.metadata?.rejectionReason
    ? String(deletionRequest.metadata.rejectionReason)
    : undefined;

  const requestedDate = new Date(deletionRequest.requestedAt).toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const statusText = labels.statusMessages[status] || '';

  const bgColor = status === 'completed'
    ? 'var(--ds-color-danger-surface)'
    : status === 'rejected'
      ? 'var(--ds-color-warning-surface)'
      : 'var(--ds-color-info-surface)';

  const borderColor = status === 'completed'
    ? 'var(--ds-color-danger-border)'
    : status === 'rejected'
      ? 'var(--ds-color-warning-border)'
      : 'var(--ds-color-info-border)';

  return (
    <div style={{
      padding: 'var(--ds-spacing-4)',
      borderRadius: 'var(--ds-border-radius-md)',
      backgroundColor: bgColor,
      border: '1px solid',
      borderColor: borderColor,
    }}>
      {/* Status message */}
      <p data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 500, fontSize: 'var(--ds-font-size-sm)' }}>
        {statusText}
      </p>

      {/* Request date */}
      <p data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>
        {`${labels.requestedLabel} ${requestedDate}`}
      </p>

      {/* Rejection reason */}
      {status === 'rejected' && rejectionReason && (
        <p data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text)', fontSize: 'var(--ds-font-size-xs)' }}>
          {`${labels.rejectionLabel} ${rejectionReason}`}
        </p>
      )}

      {/* Cancel button for pending/processing requests */}
      {canCancelRequest && (
        <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
          <Button
            type="button"
            variant="secondary"
            data-size="sm"
            onClick={onCancelRequest}
            disabled={isCancelling}
            style={{ minHeight: '40px' }}
          >
            {isCancelling ? labels.cancellingButton : labels.cancelRequestButton}
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DeleteAccountCard({
  deletionRequest,
  isLoading,
  isDeleting,
  isCancelling,
  isError,
  onConfirmDeletion,
  onCancelRequest,
  labels = DEFAULT_DELETE_ACCOUNT_LABELS,
}: DeleteAccountCardProps): React.ReactElement {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleShowConfirmation = () => setShowConfirmation(true);
  const handleCancelConfirmation = () => setShowConfirmation(false);

  const handleConfirmDeletion = async () => {
    await onConfirmDeletion();
    setShowConfirmation(false);
  };

  const canCancelRequest = !!(deletionRequest && (deletionRequest.status === 'pending' || deletionRequest.status === 'processing'));

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {labels.title}
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {labels.description}
          </Paragraph>
        </div>

        {/* Loading state */}
        {isLoading && (
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {labels.loading}
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
                {labels.warningTitle}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
                Sletting av kontoen din vil fore til:
              </Paragraph>
              <ul style={{ margin: 'var(--ds-spacing-2) 0 0 0', paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-danger-text)' }}>
                {labels.warningItems.map((item, index) => (
                  <li key={index}><Paragraph data-size="sm" style={{ margin: 0 }}>{item}</Paragraph></li>
                ))}
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
              {labels.deleteButton}
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
              {labels.confirmTitle}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-danger-text)' }}>
              {labels.confirmDescription}
            </Paragraph>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
              <Button
                type="button"
                variant="primary"
                data-size="md"
                onClick={handleConfirmDeletion}
                disabled={isDeleting}
                style={{
                  minHeight: '44px',
                  backgroundColor: 'var(--ds-color-danger-base)',
                  borderColor: 'var(--ds-color-danger-base)',
                }}
              >
                {isDeleting ? labels.confirmingButton : labels.confirmButton}
              </Button>
              <Button
                type="button"
                variant="secondary"
                data-size="md"
                onClick={handleCancelConfirmation}
                disabled={isDeleting}
                style={{ minHeight: '44px' }}
              >
                {labels.cancelButton}
              </Button>
            </div>
          </div>
        )}

        {/* Active deletion request exists */}
        {!isLoading && deletionRequest && (
          <DeletionRequestStatus
            deletionRequest={deletionRequest}
            labels={labels}
            canCancelRequest={canCancelRequest}
            onCancelRequest={onCancelRequest}
            isCancelling={isCancelling}
          />
        )}

        {/* Error state */}
        {isError && (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
            {labels.errorMessage}
          </Paragraph>
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
