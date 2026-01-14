import { useState } from 'react';
import { Card, Grid, Heading, Paragraph, Button, Badge, Spinner, Stack } from '@xala/ds';
import { useSystemReportTemplates, type ReportTemplate } from '@digilist/client-sdk';

interface ReportTemplateSelectorProps {
  onSelect?: (template: ReportTemplate) => void;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  usage: 'Bruk',
  revenue: 'Inntekter',
  booking: 'Bookinger',
  utilization: 'Utnyttelse',
  seasonal_allocation: 'Sesongfordeling',
  custom: 'Egendefinert',
};

const REPORT_TYPE_COLORS: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  usage: 'info',
  revenue: 'success',
  booking: 'info',
  utilization: 'warning',
  seasonal_allocation: 'info',
  custom: 'info',
};

export function ReportTemplateSelector({ onSelect }: ReportTemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: templates, isLoading, isError, error } = useSystemReportTemplates();

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedId(template.id);
    onSelect?.(template);
  };

  if (isLoading) {
    return (
      <Stack direction="row" gap={12} style={{ justifyContent: 'center', padding: '3rem' }}>
        <Spinner />
        <Paragraph>Laster maler...</Paragraph>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Card>
        <Heading level={3} size="sm">
          Kunne ikke laste maler
        </Heading>
        <Paragraph>{error instanceof Error ? error.message : 'En ukjent feil oppstod'}</Paragraph>
      </Card>
    );
  }

  const templateList = Array.isArray(templates?.data) ? templates.data : [];

  if (templateList.length === 0) {
    return (
      <Card>
        <Heading level={3} size="sm">
          Ingen maler tilgjengelig
        </Heading>
        <Paragraph>Det finnes ingen forhåndsdefinerte rapportmaler.</Paragraph>
      </Card>
    );
  }

  return (
    <div>
      <Heading level={2} size="md" style={{ marginBottom: '1.5rem' }}>
        Velg rapportmal
      </Heading>
      <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap={16}>
        {templateList.map((template) => {
          const isSelected = selectedId === template.id;
          return (
            <Card
              key={template.id}
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--ds-color-accent-border-default)' : undefined,
                backgroundColor: isSelected
                  ? 'var(--ds-color-accent-surface-subtle)'
                  : undefined,
              }}
              onClick={() => handleSelectTemplate(template)}
            >
              <Stack gap={12}>
                <Stack direction="row" gap={8} style={{ alignItems: 'center' }}>
                  <Heading level={3} size="sm">
                    {template.name}
                  </Heading>
                  <Badge color={REPORT_TYPE_COLORS[template.reportType] || 'info'}>
                    {REPORT_TYPE_LABELS[template.reportType] || template.reportType}
                  </Badge>
                </Stack>

                {template.description && <Paragraph size="sm">{template.description}</Paragraph>}

                <Stack gap={8}>
                  <Paragraph size="sm" style={{ fontWeight: 500 }}>
                    Beregninger:
                  </Paragraph>
                  <Stack gap={4}>
                    {template.metrics.slice(0, 3).map((metric, index) => (
                      <Paragraph key={index} size="sm" style={{ color: 'var(--ds-color-text-subtle)' }}>
                        • {metric.label}
                      </Paragraph>
                    ))}
                    {template.metrics.length > 3 && (
                      <Paragraph size="sm" style={{ color: 'var(--ds-color-text-subtle)' }}>
                        + {template.metrics.length - 3} mer
                      </Paragraph>
                    )}
                  </Stack>
                </Stack>

                {template.filters && template.filters.length > 0 && (
                  <Paragraph size="sm" style={{ color: 'var(--ds-color-text-subtle)' }}>
                    {template.filters.length} filter(e) aktive
                  </Paragraph>
                )}

                <Button
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template);
                  }}
                >
                  {isSelected ? 'Valgt' : 'Velg mal'}
                </Button>
              </Stack>
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
