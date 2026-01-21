/**
 * Domain Guides Page
 *
 * Booking workflow guides and domain-specific documentation.
 * Covers the complete booking lifecycle, calendar management, and communication.
 */
import * as React from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Button,
  Skeleton,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MessageSquareIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useT } from '@xalatechnologies/platform/i18n';
import { useGuides } from '@digilist/client-sdk';
import { HelpLayout, HelpStepList, type TocItem } from '../help/components';

// =============================================================================
// Types
// =============================================================================

interface WorkflowStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  statusColor: string;
}

interface DomainGuide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  steps: string[];
  roles?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// =============================================================================
// Config
// =============================================================================

const bookingWorkflowSteps: WorkflowStep[] = [
  {
    id: 'request',
    titleKey: 'training.workflow.request.title',
    descriptionKey: 'training.workflow.request.description',
    icon: <ClockIcon size={20} />,
    statusColor: 'var(--ds-color-warning-base-default)',
  },
  {
    id: 'review',
    titleKey: 'training.workflow.review.title',
    descriptionKey: 'training.workflow.review.description',
    icon: <UsersIcon size={20} />,
    statusColor: 'var(--ds-color-info-base-default)',
  },
  {
    id: 'decision',
    titleKey: 'training.workflow.decision.title',
    descriptionKey: 'training.workflow.decision.description',
    icon: <CheckCircleIcon size={20} />,
    statusColor: 'var(--ds-color-accent-base-default)',
  },
  {
    id: 'confirmation',
    titleKey: 'training.workflow.confirmation.title',
    descriptionKey: 'training.workflow.confirmation.description',
    icon: <MessageSquareIcon size={20} />,
    statusColor: 'var(--ds-color-success-base-default)',
  },
  {
    id: 'completion',
    titleKey: 'training.workflow.completion.title',
    descriptionKey: 'training.workflow.completion.description',
    icon: <ChartBarIcon size={20} />,
    statusColor: 'var(--ds-color-brand-1-base-default)',
  },
];

const domainGuides: DomainGuide[] = [
  {
    id: 'booking-approval-process',
    titleKey: 'training.domainGuides.bookingApproval.title',
    descriptionKey: 'training.domainGuides.bookingApproval.description',
    icon: <CheckCircleIcon size={24} />,
    steps: [
      'training.domainGuides.bookingApproval.step1',
      'training.domainGuides.bookingApproval.step2',
      'training.domainGuides.bookingApproval.step3',
      'training.domainGuides.bookingApproval.step4',
      'training.domainGuides.bookingApproval.step5',
    ],
    difficulty: 'beginner',
  },
  {
    id: 'booking-rejection',
    titleKey: 'training.domainGuides.bookingRejection.title',
    descriptionKey: 'training.domainGuides.bookingRejection.description',
    icon: <XCircleIcon size={24} />,
    steps: [
      'training.domainGuides.bookingRejection.step1',
      'training.domainGuides.bookingRejection.step2',
      'training.domainGuides.bookingRejection.step3',
      'training.domainGuides.bookingRejection.step4',
    ],
    difficulty: 'beginner',
  },
  {
    id: 'calendar-management',
    titleKey: 'training.domainGuides.calendarManagement.title',
    descriptionKey: 'training.domainGuides.calendarManagement.description',
    icon: <CalendarIcon size={24} />,
    steps: [
      'training.domainGuides.calendarManagement.step1',
      'training.domainGuides.calendarManagement.step2',
      'training.domainGuides.calendarManagement.step3',
      'training.domainGuides.calendarManagement.step4',
      'training.domainGuides.calendarManagement.step5',
    ],
    difficulty: 'intermediate',
  },
  {
    id: 'conflict-resolution',
    titleKey: 'training.domainGuides.conflictResolution.title',
    descriptionKey: 'training.domainGuides.conflictResolution.description',
    icon: <UsersIcon size={24} />,
    steps: [
      'training.domainGuides.conflictResolution.step1',
      'training.domainGuides.conflictResolution.step2',
      'training.domainGuides.conflictResolution.step3',
      'training.domainGuides.conflictResolution.step4',
    ],
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'payment-handling',
    titleKey: 'training.domainGuides.paymentHandling.title',
    descriptionKey: 'training.domainGuides.paymentHandling.description',
    icon: <CurrencyDollarIcon size={24} />,
    steps: [
      'training.domainGuides.paymentHandling.step1',
      'training.domainGuides.paymentHandling.step2',
      'training.domainGuides.paymentHandling.step3',
      'training.domainGuides.paymentHandling.step4',
      'training.domainGuides.paymentHandling.step5',
    ],
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'communication-best-practices',
    titleKey: 'training.domainGuides.communication.title',
    descriptionKey: 'training.domainGuides.communication.description',
    icon: <MessageSquareIcon size={24} />,
    steps: [
      'training.domainGuides.communication.step1',
      'training.domainGuides.communication.step2',
      'training.domainGuides.communication.step3',
      'training.domainGuides.communication.step4',
    ],
    difficulty: 'beginner',
  },
];

// =============================================================================
// Sub-components
// =============================================================================

