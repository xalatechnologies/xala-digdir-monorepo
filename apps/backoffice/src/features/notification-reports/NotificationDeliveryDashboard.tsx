/**
 * Notification Delivery Dashboard
 * Admin view for monitoring notification delivery status and retry operations
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Spinner,
  Table,
  Badge,
  HeaderSearch,
} from '@xalatechnologies/platform/ui';

import {
  useDeliveryReports,
  useRetryFailed,
  formatDate,
  formatTime,
  type DeliveryReportQueryParams,
  type DeliveryReport,
} from '@digilist/client-sdk';
import { useToast } from '../../providers/ToastProvider';
import { useT } from '@xala/i18n';

// Status badge color mapping
const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  sent: 'success',
  delivered: 'success',
  pending: 'warning',
  failed: 'danger',
};

// Notification type display names
const TYPE_LABELS: Record<string, string> = {
  email: 'E-post',
  sms: 'SMS',
  push: 'Push',
  in_app: 'In-app',
};

export function NotificationDeliveryDashboard() {
  const t = useT();
  const toast = useToast();

  // State
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Build query params
  const queryParams = useMemo<DeliveryReportQueryParams>(() => {
    const params: DeliveryReportQueryParams = {};
    if (searchQuery) params.search = searchQuery;
    return params;
  }, [searchQuery]);

  // Fetch delivery reports
  const { data: reportsData, isLoading } = useDeliveryReports(queryParams);
  const retryFailed = useRetryFailed();

  // Get reports array
  const reports = useMemo(() => {
    return reportsData?.data ?? [];
  }, [reportsData]);

  const totalCount = reportsData?.meta?.total || reports.length;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value || '');
  }, []);

  const handleRetryFailed = async () => {
    try {
      const result = await retryFailed.mutateAsync();
      const retriedCount = result?.retried || 0;
      toast.success(
        t('messages.prover_feilede_paa_nytt'),
        retriedCount > 0
          ? `${retriedCount} varsling${retriedCount === 1 ? '' : 'er'} blir prøvd på nytt`
          : 'Ingen feilede varsler å prøve på nytt'
      );
    } catch (error) {
      toast.error(t('messages.kunne_ikke_prove_paa'), error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = reports.length;
    const sent = reports.filter((r) => r.status === 'sent' || r.status === 'delivered').length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const failed = reports.filter((r) => r.status === 'failed').length;

    return { total, sent, pending, failed };
  }, [reports]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div>
        <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
          Varslingsstatus
        </Paragraph>
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Overvåk leveringsstatus for e-post, SMS og push-varsler
        </Paragraph>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-3)',
      }}>
        <div style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Totalt
          </Paragraph>
          <Paragraph data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {stats.total}
          </Paragraph>
        </div>
        <div style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-success-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-success-border-subtle)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
            Sendt
          </Paragraph>
          <Paragraph data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.sent}
          </Paragraph>
        </div>
        <div style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-warning-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-warning-border-subtle)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>{t("status.pending")}</Paragraph>
          <Paragraph data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
            {stats.pending}
          </Paragraph>
        </div>
        <div style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-danger-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-danger-border-subtle)',
        }}>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
            Feilet
          </Paragraph>
          <Paragraph data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
            {stats.failed}
          </Paragraph>
        </div>
      </div>

      {/* Toolbar Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        <HeaderSearch
          placeholder={t('common.sok_etter_mottaker_eller')}
          value={searchValue}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          width="350px"
        />

        <div style={{ flex: 1 }} />

        {/* Retry button */}
        {stats.failed > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleRetryFailed}
            disabled={retryFailed.isPending}
          >
            {retryFailed.isPending ? t('common.prover_igjen') : 'Prøv feilede på nytt'}
          </Button>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--ds-spacing-10)',
          }}>
            <Spinner aria-label={t("state.loading")} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--ds-spacing-10)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Ingen varsler funnet
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery ? t('common.prov_aa_endre_sokekriteriene') : 'Det finnes ingen varsler ennå'}
            </Paragraph>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            overflow: 'hidden',
          }}>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell style={{ width: '100px' }}>{t('backoffice.text.type')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('backoffice.text.mottaker')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('backoffice.text.emne')}</Table.HeaderCell>
                  <Table.HeaderCell style={{ width: '120px' }}>{t('backoffice.text.status')}</Table.HeaderCell>
                  <Table.HeaderCell style={{ width: '100px' }}>{t('common.forsok')}</Table.HeaderCell>
                  <Table.HeaderCell style={{ width: '180px' }}>{t('common.siste_forsok')}</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {reports.map((report: DeliveryReport) => {
                  const statusColor = STATUS_COLORS[report.status] || 'neutral';
                  const typeLabel = TYPE_LABELS[report.type] || report.type;

                  return (
                    <Table.Row key={report.id}>
                      <Table.Cell>
                        <Badge color={report.type === 'email' ? 'info' : report.type === 'sms' ? 'success' : 'neutral'}>
                          {typeLabel}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {report.recipient}
                        </Paragraph>
                      </Table.Cell>
                      <Table.Cell>
                        <Paragraph data-size="sm" style={{ margin: 0 }}>
                          {report.subject || '-'}
                        </Paragraph>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={statusColor}>
                          {report.status === 'sent' && 'Sendt'}
                          {report.status === 'delivered' && 'Levert'}
                          {report.status === 'pending' && t("status.pending")}
                          {report.status === 'failed' && 'Feilet'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Paragraph data-size="sm" style={{ margin: 0 }}>
                          {report.attemptCount}
                        </Paragraph>
                      </Table.Cell>
                      <Table.Cell>
                        {report.lastAttemptAt ? (
                          <div>
                            <Paragraph data-size="sm" style={{ margin: 0 }}>
                              {formatDate(report.lastAttemptAt)}
                            </Paragraph>
                            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {formatTime(report.lastAttemptAt)}
                            </Paragraph>
                          </div>
                        ) : (
                          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                            -
                          </Paragraph>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>

      {/* Footer with total count */}
      {!isLoading && reports.length > 0 && (
        <div style={{
          padding: 'var(--ds-spacing-3)',
          textAlign: 'center',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        }}>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Viser {reports.length} av {totalCount} varsler
          </Paragraph>
        </div>
      )}
    </div>
  );
}
