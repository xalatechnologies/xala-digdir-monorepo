/**
 * ExportFormatSelector
 *
 * Component for selecting export format (PDF, Excel, CSV, JSON).
 * Displays format options with descriptions and visual feedback for selection.
 */
import * as React from 'react';
import { Card, Stack, Heading, Paragraph, Badge } from '@xala/ds';
import type { ExportFormat } from '@digilist/client-sdk';

export interface ExportFormatSelectorProps {
  /** Currently selected export format */
  selectedFormat: ExportFormat;
  /** Callback when format selection changes */
  onFormatChange: (format: ExportFormat) => void;
  /** Optional label for the selector */
  label?: string;
  /** Optional description text */
  description?: string;
}

// Define available export formats with Norwegian labels and descriptions
const EXPORT_FORMATS: Array<{
  format: ExportFormat;
  label: string;
  description: string;
  icon?: string;
}> = [
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Portable Document Format - Best for printing and sharing',
    icon: '📄',
  },
  {
    format: 'xlsx',
    label: 'Excel',
    description: 'Microsoft Excel - Best for data analysis and spreadsheets',
    icon: '📊',
  },
  {
    format: 'csv',
    label: 'CSV',
    description: 'Comma-Separated Values - Best for data import/export',
    icon: '📋',
  },
  {
    format: 'json',
    label: 'JSON',
    description: 'JavaScript Object Notation - Best for API integration',
    icon: '🔗',
  },
];

/**
 * Export format selector component.
 *
 * @example
 * ```tsx
 * <ExportFormatSelector
 *   selectedFormat={format}
 *   onFormatChange={(format) => setFormat(format)}
 * />
 * ```
 */
export function ExportFormatSelector({
  selectedFormat,
  onFormatChange,
  label = 'Velg eksportformat',
  description = 'Velg hvilket format rapporten skal eksporteres til',
}: ExportFormatSelectorProps): React.ReactElement {
  return (
    <Card>
      <Stack spacing={16}>
        <div>
          <Heading level={3} data-size="sm">
            {label}
          </Heading>
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {description}
          </Paragraph>
        </div>

        <Stack spacing={12}>
          {EXPORT_FORMATS.map((formatOption) => {
            const isSelected = selectedFormat === formatOption.format;

            return (
              <div
                key={formatOption.format}
                style={{
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-medium)',
                  border: isSelected
                    ? '2px solid var(--ds-color-accent-border-strong)'
                    : '1px solid var(--ds-color-neutral-border-subtle)',
                  backgroundColor: isSelected ? 'var(--ds-color-accent-surface-subtle)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onFormatChange(formatOption.format)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onFormatChange(formatOption.format);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`Velg ${formatOption.label} format`}
              >
                <Stack direction="horizontal" spacing={12} style={{ alignItems: 'center' }}>
                  {formatOption.icon && (
                    <div
                      style={{
                        fontSize: '24px',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {formatOption.icon}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <Stack direction="horizontal" spacing={8} style={{ alignItems: 'center', marginBottom: 'var(--ds-spacing-1)' }}>
                      <Paragraph data-size="md" style={{ fontWeight: 600, margin: 0 }}>
                        {formatOption.label}
                      </Paragraph>
                      {isSelected && (
                        <Badge color="success">
                          Valgt
                        </Badge>
                      )}
                    </Stack>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      {formatOption.description}
                    </Paragraph>
                  </div>
                </Stack>
              </div>
            );
          })}
        </Stack>

        {selectedFormat && (
          <div
            style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-info-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-medium)',
              borderLeft: '4px solid var(--ds-color-info-border-strong)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
              Rapporten vil bli eksportert som{' '}
              <strong>{EXPORT_FORMATS.find((f) => f.format === selectedFormat)?.label}</strong>
            </Paragraph>
          </div>
        )}
      </Stack>
    </Card>
  );
}
