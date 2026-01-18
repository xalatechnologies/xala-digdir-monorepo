/**
 * Organization Detail Page
 * Full-page view for viewing and managing a single organization
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Tabs,
  EditIcon,
  ArrowLeftIcon,
  TrashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  TrendUpIcon,
  GlobeIcon,
  StatCard,
  Table,
  BookingStatusBadge,
  PaymentStatusBadge,
  formatTimeAgo,
  Link as DsLink,
} from '@xala/ds';
import {
  useOrganization,
  useOrganizationMembers,
  useDeleteOrganization,
  useVerifyOrganization,
  useBookings,
  useSeasonalLeases,
  useResourceAudit,
  formatDate,
  formatTime,
  type ActorType,
  type OrganizationStatus,
  type Booking,
  type AuditLogEntry,
} from '@digilist/client-sdk';
import type { SeasonalLease } from '@digilist/client-sdk/services/seasonal-lease.service';
import { MemberManagement } from '../../components/organizations/MemberManagement';
import { FormSection } from '../../components/shared';
import { useMemo } from 'react';
import { useT } from '@xala/i18n';

// Actor type labels are now provided via translation function
const getActorTypeLabel = (t: (key: string) => string, type: ActorType): string => {
  return t(`organizations.actorType.${type}`);
};

const actorTypeColors: Record<ActorType, 'neutral' | 'info' | 'success' | 'warning'> = {
  private: 'neutral',
  business: 'info',
  sports_club: 'success',
  youth_organization: 'warning',
  school: 'info',
  municipality: 'success',
};

const statusColors: Record<OrganizationStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function OrganizationDetailPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: orgData, isLoading } = useOrganization(id!);
  const organization = orgData?.data;

  const { data: membersData } = useOrganizationMembers(id!);
  const members = membersData?.data ?? [];

  const { data: bookingsData, isLoading: loadingBookings } = useBookings({ organizationId: id, limit: 100 });
  const bookings = bookingsData?.data ?? [];

  const { data: seasonalLeasesData, isLoading: loadingSeasons } = useSeasonalLeases({ organizationId: id, limit: 50 });
  const seasonalLeases = seasonalLeasesData?.data ?? [];

  const { data: auditData } = useResourceAudit('organization', id!, { limit: 10 });
  const auditEvents = auditData?.data ?? [];

  // Mutations
  const deleteOrgMutation = useDeleteOrganization();
  const verifyOrgMutation = useVerifyOrganization();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    return {
      totalBookings,
      activeBookings,
      pendingBookings,
      totalRevenue,
      totalSeasons: seasonalLeases.length,
      activeSeasons: seasonalLeases.filter(s => s.status === 'active').length,
    };
  }, [bookings, seasonalLeases]);

  // Extract metadata
  const metadata = organization?.metadata as Record<string, string> | undefined;
  const logo = metadata?.logo || metadata?.logoUrl;
  const description = metadata?.description || metadata?.about;
  const website = metadata?.website || metadata?.websiteUrl;

  // Handlers
  const handleDelete = async () => {
    if (confirm(t('organizations.deleteConfirm'))) {
      await deleteOrgMutation.mutateAsync(id!);
      navigate('/organizations');
    }
  };

  const handleVerify = async () => {
    await verifyOrgMutation.mutateAsync(id!);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t("state.loading")} />
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">{t('organizations.notFoundSingle')}</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          {t('organizations.notFoundDescription')}
        </Paragraph>
        <Link to="/organizations">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            {t('organizations.backToList')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/organizations">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            {t('organizations.backToList')}
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'flex-start' }}>
            {/* Logo */}
            {logo && (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                flexShrink: 0,
              }}>
                <img
                  src={logo}
                  alt={`${organization.name} logo`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div>
              <Heading level={2} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                {organization.name}
              </Heading>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap', marginBottom: 'var(--ds-spacing-2)' }}>
                <Badge color={actorTypeColors[organization.actorType]}>
                  {getActorTypeLabel(t, organization.actorType)}
                </Badge>
                <Badge color={statusColors[organization.status]}>
                  {t(`organizations.${organization.status}`)}
                </Badge>
                {organization.verified && (
                  <Badge color="success">
                    <CheckCircleIcon /> {t('organizations.verified')}
                  </Badge>
                )}
              </div>
              {description && (
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '600px', marginTop: 'var(--ds-spacing-2)' }}>
                  {description}
                </Paragraph>
              )}
              {website && (
                <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
                  <DsLink
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-1)',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                    aria-label={`${t('ui.visitWebsite')}: ${website}`}
                  >
                    <GlobeIcon size={16} />
                    {website}
                  </DsLink>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Link to={`/organizations/${id}/edit`}>
              <Button variant="secondary" data-size="sm" type="button" aria-label={t("action.edit")}>
                <EditIcon /> {t("action.edit")}
              </Button>
            </Link>
            {!organization.verified && (
              <Button variant="secondary" data-size="sm" onClick={handleVerify} type="button">
                <ShieldCheckIcon />
                {t('organizations.verify')}
              </Button>
            )}
            <Button variant="danger" data-size="sm" onClick={handleDelete} type="button" aria-label={t("action.delete")}>
              <TrashIcon /> {t("action.delete")}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <StatCard
          title={t('organizations.stats.totalBookings')}
          value={stats.totalBookings}
          description={t('organizations.stats.allTime')}
          color="var(--ds-color-info-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title={t('organizations.stats.activeBookings')}
          value={stats.activeBookings}
          description={t("status.confirmed")}
          color="var(--ds-color-success-text-default)"
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title={t('organizations.stats.pending')}
          value={stats.pendingBookings}
          description={t('organizations.stats.requiresApproval')}
          color="var(--ds-color-warning-text-default)"
          icon={<ClockIcon />}
        />
        <StatCard
          title={t('organizations.stats.totalRevenue')}
          value={`${stats.totalRevenue.toLocaleString('nb-NO')} kr`}
          description={t('organizations.stats.totalPaid')}
          color="var(--ds-color-accent-text-default)"
          icon={<TrendUpIcon />}
        />
        <StatCard
          title={t('organizations.stats.seasonLease')}
          value={stats.totalSeasons}
          description={t('organizations.stats.activeCount', { count: stats.activeSeasons })}
          color="var(--ds-color-info-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title={t('organizations.stats.members')}
          value={members.length}
          description={t('organizations.stats.activeUsers')}
          color="var(--ds-color-neutral-text-default)"
          icon={<UsersIcon />}
        />
      </div>

      {/* Content */}
      <Tabs defaultValue="info">
        <Tabs.List>
          <Tabs.Tab value="info">{t('organizations.tabs.info')}</Tabs.Tab>
          <Tabs.Tab value="members">
            <UsersIcon />
            {t('organizations.tabs.members')} ({members.length})
          </Tabs.Tab>
          <Tabs.Tab value="bookings">
            <CalendarIcon />
            {t('organizations.tabs.bookings')} ({stats.totalBookings})
          </Tabs.Tab>
          <Tabs.Tab value="seasons">{t('organizations.tabs.seasons')} ({stats.totalSeasons})</Tabs.Tab>
          <Tabs.Tab value="activity">{t('organizations.tabs.activity')}</Tabs.Tab>
        </Tabs.List>

        {/* Information Tab */}
        <Tabs.Panel value="info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Card>
              <FormSection title={t('organizations.detail.basicInfo')}>
                <Stack spacing={3}>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('organizations.detail.organizationType')}
                    </div>
                    <Badge color={actorTypeColors[organization.actorType]}>
                      {getActorTypeLabel(t, organization.actorType)}
                    </Badge>
                  </div>

                  {organization.organizationNumber && (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        {t('organizations.detail.organizationNumber')}
                      </div>
                      <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-md)' }}>
                        {organization.organizationNumber}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('organizations.detail.status')}
                    </div>
                    <Badge color={statusColors[organization.status]}>
                      {t(`organizations.${organization.status}`)}
                    </Badge>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('organizations.detail.verified')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                      {organization.verified ? (
                        <>
                          <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                          <span>{t("ui.yes")}</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                          <span>{t("ui.no")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('organizations.detail.created')}
                    </div>
                    <div>{formatDate(organization.createdAt)}</div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      ({formatTimeAgo(organization.createdAt)})
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('organizations.detail.lastUpdated')}
                    </div>
                    <div>{formatDate(organization.updatedAt)}</div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      ({formatTimeAgo(organization.updatedAt)})
                    </div>
                  </div>
                </Stack>
              </FormSection>
            </Card>

            <Card>
              <FormSection title={t('organizations.detail.contactInfo')}>
                <Stack spacing={3}>
                  {organization.email ? (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        {t('organizations.detail.email')}
                      </div>
                      <DsLink href={`mailto:${organization.email}`}>
                        {organization.email}
                      </DsLink>
                    </div>
                  ) : (
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('organizations.detail.noEmail')}
                    </Paragraph>
                  )}

                  {organization.phone && (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        {t('organizations.detail.phone')}
                      </div>
                      <DsLink href={`tel:${organization.phone}`}>
                        {organization.phone}
                      </DsLink>
                    </div>
                  )}

                  {(organization.address || organization.city || organization.postalCode) ? (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        {t('organizations.detail.address')}
                      </div>
                      <div>
                        {organization.address && <div>{organization.address}</div>}
                        {(organization.postalCode || organization.city) && (
                          <div>{[organization.postalCode, organization.city].filter(Boolean).join(' ')}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    !organization.email && !organization.phone && (
                      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('organizations.detail.noAddress')}
                      </Paragraph>
                    )
                  )}
                </Stack>
              </FormSection>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Members Tab */}
        <Tabs.Panel value="members">
          <Card>
            <MemberManagement organizationId={organization.id} members={members} />
          </Card>
        </Tabs.Panel>

        {/* Bookings Tab */}
        <Tabs.Panel value="bookings">
          <Card>
            {loadingBookings ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label={t('state.loading')} />
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <CalendarIcon size={48} style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {t('organizations.bookings.none')}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('organizations.bookings.noneDescription')}
                </Paragraph>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                  <Heading level={3} data-size="sm">
                    {t('organizations.bookings.page.title')} ({bookings.length})
                  </Heading>
                </div>
                <div style={{ overflow: 'auto' }}>
                  <Table>
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>{t('organizations.bookings.table.booking')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('organizations.bookings.table.resource')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('organizations.bookings.table.time')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('organizations.bookings.table.status')}</Table.HeaderCell>
                        <Table.HeaderCell>{t('organizations.bookings.table.payment')}</Table.HeaderCell>
                        <Table.HeaderCell style={{ textAlign: 'right' }}>{t('organizations.bookings.table.price')}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {bookings.map((booking: Booking) => (
                        <Table.Row
                          key={booking.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          <Table.Cell>
                            <span style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-accent-text-default)' }}>
                              #{booking.id.split('-')[0]?.toUpperCase()}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {booking.listingName || booking.listingId}
                            </Paragraph>
                          </Table.Cell>
                          <Table.Cell>
                            <div>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                                {formatDate(booking.startTime)}
                              </Paragraph>
                              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                              </Paragraph>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <BookingStatusBadge status={booking.status} />
                          </Table.Cell>
                          <Table.Cell>
                            <PaymentStatusBadge status={booking.paymentStatus || 'unpaid'} />
                          </Table.Cell>
                          <Table.Cell style={{ textAlign: 'right' }}>
                            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {(Number(booking.totalPrice) || 0).toLocaleString('nb-NO')} kr
                            </Paragraph>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </>
            )}
          </Card>
        </Tabs.Panel>

        {/* Seasons Tab */}
        <Tabs.Panel value="seasons">
          <Card>
            {loadingSeasons ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label={t('state.loading')} />
              </div>
            ) : seasonalLeases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <CalendarIcon size={48} style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {t('organizations.seasons.none')}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('organizations.seasons.noneDescription')}
                </Paragraph>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                  <Heading level={3} data-size="sm">
                    {t('organizations.seasons.page.title')} ({seasonalLeases.length})
                  </Heading>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  {seasonalLeases.map((lease: SeasonalLease) => (
                    <div
                      key={lease.id}
                      style={{
                        padding: 'var(--ds-spacing-4)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/seasonal-leases/${lease.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                            {lease.listingName || lease.listingId}
                          </Heading>
                          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                            {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                          </Paragraph>
                        </div>
                        <Badge color={lease.status === 'active' ? 'success' : lease.status === 'approved' ? 'info' : 'neutral'}>
                          {lease.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Tabs.Panel>

        {/* Activity Tab */}
        <Tabs.Panel value="activity">
          <Card>
            {auditEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <ClockIcon size={48} style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {t('organizations.activity.none')}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('organizations.activity.noneDescription')}
                </Paragraph>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                  <Heading level={3} data-size="sm">
                    {t('organizations.activity.recent')}
                  </Heading>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  {auditEvents.map((event: AuditLogEntry) => {
                    const metadata = event.metadata as { description?: string; userName?: string } | undefined;
                    return (
                      <div
                        key={event.id}
                        style={{
                          padding: 'var(--ds-spacing-3)',
                          border: '1px solid var(--ds-color-neutral-border-subtle)',
                          borderRadius: 'var(--ds-border-radius-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-1)' }}>
                          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                            {event.action}
                          </Paragraph>
                          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {formatTimeAgo(event.timestamp)}
                          </Paragraph>
                        </div>
                        {metadata?.description && (
                          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {metadata.description}
                          </Paragraph>
                        )}
                        {event.userId && (
                          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {t('organizations.activity.by')}: {metadata?.userName || event.userId}
                          </Paragraph>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
