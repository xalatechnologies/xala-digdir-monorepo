import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
} from '@xalatechnologies/platform/ui';
import { BarChart, VerticalBarChart } from '../../src/blocks/BarChart';
import { HeatmapChart, CompactHeatmap } from '../../src/blocks/HeatmapChart';
import type { BarChartDataItem } from '../../src/blocks/BarChart';
import type { HeatmapCell } from '../../src/blocks/HeatmapChart';

/**
 * Chart components for data visualization.
 *
 * ## Components
 * - **BarChart**: Horizontal bar chart
 * - **VerticalBarChart**: Vertical bar chart
 * - **HeatmapChart**: Grid-based heatmap
 * - **CompactHeatmap**: Compact heatmap without labels
 *
 * ## Features
 * - Configurable colors and dimensions
 * - Value formatting
 * - Interactive cell clicks (heatmap)
 * - Follows Digdir design tokens
 */
const meta: Meta<typeof BarChart> = {
  title: 'Blocks/Charts',
  component: BarChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Chart components for analytics and data visualization in admin dashboards.

## Use Cases
- Booking statistics
- Usage metrics
- Occupancy heatmaps
- Performance analytics
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

// =============================================================================
// Sample Data
// =============================================================================

const bookingsByCategory: BarChartDataItem[] = [
  { label: 'Idrettshall', value: 245 },
  { label: 'Møterom', value: 189 },
  { label: 'Kulturlokale', value: 156 },
  { label: 'Svømmehall', value: 98 },
  { label: 'Klasserom', value: 67 },
];

const bookingsByMonth: BarChartDataItem[] = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 56 },
  { label: 'Mar', value: 78 },
  { label: 'Apr', value: 65 },
  { label: 'Mai', value: 89 },
  { label: 'Jun', value: 95 },
];

const weekdayLabels = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const hourLabels = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];

// Generate sample heatmap data (bookings by day and hour)
const generateHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = [];
  weekdayLabels.forEach((day) => {
    hourLabels.forEach((hour) => {
      const isWeekend = day === 'Lør' || day === 'Søn';
      const isPeakHour = Number(hour) >= 16 && Number(hour) <= 20;
      const baseValue = isWeekend ? 8 : 15;
      const peakBonus = isPeakHour ? 10 : 0;
      const randomVariation = Math.floor(Math.random() * 8);
      const value = baseValue + peakBonus + randomVariation;

      data.push({
        row: day,
        col: hour,
        value,
        tooltip: `${day} kl. ${hour}:00 - ${value} bookinger`,
      });
    });
  });
  return data;
};

const heatmapData = generateHeatmapData();

// =============================================================================
// Horizontal Bar Chart Stories
// =============================================================================

/**
 * Horizontal bar chart
 */
export const HorizontalBarDefault: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '500px' }}>
      <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
        Bookinger per kategori
      </Heading>
      <BarChart
        data={bookingsByCategory}
        showValues={true}
        labelWidth="100px"
      />
    </Card>
  ),
};

/**
 * Bar chart with custom colors
 */
export const HorizontalBarCustomColors: Story = {
  render: () => {
    const dataWithColors: BarChartDataItem[] = [
      { label: 'Bekreftet', value: 156, color: 'var(--ds-color-success-base-default)' },
      { label: 'Venter', value: 42, color: 'var(--ds-color-warning-base-default)' },
      { label: 'Kansellert', value: 23, color: 'var(--ds-color-danger-base-default)' },
    ];

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '400px' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Bookingstatus
        </Heading>
        <BarChart
          data={dataWithColors}
          showValues={true}
          labelWidth="80px"
        />
      </Card>
    );
  },
};

/**
 * Bar chart with formatted values
 */
