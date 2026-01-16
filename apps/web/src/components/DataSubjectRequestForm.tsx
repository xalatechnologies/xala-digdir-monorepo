import React from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  Select,
  Textarea,
  Alert,
  Badge,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  useCreateDataSubjectRequest,
  useMyDataRequests,
} from '@digilist/client-sdk/hooks';
import type { DataRequestType, DataSubjectRequestDTO } from '@digilist/client-sdk/types';

export function DataSubjectRequestForm() {
  const t = useT();
  const { mutate: createRequest, isPending, isSuccess } = useCreateDataSubjectRequest();
  const { data: requestsData, isLoading: isLoadingRequests } = useMyDataRequests();

  const [requestType, setRequestType] = React.useState<DataRequestType>('access');
  const [details, setDetails] = React.useState('');

  const myRequests = requestsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRequest({
      requestType,
      details: details.trim() || undefined,
    });

    setDetails('');
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

  const renderRequestCard = (request: DataSubjectRequestDTO) => {
    return (
      <Card key={request.id}>
        <Stack direction="column" gap="12px">
          <Stack direction="row" gap="12px" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading size="sm">
              {t(`gdpr.dataRequest.types.${request.requestType}`)}
            </Heading>
            {getStatusBadge(request.status)}
          </Stack>

          {request.details && (
            <Paragraph size="sm">{request.details}</Paragraph>
          )}

          <Stack direction="row" gap="16px">
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('gdpr.dataRequest.submittedAt')}: {new Date(request.createdAt).toLocaleDateString()}
            </Paragraph>
            {request.completedAt && (
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('gdpr.dataRequest.completedAt')}: {new Date(request.completedAt).toLocaleDateString()}
              </Paragraph>
            )}
          </Stack>

          {request.adminNotes && (
            <Alert severity="info" size="sm">
              <strong>{t('gdpr.dataRequest.adminNotes')}:</strong> {request.adminNotes}
            </Alert>
          )}
        </Stack>
      </Card>
    );
  };

  return (
    <Stack direction="column" gap="32px">
      <Stack direction="column" gap="16px">
        <Heading size="lg">{t('gdpr.dataRequest.title')}</Heading>
        <Paragraph>{t('gdpr.dataRequest.description')}</Paragraph>
      </Stack>

      <Card>
        <form onSubmit={handleSubmit}>
          <Stack direction="column" gap="24px">
            <Heading size="md">{t('gdpr.dataRequest.newRequest')}</Heading>

            <Stack direction="column" gap="8px">
              <label htmlFor="request-type">
                <strong>{t('gdpr.dataRequest.requestType')}</strong>
              </label>
              <Select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as DataRequestType)}
                disabled={isPending}
              >
                <option value="access">{t('gdpr.dataRequest.types.access')}</option>
                <option value="erasure">{t('gdpr.dataRequest.types.erasure')}</option>
                <option value="portability">{t('gdpr.dataRequest.types.portability')}</option>
                <option value="rectification">{t('gdpr.dataRequest.types.rectification')}</option>
                <option value="restriction">{t('gdpr.dataRequest.types.restriction')}</option>
                <option value="objection">{t('gdpr.dataRequest.types.objection')}</option>
              </Select>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t(`gdpr.dataRequest.typeDescriptions.${requestType}`)}
              </Paragraph>
            </Stack>

            <Stack direction="column" gap="8px">
              <label htmlFor="request-details">
                <strong>{t('gdpr.dataRequest.details')}</strong>
              </label>
              <Textarea
                id="request-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t('gdpr.dataRequest.detailsPlaceholder')}
                rows={4}
                disabled={isPending}
              />
            </Stack>

            <Alert severity="info">
              {t('gdpr.dataRequest.processingTime')}
            </Alert>

            {isSuccess && (
              <Alert severity="success">
                {t('gdpr.dataRequest.submitSuccess')}
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
            >
              {isPending ? t('common.submitting') : t('gdpr.dataRequest.submit')}
            </Button>
          </Stack>
        </form>
      </Card>

      {!isLoadingRequests && myRequests.length > 0 && (
        <Stack direction="column" gap="16px">
          <Heading size="md">{t('gdpr.dataRequest.myRequests')}</Heading>
          <Stack direction="column" gap="12px">
            {myRequests.map(renderRequestCard)}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
