import { useState } from 'react';
import { Card, Stack, Heading, Paragraph, Button, Input, Select, Badge } from '@xala/ds';
import type { ReportMetric, ReportFilter, ReportType, CreateReportTemplateDTO } from '@digilist/client-sdk';
import { MetricSelector } from './MetricSelector';
import { FilterBuilder } from './FilterBuilder';

interface CustomReportBuilderProps {
  onGenerate?: (config: CreateReportTemplateDTO) => void;
  onSaveTemplate?: (config: CreateReportTemplateDTO) => void;
}

const reportTypeLabels: Record<ReportType, string> = {
  usage: 'Bruksrapport',
  revenue: 'Inntektsrapport',
  booking: 'Bookingrapport',
  utilization: 'Utnyttelsesrapport',
  seasonal_allocation: 'Sesongtildelingsrapport',
  custom: 'Tilpasset rapport',
};

const reportTypeDescriptions: Record<ReportType, string> = {
  usage: 'Analyser bruk av lokaler og ressurser over tid',
  revenue: 'Spor inntekter fra bookinger og tildelinger',
  booking: 'Oversikt over bookinger etter status og type',
  utilization: 'Mål utnyttelsesgrad for lokaler',
  seasonal_allocation: 'Analyser sesongbaserte tildelinger',
  custom: 'Bygg en tilpasset rapport med valgfrie måleparametere og filtre',
};

export function CustomReportBuilder({ onGenerate, onSaveTemplate }: CustomReportBuilderProps) {
  // Report configuration state
  const [reportName, setReportName] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('custom');
  const [selectedMetrics, setSelectedMetrics] = useState<ReportMetric[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);

  const handleGenerateReport = () => {
    const config: CreateReportTemplateDTO = {
      name: reportName || `${reportTypeLabels[reportType]} - ${new Date().toLocaleDateString('nb-NO')}`,
      description: reportDescription,
      reportType,
      metrics: selectedMetrics,
      ...(filters.length > 0 && { filters }),
    };

    if (onGenerate) {
      onGenerate(config);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!reportName.trim()) {
      alert('Vennligst gi rapporten et navn før du lagrer den som mal.');
      return;
    }

    const config: CreateReportTemplateDTO = {
      name: reportName,
      description: reportDescription,
      reportType,
      metrics: selectedMetrics,
      ...(filters.length > 0 && { filters }),
    };

    if (onSaveTemplate) {
      onSaveTemplate(config);
    }
  };

  const isConfigValid = selectedMetrics.length > 0;

  return (
    <Stack spacing="var(--ds-spacing-3)">
      {/* Header */}
      <Card>
        <Stack spacing="var(--ds-spacing-2)">
          <div>
            <Heading level={2} data-size="md">
              Tilpasset rapportbygger
            </Heading>
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Bygg din egen rapport ved å velge rapporttype, måleparametere og filtre. Du kan generere rapporten umiddelbart eller lagre
              den som en mal for senere bruk.
            </Paragraph>
          </div>

          {/* Report Type Selector */}
          <div>
            <label
              htmlFor="report-type"
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 500,
              }}
            >
              Rapporttype
            </label>
            <Select
              id="report-type"
              value={reportType}
              onChange={(e) => {
                const newType = e.target.value as ReportType;
                setReportType(newType);
                // Reset metrics and filters when changing report type
                setSelectedMetrics([]);
                setFilters([]);
              }}
              style={{ width: '100%', maxWidth: '400px' }}
            >
              {(Object.keys(reportTypeLabels) as ReportType[]).map((type) => (
                <option key={type} value={type}>
                  {reportTypeLabels[type]}
                </option>
              ))}
            </Select>
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {reportTypeDescriptions[reportType]}
            </Paragraph>
          </div>

          {/* Report Name */}
          <div>
            <label
              htmlFor="report-name"
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 500,
              }}
            >
              Rapportnavn (valgfritt)
            </label>
            <Input
              id="report-name"
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="F.eks. Månedlig bruksrapport for kulturhuset"
              style={{ width: '100%' }}
            />
          </div>

          {/* Report Description */}
          <div>
            <label
              htmlFor="report-description"
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 500,
              }}
            >
              Beskrivelse (valgfritt)
            </label>
            <Input
              id="report-description"
              type="text"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Beskriv hva denne rapporten viser..."
              style={{ width: '100%' }}
            />
          </div>
        </Stack>
      </Card>

      {/* Metric Selector */}
      <MetricSelector selectedMetrics={selectedMetrics} onMetricsChange={setSelectedMetrics} reportType={reportType} />

      {/* Filter Builder */}
      <FilterBuilder filters={filters} onFiltersChange={setFilters} reportType={reportType} />

      {/* Configuration Preview */}
      {isConfigValid && (
        <Card style={{ backgroundColor: 'var(--ds-color-success-surface-subtle)', border: '1px solid var(--ds-color-success-border-subtle)' }}>
          <Stack spacing="var(--ds-spacing-2)">
            <Heading level={3} data-size="sm">
              Rapportkonfigurasjon
            </Heading>

            <div>
              <Paragraph data-size="sm" style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>
                Type
              </Paragraph>
              <Badge color="info">{reportTypeLabels[reportType]}</Badge>
            </div>

            <div>
              <Paragraph data-size="sm" style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>
                Måleparametere ({selectedMetrics.length})
              </Paragraph>
              <Stack direction="horizontal" spacing="var(--ds-spacing-1)" style={{ flexWrap: 'wrap' }}>
                {selectedMetrics.map((metric) => (
                  <Badge key={metric.key} color="success">
                    {metric.label}
                  </Badge>
                ))}
              </Stack>
            </div>

            {filters.length > 0 && (
              <div>
                <Paragraph data-size="sm" style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>
                  Filtre ({filters.length})
                </Paragraph>
                <Stack direction="horizontal" spacing="var(--ds-spacing-1)" style={{ flexWrap: 'wrap' }}>
                  {filters.map((filter, index) => (
                    <Badge key={index} color="neutral">
                      {filter.field}
                    </Badge>
                  ))}
                </Stack>
              </div>
            )}
          </Stack>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <Stack direction="horizontal" spacing="var(--ds-spacing-2)" style={{ justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleSaveAsTemplate} disabled={!isConfigValid || !reportName.trim()}>
            Lagre som mal
          </Button>
          <Button variant="primary" onClick={handleGenerateReport} disabled={!isConfigValid}>
            Generer rapport
          </Button>
        </Stack>

        {!isConfigValid && (
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-3)', color: 'var(--ds-color-warning-text)', textAlign: 'center' }}>
            Velg minst én måleparameter for å generere rapporten.
          </Paragraph>
        )}

        {isConfigValid && !reportName.trim() && (
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center' }}>
            Tips: Gi rapporten et navn hvis du ønsker å lagre den som mal.
          </Paragraph>
        )}
      </Card>
    </Stack>
  );
}
