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
      <Stack direction="horizontal" spacing={12} style={{ justifyContent: 'center', padding: '3rem' }}>
        <Spinner />
        <Paragraph>Laster maler...</Paragraph>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Card>
        <Heading level={3}>
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
        <Heading level={3}>
          Ingen maler tilgjengelig
        </Heading>
        <Paragraph>Det finnes ingen forhåndsdefinerte rapportmaler.</Paragraph>
      </Card>
    );
  }

  return (
    <div>
      <Heading level={2} style={{ marginBottom: '1.5rem' }}>
        Velg rapportmal
      </Heading>
      <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" spacing={16}>
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
              <Stack spacing={12}>
                <Stack direction="horizontal" spacing={8} style={{ alignItems: 'center' }}>
                  <Heading level={3}>
                    {template.name}
                  </Heading>
                  <Badge color={REPORT_TYPE_COLORS[template.reportType] || 'info'}>
                    {REPORT_TYPE_LABELS[template.reportType] || template.reportType}
                  </Badge>
                </Stack>

                {template.description && <Paragraph>{template.description}</Paragraph>}

                <Stack spacing={8}>
                  <Paragraph style={{ fontWeight: 500 }}>
                    Beregninger:
                  </Paragraph>
                  <Stack spacing={4}>
                    {template.metrics.slice(0, 3).map((metric, index) => (
                      <Paragraph key={index} style={{ color: 'var(--ds-color-text-subtle)' }}>
                        • {metric.label}
                      </Paragraph>
                    ))}
                    {template.metrics.length > 3 && (
                      <Paragraph style={{ color: 'var(--ds-color-text-subtle)' }}>
                        + {template.metrics.length - 3} mer
                      </Paragraph>
                    )}
                  </Stack>
                </Stack>

                {template.filters && template.filters.length > 0 && (
                  <Paragraph style={{ color: 'var(--ds-color-text-subtle)' }}>
                    {template.filters.length} filter(e) aktive
                  </Paragraph>
                )}

                <Button
                  variant={isSelected ? 'primary' : 'secondary'}
                 
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