export const HorizontalBarFormatted: Story = {
  render: () => {
    const revenueData: BarChartDataItem[] = [
      { label: 'Januar', value: 125000 },
      { label: 'Februar', value: 98000 },
      { label: 'Mars', value: 145000 },
      { label: 'April', value: 132000 },
      { label: 'Mai', value: 167000 },
    ];

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '500px' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Månedlig omsetning
        </Heading>
        <BarChart
          data={revenueData}
          showValues={true}
          valueWidth="80px"
          formatValue={(v) => `${(v / 1000).toFixed(0)}k kr`}
        />
      </Card>
    );
  },
};

/**
 * Bar chart without values
 */
export const HorizontalBarNoValues: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-5)', maxWidth: '400px' }}>
      <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
        Popularitet
      </Heading>
      <BarChart
        data={bookingsByCategory.slice(0, 3)}
        showValues={false}
        barHeight="16px"
      />
    </Card>
  ),
};

// =============================================================================
// Vertical Bar Chart Stories
// =============================================================================

/**
 * Vertical bar chart
 */
export const VerticalBarDefault: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
        Bookinger per måned
      </Heading>
      <VerticalBarChart
        data={bookingsByMonth}
        height="200px"
        barWidth="48px"
      />
    </Card>
  ),
};

/**
 * Vertical bar chart with custom colors
 */
export const VerticalBarCustomColors: Story = {
  render: () => {
    const weeklyData: BarChartDataItem[] = [
      { label: 'Man', value: 24, color: 'var(--ds-color-accent-base-default)' },
      { label: 'Tir', value: 32, color: 'var(--ds-color-accent-base-default)' },
      { label: 'Ons', value: 28, color: 'var(--ds-color-accent-base-default)' },
      { label: 'Tor', value: 35, color: 'var(--ds-color-accent-base-default)' },
      { label: 'Fre', value: 42, color: 'var(--ds-color-success-base-default)' },
      { label: 'Lør', value: 18, color: 'var(--ds-color-neutral-text-subtle)' },
      { label: 'Søn', value: 12, color: 'var(--ds-color-neutral-text-subtle)' },
    ];

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Bookinger per ukedag
        </Heading>
        <VerticalBarChart
          data={weeklyData}
          height="180px"
          barWidth="40px"
        />
      </Card>
    );
  },
};

/**
 * Compact vertical bar chart
 */
export const VerticalBarCompact: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-4)', display: 'inline-block' }}>
      <Heading level={4} data-size="xs" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
        Siste 7 dager
      </Heading>
      <VerticalBarChart
        data={[
          { label: 'M', value: 12 },
          { label: 'T', value: 18 },
          { label: 'O', value: 15 },
          { label: 'T', value: 22 },
          { label: 'F', value: 28 },
          { label: 'L', value: 8 },
          { label: 'S', value: 5 },
        ]}
        height="100px"
        barWidth="24px"
        gap="var(--ds-spacing-1)"
        showValues={false}
      />
    </Card>
  ),
};

// =============================================================================
// Heatmap Chart Stories
// =============================================================================

/**
 * Heatmap chart with labels
 */
export const HeatmapDefault: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
        Bookinger per tid og dag
      </Heading>
      <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0', color: 'var(--ds-color-neutral-text-subtle)' }}>
        Viser beleggsgrad for lokaler fordelt på ukedag og tidspunkt
      </Paragraph>
      <HeatmapChart
        data={heatmapData}
        rowLabels={weekdayLabels}
        colLabels={hourLabels}
        cellWidth="36px"
        cellHeight="32px"
        labelWidth="50px"
      />
    </Card>
  ),
};

/**
 * Heatmap with values
 */
