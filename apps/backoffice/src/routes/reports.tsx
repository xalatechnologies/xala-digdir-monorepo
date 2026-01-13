import { useState, useMemo } from 'react';
import { Card, Heading, Paragraph, Button, Badge, Spinner, BarChart, DownloadIcon, CalendarIcon } from '@xala/ds';
import {
  useDashboardKPIs,
  useUsageReport,
  useRevenueReport,
  useBookingStats,
  useExportReport,
  type ReportPeriod,
  type ExportFormat,
  formatCurrency,
  formatPercent,
} from '@digilist/client-sdk';

const periodLabels: Record<ReportPeriod, string> = {
  day: 'Dag',
  week: 'Uke',
  month: 'Måned',
  quarter: 'Kvartal',
  year: 'År',
};

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  // Fetch data from API
  const { data: kpisData, isLoading: isLoadingKPIs } = useDashboardKPIs();
  const kpis = kpisData?.data;

  const usageParams = {
    period,
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
  };
  const { data: usageData, isLoading: isLoadingUsage } = useUsageReport(usageParams);
  const usageReportRaw = usageData?.data;
  const usageReport = Array.isArray(usageReportRaw) ? usageReportRaw : [];

  const revenueParams = {
    period,
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
  };
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueReport(revenueParams);
  const revenueReportRaw = revenueData?.data;
  const revenueReport = Array.isArray(revenueReportRaw) ? revenueReportRaw : [];

  const bookingStatsParams = {
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
  };
  const { data: statsData, isLoading: isLoadingStats } = useBookingStats(bookingStatsParams);
  const bookingStats = statsData?.data;

  const exportReport = useExportReport();

  // Transform usage data for chart
  const usageChartData = useMemo(() => {
    return usageReport.slice(0, 10).map((item) => ({
      label: item.listingName || item.listingId,
      value: item.totalHours || 0,
    }));
  }, [usageReport]);

  // Transform revenue data for chart
  const revenueChartData = useMemo(() => {
    return revenueReport.slice(0, 10).map((item) => ({
      label: item.period || '',
      value: item.totalRevenue || 0,
    }));
  }, [revenueReport]);

  const handleExport = (format: ExportFormat, type: 'usage' | 'revenue' | 'bookings') => {
    exportReport.mutate({
      type,
      format,
      params: {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      },
    });
  };

  const isLoading = isLoadingKPIs || isLoadingUsage || isLoadingRevenue || isLoadingStats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Rapporter
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Oversikt og statistikk over bookinger og bruk.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={() => handleExport('xlsx', 'usage')}
            disabled={exportReport.isPending}
          >
            <DownloadIcon />
            Eksporter Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={() => handleExport('pdf', 'usage')}
            disabled={exportReport.isPending}
          >
            <DownloadIcon />
            Eksporter PDF
          </Button>
        </div>
      </div>

      {/* Period Controls */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CalendarIcon />
              <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>Periode:</span>
            </div>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>til</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            {(Object.keys(periodLabels) as ReportPeriod[]).map((p) => (
              <Button
                key={p}
                type="button"
                variant={period === p ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card style={{ padding: 'var(--ds-spacing-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner aria-label="Laster rapporter..." />
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Aktive lokaler
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {kpis?.activeListings ?? 0}
                </Heading>
              </div>
            </Card>

            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Ventende forespørsler
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {kpis?.pendingRequests ?? 0}
                </Heading>
                {(kpis?.pendingRequests ?? 0) > 0 && (
                  <Badge data-color="warning" data-size="sm">Krever handling</Badge>
                )}
              </div>
            </Card>

            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Bookinger i dag
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {kpis?.todayBookings ?? 0}
                </Heading>
              </div>
            </Card>

            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Omsetning denne {periodLabels[period].toLowerCase()}en
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {formatCurrency(kpis?.periodRevenue ?? 0)}
                </Heading>
                {kpis?.revenueChange !== undefined && (
                  <Badge data-color={kpis.revenueChange >= 0 ? 'success' : 'danger'} data-size="sm">
                    {formatPercent(kpis.revenueChange)}
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            {/* Usage Chart */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Bruk per lokale (timer)
                </Heading>
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  onClick={() => handleExport('csv', 'usage')}
                  disabled={exportReport.isPending}
                >
                  <DownloadIcon />
                  CSV
                </Button>
              </div>
              {usageChartData.length > 0 ? (
                <BarChart data={usageChartData} />
              ) : (
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                  Ingen bruksdata for valgt periode.
                </Paragraph>
              )}
            </Card>

            {/* Revenue Chart */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Omsetning over tid
                </Heading>
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  onClick={() => handleExport('csv', 'revenue')}
                  disabled={exportReport.isPending}
                >
                  <DownloadIcon />
                  CSV
                </Button>
              </div>
              {revenueChartData.length > 0 ? (
                <BarChart data={revenueChartData} maxValue={Math.max(...revenueChartData.map((d: { label: string; value: number }) => d.value))} />
              ) : (
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                  Ingen omsetningsdata for valgt periode.
                </Paragraph>
              )}
            </Card>
          </div>

          {/* Booking Statistics */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Bookingstatistikk
            </Heading>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Totalt antall
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {bookingStats?.totalBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Bekreftet
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
                  {bookingStats?.confirmedBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Venter
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-warning-text-default)' }}>
                  {bookingStats?.pendingBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Kansellert
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
                  {bookingStats?.cancelledBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Gj.snitt varighet
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {bookingStats?.averageDuration ? `${bookingStats.averageDuration.toFixed(1)}t` : '-'}
                </Heading>
              </div>
            </div>
          </Card>

          {/* Top Listings */}
          {usageReport.length > 0 && (
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
                Mest brukte lokaler
              </Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                {usageReport.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.listingId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: 'var(--ds-color-accent-surface-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--ds-font-size-sm)',
                          fontWeight: 'var(--ds-font-weight-bold)',
                          color: 'var(--ds-color-accent-text-default)',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {item.listingName || item.listingId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                          Timer
                        </Paragraph>
                        <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {item.totalHours?.toFixed(1) ?? 0}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                          Bookinger
                        </Paragraph>
                        <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {item.bookingCount ?? 0}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                          Utnyttelse
                        </Paragraph>
                        <Badge data-color={
                          (item.utilizationRate ?? 0) >= 70 ? 'success' :
                          (item.utilizationRate ?? 0) >= 40 ? 'warning' : 'neutral'
                        } data-size="sm">
                          {item.utilizationRate?.toFixed(0) ?? 0}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
