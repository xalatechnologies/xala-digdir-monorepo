/**
 * SeasonApplicationsReviewPage
 *
 * Saksbehandler page for reviewing seasonal lease applications
 * - Applications list with org info
 * - Status filter (pending, approved, rejected)
 * - Detail view with allocation suggestions
 * - Approve/reject with comments
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Badge,
  Table,
  useDialog,
  Drawer,
} from '@xala/ds';
import { useLocale } from '@xala/i18n';
import {
  useSeasonApplications,
  useApproveSeasonApplication,
  useRejectSeasonApplication,
  type SeasonApplication,
} from '@digilist/client-sdk/hooks';

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'allocated';

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const colors: Record<ApplicationStatus, { bg: string; text: string }> = {
    pending: { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' },
    approved: { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' },
    rejected: { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' },
    allocated: { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' },
  };
  const labels: Record<ApplicationStatus, string> = {
    pending: 'Venter',
    approved: 'Godkjent',
    rejected: 'Avslått',
    allocated: 'Tildelt',
  };
  const color = colors[status] || colors.pending;
  return <Badge style={{ backgroundColor: color.bg, color: color.text }}>{labels[status]}</Badge>;
}

export function SeasonApplicationsReviewPage() {
  const { locale } = useLocale();
  const { confirm } = useDialog();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | undefined>(undefined);
  const [selectedApp, setSelectedApp] = useState<SeasonApplication | null>(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Fetch season applications
  const { data: applicationsResponse, isLoading } = useSeasonApplications(undefined, {
    status: statusFilter,
  });

  // Mutations
  const approveMutation = useApproveSeasonApplication();
  const rejectMutation = useRejectSeasonApplication();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const applications = applicationsResponse?.data || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({
      title: 'Godkjenn søknad',
      description: 'Er du sikker på at du vil godkjenne denne sesongsøknaden?',
      confirmText: 'Godkjenn',
      cancelText: 'Avbryt',
      variant: 'success',
    });
    if (confirmed) {
      await approveMutation.mutateAsync(id);
      setSelectedApp(null);
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Avslå søknad',
      description: 'Er du sikker på at du vil avslå denne sesongsøknaden?',
      confirmText: 'Avslå',
      cancelText: 'Avbryt',
      variant: 'danger',
    });
    if (confirmed) {
      await rejectMutation.mutateAsync({ id });
      setSelectedApp(null);
    }
  };

  // Stats
  const allApplications = applicationsResponse?.data || [];
  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(a => a.status === 'pending').length,
    approved: allApplications.filter(a => a.status === 'approved').length,
    allocated: allApplications.filter(a => a.status === 'allocated').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Sesongsøknader
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Behandle søknader om faste tider for sesongen
        </Paragraph>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Totalt</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.total}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Ventende</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: stats.pending > 0 ? 'var(--ds-color-warning-text-default)' : undefined }}>
            {stats.pending}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Godkjent</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>{stats.approved}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Tildelt</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.allocated}</Heading>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'allocated', 'rejected'] as const).map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={(filter === 'all' && !statusFilter) || statusFilter === filter ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter(filter === 'all' ? undefined : filter as ApplicationStatus)}
            style={{ minHeight: '44px' }}
          >
            {filter === 'all' ? 'Alle' : filter === 'pending' ? 'Ventende' : filter === 'approved' ? 'Godkjent' : filter === 'allocated' ? 'Tildelt' : 'Avslått'}
          </Button>
        ))}
      </div>

      {/* Applications Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster..." data-size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Ingen søknader å vise
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Organisasjon</Table.HeaderCell>
                <Table.HeaderCell>Ressurs</Table.HeaderCell>
                <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                <Table.HeaderCell>Prioritet</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Mottatt</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '180px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {applications.map((app) => {
                const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
                const dayName = weekdays[app.weekday];
                const timeSlot = `${app.startTime}-${app.endTime}`;

                return (
                  <Table.Row key={app.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(app)}>
                    <Table.Cell>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {app.organizationName || app.applicantName}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{app.rentalObjectName || app.rentalObjectId}</Table.Cell>
                    <Table.Cell>{dayName} {timeSlot}</Table.Cell>
                    <Table.Cell>
                      {app.priority ? (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: app.priority >= 90 ? 'var(--ds-color-success-surface-default)' :
                                           app.priority >= 70 ? 'var(--ds-color-warning-surface-default)' :
                                           'var(--ds-color-neutral-surface-default)',
                          color: app.priority >= 90 ? 'var(--ds-color-success-text-default)' :
                                 app.priority >= 70 ? 'var(--ds-color-warning-text-default)' :
                                 'var(--ds-color-neutral-text-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'var(--ds-font-weight-semibold)',
                          fontSize: 'var(--ds-font-size-sm)',
                        }}>
                          {app.priority}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={app.status} />
                    </Table.Cell>
                    <Table.Cell>{formatDate(app.createdAt)}</Table.Cell>
                    <Table.Cell onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                        <Button type="button" variant="primary" data-size="sm" onClick={() => handleApprove(app.id)}>
                          Godkjenn
                        </Button>
                        <Button type="button" variant="secondary" data-size="sm" onClick={() => handleReject(app.id)}>
                          Avslå
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        position="right"
        size="lg"
        aria-label="Søknadsdetaljer"
      >
        {selectedApp && (() => {
          const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
          const dayName = weekdays[selectedApp.weekday];

          return (
            <div style={{ padding: 'var(--ds-spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
              <div>
                <Heading level={2} data-size="md" style={{ margin: 0 }}>
                  {selectedApp.organizationName || selectedApp.applicantName}
                </Heading>
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
                  Søknad for {selectedApp.rentalObjectName || selectedApp.rentalObjectId}
                </Paragraph>
              </div>

              <Card style={{ padding: 'var(--ds-spacing-4)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
                  Kontaktinformasjon
                </Paragraph>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  <div>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>Navn</Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {selectedApp.applicantName}
                    </Paragraph>
                  </div>
                  <div>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>E-post</Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>{selectedApp.applicantEmail}</Paragraph>
                  </div>
                  {selectedApp.applicantPhone && (
                    <div>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>Telefon</Paragraph>
                      <Paragraph data-size="sm" style={{ margin: 0 }}>{selectedApp.applicantPhone}</Paragraph>
                    </div>
                  )}
                </div>
              </Card>

              <Card style={{ padding: 'var(--ds-spacing-4)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
                  Ønsket tid
                </Paragraph>
                <div style={{
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {dayName} {selectedApp.startTime}-{selectedApp.endTime}
                  </Paragraph>
                  {selectedApp.priority && (
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                      Prioritet: {selectedApp.priority}
                    </Paragraph>
                  )}
                </div>
              </Card>

              {selectedApp.notes && (
                <Card style={{ padding: 'var(--ds-spacing-4)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
                    Merknad fra søker
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {selectedApp.notes}
                  </Paragraph>
                </Card>
              )}

              {selectedApp.rejectionReason && (
                <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-danger-surface-subtle)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
                    Avslåsgrunn
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {selectedApp.rejectionReason}
                  </Paragraph>
                </Card>
              )}

              <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'auto' }}>
                <Button type="button" variant="primary" onClick={() => handleApprove(selectedApp.id)} style={{ flex: 1, minHeight: '44px' }}>
                  Godkjenn søknad
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleReject(selectedApp.id)} style={{ flex: 1, minHeight: '44px' }}>
                  Avslå søknad
                </Button>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
}
