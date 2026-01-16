# Composed Component Examples

This directory contains practical examples demonstrating how to use composed components from the Xala Design System.

## What are Composed Components?

Composed components are higher-level components built from Designsystemet primitives. They provide common UI patterns and layouts that combine multiple primitives into cohesive, reusable components.

**Key characteristics:**
- Built from primitive components (Button, Heading, Container, etc.)
- Implement common layout patterns
- Provide consistent spacing and structure
- Follow design system tokens and guidelines
- Handle responsive behavior out of the box

## Available Composed Components

The Xala Design System includes 27+ composed components across various categories:

### Layout Components
- **ContentLayout** - High-level page content layout with container, grid support, and header offset
- **ContentSection** - Section component for grouping related content with titles and fieldsets
- **PageHeader** - Consistent page header with title, subtitle, breadcrumb, and actions

### Navigation Components
- **Navigation** - Main navigation component
- **NavigationLink** - Navigation link component with active state

### Header Components
- **AppHeader** - Application header component
- **HeaderLogo** - Logo component for headers
- **HeaderSearch** - Search component for headers
- **HeaderActions** - Action buttons for headers

### UI Components
- **Drawer** - Slide-out panel component
- **FilterBar** - Filter controls for lists and tables

## Usage Examples

Examples will be added in the following subtasks:

### 1. ContentLayout (`content-layout.tsx`)
Demonstrates page layout with container, grid configuration, and header offset handling.

### 2. ContentSection (`content-section.tsx`)
Shows content grouping with titles, subtitles, and fieldset wrappers for forms.

### 3. PageHeader (`page-header.tsx`)
Complete page header example with breadcrumb navigation and action buttons.

## Best Practices

### 1. Import from @xala/ds
Always import composed components through the design system facade:

```typescript
// ✅ CORRECT
import { ContentLayout, ContentSection, PageHeader } from '@xala/ds';

// ❌ WRONG - Never import directly from @digdir/*
import { ContentLayout } from '@digdir/designsystemet-react';
```

### 2. Use with DesignsystemetProvider
Wrap your app with the provider for consistent theming:

```typescript
import { DesignsystemetProvider, ContentLayout } from '@xala/ds';

function App() {
  return (
    <DesignsystemetProvider theme="digdir" colorScheme="auto" size="md">
      <ContentLayout maxWidth="1440px" padding={32}>
        {/* Your content */}
      </ContentLayout>
    </DesignsystemetProvider>
  );
}
```

### 3. Leverage Design Tokens
Composed components use design tokens internally. Use consistent spacing:

```typescript
// ✅ CORRECT - Use component props that map to tokens
<ContentSection spacing={32} contentSpacing={16}>
  {/* Content */}
</ContentSection>

// ❌ WRONG - Don't use inline styles with hardcoded values
<div style={{ marginBottom: '32px' }}>
  {/* Content */}
</div>
```

### 4. Respect Component Hierarchy
Follow the component hierarchy for proper composition:

```typescript
// ✅ CORRECT - Proper nesting
<ContentLayout>
  <PageHeader title="Dashboard" />
  <ContentSection title="Statistics">
    {/* Content */}
  </ContentSection>
</ContentLayout>

// ❌ WRONG - Don't skip layout levels
<ContentSection>
  {/* Missing ContentLayout wrapper */}
</ContentSection>
```

## Common Patterns

### Page with Header and Content Sections

```typescript
import { ContentLayout, PageHeader, ContentSection } from '@xala/ds';

function DashboardPage() {
  return (
    <ContentLayout maxWidth="1440px" headerOffset="md">
      <PageHeader
        title="Dashboard"
        subtitle="View your system overview"
      />

      <ContentSection title="Statistics" spacing={32}>
        {/* Stats content */}
      </ContentSection>

      <ContentSection title="Recent Activity" spacing={32}>
        {/* Activity list */}
      </ContentSection>
    </ContentLayout>
  );
}
```

### Grid Layout with Multiple Sections

```typescript
import { ContentLayout, ContentSection } from '@xala/ds';

function GridPage() {
  return (
    <ContentLayout
      maxWidth="1440px"
      grid={{
        columns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24
      }}
    >
      <ContentSection title="Section 1">
        {/* Content */}
      </ContentSection>
      <ContentSection title="Section 2">
        {/* Content */}
      </ContentSection>
      <ContentSection title="Section 3">
        {/* Content */}
      </ContentSection>
    </ContentLayout>
  );
}
```

### Form with Fieldset Sections

```typescript
import { ContentSection, Button } from '@xala/ds';

function SettingsForm() {
  return (
    <form>
      <ContentSection
        title="Profile Information"
        fieldset={true}
        spacing={24}
      >
        {/* Form fields */}
      </ContentSection>

      <ContentSection
        title="Account Settings"
        fieldset={true}
        spacing={24}
      >
        {/* More form fields */}
      </ContentSection>

      <Button type="submit">Save Changes</Button>
    </form>
  );
}
```

## Accessibility Features

Composed components include built-in accessibility features:

- **Semantic HTML**: Proper use of landmarks (`<main>`, `<nav>`, `<header>`)
- **Heading Hierarchy**: Configurable heading levels for proper document structure
- **Fieldset Grouping**: Form sections use `<fieldset>` and `<legend>` for screen readers
- **ARIA Attributes**: Appropriate ARIA labels and roles where needed
- **Keyboard Navigation**: Full keyboard support for interactive elements

## Testing Your Implementation

When using composed components, verify:

1. **Visual Consistency**: Components render with proper spacing and alignment
2. **Responsive Behavior**: Layout adapts to different screen sizes
3. **Theme Switching**: Components respect theme changes
4. **Accessibility**: Test with screen readers and keyboard navigation
5. **TypeScript**: No type errors when using component props

## Related Documentation

- [Design System Primitives](../README.md#primitives) - Base components
- [Blocks Components](../blocks/README.md) - Business logic components
- [Shells Components](../shells/README.md) - Application-level layouts
- [Provider Usage](../provider-usage.tsx) - Theme and provider setup
- [Component Registry](../../registry.json) - Full component catalog

## Contributing Examples

When adding new composed component examples:

1. Follow the existing file naming convention: `component-name.tsx`
2. Include JSDoc comments explaining the example's purpose
3. Demonstrate key props and common use cases
4. Show both basic and advanced usage patterns
5. Include accessibility considerations
6. Add the example to `index.ts` and update this README
