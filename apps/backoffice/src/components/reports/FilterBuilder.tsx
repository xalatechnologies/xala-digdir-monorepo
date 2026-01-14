import { useState } from 'react';
import { Card, Stack, Heading, Paragraph, Button, Badge, Select, Input } from '@xala/ds';
import type { ReportFilter } from '@digilist/client-sdk';

interface FilterBuilderProps {
  filters: ReportFilter[];
  onFiltersChange: (filters: ReportFilter[]) => void;
  reportType?: 'usage' | 'revenue' | 'booking' | 'utilization' | 'seasonal_allocation' | 'custom';
}

// Define available filter fields for different report types
interface FilterFieldDefinition {
  field: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'date';
  options?: Array<{ value: string; label: string }>;
  operators?: Array<'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between'>;
}

const FILTER_FIELDS: Record<string, FilterFieldDefinition[]> = {
  usage: [
    {
      field: 'facilityId',
      label: 'Lokale',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'facility-1', label: 'Møterom A' },
        { value: 'facility-2', label: 'Konferansesal B' },
        { value: 'facility-3', label: 'Fellesareal C' },
      ],
    },
    {
      field: 'organizationId',
      label: 'Organisasjon',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'org-1', label: 'Kulturhuset' },
        { value: 'org-2', label: 'Idrettslaget' },
        { value: 'org-3', label: 'Frivilligsentralen' },
      ],
    },
    {
      field: 'bookingType',
      label: 'Bookingtype',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'meeting', label: 'Møte' },
        { value: 'event', label: 'Arrangement' },
        { value: 'training', label: 'Trening' },
        { value: 'other', label: 'Annet' },
      ],
    },
    { field: 'startDate', label: 'Fra dato', type: 'date', operators: ['gte', 'eq'] },
    { field: 'endDate', label: 'Til dato', type: 'date', operators: ['lte', 'eq'] },
    { field: 'minHours', label: 'Min timer', type: 'number', operators: ['gte', 'gt'] },
  ],
  revenue: [
    {
      field: 'facilityId',
      label: 'Lokale',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'facility-1', label: 'Møterom A' },
        { value: 'facility-2', label: 'Konferansesal B' },
        { value: 'facility-3', label: 'Fellesareal C' },
      ],
    },
    {
      field: 'organizationId',
      label: 'Organisasjon',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'org-1', label: 'Kulturhuset' },
        { value: 'org-2', label: 'Idrettslaget' },
        { value: 'org-3', label: 'Frivilligsentralen' },
      ],
    },
    { field: 'startDate', label: 'Fra dato', type: 'date', operators: ['gte', 'eq'] },
    { field: 'endDate', label: 'Til dato', type: 'date', operators: ['lte', 'eq'] },
    { field: 'minRevenue', label: 'Min inntekt', type: 'number', operators: ['gte', 'gt'] },
    { field: 'maxRevenue', label: 'Maks inntekt', type: 'number', operators: ['lte', 'lt'] },
  ],
  booking: [
    {
      field: 'facilityId',
      label: 'Lokale',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'facility-1', label: 'Møterom A' },
        { value: 'facility-2', label: 'Konferansesal B' },
        { value: 'facility-3', label: 'Fellesareal C' },
      ],
    },
    {
      field: 'organizationId',
      label: 'Organisasjon',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'org-1', label: 'Kulturhuset' },
        { value: 'org-2', label: 'Idrettslaget' },
        { value: 'org-3', label: 'Frivilligsentralen' },
      ],
    },
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'confirmed', label: 'Bekreftet' },
        { value: 'pending', label: 'Venter' },
        { value: 'cancelled', label: 'Kansellert' },
      ],
    },
    {
      field: 'bookingType',
      label: 'Bookingtype',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'meeting', label: 'Møte' },
        { value: 'event', label: 'Arrangement' },
        { value: 'training', label: 'Trening' },
        { value: 'other', label: 'Annet' },
      ],
    },
    { field: 'startDate', label: 'Fra dato', type: 'date', operators: ['gte', 'eq'] },
    { field: 'endDate', label: 'Til dato', type: 'date', operators: ['lte', 'eq'] },
  ],
  utilization: [
    {
      field: 'facilityId',
      label: 'Lokale',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'facility-1', label: 'Møterom A' },
        { value: 'facility-2', label: 'Konferansesal B' },
        { value: 'facility-3', label: 'Fellesareal C' },
      ],
    },
    { field: 'startDate', label: 'Fra dato', type: 'date', operators: ['gte', 'eq'] },
    { field: 'endDate', label: 'Til dato', type: 'date', operators: ['lte', 'eq'] },
    { field: 'minUtilization', label: 'Min utnyttelse (%)', type: 'number', operators: ['gte', 'gt'] },
    { field: 'maxUtilization', label: 'Maks utnyttelse (%)', type: 'number', operators: ['lte', 'lt'] },
  ],
  seasonal_allocation: [
    {
      field: 'organizationId',
      label: 'Organisasjon',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'org-1', label: 'Kulturhuset' },
        { value: 'org-2', label: 'Idrettslaget' },
        { value: 'org-3', label: 'Frivilligsentralen' },
      ],
    },
    { field: 'startDate', label: 'Fra dato', type: 'date', operators: ['gte', 'eq'] },
    { field: 'endDate', label: 'Til dato', type: 'date', operators: ['lte', 'eq'] },
    { field: 'season', label: 'Sesong', type: 'text', operators: ['eq'] },
  ],
  custom: [
    {
      field: 'facilityId',
      label: 'Lokale',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'facility-1', label: 'Møterom A' },
        { value: 'facility-2', label: 'Konferansesal B' },
        { value: 'facility-3', label: 'Fellesareal C' },
      ],
    },
    {
      field: 'organizationId',
      label: 'Organisasjon',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'org-1', label: 'Kulturhuset' },
        { value: 'org-2', label: 'Idrettslaget' },
        { value: 'org-3', label: 'Frivilligsentralen' },
      ],
    },
    {
      field: 'bookingType',
      label: 'Bookingtype',
      type: 'select',
      operators: ['eq', 'in'],
      options: [
        { value: 'meeting', label: 'Møte' },
        { value: 'event', label: 'Arrangement' },
        { value: 'training', label: 'Trening' },
        { value: 'other', label: 'Annet' },
      ],
    },
    { field: 'startDate', label: 'Fra dato', type: 'date', operators: ['gte', 'eq'] },
    { field: 'endDate', label: 'Til dato', type: 'date', operators: ['lte', 'eq'] },
  ],
};

