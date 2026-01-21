/**
 * Help Guides Page
 *
 * Step-by-step guides with role-aware content and right-side TOC.
 * Different roles see different guides based on their permissions.
 */
import * as React from 'react';
import { Card, Paragraph, Badge } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useT } from '@xalatechnologies/platform/i18n';
import { HelpLayout, HelpStepList, type TocItem } from './components';

// =============================================================================
// Guide Data
// =============================================================================

interface GuideConfig {
  id: string;
  /** Translation key prefix for title, description, and steps */
  translationKey: string;
  /** Number of steps in this guide */
  stepCount: number;
  /** Roles that can see this guide. Empty = all roles */
  roles?: string[];
  /** Icon for the guide */
  icon?: string;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const allGuideConfigs: GuideConfig[] = [
  // === Guides for all users ===
  {
    id: 'booking-approval',
    translationKey: 'bookingApproval',
    stepCount: 7,
    icon: 'CheckIcon',
    difficulty: 'beginner',
  },
  {
    id: 'calendar-view',
    translationKey: 'calendarView',
    stepCount: 6,
    icon: 'CalendarIcon',
    difficulty: 'beginner',
  },
  {
    id: 'messages',
    translationKey: 'messages',
    stepCount: 6,
    icon: 'ChatIcon',
    difficulty: 'beginner',
  },
  // === Guides for org_admin and above ===
  {
    id: 'user-management',
    translationKey: 'userManagement',
    stepCount: 7,
    icon: 'PeopleIcon',
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'rental-object-create',
    translationKey: 'rentalObjectCreate',
    stepCount: 8,
    icon: 'BuildingIcon',
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'reports-export',
    translationKey: 'reportsExport',
    stepCount: 6,
    icon: 'ChartIcon',
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  // === Guides for tenant_admin and above ===
  {
    id: 'org-settings',
    translationKey: 'orgSettings',
    stepCount: 7,
    icon: 'SettingsIcon',
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin'],
  },
  {
    id: 'integrations',
    translationKey: 'integrations',
    stepCount: 6,
    icon: 'LinkIcon',
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin'],
  },
  // === Admin-only guides ===
  {
    id: 'feature-flags',
    translationKey: 'featureFlags',
    stepCount: 6,
    icon: 'FlagIcon',
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin'],
  },
];

// =============================================================================
// Helpers
// =============================================================================

interface DifficultyBadgeProps {
  difficulty: GuideConfig['difficulty'];
  t: (key: string) => string;
}

function DifficultyBadge({ difficulty, t }: DifficultyBadgeProps): React.ReactElement | null {
  if (!difficulty) return null;

  const config = {
    beginner: { label: t('help.guides.difficulty.beginner'), color: 'success' as const },
    intermediate: { label: t('help.guides.difficulty.intermediate'), color: 'warning' as const },
    advanced: { label: t('help.guides.difficulty.advanced'), color: 'danger' as const },
  };

  const { label, color } = config[difficulty];

  return (
    <Badge data-color={color} data-size="sm">
      {label}
    </Badge>
  );
}

// =============================================================================
// Component
// =============================================================================

export default function GuidesPage(): React.ReactElement {
  const { data: session } = useAuth();
  const t = useT();
  const userRole = session?.user?.role ?? 'org_member';

  // Filter guides based on user role
  const visibleGuideConfigs = allGuideConfigs.filter((guide) => {
    if (!guide.roles || guide.roles.length === 0) return true;
    return guide.roles.includes(userRole);
  });

  // Create TOC items from visible guides
  const tocItems: TocItem[] = visibleGuideConfigs.map((guide) => ({
    id: guide.id,
    title: t(`help.guides.${guide.translationKey}.title`),
    roles: guide.roles,
  }));

  // Helper to get steps for a guide
  const getSteps = (translationKey: string, stepCount: number): string[] => {
    return Array.from({ length: stepCount }, (_, i) =>
      t(`help.guides.${translationKey}.step${i + 1}`)
    );
  };

  return (
    <HelpLayout
      title={t('help.guides.page.title')}
      description={t('help.guides.description')}
      tocItems={tocItems}
      showBackButton
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {visibleGuideConfigs.map((guide) => (
          <Card key={guide.id} style={{ padding: 'var(--ds-spacing-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 'var(--ds-spacing-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                {guide.icon && (
                  <span style={{ fontSize: '1.5rem' }}>{guide.icon}</span>
                )}
                <div>
                  <h2
                    id={guide.id}
                    style={{
                      margin: 0,
                      fontSize: 'var(--ds-font-size-md)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      scrollMarginTop: 'var(--ds-spacing-6)',
                    }}
                  >
                    {t(`help.guides.${guide.translationKey}.title`)}
                  </h2>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      marginTop: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {t(`help.guides.${guide.translationKey}.description`)}
                  </Paragraph>
                </div>
              </div>
              <DifficultyBadge difficulty={guide.difficulty} t={t} />
            </div>

            <HelpStepList steps={getSteps(guide.translationKey, guide.stepCount)} />

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
                {t('help.guides.availableFor')} {guide.roles.join(', ')}
              </Paragraph>
            )}
          </Card>
        ))}
      </div>

      {visibleGuideConfigs.length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('help.guides.noGuidesAvailable')}
          </Paragraph>
        </Card>
      )}
    </HelpLayout>
  );
}
