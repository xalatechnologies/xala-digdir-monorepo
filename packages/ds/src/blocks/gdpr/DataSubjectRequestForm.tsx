/**
 * DataSubjectRequestForm Component
 * 
 * GDPR data subject request form that allows users to submit requests
 * for data access, rectification, erasure, and other GDPR rights.
 * 
 * This component is reusable across all apps (web, minside, etc.)
 * and follows the SDK-first architecture pattern.
 */

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

  const requestTypeOptions = [
    { value: 'access', label: t('gdpr.dataRequest.typeAccess') },
    { value: 'rectification', label: t('gdpr.dataRequest.typeRectification') },
    { value: 'erasure', label: t('gdpr.dataRequest.typeErasure') },
    { value: 'portability', label: t('gdpr.dataRequest.typePortability') },
    { value: 'objection', label: t('gdpr.dataRequest.typeObjection') },
    { value: 'restriction', label: t('gdpr.dataRequest.typeRestriction') },
  ];

  return (
    <Stack direction="column" gap="32px">
      <Stack direction="column" gap="16px">
        <Heading size="lg">{t('gdpr.dataRequest.title')}</Heading>
        <Paragraph>{t('gdpr.dataRequest.description')}</Paragraph>
      </Stack>

      <Card>
        <form onSubmit={handleSubmit}>
          <Stack direction="column" gap="24px">
            <Stack direction="column" gap="8px">
              <label htmlFor="request-type">
                <Paragraph size="sm" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {t('gdpr.dataRequest.typeLabel')}
                </Paragraph>
              </label>
              <Select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as DataRequestType)}
                disabled={isPending}
              >
                {requestTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Stack>

            <Stack direction="column" gap="8px">
              <label htmlFor="request-details">
                <Paragraph size="sm" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {t('gdpr.dataRequest.detailsLabel')}
                </Paragraph>
              </label>
              <Textarea
                id="request-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t('gdpr.dataRequest.detailsPlaceholder')}
                disabled={isPending}
                rows={5}
              />
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('gdpr.dataRequest.detailsHelp')}
              </Paragraph>
            </Stack>

            {isSuccess && (
              <Alert severity="success">
                {t('gdpr.dataRequest.success')}
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

      {myRequests.length > 0 && (
        <Stack direction="column" gap="16px">
          <Heading size="md">{t('gdpr.dataRequest.myRequests')}</Heading>
          <Stack direction="column" gap="12px">
            {myRequests.map((request: DataSubjectRequestDTO) => (
              <Card key={request.id}>
                <Stack direction="column" gap="12px">
                  <Stack direction="row" gap="12px" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Stack direction="column" gap="4px" style={{ flex: 1 }}>
                      <Stack direction="row" gap="8px" style={{ alignItems: 'center' }}>
                        <Heading size="sm">
                          {requestTypeOptions.find((opt) => opt.value === request.requestType)?.label || request.requestType}
                        </Heading>
                        {getStatusBadge(request.status)}
                      </Stack>
                      {request.details && (
                        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {request.details}
                        </Paragraph>
                      )}
                      <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('gdpr.dataRequest.submittedAt')}: {new Date(request.createdAt).toLocaleDateString()}
                      </Paragraph>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
