import { Card, Stack, Heading, Paragraph, Checkbox, Badge } from '@xala/ds';
import type { ReportMetric } from '@digilist/client-sdk';

interface MetricSelectorProps {
  selectedMetrics: ReportMetric[];
  onMetricsChange: (metrics: ReportMetric[]) => void;
  reportType?: 'usage' | 'revenue' | 'booking' | 'utilization' | 'seasonal_allocation' | 'custom';
}

// Define available metrics for different report types
const AVAILABLE_METRICS: Record<string, ReportMetric[]> = {
  usage: [
    { key: 'totalHours', label: 'Totalt antall timer', aggregation: 'sum' },
    { key: 'bookingCount', label: 'Antall bookinger', aggregation: 'count' },
    { key: 'uniqueUsers', label: 'Unike brukere', aggregation: 'count' },
    { key: 'avgDuration', label: 'Gjennomsnittlig varighet', aggregation: 'avg' },
  ],
  revenue: [
    { key: 'totalRevenue', label: 'Total inntekt', aggregation: 'sum' },
    { key: 'avgRevenue', label: 'Gjennomsnittlig inntekt', aggregation: 'avg' },
    { key: 'revenueGrowth', label: 'Inntektsvekst', aggregation: 'sum' },
    { key: 'discountAmount', label: 'Rabattbeløp', aggregation: 'sum' },
  ],
  booking: [
    { key: 'totalBookings', label: 'Totalt antall bookinger', aggregation: 'count' },
    { key: 'confirmedBookings', label: 'Bekreftede bookinger', aggregation: 'count' },
    { key: 'cancelledBookings', label: 'Kansellerte bookinger', aggregation: 'count' },
    { key: 'pendingBookings', label: 'Ventende bookinger', aggregation: 'count' },
    { key: 'avgBookingValue', label: 'Gjennomsnittlig bookingverdi', aggregation: 'avg' },
  ],
  utilization: [
    { key: 'utilizationRate', label: 'Utnyttelsesgrad', aggregation: 'avg' },
    { key: 'availableHours', label: 'Tilgjengelige timer', aggregation: 'sum' },
    { key: 'bookedHours', label: 'Bookede timer', aggregation: 'sum' },
    { key: 'peakUtilization', label: 'Maksimal utnyttelse', aggregation: 'max' },
  ],
  seasonal_allocation: [
    { key: 'allocationCount', label: 'Antall tildelinger', aggregation: 'count' },
    { key: 'totalAllocatedHours', label: 'Totalt tildelte timer', aggregation: 'sum' },
    { key: 'organizationCount', label: 'Antall organisasjoner', aggregation: 'count' },
    { key: 'avgAllocationDuration', label: 'Gjennomsnittlig tildelingsvarighet', aggregation: 'avg' },
  ],
  custom: [
    { key: 'totalHours', label: 'Totalt antall timer', aggregation: 'sum' },
    { key: 'bookingCount', label: 'Antall bookinger', aggregation: 'count' },
    { key: 'totalRevenue', label: 'Total inntekt', aggregation: 'sum' },
    { key: 'utilizationRate', label: 'Utnyttelsesgrad', aggregation: 'avg' },
    { key: 'uniqueUsers', label: 'Unike brukere', aggregation: 'count' },
    { key: 'avgDuration', label: 'Gjennomsnittlig varighet', aggregation: 'avg' },
    { key: 'confirmedBookings', label: 'Bekreftede bookinger', aggregation: 'count' },
    { key: 'cancelledBookings', label: 'Kansellerte bookinger', aggregation: 'count' },
  ],
};

const aggregationLabels: Record<string, string> = {
  sum: 'Sum',
  avg: 'Gjennomsnitt',
  count: 'Antall',
  min: 'Minimum',
  max: 'Maksimum',
};

