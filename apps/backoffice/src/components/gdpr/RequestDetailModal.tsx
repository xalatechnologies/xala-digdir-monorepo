/**
 * Request Detail Modal
 * Modal for viewing GDPR request details and processing actions (approve/reject)
 * Used by admins to manage data subject rights requests
 */

/* eslint-disable digdir/prefer-ds-components -- Complex form with native HTML elements for better browser compatibility */

import { useState, useMemo } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Spinner,
  Alert,
  Badge,
  Text,
} from '@xalatechnologies/platform/ui';
import {
  useGdprRequest,
  useUpdateGdprRequestStatus,
  useUsers,
  type GdprRequestStatus,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Helper to calculate days remaining until 30-day GDPR deadline
function calculateDaysRemaining(requestedAt: string): number {
  const requested = new Date(requestedAt);
  const deadline = new Date(requested);
  deadline.setDate(deadline.getDate() + 30);

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Helper to get urgency color based on days remaining
function getUrgencyColor(daysRemaining: number): string {
  if (daysRemaining <= 3) return 'var(--ds-color-danger-base)';
  if (daysRemaining <= 7) return 'var(--ds-color-warning-base)';
  return 'var(--ds-color-neutral-text-default)';
}

// Helper to get status badge color
function getStatusColor(status: GdprRequestStatus): 'success' | 'warning' | 'info' | 'danger' {
  const colorMap: Record<GdprRequestStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'danger',
  };
  return colorMap[status];
}

// Helper to get status label
function getStatusLabel(status: GdprRequestStatus): string {
  const labelMap: Record<GdprRequestStatus, string> = {
    pending: 'Venter',
    processing: 'Behandles',
    completed: 'Fullført',
    rejected: 'Avslått',
  };
  return labelMap[status];
}

// Helper to get request type label
function getRequestTypeLabel(type: 'export' | 'deletion'): string {
  const labelMap = {
    export: 'Dataeksport',
    deletion: 'Sletting',
  };
  return labelMap[type];
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  onSuccess?: () => void;
}

export function RequestDetailModal({
  isOpen,
  onClose,
  requestId,
  onSuccess,
}: RequestDetailModalProps) {
  const t = useT();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const updateStatus = useUpdateGdprRequestStatus();

  // Fetch request details
  const { data: requestData, isLoading: isLoadingRequest } = useGdprRequest(
    requestId ?? '',
    { enabled: !!requestId && isOpen }
  );
  const request = requestData?.data;

  // Fetch users to get user name
  const { data: usersData } = useUsers({ limit: 100 });
  const userNameMap = useMemo(() => {
    const map = new Map<string, { name: string; email?: string }>();
    usersData?.data?.forEach((user: { id: string; name?: string; email?: string }) => {
      const entry: { name: string; email?: string } = { name: user.name || 'Ukjent' };
      if (user.email) {
        entry.email = user.email;
      }
      map.set(user.id, entry);
    });
    return map;
  }, [usersData]);

  // Computed values
  const daysRemaining = request ? calculateDaysRemaining(request.requestedAt) : 0;
  const urgencyColor = getUrgencyColor(daysRemaining);
  const userFromMap = request ? userNameMap.get(request.userId) : null;
  const userName = userFromMap?.name || request?.userId || 'Ukjent';
  const userEmail = userFromMap?.email;

  // Can only take actions on pending requests
  const canTakeActions = request?.status === 'pending';

  // Handle approve
  const handleApprove = async () => {
    if (!requestId) return;

    try {
      await updateStatus.mutateAsync({
        id: requestId,
        status: 'completed',
      });
      onSuccess?.();
      onClose();
    } catch {
      // Error handling is done by react-query
    }
  };

  // Handle reject - show form
  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  // Handle reject - submit
  const handleRejectSubmit = async () => {
    if (!requestId || !rejectionReason.trim()) return;

    try {
      await updateStatus.mutateAsync({
        id: requestId,
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });
      onSuccess?.();
      onClose();
    } catch {
      // Error handling is done by react-query
    }
  };

  // Handle close - reset form
  const handleClose = () => {
    setShowRejectForm(false);
    setRejectionReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <Dialog.Block>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          GDPR-forespørsel detaljer
        </Heading>

        {isLoadingRequest && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-8)',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <Spinner aria-label={t('state.loading')} />
            <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Laster forespørsel...
            </Text>
          </div>
        )}

        {!isLoadingRequest && !request && (
          <Alert data-color="danger">
            <Paragraph style={{ margin: 0 }}>
              Kunne ikke laste forespørsel. Prøv igjen senere.
            </Paragraph>
          </Alert>
        )}

        {!isLoadingRequest && request && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Status and Urgency */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--ds-spacing-3)',
                alignItems: 'center',
                paddingBottom: 'var(--ds-spacing-3)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <Badge data-color={getStatusColor(request.status)} data-size="md">
                {getStatusLabel(request.status)}
              </Badge>
              <Text
                style={{
                  color: urgencyColor,
                  fontWeight: daysRemaining <= 7 ? 'var(--ds-font-weight-bold)' : 'normal',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                {daysRemaining} dager igjen
              </Text>
            </div>

            {/* Request Type */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Type forespørsel
              </label>
              <Text style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {getRequestTypeLabel(request.requestType)}
              </Text>
            </div>

            {/* User Info */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Bruker
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
                <Text
                  style={{
                    fontSize: 'var(--ds-font-size-md)',
                    fontWeight: userName && !String(userName).includes('-') ? 'var(--ds-font-weight-medium)' : 'normal',
                    fontFamily: userName && String(userName).includes('-') ? 'monospace' : 'inherit',
                  }}
                >
                  {userName}
                </Text>
                {userEmail && (
                  <Text style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {userEmail}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 'var(--ds-font-size-xs)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    fontFamily: 'var(--ds-font-family-mono)',
                  }}
                >
                  Bruker-ID: {request.userId}
                </Text>
              </div>
            </div>

            {/* Requested At */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Forespurt dato
              </label>
              <Text style={{ fontSize: 'var(--ds-font-size-md)' }}>
                {formatDate(request.requestedAt)} kl. {formatTime(request.requestedAt)}
              </Text>
            </div>

            {/* Expires At */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Utløper
              </label>
              <Text
                style={{
                  fontSize: 'var(--ds-font-size-md)',
                  color: urgencyColor,
                  fontWeight: daysRemaining <= 7 ? 'var(--ds-font-weight-medium)' : 'normal',
                }}
              >
                {formatDate(request.expiresAt)} kl. {formatTime(request.expiresAt)}
              </Text>
            </div>

            {/* Processed Info (if completed or rejected) */}
            {request.processedAt && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    marginBottom: 'var(--ds-spacing-1)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  Behandlet
                </label>
                <Text style={{ fontSize: 'var(--ds-font-size-md)' }}>
                  {formatDate(request.processedAt)} kl. {formatTime(request.processedAt)}
                </Text>
                {request.processedBy && (
                  <Text
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      marginTop: 'var(--ds-spacing-1)',
                    }}
                  >
                    Av: {request.processedBy}
                  </Text>
                )}
              </div>
            )}

            {/* Rejection Reason (if rejected) */}
            {request.status === 'rejected' && request.metadata?.rejectionReason && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    marginBottom: 'var(--ds-spacing-1)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  Avslåtningsbegrunnelse
                </label>
                <div
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-danger-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-danger-border-subtle)',
                  }}
                >
                  <Text style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                    {String(request.metadata.rejectionReason)}
                  </Text>
                </div>
              </div>
            )}

            {/* Request ID */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Forespørsel-ID
              </label>
              <Text
                style={{
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  fontFamily: 'var(--ds-font-family-mono)',
                }}
              >
                {request.id}
              </Text>
            </div>

            {/* Rejection Form */}
            {showRejectForm && canTakeActions && (
              <div
                style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-warning-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-warning-border-subtle)',
                }}
              >
                <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                  Begrunnelse for avslag
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                  Vennligst gi en begrunnelse for avslaget. Dette vil bli synlig for brukeren.
                </Paragraph>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('form.gdpr.placeholder')}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            )}

            {/* Warning for irreversible actions */}
            {canTakeActions && request.requestType === 'deletion' && !showRejectForm && (
              <Alert data-color="warning">
                <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>{t("ui.warning")}</Heading>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Godkjenning av en slettingsforespørsel vil permanent fjerne brukerens data. Denne handlingen kan ikke angres.
                </Paragraph>
              </Alert>
            )}
          </div>
        )}
      </Dialog.Block>

      {/* Actions */}
      {!isLoadingRequest && request && (
        <Dialog.Block>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            {/* Cancel or Close button */}
            {!showRejectForm && (
              <Button type="button" variant="secondary" onClick={handleClose}>
                {canTakeActions ? t("action.cancel") : t("action.close")}
              </Button>
            )}

            {/* Back button (when in reject form) */}
            {showRejectForm && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
              >
                Tilbake
              </Button>
            )}

            {/* Action buttons (only for pending requests) */}
            {canTakeActions && !showRejectForm && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  data-color="danger"
                  onClick={handleRejectClick}
                  disabled={updateStatus.isPending}
                >
                  Avslå
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleApprove}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? t('common.godkjenner') : 'Godkjenn'}
                </Button>
              </>
            )}

            {/* Submit rejection button */}
            {showRejectForm && (
              <Button
                type="button"
                variant="primary"
                data-color="danger"
                onClick={handleRejectSubmit}
                disabled={updateStatus.isPending || !rejectionReason.trim()}
              >
                {updateStatus.isPending ? t('common.avslaar') : 'Bekreft avslag'}
              </Button>
            )}
          </div>
        </Dialog.Block>
      )}
    </Dialog>
  );
}