function WorkflowDiagram({ steps, t }: { steps: WorkflowStep[]; t: (key: string) => string }) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-8)' }}>
      <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-6)' }}>
        {t('training.workflow.title')}
      </Heading>

      {/* Workflow Steps */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--ds-spacing-4)',
          justifyContent: 'space-between',
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div
              style={{
                flex: '1 1 150px',
                minWidth: '150px',
                maxWidth: '180px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: step.statusColor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--ds-spacing-3)',
                }}
              >
                {step.icon}
              </div>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                }}
              >
                {t(step.titleKey)}
              </Paragraph>
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {t(step.descriptionKey)}
              </Paragraph>
            </div>

            {/* Arrow (except after last step) */}
            {index < steps.length - 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--ds-spacing-4) 0',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                <ArrowRightIcon size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

function DifficultyBadge({ difficulty, t }: { difficulty: DomainGuide['difficulty']; t: (key: string) => string }) {
  const config = {
    beginner: { labelKey: 'training.difficulty.beginner', color: 'success' as const },
    intermediate: { labelKey: 'training.difficulty.intermediate', color: 'warning' as const },
    advanced: { labelKey: 'training.difficulty.advanced', color: 'danger' as const },
  };

  const { labelKey, color } = config[difficulty];

  return (
    <Badge data-color={color} data-size="sm">
      {t(labelKey)}
    </Badge>
  );
}

function GuideCard({ guide, t }: { guide: DomainGuide; t: (key: string) => string }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card style={{ padding: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
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
              flexShrink: 0,
            }}
          >
            {guide.icon}
          </div>
          <div>
            <Heading
              level={3}
              data-size="sm"
              id={guide.id}
              style={{
                margin: 0,
                scrollMarginTop: 'var(--ds-spacing-6)',
              }}
            >
              {t(guide.titleKey)}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t(guide.descriptionKey)}
            </Paragraph>
          </div>
        </div>
        <DifficultyBadge difficulty={guide.difficulty} t={t} />
      </div>

      {/* Steps (collapsible) */}
      <Button
        type="button"
        variant="tertiary"
        data-size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ marginBottom: isExpanded ? 'var(--ds-spacing-4)' : 0 }}
      >
        {isExpanded ? t('training.hideSteps') : t('training.showSteps')}
      </Button>

      {isExpanded && (
        <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
          <HelpStepList steps={guide.steps.map((stepKey) => t(stepKey))} />
        </div>
      )}

      {/* Role info */}
      {guide.roles && guide.roles.length > 0 && (
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginTop: 'var(--ds-spacing-4)',
            color: 'var(--ds-color-neutral-text-subtle)',
            fontStyle: 'italic',
          }}
        >
          {t('training.availableFor')} {guide.roles.join(', ')}
        </Paragraph>
      )}
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function DomainGuidesPage(): React.ReactElement {
  const t = useT();
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';
  const { isLoading } = useGuides(userRole);

  // Filter guides based on user role
  const visibleGuides = domainGuides.filter((guide) => {
    if (!guide.roles || guide.roles.length === 0) return true;
    return guide.roles.includes(userRole);
  });

  // Create TOC items from visible guides
  const tocItems: TocItem[] = visibleGuides.map((guide) => ({
    id: guide.id,
    title: t(guide.titleKey),
    roles: guide.roles,
  }));

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
        <Skeleton width="40%" height={40} style={{ marginBottom: 'var(--ds-spacing-6)' }} />
        <Skeleton height={200} style={{ marginBottom: 'var(--ds-spacing-6)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={150} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <HelpLayout
      title={t('training.domainGuides.page.title')}
      description={t('training.domainGuides.page.description')}
      tocItems={tocItems}
      showBackButton={false}
    >
      {/* Back Link */}
      <Link
        to="/training"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
          color: 'var(--ds-color-accent-text-default)',
          textDecoration: 'none',
          marginBottom: 'var(--ds-spacing-6)',
          fontSize: 'var(--ds-font-size-sm)',
        }}
      >
        <ArrowLeftIcon size={16} />
        {t('training.backToTraining')}
      </Link>

      {/* Booking Workflow Diagram */}
      <WorkflowDiagram steps={bookingWorkflowSteps} t={t} />

      {/* Domain Guides */}
      <section>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('training.domainGuides.guidesTitle')}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {visibleGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} t={t} />
          ))}
        </div>
      </section>

      {/* Best Practices Section */}
      <section
        style={{
          marginTop: 'var(--ds-spacing-8)',
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
        }}
      >
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('training.domainGuides.bestPractices.title')}
        </Heading>
        <ul
          style={{
            margin: 0,
            paddingLeft: 'var(--ds-spacing-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <li>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('training.domainGuides.bestPractices.tip1')}
            </Paragraph>
          </li>
          <li>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('training.domainGuides.bestPractices.tip2')}
            </Paragraph>
          </li>
          <li>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('training.domainGuides.bestPractices.tip3')}
            </Paragraph>
          </li>
          <li>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('training.domainGuides.bestPractices.tip4')}
            </Paragraph>
          </li>
        </ul>
      </section>
    </HelpLayout>
  );
}
