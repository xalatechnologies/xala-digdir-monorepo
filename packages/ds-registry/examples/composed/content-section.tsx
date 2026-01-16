import React from 'react';
import { ContentSection, Card, Button, Input, Checkbox, Paragraph } from '@xala/ds';

/**
 * Example 1: Basic ContentSection
 *
 * The simplest way to use ContentSection - provide a title and children.
 * By default, it uses a fieldset wrapper and vertical spacing.
 */
export function BasicContentSection() {
  return (
    <ContentSection title="Account Settings">
      <Input label="Email address" type="email" />
      <Input label="Display name" type="text" />
      <Button>Save Changes</Button>
    </ContentSection>
  );
}

/**
 * Example 2: ContentSection with Subtitle
 *
 * Add a subtitle to provide additional context about the section.
 */
export function ContentSectionWithSubtitle() {
  return (
    <ContentSection
      title="Privacy Settings"
      subtitle="Control who can see your profile and activity"
    >
      <Checkbox>Make my profile public</Checkbox>
      <Checkbox>Show my activity feed</Checkbox>
      <Checkbox>Allow others to message me</Checkbox>
    </ContentSection>
  );
}

/**
 * Example 3: Custom Heading Level
 *
 * Change the heading level to fit your document structure.
 * Use level prop to maintain proper heading hierarchy.
 */
export function CustomHeadingLevel() {
  return (
    <ContentSection
      title="Notification Preferences"
      level={3}
    >
      <Checkbox>Email notifications</Checkbox>
      <Checkbox>SMS notifications</Checkbox>
      <Checkbox>Push notifications</Checkbox>
    </ContentSection>
  );
}

/**
 * Example 4: Horizontal Direction
 *
 * Use horizontal direction for side-by-side layouts.
 * Great for action buttons or inline controls.
 */
export function HorizontalContentSection() {
  return (
    <ContentSection
      title="Quick Actions"
      direction="horizontal"
      contentSpacing={12}
    >
      <Button>Save Draft</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="tertiary">Cancel</Button>
    </ContentSection>
  );
}

/**
 * Example 5: Custom Spacing
 *
 * Control the spacing below the section and between content items.
 */
export function CustomSpacing() {
  return (
    <ContentSection
      title="Form Section"
      spacing={48}
      contentSpacing={24}
    >
      <Input label="First Name" />
      <Input label="Last Name" />
      <Input label="Company" />
    </ContentSection>
  );
}

/**
 * Example 6: Without Fieldset
 *
 * Disable the fieldset wrapper for simpler DOM structure.
 * Useful when you don't need semantic grouping.
 */
export function WithoutFieldset() {
  return (
    <ContentSection
      title="Dashboard Overview"
      fieldset={false}
    >
      <Card>
        <Paragraph>Total Users: 1,234</Paragraph>
      </Card>
      <Card>
        <Paragraph>Active Sessions: 567</Paragraph>
      </Card>
    </ContentSection>
  );
}

/**
 * Example 7: Multiple Sections in a Form
 *
 * Compose multiple ContentSections to create well-organized forms
 * with logical groupings.
 */
export function MultipleContentSections() {
  return (
    <>
      <ContentSection
        title="Personal Information"
        subtitle="Your basic profile details"
      >
        <Input label="Full Name" type="text" />
        <Input label="Email" type="email" />
        <Input label="Phone" type="tel" />
      </ContentSection>

      <ContentSection
        title="Address"
        subtitle="Where should we send correspondence?"
      >
        <Input label="Street Address" type="text" />
        <Input label="City" type="text" />
        <Input label="Postal Code" type="text" />
      </ContentSection>

      <ContentSection
        title="Preferences"
        subtitle="Customize your experience"
      >
        <Checkbox>Receive marketing emails</Checkbox>
        <Checkbox>Enable two-factor authentication</Checkbox>
      </ContentSection>

      <ContentSection
        title="Actions"
        direction="horizontal"
        fieldset={false}
      >
        <Button>Save All Changes</Button>
        <Button variant="secondary">Reset Form</Button>
      </ContentSection>
    </>
  );
}

/**
 * Example 8: Nested Content Sections
 *
 * ContentSection can contain complex children including cards.
 * This is useful for dashboard-style layouts.
 */
export function NestedContentSection() {
  return (
    <ContentSection
      title="System Status"
      subtitle="Monitor your application health"
      spacing={40}
    >
      <Card>
        <ContentSection
          title="Database"
          level={4}
          fieldset={false}
          spacing={16}
        >
          <Paragraph>Status: Connected</Paragraph>
          <Paragraph>Latency: 12ms</Paragraph>
        </ContentSection>
      </Card>

      <Card>
        <ContentSection
          title="API Service"
          level={4}
          fieldset={false}
          spacing={16}
        >
          <Paragraph>Status: Online</Paragraph>
          <Paragraph>Uptime: 99.9%</Paragraph>
        </ContentSection>
      </Card>
    </ContentSection>
  );
}

/**
 * Best Practices:
 *
 * 1. ✅ Use ContentSection to group related form fields
 * 2. ✅ Provide clear, descriptive titles
 * 3. ✅ Use subtitles to add context when needed
 * 4. ✅ Maintain proper heading hierarchy with level prop
 * 5. ✅ Use horizontal direction for action buttons
 * 6. ✅ Set fieldset={false} for non-form content groupings
 * 7. ❌ Don't nest ContentSections too deeply (max 2 levels)
 * 8. ❌ Don't use ContentSection for single items
 * 9. ✅ Use consistent spacing values across sections
 * 10. ✅ Combine with ContentLayout for complete page structure
 *
 * Integration with ContentLayout:
 * ContentSection works best inside ContentLayout for page organization.
 * ContentLayout handles the page-level container, while ContentSection
 * manages logical groupings of related content within the page.
 *
 * Accessibility:
 * - The fieldset wrapper provides semantic grouping for screen readers
 * - Heading levels create a proper document outline
 * - Keep heading hierarchy sequential (don't skip levels)
 */
