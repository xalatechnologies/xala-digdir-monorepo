/**
 * Audit Log Page - Tenant Admin
 * Tenant-scoped audit log viewer
 */

import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Table,
  Badge,
  Spinner,
  HeaderSearch,
  Text,
  Stack,
} from '@xala/ds';
import { useAuditLog } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

export function AuditLogPage() {
  const t = useT();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: auditData, isLoading } = useAuditLog({
    search: searchQuery || undefined,
    limit: 50,
  });
  const auditLogs = auditData?.data ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} data-size="md">
          {t('tenantAdmin.nav.auditLog', { defaultValue: 'Audit Log' })}
        </Heading>
        <Paragraph data-size="sm" data-color="subtle">
          {t('tenantAdmin.nav.auditLogDesc', { defaultValue: 'View audit logs for this tenant' })}
        </Paragraph>
      </Stack>

      {/* Search */}
      <Card>
        <HeaderSearch
          placeholder={t('common.search', { defaultValue: 'Search audit log...' })}
          value={searchQuery}
          onSearchChange={(value) => setSearchQuery(value)}
        />
      </Card>

      {/* Audit Log Table */}
      <Card>
        {auditLogs.length === 0 ? (
          <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
            <Paragraph data-size="sm" data-color="subtle">
              {t('saasAdmin.auditLog.noLogs')}
            </Paragraph>
          </Stack>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('saasAdmin.auditLog.timestamp')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.auditLog.action')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.auditLog.actor')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.auditLog.details')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {auditLogs.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>
                    <Text data-size="sm">{formatDate(log.timestamp)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="info">{log.action}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text data-size="sm">{log.actorId || '—'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="sm" color="var(--ds-color-neutral-text-subtle)">
                      {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '—'}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </Stack>
  );
}

export default AuditLogPage;
