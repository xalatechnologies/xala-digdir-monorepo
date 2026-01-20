/**
 * DataExportCard
 *
 * Component for exporting user data in compliance with GDPR
 * - Request data export
 * - Show pending request status
 * - Download link when export is ready
 */

import React, { useState } from 'react';
import { Card } from '../../primitives';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { useMyGdprRequests, useCreateGdprRequest } from '@digilist/client-sdk/hooks';
import type { GdprRequest } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

// Local type to ensure proper inference (workaround for TS type resolution)
interface LocalGdprRequest {
  id: string;
  userId: string;
  requestType: 'export' | 'deletion';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  expiresAt: string;
  metadata?: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface ExportRequestStatusProps {
  exportRequest: LocalGdprRequest;
  getStatusMessage: (status: string) => string;
  getExpiryMessage: (expiresAt: string) => string;
  handleDownload: () => void;
  downloadLabel: string;
}

function ExportRequestStatus({
  exportRequest,
  getStatusMessage,
  getExpiryMessage,
  handleDownload,
  downloadLabel,
}: ExportRequestStatusProps): React.ReactElement {
  // Extract all values to typed local variables to ensure proper inference
  const status: string = exportRequest.status;
  const expiresAt: string = exportRequest.expiresAt;
  const rejectionReason: string | undefined = exportRequest.metadata?.rejectionReason
    ? String(exportRequest.metadata.rejectionReason)
    : undefined;

  const requestedDate: string = new Date(exportRequest.requestedAt).toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const statusText: string = getStatusMessage(status);

  const bgColor: string = status === 'completed'
    ? 'var(--ds-color-success-surface)'
    : status === 'rejected'
    ? 'var(--ds-color-danger-surface)'
    : 'var(--ds-color-info-surface)';

  const borderColor: string = status === 'completed'
    ? 'var(--ds-color-success-border)'
    : status === 'rejected'
    ? 'var(--ds-color-danger-border)'
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
        {`Forespurt: ${requestedDate}`}
      </p>

      {/* Download button for completed requests */}
      {status === 'completed' && (
        <div style={{ marginTop: 'var(--ds-spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {expiresAt && getExpiryMessage(expiresAt) && (
            <p data-size="xs" style={{ margin: 0, color: 'var(--ds-color-warning-text)', fontSize: 'var(--ds-font-size-xs)' }}>
              {getExpiryMessage(expiresAt)}
            </p>
          )}
          <Button
            type="button"
            variant="primary"
            data-size="sm"
            onClick={handleDownload}
            style={{ minHeight: '40px', alignSelf: 'flex-start' }}
          >
            {downloadLabel}
          </Button>
        </div>
      )}

      {/* Rejection reason */}
      {status === 'rejected' && rejectionReason && (
        <p data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text)', fontSize: 'var(--ds-font-size-xs)' }}>
          {`Årsak: ${rejectionReason}`}
        </p>
      )}
    </div>
  );
}

export function DataExportCard() {
  const t = useT();
  const [isRequesting, setIsRequesting] = useState(false);

  // Fetch user's GDPR requests
  const { data: requestsData, isLoading } = useMyGdprRequests({
    requestType: 'export',
    limit: 1
  });

  // Create request mutation
  const createRequest = useCreateGdprRequest();

  // Find the most recent export request
  const exportRequest: GdprRequest | undefined = requestsData?.data?.[0];

  const handleRequestExport = async () => {
    setIsRequesting(true);
    try {
      await createRequest.mutateAsync({ requestType: 'export' });
    } catch (error) {
      console.error(t('validation.failed_to_create_export'), error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDownload = () => {
    if (exportRequest?.metadata?.downloadUrl) {
      window.open(exportRequest.metadata.downloadUrl as string, '_blank');
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Din forespørsel er mottatt og venter på behandling.';
      case 'processing':
        return 'Vi forbereder dataene dine. Dette kan ta noen minutter.';
      case 'completed':
        return 'Dataeksporten er klar for nedlasting.';
      case 'rejected':
        return 'Forespørselen din ble avvist. Kontakt support for mer informasjon.';
      default:
        return '';
    }
  };

  const getExpiryMessage = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return 'Denne nedlastingen har utløpt.';
    } else if (daysRemaining <= 3) {
      return `Denne nedlastingen utløper om ${daysRemaining} dag${daysRemaining !== 1 ? 'er' : ''}.`;
    }
    return '';
  };

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Eksporter mine data
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Last ned en kopi av alle dataene vi har lagret om deg i JSON-format. Dette inkluderer profil, bookinger, meldinger og aktivitet.
          </Paragraph>
        </div>

        {/* Loading state */}
        {isLoading && (
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Laster...
          </Paragraph>
        )}

        {/* No active request */}
        {!isLoading && !exportRequest && (
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={handleRequestExport}
            disabled={isRequesting || createRequest.isPending}
            style={{ minHeight: '44px', alignSelf: 'flex-start' }}
          >
            {isRequesting || createRequest.isPending ? t('common.oppretter_foresporsel') : 'Eksporter mine data'}
          </Button>
        )}

        {/* Active request exists */}
        {!isLoading && exportRequest && (
          <ExportRequestStatus
            exportRequest={exportRequest}
            getStatusMessage={getStatusMessage}
            getExpiryMessage={getExpiryMessage}
            handleDownload={handleDownload}
            downloadLabel={t('actions.last_ned_mine_data')}
          />
        )}

        {/* Error state */}
        {createRequest.isError && (
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text)' }}>
            Det oppstod en feil ved opprettelse av forespørselen. Vennligst prøv igjen senere.
          </Paragraph>
        )}

        {/* Information */}
        <div style={{
          padding: 'var(--ds-spacing-3)',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            <strong>Viktig:</strong> Dataeksporten vil være tilgjengelig for nedlasting i 30 dager fra den er klar. Av sikkerhetshensyn må du være innlogget for å laste ned dataene.
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