const operatorLabels: Record<string, string> = {
  eq: 'Lik',
  ne: 'Ikke lik',
  gt: 'Større enn',
  gte: 'Større eller lik',
  lt: 'Mindre enn',
  lte: 'Mindre eller lik',
  in: 'I liste',
  between: 'Mellom',
};

export function FilterBuilder({ filters, onFiltersChange, reportType = 'custom' }: FilterBuilderProps) {
  const availableFields = FILTER_FIELDS[reportType] || FILTER_FIELDS.custom;

  // State for building a new filter
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('eq');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleAddFilter = () => {
    if (!selectedField || !filterValue || !availableFields) return;

    const fieldDef = availableFields.find((f) => f.field === selectedField);
    if (!fieldDef) return;

    const newFilter: ReportFilter = {
      field: selectedField,
      operator: selectedOperator as ReportFilter['operator'],
      value: fieldDef.type === 'number' ? Number(filterValue) : filterValue,
    };

    onFiltersChange([...filters, newFilter]);

    // Reset form
    setSelectedField('');
    setSelectedOperator('eq');
    setFilterValue('');
  };

  const handleRemoveFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const getFieldLabel = (field: string): string => {
    if (!availableFields) return field;
    const fieldDef = availableFields.find((f) => f.field === field);
    return fieldDef?.label || field;
  };

  const getValueLabel = (filter: ReportFilter): string => {
    if (!availableFields) return String(filter.value);
    const fieldDef = availableFields.find((f) => f.field === filter.field);

    if (fieldDef?.type === 'select' && fieldDef.options) {
      const option = fieldDef.options.find((opt) => opt.value === filter.value);
      return option?.label || String(filter.value);
    }

    if (Array.isArray(filter.value)) {
      return filter.value.join(', ');
    }

    return String(filter.value);
  };

  const selectedFieldDef = availableFields?.find((f) => f.field === selectedField);
  const availableOperators = selectedFieldDef?.operators || ['eq'];

  return (
    <Card>
      <Stack gap={16}>
        <div>
          <Heading level={3} data-size="sm">
            Konfigurer filtre
          </Heading>
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Legg til filtre for å begrense hvilke data som inkluderes i rapporten.
          </Paragraph>
        </div>

        {/* Active filters display */}
        {filters.length > 0 && (
          <div>
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
              Aktive filtre ({filters.length})
            </Paragraph>
            <Stack gap={8}>
              {filters.map((filter, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-medium)',
                    backgroundColor: 'var(--ds-color-info-surface-subtle)',
                    border: '1px solid var(--ds-color-info-border-subtle)',
                  }}
                >
                  <Badge color="info" size="sm">
                    {getFieldLabel(filter.field)}
                  </Badge>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {operatorLabels[filter.operator]}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500, flex: 1 }}>
                    {getValueLabel(filter)}
                  </Paragraph>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => handleRemoveFilter(index)}
                    aria-label={`Fjern filter: ${getFieldLabel(filter.field)}`}
                  >
                    Fjern
                  </Button>
                </div>
              ))}
            </Stack>
          </div>
        )}

        {/* Add new filter form */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            borderRadius: 'var(--ds-border-radius-medium)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          }}
        >
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Legg til nytt filter
          </Heading>

          <Stack gap={12}>
            {/* Field selector */}
            <div>
              <label
                htmlFor="filter-field"
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-1)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 500,
                }}
              >
                Felt
              </label>
              <Select
                id="filter-field"
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  setSelectedOperator('eq');
                  setFilterValue('');
                }}
                style={{ width: '100%' }}
              >
                <option value="">Velg felt...</option>
                {availableFields?.map((field) => (
                  <option key={field.field} value={field.field}>
                    {field.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Operator selector */}
            {selectedField && (
              <div>
                <label
                  htmlFor="filter-operator"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--ds-spacing-1)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 500,
                  }}
                >
                  Operator
                </label>
                <Select
                  id="filter-operator"
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {availableOperators.map((op) => (
                    <option key={op} value={op}>
                      {operatorLabels[op]}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Value input */}
            {selectedField && selectedFieldDef && (
              <div>
                <label
                  htmlFor="filter-value"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--ds-spacing-1)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 500,
                  }}
                >
                  Verdi
                </label>
                {selectedFieldDef.type === 'select' && selectedFieldDef.options ? (
                  <Select
                    id="filter-value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">Velg verdi...</option>
                    {selectedFieldDef.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id="filter-value"
                    type={selectedFieldDef.type === 'date' ? 'date' : selectedFieldDef.type === 'number' ? 'number' : 'text'}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder={`Skriv inn ${selectedFieldDef.label.toLowerCase()}...`}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
            )}

            {/* Add button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddFilter}
              disabled={!selectedField || !filterValue}
              style={{ alignSelf: 'flex-start' }}
            >
              Legg til filter
            </Button>
          </Stack>
        </div>

        {filters.length === 0 && (
          <Paragraph data-size="sm" style={{ textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)', padding: 'var(--ds-spacing-4) 0' }}>
            Ingen filtre lagt til. Rapporten vil inkludere alle data i valgt periode.
          </Paragraph>
        )}
      </Stack>
    </Card>
  );
}