export const HeatmapWithValues: Story = {
  render: () => {
    const simpleData: HeatmapCell[] = [
      { row: 'Man', col: '09', value: 12 },
      { row: 'Man', col: '12', value: 8 },
      { row: 'Man', col: '15', value: 18 },
      { row: 'Tir', col: '09', value: 15 },
      { row: 'Tir', col: '12', value: 10 },
      { row: 'Tir', col: '15', value: 22 },
      { row: 'Ons', col: '09', value: 9 },
      { row: 'Ons', col: '12', value: 14 },
      { row: 'Ons', col: '15', value: 20 },
    ];

    return (
      <Card style={{ padding: 'var(--ds-spacing-5)', display: 'inline-block' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Belegg (med verdier)
        </Heading>
        <HeatmapChart
          data={simpleData}
          rowLabels={['Man', 'Tir', 'Ons']}
          colLabels={['09', '12', '15']}
          cellWidth="60px"
          cellHeight="48px"
          showValues={true}
        />
      </Card>
    );
  },
};

/**
 * Interactive heatmap
 */
export const HeatmapInteractive: Story = {
  render: () => {
    const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
            Klikk på en celle for detaljer
          </Heading>
          <HeatmapChart
            data={heatmapData}
            rowLabels={weekdayLabels}
            colLabels={hourLabels}
            cellWidth="36px"
            cellHeight="32px"
            labelWidth="50px"
            onCellClick={setSelectedCell}
          />
        </Card>

        {selectedCell && (
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
              Valgt celle
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              <strong>{selectedCell.row}</strong> kl. <strong>{selectedCell.col}:00</strong> - {selectedCell.value} bookinger
            </Paragraph>
          </Card>
        )}
      </div>
    );
  },
};

/**
 * Heatmap with custom color
 */
export const HeatmapCustomColor: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
        Inntekter per tidspunkt
      </Heading>
      <HeatmapChart
        data={heatmapData}
        rowLabels={weekdayLabels}
        colLabels={hourLabels}
        cellWidth="36px"
        cellHeight="32px"
        labelWidth="50px"
        heatColor="var(--ds-color-success-base-default)"
      />
    </Card>
  ),
};

// =============================================================================
// Compact Heatmap Stories
// =============================================================================

/**
 * Compact heatmap (sparkline style)
 */
export const CompactHeatmapDefault: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-4)', display: 'inline-block' }}>
      <Heading level={4} data-size="xs" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
        Aktivitet siste uke
      </Heading>
      <CompactHeatmap
        data={heatmapData}
        rowLabels={weekdayLabels}
        colLabels={hourLabels.slice(0, 8)}
        cellSize="12px"
        gap="2px"
      />
    </Card>
  ),
};

/**
 * GitHub-style contribution heatmap
 */
export const CompactHeatmapContributions: Story = {
  render: () => {
    // Generate 52 weeks x 7 days of data
    const weeks = Array.from({ length: 12 }, (_, i) => `Uke ${i + 1}`);
    const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    const contributionData: HeatmapCell[] = [];

    weeks.forEach((week) => {
      days.forEach((day) => {
        const value = Math.floor(Math.random() * 10);
        contributionData.push({
          row: day,
          col: week,
          value,
          tooltip: `${day}, ${week}: ${value} aktiviteter`,
        });
      });
    });

    return (
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={4} data-size="xs" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
          Aktivitetsoversikt
        </Heading>
        <CompactHeatmap
          data={contributionData}
          rowLabels={days}
          colLabels={weeks}
          cellSize="14px"
          gap="2px"
          heatColor="var(--ds-color-success-base-default)"
        />
      </Card>
    );
  },
};

// =============================================================================
// Dashboard Example
// =============================================================================

/**
 * Charts in dashboard context
 */
export const DashboardExample: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
      {/* Bar Chart */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Topp 5 lokaler
        </Heading>
        <BarChart
          data={bookingsByCategory}
          showValues={true}
          labelWidth="100px"
        />
      </Card>

      {/* Vertical Bar Chart */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Månedlig trend
        </Heading>
        <VerticalBarChart
          data={bookingsByMonth}
          height="180px"
          barWidth="36px"
        />
      </Card>

      {/* Heatmap - Full width */}
      <Card style={{ padding: 'var(--ds-spacing-5)', gridColumn: '1 / -1' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Beleggskalender
        </Heading>
        <HeatmapChart
          data={heatmapData}
          rowLabels={weekdayLabels}
          colLabels={hourLabels}
          cellWidth="40px"
          cellHeight="32px"
          labelWidth="50px"
        />
      </Card>
    </div>
  ),
};
