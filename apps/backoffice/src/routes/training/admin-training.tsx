/**
 * Admin Training Page
 *
 * Admin-specific training modules for system configuration,
 * user management, and advanced features.
 * Restricted to admin, tenant_admin, and org_admin roles.
 */
import * as React from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Button,
  Skeleton,
  Alert,
  CogIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  LinkIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
} from '@xalatechnologies/platform/ui';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@xala/auth';
import { useT } from '@xala/i18n';
import { useTraining } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

interface AdminModule {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  topics: string[];
  duration: string;
  required: boolean;
  roles: string[];
  completed?: boolean;
}

interface Certification {
  id: string;
  titleKey: string;
  descriptionKey: string;
  modules: string[];
  issued?: string;
  expires?: string;
}

// =============================================================================
// Config
// =============================================================================

const adminModules: AdminModule[] = [
  {
    id: 'system-configuration',
    titleKey: 'training.adminModules.systemConfiguration.title',
    descriptionKey: 'training.adminModules.systemConfiguration.description',
    icon: <CogIcon size={24} />,
    topics: [
      'training.adminModules.systemConfiguration.topic1',
      'training.adminModules.systemConfiguration.topic2',
      'training.adminModules.systemConfiguration.topic3',
      'training.adminModules.systemConfiguration.topic4',
    ],
    duration: '45 min',
    required: true,
    roles: ['admin', 'tenant_admin'],
  },
  {
    id: 'user-access-management',
    titleKey: 'training.adminModules.userAccessManagement.title',
    descriptionKey: 'training.adminModules.userAccessManagement.description',
    icon: <UsersIcon size={24} />,
    topics: [
      'training.adminModules.userAccessManagement.topic1',
      'training.adminModules.userAccessManagement.topic2',
      'training.adminModules.userAccessManagement.topic3',
      'training.adminModules.userAccessManagement.topic4',
    ],
    duration: '30 min',
    required: true,
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'security-compliance',
    titleKey: 'training.adminModules.securityCompliance.title',
    descriptionKey: 'training.adminModules.securityCompliance.description',
    icon: <ShieldCheckIcon size={24} />,
    topics: [
      'training.adminModules.securityCompliance.topic1',
      'training.adminModules.securityCompliance.topic2',
      'training.adminModules.securityCompliance.topic3',
      'training.adminModules.securityCompliance.topic4',
    ],
    duration: '60 min',
    required: true,
    roles: ['admin', 'tenant_admin'],
  },
  {
    id: 'reporting-analytics',
    titleKey: 'training.adminModules.reportingAnalytics.title',
    descriptionKey: 'training.adminModules.reportingAnalytics.description',
    icon: <ChartBarIcon size={24} />,
    topics: [
      'training.adminModules.reportingAnalytics.topic1',
      'training.adminModules.reportingAnalytics.topic2',
      'training.adminModules.reportingAnalytics.topic3',
    ],
    duration: '25 min',
    required: false,
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'notification-management',
    titleKey: 'training.adminModules.notificationManagement.title',
    descriptionKey: 'training.adminModules.notificationManagement.description',
    icon: <BellIcon size={24} />,
    topics: [
      'training.adminModules.notificationManagement.topic1',
      'training.adminModules.notificationManagement.topic2',
      'training.adminModules.notificationManagement.topic3',
    ],
    duration: '20 min',
    required: false,
    roles: ['admin', 'tenant_admin'],
  },
  {
    id: 'integrations-setup',
    titleKey: 'training.adminModules.integrationsSetup.title',
    descriptionKey: 'training.adminModules.integrationsSetup.description',
    icon: <LinkIcon size={24} />,
    topics: [
      'training.adminModules.integrationsSetup.topic1',
      'training.adminModules.integrationsSetup.topic2',
      'training.adminModules.integrationsSetup.topic3',
      'training.adminModules.integrationsSetup.topic4',
    ],
    duration: '40 min',
    required: false,
    roles: ['admin', 'tenant_admin'],
  },
];

