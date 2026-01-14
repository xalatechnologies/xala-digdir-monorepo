/**
 * Export Progress Dialog
 * Shows async report generation progress with polling and download capability
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Spinner,
  Alert,
  Stack,
  Badge,
} from '@xala/ds';
import {
  useReportJobStatus,
  useDownloadReport,
  type ReportJobStatus,
} from '@digilist/client-sdk';

interface ExportProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onComplete?: (fileUrl: string) => void;
}

// Status messages in Norwegian
const STATUS_MESSAGES: Record<ReportJobStatus, { title: string; description: string }> = {
  pending: {
    title: 'Venter',
    description: 'Rapporten står i kø og vil bli behandlet snart.',
  },
  processing: {
    title: 'Behandler',
    description: 'Rapporten genereres nå. Dette kan ta noen minutter.',
  },
  completed: {
    title: 'Fullført',
    description: 'Rapporten er klar for nedlasting.',
  },
  failed: {
    title: 'Feilet',
    description: 'Det oppstod en feil under generering av rapporten.',
  },
};

/**
 * ExportProgressDialog component
 *
 * Displays async report generation progress with automatic polling.
 * Shows status, progress information, and provides download when complete.
 */
export function ExportProgressDialog({
  isOpen,
  onClose,
  jobId,
  onComplete,
}: ExportProgressDialogProps) {
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  // Poll job status (automatically polls every 2s while pending/processing)
  const { data: jobStatus, isLoading } = useReportJobStatus(
    jobId ?? '',
    { enabled: isOpen && !!jobId }
  );

  const downloadReport = useDownloadReport();

  // Handle download
  const handleDownload = async () => {
    if (!jobStatus?.fileUrl || !jobId) return;

    try {
      const blob = await downloadReport.mutateAsync(jobId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${jobId}.${jobStatus.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onComplete?.(jobStatus.fileUrl);
    } catch (error) {
      // Error handling is done by react-query
    }
  };

  // Auto-download when completed (one time only)
  useEffect(() => {
    if (
      jobStatus?.status === 'completed' &&
      jobStatus.fileUrl &&
      !autoDownloaded &&
      isOpen
    ) {
      setAutoDownloaded(true);
      handleDownload();
    }
  }, [jobStatus?.status, jobStatus?.fileUrl, autoDownloaded, isOpen]);

  // Reset auto-download flag when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setAutoDownloaded(false);
    }
  }, [isOpen]);

  const status = jobStatus?.status ?? 'pending';
  const statusInfo = STATUS_MESSAGES[status];
  const progress = jobStatus?.progress ?? 0;
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isInProgress = status === 'pending' || status === 'processing';

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Block>
        <Stack spacing={16}>
          <div style={{ textAlign: 'center' }}>
            <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              {isCompleted ? 'Rapport klar' : 'Genererer rapport'}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {statusInfo?.description}
            </Paragraph>
          </div>

          {/* Status indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {isInProgress && <Spinner data-size="md" aria-label="Behandler..." />}
            <Badge
              data-color={
                isCompleted ? 'success' :
                isFailed ? 'danger' :
                status === 'processing' ? 'warning' :
                'info'
              }
            >
              {statusInfo?.title}
            </Badge>
          </div>

          {/* Progress bar */}
          {isInProgress && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--ds-spacing-1)',
              }}>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Fremdrift
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  {progress}%
                </Paragraph>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--ds-color-accent-surface-default)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* Estimated completion time */}
          {jobStatus?.estimatedCompletionTime && isInProgress && (
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Estimert ferdig: {new Date(jobStatus.estimatedCompletionTime).toLocaleTimeString('nb-NO')}
            </Paragraph>
          )}

          {/* Job info */}
          {jobStatus && (
            <div style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              fontSize: 'var(--ds-font-size-sm)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-2)' }}>
                <div>
                  <div style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Rapporttype
                  </div>
                  <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {jobStatus.reportType}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Format
                  </div>
                  <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {jobStatus.exportFormat.toUpperCase()}
                  </div>
                </div>
                {jobStatus.fileSize && (
                  <>
                    <div>
                      <div style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Filstørrelse
                      </div>
                      <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {formatFileSize(jobStatus.fileSize)}
                      </div>
                    </div>
                  </>
                )}
                {jobStatus.createdAt && (
                  <div>
                    <div style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Startet
                    </div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {new Date(jobStatus.createdAt).toLocaleTimeString('nb-NO')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error alert */}
          {isFailed && jobStatus?.error && (
            <Alert data-color="danger">
              <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                Feilmelding
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {jobStatus.error}
              </Paragraph>
            </Alert>
          )}

          {/* Success message */}
          {isCompleted && (
            <Alert data-color="success">
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                Rapporten er generert og vil bli lastet ned automatisk. Du kan også laste den ned manuelt ved å klikke på knappen nedenfor.
              </Paragraph>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && !jobStatus && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ds-spacing-2)' }}>
              <Spinner data-size="sm" aria-label="Henter status..." />
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Henter status...
              </Paragraph>
            </div>
          )}
        </Stack>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          {isCompleted ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Lukk
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleDownload}
                disabled={!jobStatus?.fileUrl || downloadReport.isPending}
              >
                {downloadReport.isPending ? 'Laster ned...' : 'Last ned igjen'}
              </Button>
            </>
          ) : isFailed ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Lukk
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isInProgress}
            >
              Avbryt
            </Button>
          )}
        </div>
      </Dialog.Block>
    </Dialog>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
