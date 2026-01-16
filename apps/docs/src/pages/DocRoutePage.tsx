/**
 * DocRoutePage Component
 *
 * A dynamic documentation page component that renders MDX content based on
 * the current route, using the docsNav registry as the source of truth.
 *
 * Uses @xala/ds components exclusively per design system guardrails.
 */

import { useLocation } from 'react-router-dom';
import { Heading, Paragraph, Card, Badge } from '@xala/ds';
import { MDXProvider } from '@mdx-js/react';
import { Suspense, lazy, useMemo } from 'react';
import { DocPage, Checklist, CodeBlock } from '../components/docs';
import { findNavItemByHref, getParentSection, getBreadcrumbs } from '../navigation/docsNav';
import { mdxComponents } from '../mdx-components';
import { hasContent, getContentLoader } from '../content';

/**
 * Loading indicator for MDX content
 */
function ContentLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--ds-spacing-10)',
      }}
    >
      <Paragraph>Loading content...</Paragraph>
    </div>
  );
}

/**
 * Error fallback when content fails to load
 */
function ContentError({ path }: { path: string }) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-6)' }}>
      <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        Content Not Found
      </Heading>
      <Paragraph>
        The content for <code>{path}</code> could not be loaded.
        Please check that the MDX file exists.
      </Paragraph>
    </Card>
  );
}

/**
 * Placeholder content for routes without MDX files
 */
function PlaceholderContent({ name, description }: { name: string; description?: string }) {
  return (
    <>
      {/* Overview card */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Overview
        </Heading>
        <Paragraph>
          This is the documentation page for <strong>{name}</strong>.
          Content for this section will be added as documentation is developed.
        </Paragraph>
        {description && (
          <Paragraph style={{ marginTop: 'var(--ds-spacing-3)' }}>
            <em>{description}</em>
          </Paragraph>
        )}
      </Card>

      {/* Quick Start checklist */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Quick Start
        </Heading>
        <Checklist
          items={[
            { text: `Read the ${name} overview`, checked: true },
            { text: 'Understand related concepts', checked: false },
            { text: 'Try the examples', checked: false },
            { text: 'Review the API reference', checked: false },
          ]}
        />
      </Card>

      {/* Example code */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Example
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Here&apos;s a typical usage example for this feature:
        </Paragraph>
        <CodeBlock
          code={`// Example code for ${name}
// This will be replaced with actual implementation examples

import { useFeature } from '@digilist/client-sdk/hooks';

function MyComponent() {
  // Implementation details coming soon
  return <div>Hello from ${name}!</div>;
}
`}
          language="tsx"
          title="example.tsx"
          showLineNumbers
        />
      </Card>
    </>
  );
}

export function DocRoutePage() {
  const location = useLocation();
  const navItem = findNavItemByHref(location.pathname);
  const parentSection = getParentSection(location.pathname);
  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Memoize the lazy-loaded component to prevent re-creating on every render
  const MdxContent = useMemo(() => {
    if (!hasContent(location.pathname)) {
      return null;
    }
    const loader = getContentLoader(location.pathname);
    if (!loader) {
      return null;
    }
    return lazy(loader);
  }, [location.pathname]);

  // If no matching nav item, show not found
  if (!navItem) {
    return (
      <DocPage
        title="Page Not Found"
        description="This page doesn't exist in the navigation registry."
      >
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Paragraph>
            The requested page at <code>{location.pathname}</code> is not configured
            in the documentation navigation.
          </Paragraph>
        </Card>
      </DocPage>
    );
  }

  // Build breadcrumb display
  const breadcrumbDisplay = breadcrumbs.length > 1 && (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          {index > 0 && <span>/</span>}
          <span style={{ color: index === breadcrumbs.length - 1 ? 'var(--ds-color-neutral-text-default)' : undefined }}>
            {crumb.name}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <DocPage
      title={navItem.name}
      description={navItem.description}
      breadcrumb={breadcrumbDisplay}
      lastUpdated="January 2025"
    >
      {/* Section badge */}
      {parentSection?.title && (
        <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
          <Badge color="info">{parentSection.title}</Badge>
        </div>
      )}

      {/* Content: MDX if available, otherwise placeholder */}
      {MdxContent ? (
        <MDXProvider components={mdxComponents}>
          <Suspense fallback={<ContentLoading />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <MdxContent />
            </div>
          </Suspense>
        </MDXProvider>
      ) : (
        <PlaceholderContent name={navItem.name} description={navItem.description} />
      )}
    </DocPage>
  );
}
