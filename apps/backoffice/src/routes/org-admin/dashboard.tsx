/**
 * Org Admin Dashboard
 * Dashboard for organization administrators with scoped access to assigned rental objects
 */
import {
  Card,
  Heading,
  Paragraph,
  Skeleton,
  Button,
  StatCard,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  BuildingIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  MessageIcon,
} from '@xalatechnologies/platform/ui';
import {
  useOrgDashboardStats,
  useOrgPendingItems,
  useOrgCalendarPreview,
  useOrgAlerts,
  useAssignedRentalObjects,
} from '@digilist/client-sdk/hooks';
import { useT } from '@xalatechnologies/platform/i18n';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useNavigate } from 'react-router-dom';
import { useCapabilityContext } from '../../providers/CapabilityProvider';

export function OrgAdminDashboardPage(): React.ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const { hasCapability } = useCapabilityContext();

  // Fetch org-scoped data
  const { data: statsData, isLoading: loadingStats } = useOrgDashboardStats();
  const { data: pendingData, isLoading: loadingPending } = useOrgPendingItems({ limit: 5 });
  const { data: calendarData, isLoading: loadingCalendar } = useOrgCalendarPreview({ range: 'week' });
  const { data: alertsData, isLoading: loadingAlerts } = useOrgAlerts();
  const { data: rentalObjectsData, isLoading: loadingRentalObjects } = useAssignedRentalObjects();

  const isLoading = loadingStats || loadingPending || loadingCalendar || loadingAlerts || loadingRentalObjects;

  // Extract stats
  const stats = statsData?.data;
  const pendingItems = pendingData?.data ?? [];
  const calendarPreview = calendarData?.data;
  const alerts = alertsData?.data ?? [];
  const assignedRentalObjects = rentalObjectsData?.data ?? [];

  // Check if messaging is enabled
  const canViewMessages = hasCapability('CAP_NAV_MESSAGES');

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={40} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
            <Skeleton width="70%" height={20} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={{ padding: 'var(--ds-spacing-5)' }}>
              <Skeleton width="60%" height={20} />
              <Skeleton width={80} height={48} style={{ marginTop: 'var(--ds-spacing-3)' }} />
            </Card>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-6)' }}>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Skeleton width="40%" height={28} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height={60} style={{ marginTop: 'var(--ds-spacing-3)' }} />
            ))}
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Skeleton width="50%" height={28} />
            <Skeleton width="100%" height={100} style={{ marginTop: 'var(--ds-spacing-3)' }} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('orgAdmin.dashboard.welcome', { name: user?.name.split(' ')[0] || '' })}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('orgAdmin.dashboard.scopeInfo', { count: assignedRentalObjects.length })}
          </Paragraph>
        </div>
        {pendingItems.length > 0 && (
          <Button
            type="button"
            variant="primary"
            data-color="accent"
            aria-label={t('orgAdmin.dashboard.processPending', { count: pendingItems.length })}
            onClick={() => navigate('/bookings?status=pending&scope=assigned')}
          >
            {t('orgAdmin.dashboard.processPending', { count: pendingItems.length })}
            <ArrowRightIcon />
          </Button>
        )}
      </div>

      {/* Stats grid */}
      <div data-testid="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <StatCard
          title={t('orgAdmin.dashboard.pendingBookings')}
          value={stats?.pendingBookings ?? 0}
          description={t('orgAdmin.dashboard.requiresAction')}
          color="var(--ds-color-warning-text-default)"
          icon={<ClockIcon />}
        />
        <StatCard
          title={t('orgAdmin.dashboard.confirmedBookings')}
          value={stats?.confirmedBookings ?? 0}
          description={t('orgAdmin.dashboard.thisWeek')}
          color="var(--ds-color-success-text-default)"
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title={t('orgAdmin.dashboard.assignedObjects')}
          value={stats?.assignedRentalObjectCount ?? assignedRentalObjects.length}
          description={t('orgAdmin.dashboard.yourObjects')}
          color="var(--ds-color-accent-text-default)"
          icon={<BuildingIcon />}
        />
        <StatCard
          title={t('orgAdmin.dashboard.activeBlocks')}
          value={stats?.activeBlocks ?? 0}
          description={t('orgAdmin.dashboard.blockedPeriods')}
          color="var(--ds-color-neutral-text-default)"
          icon={<CalendarIcon />}
        />
      </div>

      {/* Alerts section */}
      {alerts.length > 0 && (
        <Card style={{ padding: 'var(--ds-spacing-5)', backgroundColor: 'var(--ds-color-warning-surface-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-3)' }}>
            <AlertTriangleIcon style={{ color: 'var(--ds-color-warning-text-default)' }} />
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('orgAdmin.dashboard.alerts')}
            </Heading>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {alerts.map((alert, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <Badge data-color={alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'}>
                  {alert.severity}
                </Badge>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {alert.message}
                </Paragraph>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-6)' }}>
        {/* Pending items (Work Queue) */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('orgAdmin.dashboard.workQueue')}
            </Heading>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/bookings?status=pending&scope=assigned')}>
              {t('common.seeAll')}
            </Button>
          </div>
          {pendingItems.length === 0 ? (
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center', padding: 'var(--ds-spacing-6)' }}>
              {t('orgAdmin.dashboard.noPendingItems')}
            </Paragraph>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t('orgAdmin.dashboard.rentalObject')}</TableHeaderCell>
                  <TableHeaderCell>{t('orgAdmin.dashboard.requester')}</TableHeaderCell>
                  <TableHeaderCell>{t('orgAdmin.dashboard.date')}</TableHeaderCell>
                  <TableHeaderCell>{t('common.actions')}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.rentalObjectName}</TableCell>
                    <TableCell>{item.requesterName}</TableCell>
                    <TableCell>{new Date(item.startDate).toLocaleDateString('nb-NO')}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                        onClick={() => navigate(`/bookings/${item.id}`)}
                      >
                        {t('common.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Calendar preview */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                {t('orgAdmin.dashboard.calendarPreview')}
              </Heading>
              <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/calendar?scope=assigned')}>
                {t('common.viewCalendar')}
              </Button>
            </div>
            {calendarPreview && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('orgAdmin.dashboard.bookingsThisWeek')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {calendarPreview.bookingsThisWeek}
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('orgAdmin.dashboard.blocksThisWeek')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {calendarPreview.blocksThisWeek}
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('orgAdmin.dashboard.availableSlots')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {calendarPreview.availableSlots}
                  </Paragraph>
                </div>
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              {t('orgAdmin.dashboard.quickActions')}
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                aria-label={t('orgAdmin.dashboard.processPendingBtn')}
                onClick={() => navigate('/bookings?status=pending&scope=assigned')}
              >
                <ClockIcon />
                {t('orgAdmin.dashboard.processPendingBtn')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                aria-label={t('orgAdmin.dashboard.manageBlocks')}
                onClick={() => navigate('/blocks')}
              >
                <CalendarIcon />
                {t('orgAdmin.dashboard.manageBlocks')}
              </Button>
              {canViewMessages && (
                <Button
                  type="button"
                  variant="secondary"
                  style={{ justifyContent: 'flex-start' }}
                  aria-label={t('orgAdmin.dashboard.viewMessages')}
                  onClick={() => navigate('/messages')}
                >
                  <MessageIcon />
                  {t('orgAdmin.dashboard.viewMessages')}
                </Button>
              )}
            </div>
          </Card>

          {/* Assigned rental objects summary */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                {t('orgAdmin.dashboard.assignedObjects')}
              </Heading>
            </div>
            {assignedRentalObjects.length === 0 ? (
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center' }}>
                {t('orgAdmin.dashboard.noAssignedObjects')}
              </Paragraph>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                {assignedRentalObjects.slice(0, 5).map((obj) => (
                  <div
                    key={obj.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                    }}
                  >
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      {obj.name}
                    </Paragraph>
                    <Badge data-color={obj.status === 'published' ? 'success' : 'neutral'} data-size="sm">
                      {obj.status}
                    </Badge>
                  </div>
                ))}
                {assignedRentalObjects.length > 5 && (
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center' }}>
                    {t('orgAdmin.dashboard.moreObjects', { count: assignedRentalObjects.length - 5 })}
                  </Paragraph>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OrgAdminDashboardPage;