const certifications: Certification[] = [
  {
    id: 'admin-fundamentals',
    titleKey: 'training.certifications.adminFundamentals.title',
    descriptionKey: 'training.certifications.adminFundamentals.description',
    modules: ['system-configuration', 'user-access-management', 'security-compliance'],
  },
  {
    id: 'advanced-admin',
    titleKey: 'training.certifications.advancedAdmin.title',
    descriptionKey: 'training.certifications.advancedAdmin.description',
    modules: ['reporting-analytics', 'notification-management', 'integrations-setup'],
  },
];

// =============================================================================
// Access Check
// =============================================================================

const ADMIN_ROLES = ['admin', 'tenant_admin', 'org_admin'];

// =============================================================================
// Sub-components
// =============================================================================

function ModuleCard({ module, t }: { module: AdminModule; t: (key: string) => string }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-5)',
        border: module.required ? '2px solid var(--ds-color-warning-border-default)' : undefined,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: module.completed
                ? 'var(--ds-color-success-surface-default)'
                : 'var(--ds-color-accent-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: module.completed
                ? 'var(--ds-color-success-base-default)'
                : 'var(--ds-color-accent-base-default)',
              flexShrink: 0,
            }}
          >
            {module.completed ? <CheckCircleIcon size={24} /> : module.icon}
          </div>
          <div>
            <Heading level={3} data-size="sm" style={{ margin: 0 }}>
              {t(module.titleKey)}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t(module.descriptionKey)}
            </Paragraph>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--ds-spacing-2)' }}>
          {module.required && (
            <Badge data-color="warning" data-size="sm">
              {t('training.required')}
            </Badge>
          )}
          {module.completed && (
            <Badge data-color="success" data-size="sm">
              {t('training.completed')}
            </Badge>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-4)',
          paddingBottom: 'var(--ds-spacing-4)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('training.duration')}: {module.duration}
        </Paragraph>
        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('training.availableFor')}: {module.roles.join(', ')}
        </Paragraph>
      </div>

      {/* Topics (expandable) */}
      <Button
        type="button"
        variant="tertiary"
        data-size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? t('training.hideTopics') : t('training.showTopics')} ({module.topics.length})
      </Button>

      {isExpanded && (
        <ul
          style={{
            margin: 0,
            marginTop: 'var(--ds-spacing-3)',
            paddingLeft: 'var(--ds-spacing-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {module.topics.map((topicKey, index) => (
            <li key={index}>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {t(topicKey)}
              </Paragraph>
            </li>
          ))}
        </ul>
      )}

      {/* Action */}
      <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
        <Button type="button" variant={module.completed ? 'secondary' : 'primary'} data-size="sm">
          {module.completed ? t('training.reviewModule') : t('training.startModule')}
        </Button>
      </div>
    </Card>
  );
}

