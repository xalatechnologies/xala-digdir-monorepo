/**
 * Docs Home Page
 *
 * Landing page for the Global Documentation Portal.
 * Platform-only - no @digilist/* imports.
 */

import { Link } from 'react-router-dom';
import {
  Heading,
  Paragraph,
  Card,
  TableIcon,
  BookOpenIcon,
  BuildingIcon,
  GridIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

interface DocSection {
  path: string;
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  icon: React.ReactNode;
}

const DOC_SECTIONS: DocSection[] = [
  {
    path: '/api-reference',
    titleKey: 'docs.sections.apiReference.title',
    titleFallback: 'API Reference',
    descriptionKey: 'docs.sections.apiReference.description',
    descriptionFallback: 'Complete API documentation with endpoints, request/response schemas, and authentication guides.',
    icon: <TableIcon size={32} />,
  },
  {
    path: '/sdk-guide',
    titleKey: 'docs.sections.sdkGuide.title',
    titleFallback: 'SDK Guide',
    descriptionKey: 'docs.sections.sdkGuide.description',
    descriptionFallback: 'Learn how to use our client SDKs with React Query hooks, services, and real-time features.',
    icon: <BookOpenIcon size={32} />,
  },
  {
    path: '/architecture',
    titleKey: 'docs.sections.architecture.title',
    titleFallback: 'Architecture',
    descriptionKey: 'docs.sections.architecture.description',
    descriptionFallback: 'System architecture documentation including monorepo structure, packages, and design decisions.',
    icon: <BuildingIcon size={32} />,
  },
  {
    path: '/components',
    titleKey: 'docs.sections.components.title',
    titleFallback: 'Component Library',
    descriptionKey: 'docs.sections.components.description',
    descriptionFallback: 'Design system components with usage examples, props documentation, and accessibility guidelines.',
    icon: <GridIcon size={32} />,
  },
];

export function DocsHomePage() {
  const t = useT();

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)', textAlign: 'center' }}>
        <Heading level={1} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.home.title') || 'Xala Platform Documentation'}
        </Heading>
        <Paragraph
          data-size="lg"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '600px', margin: '0 auto' }}
        >
          {t('docs.home.description') ||
            'Welcome to the Xala Platform documentation. Find guides, API references, and everything you need to build with our platform.'}
        </Paragraph>
      </header>

      {/* Section Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--ds-spacing-6)',
          marginBottom: 'var(--ds-spacing-8)',
        }}
      >
        {DOC_SECTIONS.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card
              style={{
                padding: 'var(--ds-spacing-6)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ color: 'var(--ds-color-accent-text-default)' }}>{section.icon}</div>
              <Heading level={3} style={{ margin: 0 }}>
                {t(section.titleKey) || section.titleFallback}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t(section.descriptionKey) || section.descriptionFallback}
              </Paragraph>
            </Card>
          </Link>
        ))}
      </section>

      {/* Quick Start Section */}
      <section
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          padding: 'var(--ds-spacing-6)',
          border: '1px solid var(--ds-color-neutral-border-default)',
        }}
      >
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.home.quickStart.title') || 'Quick Start'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.home.quickStart.description') ||
            'Get started with the Xala Platform in just a few steps:'}
        </Paragraph>
        <ol style={{ paddingLeft: 'var(--ds-spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          <li>
            <Paragraph>
              {t('docs.home.quickStart.step1') || 'Install the SDK package: '}
              <code>pnpm add @digilist/client-sdk</code>
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              {t('docs.home.quickStart.step2') || 'Initialize the client with your API credentials'}
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              {t('docs.home.quickStart.step3') || 'Use React Query hooks to fetch and manage data'}
            </Paragraph>
          </li>
        </ol>
      </section>
    </div>
  );
}

export default DocsHomePage;
