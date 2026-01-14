/**
 * Export Dialog
 * Main export UI with format, filters, and date range options
 */

import { useState } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Stack,
  Radio,
  Label,
  Dropdown,
  Alert,
} from '@xala/ds';
import {
  useExportReport,
  type ExportFormat,
  type ReportPeriod,
} from '@digilist/client-sdk';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'usage' | 'revenue' | 'bookings' | 'heatmap' | 'seasonal';
  onExportStart?: (jobId: string) => void;
}

// Export format options
const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  {
    value: 'pdf',
    label: 'PDF',
    description: 'Egnet for utskrift og visning',
  },
  {
    value: 'xlsx',
    label: 'Excel (XLSX)',
    description: 'Egnet for videre analyse i Excel',
  },
  {
    value: 'csv',
    label: 'CSV',
    description: 'Kommaseparerte verdier for dataimport',
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Strukturert data for API-integrasjoner',
  },
];

// Period options
const PERIOD_OPTIONS = [
  { id: 'day', label: 'Dag' },
  { id: 'week', label: 'Uke' },
  { id: 'month', label: 'Måned' },
  { id: 'quarter', label: 'Kvartal' },
  { id: 'year', label: 'År' },
];

// Filter options
const FACILITY_OPTIONS = [
  { id: 'all', label: 'Alle lokaler' },
  { id: 'facility-1', label: 'Møterom A' },
  { id: 'facility-2', label: 'Konferansesal B' },
  { id: 'facility-3', label: 'Fellesareal C' },
];

const ORGANIZATION_OPTIONS = [
  { id: 'all', label: 'Alle organisasjoner' },
  { id: 'org-1', label: 'Kulturhuset' },
  { id: 'org-2', label: 'Idrettslaget' },
  { id: 'org-3', label: 'Frivilligsentralen' },
];

const BOOKING_TYPE_OPTIONS = [
  { id: 'all', label: 'Alle typer' },
  { id: 'meeting', label: 'Møte' },
  { id: 'event', label: 'Arrangement' },
  { id: 'training', label: 'Trening' },
  { id: 'other', label: 'Annet' },
];

// Report type labels
const REPORT_TYPE_LABELS: Record<string, string> = {
  usage: 'Bruksrapport',
  revenue: 'Omsetningsrapport',
  bookings: 'Bookingstatistikk',
  heatmap: 'Booking-heatmap',
  seasonal: 'Sesongrapport',
};

/**
 * ExportDialog component
 *
 * Provides a comprehensive export interface with options for:
 * - Export format selection (PDF, Excel, CSV, JSON)
 * - Date range configuration
 * - Filter options (facility, organization, booking type)
 * - Period grouping
 */