function CertificationCard({ certification, modules, t }: { certification: Certification; modules: AdminModule[]; t: (key: string) => string }) {
  const requiredModules = modules.filter((m) => certification.modules.includes(m.id));
  const completedCount = requiredModules.filter((m) => m.completed).length;
  const isComplete = completedCount === requiredModules.length;
  const progress = Math.round((completedCount / requiredModules.length) * 100);

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: isComplete ? 'var(--ds-color-success-surface-default)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            {t(certification.titleKey)}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t(certification.descriptionKey)}
          </Paragraph>
        </div>
        {isComplete ? (
          <Badge data-color="success" data-size="md">
            <CheckCircleIcon size={14} style={{ marginRight: 'var(--ds-spacing-1)' }} />
            {t('training.certified')}
          </Badge>
        ) : (
          <Badge data-color="neutral" data-size="md">
            {progress}% {t('training.complete')}
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-4)',
          height: '8px',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: isComplete ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-accent-base-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Module List */}
      <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
        <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
          {t('training.requiredModules')}:
        </Paragraph>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
          {requiredModules.map((module) => (
            <Badge
              key={module.id}
              data-color={module.completed ? 'success' : 'neutral'}
              data-size="sm"
            >
              {module.completed && <CheckCircleIcon size={12} style={{ marginRight: 'var(--ds-spacing-1)' }} />}
              {t(module.titleKey)}
            </Badge>
          ))}
        </div>
      </div>

      {isComplete && certification.issued && (
        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-success-text-default)' }}>
          {t('training.issuedOn')}: {certification.issued}
          {certification.expires && ` | ${t('training.expiresOn')}: ${certification.expires}`}
        </Paragraph>
      )}
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function AdminTrainingPage(): React.ReactElement {
  const t = useT();
  const { data: session, isLoading: authLoading } = useAuth();
  const userRole = session?.user?.role ?? 'user';
  const { isLoading: trainingLoading } = useTraining();

  const isLoading = authLoading || trainingLoading;

  // Check if user has admin access
  const hasAdminAccess = ADMIN_ROLES.includes(userRole);

  // Filter modules based on user role
  const visibleModules = React.useMemo(() => {
    return adminModules.filter((module) => module.roles.includes(userRole)).map((module, index) => ({
      ...module,
      // Demo: mark first module as completed
      completed: index === 0,
    }));
  }, [userRole]);

  // Calculate required modules status
  const requiredModules = visibleModules.filter((m) => m.required);
  const completedRequired = requiredModules.filter((m) => m.completed).length;

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
        <Skeleton width="40%" height={40} style={{ marginBottom: 'var(--ds-spacing-6)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} />
          ))}
        </div>
      </div>
    );
  }

  // Redirect if user doesn't have admin access
  if (!hasAdminAccess) {
    return <Navigate to="/training" replace />;
  }

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
      {/* Back Link */}
      <Link
        to="/training"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
          color: 'var(--ds-color-accent-text-default)',
          textDecoration: 'none',
          marginBottom: 'var(--ds-spacing-4)',
          fontSize: 'var(--ds-font-size-sm)',
        }}
      >
        <ArrowLeftIcon size={16} />
        {t('training.backToTraining')}
      </Link>

      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <Heading level={1} data-size="lg">
            {t('training.adminTraining.page.title')}
          </Heading>
          <Badge data-color="info" data-size="sm">
            <LockClosedIcon size={12} style={{ marginRight: 'var(--ds-spacing-1)' }} />
            {t(`help.roles.${userRole.replace('_', '')}`)}
          </Badge>
        </div>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('training.adminTraining.page.description')}
        </Paragraph>
      </header>

      {/* Required Training Alert */}
      {completedRequired < requiredModules.length && (
        <Alert
          data-color="warning"
          style={{ marginBottom: 'var(--ds-spacing-6)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <ExclamationTriangleIcon size={20} />
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('training.adminTraining.requiredAlert', {
                completed: completedRequired,
                total: requiredModules.length,
              })}
            </Paragraph>
          </div>
        </Alert>
      )}

      {/* Certifications */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('training.certifications.title')}
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {certifications.map((cert) => (
            <CertificationCard key={cert.id} certification={cert} modules={visibleModules} t={t} />
          ))}
        </div>
      </section>

      {/* Training Modules */}
      <section>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('training.adminModules.title')}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {visibleModules.map((module) => (
            <ModuleCard key={module.id} module={module} t={t} />
          ))}
        </div>
      </section>

      {/* Admin Resources */}
      <section
        style={{
          marginTop: 'var(--ds-spacing-8)',
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-lg)',
        }}
      >
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('training.adminResources.title')}
        </Heading>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
          <Button type="button" variant="secondary" data-size="sm" asChild>
            <a href="mailto:admin-support@digilist.no">
              {t('training.adminResources.contactSupport')}
            </a>
          </Button>
          <Button type="button" variant="secondary" data-size="sm">
            {t('training.adminResources.downloadGuide')}
          </Button>
          <Button type="button" variant="secondary" data-size="sm">
            {t('training.adminResources.scheduleTraining')}
          </Button>
        </div>
      </section>
    </div>
  );
}
