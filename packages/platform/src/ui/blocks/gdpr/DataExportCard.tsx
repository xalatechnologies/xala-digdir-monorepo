/**
 * DataExportCard
 *
 * Component for exporting user data in compliance with GDPR.
 * Domain-agnostic - receives all data and callbacks via props.
 *
 * @example
 * ```tsx
 * // In app with SDK hooks
 * function DataExportPage() {
 *   const { data: requestsData, isLoading } = useMyGdprRequests({ requestType: 'export', limit: 1 });
 *   const createRequest = useCreateGdprRequest();
 *
 *   return (
 *     <DataExportCard
 *       exportRequest={requestsData?.data?.[0]}
 *       isLoading={isLoading}
 *       isRequesting={createRequest.isPending}
 *       isError={createRequest.isError}
 *       onRequestExport={() => createRequest.mutateAsync({ requestType: 'export' })}
 *       onDownload={() => window.open(requestsData?.data?.[0]?.metadata?.downloadUrl, '_blank')}
 *       labels={labels}
 *     />
 *   );
 * }
 * ```
 */

import React from 'react';
import { Card } from '@digdir/designsystemet-react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export interface GdprExportRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  expiresAt: string;
  metadata?: {
    downloadUrl?: string;
    rejectionReason?: string;
    [key: string]: unknown;
  };
}

export interface DataExportCardLabels {
  title: string;
  description: string;
  loading: string;
  requestButton: string;
  requestingButton: string;
  downloadButton: string;
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
  expiryWarning: (days: number) => string;
  expiredMessage: string;
  rejectionLabel: string;
}

export interface DataExportCardProps {
  /** Current export request (if any) */
  exportRequest?: GdprExportRequest | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether a request is being created */
  isRequesting: boolean;
  /** Whether there was an error creating request */
  isError: boolean;
  /** Callback to request data export */
  onRequestExport: () => void | Promise<void>;
  /** Callback to download exported data */
  onDownload: () => void;
  /** Labels for i18n */
  labels: DataExportCardLabels;
}

// =============================================================================
// Default Labels
// =============================================================================

export const DEFAULT_DATA_EXPORT_LABELS: DataExportCardLabels = {
  title: 'Eksporter mine data',
  description: 'Last ned en kopi av alle dataene vi har lagret om deg i JSON-format. Dette inkluderer profil, bookinger, meldinger og aktivitet.',
  loading: 'Laster...',
  requestButton: 'Eksporter mine data',
  requestingButton: 'Oppretter foresporsel...',
  downloadButton: 'Last ned mine data',
  errorMessage: 'Det oppstod en feil ved opprettelse av foresporselen. Vennligst prov igjen senere.',
  infoTitle: 'Viktig:',
  infoDescription: 'Dataeksporten vil vaere tilgjengelig for nedlasting i 30 dager fra den er klar. Av sikkerhetshensyn ma du vaere innlogget for a laste ned dataene.',
  statusMessages: {
    pending: 'Din foresporsel er mottatt og venter pa behandling.',
    processing: 'Vi forbereder dataene dine. Dette kan ta noen minutter.',
    completed: 'Dataeksporten er klar for nedlasting.',
    rejected: 'Foresporselen din ble avvist. Kontakt support for mer informasjon.',
  },
  requestedLabel: 'Forespurt:',
  expiryWarning: (days: number) => `Denne nedlastingen utloper om ${days} dag${days !== 1 ? 'er' : ''}.`,
  expiredMessage: 'Denne nedlastingen har utlopt.',
  rejectionLabel: 'Arsak:',
};

// =============================================================================
// Sub-components
// =============================================================================

interface ExportRequestStatusProps {
  exportRequest: GdprExportRequest;
  labels: DataExportCardLabels;
  onDownload: () => void;
}

function ExportRequestStatus({
  exportRequest,
  labels,
  onDownload,
}: ExportRequestStatusProps): React.ReactElement {
  const status = exportRequest.status;
  const expiresAt = exportRequest.expiresAt;
  const rejectionReason = exportRequest.metadata?.rejectionReason
    ? String(exportRequest.metadata.rejectionReason)
    : undefined;

  const requestedDate = new Date(exportRequest.requestedAt).toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const statusText = labels.statusMessages[status] || '';

  const bgColor = status === 'completed'
    ? 'var(--ds-color-success-surface)'
    : status === 'rejected'
      ? 'var(--ds-color-danger-surface)'
      : 'var(--ds-color-info-surface)';

  const borderColor = status === 'completed'
    ? 'var(--ds-color-success-border)'
    : status === 'rejected'
      ? 'var(--ds-color-danger-border)'
      : 'var(--ds-color-info-border)';

  const getExpiryMessage = () => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return labels.expiredMessage;
    } else if (daysRemaining <= 3) {
      return labels.expiryWarning(daysRemaining);
    }
    return null;
  };

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

      {/* Download button for completed requests */}
      {status === 'completed' && (
        <div style={{ marginTop: 'var(--ds-spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {getExpiryMessage() && (
            <p data-size="xs" style={{ margin: 0, color: 'var(--ds-color-warning-text)', fontSize: 'var(--ds-font-size-xs)' }}>
              {getExpiryMessage()}
            </p>
          )}
          <Button
            type="button"
            variant="primary"
            data-size="sm"
            onClick={onDownload}
            style={{ minHeight: '40px', alignSelf: 'flex-start' }}
          >
            {labels.downloadButton}
          </Button>
        </div>
      )}

      {/* Rejection reason */}
      {status === 'rejected' && rejectionReason && (
        <p data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text)', fontSize: 'var(--ds-font-size-xs)' }}>
          {`${labels.rejectionLabel} ${rejectionReason}`}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DataExportCard({
  exportRequest,
  isLoading,
  isRequesting,
  isError,
  onRequestExport,
  onDownload,
  labels = DEFAULT_DATA_EXPORT_LABELS,
}: DataExportCardProps): React.ReactElement {
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

        {/* No active request */}
        {!isLoading && !exportRequest && (
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={onRequestExport}
            disabled={isRequesting}
            style={{ minHeight: '44px', alignSelf: 'flex-start' }}
          >
            {isRequesting ? labels.requestingButton : labels.requestButton}
          </Button>
        )}

        {/* Active request exists */}
        {!isLoading && exportRequest && (
          <ExportRequestStatus
            exportRequest={exportRequest}
            labels={labels}
            onDownload={onDownload}
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
