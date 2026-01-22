/**
 * Booking Metrics Page
 * Displays tenant-scoped domain metrics including bookings, usage patterns, and trends.
 */
import { useState } from 'react';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  Box,
  Heading,
  Paragraph,
  Card,
  Spinner,
  Alert,
  Button,
  Tag,
  Select,
  Table,
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useSession } from '@digilist/client-sdk/hooks';
import {
  useBookingStats,
  useUsageReport,
  useRevenueReport,
  useRentalObjects,
} from '@digilist/client-sdk/hooks';

// Types for booking metrics
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface BookingTrend {
  date: string;
  count: number;
  revenue: number;
}

interface CategoryMetric {
  category: string;
  bookings: number;
  revenue: number;
  avgDuration: number;
  utilizationRate: number;
}

/**
 * Stat card component for displaying key metrics
 */
function StatCard({
  label,
  value,
  subValue,
  trend,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; value: string };
}) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        {label}
      </Paragraph>
      <Heading level={3} size="lg" style={{ marginTop: 'var(--ds-spacing-1)' }}>
        {value}
      </Heading>
      {subValue && (
        <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-1)' }}>
          {subValue}
        </Paragraph>
      )}
      {trend && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            marginTop: 'var(--ds-spacing-2)',
          }}
        >
          <Tag
            color={
              trend.direction === 'up'
                ? 'success'
                : trend.direction === 'down'
                  ? 'danger'
                  : 'neutral'
            }
            size="sm"
          >
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
            {trend.value}
          </Tag>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            vs. forrige periode
          </Paragraph>
        </Box>
      )}
    </Card>
  );
}

/**
 * Simple bar chart visualization
 */
