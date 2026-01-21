/**
 * Training Dashboard
 *
 * Main training hub for backoffice administrators.
 * Provides access to tutorials, domain guides, and admin-specific training.
 * Uses role-aware content filtering.
 */
import * as React from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Button,
  Skeleton,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '@xala/auth';
import { useT } from '@xala/i18n';
import { useTraining } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

interface TrainingSection {
  id: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: 'new' | 'updated' | 'required';
}

interface TrainingProgress {
  completed: number;
  total: number;
  percentage: number;
}

// =============================================================================
// Config
// =============================================================================

const trainingSections: TrainingSection[] = [
  {
    id: 'tutorials',
    titleKey: 'training.sections.tutorials.title',
    descriptionKey: 'training.sections.tutorials.description',
    href: '/training/tutorials',
    icon: <BookOpenIcon size={24} />,
    badge: 'new',
  },
  {
    id: 'domain-guides',
    titleKey: 'training.sections.domainGuides.title',
    descriptionKey: 'training.sections.domainGuides.description',
    href: '/training/domain-guides',
    icon: <ClipboardDocumentListIcon size={24} />,
  },
  {
    id: 'admin-training',
    titleKey: 'training.sections.adminTraining.title',
    descriptionKey: 'training.sections.adminTraining.description',
    href: '/training/admin-training',
    icon: <CogIcon size={24} />,
    roles: ['admin', 'tenant_admin', 'org_admin'],
    badge: 'required',
  },
];

// =============================================================================
// Sub-components
// =============================================================================

function ProgressCard({ progress }: { progress: TrainingProgress }) {
  const t = useT();

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-5)',
        background: 'linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-brand-1-surface-default) 100%)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Paragraph
            data-size="sm"
            style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
          >
            {t('training.progress.title')}
          </Paragraph>
          <Heading level={2} data-size="lg" style={{ margin: 0 }}>
            {progress.completed} / {progress.total}
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
            {t('training.progress.modulesCompleted')}
          </Paragraph>
        </div>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AcademicCapIcon size={32} style={{ color: 'var(--ds-color-success-base-default)' }} />
        </div>
      </div>

      {/* Progress bar */}
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
            width: `${progress.percentage}%`,
            height: '100%',
            backgroundColor: 'var(--ds-color-success-base-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', textAlign: 'right' }}>
        {progress.percentage}% {t('training.progress.complete')}
      </Paragraph>
    </Card>
  );
}

function SectionCard({ section }: { section: TrainingSection }) {
  const t = useT();

  return (
    <Link to={section.href} style={{ textDecoration: 'none' }}>
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          height: '100%',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-accent-base-default)',
            }}
          >
            {section.icon}
          </div>
          {section.badge && (
            <Badge
              data-color={section.badge === 'required' ? 'danger' : section.badge === 'new' ? 'success' : 'warning'}
              data-size="sm"
            >
              {t(`training.badges.${section.badge}`)}
            </Badge>
          )}
        </div>

        <Heading level={3} data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)' }}>
          {t(section.titleKey)}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)', flex: 1 }}
        >
          {t(section.descriptionKey)}
        </Paragraph>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            marginTop: 'var(--ds-spacing-4)',
            color: 'var(--ds-color-accent-text-default)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {t('training.viewSection')}
          <ArrowRightIcon size={16} />
        </div>
      </Card>
    </Link>
  );
}

function RecentModuleCard({
  module,
}: {
  module: { id: string; title: string; duration: string; completed: boolean };
}) {
  const t = useT();

  return (
    <div
      style={{
        padding: 'var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-default)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: module.completed
            ? 'var(--ds-color-success-surface-default)'
            : 'var(--ds-color-neutral-surface-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {module.completed ? (
          <CheckCircleIcon size={20} style={{ color: 'var(--ds-color-success-base-default)' }} />
        ) : (
          <ClockIcon size={20} style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
          {module.title}
        </Paragraph>
        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {module.duration}
        </Paragraph>
      </div>
      {module.completed ? (
        <Badge data-color="success" data-size="sm">
          {t('training.completed')}
        </Badge>
      ) : (
        <Button type="button" variant="tertiary" data-size="sm">
          {t('training.continue')}
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function TrainingDashboard(): React.ReactElement {
  const t = useT();
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';
  const { data: trainingData, isLoading } = useTraining();

  // Filter sections based on user role
  const visibleSections = trainingSections.filter((section) => {
    if (!section.roles || section.roles.length === 0) return true;
    return section.roles.includes(userRole);
  });

  // Calculate progress from training data
  const progress: TrainingProgress = React.useMemo(() => {
    if (!trainingData?.data?.plan?.modules) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const total = trainingData.data.plan.modules.length;
    // In a real implementation, this would come from user progress tracking
    const completed = Math.floor(total * 0.3); // Demo: 30% completed
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [trainingData]);

  // Recent modules for quick access
  const recentModules = React.useMemo(() => {
    if (!trainingData?.data?.plan?.modules) {
      return [];
    }
    return trainingData.data.plan.modules.slice(0, 3).map((m, i) => ({
      id: m.id,
      title: m.title,
      duration: m.duration,
      completed: i === 0, // Demo: first module completed
    }));
  }, [trainingData]);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
        <Skeleton width="40%" height={40} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
        <Skeleton width="60%" height={20} style={{ marginBottom: 'var(--ds-spacing-6)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--ds-spacing-5)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <Heading level={1} data-size="lg">
            {t('training.page.title')}
          </Heading>
          <Badge data-color="info" data-size="sm">
            {t(`help.roles.${userRole.replace('_', '')}`)}
          </Badge>
        </div>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('training.page.description')}
        </Paragraph>
      </header>

      {/* Progress Card */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <ProgressCard progress={progress} />
      </div>

      {/* Training Sections Grid */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('training.sections.title')}
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--ds-spacing-5)',
          }}
        >
          {visibleSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      {/* Recent Modules */}
      {recentModules.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="md" style={{ margin: 0 }}>
              {t('training.recentModules.title')}
            </Heading>
            <Link to="/training/tutorials">
              <Button type="button" variant="tertiary" data-size="sm">
                {t('common.seeAll')}
              </Button>
            </Link>
          </div>
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {recentModules.map((module) => (
                <RecentModuleCard key={module.id} module={module} />
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Support Contact */}
      {trainingData?.data?.support && (
        <section
          style={{
            marginTop: 'var(--ds-spacing-8)',
            padding: 'var(--ds-spacing-6)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-lg)',
          }}
        >
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('training.support.title')}
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
            {t('training.support.description')}
          </Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-6)', flexWrap: 'wrap' }}>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('training.support.email')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {trainingData.data.support.email}
              </Paragraph>
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('training.support.phone')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {trainingData.data.support.phone}
              </Paragraph>
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('training.support.hours')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {trainingData.data.support.hours}
              </Paragraph>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
