/**
 * Conflict Viewer Component
 * Displays overlapping season applications with severity indicators
 */

import { useMemo } from 'react';
import {
  Card,
  Table,
  Badge,
  Heading,
  Paragraph,
  Spinner,
  AlertTriangleIcon,
  CheckCircleIcon,
} from '@xala/ds';
import {
  // TODO: Implement season application conflict hooks
  // useSeasonConflicts,
  // type ApplicationConflict,
  // type ConflictSummary,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Temporary type definitions and placeholder hooks until implemented in SDK
type ApplicationConflict = {
  applicationId: string;
  conflictingApplicationId: string;
  seasonId: string;
  seasonName: string;
  listingId: string;
  listingName: string;
  weekday: number;
  timeSlot: string;
  applicantName: string;
  conflictingApplicantName: string;
  organizationName: string;
  conflictingOrganizationName: string;
  overlapType: 'full' | 'partial';
  severity: 'high' | 'medium' | 'low';
};

type ConflictSummary = {
  seasonId: string;
  totalConflicts: number;
  conflictsByListing: Record<string, number>;
  conflictsByWeekday: Record<number, number>;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
};

const useSeasonConflicts = (_seasonId: string) => ({
  data: { data: { conflicts: [] as ApplicationConflict[], summary: null as ConflictSummary | null } },
  const t = useT();
  isLoading: false,
});

interface ConflictViewerProps {
  seasonId: string;
}

const weekdayLabels = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

const severityLabels: Record<ApplicationConflict['severity'], string> = {
  high: 'Høy',
  medium: 'Middels',
  low: 'Lav',
};

const severityVariants: Record<ApplicationConflict['severity'], 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

const overlapTypeLabels: Record<ApplicationConflict['overlapType'], string> = {
  full: 'Full overlapp',
  partial: 'Delvis overlapp',
};

export function ConflictViewer({ seasonId }: ConflictViewerProps) {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  // Queries
  const { data: conflictsData, isLoading } = useSeasonConflicts(seasonId);
  const conflicts = conflictsData?.data?.conflicts ?? [];
  const summary = conflictsData?.data?.summary;

  // Group conflicts by listing for better organization
  const conflictsByListing = useMemo(() => {
    const groups: Record<string, ApplicationConflict[]> = {};
    conflicts.forEach(conflict => {
      if (!groups[conflict.listingId]) {
        groups[conflict.listingId] = [];
      }
      groups[conflict.listingId].push(conflict);
    });
    return groups;
  }, [conflicts]);

  const listingNames = useMemo(() => {
    const names = new Map<string, string>();
    conflicts.forEach(conflict => {
      names.set(conflict.listingId, conflict.listingName);
    });
    return names;
  }, [conflicts]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster konflikter..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
          <Card style={{ padding: 'var(--ds-spacing-3)' }}>
            <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Totale konflikter
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {summary.totalConflicts}
            </div>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-3)' }}>
            <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Høy alvorlighet
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
              {summary.highSeverityCount}
            </div>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-3)' }}>
            <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Middels alvorlighet
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
              {summary.mediumSeverityCount}
            </div>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-3)' }}>
            <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Lav alvorlighet
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-info-text-default)' }}>
              {summary.lowSeverityCount}
            </div>
          </Card>
        </div>
      )}

      {/* Conflicts by Listing */}
      {conflicts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
          <CheckCircleIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-success-text-default)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen konflikter funnet
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Alle søknader kan behandles uten tidskonflikter
          </Paragraph>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {Object.entries(conflictsByListing).map(([listingId, listingConflicts]) => (
            <Card key={listingId} style={{ padding: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
                <AlertTriangleIcon style={{ color: 'var(--ds-color-warning-text-default)' }} />
                <Heading level={4} data-size="xs">
                  {listingNames.get(listingId)}
                </Heading>
                <Badge color="warning" size="sm">
                  {listingConflicts.length} konflikt{listingConflicts.length > 1 ? 'er' : ''}
                </Badge>
              </div>

              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>{t('common.soknad_1')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.soknad_2')}</Table.HeaderCell>
                    <Table.HeaderCell>Ukedag</Table.HeaderCell>
                    <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Alvorlighet</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {listingConflicts.map((conflict, index) => (
                    <Table.Row
                      key={`${conflict.applicationId}-${conflict.conflictingApplicationId}-${index}`}
                      style={{
                        backgroundColor:
                          conflict.severity === 'high'
                            ? 'var(--ds-color-danger-surface-subtle)'
                            : conflict.severity === 'medium'
                            ? 'var(--ds-color-warning-surface-subtle)'
                            : undefined,
                      }}
                    >
                      <Table.Cell>
                        <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {conflict.organizationName}
                        </div>
                        <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {conflict.applicantName}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {conflict.conflictingOrganizationName}
                        </div>
                        <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {conflict.conflictingApplicantName}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                          {weekdayLabels[conflict.weekday]}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div style={{ fontSize: 'var(--ds-font-size-sm)', fontFamily: 'var(--ds-font-family-monospace)' }}>
                          {conflict.timeSlot}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={conflict.overlapType === 'full' ? 'danger' : 'warning'} size="sm">
                          {overlapTypeLabels[conflict.overlapType]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={severityVariants[conflict.severity]} size="sm">
                          {severityLabels[conflict.severity]}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