export function ExportDialog({
  isOpen,
  onClose,
  reportType,
  onExportStart,
}: ExportDialogProps) {
  // Export format state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');

  // Date range state
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  // Period state
  const [period, setPeriod] = useState<ReportPeriod>('month');

  // Filter state
  const [facilityId, setFacilityId] = useState<string>('all');
  const [organizationId, setOrganizationId] = useState<string>('all');
  const [bookingType, setBookingType] = useState<string>('all');

  // Export mutation
  const exportReport = useExportReport();

  // Handle export
  const handleExport = () => {
    exportReport.mutate(
      {
        type: reportType,
        format: selectedFormat,
        params: {
          period,
          ...(dateRange.startDate && { startDate: dateRange.startDate }),
          ...(dateRange.endDate && { endDate: dateRange.endDate }),
          ...(facilityId !== 'all' && { facilityId }),
          ...(organizationId !== 'all' && { organizationId }),
          ...(bookingType !== 'all' && { bookingType }),
        },
      },
      {
        onSuccess: (data: any) => {
          // Call onExportStart with jobId if provided
          // Note: Current SDK returns Blob directly for sync exports
          // TODO: Update when SDK supports async exports with job IDs
          if (onExportStart && data?.jobId) {
            onExportStart(data.jobId);
          }
          // Close dialog after export initiated
          onClose();
        },
      }
    );
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setSelectedFormat('pdf');
    setPeriod('month');
    setFacilityId('all');
    setOrganizationId('all');
    setBookingType('all');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <Dialog.Block>
        <Stack spacing={16}>
          {/* Header */}
          <div>
            <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Eksporter rapport
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {REPORT_TYPE_LABELS[reportType]}
            </Paragraph>
          </div>

          {/* Info alert */}
          <Alert data-color="info">
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              Rapporten vil bli generert i bakgrunnen. Du kan fortsette å jobbe mens den behandles.
            </Paragraph>
          </Alert>

          {/* Format Selection */}
          <div>
            <Label htmlFor="format-selection" style={{ marginBottom: 'var(--ds-spacing-3)', display: 'block' }}>
              Velg format
            </Label>
            <Stack spacing={12}>
              {FORMAT_OPTIONS.map((format) => (
                <div
                  key={format.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: selectedFormat === format.value
                      ? 'var(--ds-color-accent-surface-subtle)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedFormat(format.value)}
                >
                  <Radio
                    name="format"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={() => setSelectedFormat(format.value)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {format.label}
                    </div>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {format.description}
                    </Paragraph>
                  </div>
                </div>
              ))}
            </Stack>
          </div>

          {/* Date Range */}
          <div>
            <Label style={{ marginBottom: 'var(--ds-spacing-3)', display: 'block' }}>
              Datoperiode
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ flex: 1 }}>
                <Label htmlFor="start-date" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', display: 'block' }}>
                  Fra
                </Label>
                <input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label htmlFor="end-date" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', display: 'block' }}>
                  Til
                </Label>
                <input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Period Selection */}
          <div>
            <Label style={{ marginBottom: 'var(--ds-spacing-3)', display: 'block' }}>
              Grupperingsperiode
            </Label>
            <Dropdown
              items={PERIOD_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
                onSelect: () => setPeriod(opt.id as ReportPeriod),
              }))}
              label={PERIOD_OPTIONS.find((opt) => opt.id === period)?.label || 'Velg periode'}
              data-size="md"
            />
          </div>

          {/* Filters */}
          <div>
            <Label style={{ marginBottom: 'var(--ds-spacing-3)', display: 'block' }}>
              Filtre
            </Label>
            <Stack spacing={12}>
              <div>
                <Label htmlFor="facility-filter" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', display: 'block' }}>
                  Lokale
                </Label>
                <Dropdown
                  items={FACILITY_OPTIONS.map((opt) => ({
                    id: opt.id,
                    label: opt.label,
                    onSelect: () => setFacilityId(opt.id),
                  }))}
                  label={FACILITY_OPTIONS.find((opt) => opt.id === facilityId)?.label || 'Velg lokale'}
                  data-size="md"
                />
              </div>

              <div>
                <Label htmlFor="organization-filter" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', display: 'block' }}>
                  Organisasjon
                </Label>
                <Dropdown
                  items={ORGANIZATION_OPTIONS.map((opt) => ({
                    id: opt.id,
                    label: opt.label,
                    onSelect: () => setOrganizationId(opt.id),
                  }))}
                  label={ORGANIZATION_OPTIONS.find((opt) => opt.id === organizationId)?.label || 'Velg organisasjon'}
                  data-size="md"
                />
              </div>

              <div>
                <Label htmlFor="booking-type-filter" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)', display: 'block' }}>
                  Bookingtype
                </Label>
                <Dropdown
                  items={BOOKING_TYPE_OPTIONS.map((opt) => ({
                    id: opt.id,
                    label: opt.label,
                    onSelect: () => setBookingType(opt.id),
                  }))}
                  label={BOOKING_TYPE_OPTIONS.find((opt) => opt.id === bookingType)?.label || 'Velg type'}
                  data-size="md"
                />
              </div>
            </Stack>
          </div>
        </Stack>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={exportReport.isPending}
          >
            Avbryt
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleExport}
            disabled={exportReport.isPending}
          >
            {exportReport.isPending ? 'Starter eksport...' : 'Eksporter'}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