export function MetricSelector({ selectedMetrics, onMetricsChange, reportType = 'custom' }: MetricSelectorProps) {
  const availableMetrics = AVAILABLE_METRICS[reportType] || AVAILABLE_METRICS.custom;

  const handleMetricToggle = (metric: ReportMetric) => {
    const isSelected = selectedMetrics.some((m) => m.key === metric.key);

    if (isSelected) {
      // Remove metric
      onMetricsChange(selectedMetrics.filter((m) => m.key !== metric.key));
    } else {
      // Add metric
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const isMetricSelected = (metricKey: string) => {
    return selectedMetrics.some((m) => m.key === metricKey);
  };

  return (
    <Card>
      <Stack spacing={16}>
        <div>
          <Heading level={3} data-size="sm">
            Velg måleparametere
          </Heading>
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg hvilke måleparametere som skal inkluderes i rapporten. Du kan velge flere.
          </Paragraph>
        </div>

        {selectedMetrics.length > 0 && (
          <div>
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
              Valgte måleparametere ({selectedMetrics.length})
            </Paragraph>
            <Stack direction="horizontal" spacing={8} style={{ flexWrap: 'wrap' }}>
              {selectedMetrics.map((metric) => (
                <Badge key={metric.key} color="info">
                  {metric.label}
                  {metric.aggregation && ` (${aggregationLabels[metric.aggregation]})`}
                </Badge>
              ))}
            </Stack>
          </div>
        )}

        <Stack spacing={12}>
          {availableMetrics.map((metric) => (
            <div
              key={metric.key}
              style={{
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-medium)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                backgroundColor: isMetricSelected(metric.key) ? 'var(--ds-color-info-surface-subtle)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleMetricToggle(metric)}
            >
              <Stack direction="horizontal" spacing={12} style={{ alignItems: 'flex-start' }}>
                <Checkbox
                  checked={isMetricSelected(metric.key)}
                  onChange={() => handleMetricToggle(metric)}
                  aria-label={metric.label}
                />
                <div style={{ flex: 1 }}>
                  <Stack direction="horizontal" spacing={8} style={{ alignItems: 'center', marginBottom: 'var(--ds-spacing-1)' }}>
                    <Paragraph data-size="sm" style={{ fontWeight: 500, margin: 0 }}>
                      {metric.label}
                    </Paragraph>
                    {metric.aggregation && (
                      <Badge color="neutral">
                        {aggregationLabels[metric.aggregation]}
                      </Badge>
                    )}
                  </Stack>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    {getMetricDescription(metric.key)}
                  </Paragraph>
                </div>
              </Stack>
            </div>
          ))}
        </Stack>

        {selectedMetrics.length === 0 && (
          <Paragraph data-size="sm" style={{ textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)', padding: 'var(--ds-spacing-4) 0' }}>
            Ingen måleparametere valgt. Velg minst én for å generere rapport.
          </Paragraph>
        )}
      </Stack>
    </Card>
  );
}

// Helper function to get metric descriptions
function getMetricDescription(key: string): string {
  const descriptions: Record<string, string> = {
    totalHours: 'Totalt antall timer booket i perioden',
    bookingCount: 'Totalt antall bookinger registrert',
    uniqueUsers: 'Antall unike brukere som har booket',
    avgDuration: 'Gjennomsnittlig varighet per booking',
    totalRevenue: 'Total inntekt generert fra bookinger',
    avgRevenue: 'Gjennomsnittlig inntekt per booking',
    revenueGrowth: 'Prosentvis vekst i inntekt sammenlignet med forrige periode',
    discountAmount: 'Totalt rabattbeløp gitt',
    totalBookings: 'Totalt antall bookinger uavhengig av status',
    confirmedBookings: 'Antall bekreftede bookinger',
    cancelledBookings: 'Antall kansellerte bookinger',
    pendingBookings: 'Antall bookinger som venter på bekreftelse',
    avgBookingValue: 'Gjennomsnittlig verdi per booking',
    utilizationRate: 'Prosentandel av tilgjengelig tid som er booket',
    availableHours: 'Totalt antall tilgjengelige timer',
    bookedHours: 'Totalt antall bookede timer',
    peakUtilization: 'Høyeste utnyttelsesgrad i perioden',
    allocationCount: 'Antall sesongbaserte tildelinger',
    totalAllocatedHours: 'Totalt antall timer tildelt gjennom sesongtildelinger',
    organizationCount: 'Antall organisasjoner med tildelinger',
    avgAllocationDuration: 'Gjennomsnittlig varighet per tildeling',
  };

  return descriptions[key] || 'Ingen beskrivelse tilgjengelig';
}
