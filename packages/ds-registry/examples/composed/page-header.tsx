import React from 'react';
import { PageHeader, Button, Card, Paragraph } from '@xala/ds';

/**
 * Example 1: Basic PageHeader
 *
 * The simplest way to use PageHeader - just provide a title.
 * This creates a consistent page header with proper spacing.
 */
export function BasicPageHeader() {
  return (
    <PageHeader title="Dashboard" />
  );
}

/**
 * Example 2: PageHeader with Subtitle
 *
 * Add a subtitle to provide additional context about the page.
 * The subtitle appears below the title with reduced opacity.
 */
export function PageHeaderWithSubtitle() {
  return (
    <PageHeader
      title="User Settings"
      subtitle="Manage your account preferences and personal information"
    />
  );
}

/**
 * Example 3: PageHeader with Actions
 *
 * Add action buttons on the right side of the header.
 * Commonly used for primary page actions like create, save, or settings.
 */
export function PageHeaderWithActions() {
  return (
    <PageHeader
      title="Rental Objects"
      subtitle="Manage your available resources"
      actions={
        <>
          <Button variant="secondary">Export</Button>
          <Button>Create Rental Object</Button>
        </>
      }
    />
  );
}

/**
 * Example 4: PageHeader with Breadcrumb
 *
 * Include breadcrumb navigation to show page hierarchy.
 * Breadcrumbs help users understand their location in the app.
 */
export function PageHeaderWithBreadcrumb() {
  const breadcrumb = (
    <nav style={{ fontSize: '0.875rem' }}>
      <a href="/" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none' }}>
        Home
      </a>
      {' / '}
      <a href="/settings" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none' }}>
        Settings
      </a>
      {' / '}
      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Profile</span>
    </nav>
  );

  return (
    <PageHeader
      title="Edit Profile"
      subtitle="Update your personal information and avatar"
      breadcrumb={breadcrumb}
    />
  );
}

/**
 * Example 5: Bordered PageHeader
 *
 * Add a bottom border to visually separate the header from content.
 * Useful for pages with dense content or complex layouts.
 */
export function BorderedPageHeader() {
  return (
    <PageHeader
      title="Reports"
      subtitle="View analytics and generate custom reports"
      bordered
      actions={
        <Button>Generate Report</Button>
      }
    />
  );
}

/**
 * Example 6: Custom Heading Level
 *
 * Change the heading level to maintain proper document structure.
 * Use this when the PageHeader is not the main page heading.
 */
export function CustomHeadingLevel() {
  return (
    <PageHeader
      title="Section Title"
      subtitle="This is a subsection within a larger page"
      level={2}
    />
  );
}

/**
 * Example 7: Complete PageHeader
 *
 * A fully-featured example showing all available props.
 * This demonstrates a real-world usage scenario.
 */
export function CompletePageHeader() {
  const breadcrumb = (
    <nav style={{ fontSize: '0.875rem' }}>
      <a href="/" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none' }}>
        Dashboard
      </a>
      {' / '}
      <a href="/bookings" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none' }}>
        Bookings
      </a>
      {' / '}
      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Details</span>
    </nav>
  );

  return (
    <PageHeader
      title="Booking #12345"
      subtitle="View and manage booking details"
      breadcrumb={breadcrumb}
      bordered
      actions={
        <>
          <Button variant="secondary">Cancel Booking</Button>
          <Button variant="secondary">Edit</Button>
          <Button>Confirm</Button>
        </>
      }
    />
  );
}

/**
 * Example 8: PageHeader in Complete Page Layout
 *
 * Shows how to use PageHeader as part of a complete page structure.
 * The header provides consistent spacing and layout for the content below.
 */
export function PageHeaderInLayout() {
  return (
    <div>
      <PageHeader
        title="Organization Settings"
        subtitle="Configure your organization's preferences and integrations"
        bordered
        actions={
          <Button>Save Changes</Button>
        }
      />

      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        <Card style={{ marginBottom: 'var(--ds-spacing-6)' }}>
          <Paragraph style={{ fontWeight: 'bold', marginBottom: 'var(--ds-spacing-2)' }}>
            Organization Name
          </Paragraph>
          <Paragraph>Acme Corporation</Paragraph>
        </Card>

        <Card style={{ marginBottom: 'var(--ds-spacing-6)' }}>
          <Paragraph style={{ fontWeight: 'bold', marginBottom: 'var(--ds-spacing-2)' }}>
            Contact Email
          </Paragraph>
          <Paragraph>contact@acme.com</Paragraph>
        </Card>

        <Card>
          <Paragraph style={{ fontWeight: 'bold', marginBottom: 'var(--ds-spacing-2)' }}>
            Timezone
          </Paragraph>
          <Paragraph>Europe/Oslo (UTC+1)</Paragraph>
        </Card>
      </div>
    </div>
  );
}

/**
 * Example 9: Multiple Action Groups
 *
 * Organize multiple actions with proper spacing.
 * Use visual hierarchy to distinguish primary from secondary actions.
 */
export function PageHeaderWithActionGroups() {
  return (
    <PageHeader
      title="Document Editor"
      subtitle="Last saved 5 minutes ago"
      actions={
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button variant="tertiary" size="sm">Preview</Button>
            <Button variant="tertiary" size="sm">Share</Button>
          </div>
          <div style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'var(--ds-color-neutral-border-default)'
          }} />
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button variant="secondary">Save Draft</Button>
            <Button>Publish</Button>
          </div>
        </div>
      }
    />
  );
}

/**
 * Best Practices:
 *
 * 1. ✅ Use PageHeader at the top of your page content
 * 2. ✅ Provide clear, descriptive titles that identify the page purpose
 * 3. ✅ Use subtitles to add context without cluttering the title
 * 4. ✅ Place primary actions in the actions prop for consistent layout
 * 5. ✅ Use bordered prop when you need visual separation
 * 6. ✅ Include breadcrumbs for deep navigation hierarchies
 * 7. ✅ Maintain proper heading hierarchy with the level prop
 * 8. ❌ Don't put too many actions (max 3-4 buttons)
 * 9. ❌ Don't use very long titles (keep under 60 characters)
 * 10. ❌ Don't skip heading levels in your document structure
 *
 * Integration with other components:
 * - Use with ContentLayout for complete page structure
 * - Combine with ContentSection to organize page content
 * - Works well inside AppShell's main content area
 *
 * Accessibility:
 * - The title uses proper heading markup for screen readers
 * - Maintains semantic heading hierarchy with the level prop
 * - Actions are keyboard accessible when using Button components
 * - Breadcrumb should use nav element with proper link structure
 *
 * Layout considerations:
 * - PageHeader uses flexbox for responsive layout
 * - Actions automatically wrap on smaller screens
 * - Title area has flex: 1 to prevent truncation
 * - Built-in spacing works with design system tokens
 */