function SimpleBarChart({ data, maxValue }: { data: BookingTrend[]; maxValue: number }) {
  const t = useT();

  return (
    <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--ds-spacing-1)', height: '200px' }}>
      {data.map((item, index) => {
        const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
        return (
          <Box
            key={index}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              style={{
                width: '100%',
                height: `${height}%`,
                minHeight: '4px',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                borderRadius: '4px 4px 0 0',
              }}
              title={`${item.count} ${t('monitoring.metrics.bookings')}`}
            />
            <Paragraph
              size="sm"
              style={{
                marginTop: 'var(--ds-spacing-1)',
                fontSize: '10px',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {new Date(item.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
            </Paragraph>
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Utilization bar component
 */
function UtilizationBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 80
      ? 'var(--ds-color-success-base-default)'
      : percentage >= 50
        ? 'var(--ds-color-warning-base-default)'
        : 'var(--ds-color-danger-base-default)';

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      <Box
        style={{
          flex: 1,
          height: '8px',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </Box>
      <Paragraph size="sm" style={{ minWidth: '40px', textAlign: 'right' }}>
        {percentage}%
      </Paragraph>
    </Box>
  );
}

/**
 * Category metrics table
 */
function CategoryMetricsTable({ metrics }: { metrics: CategoryMetric[] }) {
  const t = useT();

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>{t('monitoring.metrics.category')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.bookingsCount')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.revenue')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.avgDuration')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.utilization')}</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {metrics.map((metric, index) => (
          <Table.Row key={index}>
            <Table.Cell>
              <Paragraph size="sm" style={{ fontWeight: 500 }}>
                {metric.category}
              </Paragraph>
            </Table.Cell>
            <Table.Cell>{metric.bookings.toLocaleString()}</Table.Cell>
            <Table.Cell>{metric.revenue.toLocaleString()} kr</Table.Cell>
            <Table.Cell>{metric.avgDuration}h</Table.Cell>
            <Table.Cell style={{ minWidth: '150px' }}>
              <UtilizationBar percentage={metric.utilizationRate} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

/**
 * Top rental objects table
 */
function TopRentalObjectsTable({
  rentalObjects,
}: {
  rentalObjects: Array<{ name: string; bookings: number; revenue: number; rating: number }>;
}) {
  const t = useT();

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.rentalObject')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.bookingsCount')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.revenue')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.metrics.rating')}</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rentalObjects.map((obj, index) => (
          <Table.Row key={index}>
            <Table.Cell>
              <Tag color={index < 3 ? 'success' : 'neutral'} size="sm">
                {index + 1}
              </Tag>
            </Table.Cell>
            <Table.Cell>
              <Paragraph size="sm" style={{ fontWeight: 500 }}>
                {obj.name}
              </Paragraph>
            </Table.Cell>
            <Table.Cell>{obj.bookings.toLocaleString()}</Table.Cell>
            <Table.Cell>{obj.revenue.toLocaleString()} kr</Table.Cell>
            <Table.Cell>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                <span style={{ color: 'var(--ds-color-warning-text-default)' }}>★</span>
                {obj.rating.toFixed(1)}
              </Box>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

/**
 * Booking Metrics Page Component
 */
export default function BookingMetricsPage() {
  const t = useT();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: bookingStats, isLoading: statsLoading, error: statsError } = useBookingStats();
  const { data: usageReport, isLoading: usageLoading } = useUsageReport({ period: timeRange });
  const { data: revenueReport, isLoading: revenueLoading } = useRevenueReport({ period: timeRange });
  const { data: rentalObjects, isLoading: objectsLoading } = useRentalObjects({ limit: 10 });

  const isLoading = sessionLoading || statsLoading || usageLoading || revenueLoading || objectsLoading;

  // Mock trend data for chart - in production this would come from API
  const trendData: BookingTrend[] = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
    count: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 10000) + 2000,
  }));

  // Mock category metrics - in production this would come from API
  const categoryMetrics: CategoryMetric[] = [
    { category: t('categories.sportsVenues'), bookings: 245, revenue: 89500, avgDuration: 2.5, utilizationRate: 78 },
    { category: t('categories.meetingRooms'), bookings: 189, revenue: 45200, avgDuration: 1.5, utilizationRate: 65 },
    { category: t('categories.equipment'), bookings: 156, revenue: 23400, avgDuration: 4.0, utilizationRate: 52 },
    { category: t('categories.outdoorAmenities'), bookings: 98, revenue: 34800, avgDuration: 3.0, utilizationRate: 45 },
  ];

  // Mock top rental objects - in production this would come from API
  const topRentalObjects = [
    { name: 'Idrettshall A', bookings: 156, revenue: 45600, rating: 4.8 },
    { name: 'Møterom Alpha', bookings: 134, revenue: 23400, rating: 4.6 },
    { name: 'Fotballbane 1', bookings: 98, revenue: 34500, rating: 4.7 },
    { name: 'Kulturhuset - Storsal', bookings: 87, revenue: 56700, rating: 4.9 },
    { name: 'Gymsalen', bookings: 76, revenue: 18900, rating: 4.5 },
  ];

  const maxTrendValue = Math.max(...trendData.map((d) => d.count));

  if (isLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spinner size="lg" aria-label={t('common.loading')} />
      </Box>
    );
  }

  if (statsError) {
    return (
      <Box style={{ padding: 'var(--ds-spacing-6)' }}>
        <Alert severity="danger">
          {t('monitoring.error.loadFailed')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box style={{ padding: 'var(--ds-spacing-6)' }}>
      {/* Breadcrumb */}
      <Box style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Link
          to="/monitoring"
          style={{
            color: 'var(--ds-color-accent-text-default)',
            textDecoration: 'none',
          }}
        >
          {t('monitoring.nav.backToDashboard')}
        </Link>
      </Box>

      {/* Header */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        <Box>
          <Heading level={1} size="xl">
            {t('monitoring.bookingMetrics.title')}
          </Heading>
          <Paragraph style={{ marginTop: 'var(--ds-spacing-2)' }}>
            {t('monitoring.bookingMetrics.description', {
              tenant: session?.user?.tenantName ?? t('common.unknown'),
            })}
          </Paragraph>
        </Box>
        <Box style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            style={{ minWidth: '150px' }}
          >
            <option value="7d">{t('monitoring.timeRange.7days')}</option>
            <option value="30d">{t('monitoring.timeRange.30days')}</option>
            <option value="90d">{t('monitoring.timeRange.90days')}</option>
            <option value="1y">{t('monitoring.timeRange.1year')}</option>
          </Select>
          <Button variant="secondary">
            {t('common.export')}
          </Button>
        </Box>
      </Box>

      {/* Key Stats */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        <StatCard
          label={t('monitoring.metrics.totalBookings')}
          value={bookingStats?.data?.total ?? 688}
          trend={{ direction: 'up', value: '12%' }}
        />
        <StatCard
          label={t('monitoring.metrics.totalRevenue')}
          value={`${(revenueReport?.data?.total ?? 193400).toLocaleString()} kr`}
          trend={{ direction: 'up', value: '8%' }}
        />
        <StatCard
          label={t('monitoring.metrics.avgBookingValue')}
          value={`${Math.round((revenueReport?.data?.total ?? 193400) / (bookingStats?.data?.total ?? 688)).toLocaleString()} kr`}
          trend={{ direction: 'stable', value: '0%' }}
        />
        <StatCard
          label={t('monitoring.metrics.utilizationRate')}
          value={`${usageReport?.data?.utilizationRate ?? 68}%`}
          trend={{ direction: 'up', value: '5%' }}
        />
      </Box>

      {/* Booking Trend Chart */}
      <Card style={{ padding: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.bookingMetrics.trendChart.title')}
        </Heading>
        <SimpleBarChart data={trendData} maxValue={maxTrendValue} />
      </Card>

      {/* Two column layout for tables */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        {/* Category Metrics */}
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('monitoring.bookingMetrics.byCategory')}
          </Heading>
          <CategoryMetricsTable metrics={categoryMetrics} />
        </Card>

        {/* Top Rental Objects */}
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('monitoring.bookingMetrics.topRentalObjects')}
          </Heading>
          <TopRentalObjectsTable rentalObjects={topRentalObjects} />
        </Card>
      </Box>

      {/* Booking Status Distribution */}
      <Card style={{ padding: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.bookingMetrics.statusDistribution')}
        </Heading>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <Box style={{ textAlign: 'center' }}>
            <Tag color="success" size="lg">
              {bookingStats?.data?.confirmed ?? 542}
            </Tag>
            <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
              {t('core.state.confirmed')}
            </Paragraph>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Tag color="warning" size="lg">
              {bookingStats?.data?.pending ?? 45}
            </Tag>
            <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
              {t('core.state.pending')}
            </Paragraph>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Tag color="danger" size="lg">
              {bookingStats?.data?.cancelled ?? 78}
            </Tag>
            <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
              {t('core.state.cancelled')}
            </Paragraph>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Tag color="info" size="lg">
              {bookingStats?.data?.completed ?? 23}
            </Tag>
            <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
              {t('core.state.completed')}
            </Paragraph>
          </Box>
        </Box>
      </Card>

      {/* Last Updated */}
      <Box style={{ marginTop: 'var(--ds-spacing-6)' }}>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('monitoring.lastUpdated', {
            time: new Date().toLocaleString(),
          })}
        </Paragraph>
      </Box>
    </Box>
  );
}
