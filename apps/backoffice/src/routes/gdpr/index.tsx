import React, { useRef, useEffect } from 'react';
import {
  Container,
  Stack,
  Heading,
  Card,
  Table,
  Badge,
  Button,
  Select,
  Textarea,
  Alert,
  Pagination,
  Spinner,
  Paragraph,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  usePendingDataRequests,
  useUpdateDataRequestStatus,
} from '@digilist/client-sdk/hooks';
import type { DataSubjectRequestDTO, DataRequestStatus } from '@digilist/client-sdk/types';

export function GDPRManagementPage() {
  const t = useT();
  const { data: requestsData, isLoading } = usePendingDataRequests();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateDataRequestStatus();

  const [selectedRequest, setSelectedRequest] = React.useState<DataSubjectRequestDTO | null>(null);
  const [newStatus, setNewStatus] = React.useState<DataRequestStatus>('in_progress');
  const [adminNotes, setAdminNotes] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  const dialogRef = useRef<HTMLDialogElement>(null);

  const requests = requestsData?.data || [];
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (selectedRequest && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!selectedRequest && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [selectedRequest]);

  const handleOpenModal = (request: DataSubjectRequestDTO) => {
    setSelectedRequest(request);
    setNewStatus(request.status === 'pending' ? 'in_progress' : request.status);
    setAdminNotes(request.adminNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const handleUpdateStatus = () => {
    if (!selectedRequest) return;

    updateStatus(
      {
        requestId: selectedRequest.id,
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleCloseModal();
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'warning' as const, label: t('gdpr.dataRequest.statusPending') },
      in_progress: { color: 'info' as const, label: t('gdpr.dataRequest.statusInProgress') },
      completed: { color: 'success' as const, label: t('gdpr.dataRequest.statusCompleted') },
      rejected: { color: 'danger' as const, label: t('gdpr.dataRequest.statusRejected') },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge color={config.color} size="sm">
        {config.label}
      </Badge>
    );
  };

  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const deadline = new Date(created);
    deadline.setDate(deadline.getDate() + 30); // GDPR 30-day deadline
    const now = new Date();
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysRemaining;
  };

  const getDaysRemainingBadge = (createdAt: string, status: string) => {
    if (status === 'completed' || status === 'rejected') {
      return null;
    }

    const daysRemaining = getDaysRemaining(createdAt);
    let color: 'success' | 'warning' | 'danger' = 'success';

    if (daysRemaining <= 7) {
      color = 'danger';
    } else if (daysRemaining <= 14) {
      color = 'warning';
    }

    return (
      <Badge color={color} size="sm">
        {daysRemaining} {t('gdpr.admin.daysRemaining')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Container maxWidth="1400px" style={{ padding: 'var(--ds-spacing-6)' }}>
        <Stack direction="column" gap="24px" style={{ alignItems: 'center', padding: '48px' }}>
          <Spinner size="lg" />
          <Paragraph>{t('common.loading')}</Paragraph>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="1400px" style={{ padding: 'var(--ds-spacing-6)' }}>
      <Stack direction="column" gap="24px">
        <Stack direction="row" gap="16px" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="column" gap="8px">
            <Heading size="xl">{t('gdpr.admin.title')}</Heading>
            <Paragraph>{t('gdpr.admin.description')}</Paragraph>
          </Stack>
          <Badge color="neutral" size="lg">
            {requests.length} {t('gdpr.admin.totalRequests')}
          </Badge>
        </Stack>

        {requests.length === 0 ? (
          <Card>
            <Stack direction="column" gap="16px" style={{ alignItems: 'center', padding: '48px' }}>
              <Paragraph>{t('gdpr.admin.noRequests')}</Paragraph>
            </Stack>
          </Card>
        ) : (
          <>
            <Card>
              <Table>
                <thead>
                  <tr>
                    <th>{t('gdpr.admin.table.requestId')}</th>
                    <th>{t('gdpr.admin.table.userId')}</th>
                    <th>{t('gdpr.admin.table.type')}</th>
                    <th>{t('gdpr.admin.table.status')}</th>
                    <th>{t('gdpr.admin.table.deadline')}</th>
                    <th>{t('gdpr.admin.table.submittedAt')}</th>
                    <th>{t('gdpr.admin.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <code style={{ fontSize: '0.85em' }}>
                          {request.id.slice(0, 8)}...
                        </code>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.85em' }}>
                          {request.userId.slice(0, 8)}...
                        </code>
                      </td>
                      <td>{t(`gdpr.dataRequest.types.${request.requestType}`)}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>{getDaysRemainingBadge(request.createdAt, request.status)}</td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenModal(request)}
                        >
                          {t('gdpr.admin.manage')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </Stack>

      {selectedRequest && (
        <dialog
          ref={dialogRef}
          aria-labelledby="request-modal-title"
          style={{
            padding: 'var(--ds-spacing-6)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: 'none',
            boxShadow: 'var(--ds-shadow-xl)',
            maxWidth: '600px',
            width: '90vw',
          }}
        >
          <Stack direction="column" gap="24px">
            <Heading id="request-modal-title" size="lg">
              {t('gdpr.admin.manageRequest')}
            </Heading>

            <Stack direction="column" gap="16px">
              <div>
                <strong>{t('gdpr.admin.requestDetails.id')}:</strong>{' '}
                <code>{selectedRequest.id}</code>
              </div>
              <div>
                <strong>{t('gdpr.admin.requestDetails.userId')}:</strong>{' '}
                <code>{selectedRequest.userId}</code>
              </div>
              <div>
                <strong>{t('gdpr.admin.requestDetails.type')}:</strong>{' '}
                {t(`gdpr.dataRequest.types.${selectedRequest.requestType}`)}
              </div>
              <div>
                <strong>{t('gdpr.admin.requestDetails.status')}:</strong>{' '}
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div>
                <strong>{t('gdpr.admin.requestDetails.submittedAt')}:</strong>{' '}
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>
              {selectedRequest.details && (
                <div>
                  <strong>{t('gdpr.admin.requestDetails.details')}:</strong>
                  <Paragraph size="sm">{selectedRequest.details}</Paragraph>
                </div>
              )}
            </Stack>

            <Alert severity="info">
              {t('gdpr.admin.deadlineWarning', {
                days: getDaysRemaining(selectedRequest.createdAt),
              })}
            </Alert>

            <Stack direction="column" gap="8px">
              <label htmlFor="status-select">
                <strong>{t('gdpr.admin.updateStatus')}</strong>
              </label>
              <Select
                id="status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as DataRequestStatus)}
                disabled={isUpdating}
              >
                <option value="pending">{t('gdpr.dataRequest.statusPending')}</option>
                <option value="in_progress">{t('gdpr.dataRequest.statusInProgress')}</option>
                <option value="completed">{t('gdpr.dataRequest.statusCompleted')}</option>
                <option value="rejected">{t('gdpr.dataRequest.statusRejected')}</option>
              </Select>
            </Stack>

            <Stack direction="column" gap="8px">
              <label htmlFor="admin-notes">
                <strong>{t('gdpr.admin.adminNotes')}</strong>
              </label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('gdpr.admin.adminNotesPlaceholder')}
                rows={4}
                disabled={isUpdating}
              />
            </Stack>

            <Stack direction="row" gap="12px" style={{ justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={isUpdating}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
              >
                {isUpdating ? t('common.saving') : t('common.save')}
              </Button>
            </Stack>
          </Stack>
        </dialog>
      )}
    </Container>
  );
}
