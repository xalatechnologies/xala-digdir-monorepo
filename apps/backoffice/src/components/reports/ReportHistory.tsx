/**
 * Report History
 * Main history UI for viewing past report generations with download capability
 * Follows patterns from audit.tsx
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  HeaderSearch,
  Drawer,
  DrawerSection,
  Stack,
  Badge,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
} from '@xala/ds';

import {
  useReportHistory,
  type ReportHistoryItem,
  type ReportHistoryQueryParams,
  type ReportJobStatus,
  type ReportType,
} from '@digilist/client-sdk';

import { ReportStatusBadge } from './ReportStatusBadge';

// Helper to format date
function formatDate(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Helper to format time
function formatTime(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper to format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Status tabs for filtering
const STATUS_TABS = [
  { id: 'all', label: 'Alle', icon: '📋' },
  { id: 'completed', label: 'Fullført', icon: '✓' },
  { id: 'processing', label: 'Behandler', icon: '⏳' },
  { id: 'pending', label: 'Venter', icon: '⏱' },
  { id: 'failed', label: 'Feilet', icon: '✕' },
] as const;

// Report type filter options
const REPORT_TYPE_OPTIONS = [
  { id: 'all', label: 'Alle rapporttyper' },
  { id: 'usage', label: 'Bruksrapport' },
  { id: 'revenue', label: 'Inntektsrapport' },
  { id: 'booking', label: 'Bookingrapport' },
  { id: 'utilization', label: 'Utnyttelsesrapport' },
  { id: 'seasonal_allocation', label: 'Sesongallokering' },
  { id: 'custom', label: 'Egendefinert' },
];

// Export format labels
const EXPORT_FORMAT_LABELS: Record<string, string> = {
  csv: 'CSV',
  xlsx: 'Excel',
  pdf: 'PDF',
  json: 'JSON',
};

// Helper to get report type label
function getReportTypeLabel(type: ReportType): string {
  switch (type) {
    case 'usage':
      return 'Bruksrapport';
    case 'revenue':
      return 'Inntektsrapport';
    case 'booking':
      return 'Bookingrapport';
    case 'utilization':
      return 'Utnyttelsesrapport';
    case 'seasonal_allocation':
      return 'Sesongallokering';
    case 'custom':
      return 'Egendefinert';
    default:
      return type;
  }
}

export function ReportHistory() {
  const formatLocale = 'nb-NO';

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportHistoryItem | null>(null);
  const [page, setPage] = useState(1);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Build query params
  const queryParams: ReportHistoryQueryParams = useMemo(() => {
    const params: ReportHistoryQueryParams = {
      page,
      limit: 25,
    };
    if (statusFilter !== 'all') params.status = statusFilter as ReportJobStatus;
    if (reportTypeFilter !== 'all') params.reportType = reportTypeFilter as ReportType;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, statusFilter, reportTypeFilter, startDate, endDate]);

  // Data fetching
  const { data: historyData, isLoading, error } = useReportHistory(queryParams);

  // Filter reports by search
  const reports = useMemo(() => {
    const data = historyData?.data || [];
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((report: ReportHistoryItem) => {
      const reportName = report.reportName || '';
      const generatedByName = report.generatedByName || '';
      const jobId = report.jobId || '';
      return (
        reportName.toLowerCase().includes(query) ||
        generatedByName.toLowerCase().includes(query) ||
        jobId.toLowerCase().includes(query)
      );
    });
  }, [historyData, searchQuery]);

  // Pagination
  const totalPages = historyData?.meta?.totalPages || 1;
  const totalCount = historyData?.meta?.total || reports.length;

  // Active filter count (excludes status tab)
  const activeFilterCount = [
    reportTypeFilter !== 'all',
    startDate,
    endDate,
  ].filter(Boolean).length;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchValue || '');
    setPage(1);
  }, [searchValue]);


  const handleStatusTabChange = useCallback((tabId: string) => {
    setStatusFilter(tabId);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setReportTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const handleRowClick = useCallback((report: ReportHistoryItem) => {
    setSelectedReport(report);
  }, []);

  const handleDownload = useCallback((report: ReportHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (report.fileUrl) {
      // Trigger download
      window.open(report.fileUrl, '_blank');
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  return (
    <div style={{ width: '100%' }}>
      {/* Header with Search and Filters */}
      <Stack direction="vertical" spacing={16} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Heading data-size="md">Rapporthistorikk</Heading>
            <Paragraph style={{ color: 'var(--ds-color-text-subtle)', marginTop: 8 }}>
              Se tidligere genererte rapporter og last dem ned på nytt
            </Paragraph>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsFilterOpen(true)}
          >
            <FilterIcon />
            Filtre
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        </div>

        {/* Search Bar */}
        <HeaderSearch
          value={searchValue}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          placeholder="Søk etter rapportnavn, jobb-ID eller bruker..."
        />

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--ds-color-border-subtle)' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusTabChange(tab.id)}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                borderBottom: statusFilter === tab.id ? '2px solid var(--ds-color-accent-base)' : '2px solid transparent',
                cursor: 'pointer',
                color: statusFilter === tab.id ? 'var(--ds-color-accent-base)' : 'var(--ds-color-text-subtle)',
                fontWeight: statusFilter === tab.id ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Stack>

      {/* Loading State */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner aria-label="Laster rapporthistorikk..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-danger-base)' }}>
            Kunne ikke laste rapporthistorikk. Prøv igjen senere.
          </Paragraph>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && reports.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-text-subtle)' }}>
            {searchQuery ? 'Ingen rapporter funnet.' : 'Ingen rapporter generert ennå.'}
          </Paragraph>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && reports.length > 0 && (
        <>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Rapport</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Format</Table.HeaderCell>
                <Table.HeaderCell>Generert av</Table.HeaderCell>
                <Table.HeaderCell>Startet</Table.HeaderCell>
                <Table.HeaderCell>Fullført</Table.HeaderCell>
                <Table.HeaderCell>Størrelse</Table.HeaderCell>
                <Table.HeaderCell>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {reports.map((report: ReportHistoryItem) => (
                <Table.Row
                  key={report.id}
                  onClick={() => handleRowClick(report)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Cell>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {report.reportName || 'Uten navn'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ds-color-text-subtle)' }}>
                        {report.jobId}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="neutral" data-size="sm">
                      {getReportTypeLabel(report.reportType)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <ReportStatusBadge status={report.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="neutral" data-size="sm">
                      {EXPORT_FORMAT_LABELS[report.exportFormat] || report.exportFormat}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {report.generatedByName || 'Ukjent'}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div>{formatDate(report.startedAt, formatLocale)}</div>
                      <div style={{ fontSize: 12, color: 'var(--ds-color-text-subtle)' }}>
                        {formatTime(report.startedAt, formatLocale)}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {report.completedAt ? (
                      <div>
                        <div>{formatDate(report.completedAt, formatLocale)}</div>
                        <div style={{ fontSize: 12, color: 'var(--ds-color-text-subtle)' }}>
                          {formatTime(report.completedAt, formatLocale)}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ds-color-text-subtle)' }}>-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {formatFileSize(report.fileSize)}
                  </Table.Cell>
                  <Table.Cell>
                    {report.status === 'completed' && report.fileUrl && (
                      <Button
                        variant="secondary"
                        data-size="sm"
                        onClick={(e) => handleDownload(report, e)}
                      >
                        <DownloadIcon />
                        Last ned
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <Paragraph style={{ color: 'var(--ds-color-text-subtle)' }}>
                Viser side {page} av {totalPages} ({totalCount} rapporter totalt)
              </Paragraph>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="secondary"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  <ChevronLeftIcon />
                  Forrige
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Neste
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtre"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={handleClearFilters}>
              Nullstill
            </Button>
            <Button variant="primary" onClick={() => setIsFilterOpen(false)}>
              Bruk filtre
            </Button>
          </div>
        }
      >
        <DrawerSection>
          <Stack direction="vertical" spacing={16}>
            {/* Report Type Filter */}
            <div>
              <Heading data-size="xs" style={{ marginBottom: 8 }}>Rapporttype</Heading>
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--ds-color-border-default)',
                  borderRadius: 4,
                  background: 'var(--ds-color-surface-default)',
                }}
              >
                {REPORT_TYPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filters */}
            <div>
              <Heading data-size="xs" style={{ marginBottom: 8 }}>Fra dato</Heading>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--ds-color-border-default)',
                  borderRadius: 4,
                  background: 'var(--ds-color-surface-default)',
                }}
              />
            </div>

            <div>
              <Heading data-size="xs" style={{ marginBottom: 8 }}>Til dato</Heading>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--ds-color-border-default)',
                  borderRadius: 4,
                  background: 'var(--ds-color-surface-default)',
                }}
              />
            </div>
          </Stack>
        </DrawerSection>
      </Drawer>

      {/* Details Drawer */}
      <Drawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Rapportdetaljer"
      >
        {selectedReport && (
          <>
            <DrawerSection>
              <Stack direction="vertical" spacing={16}>
                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Rapportnavn</Heading>
                  <Paragraph>{selectedReport.reportName || 'Uten navn'}</Paragraph>
                </div>

                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Jobb-ID</Heading>
                  <Paragraph style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {selectedReport.jobId}
                  </Paragraph>
                </div>

                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Type</Heading>
                  <Badge color="neutral">{getReportTypeLabel(selectedReport.reportType)}</Badge>
                </div>

                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Status</Heading>
                  <ReportStatusBadge status={selectedReport.status} />
                </div>

                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Format</Heading>
                  <Badge color="neutral">
                    {EXPORT_FORMAT_LABELS[selectedReport.exportFormat] || selectedReport.exportFormat}
                  </Badge>
                </div>

                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Generert av</Heading>
                  <Paragraph>{selectedReport.generatedByName || 'Ukjent'}</Paragraph>
                </div>

                <div>
                  <Heading data-size="xs" style={{ marginBottom: 4 }}>Startet</Heading>
                  <Paragraph>
                    {formatDate(selectedReport.startedAt, formatLocale)} kl.{' '}
                    {formatTime(selectedReport.startedAt, formatLocale)}
                  </Paragraph>
                </div>

                {selectedReport.completedAt && (
                  <div>
                    <Heading data-size="xs" style={{ marginBottom: 4 }}>Fullført</Heading>
                    <Paragraph>
                      {formatDate(selectedReport.completedAt, formatLocale)} kl.{' '}
                      {formatTime(selectedReport.completedAt, formatLocale)}
                    </Paragraph>
                  </div>
                )}

                {selectedReport.fileSize && (
                  <div>
                    <Heading data-size="xs" style={{ marginBottom: 4 }}>Filstørrelse</Heading>
                    <Paragraph>{formatFileSize(selectedReport.fileSize)}</Paragraph>
                  </div>
                )}

                {selectedReport.error && (
                  <div>
                    <Heading data-size="xs" style={{ marginBottom: 4, color: 'var(--ds-color-danger-base)' }}>
                      Feilmelding
                    </Heading>
                    <Paragraph style={{ color: 'var(--ds-color-danger-base)' }}>
                      {selectedReport.error}
                    </Paragraph>
                  </div>
                )}

                {selectedReport.parameters && (
                  <div>
                    <Heading data-size="xs" style={{ marginBottom: 4 }}>Parametere</Heading>
                    <div style={{
                      padding: 12,
                      background: 'var(--ds-color-surface-subtle)',
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}>
                      {selectedReport.parameters.period && (
                        <div>Periode: {selectedReport.parameters.period}</div>
                      )}
                      {selectedReport.parameters.startDate && (
                        <div>Fra: {selectedReport.parameters.startDate}</div>
                      )}
                      {selectedReport.parameters.endDate && (
                        <div>Til: {selectedReport.parameters.endDate}</div>
                      )}
                      {selectedReport.parameters.metrics && (
                        <div>Metrikker: {selectedReport.parameters.metrics.length}</div>
                      )}
                      {selectedReport.parameters.filters && (
                        <div>Filtre: {selectedReport.parameters.filters.length}</div>
                      )}
                    </div>
                  </div>
                )}
              </Stack>
            </DrawerSection>

            {selectedReport.status === 'completed' && selectedReport.fileUrl && (
              <DrawerSection>
                <Button
                  variant="primary"
                  onClick={(e) => handleDownload(selectedReport, e)}
                  style={{ width: '100%' }}
                >
                  <DownloadIcon />
                  Last ned rapport
                </Button>
              </DrawerSection>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
