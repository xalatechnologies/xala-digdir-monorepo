import type { MouseEvent } from 'react';
import { Card, Stack, Heading, Badge, Paragraph, Button } from '@xala/ds';
import type { ReportTemplate } from '@digilist/client-sdk';

interface ReportTemplateCardProps {
  template: ReportTemplate;
  isSelected?: boolean;
  onClick?: (template: ReportTemplate) => void;
  onAction?: (template: ReportTemplate) => void;
  actionLabel?: string;
  showActionButton?: boolean;
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

export function ReportTemplateCard({
  template,
  isSelected = false,
  onClick,
  onAction,
  actionLabel = 'Velg mal',
  showActionButton = true,
}: ReportTemplateCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(template);
    }
  };

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(template);
    } else if (onClick) {
      onClick(template);
    }
  };

  return (
    <Card
      style={{
        cursor: onClick ? 'pointer' : undefined,
        border: isSelected ? '2px solid var(--ds-color-accent-border-default)' : undefined,
        backgroundColor: isSelected ? 'var(--ds-color-accent-surface-subtle)' : undefined,
      }}
      onClick={handleCardClick}
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

        {showActionButton && (
          <Button
            variant={isSelected ? 'primary' : 'secondary'}
           
            onClick={handleActionClick}
          >
            {isSelected ? 'Valgt' : actionLabel}
          </Button>
        )}
      </Stack>
    </Card>
  );
}
