/**
 * Interactive Tutorials Page
 *
 * Step-by-step tutorials for backoffice administrators.
 * Includes video tutorials, interactive walkthroughs, and completion tracking.
 */
import * as React from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Button,
  Skeleton,
  Input,
  PlayCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useT } from '@xalatechnologies/platform/i18n';
import { useTraining } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

interface Tutorial {
  id: string;
  titleKey: string;
  descriptionKey: string;
  duration: string;
  type: 'video' | 'interactive' | 'document';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  roles?: string[];
  completed?: boolean;
}

// =============================================================================
// Config
// =============================================================================

const tutorials: Tutorial[] = [
  // Getting Started
  {
    id: 'intro-dashboard',
    titleKey: 'training.tutorials.introDashboard.title',
    descriptionKey: 'training.tutorials.introDashboard.description',
    duration: '5 min',
    type: 'video',
    difficulty: 'beginner',
    category: 'getting-started',
  },
  {
    id: 'navigation-basics',
    titleKey: 'training.tutorials.navigationBasics.title',
    descriptionKey: 'training.tutorials.navigationBasics.description',
    duration: '3 min',
    type: 'interactive',
    difficulty: 'beginner',
    category: 'getting-started',
  },
  {
    id: 'user-profile-setup',
    titleKey: 'training.tutorials.userProfileSetup.title',
    descriptionKey: 'training.tutorials.userProfileSetup.description',
    duration: '4 min',
    type: 'interactive',
    difficulty: 'beginner',
    category: 'getting-started',
  },
  // Booking Management
  {
    id: 'booking-overview',
    titleKey: 'training.tutorials.bookingOverview.title',
    descriptionKey: 'training.tutorials.bookingOverview.description',
    duration: '8 min',
    type: 'video',
    difficulty: 'beginner',
    category: 'bookings',
  },
  {
    id: 'approve-reject-bookings',
    titleKey: 'training.tutorials.approveRejectBookings.title',
    descriptionKey: 'training.tutorials.approveRejectBookings.description',
    duration: '6 min',
    type: 'interactive',
    difficulty: 'beginner',
    category: 'bookings',
  },
  {
    id: 'booking-conflicts',
    titleKey: 'training.tutorials.bookingConflicts.title',
    descriptionKey: 'training.tutorials.bookingConflicts.description',
    duration: '10 min',
    type: 'video',
    difficulty: 'intermediate',
    category: 'bookings',
  },
  // Rental Objects
  {
    id: 'create-rental-object',
    titleKey: 'training.tutorials.createRentalObject.title',
    descriptionKey: 'training.tutorials.createRentalObject.description',
    duration: '12 min',
    type: 'interactive',
    difficulty: 'intermediate',
    category: 'rental-objects',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'manage-availability',
    titleKey: 'training.tutorials.manageAvailability.title',
    descriptionKey: 'training.tutorials.manageAvailability.description',
    duration: '8 min',
    type: 'video',
    difficulty: 'intermediate',
    category: 'rental-objects',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'pricing-configuration',
    titleKey: 'training.tutorials.pricingConfiguration.title',
    descriptionKey: 'training.tutorials.pricingConfiguration.description',
    duration: '15 min',
    type: 'document',
    difficulty: 'advanced',
    category: 'rental-objects',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  // User Management
  {
    id: 'invite-users',
    titleKey: 'training.tutorials.inviteUsers.title',
    descriptionKey: 'training.tutorials.inviteUsers.description',
    duration: '5 min',
    type: 'interactive',
    difficulty: 'beginner',
    category: 'users',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  {
    id: 'manage-roles',
    titleKey: 'training.tutorials.manageRoles.title',
    descriptionKey: 'training.tutorials.manageRoles.description',
    duration: '10 min',
    type: 'video',
    difficulty: 'intermediate',
    category: 'users',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
  // Reports
  {
    id: 'generate-reports',
    titleKey: 'training.tutorials.generateReports.title',
    descriptionKey: 'training.tutorials.generateReports.description',
    duration: '7 min',
    type: 'interactive',
    difficulty: 'intermediate',
    category: 'reports',
    roles: ['admin', 'tenant_admin', 'org_admin'],
  },
];

const categories = [
  { id: 'all', labelKey: 'training.categories.all' },
  { id: 'getting-started', labelKey: 'training.categories.gettingStarted' },
  { id: 'bookings', labelKey: 'training.categories.bookings' },
  { id: 'rental-objects', labelKey: 'training.categories.rentalObjects' },
  { id: 'users', labelKey: 'training.categories.users' },
  { id: 'reports', labelKey: 'training.categories.reports' },
];

// =============================================================================
// Sub-components
// =============================================================================

function TypeIcon({ type }: { type: Tutorial['type'] }) {
  switch (type) {
    case 'video':
      return <VideoCameraIcon size={16} />;
    case 'interactive':
      return <PlayCircleIcon size={16} />;
    case 'document':
      return <DocumentTextIcon size={16} />;
    default:
      return <LinkIcon size={16} />;
  }
}

function DifficultyBadge({ difficulty, t }: { difficulty: Tutorial['difficulty']; t: (key: string) => string }) {
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

function TutorialCard({ tutorial, t }: { tutorial: Tutorial; t: (key: string) => string }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-5)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--ds-shadow-md)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-3)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: tutorial.completed
              ? 'var(--ds-color-success-surface-default)'
              : 'var(--ds-color-accent-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tutorial.completed
              ? 'var(--ds-color-success-base-default)'
              : 'var(--ds-color-accent-base-default)',
          }}
        >
          {tutorial.completed ? <CheckCircleIcon size={20} /> : <TypeIcon type={tutorial.type} />}
        </div>
        <DifficultyBadge difficulty={tutorial.difficulty} t={t} />
      </div>

      {/* Content */}
      <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
        {t(tutorial.titleKey)}
      </Heading>
      <Paragraph
        data-size="sm"
        style={{
          margin: 0,
          color: 'var(--ds-color-neutral-text-subtle)',
          flex: 1,
        }}
      >
        {t(tutorial.descriptionKey)}
      </Paragraph>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--ds-spacing-4)',
          paddingTop: 'var(--ds-spacing-3)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <ClockIcon size={14} style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {tutorial.duration}
          </Paragraph>
        </div>
        <Button type="button" variant={tutorial.completed ? 'tertiary' : 'primary'} data-size="sm">
          {tutorial.completed ? t('training.review') : t('training.start')}
        </Button>
      </div>
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function TutorialsPage(): React.ReactElement {
  const t = useT();
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';
  const { isLoading } = useTraining();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Filter tutorials based on role, search, and category
  const filteredTutorials = React.useMemo(() => {
    return tutorials.filter((tutorial) => {
      // Role filter
      if (tutorial.roles && tutorial.roles.length > 0 && !tutorial.roles.includes(userRole)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && tutorial.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = t(tutorial.titleKey).toLowerCase();
        const description = t(tutorial.descriptionKey).toLowerCase();
        return title.includes(query) || description.includes(query);
      }
      return true;
    });
  }, [userRole, selectedCategory, searchQuery, t]);

  // Group tutorials by category for display
  const groupedTutorials = React.useMemo(() => {
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredTutorials };
    }
    return filteredTutorials.reduce(
      (acc, tutorial) => {
        if (!acc[tutorial.category]) {
          acc[tutorial.category] = [];
        }
        acc[tutorial.category].push(tutorial);
        return acc;
      },
      {} as Record<string, Tutorial[]>
    );
  }, [filteredTutorials, selectedCategory]);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
        <Skeleton width="40%" height={40} style={{ marginBottom: 'var(--ds-spacing-6)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--ds-spacing-5)' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height={240} />
          ))}
        </div>
      </div>
    );
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
        <Heading level={1} data-size="lg">
          {t('training.tutorials.page.title')}
        </Heading>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('training.tutorials.page.description')}
        </Paragraph>
      </header>

      {/* Search and Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <MagnifyingGlassIcon
            size={18}
            style={{
              position: 'absolute',
              left: 'var(--ds-spacing-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('training.searchPlaceholder')}
            style={{ paddingLeft: 'var(--ds-spacing-9)' }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={selectedCategory === category.id ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {t(category.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tutorials List */}
      {Object.entries(groupedTutorials).length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('training.noTutorialsFound')}
          </Paragraph>
        </Card>
      ) : (
        Object.entries(groupedTutorials).map(([category, categoryTutorials]) => (
          <section key={category} style={{ marginBottom: 'var(--ds-spacing-8)' }}>
            {selectedCategory === 'all' && (
              <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t(`training.categories.${category.replace('-', '')}`)}
              </Heading>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--ds-spacing-5)',
              }}
            >
              {categoryTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} t={t} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
