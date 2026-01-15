/**
 * Appeal Process Component
 * Handle appeals for rejected season applications
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Table,
  Badge,
  Heading,
  Paragraph,
  Spinner,
  Card,
  FilterIcon,
} from '@xala/ds';

// Local icons since they're not exported from @xala/ds
function MoreVerticalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function AlertCircleIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckCircleIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function MessageSquareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
import {
  // TODO: Implement season application appeal hooks
  // useSeasonApplications,
  // useSubmitAppeal,
  // useApproveAppeal,
  // useRejectAppeal,
  // type SeasonApplication,
  // type AppealStatus,
} from '@digilist/client-sdk';

// Temporary type definitions and placeholder hooks until implemented in SDK
type AppealStatus = 'no_appeal' | 'appeal_pending' | 'appeal_approved' | 'appeal_rejected';
type SeasonApplication = {
  id: string;
  seasonId: string;
  listingId: string;
  listingName: string;
  organizationId: string;
  organizationName: string;
  applicantName: string;
  applicantEmail: string;
  weekday: number;
  startTime: string;
  endTime: string;
  status: string;
  rejectionReason?: string;
  metadata?: {
    appealStatus?: AppealStatus;
    appealReason?: string;
    appealSubmittedAt?: string;
    appealProcessedAt?: string;
    appealProcessedBy?: string;
  };
  createdAt: string;
};

const useSeasonApplications = (_seasonId: string) => ({ data: { data: [] as SeasonApplication[] }, isLoading: false });
const useSubmitAppeal = () => ({ mutateAsync: async () => {}, isLoading: false });
const useApproveAppeal = () => ({ mutateAsync: async () => {}, isLoading: false });
const useRejectAppeal = () => ({ mutateAsync: async () => {}, isLoading: false });

interface AppealProcessProps {
  seasonId: string;
  canProcess: boolean; // Only allow administrators to approve/reject appeals
}

const appealStatusLabels: Record<AppealStatus, string> = {
  no_appeal: 'Ingen klage',
  appeal_pending: 'Klage venter',
  appeal_approved: 'Klage godkjent',
  appeal_rejected: 'Klage avslått',
};

const appealStatusVariants: Record<AppealStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  no_appeal: 'neutral',
  appeal_pending: 'warning',
  appeal_approved: 'success',
  appeal_rejected: 'danger',
};

const weekdayLabels = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

export function AppealProcess({ seasonId, canProcess }: AppealProcessProps) {
  const [filterAppealStatus, setFilterAppealStatus] = useState<AppealStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<SeasonApplication | null>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');

  // Queries
  const { data: applicationsData, isLoading } = useSeasonApplications(seasonId);
  const allApplications = applicationsData?.data ?? [];

  // Filter only rejected applications
  const rejectedApplications = useMemo(() => {
    return allApplications.filter(app => app.status === 'rejected');
  }, [allApplications]);

  // Mutations
  const submitAppealMutation = useSubmitAppeal();
  const approveAppealMutation = useApproveAppeal();
  const rejectAppealMutation = useRejectAppeal();

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return rejectedApplications.filter(app => {
      const appealStatus = app.metadata?.appealStatus || 'no_appeal';
      if (filterAppealStatus !== 'all' && appealStatus !== filterAppealStatus) return false;
      return true;
    });
  }, [rejectedApplications, filterAppealStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: rejectedApplications.length,
      noAppeal: rejectedApplications.filter(a => !a.metadata?.appealStatus || a.metadata.appealStatus === 'no_appeal').length,
      appealPending: rejectedApplications.filter(a => a.metadata?.appealStatus === 'appeal_pending').length,
      appealApproved: rejectedApplications.filter(a => a.metadata?.appealStatus === 'appeal_approved').length,
      appealRejected: rejectedApplications.filter(a => a.metadata?.appealStatus === 'appeal_rejected').length,
    };
  }, [rejectedApplications]);

  // Handlers
  const handleOpenAppealModal = (application: SeasonApplication) => {
    setSelectedApplication(application);
    setAppealReason('');
    setShowAppealModal(true);
  };

  const handleSubmitAppeal = async () => {
    if (!selectedApplication || !appealReason.trim()) {
      return;
    }

    await submitAppealMutation.mutateAsync({
      applicationId: selectedApplication.id,
      reason: appealReason,
    });

    setShowAppealModal(false);
    setSelectedApplication(null);
    setAppealReason('');
  };

  const handleApproveAppeal = async (applicationId: string) => {
    if (confirm('Godkjenn denne klagen? Søknaden vil bli godkjent.')) {
      await approveAppealMutation.mutateAsync(applicationId);
    }
  };

  const handleRejectAppeal = async (applicationId: string) => {
    const reason = prompt('Årsak til avslag av klage (valgfritt):');
    await rejectAppealMutation.mutateAsync({
      id: applicationId,
      reason: reason || undefined
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Header with stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Totalt avslått
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {stats.total}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Ingen klage
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {stats.noAppeal}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Klage venter
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
            {stats.appealPending}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Klage godkjent
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.appealApproved}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Klage avslått
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-danger-text-default)' }}>
            {stats.appealRejected}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button variant="secondary" data-size="sm" type="button">
              <FilterIcon />
              Klagestatus: {filterAppealStatus === 'all' ? 'Alle' : appealStatusLabels[filterAppealStatus]}
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item onClick={() => setFilterAppealStatus('all')}>Alle</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterAppealStatus('no_appeal')}>Ingen klage</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterAppealStatus('appeal_pending')}>Klage venter</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterAppealStatus('appeal_approved')}>Klage godkjent</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterAppealStatus('appeal_rejected')}>Klage avslått</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </div>

      {/* Applications list */}
      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
          <CheckCircleIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-success-text-default)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {rejectedApplications.length === 0 ? 'Ingen avslåtte søknader' : 'Ingen søknader funnet'}
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {rejectedApplications.length === 0
              ? 'Det er ingen avslåtte søknader for denne sesongen'
              : 'Ingen søknader matcher valgte filter'}
          </Paragraph>
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Organisasjon</Table.HeaderCell>
              <Table.HeaderCell>Lokale</Table.HeaderCell>
              <Table.HeaderCell>Ukedag</Table.HeaderCell>
              <Table.HeaderCell>Tid</Table.HeaderCell>
              <Table.HeaderCell>Avslagsgrunn</Table.HeaderCell>
              <Table.HeaderCell>Klagestatus</Table.HeaderCell>
              <Table.HeaderCell>Dato</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '100px' }}>Handlinger</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredApplications.map(application => {
              const appealStatus = application.metadata?.appealStatus || 'no_appeal';
              const canSubmitAppeal = appealStatus === 'no_appeal';
              const canProcessAppeal = canProcess && appealStatus === 'appeal_pending';

              return (
                <Table.Row key={application.id}>
                  <Table.Cell>
                    <div>
                      <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {application.organizationName}
                      </div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {application.applicantName}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {application.listingName}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {weekdayLabels[application.weekday]}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {formatTime(application.startTime)} – {formatTime(application.endTime)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', maxWidth: '200px' }}>
                      {application.rejectionReason ? (
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--ds-color-danger-text-default)'
                        }}>
                          {application.rejectionReason}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          Ingen grunn oppgitt
                        </span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={appealStatusVariants[appealStatus]}>
                      {appealStatusLabels[appealStatus]}
                    </Badge>
                    {application.metadata?.appealSubmittedAt && (
                      <div style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                        marginTop: 'var(--ds-spacing-1)'
                      }}>
                        {formatDateTime(application.metadata.appealSubmittedAt)}
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatDate(application.createdAt)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown>
                      <Dropdown.Trigger asChild>
                        <Button variant="tertiary" data-size="sm" type="button">
                          <MoreVerticalIcon />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.Content>
                        {canSubmitAppeal && (
                          <Dropdown.Item onClick={() => handleOpenAppealModal(application)}>
                            <SendIcon />
                            Send klage
                          </Dropdown.Item>
                        )}
                        {canProcessAppeal && (
                          <>
                            <Dropdown.Item onClick={() => handleApproveAppeal(application.id)}>
                              <CheckCircleIcon />
                              Godkjenn klage
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleRejectAppeal(application.id)} color="danger">
                              <XCircleIcon />
                              Avslå klage
                            </Dropdown.Item>
                          </>
                        )}
                        <Dropdown.Item onClick={() => setSelectedApplication(application)}>
                          <MessageSquareIcon />
                          Se detaljer
                        </Dropdown.Item>
                      </Dropdown.Content>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}

      {/* Appeal submission modal */}
      <Modal open={showAppealModal} onOpenChange={setShowAppealModal}>
        <Modal.Content style={{ maxWidth: '600px' }}>
          <Modal.Header>
            <Heading level={3} data-size="sm">
              Send klage på avslag
            </Heading>
          </Modal.Header>

          {selectedApplication && (
            <div style={{ padding: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              {/* Application summary */}
              <Card style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  <div>
                    <span style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>Organisasjon:</span>{' '}
                    {selectedApplication.organizationName}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>Lokale:</span>{' '}
                    {selectedApplication.listingName}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>Tid:</span>{' '}
                    {weekdayLabels[selectedApplication.weekday]} {formatTime(selectedApplication.startTime)} – {formatTime(selectedApplication.endTime)}
                  </div>
                  {selectedApplication.rejectionReason && (
                    <div>
                      <span style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>Avslagsgrunn:</span>
                      <div style={{
                        marginTop: 'var(--ds-spacing-1)',
                        padding: 'var(--ds-spacing-2)',
                        backgroundColor: 'var(--ds-color-danger-surface-subtle)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        color: 'var(--ds-color-danger-text-default)'
                      }}>
                        {selectedApplication.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Appeal reason input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                <Label htmlFor="appeal-reason">
                  Begrunnelse for klage <span style={{ color: 'var(--ds-color-danger-text-default)' }}>*</span>
                </Label>
                <Textarea
                  id="appeal-reason"
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Beskriv hvorfor du ønsker å klage på avslaget..."
                  rows={6}
                  required
                />
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Forklar hvorfor du mener søknaden burde godkjennes. Inkluder relevant informasjon som kan støtte klagen.
                </Paragraph>
              </div>

              {/* Warning */}
              <Card style={{
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-warning-surface-subtle)',
                border: '1px solid var(--ds-color-warning-border-default)'
              }}>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'flex-start' }}>
                  <AlertCircleIcon style={{ color: 'var(--ds-color-warning-text-default)', flexShrink: 0 }} />
                  <Paragraph data-size="sm">
                    Klagen vil bli vurdert av administrator. Du vil motta svar når klagen er behandlet.
                  </Paragraph>
                </div>
              </Card>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  onClick={() => setShowAppealModal(false)}
                  type="button"
                >
                  Avbryt
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitAppeal}
                  disabled={!appealReason.trim() || submitAppealMutation.isLoading}
                  type="button"
                >
                  {submitAppealMutation.isLoading ? (
                    <>
                      <Spinner data-size="sm" />
                      Sender...
                    </>
                  ) : (
                    <>
                      <SendIcon />
                      Send klage
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal.Content>
      </Modal>
    </div>
  );
}
