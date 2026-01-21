/**
 * Organization Member Dashboard
 * Task-oriented dashboard for org_member role with scoped widgets
 * Per master-prompt.md: Pending Tasks, Calendar Preview, Messages, Finance Alerts
 */
import { useT } from '@xala/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Skeleton,
  Button,
  ClockIcon,
  CalendarIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@xalatechnologies/platform/ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@xala/auth';
import { usePendingItems } from '@digilist/client-sdk';
import { useCapabilityContext } from '../../providers/CapabilityProvider';

interface PendingTask {
  id: string;
  type: 'booking' | 'message';
  title: string;
  description: string;
  createdAt: string;
  rentalObjectName: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  rentalObjectName: string;
  status: 'confirmed' | 'pending';
}

/**
 * Pending Tasks Widget
 * Shows pending approval requests for assigned rental objects
 */
function PendingTasksWidget() {
  const navigate = useNavigate();
  const { data: pendingData, isLoading } = usePendingItems();
  const t = useT();
  
  const pendingCount = pendingData?.bookings ?? 0;
  
  // Mock tasks for UI - in production would come from API
  const tasks: PendingTask[] = [
    {
      id: '1',
      type: 'booking',
      title: t('common.ny_bookingforesporsel'),
      description: t('common.onsker_aa_leie_15'),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      rentalObjectName: 'Møterom A',
    },
    {
      id: '2', 
      type: 'booking',
      title: t('common.bookingforesporsel'),
      description: t('common.arrangement_20_jan_hele'),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      rentalObjectName: 'Kulturhuset',
    },
  ];

  if (isLoading) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Skeleton width="60%" height={24} style={{ marginBottom: 'var(--ds-spacing-4)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={60} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <ClockIcon style={{ color: 'var(--ds-color-warning-icon-default)' }} />
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Ventende oppgaver
          </Heading>
          {pendingCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                color: 'var(--ds-color-warning-text-default)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-full)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {pendingCount}
            </span>
          )}
        </div>
        <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/bookings?status=pending')}>
          Se alle
          <ArrowRightIcon />
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-6)' }}>
          <CheckCircleIcon style={{ width: 48, height: 48, color: 'var(--ds-color-success-icon-default)', marginBottom: 'var(--ds-spacing-2)' }} />
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen ventende oppgaver
          </Paragraph>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              style={{
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onClick={() => navigate(`/bookings/${task.id}`)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {task.title}
                  </Paragraph>
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {task.rentalObjectName} • {task.description}
                  </Paragraph>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/**
 * Calendar Preview Widget
 * Shows today/this week's bookings for assigned objects (read-only)
 */
function CalendarPreviewWidget() {
  const navigate = useNavigate();
  const t = useT();
  
  // Mock events - in production would come from scoped API
  const todayEvents: CalendarEvent[] = [
    {
      id: '1',
      title: t('common.booking_moterom_a'),
      startTime: '10:00',
      endTime: '12:00',
      rentalObjectName: 'Møterom A',
      status: 'confirmed',
    },
    {
      id: '2',
      title: t('common.booking_kulturhuset'),
      startTime: '14:00',
      endTime: '18:00',
      rentalObjectName: 'Kulturhuset',
      status: 'pending',
    },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <CalendarIcon style={{ color: 'var(--ds-color-accent-icon-default)' }} />
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            I dag
          </Heading>
        </div>
        <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/calendar')}>
          Åpne kalender
          <ArrowRightIcon />
        </Button>
      </div>
      
      <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)', textTransform: 'capitalize' }}>
        {dateStr}
      </Paragraph>

      {todayEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen bookinger i dag
          </Paragraph>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {todayEvents.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: event.status === 'confirmed' 
                  ? 'var(--ds-color-success-surface-default)'
                  : 'var(--ds-color-warning-surface-default)',
              }}
            >
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-sm)', minWidth: '100px' }}>
                {event.startTime} - {event.endTime}
              </div>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {event.rentalObjectName}
                </Paragraph>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/**
 * Messages Widget (feature-gated)
 * Shows unread message count and recent threads
 */
function MessagesWidget() {
  const navigate = useNavigate();
  const unreadCount = 3; // Mock - would come from API

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <MessageSquareIcon style={{ color: 'var(--ds-color-info-icon-default)' }} />
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Meldinger
          </Heading>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                color: 'var(--ds-color-danger-text-default)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-full)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {unreadCount} uleste
            </span>
          )}
        </div>
        <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/messages')}>
          Åpne innboks
          <ArrowRightIcon />
        </Button>
      </div>
      
      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
        Du har {unreadCount} uleste meldinger fra brukere
      </Paragraph>
    </Card>
  );
}

/**
 * Finance Alerts Widget (feature-gated)
 * Shows unpaid invoices and payment alerts
 */
function FinanceAlertsWidget() {
  const navigate = useNavigate();
  const unpaidCount = 2; // Mock - would come from API

  return (
    <Card style={{ padding: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <AlertTriangleIcon style={{ color: 'var(--ds-color-warning-icon-default)' }} />
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Økonomi
          </Heading>
        </div>
        <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/economy/invoices')}>
          Se fakturaer
          <ArrowRightIcon />
        </Button>
      </div>
      
      {unpaidCount > 0 ? (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-warning-surface-default)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
            {unpaidCount} ubetalte fakturaer krever oppmerksomhet
          </Paragraph>
        </div>
      ) : (
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Ingen varsler
        </Paragraph>
      )}
    </Card>
  );
}

/**
 * Main Org Member Dashboard Component
 */
export function OrgMemberDashboard() {
  const { user } = useAuth();
  const { hasCapability } = useCapabilityContext();
  
  // Feature gate checks for optional widgets
  const showMessages = hasCapability('CAP_NAV_MESSAGES');
  const showEconomy = hasCapability('CAP_NAV_ECONOMY');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome section */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Velkommen, {user?.name?.split(' ')[0] || 'Bruker'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Oversikt over dine tildelte utleieobjekter
        </Paragraph>
      </div>

      {/* Main grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--ds-spacing-5)',
        }}
      >
        {/* Pending Tasks - always visible */}
        <PendingTasksWidget />
        
        {/* Calendar Preview - always visible */}
        <CalendarPreviewWidget />
        
        {/* Messages - feature-gated */}
        {showMessages && <MessagesWidget />}
        
        {/* Finance Alerts - feature-gated */}
        {showEconomy && <FinanceAlertsWidget />}
      </div>
    </div>
  );
}

export default OrgMemberDashboard;
