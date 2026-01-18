import React from 'react';
import { ContentLayout, Card, Heading, Paragraph } from '@xala/ds';

/**
 * Example 1: Basic ContentLayout
 *
 * The simplest way to use ContentLayout - just wrap your content.
 * This provides a centered container with sensible defaults.
 */
export function BasicContentLayout() {
  return (
    <ContentLayout>
      <Heading size="lg">Welcome to our platform</Heading>
      <Paragraph>
        This content is automatically centered and has appropriate padding.
      </Paragraph>
    </ContentLayout>
  );
}

/**
 * Example 2: Custom Width and Padding
 *
 * Customize the maximum width and padding to suit your design needs.
 */
export function CustomDimensionsLayout() {
  return (
    <ContentLayout maxWidth="1200px" padding="24px">
      <Card>
        <Heading size="md">Custom container dimensions</Heading>
        <Paragraph>
          This layout has a narrower max-width (1200px) and less padding (24px)
          than the default settings.
        </Paragraph>
      </Card>
    </ContentLayout>
  );
}

/**
 * Example 3: Fluid Layout
 *
 * For full-width layouts, use the fluid prop. This removes the max-width
 * constraint and allows content to span the entire viewport.
 */
export function FluidContentLayout() {
  return (
    <ContentLayout fluid padding="16px">
      <Card>
        <Heading size="md">Full-width layout</Heading>
        <Paragraph>
          This content stretches to fill the available width, useful for
          dashboards or data-heavy interfaces.
        </Paragraph>
      </Card>
    </ContentLayout>
  );
}

/**
 * Example 4: Layout with Header Offset
 *
 * When you have a fixed header, use headerOffset to add appropriate
 * top padding so content doesn't hide behind it.
 */
export function LayoutWithHeaderOffset() {
  return (
    <ContentLayout headerOffset="md">
      <Heading size="lg">Page Title</Heading>
      <Paragraph>
        This layout accounts for a fixed header with medium height (64px).
        The content starts below the header.
      </Paragraph>
    </ContentLayout>
  );
}

/**
 * Example 5: Grid Layout Integration
 *
 * ContentLayout can integrate with Grid to create structured layouts.
 * This is useful for dashboard-style pages or card grids.
 */
export function GridContentLayout() {
  return (
    <ContentLayout
      grid={{
        columns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}
    >
      <Card>
        <Heading size="sm">Card 1</Heading>
        <Paragraph>Grid item content</Paragraph>
      </Card>
      <Card>
        <Heading size="sm">Card 2</Heading>
        <Paragraph>Grid item content</Paragraph>
      </Card>
      <Card>
        <Heading size="sm">Card 3</Heading>
        <Paragraph>Grid item content</Paragraph>
      </Card>
    </ContentLayout>
  );
}

/**
 * Example 6: Complete Page Layout
 *
 * A realistic example showing how to compose ContentLayout with
 * other components for a complete page.
 */
export function CompletePageLayout() {
  return (
    <ContentLayout headerOffset="lg" padding="32px">
      <Heading size="xl">Dashboard Overview</Heading>
      <Paragraph style={{ marginTop: '16px', marginBottom: '32px' }}>
        Monitor your key metrics and system status at a glance.
      </Paragraph>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <Card>
          <Heading size="sm">Active Users</Heading>
          <Paragraph style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: 'var(--ds-spacing-2)' }}>
            1,234
          </Paragraph>
        </Card>
        <Card>
          <Heading size="sm">Total Bookings</Heading>
          <Paragraph style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: 'var(--ds-spacing-2)' }}>
            567
          </Paragraph>
        </Card>
        <Card>
          <Heading size="sm">Revenue</Heading>
          <Paragraph style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: 'var(--ds-spacing-2)' }}>
            €89,012
          </Paragraph>
        </Card>
      </div>

      <Card>
        <Heading size="md">Recent Activity</Heading>
        <Paragraph style={{ marginTop: 'var(--ds-spacing-2)' }}>
          Activity feed would go here...
        </Paragraph>
      </Card>
    </ContentLayout>
  );
}

/**
 * Best Practices:
 *
 * 1. ✅ Use ContentLayout as your main page container
 * 2. ✅ Set headerOffset when you have fixed headers
 * 3. ✅ Use fluid for data-heavy or dashboard interfaces
 * 4. ✅ Combine with grid prop for structured layouts
 * 5. ❌ Don't nest multiple ContentLayouts
 * 6. ❌ Don't override the container-name style property
 * 7. ✅ Use with ContentSection for page sections
 * 8. ✅ Keep maxWidth reasonable for readability (1200-1440px)
 *
 * Integration with AppShell:
 * ContentLayout works best inside AppShell's main content area.
 * AppShell handles the overall page structure (header, nav, footer),
 * while ContentLayout manages the content width and layout.
 */

/**
 * Example 7: Responsive Grid Configuration
 *
 * While ContentLayout's grid prop doesn't support responsive breakpoints directly,
 * you can use CSS Grid's auto-fit and minmax for responsive behavior.
 */
export function ResponsiveGridLayout() {
  return (
    <ContentLayout
      grid={{
        columns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'var(--ds-spacing-4)'
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <Heading size="sm">Item {i + 1}</Heading>
          <Paragraph>Responsive grid item</Paragraph>
        </Card>
      ))}
    </ContentLayout>
  );
}
