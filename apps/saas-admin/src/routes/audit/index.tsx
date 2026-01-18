/**
 * Audit Log Page - SaaS Admin
 * Platform-wide audit log viewer with filtering and stats
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
  Grid,
} from '@xala/ds';
import { useAuditLog, useAuditStats } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

export function AuditLogPage() {
  const t = useT();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: auditData, isLoading } = useAuditLog({
    search: searchQuery || undefined,
    limit: 50,
  });
  const auditLogs = auditData?.data ?? [];

  const { data: statsData } = useAuditStats();
  const stats = statsData?.data;

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
        <Spinner size="lg" aria-label={t('state.loading')} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} size="md">
          {t('saasAdmin.auditLog')}
        </Heading>
        <Paragraph size="sm" color="subtle">
          {t('saasAdmin.auditSubtitle')}
        </Paragraph>
      </Stack>

      {/* Stats */}
      {stats && (
        <Grid
          columns="repeat(auto-fit, minmax(var(--ds-size-20, 150px), 1fr))"
          gap={12}
        >
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Stack direction="column" gap={2}>
              <Paragraph size="sm" color="subtle" style={{ margin: 0 }}>
                {t('saasAdmin.auditLog.totalEvents', { defaultValue: 'Total Events' })}
              </Paragraph>
              <Heading level={3} size="lg" style={{ margin: 0 }}>
                {stats.totalEvents || 0}
              </Heading>
            </Stack>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Stack direction="column" gap={2}>
              <Paragraph size="sm" color="subtle" style={{ margin: 0 }}>
                {t('saasAdmin.auditLog.todayEvents', { defaultValue: 'Today' })}
              </Paragraph>
              <Heading level={3} size="lg" style={{ margin: 0 }}>
                {stats.todayEvents || 0}
              </Heading>
            </Stack>
          </Card>
        </Grid>
      )}

      {/* Search */}
      <Card>
        <HeaderSearch
          placeholder={t('action.search', { defaultValue: 'Search audit log...' })}
          value={searchQuery}
          onSearchChange={(value) => setSearchQuery(value)}
        />
      </Card>

      {/* Audit Log Table */}
      <Card>
        {auditLogs.length === 0 ? (
          <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
            <Paragraph size="sm" color="subtle">
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
                <Table.HeaderCell>{t('saasAdmin.auditLog.target')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.auditLog.details')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {auditLogs.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>
                    <Text size="sm">{formatDate(log.timestamp)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="info">{log.action}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="sm">{log.actorId || '—'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="sm">{log.resourceType || '—'}</Text>
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
