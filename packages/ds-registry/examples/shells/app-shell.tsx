import React from 'react';
import { AppShell, ContentLayout, PageHeader, Card, Heading, Paragraph, Button } from '@xala/ds';

/**
 * Example 1: Basic AppShell
 *
 * The simplest way to use AppShell - just wrap your content.
 * This provides a full-height application container with default styling.
 */
export function BasicAppShell() {
  return (
    <AppShell>
      <ContentLayout>
        <Heading size="lg">Welcome to our application</Heading>
        <Paragraph>
          This is the main content area wrapped in a basic AppShell.
        </Paragraph>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 2: AppShell with Header
 *
 * Add a header section to your application shell.
 * The header stays at the top and doesn't scroll with content.
 */
export function AppShellWithHeader() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)'
    }}>
      <Heading size="md">My Application</Heading>
    </div>
  );

  return (
    <AppShell header={header}>
      <ContentLayout>
        <Paragraph>
          The header section remains fixed at the top while the content scrolls.
        </Paragraph>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 3: AppShell with Footer
 *
 * Add a footer section that stays at the bottom of the application.
 */
export function AppShellWithFooter() {
  const footer = (
    <div style={{
      padding: '24px',
      borderTop: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)',
      textAlign: 'center'
    }}>
      <Paragraph size="sm">© 2024 My Application. All rights reserved.</Paragraph>
    </div>
  );

  return (
    <AppShell footer={footer}>
      <ContentLayout>
        <Heading size="lg">Main Content</Heading>
        <Paragraph>
          The footer stays at the bottom of the viewport, even with minimal content.
        </Paragraph>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 4: Complete AppShell with Header and Footer
 *
 * A realistic example showing a complete application layout
 * with both header and footer sections.
 */
export function CompleteAppShell() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Heading size="md">Xala Platform</Heading>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
        <Button variant="tertiary" size="sm">Dashboard</Button>
        <Button variant="tertiary" size="sm">Listings</Button>
        <Button variant="tertiary" size="sm">Bookings</Button>
      </div>
    </div>
  );

  const footer = (
    <div style={{
      padding: '24px',
      borderTop: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)',
      textAlign: 'center'
    }}>
      <Paragraph size="sm">© 2024 Xala Platform. All rights reserved.</Paragraph>
    </div>
  );

  return (
    <AppShell header={header} footer={footer}>
      <ContentLayout headerOffset="md">
        <PageHeader
          title="Dashboard"
          subtitle="View your system overview"
        />
        <div style={{ marginTop: '24px' }}>
          <Card>
            <Heading size="md">Main Content Area</Heading>
            <Paragraph style={{ marginTop: 'var(--ds-spacing-2)' }}>
              This is where your application content goes. The header and footer
              are fixed, while this content area scrolls.
            </Paragraph>
          </Card>
        </div>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 5: Fluid AppShell
 *
 * Use the fluid prop to remove max-width constraints.
 * Useful for dashboard-style applications or data-heavy interfaces.
 */
export function FluidAppShell() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)'
    }}>
      <Heading size="md">Full-Width Dashboard</Heading>
    </div>
  );

  return (
    <AppShell header={header} fluid>
      <ContentLayout fluid padding="24px">
        <Heading size="lg">Dashboard Overview</Heading>
        <Paragraph style={{ marginTop: '16px' }}>
          This layout stretches to fill the entire viewport width.
          Perfect for data tables, charts, and dashboards.
        </Paragraph>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 6: Custom Max Width
 *
 * Customize the maximum width to suit your design needs.
 */
export function CustomMaxWidthAppShell() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)'
    }}>
      <Heading size="md">Compact Layout</Heading>
    </div>
  );

  return (
    <AppShell header={header} maxWidth="1200px">
      <ContentLayout maxWidth="1200px">
        <Heading size="lg">Narrower Content</Heading>
        <Paragraph>
          This shell has a custom max-width of 1200px instead of the default 1440px.
        </Paragraph>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 7: Custom Background
 *
 * Change the background color of the entire shell.
 */
export function CustomBackgroundAppShell() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-brand-1-surface-default)'
    }}>
      <Heading size="md" style={{ color: 'var(--ds-color-brand-1-text-default)' }}>
        Branded Application
      </Heading>
    </div>
  );

  return (
    <AppShell
      header={header}
      background="var(--ds-color-brand-1-background-subtle)"
    >
      <ContentLayout>
        <Card>
          <Heading size="lg">Custom Background</Heading>
          <Paragraph>
            The shell background uses a brand color from the design system tokens.
          </Paragraph>
        </Card>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Example 8: Multi-Section Dashboard Layout
 *
 * A complete dashboard example showing how to combine AppShell
 * with multiple content sections and grid layouts.
 */
export function DashboardAppShell() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Heading size="md">Xala Dashboard</Heading>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
        <Button variant="secondary" size="sm">Settings</Button>
        <Button variant="primary" size="sm">New Booking</Button>
      </div>
    </div>
  );

  const footer = (
    <div style={{
      padding: '16px 24px',
      borderTop: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Paragraph size="sm">© 2024 Xala Platform</Paragraph>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
        <Button variant="tertiary" size="sm">Help</Button>
        <Button variant="tertiary" size="sm">Privacy</Button>
        <Button variant="tertiary" size="sm">Terms</Button>
      </div>
    </div>
  );

  return (
    <AppShell header={header} footer={footer}>
      <ContentLayout
        headerOffset="md"
        padding="32px"
        grid={{
          columns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}
      >
        <Card>
          <Heading size="sm">Total Bookings</Heading>
          <Paragraph style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: 'var(--ds-spacing-2)' }}>
            1,234
          </Paragraph>
          <Paragraph size="sm" style={{ marginTop: '4px', color: 'var(--ds-color-success-text-default)' }}>
            +12% from last month
          </Paragraph>
        </Card>

        <Card>
          <Heading size="sm">Active Listings</Heading>
          <Paragraph style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: 'var(--ds-spacing-2)' }}>
            89
          </Paragraph>
          <Paragraph size="sm" style={{ marginTop: '4px', color: 'var(--ds-color-success-text-default)' }}>
            +5% from last month
          </Paragraph>
        </Card>

        <Card>
          <Heading size="sm">Revenue</Heading>
          <Paragraph style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: 'var(--ds-spacing-2)' }}>
            €45,678
          </Paragraph>
          <Paragraph size="sm" style={{ marginTop: '4px', color: 'var(--ds-color-warning-text-default)' }}>
            -3% from last month
          </Paragraph>
        </Card>
      </ContentLayout>
    </AppShell>
  );
}

/**
 * Best Practices:
 *
 * 1. ✅ Use AppShell as your top-level application container
 * 2. ✅ Combine with ContentLayout for proper content width management
 * 3. ✅ Use headerOffset in ContentLayout when you have a fixed header
 * 4. ✅ Keep header and footer content semantic (use <header> and <footer>)
 * 5. ❌ Don't nest multiple AppShells
 * 6. ❌ Don't put navigation or routing logic in the shell (use AppHeader component)
 * 7. ✅ Use design tokens for background colors
 * 8. ✅ Ensure the shell wrapper contains all your app content
 *
 * Integration with DesignsystemetProvider:
 * Always wrap your application with DesignsystemetProvider before using AppShell.
 * This ensures theme, color scheme, and size settings are properly applied.
 *
 * @example
 * ```typescript
 * import { DesignsystemetProvider, AppShell } from '@xala/ds';
 *
 * function App() {
 *   return (
 *     <DesignsystemetProvider theme="digdir" colorScheme="auto" size="md">
 *       <AppShell header={...} footer={...}>
 *         {/* Your app content *\/}
 *       </AppShell>
 *     </DesignsystemetProvider>
 *   );
 * }
 * ```
 */
